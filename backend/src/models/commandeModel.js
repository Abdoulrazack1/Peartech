// ============================================================
//  Accès aux données : commandes.
//  La création d'une commande utilise une TRANSACTION pour garantir
//  que tout réussit ensemble (commande + lignes + stock) ou rien.
// ============================================================

const pool = require('../config/db');

// Crée une commande complète à partir du panier.
// articles = [{ produitId, nom, prixUnitaire, quantite, options }]
async function creer(utilisateurId, total, adresseLivraison, articles) {
    const cnx = await pool.getConnection();
    try {
        await cnx.beginTransaction();

        // 1) Ligne principale de la commande
        const [cmd] = await cnx.query(
            `INSERT INTO commandes (utilisateur_id, total, adresse_livraison) VALUES (?, ?, ?)`,
            [utilisateurId, total, adresseLivraison || null]
        );
        const commandeId = cmd.insertId;

        // 2) Chaque article + mise à jour du stock
        for (const art of articles) {
            await cnx.query(
                `INSERT INTO commande_articles
                    (commande_id, produit_id, nom_produit, prix_unitaire, quantite, options)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [commandeId, art.produitId, art.nom, art.prixUnitaire, art.quantite,
                 JSON.stringify(art.options || {})]
            );

            // On décrémente le stock sans jamais passer en négatif
            await cnx.query(
                `UPDATE produits SET stock = GREATEST(stock - ?, 0) WHERE id = ?`,
                [art.quantite, art.produitId]
            );
        }

        await cnx.commit();
        return commandeId;
    } catch (e) {
        await cnx.rollback(); // en cas d'erreur, on annule tout
        throw e;
    } finally {
        cnx.release();
    }
}

// Liste les commandes d'un utilisateur (avec leurs articles)
async function listerParUtilisateur(utilisateurId) {
    const [commandes] = await pool.query(
        `SELECT id, total, statut, adresse_livraison AS adresseLivraison, cree_le AS creeLe
         FROM commandes WHERE utilisateur_id = ? ORDER BY cree_le DESC`,
        [utilisateurId]
    );

    // Pour chaque commande, on charge ses articles
    for (const cmd of commandes) {
        const [articles] = await pool.query(
            `SELECT produit_id AS produitId, nom_produit AS nom,
                    prix_unitaire AS prixUnitaire, quantite, options
             FROM commande_articles WHERE commande_id = ?`,
            [cmd.id]
        );
        cmd.articles = articles;
    }
    return commandes;
}

// Récupère une commande précise de l'utilisateur
async function trouver(id, utilisateurId) {
    const [lignes] = await pool.query(
        `SELECT id, total, statut, adresse_livraison AS adresseLivraison, cree_le AS creeLe
         FROM commandes WHERE id = ? AND utilisateur_id = ?`,
        [id, utilisateurId]
    );
    return lignes[0] || null;
}

// ── Fonctions ADMIN ───────────────────────────────────────────

// Liste TOUTES les commandes (tous clients) avec le nom du client + articles
async function listerToutes() {
    const [commandes] = await pool.query(
        `SELECT c.id, c.total, c.statut, c.adresse_livraison AS adresseLivraison, c.cree_le AS creeLe,
                u.email AS clientEmail, u.prenom AS clientPrenom, u.nom AS clientNom
         FROM commandes c
         JOIN utilisateurs u ON u.id = c.utilisateur_id
         ORDER BY c.cree_le DESC`
    );
    for (const cmd of commandes) {
        const [articles] = await pool.query(
            `SELECT nom_produit AS nom, prix_unitaire AS prixUnitaire, quantite
             FROM commande_articles WHERE commande_id = ?`,
            [cmd.id]
        );
        cmd.articles = articles;
    }
    return commandes;
}

// Change le statut d'une commande (admin)
async function modifierStatut(id, statut) {
    const [resultat] = await pool.query(
        'UPDATE commandes SET statut = ? WHERE id = ?',
        [statut, id]
    );
    return resultat.affectedRows > 0;
}

module.exports = { creer, listerParUtilisateur, trouver, listerToutes, modifierStatut };
