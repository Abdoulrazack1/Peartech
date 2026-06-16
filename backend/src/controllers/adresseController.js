// ============================================================
//  Contrôleur : adresses de livraison (nécessite d'être connecté).
//  Chaque adresse est rattachée à l'utilisateur connecté (req.utilisateur.id).
// ============================================================

const Adresse = require('../models/adresseModel');

// GET /api/adresses
// Renvoie toutes les adresses de l'utilisateur connecté.
async function lister(req, res) {
    const adresses = await Adresse.lister(req.utilisateur.id);
    res.json(adresses);
}

// POST /api/adresses
// Ajoute une adresse. Si elle est marquée "principale", retire d'abord
// ce statut aux autres adresses de l'utilisateur.
async function creer(req, res) {
    // Si la nouvelle adresse est principale, on retire ce statut aux autres
    if (req.body.principale) {
        await Adresse.reinitialiserPrincipale(req.utilisateur.id);
    }
    const id = await Adresse.creer(req.utilisateur.id, req.body);
    res.status(201).json({ message: 'Adresse ajoutée.', id });
}

// PUT /api/adresses/:id
// Met à jour une adresse de l'utilisateur (gère aussi le passage en "principale").
// Répond 404 si l'adresse est introuvable.
async function modifier(req, res) {
    if (req.body.principale) {
        await Adresse.reinitialiserPrincipale(req.utilisateur.id);
    }
    const ok = await Adresse.modifier(req.params.id, req.utilisateur.id, req.body);
    if (!ok) {
        return res.status(404).json({ erreur: 'Adresse introuvable.' });
    }
    res.json({ message: 'Adresse mise à jour.' });
}

// DELETE /api/adresses/:id
// Supprime une adresse de l'utilisateur ; répond 404 si elle n'existe pas.
async function supprimer(req, res) {
    const ok = await Adresse.supprimer(req.params.id, req.utilisateur.id);
    if (!ok) {
        return res.status(404).json({ erreur: 'Adresse introuvable.' });
    }
    res.json({ message: 'Adresse supprimée.' });
}

module.exports = { lister, creer, modifier, supprimer };
