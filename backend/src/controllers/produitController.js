// ============================================================
//  Contrôleur : produits (délègue à produitService).
//  Lecture publique ; création/modification/suppression admin.
//  Rôle de chaque fonction : lire la requête, appeler le service,
//  puis renvoyer la réponse JSON avec le bon code de statut.
// ============================================================

const service = require('../services/produitService');

// ------------------------------------------------------------
//  Rappel Express — chaque fonction reçoit deux objets (req, res) :
//    • req  = la requête du client. On y lit les données envoyées :
//        - req.params      : segments d'URL    (ex : /:id, /:slug)
//        - req.query       : paramètres après le "?" (ex : ?tri=prix)
//        - req.body        : corps JSON envoyé par le client
//        - req.utilisateur : { id, email, role } posé par verifierToken
//                            (présent uniquement sur les routes protégées)
//    • res  = la réponse à renvoyer au client :
//        - res.json(data)             : renvoie du JSON (statut 200 par défaut)
//        - res.status(code).json(...) : renvoie du JSON avec un code précis
//  (next n'est pas appelé ici : asyncHandler transmet automatiquement
//   les erreurs levées au middleware de gestion d'erreurs.)
// ------------------------------------------------------------

// GET /api/produits?categorie=&recherche=&marque=&prixMin=&prixMax=&tri=&page=&limit=
// Liste les produits selon les filtres/tri/pagination passés dans l'URL.
// Renvoie un simple tableau, ou un objet paginé { data, total, page, limit }
// si "page" ou "limit" est fourni.
async function lister(req, res) {
    const r = await service.lister(req.query);
    // Réponse paginée si demandée, sinon simple tableau (rétro-compatible)
    if (r.paginated) return res.json({ data: r.data, total: r.total, page: r.page, limit: r.limit });
    res.json(r.data);
}

// GET /api/produits/marques  -> liste des marques (pour le filtre)
// Renvoie la liste des marques distinctes, utilisée pour alimenter le filtre du catalogue.
async function marques(req, res) {
    res.json(await service.marques());
}

// GET /api/produits/:id  (id numérique ou slug)
// Récupère le détail d'un produit par son id ou son slug.
// Lève une erreur 404 (gérée par le middleware d'erreurs) s'il n'existe pas.
async function trouver(req, res) {
    const produit = await service.trouver(req.params.id);
    if (!produit) throw { statut: 404, message: 'Produit introuvable.' };
    res.json(produit);
}

// POST /api/produits  (admin)
// Crée un produit à partir du corps de la requête, puis renvoie 201 + le produit créé.
async function creer(req, res) {
    const produit = await service.creer(req.body);
    res.status(201).json({ message: 'Produit créé.', produit });
}

// PUT /api/produits/:id  (admin)
// Met à jour le produit ciblé avec le corps de la requête.
// Renvoie 404 s'il est introuvable, sinon le produit mis à jour.
async function modifier(req, res) {
    const produit = await service.modifier(req.params.id, req.body);
    if (!produit) throw { statut: 404, message: 'Produit introuvable.' };
    res.json({ message: 'Produit mis à jour.', produit });
}

// DELETE /api/produits/:id  (admin)
// Supprime le produit ciblé. Renvoie 404 s'il n'existe pas,
// sinon un message de confirmation.
async function supprimer(req, res) {
    const ok = await service.supprimer(req.params.id);
    if (!ok) throw { statut: 404, message: 'Produit introuvable.' };
    res.json({ message: 'Produit supprimé.' });
}

module.exports = { lister, marques, trouver, creer, modifier, supprimer };
