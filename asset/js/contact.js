// ============================================
// contact.js - Formulaire de contact
// Gère la validation des champs et l'envoi simulé
// du message de contact
// ============================================

(function() {
    'use strict'; // Mode strict activé

    document.addEventListener('DOMContentLoaded', function() {

        // ── Récupération des éléments du formulaire ───────────────

        const contactForm = document.getElementById('contact-form'); // Le formulaire HTML
        const formMessage = document.getElementById('form-message'); // Zone d'affichage des messages de retour

        if (!contactForm) return; // Si le formulaire n'existe pas sur cette page, on arrête

        // ── Gestion de la soumission du formulaire ─────────────────

        contactForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Empêche le rechargement de page lors de la soumission

            // ── Récupération des valeurs des champs ────────────────

            const name    = document.getElementById('name').value.trim();    // Nom complet (espaces retirés)
            const email   = document.getElementById('email').value.trim();   // Adresse email
            const subject = document.getElementById('subject').value.trim(); // Sujet du message
            const message = document.getElementById('message').value.trim(); // Corps du message
            const consent = document.getElementById('consent').checked;      // Checkbox RGPD cochée ou non

            // ── Validation : tous les champs doivent être remplis ──

            if (!name || !email || !subject || !message || !consent) {
                // Au moins un champ est vide ou la checkbox n'est pas cochée
                showMessage(
                    'Veuillez remplir tous les champs obligatoires et accepter le traitement des données.',
                    'error' // Type 'error' pour afficher en rouge
                );
                return; // Arrête la soumission
            }

            // ── Validation du format de l'email ───────────────────

            if (!validateEmail(email)) { // Vérifie que l'email a un format valide
                showMessage('Veuillez saisir une adresse email valide.', 'error');
                return;
            }

            // ── Envoi réel vers l'API back-end ─────────────────────

            showMessage('Envoi en cours...', 'info'); // Message pendant l'envoi

            if (!window.PearTechAPI) {
                showMessage('Service indisponible. Réessayez plus tard.', 'error');
                return;
            }

            PearTechAPI.contact({ nom: name, email: email, sujet: subject, message: message })
                .then(() => {
                    showMessage(
                        'Votre message a bien été envoyé. Nous vous répondrons dans les plus brefs délais.',
                        'success'
                    );
                    contactForm.reset(); // Vide le formulaire après succès
                })
                .catch(err => {
                    showMessage(err.message || 'Échec de l\'envoi du message.', 'error');
                });
        });

        // ── Fonction d'affichage des messages de retour ───────────

        function showMessage(text, type) {
            if (!formMessage) return; // Sécurité : ne fait rien si l'élément n'existe pas
            formMessage.textContent = text; // Définit le texte du message
            formMessage.className = `form-message ${type}`; // Ajoute la classe CSS (success, error, info)
            // Fait défiler la page jusqu'au message pour que l'utilisateur le voie
            formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        // ── Fonction de validation de l'email ─────────────────────

        function validateEmail(email) {
            // Expression régulière : vérifie la présence de @ et d'un domaine valide
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email); // Retourne true si l'email est valide, false sinon
        }
    });
})(); // Fin de l'IIFE