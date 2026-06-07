// ============================================================
//  Routes de l'espace administrateur : /api/admin/...
//  Tout est protégé : token JWT valide + rôle "admin".
// ============================================================

const express = require('express');
const { body } = require('express-validator');

const admin = require('../controllers/adminController');
const { verifierToken, verifierAdmin } = require('../middlewares/auth');
const { valider } = require('../middlewares/erreur');
const a = require('../middlewares/asyncHandler');

const router = express.Router();

// Toutes les routes admin exigent un administrateur connecté
router.use(verifierToken, verifierAdmin);

// Tableau de bord et statistiques
router.get('/stats', a(admin.stats));             // chiffres clés
router.get('/statistics', a(admin.statistiques)); // agrégations (top produits, CA/mois…)
router.get('/logs', a(admin.logs));               // logs applicatifs

// Commandes
router.get('/commandes', a(admin.listerCommandes));
router.put('/commandes/:id',
    [ body('statut').notEmpty().withMessage('Statut obligatoire.') ],
    valider,
    a(admin.modifierStatutCommande)
);

// Utilisateurs
router.get('/utilisateurs', a(admin.listerUtilisateurs));
router.put('/utilisateurs/:id',
    [ body('email').optional().isEmail().withMessage('Email invalide.') ],
    valider,
    a(admin.modifierUtilisateur)
);
router.delete('/utilisateurs/:id', a(admin.supprimerUtilisateur));

// Messages de contact
router.get('/messages', a(admin.listerMessages));

module.exports = router;
