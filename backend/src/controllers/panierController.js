// ============================================================
//  Logique métier : panier (connexion obligatoire).
//  Les prix sont toujours calculés côté serveur.
// ============================================================

const Panier = require('../models/panierModel');
const Produit = require('../models/produitModel');
const { prixUnitaire } = require('../utils/prix');

// GET /api/panier  -> contenu du panier + prix calculés + total
async function lister(req, res) {
    const lignes = await Panier.lister(req.utilisateur.id);

    let total = 0;
    const articles = lignes.map(l => {
        // l.produitOptions = catalogue d'options du produit ; l.options = choix de l'utilisateur
        const pu = prixUnitaire({ prix: l.prix, options: l.produitOptions }, l.options);
        const sousTotal = pu * l.quantite;
        total += sousTotal;
        return {
            produitId: l.produitId,
            nom: l.nom,
            slug: l.slug,
            images: l.images,
            quantite: l.quantite,
            options: l.options,
            prixUnitaire: pu,
            sousTotal: Math.round(sousTotal * 100) / 100
        };
    });

    res.json({
        articles,
        nbArticles: articles.reduce((n, a) => n + a.quantite, 0),
        total: Math.round(total * 100) / 100
    });
}

// POST /api/panier  { produitId, quantite, options }
async function ajouter(req, res) {
    const { produitId, options } = req.body;
    const quantite = Math.max(1, parseInt(req.body.quantite) || 1);

    const produit = await Produit.trouverParId(produitId);
    if (!produit) {
        return res.status(404).json({ erreur: 'Produit introuvable.' });
    }
    if (produit.stock < quantite) {
        return res.status(400).json({ erreur: `Stock insuffisant pour "${produit.nom}".` });
    }

    await Panier.ajouter(req.utilisateur.id, produitId, quantite, options);
    res.status(201).json({ message: 'Produit ajouté au panier.' });
}

// PUT /api/panier/:produitId  { quantite }
async function modifierQuantite(req, res) {
    const quantite = parseInt(req.body.quantite);
    if (!quantite || quantite < 1) {
        return res.status(400).json({ erreur: 'Quantité invalide (minimum 1).' });
    }

    const produit = await Produit.trouverParId(req.params.produitId);
    if (produit && produit.stock < quantite) {
        return res.status(400).json({ erreur: `Stock insuffisant pour "${produit.nom}".` });
    }

    const ok = await Panier.modifierQuantite(req.utilisateur.id, req.params.produitId, quantite);
    if (!ok) {
        return res.status(404).json({ erreur: 'Ce produit n\'est pas dans votre panier.' });
    }
    res.json({ message: 'Quantité mise à jour.' });
}

// DELETE /api/panier/:produitId
async function retirer(req, res) {
    const ok = await Panier.retirer(req.utilisateur.id, req.params.produitId);
    if (!ok) {
        return res.status(404).json({ erreur: 'Ce produit n\'est pas dans votre panier.' });
    }
    res.json({ message: 'Produit retiré du panier.' });
}

// DELETE /api/panier
async function vider(req, res) {
    await Panier.vider(req.utilisateur.id);
    res.json({ message: 'Panier vidé.' });
}

module.exports = { lister, ajouter, modifierQuantite, retirer, vider };
