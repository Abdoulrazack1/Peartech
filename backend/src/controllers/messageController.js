// ============================================================
//  Logique métier : messages de contact.
// ============================================================

const Message = require('../models/messageModel');

// POST /api/contact  (ouvert à tous)
async function envoyer(req, res) {
    const { nom, email, sujet, message } = req.body;
    const id = await Message.creer({ nom, email, sujet, message });
    res.status(201).json({ message: 'Message envoyé. Nous vous répondrons rapidement.', id });
}

// GET /api/contact  (admin : consulter les messages reçus)
async function lister(req, res) {
    const messages = await Message.listerTous();
    res.json(messages);
}

module.exports = { envoyer, lister };
