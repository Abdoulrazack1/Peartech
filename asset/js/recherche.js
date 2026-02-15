// ============================================
// recherche.js - Système de recherche en temps réel
// Utilise la base de données NovaComputeDB
// ============================================

(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        const searchInput = document.getElementById('search-input');
        const searchResults = document.getElementById('search-results');

        if (!searchInput || !searchResults) {
            console.warn('Éléments de recherche introuvables');
            return;
        }

        let searchTimeout;

        // ============================================
        // ÉVÉNEMENT INPUT (avec debounce)
        // ============================================
        searchInput.addEventListener('input', function() {
            const query = this.value.trim();

            // Effacer le timeout précédent
            clearTimeout(searchTimeout);

            // Si la recherche est vide, cacher les résultats
            if (query.length === 0) {
                searchResults.classList.remove('active');
                return;
            }

            // Attendre 300ms avant de lancer la recherche (debounce)
            searchTimeout = setTimeout(function() {
                performSearch(query);
            }, 300);
        });

        // ============================================
        // FONCTION DE RECHERCHE
        // ============================================
        function performSearch(query) {
            // Utiliser la fonction de recherche de la base de données
            const results = NovaComputeDB.search(query);
            displaySearchResults(results);
        }

        // ============================================
        // AFFICHER LES RÉSULTATS
        // ============================================
        function displaySearchResults(results) {
            if (results.length === 0) {
                searchResults.innerHTML = '<div class="search-no-results">Aucun résultat trouvé</div>';
                searchResults.classList.add('active');
                return;
            }

            let html = '';
            results.forEach(product => {
                // Construire un aperçu rapide des spécifications (2 premiers éléments)
                const specsPreview = Object.values(product.specs).slice(0, 2).join(' - ');
                html += `
                    <div class="search-result-item" data-id="${product.id}">
                        <div class="search-result-name">${product.name}</div>
                        <div class="search-result-specs">${specsPreview}</div>
                    </div>
                `;
            });

            searchResults.innerHTML = html;
            searchResults.classList.add('active');
            attachSearchResultEvents();
        }

        // ============================================
        // ÉVÉNEMENTS SUR LES RÉSULTATS
        // ============================================
        function attachSearchResultEvents() {
            const resultItems = document.querySelectorAll('.search-result-item');
            resultItems.forEach(item => {
                item.addEventListener('click', function() {
                    const productId = this.dataset.id;
                    // Redirection vers la page produit
                    window.location.href = `page_produit.html?id=${productId}`;
                });
            });
        }

        // ============================================
        // FERMER LES RÉSULTATS (clic ailleurs)
        // ============================================
        document.addEventListener('click', function(e) {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.classList.remove('active');
            }
        });

        // ============================================
        // RECHERCHE AU CLAVIER (Enter / Escape)
        // ============================================
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                const firstResult = searchResults.querySelector('.search-result-item');
                if (firstResult) {
                    firstResult.click(); // déclenche la redirection
                }
            } else if (e.key === 'Escape') {
                searchResults.classList.remove('active');
                searchInput.blur();
            }
        });

        console.log('Recherche initialisée avec', NovaComputeDB.products.length, 'produits');
    });
})();