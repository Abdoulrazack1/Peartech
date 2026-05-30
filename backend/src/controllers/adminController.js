// ============================================================
//  Logique métier : espace administrateur.
//  Toutes ces routes sont protégées par verifierToken + verifierAdmin.
// ============================================================

const pool = require('../config/db');
const Commande = require('../models/commandeModel');
const Utilisateur = require('../models/utilisateurModel');
const Message = require('../models/messageModel');

// Statuts de commande autorisés (doivent correspondre à l'ENUM de la table)
const STATUTS = ['en cours', 'expédiée', 'livré', 'annulée'];

// GET /api/admin/stats  -> chiffres clés du tableau de bord
async function stats(req, res) {
    const [[produits]]     = await pool.query('SELECT COUNT(*) AS n, COALESCE(SUM(stock),0) AS stock FROM produits');
    const [[commandes]]    = await pool.query('SELECT COUNT(*) AS n, COALESCE(SUM(total),0) AS ca FROM commandes');
    const [[utilisateurs]] = await pool.query("SELECT COUNT(*) AS n FROM utilisateurs WHERE role = 'client'");
    const [[messages]]     = await pool.query('SELECT COUNT(*) AS n FROM messages_contact');
    const [[stockBas]]     = await pool.query('SELECT COUNT(*) AS n FROM produits WHERE stock <= 5');

    res.json({
        nbProduits:      produits.n,
        stockTotal:      produits.stock,
        produitsStockBas: stockBas.n,
        nbCommandes:     commandes.n,
        chiffreAffaires: Number(commandes.ca),
        nbClients:       utilisateurs.n,
        nbMessages:      messages.n
    });
}

// GET /api/admin/commandes  -> toutes les commandes
async function listerCommandes(req, res) {
    const commandes = await Commande.listerToutes();
    res.json(commandes);
}

// PUT /api/admin/commandes/:id  { statut }
async function modifierStatutCommande(req, res) {
    const { statut } = req.body;
    if (!STATUTS.includes(statut)) {
        return res.status(400).json({ erreur: 'Statut invalide.' });
    }
    const ok = await Commande.modifierStatut(req.params.id, statut);
    if (!ok) {
        return res.status(404).json({ erreur: 'Commande introuvable.' });
    }
    res.json({ message: 'Statut mis à jour.' });
}

// GET /api/admin/utilisateurs  -> liste des comptes
async function listerUtilisateurs(req, res) {
    const utilisateurs = await Utilisateur.listerTous();
    res.json(utilisateurs);
}

// GET /api/admin/messages  -> messages de contact reçus
async function listerMessages(req, res) {
    const messages = await Message.listerTous();
    res.json(messages);
}

module.exports = { stats, listerCommandes, modifierStatutCommande, listerUtilisateurs, listerMessages };
