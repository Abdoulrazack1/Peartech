// ============================================================
//  Routes des produits : /api/produits/...
//  Lecture publique ; écriture réservée aux administrateurs.
// ============================================================

const express = require('express');
const { body } = require('express-validator');

const produit = require('../controllers/produitController');
const avisService = require('../services/avisService');
const { verifierToken, verifierAdmin } = require('../middlewares/auth');
const { valider } = require('../middlewares/erreur');
const a = require('../middlewares/asyncHandler');

const router = express.Router();

// Règles de validation communes (création / modification)
const reglesProduit = [
    body('nom').trim().notEmpty().withMessage('Le nom est obligatoire.'),
    body('slug').trim().notEmpty().withMessage('Le slug est obligatoire.'),
    body('categorieId').trim().notEmpty().withMessage('La catégorie est obligatoire.'),
    body('prix').isFloat({ min: 0 }).withMessage('Le prix doit être un nombre positif.'),
    body('stock').optional().isInt({ min: 0 }).withMessage('Le stock doit être un entier positif.')
];

// --- Lecture (public) ---
router.get('/', a(produit.lister));               // liste (filtres, tri, pagination)
router.get('/marques', a(produit.marques));       // liste des marques (avant /:id !)
router.get('/:id', a(produit.trouver));           // détail par id ou slug
router.get('/:id/avis', a(async (req, res) =>     // avis publics d'un produit
    res.json(await avisService.listerParProduit(req.params.id))
));

// --- Écriture (admin uniquement) ---
router.post('/', verifierToken, verifierAdmin, reglesProduit, valider, a(produit.creer));
router.put('/:id', verifierToken, verifierAdmin, reglesProduit, valider, a(produit.modifier));
router.delete('/:id', verifierToken, verifierAdmin, a(produit.supprimer));

module.exports = router;
