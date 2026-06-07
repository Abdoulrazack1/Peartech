// ============================================================
//  Routes des commandes : /api/commandes/...  (connexion obligatoire)
// ============================================================

const express = require('express');
const { body } = require('express-validator');

const commande = require('../controllers/commandeController');
const { verifierToken } = require('../middlewares/auth');
const { valider } = require('../middlewares/erreur');
const a = require('../middlewares/asyncHandler');

const router = express.Router();

router.use(verifierToken);

router.get('/', a(commande.lister));
router.get('/:id', a(commande.trouver));

// Commander directement à partir du panier serveur (puis vide le panier)
router.post('/depuis-panier', a(commande.creerDepuisPanier));

// Commander à partir d'une liste d'articles envoyée par le client
router.post('/',
    [
        body('articles').isArray({ min: 1 }).withMessage('Le panier doit contenir au moins un article.'),
        body('articles.*.produitId').isInt().withMessage('produitId invalide.'),
        body('articles.*.quantite').optional().isInt({ min: 1 }).withMessage('Quantité invalide.')
    ],
    valider,
    a(commande.creer)
);

// Annuler une commande (remet les produits en stock)
router.put('/:id/cancel', a(commande.annuler));

module.exports = router;
