// ============================================================
//  Logique métier : produits.
//  Lecture ouverte à tous ; création/modification/suppression admin.
// ============================================================

const Produit = require('../models/produitModel');

// GET /api/produits?categorie=apple&recherche=ipad&nouveaute=1&bestseller=1
async function lister(req, res) {
    const filtres = {
        categorie: req.query.categorie,
        recherche: req.query.recherche,
        nouveaute: req.query.nouveaute === '1',
        bestseller: req.query.bestseller === '1'
    };
    const produits = await Produit.lister(filtres);
    res.json(produits);
}

// GET /api/produits/:id  (accepte un id numérique ou un slug)
async function trouver(req, res) {
    const cle = req.params.id;
    const produit = /^\d+$/.test(cle)
        ? await Produit.trouverParId(cle)
        : await Produit.trouverParSlug(cle);

    if (!produit) {
        return res.status(404).json({ erreur: 'Produit introuvable.' });
    }
    res.json(produit);
}

// POST /api/produits  (admin)
async function creer(req, res) {
    const id = await Produit.creer(req.body);
    const produit = await Produit.trouverParId(id);
    res.status(201).json({ message: 'Produit créé.', produit });
}

// PUT /api/produits/:id  (admin)
async function modifier(req, res) {
    const ok = await Produit.modifier(req.params.id, req.body);
    if (!ok) {
        return res.status(404).json({ erreur: 'Produit introuvable.' });
    }
    const produit = await Produit.trouverParId(req.params.id);
    res.json({ message: 'Produit mis à jour.', produit });
}

// DELETE /api/produits/:id  (admin)
async function supprimer(req, res) {
    const ok = await Produit.supprimer(req.params.id);
    if (!ok) {
        return res.status(404).json({ erreur: 'Produit introuvable.' });
    }
    res.json({ message: 'Produit supprimé.' });
}

module.exports = { lister, trouver, creer, modifier, supprimer };
