// ============================================
// carousel.js - Défilement automatique du carrousel
// Gère le changement automatique des slides toutes
// les 5 secondes via les boutons radio HTML
// ============================================

(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {

        const radios = [
            document.getElementById('slide1'),
            document.getElementById('slide2'),
            document.getElementById('slide3')
        ].filter(r => r !== null);

        if (radios.length !== 3) {
            console.warn('Carrousel automatique : radios introuvables');
            return;
        }

        let currentIndex = 0;
        let interval;
        const carouselContainer = document.querySelector('.carousel-container');
        const intervalTime = 5000;

        function nextSlide() {
            currentIndex = (currentIndex + 1) % radios.length;
            radios[currentIndex].checked = true;
        }

        function startAutoSlide() {
            if (interval) clearInterval(interval);
            interval = setInterval(nextSlide, intervalTime);
        }

        function stopAutoSlide() {
            if (interval) {
                clearInterval(interval);
                interval = null;
            }
        }

        startAutoSlide();

        if (carouselContainer) {
            carouselContainer.addEventListener('mouseenter', stopAutoSlide);
            carouselContainer.addEventListener('mouseleave', startAutoSlide);
        }

        const controls = document.querySelectorAll('.indicator, .carousel-prev, .carousel-next');
        controls.forEach(control => {
            control.addEventListener('click', function() {
                stopAutoSlide();
                startAutoSlide();
            });
        });

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