// ============================================================
//  Accès aux données : utilisateurs.
// ============================================================

const pool = require('../config/db');

// Recherche un utilisateur par email (sert à la connexion).
// On renvoie le mot de passe haché car le contrôleur en a besoin pour bcrypt.compare.
async function trouverParEmail(email) {
    const [lignes] = await pool.query(
        'SELECT id, prenom, nom, email, mot_de_passe, telephone, naissance, role FROM utilisateurs WHERE email = ?',
        [email]
    );
    return lignes[0] || null;
}

// Recherche un utilisateur par id (sans le mot de passe : données publiques du profil)
async function trouverParId(id) {
    const [lignes] = await pool.query(
        'SELECT id, prenom, nom, email, telephone, naissance, role, cree_le FROM utilisateurs WHERE id = ?',
        [id]
    );
    return lignes[0] || null;
}

// Crée un nouvel utilisateur (le mot de passe est déjà haché par le contrôleur)
async function creer(u) {
    const [resultat] = await pool.query(
        `INSERT INTO utilisateurs (prenom, nom, email, mot_de_passe, role)
         VALUES (?, ?, ?, ?, 'client')`,
        [u.prenom, u.nom, u.email, u.motDePasseHache]
    );
    return resultat.insertId;
}

// Met à jour les informations personnelles du profil
async function modifierProfil(id, u) {
    await pool.query(
        `UPDATE utilisateurs SET prenom = ?, nom = ?, telephone = ?, naissance = ? WHERE id = ?`,
        [u.prenom, u.nom, u.telephone || null, u.naissance || null, id]
    );
}

// Met à jour uniquement le mot de passe (déjà haché)
async function modifierMotDePasse(id, motDePasseHache) {
    await pool.query('UPDATE utilisateurs SET mot_de_passe = ? WHERE id = ?', [motDePasseHache, id]);
}

// Liste tous les utilisateurs (admin) — sans les mots de passe
async function listerTous() {
    const [lignes] = await pool.query(
        'SELECT id, prenom, nom, email, role, cree_le AS creeLe FROM utilisateurs ORDER BY cree_le DESC'
    );
    return lignes;
}

module.exports = { trouverParEmail, trouverParId, creer, modifierProfil, modifierMotDePasse, listerTous };
