// ============================================================
//  Accès aux données : panier.
//  1 ligne = 1 produit dans le panier d'un utilisateur.
// ============================================================

const pool = require('../config/db');

// Liste le contenu du panier avec les infos produit (jointure)
async function lister(utilisateurId) {
    const [lignes] = await pool.query(
        `SELECT pa.produit_id AS produitId, pa.quantite, pa.options,
                p.nom, p.slug, p.prix, p.images, p.stock, p.options AS produitOptions
         FROM panier pa
         JOIN produits p ON p.id = pa.produit_id
         WHERE pa.utilisateur_id = ?
         ORDER BY pa.ajoute_le`,
        [utilisateurId]
    );
    return lignes;
}

// Ajoute un produit OU augmente la quantité s'il est déjà présent.
// (grâce à la clé unique utilisateur+produit + ON DUPLICATE KEY)
async function ajouter(utilisateurId, produitId, quantite, options) {
    await pool.query(
        `INSERT INTO panier (utilisateur_id, produit_id, quantite, options)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE quantite = quantite + VALUES(quantite), options = VALUES(options)`,
        [utilisateurId, produitId, quantite, JSON.stringify(options || {})]
    );
}

// Définit la quantité exacte d'une ligne du panier
async function modifierQuantite(utilisateurId, produitId, quantite) {
    const [resultat] = await pool.query(
        `UPDATE panier SET quantite = ? WHERE utilisateur_id = ? AND produit_id = ?`,
        [quantite, utilisateurId, produitId]
    );
    return resultat.affectedRows > 0;
}

// Retire une ligne du panier
async function retirer(utilisateurId, produitId) {
    const [resultat] = await pool.query(
        `DELETE FROM panier WHERE utilisateur_id = ? AND produit_id = ?`,
        [utilisateurId, produitId]
    );
    return resultat.affectedRows > 0;
}

// Vide complètement le panier
async function vider(utilisateurId) {
    await pool.query('DELETE FROM panier WHERE utilisateur_id = ?', [utilisateurId]);
}

module.exports = { lister, ajouter, modifierQuantite, retirer, vider };
