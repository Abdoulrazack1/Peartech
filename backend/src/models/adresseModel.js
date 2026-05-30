// ============================================================
//  Accès aux données : adresses de livraison.
//  Chaque adresse appartient à un utilisateur (utilisateur_id).
// ============================================================

const pool = require('../config/db');

// Liste les adresses d'un utilisateur
async function lister(utilisateurId) {
    const [lignes] = await pool.query(
        `SELECT id, nom, rue, complement, code_postal AS codePostal, ville, pays, principale
         FROM adresses WHERE utilisateur_id = ? ORDER BY principale DESC, id`,
        [utilisateurId]
    );
    return lignes;
}

// Récupère une adresse précise appartenant à l'utilisateur
async function trouver(id, utilisateurId) {
    const [lignes] = await pool.query(
        `SELECT id, nom, rue, complement, code_postal AS codePostal, ville, pays, principale
         FROM adresses WHERE id = ? AND utilisateur_id = ?`,
        [id, utilisateurId]
    );
    return lignes[0] || null;
}

// Ajoute une adresse
async function creer(utilisateurId, a) {
    const [resultat] = await pool.query(
        `INSERT INTO adresses (utilisateur_id, nom, rue, complement, code_postal, ville, pays, principale)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [utilisateurId, a.nom, a.rue, a.complement || null, a.codePostal, a.ville, a.pays || 'France', !!a.principale]
    );
    return resultat.insertId;
}

// Modifie une adresse existante de l'utilisateur
async function modifier(id, utilisateurId, a) {
    const [resultat] = await pool.query(
        `UPDATE adresses SET nom = ?, rue = ?, complement = ?, code_postal = ?, ville = ?, pays = ?, principale = ?
         WHERE id = ? AND utilisateur_id = ?`,
        [a.nom, a.rue, a.complement || null, a.codePostal, a.ville, a.pays || 'France', !!a.principale, id, utilisateurId]
    );
    return resultat.affectedRows > 0;
}

// Supprime une adresse de l'utilisateur
async function supprimer(id, utilisateurId) {
    const [resultat] = await pool.query(
        'DELETE FROM adresses WHERE id = ? AND utilisateur_id = ?',
        [id, utilisateurId]
    );
    return resultat.affectedRows > 0;
}

// Retire le statut "principale" de toutes les adresses de l'utilisateur
async function reinitialiserPrincipale(utilisateurId) {
    await pool.query('UPDATE adresses SET principale = FALSE WHERE utilisateur_id = ?', [utilisateurId]);
}

module.exports = { lister, trouver, creer, modifier, supprimer, reinitialiserPrincipale };
