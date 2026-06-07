// ============================================================
//  Contrôleur : avis clients (délègue à avisService).
//  Lecture publique ; écriture réservée aux utilisateurs connectés.
// ============================================================

const service = require('../services/avisService');

// GET /api/produits/:produitId/avis  (public) — avis d'un produit
async function listerParProduit(req, res) {
    res.json(await service.listerParProduit(req.params.produitId));
}

// POST /api/reviews  { produitId, note, commentaire }  (connecté)
async function creer(req, res) {
    const id = await service.creer(req.utilisateur.id, req.body);
    res.status(201).json({ message: 'Avis ajouté.', id });
}

// PUT /api/reviews/:id  { note, commentaire }  (connecté, le sien)
async function modifier(req, res) {
    await service.modifier(req.params.id, req.utilisateur.id, req.body);
    res.json({ message: 'Avis modifié.' });
}

// DELETE /api/reviews/:id  (connecté, le sien)
async function supprimer(req, res) {
    await service.supprimer(req.params.id, req.utilisateur.id);
    res.json({ message: 'Avis supprimé.' });
}

module.exports = { listerParProduit, creer, modifier, supprimer };
