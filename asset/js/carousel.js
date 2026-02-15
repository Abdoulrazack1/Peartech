// ============================================
// carousel.js - Défilement automatique du carrousel
// Compatible avec le carrousel à radios de NovaCompute
// ============================================

(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        // Récupérer les trois radios
        const radios = [
            document.getElementById('slide1'),
            document.getElementById('slide2'),
            document.getElementById('slide3')
        ].filter(r => r !== null); // ignorer les éléments manquants

        if (radios.length !== 3) {
            console.warn('Carrousel automatique : radios introuvables');
            return;
        }

        let currentIndex = 0;
        let interval;
        const carouselContainer = document.querySelector('.carousel-container');
        const intervalTime = 5000; // 5 secondes

        // Passer à la slide suivante
        function nextSlide() {
            currentIndex = (currentIndex + 1) % radios.length;
            radios[currentIndex].checked = true;
        }

        // Démarrer le défilement automatique
        function startAutoSlide() {
            if (interval) clearInterval(interval);
            interval = setInterval(nextSlide, intervalTime);
        }

        // Arrêter le défilement automatique
        function stopAutoSlide() {
            if (interval) {
                clearInterval(interval);
                interval = null;
            }
        }

        // Initialisation
        startAutoSlide();

        // Arrêt au survol
        if (carouselContainer) {
            carouselContainer.addEventListener('mouseenter', stopAutoSlide);
            carouselContainer.addEventListener('mouseleave', startAutoSlide);
        }

        // Réinitialiser le timer après une interaction manuelle
        const controls = document.querySelectorAll('.indicator, .carousel-prev, .carousel-next');
        controls.forEach(control => {
            control.addEventListener('click', function() {
                stopAutoSlide();
                startAutoSlide();
            });
        });

        // Synchroniser l'index courant avec la radio sélectionnée
        radios.forEach((radio, index) => {
            radio.addEventListener('change', function() {
                if (this.checked) {
                    currentIndex = index;
                }
            });
        });

        console.log('Carrousel automatique activé (intervalle 5s)');
    });
})();