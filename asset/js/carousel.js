// ============================================
// carousel.js - Défilement automatique du carrousel
// Gère le changement automatique des slides toutes
// les 5 secondes via les boutons radio HTML
// ============================================

// Utilisation d'une IIFE (Immediately Invoked Function Expression) pour isoler le code
// et éviter les conflits de variables avec d'autres scripts
(function() {
    'use strict'; // Active le mode strict pour une meilleure sécurité et optimisation

    // Attend que le DOM soit complètement chargé avant d'exécuter le code
    document.addEventListener('DOMContentLoaded', function() {

        // Récupère les trois boutons radio du carrousel par leur ID
        // Utilise un tableau et filtre les éventuels null si un élément est manquant
        const radios = [
            document.getElementById('slide1'), // Premier bouton radio
            document.getElementById('slide2'), // Deuxième bouton radio
            document.getElementById('slide3')  // Troisième bouton radio
        ].filter(r => r !== null); // Garde uniquement les éléments existants (supprime les null)

        // Vérifie qu'on a bien trois radios (si le HTML est correct)
        if (radios.length !== 3) {
            // Affiche un avertissement dans la console si les radios sont introuvables
            console.warn('Carrousel automatique : radios introuvables');
            return; // Arrête l'exécution du script
        }

        let currentIndex = 0; // Index de la slide actuellement affichée (commence à 0)
        let interval; // Variable pour stocker l'identifiant du setInterval (pour pouvoir l'arrêter)
        const carouselContainer = document.querySelector('.carousel-container'); // Récupère le conteneur du carrousel
        const intervalTime = 5000; // Durée entre chaque slide (5000 ms = 5 secondes)

        /**
         * Passe à la slide suivante
         */
        function nextSlide() {
            // Calcule l'index suivant : (index actuel + 1) modulo le nombre total de slides
            // Le modulo permet de revenir à 0 après la dernière slide
            currentIndex = (currentIndex + 1) % radios.length;
            // Coche le bouton radio correspondant à la nouvelle slide
            // Ceci déclenche automatiquement le changement d'image via le CSS
            radios[currentIndex].checked = true;
        }

        /**
         * Démarre le défilement automatique
         */
        function startAutoSlide() {
            // Si un intervalle existe déjà, on le nettoie pour éviter les doublons
            if (interval) clearInterval(interval);
            // Crée un nouvel intervalle qui appelle nextSlide toutes les intervalTime ms
            interval = setInterval(nextSlide, intervalTime);
        }

        /**
         * Arrête le défilement automatique
         */
        function stopAutoSlide() {
            // Si un intervalle existe, on l'arrête et on remet la variable à null
            if (interval) {
                clearInterval(interval);
                interval = null; // Indique qu'il n'y a plus d'intervalle actif
            }
        }

        // Lance le défilement automatique au chargement de la page
        startAutoSlide();

        // Si le conteneur du carrousel existe, on ajoute des écouteurs pour la pause au survol
        if (carouselContainer) {
            // Quand la souris entre dans le carrousel, on arrête le défilement
            carouselContainer.addEventListener('mouseenter', stopAutoSlide);
            // Quand la souris quitte le carrousel, on redémarre le défilement
            carouselContainer.addEventListener('mouseleave', startAutoSlide);
        }

        // Sélectionne tous les contrôles manuels : indicateurs (points), flèches précédent/suivant
        const controls = document.querySelectorAll('.indicator, .carousel-prev, .carousel-next');
        // Pour chaque contrôle, on ajoute un écouteur de clic
        controls.forEach(control => {
            control.addEventListener('click', function() {
                // Lors d'un clic manuel, on réinitialise le minuteur :
                // on arrête l'ancien intervalle et on en redémarre un nouveau
                stopAutoSlide();
                startAutoSlide();
            });
        });

        // Pour chaque bouton radio, on surveille le changement d'état (lorsque l'utilisateur clique sur un indicateur)
        radios.forEach((radio, index) => {
            radio.addEventListener('change', function() {
                // Si ce bouton radio est maintenant coché, on met à jour l'index courant
                if (this.checked) {
                    currentIndex = index; // L'index devient celui de la slide affichée
                }
            });
        });

        // Message de confirmation dans la console pour le débogage
        console.log('Carrousel automatique activé (intervalle 5s)');
    });
})();