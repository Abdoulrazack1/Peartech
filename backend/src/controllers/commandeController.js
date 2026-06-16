// ============================================================
//  Contrôleur : commandes (délègue à commandeService). Connexion requise.
//  Chaque fonction lit l'utilisateur connecté + le corps de la requête,
//  appelle le service, puis renvoie la réponse JSON.
// ============================================================

const service = require('../services/commandeService');

// POST /api/commandes  { adresseLivraison, articles:[{produitId,quantite,options}] }
// Crée une commande à partir d'une liste d'articles envoyée par le client.
// Le service recalcule les prix côté serveur ; renvoie 201 + le récapitulatif.
async function creer(req, res) {
    const r = await service.creerDepuisListe(req.utilisateur.id, req.body.articles, req.body.adresseLivraison);
    res.status(201).json({ message: 'Commande enregistrée.', ...r });
}

// POST /api/commandes/depuis-panier  { adresseLivraison }
// Crée une commande à partir du panier serveur, puis vide ce panier.
// Renvoie 201 + le récapitulatif (sous-total, TVA, frais de port, total).
async function creerDepuisPanier(req, res) {
    const r = await service.creerDepuisPanier(req.utilisateur.id, req.body.adresseLivraison);
    res.status(201).json({ message: 'Commande enregistrée.', ...r });
}

// GET /api/commandes  (mes commandes)
// Renvoie l'historique des commandes de l'utilisateur connecté (avec leurs articles).
async function lister(req, res) {
    res.json(await service.listerDe(req.utilisateur.id));
}

// GET /api/commandes/:id
// Renvoie le détail d'une commande de l'utilisateur connecté.
// Lève une erreur 404 si elle n'existe pas ou ne lui appartient pas.
async function trouver(req, res) {
    const commande = await service.trouver(req.params.id, req.utilisateur.id);
    if (!commande) throw { statut: 404, message: 'Commande introuvable.' };
    res.json(commande);
}

// PUT /api/commandes/:id/cancel  (annuler)
// Annule une commande de l'utilisateur (le service remet les produits en stock).
async function annuler(req, res) {
    await service.annuler(req.params.id, req.utilisateur.id);
    res.json({ message: 'Commande annulée.' });
}

module.exports = { creer, creerDepuisPanier, lister, trouver, annuler };
