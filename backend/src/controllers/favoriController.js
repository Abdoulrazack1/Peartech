// ============================================================
//  Logique métier : favoris (nécessite d'être connecté).
// ============================================================

const Favori = require('../models/favoriModel');
const Produit = require('../models/produitModel');

// GET /api/favoris
async function lister(req, res) {
    const favoris = await Favori.lister(req.utilisateur.id);
    res.json(favoris);
}

// POST /api/favoris  { produitId }
async function ajouter(req, res) {
    const { produitId } = req.body;

    // On vérifie que le produit existe avant de l'ajouter
    const produit = await Produit.trouverParId(produitId);
    if (!produit) {
        return res.status(404).json({ erreur: 'Produit introuvable.' });
    }

    await Favori.ajouter(req.utilisateur.id, produitId);
    res.status(201).json({ message: 'Produit ajouté aux favoris.' });
}

// DELETE /api/favoris/:produitId
async function retirer(req, res) {
    const ok = await Favori.retirer(req.utilisateur.id, req.params.produitId);
    if (!ok) {
        return res.status(404).json({ erreur: 'Ce produit n\'est pas dans vos favoris.' });
    }
    res.json({ message: 'Produit retiré des favoris.' });
}

module.exports = { lister, ajouter, retirer };
