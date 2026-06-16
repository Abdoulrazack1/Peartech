// ============================================================
//  Contrôleur : avis clients (délègue à avisService).
//  Lecture publique ; écriture réservée aux utilisateurs connectés.
//  Chaque fonction lit la requête, appelle le service, renvoie la réponse.
// ============================================================

const service = require('../services/avisService');

// GET /api/produits/:produitId/avis  (public) — avis d'un produit
// Renvoie la liste des avis publiés pour le produit ciblé.
async function listerParProduit(req, res) {
    res.json(await service.listerParProduit(req.params.produitId));
}

// POST /api/reviews  { produitId, note, commentaire }  (connecté)
// Crée un avis de l'utilisateur connecté sur un produit, puis renvoie 201 + l'id créé.
async function creer(req, res) {
    const id = await service.creer(req.utilisateur.id, req.body);
    res.status(201).json({ message: 'Avis ajouté.', id });
}

// PUT /api/reviews/:id  { note, commentaire }  (connecté, le sien)
// Modifie l'avis ciblé (le service vérifie qu'il appartient bien à l'utilisateur).
async function modifier(req, res) {
    await service.modifier(req.params.id, req.utilisateur.id, req.body);
    res.json({ message: 'Avis modifié.' });
}

// DELETE /api/reviews/:id  (connecté, le sien)
// Supprime l'avis ciblé (le service vérifie qu'il appartient bien à l'utilisateur).
async function supprimer(req, res) {
    await service.supprimer(req.params.id, req.utilisateur.id);
    res.json({ message: 'Avis supprimé.' });
}

module.exports = { listerParProduit, creer, modifier, supprimer };
