// ============================================
// carousel.js - Défilement automatique du carrousel
// Gère le changement automatique des slides toutes
// les 5 secondes via les boutons radio HTML
// ============================================

// IIFE : encapsule le code pour éviter les conflits de variables globales
(function() {
    'use strict'; // Mode strict pour détecter les erreurs potentielles

    // On attend que le HTML soit entièrement chargé avant d'exécuter
    document.addEventListener('DOMContentLoaded', function() {

        // ── Récupération des boutons radio qui contrôlent les slides ──

        // Récupère les 3 inputs radio correspondant aux 3 slides du carrousel
        const radios = [
            document.getElementById('slide1'), // Radio pour la première slide
            document.getElementById('slide2'), // Radio pour la deuxième slide
            document.getElementById('slide3')  // Radio pour la troisième slide
        ].filter(r => r !== null); // Filtre les éléments null au cas où une slide est absente

        // Sécurité : si les 3 radios ne sont pas trouvées, le carrousel n'est pas présent sur cette page
        if (radios.length !== 3) {
            console.warn('Carrousel automatique : radios introuvables'); // Avertissement dans la console
            return; // On arrête l'exécution de cette fonction
        }

        let currentIndex = 0;         // Index de la slide actuellement affichée (commence à 0)
        let interval;                  // Référence au setInterval, permettra de le stopper
        // Récupère le conteneur du carrousel pour gérer les événements hover
        const carouselContainer = document.querySelector('.carousel-container');
        const intervalTime = 5000;    // Durée entre chaque changement de slide : 5000ms = 5 secondes

        // ── Fonction de passage à la slide suivante ──────────────────

        function nextSlide() {
            // Calcule l'index suivant avec modulo pour revenir à 0 après la dernière slide
            currentIndex = (currentIndex + 1) % radios.length;
            radios[currentIndex].checked = true; // Coche le radio correspondant à la slide suivante
            // Le CSS utilise :checked pour afficher la bonne slide (pas besoin de JS supplémentaire)
        }

        // ── Démarrage du défilement automatique ───────────────────────

        function startAutoSlide() {
            if (interval) clearInterval(interval); // Stoppe l'intervalle précédent s'il existe (évite les doublons)
            interval = setInterval(nextSlide, intervalTime); // Lance l'appel répété de nextSlide toutes les 5s
        }

        // ── Arrêt du défilement automatique ───────────────────────────

        function stopAutoSlide() {
            if (interval) {           // Vérifie qu'un intervalle est bien actif
                clearInterval(interval); // Stoppe l'intervalle pour geler le carrousel
                interval = null;         // Remet la référence à null pour indiquer qu'il n'y a plus d'intervalle
            }
        }

        // ── Initialisation ─────────────────────────────────────────────

        startAutoSlide(); // Lance immédiatement le défilement automatique au chargement

        // ── Gestion du survol souris ────────────────────────────────────
        // Pause le carrousel quand la souris est dessus pour laisser le temps de lire

        if (carouselContainer) { // Vérifie que le conteneur existe
            carouselContainer.addEventListener('mouseenter', stopAutoSlide); // Pause au survol
            carouselContainer.addEventListener('mouseleave', startAutoSlide); // Reprend quand la souris part
        }

        // ── Réinitialisation du timer après interaction manuelle ────────
        // Si l'utilisateur clique sur un indicateur, on repart de 5s depuis ce moment

        // Sélectionne tous les boutons de contrôle du carrousel (points indicateurs + flèches)
        const controls = document.querySelectorAll('.indicator, .carousel-prev, .carousel-next');
        controls.forEach(control => {
            control.addEventListener('click', function() {
                stopAutoSlide();  // Arrête le timer en cours
                startAutoSlide(); // Repart avec un nouveau timer de 5s depuis ce clic
            });
        });

        // ── Synchronisation de l'index avec la slide sélectionnée ──────
        // Nécessaire si l'utilisateur clique directement sur un radio
        // (le changement de slide n'est alors pas passé par nextSlide)

        radios.forEach((radio, index) => { // Parcourt chaque radio avec son index (0, 1 ou 2)
            radio.addEventListener('change', function() {
                if (this.checked) {   // Si ce radio vient d'être coché
                    currentIndex = index; // Met à jour currentIndex pour rester synchronisé
                }
            });
        });

        console.log('Carrousel automatique activé (intervalle 5s)'); // Confirmation en console
    });
})(); // Fin de l'IIFE