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

router.get('/stats', a(admin.stats));

router.get('/commandes', a(admin.listerCommandes));
router.put('/commandes/:id',
    [ body('statut').notEmpty().withMessage('Statut obligatoire.') ],
    valider,
    a(admin.modifierStatutCommande)
);

router.get('/utilisateurs', a(admin.listerUtilisateurs));
router.get('/messages', a(admin.listerMessages));

module.exports = router;
