// ============================================================
//  Routes du formulaire de contact : /api/contact
//  - POST : ouvert à tous (envoyer un message)
//  - GET  : admin uniquement (consulter les messages)
// ============================================================

const express = require('express');
const { body } = require('express-validator');

const message = require('../controllers/messageController');
const { verifierToken, verifierAdmin } = require('../middlewares/auth');
const { valider } = require('../middlewares/erreur');
const a = require('../middlewares/asyncHandler');

const router = express.Router();

router.post('/',
    [
        body('nom').trim().notEmpty().withMessage('Le nom est obligatoire.'),
        body('email').isEmail().withMessage('Email invalide.').normalizeEmail(),
        body('sujet').trim().notEmpty().withMessage('Le sujet est obligatoire.'),
        body('message').trim().isLength({ min: 5 }).withMessage('Message trop court.')
    ],
    valider,
    a(message.envoyer)
);

router.get('/', verifierToken, verifierAdmin, a(message.lister));

module.exports = router;
