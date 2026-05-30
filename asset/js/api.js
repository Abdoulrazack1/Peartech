// ============================================================
//  api.js — Client de l'API PearTech (back-end Node/Express).
//
//  Centralise tous les appels HTTP vers le serveur, gère le token
//  JWT (stocké dans localStorage) et expose window.PearTechAPI.
//  Chargé AVANT les autres scripts sur toutes les pages.
// ============================================================

(function () {
    'use strict';

    // Adresse de base de l'API. À adapter si le serveur tourne ailleurs.
    const BASE = 'http://localhost:3000/api';

    const TOKEN_KEY = 'peartech-token'; // jeton JWT
    const USER_KEY  = 'peartech-user';  // infos utilisateur connecté (JSON)

    // ── Stockage local sécurisé ───────────────────────────────
    function getToken() { try { return localStorage.getItem(TOKEN_KEY); } catch (e) { return null; } }
    function setToken(t) { try { localStorage.setItem(TOKEN_KEY, t); } catch (e) {} }
    function getUser()  { try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch (e) { return null; } }
    function setUser(u) { try { localStorage.setItem(USER_KEY, JSON.stringify(u)); } catch (e) {} }
    function clearAuth() {
        try { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); } catch (e) {}
    }
    function isLoggedIn() { return !!getToken(); }

    // ── Fonction générique d'appel HTTP ───────────────────────
    async function request(method, chemin, corps, avecAuth) {
        const headers = { 'Content-Type': 'application/json' };
        if (avecAuth) {
            const t = getToken();
            if (t) headers['Authorization'] = 'Bearer ' + t;
        }

        const options = { method, headers };
        if (corps !== undefined) options.body = JSON.stringify(corps);

        let reponse;
        try {
            reponse = await fetch(BASE + chemin, options);
        } catch (e) {
            // Le serveur ne répond pas (back-end éteint, mauvaise URL…)
            throw { reseau: true, message: 'Serveur injoignable. Le back-end est-il démarré ?' };
        }

        let data = null;
        try { data = await reponse.json(); } catch (e) {}

        if (!reponse.ok) {
            throw {
                statut: reponse.status,
                message: (data && data.erreur) || 'Une erreur est survenue.',
                details: data && data.details
            };
        }
        return data;
    }

    // ── API publique ──────────────────────────────────────────
    window.PearTechAPI = {
        // Gestion du token / utilisateur
        isLoggedIn, getUser, setUser, getToken, clearAuth,

        // Authentification (connexion/inscription enregistrent token + user)
        inscription: (d) =>
            request('POST', '/auth/inscription', d, false)
                .then(rep => { setToken(rep.token); setUser(rep.utilisateur); return rep; }),
        connexion: (email, motDePasse) =>
            request('POST', '/auth/connexion', { email, motDePasse }, false)
                .then(rep => { setToken(rep.token); setUser(rep.utilisateur); return rep; }),
        profil:          () => request('GET', '/auth/profil', undefined, true),
        modifierProfil:  (d) => request('PUT', '/auth/profil', d, true),
        motDePasse:      (ancien, nouveau) =>
            request('PUT', '/auth/mot-de-passe', { ancienMotDePasse: ancien, nouveauMotDePasse: nouveau }, true),

        // Produits / catégories (lecture publique, dispo si besoin)
        produits:   (q) => request('GET', '/produits' + (q ? '?' + q : ''), undefined, false),
        produit:    (id) => request('GET', '/produits/' + id, undefined, false),
        categories: () => request('GET', '/categories', undefined, false),

        // Favoris
        favorisList:    () => request('GET', '/favoris', undefined, true),
        favorisAjouter: (produitId) => request('POST', '/favoris', { produitId }, true),
        favorisRetirer: (produitId) => request('DELETE', '/favoris/' + produitId, undefined, true),

        // Panier
        panierGet:      () => request('GET', '/panier', undefined, true),
        panierAjouter:  (produitId, quantite, options) =>
            request('POST', '/panier', { produitId, quantite, options }, true),
        panierModifier: (produitId, quantite) =>
            request('PUT', '/panier/' + produitId, { quantite }, true),
        panierRetirer:  (produitId) => request('DELETE', '/panier/' + produitId, undefined, true),
        panierVider:    () => request('DELETE', '/panier', undefined, true),

        // Adresses de livraison
        adressesList:    () => request('GET', '/adresses', undefined, true),
        adresseAjouter:  (d) => request('POST', '/adresses', d, true),
        adresseModifier: (id, d) => request('PUT', '/adresses/' + id, d, true),
        adresseSupprimer:(id) => request('DELETE', '/adresses/' + id, undefined, true),

        // Commandes
        commander:             (adresseLivraison, articles) =>
            request('POST', '/commandes', { adresseLivraison, articles }, true),
        commanderDepuisPanier: (adresseLivraison) =>
            request('POST', '/commandes/depuis-panier', { adresseLivraison }, true),
        commandesList:         () => request('GET', '/commandes', undefined, true),

        // Contact
        contact: (d) => request('POST', '/contact', d, false),

        // Produits — écriture (admin)
        produitCreer:     (d) => request('POST', '/produits', d, true),
        produitModifier:  (id, d) => request('PUT', '/produits/' + id, d, true),
        produitSupprimer: (id) => request('DELETE', '/produits/' + id, undefined, true),

        // Espace administrateur
        adminStats:          () => request('GET', '/admin/stats', undefined, true),
        adminCommandes:      () => request('GET', '/admin/commandes', undefined, true),
        adminCommandeStatut: (id, statut) => request('PUT', '/admin/commandes/' + id, { statut }, true),
        adminUtilisateurs:   () => request('GET', '/admin/utilisateurs', undefined, true),
        adminMessages:       () => request('GET', '/admin/messages', undefined, true)
    };
})();
