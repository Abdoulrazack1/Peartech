// ============================================================
//  Service métier : commandes.
//
//  Règle de sécurité : le serveur recalcule TOUJOURS les prix à
//  partir de la base (on ne fait pas confiance au client).
//  Calcule aussi sous-total, TVA et frais de port, et envoie un
//  email de confirmation (simulé).
// ============================================================

const Commande = require('../models/commandeModel');
const Produit = require('../models/produitModel');
const Panier = require('../models/panierModel');
const Utilisateur = require('../models/utilisateurModel');
const { prixUnitaire } = require('../utils/prix');
const { TAUX_TVA, FRAIS_PORT, SEUIL_PORT_GRATUIT } = require('../utils/config');
const { envoyerConfirmationCommande } = require('../utils/email');

// Valide les articles (existence, stock) et recalcule les prix.
// Renvoie { sousTotal, articles }.
async function preparerArticles(articles) {
    let sousTotal = 0;
    const articlesValides = [];

    for (const item of articles) {
        const produit = await Produit.trouverParId(item.produitId);
        if (!produit) throw { statut: 400, message: `Produit ${item.produitId} introuvable.` };

        const quantite = Math.max(1, parseInt(item.quantite) || 1);
        if (produit.stock < quantite) {
            throw { statut: 400, message: `Stock insuffisant pour "${produit.nom}".` };
        }

        const pu = prixUnitaire(produit, item.options || {}); // prix recalculé serveur
        sousTotal += pu * quantite;

        articlesValides.push({
            produitId: produit.id, nom: produit.nom,
            prixUnitaire: pu, quantite, options: item.options || {}
        });
    }
    return { sousTotal: Math.round(sousTotal * 100) / 100, articles: articlesValides };
}

// Calcule TVA (incluse dans les prix TTC) et frais de port.
function calculerMontants(sousTotal) {
    const fraisPort = sousTotal >= SEUIL_PORT_GRATUIT ? 0 : FRAIS_PORT;            // port offert au-dessus du seuil
    const tva       = Math.round((sousTotal - sousTotal / (1 + TAUX_TVA)) * 100) / 100; // part de TVA contenue
    const total     = Math.round((sousTotal + fraisPort) * 100) / 100;
    return { sousTotal, tva, fraisPort, total };
}

// Crée une commande à partir d'une liste d'articles bruts
async function creerDepuisListe(utilisateurId, articles, adresseLivraison) {
    if (!Array.isArray(articles) || articles.length === 0) {
        throw { statut: 400, message: 'Le panier est vide.' };
    }
    const prep = await preparerArticles(articles);
    const montants = calculerMontants(prep.sousTotal);
    const commandeId = await Commande.creer(utilisateurId, montants, adresseLivraison, prep.articles);

    // Email de confirmation (simulé via Nodemailer)
    const u = await Utilisateur.trouverParId(utilisateurId);
    if (u) {
        await envoyerConfirmationCommande(u.email, { id: commandeId, ...montants, articles: prep.articles })
            .catch(e => console.warn('Email non envoyé :', e.message));
    }
    return { commandeId, ...montants };
}

// Crée une commande à partir du panier serveur, puis le vide
async function creerDepuisPanier(utilisateurId, adresseLivraison) {
    const lignes = await Panier.lister(utilisateurId);
    if (lignes.length === 0) throw { statut: 400, message: 'Votre panier est vide.' };

    const articles = lignes.map(l => ({ produitId: l.produitId, quantite: l.quantite, options: l.options }));
    const resultat = await creerDepuisListe(utilisateurId, articles, adresseLivraison);
    await Panier.vider(utilisateurId);
    return resultat;
}

// Annule une commande (remet en stock)
async function annuler(id, utilisateurId) {
    const r = await Commande.annuler(id, utilisateurId);
    if (!r.ok && r.raison === 'introuvable') throw { statut: 404, message: 'Commande introuvable.' };
    if (!r.ok && r.raison === 'non annulable') {
        throw { statut: 400, message: 'Cette commande ne peut plus être annulée (déjà expédiée ou livrée).' };
    }
}

async function listerDe(utilisateurId) { return Commande.listerParUtilisateur(utilisateurId); }
async function trouver(id, utilisateurId) { return Commande.trouver(id, utilisateurId); }

module.exports = { creerDepuisListe, creerDepuisPanier, annuler, listerDe, trouver };
