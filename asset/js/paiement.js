// ============================================
// paiement.js - Gestion de la page de paiement
// ============================================

(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        // Données simulées du panier
        const cartItems = [
            { name: 'iPhone 15 Pro', price: 1229.00 },
            { name: 'Apple Watch Series 9', price: 449.00 }
        ];

        // Tarifs de livraison
        const deliveryPrices = {
            standard: 5.90,
            express: 12.90,
            relais: 0
        };

        // Éléments DOM
        const deliveryRadios = document.querySelectorAll('input[name="delivery"]');
        const paymentRadios = document.querySelectorAll('input[name="payment"]');
        const cbFields = document.getElementById('cb-fields');
        const subtotalSpan = document.getElementById('subtotal');
        const deliveryCostSpan = document.getElementById('delivery-cost');
        const totalSpan = document.getElementById('total');
        const confirmBtn = document.getElementById('confirm-order');
        const acceptCgv = document.getElementById('accept-cgv');
        const summaryItems = document.getElementById('summary-items');

        let currentDelivery = 'standard';
        let currentPayment = 'cb';

        // Initialiser le récapitulatif
        function renderSummary() {
            const subtotal = cartItems.reduce((acc, item) => acc + item.price, 0);
            const delivery = deliveryPrices[currentDelivery];
            const total = subtotal + delivery;

            subtotalSpan.textContent = formatPrice(subtotal);
            deliveryCostSpan.textContent = formatPrice(delivery) + (delivery === 0 ? ' (gratuit)' : '');
            totalSpan.textContent = formatPrice(total);
        }

        // Formater les prix
        function formatPrice(price) {
            return price.toFixed(2).replace('.', ',') + ' €';
        }

        // Afficher/masquer les champs CB
        function toggleCbFields() {
            if (currentPayment === 'cb') {
                cbFields.style.display = 'block';
            } else {
                cbFields.style.display = 'none';
            }
        }

        // Gestionnaires d'événements
        deliveryRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.checked) {
                    currentDelivery = this.value;
                    renderSummary();
                }
            });
        });

        paymentRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.checked) {
                    currentPayment = this.value;
                    toggleCbFields();
                }
            });
        });

        // Validation du formulaire de commande
        function validateForm() {
            // Vérifier que les champs obligatoires sont remplis
            const requiredFields = [
                'prenom', 'nom', 'adresse', 'code-postal', 'ville', 'pays', 'telephone', 'email'
            ];
            for (let id of requiredFields) {
                const field = document.getElementById(id);
                if (!field.value.trim()) {
                    showMessage('Veuillez remplir tous les champs obligatoires', 'error');
                    return false;
                }
            }

            // Validation email
            const email = document.getElementById('email').value.trim();
            if (!validateEmail(email)) {
                showMessage('Email invalide', 'error');
                return false;
            }

            // Validation téléphone (simplifiée)
            const tel = document.getElementById('telephone').value.trim();
            if (!/^\d{10,}$/.test(tel.replace(/\s/g, ''))) {
                showMessage('Numéro de téléphone invalide', 'error');
                return false;
            }

            // Si paiement par carte, vérifier les champs
            if (currentPayment === 'cb') {
                const cardNumber = document.getElementById('card-number').value.trim();
                const cardName = document.getElementById('card-name').value.trim();
                const cardExpiry = document.getElementById('card-expiry').value.trim();
                const cardCvv = document.getElementById('card-cvv').value.trim();

                if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
                    showMessage('Veuillez remplir tous les champs de carte bancaire', 'error');
                    return false;
                }
                if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
                    showMessage('Numéro de carte invalide', 'error');
                    return false;
                }
                if (!/^\d{3}$/.test(cardCvv)) {
                    showMessage('CVV invalide (3 chiffres)', 'error');
                    return false;
                }
            }

            // Vérifier acceptation CGV
            if (!acceptCgv.checked) {
                showMessage('Vous devez accepter les conditions générales de vente', 'error');
                return false;
            }

            return true;
        }

        // Validation email
        function validateEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        }

        // Afficher un message
        function showMessage(text, type) {
            // Supprimer les anciens messages
            const oldMsg = document.querySelector('.message-success, .message-error');
            if (oldMsg) oldMsg.remove();

            const message = document.createElement('div');
            message.className = type === 'success' ? 'message-success' : 'message-error';
            message.textContent = text;

            // Insérer avant le formulaire
            const form = document.querySelector('.checkout-form');
            form.insertBefore(message, form.firstChild);

            // Faire défiler jusqu'au message
            message.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Supprimer après 5 secondes
            setTimeout(() => {
                message.remove();
            }, 5000);
        }

        // Confirmation de commande
        confirmBtn.addEventListener('click', function() {
            if (validateForm()) {
                // Simuler un traitement de paiement
                showMessage('Paiement accepté ! Votre commande a été enregistrée. Vous allez être redirigé.', 'success');
                setTimeout(() => {
                    window.location.href = 'page_confirmation.html';
                }, 3000);
            }
        });

        // Initialisation
        renderSummary();
        toggleCbFields();
    });
})();