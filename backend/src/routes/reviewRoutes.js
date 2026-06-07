// ============================================================
//  Routes des avis : /api/reviews/...  (connexion obligatoire)
//  La consultation des avis d'un produit se fait via
//  GET /api/produits/:id/avis (route publique, voir produitRoutes).
// ============================================================

const express = require('express');
const { body } = require('express-validator');

const review = require('../controllers/reviewController');
const { verifierToken } = require('../middlewares/auth');
const { valider } = require('../middlewares/erreur');
const a = require('../middlewares/asyncHandler');

const router = express.Router();

router.use(verifierToken); // il faut être connecté pour écrire un avis

router.post('/',
    [
        body('produitId').isInt().withMessage('produitId invalide.'),
        body('note').isInt({ min: 1, max: 5 }).withMessage('La note doit être entre 1 et 5.')
    ],
    valider,
    a(review.creer)
);

router.put('/:id',
    [ body('note').isInt({ min: 1, max: 5 }).withMessage('La note doit être entre 1 et 5.') ],
    valider,
    a(review.modifier)
);

router.delete('/:id', a(review.supprimer));

module.exports = router;
