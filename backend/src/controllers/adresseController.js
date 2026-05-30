// ============================================================
//  Logique métier : adresses de livraison (nécessite d'être connecté).
// ============================================================

const Adresse = require('../models/adresseModel');

// GET /api/adresses
async function lister(req, res) {
    const adresses = await Adresse.lister(req.utilisateur.id);
    res.json(adresses);
}

// POST /api/adresses
async function creer(req, res) {
    // Si la nouvelle adresse est principale, on retire ce statut aux autres
    if (req.body.principale) {
        await Adresse.reinitialiserPrincipale(req.utilisateur.id);
    }
    const id = await Adresse.creer(req.utilisateur.id, req.body);
    res.status(201).json({ message: 'Adresse ajoutée.', id });
}

// PUT /api/adresses/:id
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
async function supprimer(req, res) {
    const ok = await Adresse.supprimer(req.params.id, req.utilisateur.id);
    if (!ok) {
        return res.status(404).json({ erreur: 'Adresse introuvable.' });
    }
    res.json({ message: 'Adresse supprimée.' });
}

module.exports = { lister, creer, modifier, supprimer };
