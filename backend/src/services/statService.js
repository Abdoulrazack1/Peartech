// ============================================================
//  Service métier : statistiques et logs (tableau de bord admin).
//  Remplace les agrégations MongoDB par des requêtes SQL.
// ============================================================

const pool = require('../config/db');
const Log = require('../models/logModel');

// Chiffres clés du tableau de bord
async function dashboard() {
    const [[produits]]     = await pool.query('SELECT COUNT(*) AS n, COALESCE(SUM(stock),0) AS stock FROM produits');
    const [[commandes]]    = await pool.query('SELECT COUNT(*) AS n, COALESCE(SUM(total),0) AS ca FROM commandes');
    const [[utilisateurs]] = await pool.query("SELECT COUNT(*) AS n FROM utilisateurs WHERE role = 'client'");
    const [[messages]]     = await pool.query('SELECT COUNT(*) AS n FROM messages_contact');
    const [[avis]]         = await pool.query('SELECT COUNT(*) AS n FROM reviews');
    const [[stockBas]]     = await pool.query('SELECT COUNT(*) AS n FROM produits WHERE stock <= 5');

    return {
        nbProduits:       produits.n,
        stockTotal:       produits.stock,
        produitsStockBas: stockBas.n,
        nbCommandes:      commandes.n,
        chiffreAffaires:  Number(commandes.ca),
        nbClients:        utilisateurs.n,
        nbMessages:       messages.n,
        nbAvis:           avis.n,
        nbVisites:        await Log.nbVisitesTotal()
    };
}

// Statistiques détaillées (agrégations)
async function statistiques() {
    return {
        topProduits:        await Log.topProduits(5),
        chiffreAffaires:    await Log.chiffreAffairesParMois(),
        visitesParChemin:   await Log.visitesParChemin(10),
        nbVisitesTotal:     await Log.nbVisitesTotal()
    };
}

// Derniers logs applicatifs
async function logs(limite) {
    return Log.listerLogs(limite || 100);
}

module.exports = { dashboard, statistiques, logs };
