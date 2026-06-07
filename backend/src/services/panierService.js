// ============================================================
//  Service métier : panier.
//  Calcule les prix côté serveur et vérifie le stock.
// ============================================================

const Panier = require('../models/panierModel');
const Produit = require('../models/produitModel');
const { prixUnitaire } = require('../utils/prix');

// Contenu du panier + prix calculés + total
async function contenu(utilisateurId) {
    const lignes = await Panier.lister(utilisateurId);

    let total = 0;
    const articles = lignes.map(l => {
        // l.produitOptions = catalogue d'options ; l.options = choix de l'utilisateur
        const pu = prixUnitaire({ prix: l.prix, options: l.produitOptions }, l.options);
        const sousTotal = pu * l.quantite;
        total += sousTotal;
        return {
            produitId: l.produitId, nom: l.nom, slug: l.slug, images: l.images,
            quantite: l.quantite, options: l.options,
            prixUnitaire: pu, sousTotal: Math.round(sousTotal * 100) / 100
        };
    });

    return {
        articles,
        nbArticles: articles.reduce((n, a) => n + a.quantite, 0),
        total: Math.round(total * 100) / 100
    };
}

// Ajoute un produit (avec vérification d'existence et de stock)
async function ajouter(utilisateurId, produitId, quantiteBrute, options) {
    const quantite = Math.max(1, parseInt(quantiteBrute) || 1);
    const produit = await Produit.trouverParId(produitId);
    if (!produit) throw { statut: 404, message: 'Produit introuvable.' };
    if (produit.stock < quantite) throw { statut: 400, message: `Stock insuffisant pour "${produit.nom}".` };
    await Panier.ajouter(utilisateurId, produitId, quantite, options);
}

// Modifie la quantité d'une ligne
async function modifierQuantite(utilisateurId, produitId, quantiteBrute) {
    const quantite = parseInt(quantiteBrute);
    if (!quantite || quantite < 1) throw { statut: 400, message: 'Quantité invalide (minimum 1).' };
    const produit = await Produit.trouverParId(produitId);
    if (produit && produit.stock < quantite) {
        throw { statut: 400, message: `Stock insuffisant pour "${produit.nom}".` };
    }
    const ok = await Panier.modifierQuantite(utilisateurId, produitId, quantite);
    if (!ok) throw { statut: 404, message: 'Ce produit n\'est pas dans votre panier.' };
}

// Retire une ligne
async function retirer(utilisateurId, produitId) {
    const ok = await Panier.retirer(utilisateurId, produitId);
    if (!ok) throw { statut: 404, message: 'Ce produit n\'est pas dans votre panier.' };
}

// Vide le panier
async function vider(utilisateurId) { await Panier.vider(utilisateurId); }

module.exports = { contenu, ajouter, modifierQuantite, retirer, vider };
