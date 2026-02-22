// ============================================
// filtre.js - Filtrage par onglets sur la page d'accueil
// Affiche/cache les product-cards selon la catégorie
// sélectionnée via les onglets (tabs)
// ============================================

(function() {
    'use strict'; // Mode strict activé

    document.addEventListener('DOMContentLoaded', function() {

        const tabs = document.querySelectorAll('.tab'); // Tous les onglets de filtre (Tous, Apple, Android...)
        if (tabs.length === 0) return; // Pas d'onglets sur cette page : on arrête

        // ── Fonction de filtrage des cards ────────────────────────

        function filterProducts(filter) {
            const productCards = document.querySelectorAll('.product-card'); // Toutes les cards de la grille
            productCards.forEach(card => {
                const category = card.dataset.category; // Catégorie de la card (ex: "apple", "android")
                if (filter === 'tous' || category === filter) {
                    // L'onglet "tous" accepte toutes les catégories
                    card.style.display = 'flex'; // Réaffiche la card (flex car les cards utilisent flex)
                    card.style.opacity = '1';    // Assure la visibilité complète
                } else {
                    card.style.display = 'none'; // Cache les cards qui ne correspondent pas au filtre
                }
            });
        }

        // ── Événements sur les onglets ────────────────────────────

        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                tabs.forEach(t => t.classList.remove('active')); // Désactive tous les onglets
                this.classList.add('active');                    // Active l'onglet cliqué
                const filter = this.dataset.filter;             // Récupère le filtre ("tous", "apple"...)
                filterProducts(filter);                         // Applique le filtre
                console.log('Filtre appliqué :', filter);
            });
        });

        filterProducts('tous'); // Affiche toutes les cards au chargement initial

        // ── MutationObserver : re-applique le filtre actif si la grille est rechargée ──
        // Nécessaire car product_grid.js peut injecter des cards après le chargement

        const productsGrid = document.getElementById('products-grid');
        if (productsGrid) {
            const gridObserver = new MutationObserver(function() {
                const activeTab = document.querySelector('.tab.active'); // Onglet actuellement actif
                const currentFilter = activeTab ? activeTab.dataset.filter : 'tous'; // Filtre courant
                filterProducts(currentFilter); // Re-applique le filtre sur les nouvelles cards
            });
            gridObserver.observe(productsGrid, { childList: true }); // Surveille les enfants directs de la grille
        }
    });
})();