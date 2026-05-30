// ============================================================
//  Logique métier : authentification et profil utilisateur.
//
//  Sécurité :
//   - mots de passe hachés avec bcrypt (jamais stockés en clair) ;
//   - connexion vérifiée avec bcrypt.compare ;
//   - jeton de session signé avec JSON Web Token (JWT).
// ============================================================

require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/utilisateurModel');

// Génère un token JWT contenant l'id, l'email et le rôle de l'utilisateur
function genererToken(utilisateur) {
    return jwt.sign(
        { id: utilisateur.id, email: utilisateur.email, role: utilisateur.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
    );
}

// Petit nettoyage : on ne renvoie jamais le mot de passe au client
function profilPublic(u) {
    return { id: u.id, prenom: u.prenom, nom: u.nom, email: u.email, role: u.role };
}

// --- Inscription ---
async function inscription(req, res) {
    const { prenom, nom, email, motDePasse } = req.body;

    // L'email doit être unique
    const existant = await Utilisateur.trouverParEmail(email.toLowerCase());
    if (existant) {
        return res.status(409).json({ erreur: 'Un compte existe déjà avec cet email.' });
    }

    // Hachage du mot de passe avant stockage
    const motDePasseHache = await bcrypt.hash(motDePasse, 10);

    const id = await Utilisateur.creer({
        prenom, nom, email: email.toLowerCase(), motDePasseHache
    });

    const utilisateur = { id, prenom, nom, email: email.toLowerCase(), role: 'client' };
    const token = genererToken(utilisateur);

    res.status(201).json({
        message: 'Compte créé avec succès.',
        token,
        utilisateur: profilPublic(utilisateur)
    });
}

// --- Connexion ---
async function connexion(req, res) {
    const { email, motDePasse } = req.body;

    const utilisateur = await Utilisateur.trouverParEmail(email.toLowerCase());

    // Message volontairement générique (on ne dit pas si c'est l'email ou le mot de passe)
    if (!utilisateur) {
        return res.status(401).json({ erreur: 'Email ou mot de passe incorrect.' });
    }

    const motDePasseOk = await bcrypt.compare(motDePasse, utilisateur.mot_de_passe);
    if (!motDePasseOk) {
        return res.status(401).json({ erreur: 'Email ou mot de passe incorrect.' });
    }

    const token = genererToken(utilisateur);
    res.json({
        message: 'Connexion réussie.',
        token,
        utilisateur: profilPublic(utilisateur)
    });
}

// --- Mon profil (utilisateur connecté) ---
async function monProfil(req, res) {
    const utilisateur = await Utilisateur.trouverParId(req.utilisateur.id);
    if (!utilisateur) {
        return res.status(404).json({ erreur: 'Utilisateur introuvable.' });
    }
    res.json(utilisateur);
}

// --- Mise à jour des informations personnelles ---
async function modifierProfil(req, res) {
    const { prenom, nom, telephone, naissance } = req.body;
    await Utilisateur.modifierProfil(req.utilisateur.id, { prenom, nom, telephone, naissance });
    res.json({ message: 'Profil mis à jour.' });
}

// --- Changement de mot de passe ---
async function changerMotDePasse(req, res) {
    const { ancienMotDePasse, nouveauMotDePasse } = req.body;

    const utilisateur = await Utilisateur.trouverParEmail(req.utilisateur.email);
    const ok = await bcrypt.compare(ancienMotDePasse, utilisateur.mot_de_passe);
    if (!ok) {
        return res.status(401).json({ erreur: 'Mot de passe actuel incorrect.' });
    }

    const hache = await bcrypt.hash(nouveauMotDePasse, 10);
    await Utilisateur.modifierMotDePasse(req.utilisateur.id, hache);
    res.json({ message: 'Mot de passe mis à jour.' });
}

module.exports = { inscription, connexion, monProfil, modifierProfil, changerMotDePasse };
