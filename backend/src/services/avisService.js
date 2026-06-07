// ============================================================
//  Service métier : avis clients (reviews).
//  Après chaque changement, on recalcule la note moyenne du produit.
// ============================================================

const Review = require('../models/reviewModel');
const Produit = require('../models/produitModel');

// Vérifie que la note est bien comprise entre 1 et 5
function verifierNote(note) {
    const n = parseInt(note);
    if (!n || n < 1 || n > 5) throw { statut: 400, message: 'La note doit être comprise entre 1 et 5.' };
    return n;
}

// Liste les avis d'un produit
async function listerParProduit(produitId) {
    return Review.listerParProduit(produitId);
}

// Ajoute un avis (1 seul par produit et par utilisateur)
async function creer(utilisateurId, { produitId, note, commentaire }) {
    const n = verifierNote(note);
    if (!(await Produit.trouverParId(produitId))) {
        throw { statut: 404, message: 'Produit introuvable.' };
    }
    let id;
    try {
        id = await Review.creer(utilisateurId, produitId, n, commentaire);
    } catch (e) {
        if (e.code === 'ER_DUP_ENTRY') {
            throw { statut: 409, message: 'Vous avez déjà laissé un avis sur ce produit.' };
        }
        throw e;
    }
    await Review.recalculerNoteProduit(produitId); // met à jour la moyenne
    return id;
}

// Modifie son propre avis
async function modifier(id, utilisateurId, { note, commentaire }) {
    const avis = await Review.trouverParId(id);
    if (!avis) throw { statut: 404, message: 'Avis introuvable.' };
    if (avis.utilisateur_id !== utilisateurId) throw { statut: 403, message: 'Cet avis ne vous appartient pas.' };
    const n = verifierNote(note);
    await Review.modifier(id, utilisateurId, n, commentaire);
    await Review.recalculerNoteProduit(avis.produit_id);
}

// Supprime son propre avis
async function supprimer(id, utilisateurId) {
    const avis = await Review.trouverParId(id);
    if (!avis) throw { statut: 404, message: 'Avis introuvable.' };
    if (avis.utilisateur_id !== utilisateurId) throw { statut: 403, message: 'Cet avis ne vous appartient pas.' };
    await Review.supprimer(id, utilisateurId);
    await Review.recalculerNoteProduit(avis.produit_id);
}

module.exports = { listerParProduit, creer, modifier, supprimer };
