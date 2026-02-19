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
                    // flex car les cards ont flex-direction:column dans le CSS
                    card.style.display = 'flex';
                    card.style.opacity = '1';
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

        // Initialisation immédiate (cards statiques)
        filterProducts('tous');

        // MutationObserver : ré-appliquer le filtre actif quand la grille est rechargée dynamiquement
        const productsGrid = document.getElementById('products-grid');
        if (productsGrid) {
            const gridObserver = new MutationObserver(function() {
                const activeTab = document.querySelector('.tab.active');
                const currentFilter = activeTab ? activeTab.dataset.filter : 'tous';
                filterProducts(currentFilter);
            });
            gridObserver.observe(productsGrid, { childList: true });
        }
    });
})();