// ============================================================
//  Middleware de journalisation : enregistre les visites (statistiques)
//  et les erreurs (logs) dans la base. Tout est en "fire-and-forget"
//  pour ne pas ralentir la réponse.
// ============================================================

const Log = require('../models/logModel');

function journal(req, res, next) {
    // On ne trace que les appels à l'API (pas les fichiers statiques)
    if (req.originalUrl.startsWith('/api')) {
        // 1) Enregistre la visite
        Log.ajouterVisite({
            chemin: req.path,
            methode: req.method,
            utilisateurId: req.utilisateur ? req.utilisateur.id : null, // souvent null ici (avant auth)
            ip: req.ip,
            userAgent: (req.headers['user-agent'] || '').slice(0, 255)
        }).catch(() => {});

        // 2) À la fin de la réponse, journalise les erreurs (statut >= 400)
        res.on('finish', () => {
            if (res.statusCode >= 400) {
                Log.ajouterLog({
                    niveau: res.statusCode >= 500 ? 'error' : 'warn',
                    message: `${req.method} ${req.originalUrl} -> ${res.statusCode}`,
                    methode: req.method,
                    route: req.originalUrl,
                    statut: res.statusCode,
                    utilisateurId: req.utilisateur ? req.utilisateur.id : null,
                    ip: req.ip
                }).catch(() => {});
            }
        });
    }
    next();
}

module.exports = journal;
