// ============================================
// confirmation.js - Page de confirmation de commande
// Lit les données de commande stockées en sessionStorage
// (renseignées par paiement.js) et les affiche dynamiquement
// ============================================

// IIFE pour isoler le code et éviter les conflits
(function() {
    'use strict'; // Mode strict : meilleure sécurité et détection d'erreurs

    // Attend que le DOM soit complètement chargé avant d'exécuter le code
    document.addEventListener('DOMContentLoaded', function() {

        // Variable qui contiendra les données de la commande
        let orderData;

        // Récupère les données de la dernière commande stockées dans sessionStorage
        // sessionStorage est utilisé car les données doivent survivre à un rechargement de page
        // mais être effacées à la fermeture de l'onglet (contrairement à localStorage)
        const stored = sessionStorage.getItem('peartech-last-order');

        if (stored) {
            try {
                // Tente de parser la chaîne JSON en objet JavaScript
                orderData = JSON.parse(stored);
                // Une fois lues, on supprime les données pour éviter de les réafficher plus tard
                // (par exemple si l'utilisateur rafraîchit la page, on ne veut pas garder l'ancienne commande)
                sessionStorage.removeItem('peartech-last-order');
            } catch (e) {
                // En cas d'erreur de parsing (ex: JSON invalide), on log une alerte
                console.warn('Impossible de parser peartech-last-order', e);
            }
        }

        // Si aucune donnée n'a été trouvée (pas de commande précédente ou erreur),
        // on utilise des données factices pour que la page ait un affichage cohérent
        // (utile en développement ou si l'utilisateur arrive directement sur la page)
        if (!orderData) {
            orderData = {
                orderNumber: 'CMD-' + Math.floor(Math.random() * 1000000), // Génère un numéro aléatoire
                email: 'jean.dupont@email.com',
                delivery: {
                    name: 'Jean Dupont',
                    address: '15 rue de la Paix, 75001 Paris, France',
                    mode: 'Livraison standard (3-5 jours)',
                    payment: 'Carte bancaire **** 4242'
                },
                items: [
                    { name: 'Ordinateur Portable Gamer X1', quantity: 1, price: 1200.00 },
                    { name: 'Souris sans fil Pro',          quantity: 1, price: 50.00 },
                    { name: 'Sacoche de transport',         quantity: 1, price: 30.00 }
                ],
                shipping: 0, // Frais de port (gratuit ici)
                total: 1280.00 // Total calculé
            };
        }

        // ── Remplissage des éléments du DOM avec les données de la commande ──

        // Numéro de commande
        document.getElementById('order-number').textContent = orderData.orderNumber;

        // Email du client (texte simple, pas de lien)
        document.getElementById('customer-email').textContent = orderData.email; // CORRECTION : texte simple, pas de lien

        // Informations de livraison
        document.getElementById('delivery-name').textContent   = orderData.delivery.name;
        document.getElementById('delivery-address').textContent = orderData.delivery.address;
        document.getElementById('delivery-mode').textContent   = orderData.delivery.mode;
        document.getElementById('payment-method').textContent  = orderData.delivery.payment;

        // ── Construction de la liste des articles commandés ──
        const itemsContainer = document.getElementById('order-items');
        let itemsHtml = '';
        // Parcourt chaque article et génère le HTML correspondant
        orderData.items.forEach(item => {
            itemsHtml += `
                <div class="order-item">
                    <span class="item-name">${item.quantity}x ${item.name}</span>
                    <span class="item-price">${item.price.toFixed(2).replace('.',',')} €</span>
                </div>
            `;
        });
        // Injecte le HTML dans le conteneur
        itemsContainer.innerHTML = itemsHtml;

        // ── Affichage des frais de port ──
        // Si shipping est 0, on affiche "Gratuit", sinon on formate le montant
        const shippingText = orderData.shipping === 0
            ? 'Gratuit'
            : orderData.shipping.toFixed(2).replace('.',',') + ' €';
        document.getElementById('shipping-cost').textContent = shippingText;

        // ── Affichage du total payé ──
        document.getElementById('total-paid').textContent = orderData.total.toFixed(2).replace('.',',') + ' €';

        // ── Nettoyage du panier après confirmation de commande ──

        // Utilise l'API centralisée PearTechCart si elle existe (pour vider le panier)
        if (window.PearTechCart) {
            window.PearTechCart.clear(); // vide le panier
        } else {
            // Fallback : on remet simplement le compteur à zéro dans localStorage
            localStorage.setItem('peartech-cart-count', '0');
        }

        // Met à jour le badge du panier dans le header
        const badge = document.getElementById('cart-count');
        if (badge) {
            badge.textContent = '0';      // Affiche 0
            badge.style.display = 'none'; // Cache le badge (car zéro)
        }
    });
})();