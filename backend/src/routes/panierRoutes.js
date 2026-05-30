// ============================================================
//  Routes du panier : /api/panier/...  (connexion obligatoire)
// ============================================================

const express = require('express');
const { body } = require('express-validator');

const panier = require('../controllers/panierController');
const { verifierToken } = require('../middlewares/auth');
const { valider } = require('../middlewares/erreur');
const a = require('../middlewares/asyncHandler');

const router = express.Router();

router.use(verifierToken);

router.get('/', a(panier.lister));

router.post('/',
    [
        body('produitId').isInt().withMessage('produitId doit être un entier.'),
        body('quantite').optional().isInt({ min: 1 }).withMessage('Quantité invalide.')
    ],
    valider,
    a(panier.ajouter)
);

router.put('/:produitId',
    [ body('quantite').isInt({ min: 1 }).withMessage('Quantité invalide (minimum 1).') ],
    valider,
    a(panier.modifierQuantite)
);

router.delete('/:produitId', a(panier.retirer));
router.delete('/', a(panier.vider));

module.exports = router;
