// ============================================================
//  Contrôleur : commandes (délègue à commandeService). Connexion requise.
// ============================================================

const service = require('../services/commandeService');

// POST /api/commandes  { adresseLivraison, articles:[{produitId,quantite,options}] }
async function creer(req, res) {
    const r = await service.creerDepuisListe(req.utilisateur.id, req.body.articles, req.body.adresseLivraison);
    res.status(201).json({ message: 'Commande enregistrée.', ...r });
}

// POST /api/commandes/depuis-panier  { adresseLivraison }
async function creerDepuisPanier(req, res) {
    const r = await service.creerDepuisPanier(req.utilisateur.id, req.body.adresseLivraison);
    res.status(201).json({ message: 'Commande enregistrée.', ...r });
}

// GET /api/commandes  (mes commandes)
async function lister(req, res) {
    res.json(await service.listerDe(req.utilisateur.id));
}

// GET /api/commandes/:id
async function trouver(req, res) {
    const commande = await service.trouver(req.params.id, req.utilisateur.id);
    if (!commande) throw { statut: 404, message: 'Commande introuvable.' };
    res.json(commande);
}

// PUT /api/commandes/:id/cancel  (annuler)
async function annuler(req, res) {
    await service.annuler(req.params.id, req.utilisateur.id);
    res.json({ message: 'Commande annulée.' });
}

module.exports = { creer, creerDepuisPanier, lister, trouver, annuler };
