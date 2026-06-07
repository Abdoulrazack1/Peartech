// ============================================================
//  Gestion centralisée des erreurs et des routes inconnues.
// ============================================================

const { validationResult } = require('express-validator');

// Vérifie les règles de validation (express-validator) posées sur une route.
// Renvoie 400 avec la liste des erreurs si la saisie est invalide.
function valider(req, res, next) {
    const erreurs = validationResult(req);
    if (!erreurs.isEmpty()) {
        return res.status(400).json({
            erreur: 'Données invalides.',
            details: erreurs.array().map(e => ({ champ: e.path, message: e.msg }))
        });
    }
    next();
}

// Route non trouvée (404)
function routeIntrouvable(req, res) {
    res.status(404).json({ erreur: 'Route introuvable : ' + req.method + ' ' + req.originalUrl });
}

// Dernier filet de sécurité : toute erreur non gérée arrive ici.
function gestionErreurs(err, req, res, next) {
    // Erreur "métier" levée par un service : { statut, message }
    if (err && err.statut) {
        return res.status(err.statut).json({ erreur: err.message });
    }
    // Erreur inattendue (bug, SQL…) : on masque le détail au client
    console.error('Erreur serveur :', err.message);
    res.status(500).json({ erreur: 'Une erreur interne est survenue.' });
}

module.exports = { valider, routeIntrouvable, gestionErreurs };
