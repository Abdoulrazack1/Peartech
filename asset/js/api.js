// ============================================================
//  api.js — Client de l'API PearTech (back-end Node/Express).
//
//  Centralise tous les appels HTTP vers le serveur, gère le token
//  JWT (stocké dans localStorage) et expose window.PearTechAPI.
//  Chargé AVANT les autres scripts sur toutes les pages.
// ============================================================

(function () {
    'use strict'; // Mode strict : signale les erreurs silencieuses

    // Adresse de base de l'API. À adapter si le serveur tourne ailleurs.
    const BASE = 'http://localhost:3000/api';

    const TOKEN_KEY = 'peartech-token'; // clé du jeton JWT dans localStorage
    const USER_KEY  = 'peartech-user';  // clé des infos utilisateur (JSON)

    // ── Stockage local sécurisé ───────────────────────────────
    // Chaque accès à localStorage est encapsulé dans un try/catch
    // (le stockage peut être bloqué en navigation privée).

    // Lit le token JWT (ou null s'il n'y en a pas)
    function getToken() { try { return localStorage.getItem(TOKEN_KEY); } catch (e) { return null; } }
    // Enregistre le token JWT
    function setToken(t) { try { localStorage.setItem(TOKEN_KEY, t); } catch (e) {} }
    // Lit l'utilisateur connecté et le reconvertit en objet
    function getUser()  { try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch (e) { return null; } }
    // Enregistre l'utilisateur connecté (converti en texte JSON)
    function setUser(u) { try { localStorage.setItem(USER_KEY, JSON.stringify(u)); } catch (e) {} }
    // Efface token + utilisateur (déconnexion)
    function clearAuth() {
        try { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); } catch (e) {}
    }
    // Vrai si un token est présent (donc utilisateur connecté)
    function isLoggedIn() { return !!getToken(); }

    // ── Fonction générique d'appel HTTP ───────────────────────
    // method : 'GET' | 'POST' | 'PUT' | 'DELETE'
    // chemin : ex '/produits'  | corps : objet JS envoyé en JSON
    // avecAuth : true => ajoute l'en-tête Authorization avec le token
    async function request(method, chemin, corps, avecAuth) {
        const headers = { 'Content-Type': 'application/json' }; // on envoie du JSON

        // Si la route est protégée, on joint le token JWT
        if (avecAuth) {
            const t = getToken();
            if (t) headers['Authorization'] = 'Bearer ' + t;
        }

        const options = { method, headers };
        // Pas de corps pour GET/DELETE : on n'ajoute "body" que si nécessaire
        if (corps !== undefined) options.body = JSON.stringify(corps);

        let reponse;
        try {
            reponse = await fetch(BASE + chemin, options); // appel réseau
        } catch (e) {
            // fetch a échoué : le serveur ne répond pas (back-end éteint, etc.)
            throw { reseau: true, message: 'Serveur injoignable. Le back-end est-il démarré ?' };
        }

        // On tente de lire la réponse JSON (peut être vide)
        let data = null;
        try { data = await reponse.json(); } catch (e) {}

        // Statut HTTP d'erreur (4xx/5xx) => on lève une exception exploitable
        if (!reponse.ok) {
            throw {
                statut: reponse.status,
                message: (data && data.erreur) || 'Une erreur est survenue.',
                details: data && data.details // détails de validation éventuels
            };
        }
        return data; // succès : on renvoie les données
    }

    // ── API publique (une méthode = un endpoint) ──────────────
    window.PearTechAPI = {
        // Outils de session
        isLoggedIn, getUser, setUser, getToken, clearAuth,

        // Authentification — connexion/inscription enregistrent token + user
        inscription: (d) =>
            request('POST', '/auth/inscription', d, false)
                .then(rep => { setToken(rep.token); setUser(rep.utilisateur); return rep; }),
        connexion: (email, motDePasse) =>
            request('POST', '/auth/connexion', { email, motDePasse }, false)
                .then(rep => { setToken(rep.token); setUser(rep.utilisateur); return rep; }),
        profil:          () => request('GET', '/auth/profil', undefined, true),       // mon profil
        modifierProfil:  (d) => request('PUT', '/auth/profil', d, true),              // modifier mes infos
        motDePasse:      (ancien, nouveau) =>                                          // changer mon mot de passe
            request('PUT', '/auth/mot-de-passe', { ancienMotDePasse: ancien, nouveauMotDePasse: nouveau }, true),

        // Produits / catégories (lecture publique)
        produits:   (q) => request('GET', '/produits' + (q ? '?' + q : ''), undefined, false), // liste (filtres optionnels)
        produit:    (id) => request('GET', '/produits/' + id, undefined, false),               // un produit (id ou slug)
        categories: () => request('GET', '/categories', undefined, false),                     // toutes les catégories

        // Favoris (connexion requise)
        favorisList:    () => request('GET', '/favoris', undefined, true),               // mes favoris
        favorisAjouter: (produitId) => request('POST', '/favoris', { produitId }, true), // ajouter un favori
        favorisRetirer: (produitId) => request('DELETE', '/favoris/' + produitId, undefined, true), // retirer

        // Panier (connexion requise)
        panierGet:      () => request('GET', '/panier', undefined, true),                // lire mon panier
        panierAjouter:  (produitId, quantite, options) =>                                // ajouter un article
            request('POST', '/panier', { produitId, quantite, options }, true),
        panierModifier: (produitId, quantite) =>                                         // changer la quantité
            request('PUT', '/panier/' + produitId, { quantite }, true),
        panierRetirer:  (produitId) => request('DELETE', '/panier/' + produitId, undefined, true), // retirer un article
        panierVider:    () => request('DELETE', '/panier', undefined, true),             // vider le panier

        // Adresses de livraison (connexion requise)
        adressesList:    () => request('GET', '/adresses', undefined, true),       // mes adresses
        adresseAjouter:  (d) => request('POST', '/adresses', d, true),             // ajouter
        adresseModifier: (id, d) => request('PUT', '/adresses/' + id, d, true),    // modifier
        adresseSupprimer:(id) => request('DELETE', '/adresses/' + id, undefined, true), // supprimer

        // Commandes (connexion requise)
        commander:             (adresseLivraison, articles) =>                     // commander une liste d'articles
            request('POST', '/commandes', { adresseLivraison, articles }, true),
        commanderDepuisPanier: (adresseLivraison) =>                               // commander depuis le panier serveur
            request('POST', '/commandes/depuis-panier', { adresseLivraison }, true),
        commandesList:         () => request('GET', '/commandes', undefined, true), // mes commandes

        // Contact (public)
        contact: (d) => request('POST', '/contact', d, false), // envoyer un message

        // Produits — écriture (réservé admin)
        produitCreer:     (d) => request('POST', '/produits', d, true),            // créer un produit
        produitModifier:  (id, d) => request('PUT', '/produits/' + id, d, true),   // modifier un produit
        produitSupprimer: (id) => request('DELETE', '/produits/' + id, undefined, true), // supprimer

        // Espace administrateur (réservé admin)
        adminStats:          () => request('GET', '/admin/stats', undefined, true),        // chiffres du dashboard
        adminCommandes:      () => request('GET', '/admin/commandes', undefined, true),    // toutes les commandes
        adminCommandeStatut: (id, statut) => request('PUT', '/admin/commandes/' + id, { statut }, true), // changer un statut
        adminUtilisateurs:   () => request('GET', '/admin/utilisateurs', undefined, true), // liste des comptes
        adminMessages:       () => request('GET', '/admin/messages', undefined, true)      // messages de contact
    };
})();
