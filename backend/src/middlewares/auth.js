// ============================================================
//  Middlewares d'authentification et d'autorisation.
//
//  - verifierToken : vérifie le JSON Web Token envoyé par le client
//                    dans l'en-tête "Authorization: Bearer <token>".
//  - verifierAdmin : autorise uniquement les utilisateurs admin.
// ============================================================

require('dotenv').config();
const jwt = require('jsonwebtoken');

// Vérifie que la requête contient un token valide.
// Si oui, on attache les infos de l'utilisateur à req.utilisateur.
function verifierToken(req, res, next) {
    const entete = req.headers.authorization;

    if (!entete || !entete.startsWith('Bearer ')) {
        return res.status(401).json({ erreur: 'Token manquant. Veuillez vous connecter.' });
    }

    const token = entete.split(' ')[1];

    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.utilisateur = decode; // { id, email, role }
        next();
    } catch (e) {
        return res.status(401).json({ erreur: 'Token invalide ou expiré.' });
    }
}

// À utiliser APRÈS verifierToken : refuse les non-admin.
function verifierAdmin(req, res, next) {
    if (!req.utilisateur || req.utilisateur.role !== 'admin') {
        return res.status(403).json({ erreur: 'Accès réservé aux administrateurs.' });
    }
    next();
}

module.exports = { verifierToken, verifierAdmin };
