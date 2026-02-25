// ============================================
// confirmation.js - Page de confirmation de commande
// Lit les données de commande stockées en sessionStorage
// (renseignées par paiement.js) et les affiche dynamiquement
// ============================================

(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {

        let orderData;
        const stored = sessionStorage.getItem('peartech-last-order');

        if (stored) {
            try {
                orderData = JSON.parse(stored);
                sessionStorage.removeItem('peartech-last-order');
            } catch (e) {
                console.warn('Impossible de parser peartech-last-order', e);
            }
        }

        if (!orderData) {
            orderData = {
                orderNumber: 'CMD-' + Math.floor(Math.random() * 1000000),
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
                shipping: 0,
                total: 1280.00
            };
        }

        // Remplissage des éléments du DOM
        document.getElementById('order-number').textContent    = orderData.orderNumber;
        document.getElementById('customer-email').textContent  = orderData.email; // CORRECTION : texte simple, pas de lien
        document.getElementById('delivery-name').textContent   = orderData.delivery.name;
        document.getElementById('delivery-address').textContent = orderData.delivery.address;
        document.getElementById('delivery-mode').textContent   = orderData.delivery.mode;
        document.getElementById('payment-method').textContent  = orderData.delivery.payment;

        const itemsContainer = document.getElementById('order-items');
        let itemsHtml = '';
        orderData.items.forEach(item => {
            itemsHtml += `
                <div class="order-item">
                    <span class="item-name">${item.quantity}x ${item.name}</span>
                    <span class="item-price">${item.price.toFixed(2).replace('.',',')} €</span>
                </div>
            `;
        });
        itemsContainer.innerHTML = itemsHtml;

        const shippingText = orderData.shipping === 0
            ? 'Gratuit'
            : orderData.shipping.toFixed(2).replace('.',',') + ' €';
        document.getElementById('shipping-cost').textContent = shippingText;

        document.getElementById('total-paid').textContent = orderData.total.toFixed(2).replace('.',',') + ' €';

        // ── Nettoyage du panier via l'API centralisée ──
        if (window.PearTechCart) {
            window.PearTechCart.clear(); // vide le panier
        } else {
            localStorage.setItem('peartech-cart-count', '0');
        }
        const badge = document.getElementById('cart-count');
        if (badge) {
            badge.textContent = '0';
            badge.style.display = 'none';
        }
    });
})();