// ============================================================
//  Contrôleur : panier (délègue à panierService). Connexion requise.
// ============================================================

const service = require('../services/panierService');

// GET /api/panier
async function lister(req, res) {
    res.json(await service.contenu(req.utilisateur.id));
}

// POST /api/panier  { produitId, quantite, options }
async function ajouter(req, res) {
    await service.ajouter(req.utilisateur.id, req.body.produitId, req.body.quantite, req.body.options);
    res.status(201).json({ message: 'Produit ajouté au panier.' });
}

// PUT /api/panier/:produitId  { quantite }
async function modifierQuantite(req, res) {
    await service.modifierQuantite(req.utilisateur.id, req.params.produitId, req.body.quantite);
    res.json({ message: 'Quantité mise à jour.' });
}

// DELETE /api/panier/:produitId
async function retirer(req, res) {
    await service.retirer(req.utilisateur.id, req.params.produitId);
    res.json({ message: 'Produit retiré du panier.' });
}

// DELETE /api/panier
async function vider(req, res) {
    await service.vider(req.utilisateur.id);
    res.json({ message: 'Panier vidé.' });
}

module.exports = { lister, ajouter, modifierQuantite, retirer, vider };
