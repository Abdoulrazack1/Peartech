// ============================================================
//  Contrôleur : produits (délègue à produitService).
//  Lecture publique ; création/modification/suppression admin.
// ============================================================

const service = require('../services/produitService');

// GET /api/produits?categorie=&recherche=&marque=&prixMin=&prixMax=&tri=&page=&limit=
async function lister(req, res) {
    const r = await service.lister(req.query);
    // Réponse paginée si demandée, sinon simple tableau (rétro-compatible)
    if (r.paginated) return res.json({ data: r.data, total: r.total, page: r.page, limit: r.limit });
    res.json(r.data);
}

// GET /api/produits/marques  -> liste des marques (pour le filtre)
async function marques(req, res) {
    res.json(await service.marques());
}

// GET /api/produits/:id  (id numérique ou slug)
async function trouver(req, res) {
    const produit = await service.trouver(req.params.id);
    if (!produit) throw { statut: 404, message: 'Produit introuvable.' };
    res.json(produit);
}

// POST /api/produits  (admin)
async function creer(req, res) {
    const produit = await service.creer(req.body);
    res.status(201).json({ message: 'Produit créé.', produit });
}

// PUT /api/produits/:id  (admin)
async function modifier(req, res) {
    const produit = await service.modifier(req.params.id, req.body);
    if (!produit) throw { statut: 404, message: 'Produit introuvable.' };
    res.json({ message: 'Produit mis à jour.', produit });
}

// DELETE /api/produits/:id  (admin)
async function supprimer(req, res) {
    const ok = await service.supprimer(req.params.id);
    if (!ok) throw { statut: 404, message: 'Produit introuvable.' };
    res.json({ message: 'Produit supprimé.' });
}

module.exports = { lister, marques, trouver, creer, modifier, supprimer };
