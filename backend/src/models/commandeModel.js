// ============================================================
//  Accès aux données : commandes.
//  La création et l'annulation utilisent une TRANSACTION pour
//  garantir la cohérence (commande + lignes + stock).
// ============================================================

const pool = require('../config/db');

// Colonnes renvoyées pour une commande
const COLONNES = `id, sous_total AS sousTotal, tva, frais_port AS fraisPort, total,
                  statut, adresse_livraison AS adresseLivraison, cree_le AS creeLe`;

// Crée une commande complète (transaction).
// montants = { sousTotal, tva, fraisPort, total }
// articles = [{ produitId, nom, prixUnitaire, quantite, options }]
async function creer(utilisateurId, montants, adresseLivraison, articles) {
    const cnx = await pool.getConnection();
    try {
        await cnx.beginTransaction();

        // 1) Ligne principale de la commande
        const [cmd] = await cnx.query(
            `INSERT INTO commandes (utilisateur_id, sous_total, tva, frais_port, total, adresse_livraison)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [utilisateurId, montants.sousTotal, montants.tva, montants.fraisPort, montants.total,
             adresseLivraison || null]
        );
        const commandeId = cmd.insertId;

        // 2) Chaque article + décrément du stock
        for (const art of articles) {
            await cnx.query(
                `INSERT INTO commande_articles
                    (commande_id, produit_id, nom_produit, prix_unitaire, quantite, options)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [commandeId, art.produitId, art.nom, art.prixUnitaire, art.quantite,
                 JSON.stringify(art.options || {})]
            );
            await cnx.query(
                'UPDATE produits SET stock = GREATEST(stock - ?, 0) WHERE id = ?',
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

// Charge les articles d'une commande
async function articlesDe(commandeId) {
    const [articles] = await pool.query(
        `SELECT produit_id AS produitId, nom_produit AS nom,
                prix_unitaire AS prixUnitaire, quantite, options
         FROM commande_articles WHERE commande_id = ?`,
        [commandeId]
    );
    return articles;
}

// Liste les commandes d'un utilisateur (avec leurs articles)
async function listerParUtilisateur(utilisateurId) {
    const [commandes] = await pool.query(
        `SELECT ${COLONNES} FROM commandes WHERE utilisateur_id = ? ORDER BY cree_le DESC`,
        [utilisateurId]
    );
    for (const cmd of commandes) cmd.articles = await articlesDe(cmd.id);
    return commandes;
}

// Récupère une commande précise de l'utilisateur (avec ses articles)
async function trouver(id, utilisateurId) {
    const [lignes] = await pool.query(
        `SELECT ${COLONNES} FROM commandes WHERE id = ? AND utilisateur_id = ?`,
        [id, utilisateurId]
    );
    if (!lignes[0]) return null;
    lignes[0].articles = await articlesDe(id);
    return lignes[0];
}

// Annule une commande de l'utilisateur et remet les produits en stock (transaction).
// Renvoie { ok, raison }.
async function annuler(id, utilisateurId) {
    const cnx = await pool.getConnection();
    try {
        await cnx.beginTransaction();

        // Verrouille la ligne le temps de la transaction
        const [lignes] = await cnx.query(
            'SELECT statut FROM commandes WHERE id = ? AND utilisateur_id = ? FOR UPDATE',
            [id, utilisateurId]
        );
        if (!lignes[0]) { await cnx.rollback(); return { ok: false, raison: 'introuvable' }; }

        // On n'annule pas une commande déjà expédiée / livrée / annulée
        if (['expédiée', 'livrée', 'annulée'].includes(lignes[0].statut)) {
            await cnx.rollback();
            return { ok: false, raison: 'non annulable' };
        }

        await cnx.query("UPDATE commandes SET statut = 'annulée' WHERE id = ?", [id]);

        // Remise en stock des produits de la commande
        const [articles] = await cnx.query(
            'SELECT produit_id, quantite FROM commande_articles WHERE commande_id = ?', [id]
        );
        for (const art of articles) {
            if (art.produit_id) {
                await cnx.query('UPDATE produits SET stock = stock + ? WHERE id = ?',
                    [art.quantite, art.produit_id]);
            }
        }

        await cnx.commit();
        return { ok: true };
    } catch (e) {
        await cnx.rollback();
        throw e;
    } finally {
        cnx.release();
    }
}

// ── Fonctions ADMIN ───────────────────────────────────────────

// Liste TOUTES les commandes (tous clients) avec le client + articles
async function listerToutes() {
    const [commandes] = await pool.query(
        `SELECT c.id, c.sous_total AS sousTotal, c.tva, c.frais_port AS fraisPort, c.total,
                c.statut, c.adresse_livraison AS adresseLivraison, c.cree_le AS creeLe,
                u.email AS clientEmail, u.prenom AS clientPrenom, u.nom AS clientNom
         FROM commandes c
         JOIN utilisateurs u ON u.id = c.utilisateur_id
         ORDER BY c.cree_le DESC`
    );
    for (const cmd of commandes) cmd.articles = await articlesDe(cmd.id);
    return commandes;
}

// Change le statut d'une commande (admin)
async function modifierStatut(id, statut) {
    const [r] = await pool.query('UPDATE commandes SET statut = ? WHERE id = ?', [statut, id]);
    return r.affectedRows > 0;
}

module.exports = {
    creer, listerParUtilisateur, trouver, annuler, listerToutes, modifierStatut
};
