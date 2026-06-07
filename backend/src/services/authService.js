// ============================================================
//  Service métier : authentification.
//
//  - mots de passe hachés avec bcrypt ;
//  - jeton d'accès JWT court (Access Token) + jeton de
//    rafraîchissement plus long (Refresh Token).
// ============================================================

require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/utilisateurModel');

const SECRET          = process.env.JWT_SECRET;
const ACCESS_EXPIRES  = process.env.JWT_EXPIRES_IN || '1h';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Génère l'access token (donne accès aux routes protégées)
function genererAccessToken(u) {
    return jwt.sign({ id: u.id, email: u.email, role: u.role }, SECRET, { expiresIn: ACCESS_EXPIRES });
}
// Génère le refresh token (sert uniquement à obtenir un nouvel access token)
function genererRefreshToken(u) {
    return jwt.sign({ id: u.id, type: 'refresh' }, SECRET, { expiresIn: REFRESH_EXPIRES });
}
// Données utilisateur publiques (jamais le mot de passe)
function profilPublic(u) {
    return { id: u.id, prenom: u.prenom, nom: u.nom, email: u.email, role: u.role };
}

// Inscription d'un nouveau client
async function inscription({ prenom, nom, email, motDePasse }) {
    email = email.toLowerCase();
    if (await Utilisateur.trouverParEmail(email)) {
        throw { statut: 409, message: 'Un compte existe déjà avec cet email.' };
    }
    const motDePasseHache = await bcrypt.hash(motDePasse, 10); // hachage bcrypt
    const id = await Utilisateur.creer({ prenom, nom, email, motDePasseHache });
    const u = { id, prenom, nom, email, role: 'client' };
    return {
        token: genererAccessToken(u),
        refreshToken: genererRefreshToken(u),
        utilisateur: profilPublic(u)
    };
}

// Connexion : vérifie l'email + le mot de passe
async function connexion({ email, motDePasse }) {
    const u = await Utilisateur.trouverParEmail(email.toLowerCase());
    // Message générique (on ne révèle pas si c'est l'email ou le mot de passe)
    if (!u || !(await bcrypt.compare(motDePasse, u.mot_de_passe))) {
        throw { statut: 401, message: 'Email ou mot de passe incorrect.' };
    }
    return {
        token: genererAccessToken(u),
        refreshToken: genererRefreshToken(u),
        utilisateur: profilPublic(u)
    };
}

// Rafraîchit l'access token à partir d'un refresh token valide
async function rafraichir(refreshToken) {
    if (!refreshToken) throw { statut: 401, message: 'Refresh token manquant.' };
    let decode;
    try { decode = jwt.verify(refreshToken, SECRET); }
    catch (e) { throw { statut: 401, message: 'Refresh token invalide ou expiré.' }; }
    if (decode.type !== 'refresh') throw { statut: 401, message: 'Token invalide.' };

    const u = await Utilisateur.trouverParId(decode.id);
    if (!u) throw { statut: 401, message: 'Utilisateur introuvable.' };
    return { token: genererAccessToken(u), utilisateur: profilPublic(u) };
}

// Profil de l'utilisateur connecté
async function monProfil(utilisateurId) {
    const u = await Utilisateur.trouverParId(utilisateurId);
    if (!u) throw { statut: 404, message: 'Utilisateur introuvable.' };
    return u;
}

// Mise à jour des informations personnelles
async function modifierProfil(utilisateurId, { prenom, nom, telephone, naissance }) {
    await Utilisateur.modifierProfil(utilisateurId, { prenom, nom, telephone, naissance });
}

// Changement de mot de passe (vérifie l'ancien)
async function changerMotDePasse(utilisateur, { ancienMotDePasse, nouveauMotDePasse }) {
    const u = await Utilisateur.trouverParEmail(utilisateur.email);
    if (!(await bcrypt.compare(ancienMotDePasse, u.mot_de_passe))) {
        throw { statut: 401, message: 'Mot de passe actuel incorrect.' };
    }
    await Utilisateur.modifierMotDePasse(utilisateur.id, await bcrypt.hash(nouveauMotDePasse, 10));
}

module.exports = {
    inscription, connexion, rafraichir, monProfil, modifierProfil, changerMotDePasse
};
