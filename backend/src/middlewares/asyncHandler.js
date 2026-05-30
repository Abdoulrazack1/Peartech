// ============================================================
//  Petit utilitaire : enveloppe une fonction de contrôleur "async"
//  pour que toute erreur soit transmise au middleware d'erreurs
//  (sinon Express ne l'attrape pas et le serveur peut planter).
// ============================================================

module.exports = function asyncHandler(fn) {
    return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
};
