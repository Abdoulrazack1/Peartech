// ============================================================
//  Contrôleur : authentification.
//  Rôle du contrôleur = lire la requête, appeler le service,
//  renvoyer la réponse. La logique est dans authService.
// ============================================================

const auth = require('../services/authService');

// POST /api/auth/inscription
// Crée un nouveau compte client à partir du corps de la requête,
// puis renvoie 201 + les jetons (access/refresh) et le profil public.
async function inscription(req, res) {
    const r = await auth.inscription(req.body);
    res.status(201).json({ message: 'Compte créé avec succès.', ...r });
}

// POST /api/auth/connexion
// Vérifie l'email + le mot de passe ; renvoie les jetons et le profil si valides.
async function connexion(req, res) {
    const r = await auth.connexion(req.body);
    res.json({ message: 'Connexion réussie.', ...r });
}

// POST /api/auth/refresh  { refreshToken }
// Délivre un nouvel access token à partir d'un refresh token valide.
async function rafraichir(req, res) {
    const r = await auth.rafraichir(req.body.refreshToken);
    res.json(r);
}

// GET /api/auth/profil (connecté)
// Renvoie le profil de l'utilisateur connecté (sans le mot de passe).
async function monProfil(req, res) {
    res.json(await auth.monProfil(req.utilisateur.id));
}

// PUT /api/auth/profil (connecté)
// Met à jour les informations personnelles de l'utilisateur connecté.
async function modifierProfil(req, res) {
    await auth.modifierProfil(req.utilisateur.id, req.body);
    res.json({ message: 'Profil mis à jour.' });
}

// PUT /api/auth/mot-de-passe (connecté)
// Change le mot de passe : le service vérifie d'abord l'ancien avant de le remplacer.
async function changerMotDePasse(req, res) {
    await auth.changerMotDePasse(req.utilisateur, req.body);
    res.json({ message: 'Mot de passe mis à jour.' });
}

module.exports = { inscription, connexion, rafraichir, monProfil, modifierProfil, changerMotDePasse };
