// ============================================================
//  Routes des favoris : /api/favoris/...  (connexion obligatoire)
// ============================================================

const express = require('express');
const { body } = require('express-validator');

const favori = require('../controllers/favoriController');
const { verifierToken } = require('../middlewares/auth');
const { valider } = require('../middlewares/erreur');
const a = require('../middlewares/asyncHandler');

const router = express.Router();

// Toutes les routes favoris nécessitent un token
router.use(verifierToken);

router.get('/', a(favori.lister));

router.post('/',
    [ body('produitId').isInt().withMessage('produitId doit être un entier.') ],
    valider,
    a(favori.ajouter)
);

router.delete('/:produitId', a(favori.retirer));

module.exports = router;
