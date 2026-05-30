// ============================================================
//  Logique métier : commandes (nécessite d'être connecté).
//
//  Règle de sécurité importante : on ne fait JAMAIS confiance au prix
//  envoyé par le client. Le serveur recalcule lui-même chaque prix à
//  partir de la base de données.
// ============================================================

const Commande = require('../models/commandeModel');
const Produit = require('../models/produitModel');
const Panier = require('../models/panierModel');
const { prixUnitaire } = require('../utils/prix');

// Construit et valide les lignes d'une commande à partir d'une liste
// d'articles bruts (vérifie l'existence, le stock, recalcule les prix).
// Renvoie { total, articles } ou lève une erreur métier (objet { statut, message }).
async function preparerArticles(articles) {
    let total = 0;
    const articlesValides = [];

    for (const item of articles) {
        const produit = await Produit.trouverParId(item.produitId);
        if (!produit) {
            throw { statut: 400, message: `Produit ${item.produitId} introuvable.` };
        }

        const quantite = Math.max(1, parseInt(item.quantite) || 1);
        if (produit.stock < quantite) {
            throw { statut: 400, message: `Stock insuffisant pour "${produit.nom}".` };
        }

        const pu = prixUnitaire(produit, item.options || {});
        total += pu * quantite;

        articlesValides.push({
            produitId: produit.id,
            nom: produit.nom,
            prixUnitaire: pu,
            quantite,
            options: item.options || {}
        });
    }

    return { total: Math.round(total * 100) / 100, articles: articlesValides };
}

// POST /api/commandes
// body : { adresseLivraison, articles: [{ produitId, quantite, options }] }
async function creer(req, res) {
    const { adresseLivraison, articles } = req.body;

    if (!Array.isArray(articles) || articles.length === 0) {
        return res.status(400).json({ erreur: 'Le panier est vide.' });
    }

    let prepare;
    try {
        prepare = await preparerArticles(articles);
    } catch (e) {
        return res.status(e.statut || 400).json({ erreur: e.message });
    }

    const commandeId = await Commande.creer(
        req.utilisateur.id, prepare.total, adresseLivraison, prepare.articles
    );
    res.status(201).json({ message: 'Commande enregistrée.', commandeId, total: prepare.total });
}

// POST /api/commandes/depuis-panier
// Crée la commande à partir du panier serveur de l'utilisateur, puis le vide.
async function creerDepuisPanier(req, res) {
    const { adresseLivraison } = req.body;

    const lignesPanier = await Panier.lister(req.utilisateur.id);
    if (lignesPanier.length === 0) {
        return res.status(400).json({ erreur: 'Votre panier est vide.' });
    }

    // On transforme les lignes du panier en articles à valider
    const articles = lignesPanier.map(l => ({
        produitId: l.produitId,
        quantite: l.quantite,
        options: l.options
    }));

    let prepare;
    try {
        prepare = await preparerArticles(articles);
    } catch (e) {
        return res.status(e.statut || 400).json({ erreur: e.message });
    }

    const commandeId = await Commande.creer(
        req.utilisateur.id, prepare.total, adresseLivraison, prepare.articles
    );

    // Le panier est vidé une fois la commande passée
    await Panier.vider(req.utilisateur.id);

    res.status(201).json({ message: 'Commande enregistrée.', commandeId, total: prepare.total });
}

// GET /api/commandes  (mes commandes)
async function lister(req, res) {
    const commandes = await Commande.listerParUtilisateur(req.utilisateur.id);
    res.json(commandes);
}

// GET /api/commandes/:id
async function trouver(req, res) {
    const commande = await Commande.trouver(req.params.id, req.utilisateur.id);
    if (!commande) {
        return res.status(404).json({ erreur: 'Commande introuvable.' });
    }
    res.json(commande);
}

module.exports = { creer, creerDepuisPanier, lister, trouver };
