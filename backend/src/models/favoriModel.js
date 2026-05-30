// ============================================================
//  Accès aux données : favoris (produits enregistrés par un utilisateur).
// ============================================================

const pool = require('../config/db');

// Liste les produits favoris d'un utilisateur (jointure favoris <-> produits)
async function lister(utilisateurId) {
    const [lignes] = await pool.query(
        `SELECT p.id, p.nom, p.slug, p.prix, p.ancien_prix AS ancienPrix,
                p.images, p.note, f.ajoute_le AS ajouteLe
         FROM favoris f
         JOIN produits p ON p.id = f.produit_id
         WHERE f.utilisateur_id = ?
         ORDER BY f.ajoute_le DESC`,
        [utilisateurId]
    );
    return lignes;
}

// Ajoute un favori (INSERT IGNORE évite l'erreur si déjà présent grâce à la clé unique)
async function ajouter(utilisateurId, produitId) {
    await pool.query(
        'INSERT IGNORE INTO favoris (utilisateur_id, produit_id) VALUES (?, ?)',
        [utilisateurId, produitId]
    );
}

// Retire un favori
async function retirer(utilisateurId, produitId) {
    const [resultat] = await pool.query(
        'DELETE FROM favoris WHERE utilisateur_id = ? AND produit_id = ?',
        [utilisateurId, produitId]
    );
    return resultat.affectedRows > 0;
}

module.exports = { lister, ajouter, retirer };
