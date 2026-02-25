// ============================================
// paiement.js - Page de finalisation de commande
// Gère : résumé du panier, options de livraison,
// options de paiement, validation du formulaire
// et redirection vers la confirmation
// ============================================

(function () {
    'use strict';

    // ── Accès localStorage sécurisé (utile pour le compteur de commandes) ──
    function storageGet(key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.warn('localStorage.getItem échoué :', e);
            return null;
        }
    }

    function storageSet(key, value) {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (e) {
            console.warn('localStorage.setItem échoué :', e);
            return false;
        }
    }

    function storageRemove(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.warn('localStorage.removeItem échoué :', e);
        }
    }

    // ── Génération d'un numéro de commande non-collisionnable ──
    function generateOrderNumber() {
        const counter = parseInt(storageGet('peartech-order-counter') || '0', 10) + 1;
        storageSet('peartech-order-counter', String(counter));

        const timestamp = Date.now().toString(36).toUpperCase();
        const seq       = counter.toString(36).padStart(3, '0').toUpperCase();
        const rand      = Math.random().toString(36).substr(2, 3).toUpperCase();

        return `CMD-${timestamp}-${seq}${rand}`;
    }

    document.addEventListener('DOMContentLoaded', function () {

        // ── Chargement du panier via l'API centralisée ──
        let cart = [];
        if (window.PearTechCart) {
            cart = window.PearTechCart.getCart() || [];
        } else {
            console.warn('PearTechCart non disponible, lecture directe localStorage');
            try {
                cart = JSON.parse(storageGet('peartech-cart')) || [];
            } catch (e) {
                cart = [];
            }
        }

        // ── Récupération de la promo active depuis sessionStorage ──
        let currentPromo = null;
        try {
            const storedPromo = sessionStorage.getItem('peartech-promo');
            if (storedPromo) currentPromo = JSON.parse(storedPromo);
        } catch(e) {
            console.warn('Impossible de lire la promo depuis sessionStorage :', e);
        }

        // ── Récupération des éléments du DOM ──
        const summaryItemsEl  = document.getElementById('summary-items');
        const summaryTotalEl  = document.getElementById('subtotal');
        const summaryShipEl   = document.getElementById('delivery-cost');
        const summaryGrandEl  = document.getElementById('total');
        const form            = document.querySelector('.checkout-form');
        const confirmBtn      = document.getElementById('confirm-order');
        const deliveryOptions = document.querySelectorAll('input[name="delivery"]');
        const paymentOptions  = document.querySelectorAll('input[name="payment"]');
        const paymentDetails  = document.getElementById('cb-fields');

        // ── Affichage du résumé de commande ──
        function renderSummary() {
            if (!summaryItemsEl) return;

            if (cart.length === 0) {
                summaryItemsEl.innerHTML = '<p class="summary-empty">Panier vide.</p>';
                return;
            }

            const subtotal      = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            const promoDiscount = currentPromo ? subtotal * currentPromo.discount : 0;
            const shipping      = getShippingCost();
            const total         = subtotal - promoDiscount + shipping;

            // ── Lignes articles ──
            summaryItemsEl.innerHTML = cart.map(item => {
                const linePrice   = item.price * item.quantity;
                const hasDiscount = item.oldPrice && item.oldPrice > item.price;
                const oldLine     = hasDiscount ? item.oldPrice * item.quantity : null;
                const pct         = hasDiscount ? Math.round((1 - item.price / item.oldPrice) * 100) : 0;
                return `
                <div class="summary-item">
                    <span class="item-name">
                        ${item.quantity}× ${item.name}
                        ${pct > 0 ? `<span class="summary-badge">-${pct}%</span>` : ''}
                    </span>
                    <span class="item-price">
                        ${oldLine ? `<span class="item-old-price">${formatPrice(oldLine)}</span> ` : ''}
                        ${formatPrice(linePrice)}
                    </span>
                </div>`;
            }).join('');

            if (summaryTotalEl) summaryTotalEl.textContent = formatPrice(subtotal);
            if (summaryShipEl)  summaryShipEl.textContent  = shipping === 0 ? 'Gratuit' : formatPrice(shipping);

            const summaryTotals    = document.querySelector('.summary-totals');
            const existingPromoRow = document.getElementById('promo-summary-row');

            if (promoDiscount > 0 && summaryTotals) {
                const label = currentPromo.code
                    ? `🏷️ Code "${currentPromo.code}" (-${Math.round(currentPromo.discount * 100)}%)`
                    : '🏷️ Réduction';

                if (existingPromoRow) {
                    existingPromoRow.querySelector('.promo-label').textContent  = label;
                    existingPromoRow.querySelector('.promo-amount').textContent = `-${formatPrice(promoDiscount)}`;
                } else {
                    const promoRow = document.createElement('div');
                    promoRow.id        = 'promo-summary-row';
                    promoRow.className = 'summary-line';
                    promoRow.style.color = '#10b981';
                    promoRow.innerHTML = `
                        <span class="promo-label">${label}</span>
                        <span class="promo-amount" style="font-weight:700">-${formatPrice(promoDiscount)}</span>
                    `;
                    const totalLine = summaryTotals.querySelector('.summary-line.total');
                    if (totalLine) {
                        summaryTotals.insertBefore(promoRow, totalLine);
                    } else {
                        summaryTotals.appendChild(promoRow);
                    }
                }
            } else if (existingPromoRow) {
                existingPromoRow.remove();
            }

            if (summaryGrandEl) summaryGrandEl.textContent = formatPrice(total);
        }

        function getShippingCost() {
            const selected = document.querySelector('input[name="delivery"]:checked');
            if (!selected) return 5.90;

            const optionEl  = selected.closest('.delivery-option');
            const priceSpan = optionEl ? optionEl.querySelector('.option-price') : null;
            if (priceSpan) {
                const txt = priceSpan.textContent.replace(/[^\d,]/g, '').replace(',', '.');
                const val = parseFloat(txt);
                return isNaN(val) ? 0 : val;
            }
            if (selected.value === 'standard') return 5.90;
            if (selected.value === 'express')  return 12.90;
            return 0;
        }

        function togglePaymentDetails() {
            if (!paymentDetails) return;
            const selected = document.querySelector('input[name="payment"]:checked');
            const isCarte  = selected && selected.value === 'cb';
            paymentDetails.style.display = isCarte ? 'block' : 'none';
        }

        function validateForm() {
            const required = form
                ? form.querySelectorAll('input[required], select[required], input[aria-required="true"]')
                : document.querySelectorAll('input[required], select[required]');
            let valid = true;

            required.forEach(field => {
                const isEmpty = field.type === 'checkbox' ? !field.checked : !field.value.trim();
                if (isEmpty) {
                    field.style.borderColor = '#ef4444';
                    valid = false;
                } else {
                    field.style.borderColor = '';
                }
            });

            return valid;
        }

        function submitOrder() {
            if (!validateForm()) {
                showMessage('Veuillez remplir tous les champs obligatoires.', 'error');
                return;
            }

            if (cart.length === 0) {
                showMessage('Votre panier est vide.', 'error');
                return;
            }

            const selectedDelivery = document.querySelector('input[name="delivery"]:checked');
            const selectedPayment  = document.querySelector('input[name="payment"]:checked');

            const name = (document.getElementById('prenom')?.value || '') + ' '
                       + (document.getElementById('nom')?.value    || '');

            const address = [
                document.getElementById('adresse')?.value,
                document.getElementById('ville')?.value,
                document.getElementById('code-postal')?.value,
                document.getElementById('pays')?.value || 'France'
            ].filter(Boolean).join(', ');

            let paymentLabel = 'Carte bancaire';
            if (selectedPayment?.value === 'paypal') paymentLabel = 'PayPal';
            const cardLast4 = document.getElementById('card-number')?.value.slice(-4);
            if (selectedPayment?.value === 'cb' && cardLast4) {
                paymentLabel = `Carte bancaire **** ${cardLast4}`;
            }

            const subtotal      = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            const promoDiscount = currentPromo ? subtotal * currentPromo.discount : 0;
            const shipping      = getShippingCost();

            const orderData = {
                orderNumber: generateOrderNumber(),
                email: document.getElementById('email')?.value || '',
                delivery: {
                    name:    name.trim() || 'Client',
                    address: address     || '–',
                    mode: (function() {
                        if (!selectedDelivery) return 'Livraison standard (3-5 jours)';
                        const optEl = selectedDelivery.closest('.delivery-option');
                        const t     = optEl ? optEl.querySelector('.option-title') : null;
                        return t ? t.textContent.trim() : 'Livraison standard';
                    })(),
                    payment: paymentLabel
                },
                items:    cart.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
                shipping: shipping,
                promoCode:     currentPromo ? currentPromo.code : null,
                promoDiscount: promoDiscount,
                total:    subtotal - promoDiscount + shipping
            };

            try {
                sessionStorage.setItem('peartech-last-order', JSON.stringify(orderData));
            } catch (e) {
                console.warn('sessionStorage indisponible, la confirmation utilisera les données de démo :', e);
            }

            // ── Nettoyage du panier via l'API centralisée ──
            if (window.PearTechCart) {
                window.PearTechCart.clear(); // méthode clear() doit exister
            } else {
                storageRemove('peartech-cart');
                storageSet('peartech-cart-count', '0');
            }

            window.location.href = 'page_confirmation.html';
        }

        function showMessage(text, type) {
            let msg = document.getElementById('paiement-message');
            if (!msg) {
                msg = document.createElement('div');
                msg.id = 'paiement-message';
                msg.style.cssText = 'margin:1rem 0;padding:.9rem 1.2rem;border-radius:8px;font-size:.9rem;font-weight:500;';
                form && form.prepend(msg);
            }
            msg.textContent      = text;
            msg.style.background = type === 'error' ? 'rgba(239,68,68,.1)' : 'rgba(16,185,129,.1)';
            msg.style.border     = `1px solid ${type === 'error' ? '#ef4444' : '#10b981'}`;
            msg.style.color      = type === 'error' ? '#ef4444' : '#10b981';
            msg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        function formatPrice(price) {
            return price.toFixed(2).replace('.', ',') + ' €';
        }

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

        renderSummary();
        togglePaymentDetails();

        if (!document.getElementById('paiement-discount-style')) {
            const style = document.createElement('style');
            style.id = 'paiement-discount-style';
            style.textContent = `
                .item-old-price {
                    text-decoration: line-through;
                    color: var(--text-muted, #9ca3af);
                    font-size: 0.85em;
                    margin-right: 0.25rem;
                }
                .summary-badge {
                    display: inline-block;
                    background: rgba(239, 68, 68, 0.12);
                    color: #ef4444;
                    font-size: 0.72rem;
                    font-weight: 700;
                    padding: 0.1rem 0.4rem;
                    border-radius: 4px;
                    margin-left: 0.3rem;
                    vertical-align: middle;
                }
                .summary-savings .item-name {
                    font-weight: 600;
                }
                .summary-savings {
                    border-top: 1px dashed var(--border, #e5e7eb);
                    padding-top: 0.5rem;
                    margin-top: 0.25rem;
                }
            `;
            document.head.appendChild(style);
        }

        console.log('Paiement initialisé –', cart.length, 'article(s) dans le panier');
    });

})();