// ============================================================
//  Accès aux données : logs applicatifs et statistiques.
//  (Équivalent MySQL des collections MongoDB "logs" et "statistics".)
// ============================================================

const pool = require('../config/db');

// --- LOGS -------------------------------------------------------

// Enregistre une entrée de log
async function ajouterLog(log) {
    await pool.query(
        `INSERT INTO logs (niveau, message, methode, route, statut, utilisateur_id, ip)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [log.niveau || 'info', log.message, log.methode || null, log.route || null,
         log.statut || null, log.utilisateurId || null, log.ip || null]
    );
}

// Liste les derniers logs (admin)
async function listerLogs(limite = 100) {
    const [lignes] = await pool.query(
        `SELECT id, niveau, message, methode, route, statut, utilisateur_id AS utilisateurId, ip, cree_le AS creeLe
         FROM logs ORDER BY cree_le DESC LIMIT ?`,
        [limite]
    );
    return lignes;
}

// --- STATISTIQUES DE VISITES -----------------------------------

// Enregistre une visite (1 appel = 1 ligne)
async function ajouterVisite(v) {
    await pool.query(
        `INSERT INTO statistiques (chemin, methode, utilisateur_id, ip, user_agent)
         VALUES (?, ?, ?, ?, ?)`,
        [v.chemin, v.methode || null, v.utilisateurId || null, v.ip || null, v.userAgent || null]
    );
}

// --- AGRÉGATIONS (tableau de bord) -----------------------------

// Top des produits les plus commandés (somme des quantités vendues)
async function topProduits(limite = 5) {
    const [lignes] = await pool.query(
        `SELECT ca.produit_id AS produitId, ca.nom_produit AS nom,
                SUM(ca.quantite) AS quantiteVendue,
                SUM(ca.quantite * ca.prix_unitaire) AS chiffreAffaires
         FROM commande_articles ca
         GROUP BY ca.produit_id, ca.nom_produit
         ORDER BY quantiteVendue DESC
         LIMIT ?`,
        [limite]
    );
    return lignes;
}

// Chiffre d'affaires par mois (12 derniers mois)
async function chiffreAffairesParMois() {
    const [lignes] = await pool.query(
        `SELECT DATE_FORMAT(cree_le, '%Y-%m') AS mois,
                COUNT(*) AS nbCommandes,
                SUM(total) AS chiffreAffaires
         FROM commandes
         GROUP BY mois
         ORDER BY mois DESC
         LIMIT 12`
    );
    return lignes;
}

// Pages/routes les plus visitées
async function visitesParChemin(limite = 10) {
    const [lignes] = await pool.query(
        `SELECT chemin, COUNT(*) AS nbVisites
         FROM statistiques
         GROUP BY chemin
         ORDER BY nbVisites DESC
         LIMIT ?`,
        [limite]
    );
    return lignes;
}

// Nombre total de visites enregistrées
async function nbVisitesTotal() {
    const [[r]] = await pool.query('SELECT COUNT(*) AS n FROM statistiques');
    return r.n;
}

module.exports = {
    ajouterLog, listerLogs,
    ajouterVisite,
    topProduits, chiffreAffairesParMois, visitesParChemin, nbVisitesTotal
};
