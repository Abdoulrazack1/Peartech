// ============================================
// search.js - Recherche en temps réel avec la base de données
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

        searchInput.addEventListener('input', function() {
            const query = this.value.trim();

            clearTimeout(searchTimeout);

            if (query.length === 0) {
                searchResults.classList.remove('active');
                return;
            }

            searchTimeout = setTimeout(() => {
                const results = NovaComputeDB.search(query); // utilise la DB
                displaySearchResults(results);
            }, 300);
        });

        function displaySearchResults(results) {
            if (results.length === 0) {
                searchResults.innerHTML = '<div class="search-no-results">Aucun résultat trouvé</div>';
                searchResults.classList.add('active');
                return;
            }

            let html = '';
            results.forEach(product => {
                html += `
                    <div class="search-result-item" data-id="${product.id}">
                        <div class="search-result-name">${product.name}</div>
                        <div class="search-result-specs">${Object.values(product.specs).slice(0,2).join(' - ')}</div>
                    </div>
                `;
            });

            searchResults.innerHTML = html;
            searchResults.classList.add('active');
            attachSearchResultEvents();
        }

        function attachSearchResultEvents() {
            document.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', function() {
                    const productId = this.dataset.id;
                    const productName = this.querySelector('.search-result-name').textContent;
                    console.log('Produit sélectionné:', productId, productName);
                    // Vous pouvez rediriger vers une page produit
                    // window.location.href = `/product.html?id=${productId}`;
                    searchResults.classList.remove('active');
                    searchInput.value = '';
                });
            });
        }

        // Fermer les résultats en cliquant ailleurs
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.classList.remove('active');
            }
        });

        // Touche Entrée / Échap
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const firstResult = searchResults.querySelector('.search-result-item');
                if (firstResult) firstResult.click();
            } else if (e.key === 'Escape') {
                searchResults.classList.remove('active');
                searchInput.blur();
            }
        });

        console.log('Recherche initialisée avec', NovaComputeDB.products.length, 'produits');
    });
})();