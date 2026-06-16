// ============================================================
//  Contrôleur : catégories (lecture publique, délègue au modèle).
// ============================================================

const Categorie = require('../models/categorieModel');

// GET /api/categories
// Renvoie la liste de toutes les catégories (les rayons du catalogue).
async function lister(req, res) {
    const categories = await Categorie.listerToutes();
    res.json(categories);
}

// GET /api/categories/:slug
// Renvoie une catégorie par son slug ; répond 404 si elle est introuvable.
async function trouver(req, res) {
    const categorie = await Categorie.trouverParSlug(req.params.slug);
    if (!categorie) {
        return res.status(404).json({ erreur: 'Catégorie introuvable.' });
    }
    res.json(categorie);
}

module.exports = { lister, trouver };
