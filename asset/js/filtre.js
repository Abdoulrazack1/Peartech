// ============================================
// filtre.js - Filtrage par onglets (page accueil)
// ============================================
(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        const tabs = document.querySelectorAll('.tab');
        if (tabs.length === 0) return;

        function filterProducts(filter) {
            const productCards = document.querySelectorAll('.product-card');
            productCards.forEach(card => {
                const category = card.dataset.category; // apple, android, montres, tablettes
                if (filter === 'tous' || category === filter) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeIn 0.3s ease';
                } else {
                    card.style.display = 'none';
                }
            });
        }

        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                tabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                const filter = this.dataset.filter; // 'tous', 'apple', etc.
                filterProducts(filter);
                console.log('Filtre appliqué :', filter);
            });
        });

        // Initialisation
        filterProducts('tous');
    });
})();