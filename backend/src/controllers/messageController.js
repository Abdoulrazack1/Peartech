// ============================================================
//  Contrôleur : messages du formulaire de contact.
//  Envoi ouvert à tous ; consultation réservée à l'admin.
// ============================================================

const Message = require('../models/messageModel');

// POST /api/contact  (ouvert à tous)
// Enregistre un message de contact (nom, email, sujet, message) puis renvoie 201.
async function envoyer(req, res) {
    const { nom, email, sujet, message } = req.body;
    const id = await Message.creer({ nom, email, sujet, message });
    res.status(201).json({ message: 'Message envoyé. Nous vous répondrons rapidement.', id });
}

// GET /api/contact  (admin : consulter les messages reçus)
// Renvoie tous les messages de contact reçus, du plus récent au plus ancien.
async function lister(req, res) {
    const messages = await Message.listerTous();
    res.json(messages);
}

module.exports = { envoyer, lister };
