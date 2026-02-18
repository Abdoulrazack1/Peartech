// ============================================
// contact.js - Gestion du formulaire de contact
// ============================================

(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        const contactForm = document.getElementById('contact-form');
        const formMessage = document.getElementById('form-message');

        if (!contactForm) return;

        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Récupération des champs
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const subject = document.getElementById('subject').value.trim();
            const message = document.getElementById('message').value.trim();
            const consent = document.getElementById('consent').checked;

            // Validation simple
            if (!name || !email || !subject || !message || !consent) {
                showMessage('Veuillez remplir tous les champs obligatoires et accepter le traitement des données.', 'error');
                return;
            }

            // Validation email
            if (!validateEmail(email)) {
                showMessage('Veuillez saisir une adresse email valide.', 'error');
                return;
            }

            // Simulation d'envoi (remplacer par un vrai fetch si besoin)
            // Ici on simule un délai de 1 seconde
            showMessage('Envoi en cours...', 'info');

            setTimeout(() => {
                // Succès simulé
                showMessage('Votre message a bien été envoyé. Nous vous répondrons dans les plus brefs délais.', 'success');
                contactForm.reset(); // Efface le formulaire
            }, 1000);
        });

        function showMessage(text, type) {
            if (!formMessage) return;
            formMessage.textContent = text;
            formMessage.className = `form-message ${type}`;
            // Faire défiler jusqu'au message
            formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        function validateEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        }
    });
})();