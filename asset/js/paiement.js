// ============================================
// paiement.js - Page de finalisation de commande
// Gère : résumé du panier, options de livraison,
// options de paiement, validation du formulaire
// et redirection vers la confirmation
// ============================================

(function () {
    'use strict'; // Mode strict activé

    document.addEventListener('DOMContentLoaded', function () {

        // ── Chargement du panier depuis localStorage ──────────────

        const CART_KEY = 'peartech-cart'; // Clé de stockage du panier
        let cart = JSON.parse(localStorage.getItem(CART_KEY)) || []; // Tableau des articles ou vide

        // ── Récupération des éléments du DOM ──────────────────────

        const summaryItemsEl  = document.getElementById('summary-items');   // Zone des articles dans le récap
        const summaryTotalEl  = document.getElementById('subtotal');         // Sous-total
        const summaryShipEl   = document.getElementById('delivery-cost');    // Frais de livraison
        const summaryGrandEl  = document.getElementById('total');            // Total TTC
        const form            = document.querySelector('.checkout-form');    // Formulaire principal
        const confirmBtn      = document.getElementById('confirm-order');    // Bouton "Confirmer la commande"
        const deliveryOptions = document.querySelectorAll('input[name="delivery"]'); // Radios de livraison
        const paymentOptions  = document.querySelectorAll('input[name="payment"]');  // Radios de paiement
        const paymentDetails  = document.getElementById('cb-fields');        // Champs carte bancaire

        // ── Affichage du résumé de commande ───────────────────────

        function renderSummary() {
            if (!summaryItemsEl) return; // Élément absent : pas de récap à afficher

            if (cart.length === 0) { // Panier vide
                summaryItemsEl.innerHTML = '<p class="summary-empty">Panier vide.</p>';
                return;
            }

            // Calcule le sous-total : somme (prix × quantité) de tous les articles
            const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            const shipping = getShippingCost(); // Récupère le coût de livraison selon l'option choisie
            const total    = subtotal + shipping; // Total = sous-total + livraison

            // Génère le HTML de chaque article : "Qté × Nom" + prix total de la ligne
            summaryItemsEl.innerHTML = cart.map(item => `
                <div class="summary-item">
                    <span class="item-name">${item.quantity}× ${item.name}</span>
                    <span class="item-price">${formatPrice(item.price * item.quantity)}</span>
                </div>
            `).join(''); // Concatène toutes les lignes sans virgule entre elles

            // Met à jour les totaux dans le DOM
            if (summaryTotalEl) summaryTotalEl.textContent = formatPrice(subtotal);   // Sous-total
            if (summaryShipEl)  summaryShipEl.textContent  = shipping === 0 ? 'Gratuit' : formatPrice(shipping); // Livraison
            if (summaryGrandEl) summaryGrandEl.textContent = formatPrice(total);      // Total TTC
        }

        // ── Calcul du coût de livraison ───────────────────────────

        function getShippingCost() {
            const selected = document.querySelector('input[name="delivery"]:checked'); // Option cochée
            if (!selected) return 5.90; // Pas d'option cochée : valeur par défaut

            // Récupère le prix depuis le span .option-price dans le label de l'option
            const optionEl   = selected.closest('.delivery-option');
            const priceSpan  = optionEl ? optionEl.querySelector('.option-price') : null;
            if (priceSpan) {
                const txt = priceSpan.textContent.replace(/[^\d,]/g, '').replace(',', '.'); // Nettoie "5,90 €" → "5.90"
                const val = parseFloat(txt); // Convertit en nombre
                return isNaN(val) ? 0 : val; // Retourne 0 si la conversion échoue
            }
            // Fallback selon la valeur du radio si le span n'est pas trouvé
            if (selected.value === 'standard') return 5.90;
            if (selected.value === 'express')  return 12.90;
            return 0; // Point relais = gratuit
        }

        // ── Affichage des champs carte bancaire ───────────────────

        function togglePaymentDetails() {
            if (!paymentDetails) return; // Élément absent : on ignore
            const selected = document.querySelector('input[name="payment"]:checked'); // Option cochée
            const isCarte  = selected && selected.value === 'cb'; // Vérifie si "carte bancaire" est sélectionnée
            // Affiche les champs carte seulement si l'option CB est sélectionnée
            paymentDetails.style.display = isCarte ? 'block' : 'none';
        }

        // ── Validation du formulaire ───────────────────────────────

        function validateForm() {
            // Sélectionne tous les champs obligatoires du formulaire
            const required = form
                ? form.querySelectorAll('input[required], select[required], input[aria-required="true"]')
                : document.querySelectorAll('input[required], select[required]');
            let valid = true; // Présuppose que le formulaire est valide

            required.forEach(field => {
                // Vérifie si le champ est vide (comportement différent selon le type)
                const isEmpty = field.type === 'checkbox'
                    ? !field.checked        // Checkbox : vérifie si coché
                    : !field.value.trim();  // Autre : vérifie si vide après trim

                if (isEmpty) {
                    field.style.borderColor = '#ef4444'; // Bordure rouge = champ manquant
                    valid = false; // Le formulaire n'est pas valide
                } else {
                    field.style.borderColor = ''; // Réinitialise la bordure si rempli
                }
            });

            return valid; // Retourne true si tous les champs sont remplis
        }

        // ── Soumission et création de la commande ─────────────────

        function submitOrder() {
            if (!validateForm()) { // Valide d'abord le formulaire
                showMessage('Veuillez remplir tous les champs obligatoires.', 'error');
                return;
            }

            if (cart.length === 0) { // Panier vide : impossible de commander
                showMessage('Votre panier est vide.', 'error');
                return;
            }

            // ── Récupération des informations de livraison et paiement ──

            const selectedDelivery = document.querySelector('input[name="delivery"]:checked');
            const selectedPayment  = document.querySelector('input[name="payment"]:checked');

            // Construit le nom complet du destinataire
            const name = (document.getElementById('prenom')?.value || '') + ' '
                       + (document.getElementById('nom')?.value    || '');

            // Construit l'adresse complète en filtrant les champs vides
            const address = [
                document.getElementById('adresse')?.value,
                document.getElementById('ville')?.value,
                document.getElementById('code-postal')?.value,
                document.getElementById('country')?.value || 'France'
            ].filter(Boolean).join(', '); // Joint les parties non vides avec ", "

            // ── Détermine le label du moyen de paiement ────────────

            let paymentLabel = 'Carte bancaire'; // Valeur par défaut
            if (selectedPayment?.value === 'paypal') paymentLabel = 'PayPal'; // Override si PayPal
            const cardLast4 = document.getElementById('card-number')?.value.slice(-4); // 4 derniers chiffres
            if (selectedPayment?.value === 'cb' && cardLast4) {
                paymentLabel = `Carte bancaire **** ${cardLast4}`; // Format "CB **** 4242"
            }

            const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            const shipping = getShippingCost();

            // ── Construction de l'objet commande ──────────────────

            const orderData = {
                orderNumber: 'CMD-' + Math.floor(Math.random() * 1000000), // Numéro aléatoire
                email: document.getElementById('email')?.value || '',       // Email du client
                delivery: {
                    name:    name.trim() || 'Client',    // Nom du destinataire
                    address: address     || '–',         // Adresse ou tiret si vide
                    // Récupère le titre de l'option de livraison choisie
                    mode: (function() {
                        if (!selectedDelivery) return 'Livraison standard (3-5 jours)';
                        const optEl = selectedDelivery.closest('.delivery-option');
                        const t     = optEl ? optEl.querySelector('.option-title') : null;
                        return t ? t.textContent.trim() : 'Livraison standard';
                    })(),
                    payment: paymentLabel // Résumé du moyen de paiement
                },
                items:    cart.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })), // Articles
                shipping: shipping,          // Frais de livraison
                total:    subtotal + shipping // Total TTC
            };

            // ── Stockage pour la page de confirmation ─────────────
            // sessionStorage : données accessibles uniquement pendant la session
            sessionStorage.setItem('peartech-last-order', JSON.stringify(orderData));

            // ── Nettoyage du panier ────────────────────────────────

            localStorage.removeItem(CART_KEY);              // Supprime le panier
            localStorage.setItem('peartech-cart-count', '0'); // Remet le compteur à zéro

            window.location.href = 'page_confirmation.html'; // Redirige vers la page de confirmation
        }

        // ── Notification inline en cas d'erreur ───────────────────

        function showMessage(text, type) {
            let msg = document.getElementById('paiement-message'); // Cherche un message existant
            if (!msg) { // Crée le message s'il n'existe pas encore
                msg = document.createElement('div');
                msg.id = 'paiement-message';
                msg.style.cssText = 'margin:1rem 0;padding:.9rem 1.2rem;border-radius:8px;font-size:.9rem;font-weight:500;';
                form && form.prepend(msg); // Insère au début du formulaire
            }
            msg.textContent = text; // Texte du message
            // Style selon le type (error = rouge, autre = vert)
            msg.style.background = type === 'error' ? 'rgba(239,68,68,.1)' : 'rgba(16,185,129,.1)';
            msg.style.border     = `1px solid ${type === 'error' ? '#ef4444' : '#10b981'}`;
            msg.style.color      = type === 'error' ? '#ef4444' : '#10b981';
            msg.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); // Scroll jusqu'au message
        }

        // ── Formateur de prix ──────────────────────────────────────

        function formatPrice(price) {
            return price.toFixed(2).replace('.', ',') + ' €'; // Ex: 1234.5 → "1234,50 €"
        }

        // ── Événements sur les options de livraison ───────────────

        deliveryOptions.forEach(opt => {
            opt.addEventListener('change', function () {
                // Réinitialise le style de toutes les options
                document.querySelectorAll('.delivery-option').forEach(el => {
                    el.style.borderColor = '';
                    el.style.background  = '';
                });
                // Met en évidence l'option sélectionnée
                const parent = this.closest('.delivery-option');
                if (parent) {
                    parent.style.borderColor = 'var(--primary)';             // Bordure bleue
                    parent.style.background  = 'rgba(59,130,246,.05)';       // Fond légèrement bleu
                }
                renderSummary(); // Recalcule les totaux car le prix de livraison a changé
            });
        });

        // ── Événements sur les options de paiement ────────────────

        paymentOptions.forEach(opt => {
            opt.addEventListener('change', togglePaymentDetails); // Affiche/cache les champs CB
        });

        // ── Clic sur le bouton de confirmation ────────────────────

        if (confirmBtn) {
            confirmBtn.addEventListener('click', function (e) {
                e.preventDefault(); // Empêche le rechargement de page
                submitOrder();      // Lance la création de commande
            });
        }

        // ── Initialisation ─────────────────────────────────────────

        renderSummary();        // Affiche le résumé dès le chargement
        togglePaymentDetails(); // Initialise l'affichage des champs de paiement

        console.log('Paiement initialisé –', cart.length, 'article(s) dans le panier');
    });

})(); // Fin de l'IIFE