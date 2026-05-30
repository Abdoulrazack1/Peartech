// ============================================================
//  Accès aux données : messages du formulaire de contact.
// ============================================================

const pool = require('../config/db');

// Enregistre un message de contact
async function creer(m) {
    const [resultat] = await pool.query(
        `INSERT INTO messages_contact (nom, email, sujet, message) VALUES (?, ?, ?, ?)`,
        [m.nom, m.email, m.sujet, m.message]
    );
    return resultat.insertId;
}

// Liste tous les messages (réservé admin)
async function listerTous() {
    const [lignes] = await pool.query(
        'SELECT id, nom, email, sujet, message, cree_le AS creeLe FROM messages_contact ORDER BY cree_le DESC'
    );
    return lignes;
}

module.exports = { creer, listerTous };
