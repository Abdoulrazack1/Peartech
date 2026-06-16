// ============================================================
//  Contrôleur : panier (délègue à panierService). Connexion requise.
//  Chaque fonction lit l'utilisateur connecté (req.utilisateur.id),
//  appelle le service, puis renvoie la réponse JSON.
// ============================================================

const service = require('../services/panierService');

// GET /api/panier
// Renvoie le contenu du panier de l'utilisateur connecté
// (articles, prix unitaires recalculés et total).
async function lister(req, res) {
    res.json(await service.contenu(req.utilisateur.id));
}

// POST /api/panier  { produitId, quantite, options }
// Ajoute un produit au panier (ou cumule la quantité s'il y est déjà).
// Renvoie 201 après l'ajout.
async function ajouter(req, res) {
    await service.ajouter(req.utilisateur.id, req.body.produitId, req.body.quantite, req.body.options);
    res.status(201).json({ message: 'Produit ajouté au panier.' });
}

// PUT /api/panier/:produitId  { quantite }
// Définit la quantité exacte d'une ligne du panier.
async function modifierQuantite(req, res) {
    await service.modifierQuantite(req.utilisateur.id, req.params.produitId, req.body.quantite);
    res.json({ message: 'Quantité mise à jour.' });
}

// DELETE /api/panier/:produitId
// Retire une ligne précise (un produit) du panier.
async function retirer(req, res) {
    await service.retirer(req.utilisateur.id, req.params.produitId);
    res.json({ message: 'Produit retiré du panier.' });
}

// DELETE /api/panier
// Vide entièrement le panier de l'utilisateur connecté.
async function vider(req, res) {
    await service.vider(req.utilisateur.id);
    res.json({ message: 'Panier vidé.' });
}

module.exports = { lister, ajouter, modifierQuantite, retirer, vider };
