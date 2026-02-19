// ============================================
// paiement.js - Gestion du formulaire de paiement
// Étapes, validation, options livraison & paiement
// ============================================

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {

        // ── Récupération du panier ────────────────────────────────
        const CART_KEY = 'nova-cart';
        let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];

        // ── Éléments DOM ─────────────────────────────────────────
        const summaryItemsEl  = document.getElementById('summary-items');
        const summaryTotalEl  = document.getElementById('subtotal');
        const summaryShipEl   = document.getElementById('delivery-cost');
        const summaryGrandEl  = document.getElementById('total');
        const form            = document.querySelector('.checkout-form');
        const confirmBtn      = document.getElementById('confirm-order');
        const deliveryOptions = document.querySelectorAll('input[name="delivery"]');
        const paymentOptions  = document.querySelectorAll('input[name="payment"]');
        const paymentDetails  = document.getElementById('cb-fields');

        // ── Afficher le résumé de commande ────────────────────────
        function renderSummary() {
            if (!summaryItemsEl) return;

            if (cart.length === 0) {
                summaryItemsEl.innerHTML = '<p class="summary-empty">Panier vide.</p>';
                return;
            }

            const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            const shipping = getShippingCost();
            const total    = subtotal + shipping;

            summaryItemsEl.innerHTML = cart.map(item => `
                <div class="summary-item">
                    <span class="item-name">${item.quantity}× ${item.name}</span>
                    <span class="item-price">${formatPrice(item.price * item.quantity)}</span>
                </div>
            `).join('');

            if (summaryTotalEl)  summaryTotalEl.textContent  = formatPrice(subtotal);
            if (summaryShipEl)   summaryShipEl.textContent   = shipping === 0 ? 'Gratuit' : formatPrice(shipping);
            if (summaryGrandEl)  summaryGrandEl.textContent  = formatPrice(total);
        }

        // ── Coût de livraison selon l'option choisie ─────────────
        function getShippingCost() {
            const selected = document.querySelector('input[name="delivery"]:checked');
            if (!selected) return 5.90;
            // Lire le prix depuis le texte du span option-price dans la même option
            const optionEl = selected.closest('.delivery-option');
            const priceSpan = optionEl ? optionEl.querySelector('.option-price') : null;
            if (priceSpan) {
                const txt = priceSpan.textContent.replace(/[^\d,]/g, '').replace(',', '.');
                const val = parseFloat(txt);
                return isNaN(val) ? 0 : val;
            }
            // Fallback selon value
            if (selected.value === 'standard') return 5.90;
            if (selected.value === 'express')  return 12.90;
            return 0; // relais = gratuit
        }

        // ── Affichage/masquage des détails de paiement ────────────
        function togglePaymentDetails() {
            if (!paymentDetails) return;
            const selected = document.querySelector('input[name="payment"]:checked');
            const isCarte  = selected && selected.value === 'cb';
            paymentDetails.style.display = isCarte ? 'block' : 'none';
        }

        // ── Validation du formulaire ──────────────────────────────
        function validateForm() {
            const required = form
                ? form.querySelectorAll('input[required], select[required], input[aria-required="true"]')
                : document.querySelectorAll('input[required], select[required]');
            let valid = true;

            required.forEach(field => {
                const isEmpty = field.type === 'checkbox'
                    ? !field.checked
                    : !field.value.trim();

                if (isEmpty) {
                    field.style.borderColor = '#ef4444';
                    valid = false;
                } else {
                    field.style.borderColor = '';
                }
            });

            return valid;
        }

        // ── Soumission / confirmation ─────────────────────────────
        function submitOrder() {
            if (!validateForm()) {
                showMessage('Veuillez remplir tous les champs obligatoires.', 'error');
                return;
            }

            if (cart.length === 0) {
                showMessage('Votre panier est vide.', 'error');
                return;
            }

            // Construire les données de commande
            const selectedDelivery = document.querySelector('input[name="delivery"]:checked');
            const selectedPayment  = document.querySelector('input[name="payment"]:checked');

            const name    = (document.getElementById('prenom')?.value || '') + ' '
                          + (document.getElementById('nom')?.value  || '');
            const address = [
                document.getElementById('adresse')?.value,
                document.getElementById('ville')?.value,
                document.getElementById('code-postal')?.value,
                document.getElementById('country')?.value || 'France'
            ].filter(Boolean).join(', ');

            // Méthode de paiement affichée
            let paymentLabel = 'Carte bancaire';
            if (selectedPayment?.value === 'paypal') paymentLabel = 'PayPal';
            const cardLast4 = document.getElementById('card-number')?.value.slice(-4);
            if (selectedPayment?.value === 'cb' && cardLast4) {
                paymentLabel = `Carte bancaire **** ${cardLast4}`;
            }

            const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            const shipping = getShippingCost();

            const orderData = {
                orderNumber: 'CMD-' + Math.floor(Math.random() * 1000000),
                email: document.getElementById('email')?.value || '',
                delivery: {
                    name:    name.trim() || 'Client',
                    address: address    || '–',
                    mode:    (function() {
                    if (!selectedDelivery) return 'Livraison standard (3-5 jours)';
                    const optEl = selectedDelivery.closest('.delivery-option');
                    const t = optEl ? optEl.querySelector('.option-title') : null;
                    return t ? t.textContent.trim() : 'Livraison standard';
                })(),
                    payment: paymentLabel
                },
                items:    cart.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
                shipping: shipping,
                total:    subtotal + shipping
            };

            // Stocker pour la page de confirmation
            sessionStorage.setItem('nova-last-order', JSON.stringify(orderData));

            // Vider le panier
            localStorage.removeItem(CART_KEY);
            localStorage.setItem('nova-cart-count', '0');

            // Redirection
            window.location.href = 'page_confirmation.html';
        }

        // ── Notification inline ───────────────────────────────────
        function showMessage(text, type) {
            let msg = document.getElementById('paiement-message');
            if (!msg) {
                msg = document.createElement('div');
                msg.id = 'paiement-message';
                msg.style.cssText = 'margin:1rem 0;padding:.9rem 1.2rem;border-radius:8px;font-size:.9rem;font-weight:500;';
                form && form.prepend(msg);
            }
            msg.textContent = text;
            msg.style.background = type === 'error'
                ? 'rgba(239,68,68,.1)' : 'rgba(16,185,129,.1)';
            msg.style.border  = `1px solid ${type === 'error' ? '#ef4444' : '#10b981'}`;
            msg.style.color   = type === 'error' ? '#ef4444' : '#10b981';
            msg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        // ── Utilitaire prix ───────────────────────────────────────
        function formatPrice(price) {
            return price.toFixed(2).replace('.', ',') + ' €';
        }

        // ── Événements ───────────────────────────────────────────
        deliveryOptions.forEach(opt => {
            opt.addEventListener('change', function () {
                document.querySelectorAll('.delivery-option').forEach(el => {
                    el.style.borderColor = '';
                    el.style.background  = '';
                });
                const parent = this.closest('.delivery-option');
                if (parent) {
                    parent.style.borderColor = 'var(--primary)';
                    parent.style.background  = 'rgba(59,130,246,.05)';
                }
                renderSummary();
            });
        });

        paymentOptions.forEach(opt => {
            opt.addEventListener('change', togglePaymentDetails);
        });

        if (confirmBtn) {
            confirmBtn.addEventListener('click', function (e) {
                e.preventDefault();
                submitOrder();
            });
        }

        // ── Initialisation ────────────────────────────────────────
        renderSummary();
        togglePaymentDetails();

        console.log('Paiement initialisé –', cart.length, 'article(s) dans le panier');
    });

})();