// ============================================================
//  Accès aux données : panier (tables cart + cart_items).
//  1 panier (cart) par utilisateur, contenant N lignes (cart_items).
// ============================================================

const pool = require('../config/db');

// Récupère l'id du panier de l'utilisateur, en le créant s'il n'existe pas.
async function getOrCreateCartId(utilisateurId) {
    const [lignes] = await pool.query('SELECT id FROM cart WHERE utilisateur_id = ?', [utilisateurId]);
    if (lignes[0]) return lignes[0].id;
    const [r] = await pool.query('INSERT INTO cart (utilisateur_id) VALUES (?)', [utilisateurId]);
    return r.insertId;
}

// Liste le contenu du panier avec les infos produit (jointures cart -> cart_items -> produits)
async function lister(utilisateurId) {
    const [lignes] = await pool.query(
        `SELECT ci.produit_id AS produitId, ci.quantite, ci.options,
                p.nom, p.slug, p.prix, p.images, p.stock, p.options AS produitOptions
         FROM cart c
         JOIN cart_items ci ON ci.cart_id = c.id
         JOIN produits p ON p.id = ci.produit_id
         WHERE c.utilisateur_id = ?
         ORDER BY ci.ajoute_le`,
        [utilisateurId]
    );
    return lignes;
}

// Ajoute un produit OU augmente la quantité s'il est déjà présent.
async function ajouter(utilisateurId, produitId, quantite, options) {
    const cartId = await getOrCreateCartId(utilisateurId);
    await pool.query(
        `INSERT INTO cart_items (cart_id, produit_id, quantite, options)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE quantite = quantite + VALUES(quantite), options = VALUES(options)`,
        [cartId, produitId, quantite, JSON.stringify(options || {})]
    );
}

// Définit la quantité exacte d'une ligne du panier
async function modifierQuantite(utilisateurId, produitId, quantite) {
    const [r] = await pool.query(
        `UPDATE cart_items ci
         JOIN cart c ON c.id = ci.cart_id
         SET ci.quantite = ?
         WHERE c.utilisateur_id = ? AND ci.produit_id = ?`,
        [quantite, utilisateurId, produitId]
    );
    return r.affectedRows > 0;
}

// Retire une ligne du panier
async function retirer(utilisateurId, produitId) {
    const [r] = await pool.query(
        `DELETE ci FROM cart_items ci
         JOIN cart c ON c.id = ci.cart_id
         WHERE c.utilisateur_id = ? AND ci.produit_id = ?`,
        [utilisateurId, produitId]
    );
    return r.affectedRows > 0;
}

// Vide complètement le panier de l'utilisateur
async function vider(utilisateurId) {
    await pool.query(
        `DELETE ci FROM cart_items ci
         JOIN cart c ON c.id = ci.cart_id
         WHERE c.utilisateur_id = ?`,
        [utilisateurId]
    );
}

module.exports = { lister, ajouter, modifierQuantite, retirer, vider };
