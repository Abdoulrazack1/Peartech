// ============================================================
//  Service métier : produits.
//  Construit les filtres/tri/pagination à partir de la requête.
// ============================================================

const Produit = require('../models/produitModel');

// Liste les produits. Si "page" ou "limit" est fourni, renvoie une
// réponse paginée { data, total, page, limit } ; sinon un simple tableau.
async function lister(query) {
    const limit = query.limit ? parseInt(query.limit)
                : query.page  ? 12          // taille de page par défaut
                : null;
    const page   = query.page ? Math.max(1, parseInt(query.page)) : 1;
    const offset = limit ? (page - 1) * limit : 0;

    const filtres = {
        categorie:  query.categorie,
        recherche:  query.recherche,
        marque:     query.marque,
        prixMin:    query.prixMin,
        prixMax:    query.prixMax,
        nouveaute:  query.nouveaute === '1',
        bestseller: query.bestseller === '1',
        tri:        query.tri,
        limit, offset
    };

    const produits = await Produit.lister(filtres);

    if (query.page || query.limit) {              // mode paginé
        const total = await Produit.compter(filtres);
        return { paginated: true, data: produits, total, page, limit };
    }
    return { paginated: false, data: produits };  // mode simple (rétro-compatible)
}

// Détail par id (numérique) ou par slug
async function trouver(cle) {
    return /^\d+$/.test(cle) ? Produit.trouverParId(cle) : Produit.trouverParSlug(cle);
}

async function creer(donnees) {
    const id = await Produit.creer(donnees);
    return Produit.trouverParId(id);
}

async function modifier(id, donnees) {
    const ok = await Produit.modifier(id, donnees);
    return ok ? Produit.trouverParId(id) : null;
}

async function supprimer(id) { return Produit.supprimer(id); }
async function marques()     { return Produit.listerMarques(); }

module.exports = { lister, trouver, creer, modifier, supprimer, marques };
