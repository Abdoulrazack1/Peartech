// ============================================================
//  Service métier : gestion des utilisateurs (côté admin).
// ============================================================

const Utilisateur = require('../models/utilisateurModel');

const ROLES = ['client', 'admin'];

async function lister() {
    return Utilisateur.listerTous();
}

// Modifie un utilisateur (prénom, nom, email, rôle)
async function modifier(id, { prenom, nom, email, role }) {
    if (role && !ROLES.includes(role)) {
        throw { statut: 400, message: 'Rôle invalide (client ou admin).' };
    }
    const u = await Utilisateur.trouverParId(id);
    if (!u) throw { statut: 404, message: 'Utilisateur introuvable.' };

    await Utilisateur.modifierParAdmin(id, {
        prenom: prenom || u.prenom,
        nom:    nom    || u.nom,
        email:  email  || u.email,
        role:   role   || u.role
    });
}

// Supprime un utilisateur (un admin ne peut pas se supprimer lui-même)
async function supprimer(id, adminConnecteId) {
    if (parseInt(id) === adminConnecteId) {
        throw { statut: 400, message: 'Vous ne pouvez pas supprimer votre propre compte.' };
    }
    const ok = await Utilisateur.supprimer(id);
    if (!ok) throw { statut: 404, message: 'Utilisateur introuvable.' };
}

module.exports = { lister, modifier, supprimer };
