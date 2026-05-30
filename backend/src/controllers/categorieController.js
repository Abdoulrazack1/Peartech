// ============================================================
//  Logique métier : catégories.
// ============================================================

const Categorie = require('../models/categorieModel');

// GET /api/categories
async function lister(req, res) {
    const categories = await Categorie.listerToutes();
    res.json(categories);
}

// GET /api/categories/:slug
async function trouver(req, res) {
    const categorie = await Categorie.trouverParSlug(req.params.slug);
    if (!categorie) {
        return res.status(404).json({ erreur: 'Catégorie introuvable.' });
    }
    res.json(categorie);
}

module.exports = { lister, trouver };
