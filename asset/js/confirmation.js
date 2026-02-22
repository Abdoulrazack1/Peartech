// ============================================
// confirmation.js - Page de confirmation de commande
// Lit les données de commande stockées en sessionStorage
// (renseignées par paiement.js) et les affiche dynamiquement
// ============================================

(function() {
    'use strict'; // Mode strict activé

    document.addEventListener('DOMContentLoaded', function() {

        // ── Lecture des données de commande ───────────────────────
        // sessionStorage est utilisé (et non localStorage) car les données
        // ne doivent persister que le temps de la session en cours

        let orderData; // Contiendra les données de la commande à afficher
        const stored = sessionStorage.getItem('peartech-last-order'); // Tente de lire la dernière commande

        if (stored) { // Si des données sont trouvées en sessionStorage
            try {
                orderData = JSON.parse(stored); // Désérialise le JSON en objet JavaScript
                // Supprime les données après lecture pour éviter de les réafficher
                // si l'utilisateur recharge la page
                sessionStorage.removeItem('peartech-last-order');
            } catch (e) {
                // Si le JSON est corrompu ou invalide, on log l'erreur et on utilise les données de démo
                console.warn('Impossible de parser peartech-last-order', e);
            }
        }

        // ── Données de démonstration (fallback) ───────────────────
        // Utilisées si aucune commande réelle n'est disponible
        // (ex: accès direct à la page sans passer par le paiement)

        if (!orderData) { // Si aucune donnée réelle n'a été trouvée
            orderData = {
                orderNumber: 'CMD-' + Math.floor(Math.random() * 1000000), // Numéro aléatoire pour la démo
                email: 'jean.dupont@email.com', // Email de démonstration
                delivery: {
                    name: 'Jean Dupont',                              // Nom du destinataire
                    address: '15 rue de la Paix, 75001 Paris, France', // Adresse de livraison
                    mode: 'Livraison standard (3-5 jours)',           // Mode de livraison choisi
                    payment: 'Carte bancaire **** 4242'               // Résumé du paiement (4 derniers chiffres)
                },
                items: [ // Tableau des articles commandés (données fictives)
                    { name: 'Ordinateur Portable Gamer X1', quantity: 1, price: 1200.00 },
                    { name: 'Souris sans fil Pro',          quantity: 1, price: 50.00 },
                    { name: 'Sacoche de transport',         quantity: 1, price: 30.00 }
                ],
                shipping: 0,       // Frais de port offerts pour cette démo
                total: 1280.00     // Total TTC calculé manuellement (1200+50+30+0)
            };
        }

        // ── Remplissage des éléments du DOM ───────────────────────
        // Chaque getElementById correspond à un span/p dans page_confirmation.html

        document.getElementById('order-number').textContent    = orderData.orderNumber;        // Numéro de commande
        document.getElementById('customer-email').textContent  = orderData.email;              // Email du client
        document.getElementById('delivery-name').textContent   = orderData.delivery.name;      // Nom destinataire
        document.getElementById('delivery-address').textContent = orderData.delivery.address;  // Adresse
        document.getElementById('delivery-mode').textContent   = orderData.delivery.mode;      // Mode de livraison
        document.getElementById('payment-method').textContent  = orderData.delivery.payment;   // Moyen de paiement

        // ── Génération de la liste des articles commandés ─────────

        const itemsContainer = document.getElementById('order-items'); // Zone d'affichage des articles
        let itemsHtml = ''; // Chaîne HTML à construire
        orderData.items.forEach(item => { // Pour chaque article de la commande
            itemsHtml += `
                <div class="order-item">
                    <!-- Quantité et nom de l'article -->
                    <span class="item-name">${item.quantity}x ${item.name}</span>
                    <!-- Prix formaté avec virgule et €, multiplié par la quantité -->
                    <span class="item-price">${item.price.toFixed(2).replace('.',',')} €</span>
                </div>
            `;
        });
        itemsContainer.innerHTML = itemsHtml; // Injecte les articles dans le DOM

        // ── Affichage des frais de livraison ──────────────────────

        // Affiche "Gratuit" si les frais sont à 0, sinon le montant formaté
        const shippingText = orderData.shipping === 0
            ? 'Gratuit'
            : orderData.shipping.toFixed(2).replace('.',',') + ' €';
        document.getElementById('shipping-cost').textContent = shippingText; // Met à jour l'affichage

        // ── Affichage du total payé ────────────────────────────────

        // Formate le total en prix français (virgule au lieu du point)
        document.getElementById('total-paid').textContent = orderData.total.toFixed(2).replace('.',',') + ' €';

        // ── Nettoyage du panier après confirmation ─────────────────
        // Remet le compteur du panier à zéro puisque la commande a été passée

        localStorage.setItem('peartech-cart-count', '0'); // Réinitialise le compteur
        const badge = document.getElementById('cart-count'); // Récupère le badge du header
        if (badge) {
            badge.textContent = '0';       // Affiche 0
            badge.style.display = 'none';  // Cache le badge (inutile d'afficher 0)
        }
    });
})(); // Fin de l'IIFE