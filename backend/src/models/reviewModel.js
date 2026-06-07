// ============================================================
//  Accès aux données : avis clients (reviews).
// ============================================================

const pool = require('../config/db');

// Liste les avis d'un produit (avec le prénom de l'auteur)
async function listerParProduit(produitId) {
    const [lignes] = await pool.query(
        `SELECT r.id, r.note, r.commentaire, r.cree_le AS creeLe,
                u.prenom AS auteur, r.utilisateur_id AS utilisateurId
         FROM reviews r
         JOIN utilisateurs u ON u.id = r.utilisateur_id
         WHERE r.produit_id = ?
         ORDER BY r.cree_le DESC`,
        [produitId]
    );
    return lignes;
}

// Récupère un avis par son id (pour vérifier le propriétaire)
async function trouverParId(id) {
    const [lignes] = await pool.query('SELECT * FROM reviews WHERE id = ?', [id]);
    return lignes[0] || null;
}

// Crée un avis (1 seul par produit et par utilisateur grâce à la clé unique)
async function creer(utilisateurId, produitId, note, commentaire) {
    const [r] = await pool.query(
        `INSERT INTO reviews (utilisateur_id, produit_id, note, commentaire)
         VALUES (?, ?, ?, ?)`,
        [utilisateurId, produitId, note, commentaire || null]
    );
    return r.insertId;
}

// Modifie un avis (seulement celui de l'utilisateur)
async function modifier(id, utilisateurId, note, commentaire) {
    const [r] = await pool.query(
        `UPDATE reviews SET note = ?, commentaire = ?
         WHERE id = ? AND utilisateur_id = ?`,
        [note, commentaire || null, id, utilisateurId]
    );
    return r.affectedRows > 0;
}

// Supprime un avis (le sien)
async function supprimer(id, utilisateurId) {
    const [r] = await pool.query(
        'DELETE FROM reviews WHERE id = ? AND utilisateur_id = ?',
        [id, utilisateurId]
    );
    return r.affectedRows > 0;
}

// Recalcule la note moyenne et le nombre d'avis d'un produit,
// puis met à jour la table produits (colonnes note + nb_avis).
async function recalculerNoteProduit(produitId) {
    const [[stats]] = await pool.query(
        'SELECT COUNT(*) AS nb, COALESCE(AVG(note),0) AS moyenne FROM reviews WHERE produit_id = ?',
        [produitId]
    );
    await pool.query(
        'UPDATE produits SET note = ?, nb_avis = ? WHERE id = ?',
        [Number(stats.moyenne).toFixed(1), stats.nb, produitId]
    );
    return { moyenne: Number(stats.moyenne), nb: stats.nb };
}

module.exports = {
    listerParProduit, trouverParId, creer, modifier, supprimer, recalculerNoteProduit
};
