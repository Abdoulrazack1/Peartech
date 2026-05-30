// ============================================================
//  Routes d'authentification : /api/auth/...
// ============================================================

const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');

const auth = require('../controllers/authController');
const { verifierToken } = require('../middlewares/auth');
const { valider } = require('../middlewares/erreur');
const a = require('../middlewares/asyncHandler');

const router = express.Router();

// Limite les tentatives de connexion (protection contre la force brute) :
// max 10 essais par tranche de 15 minutes et par adresse IP.
const limiteurConnexion = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { erreur: 'Trop de tentatives. Réessayez dans quelques minutes.' }
});

// --- Inscription ---
router.post('/inscription',
    [
        body('prenom').trim().notEmpty().withMessage('Le prénom est obligatoire.'),
        body('nom').trim().notEmpty().withMessage('Le nom est obligatoire.'),
        body('email').isEmail().withMessage('Email invalide.').normalizeEmail(),
        body('motDePasse').isLength({ min: 6 }).withMessage('Mot de passe : 6 caractères minimum.')
    ],
    valider,
    a(auth.inscription)
);

// --- Connexion ---
router.post('/connexion',
    limiteurConnexion,
    [
        body('email').isEmail().withMessage('Email invalide.').normalizeEmail(),
        body('motDePasse').notEmpty().withMessage('Mot de passe obligatoire.')
    ],
    valider,
    a(auth.connexion)
);

// --- Profil (routes protégées par token) ---
router.get('/profil', verifierToken, a(auth.monProfil));

router.put('/profil',
    verifierToken,
    [
        body('prenom').trim().notEmpty().withMessage('Le prénom est obligatoire.'),
        body('nom').trim().notEmpty().withMessage('Le nom est obligatoire.')
    ],
    valider,
    a(auth.modifierProfil)
);

router.put('/mot-de-passe',
    verifierToken,
    [
        body('ancienMotDePasse').notEmpty().withMessage('Mot de passe actuel obligatoire.'),
        body('nouveauMotDePasse').isLength({ min: 6 }).withMessage('Nouveau mot de passe : 6 caractères minimum.')
    ],
    valider,
    a(auth.changerMotDePasse)
);

module.exports = router;
