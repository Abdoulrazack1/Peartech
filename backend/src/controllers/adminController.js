// ============================================================
//  Contrôleur : espace administrateur.
//  Délègue à statService (stats/logs) et utilisateurService (comptes).
//  Toutes les routes sont protégées par verifierToken + verifierAdmin.
// ============================================================

const statService = require('../services/statService');
const utilisateurService = require('../services/utilisateurService');
const Commande = require('../models/commandeModel');
const Message = require('../models/messageModel');

// Liste blanche des statuts de commande autorisés (sert à valider la saisie admin).
const STATUTS = ['en attente', 'payée', 'expédiée', 'livrée', 'annulée'];

// GET /api/admin/stats  -> chiffres clés du tableau de bord
// Renvoie les indicateurs agrégés du site (nb produits, commandes, CA, clients, visites…).
async function stats(req, res) {
    res.json(await statService.dashboard());
}

// GET /api/admin/statistics  -> agrégations (top produits, CA/mois, visites)
// Renvoie les statistiques détaillées calculées par des requêtes GROUP BY.
async function statistiques(req, res) {
    res.json(await statService.statistiques());
}

// GET /api/admin/logs  -> derniers logs applicatifs
// Renvoie les dernières entrées de journal (paramètre optionnel ?limite=).
async function logs(req, res) {
    res.json(await statService.logs(req.query.limite));
}

// GET /api/admin/commandes  -> toutes les commandes
// Renvoie toutes les commandes du site (tous clients), avec le client et les articles.
async function listerCommandes(req, res) {
    res.json(await Commande.listerToutes());
}

// PUT /api/admin/commandes/:id  { statut }
// Change le statut d'une commande. Refuse un statut hors liste blanche (400)
// et renvoie 404 si la commande n'existe pas.
async function modifierStatutCommande(req, res) {
    const { statut } = req.body;
    if (!STATUTS.includes(statut)) throw { statut: 400, message: 'Statut invalide.' };
    const ok = await Commande.modifierStatut(req.params.id, statut);
    if (!ok) throw { statut: 404, message: 'Commande introuvable.' };
    res.json({ message: 'Statut mis à jour.' });
}

// GET /api/admin/utilisateurs
// Renvoie la liste de tous les utilisateurs (sans les mots de passe).
async function listerUtilisateurs(req, res) {
    res.json(await utilisateurService.lister());
}

// PUT /api/admin/utilisateurs/:id  { prenom, nom, email, role }
// Met à jour un utilisateur (le service valide notamment le rôle).
async function modifierUtilisateur(req, res) {
    await utilisateurService.modifier(req.params.id, req.body);
    res.json({ message: 'Utilisateur mis à jour.' });
}

// DELETE /api/admin/utilisateurs/:id
// Supprime un utilisateur (le service empêche l'admin de supprimer son propre compte).
async function supprimerUtilisateur(req, res) {
    await utilisateurService.supprimer(req.params.id, req.utilisateur.id);
    res.json({ message: 'Utilisateur supprimé.' });
}

// GET /api/admin/messages  -> messages de contact reçus
// Renvoie tous les messages envoyés via le formulaire de contact.
async function listerMessages(req, res) {
    res.json(await Message.listerTous());
}

module.exports = {
    stats, statistiques, logs,
    listerCommandes, modifierStatutCommande,
    listerUtilisateurs, modifierUtilisateur, supprimerUtilisateur,
    listerMessages
};
