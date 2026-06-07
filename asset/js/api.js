// ============================================================
//  api.js — Client de l'API PearTech.
//  Centralise les appels HTTP, gère le token JWT (localStorage)
//  et expose window.PearTechAPI. Chargé avant les autres scripts.
// ============================================================

(function () {
    'use strict';

    const BASE = 'http://localhost:3000/api'; // adresse de l'API (à adapter si besoin)

    const TOKEN_KEY   = 'peartech-token';
    const REFRESH_KEY = 'peartech-refresh-token';
    const USER_KEY    = 'peartech-user';

    // Accès localStorage encapsulés (peut être bloqué en navigation privée)
    function getToken() { try { return localStorage.getItem(TOKEN_KEY); } catch (e) { return null; } }
    function setToken(t) { try { localStorage.setItem(TOKEN_KEY, t); } catch (e) {} }
    function getUser()  { try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch (e) { return null; } }
    function setUser(u) { try { localStorage.setItem(USER_KEY, JSON.stringify(u)); } catch (e) {} }
    function getRefreshToken() { try { return localStorage.getItem(REFRESH_KEY); } catch (e) { return null; } }
    function setRefreshToken(t) { try { if (t) localStorage.setItem(REFRESH_KEY, t); } catch (e) {} }
    function clearAuth() {
        try {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(REFRESH_KEY);
            localStorage.removeItem(USER_KEY);
        } catch (e) {}
    }
    function isLoggedIn() { return !!getToken(); }

    // Appel HTTP générique. avecAuth = true ajoute l'en-tête Authorization.
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

    window.PearTechAPI = {
        // Session
        isLoggedIn, getUser, setUser, getToken, clearAuth,

        // Authentification (connexion/inscription enregistrent tokens + user)
        inscription: (d) =>
            request('POST', '/auth/inscription', d, false)
                .then(rep => { setToken(rep.token); setRefreshToken(rep.refreshToken); setUser(rep.utilisateur); return rep; }),
        connexion: (email, motDePasse) =>
            request('POST', '/auth/connexion', { email, motDePasse }, false)
                .then(rep => { setToken(rep.token); setRefreshToken(rep.refreshToken); setUser(rep.utilisateur); return rep; }),
        refresh: () =>
            request('POST', '/auth/refresh', { refreshToken: getRefreshToken() }, false)
                .then(rep => { setToken(rep.token); return rep; }),
        profil:          () => request('GET', '/auth/profil', undefined, true),
        modifierProfil:  (d) => request('PUT', '/auth/profil', d, true),
        motDePasse:      (ancien, nouveau) =>
            request('PUT', '/auth/mot-de-passe', { ancienMotDePasse: ancien, nouveauMotDePasse: nouveau }, true),

        // Produits / catégories (lecture publique)
        produits:   (q) => request('GET', '/produits' + (q ? '?' + q : ''), undefined, false),
        produit:    (id) => request('GET', '/produits/' + id, undefined, false),
        categories: () => request('GET', '/categories', undefined, false),

        // Favoris
        favorisList:    () => request('GET', '/favoris', undefined, true),
        favorisAjouter: (produitId) => request('POST', '/favoris', { produitId }, true),
        favorisRetirer: (produitId) => request('DELETE', '/favoris/' + produitId, undefined, true),

        // Panier
        panierGet:      () => request('GET', '/panier', undefined, true),
        panierAjouter:  (produitId, quantite, options) => request('POST', '/panier', { produitId, quantite, options }, true),
        panierModifier: (produitId, quantite) => request('PUT', '/panier/' + produitId, { quantite }, true),
        panierRetirer:  (produitId) => request('DELETE', '/panier/' + produitId, undefined, true),
        panierVider:    () => request('DELETE', '/panier', undefined, true),

        // Adresses
        adressesList:    () => request('GET', '/adresses', undefined, true),
        adresseAjouter:  (d) => request('POST', '/adresses', d, true),
        adresseModifier: (id, d) => request('PUT', '/adresses/' + id, d, true),
        adresseSupprimer:(id) => request('DELETE', '/adresses/' + id, undefined, true),

        // Commandes
        commander:             (adresseLivraison, articles) => request('POST', '/commandes', { adresseLivraison, articles }, true),
        commanderDepuisPanier: (adresseLivraison) => request('POST', '/commandes/depuis-panier', { adresseLivraison }, true),
        commandesList:         () => request('GET', '/commandes', undefined, true),
        commandeAnnuler:       (id) => request('PUT', '/commandes/' + id + '/cancel', {}, true),

        // Avis (lecture publique, écriture connectée)
        avisProduit:   (produitId) => request('GET', '/produits/' + produitId + '/avis', undefined, false),
        avisAjouter:   (d) => request('POST', '/reviews', d, true),
        avisModifier:  (id, d) => request('PUT', '/reviews/' + id, d, true),
        avisSupprimer: (id) => request('DELETE', '/reviews/' + id, undefined, true),

        // Contact
        contact: (d) => request('POST', '/contact', d, false),

        // Produits — écriture (admin)
        produitCreer:     (d) => request('POST', '/produits', d, true),
        produitModifier:  (id, d) => request('PUT', '/produits/' + id, d, true),
        produitSupprimer: (id) => request('DELETE', '/produits/' + id, undefined, true),

        // Espace administrateur
        adminStats:          () => request('GET', '/admin/stats', undefined, true),
        adminStatistiques:   () => request('GET', '/admin/statistics', undefined, true),
        adminLogs:           () => request('GET', '/admin/logs', undefined, true),
        adminCommandes:      () => request('GET', '/admin/commandes', undefined, true),
        adminCommandeStatut: (id, statut) => request('PUT', '/admin/commandes/' + id, { statut }, true),
        adminUtilisateurs:   () => request('GET', '/admin/utilisateurs', undefined, true),
        adminUtilisateurModifier: (id, d) => request('PUT', '/admin/utilisateurs/' + id, d, true),
        adminUtilisateurSupprimer:(id) => request('DELETE', '/admin/utilisateurs/' + id, undefined, true),
        adminMessages:       () => request('GET', '/admin/messages', undefined, true)
    };
})();
