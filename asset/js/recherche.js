// ============================================
// recherche.js - Recherche en temps réel
// Affiche les résultats sous la barre de recherche
// pendant la frappe, avec debounce et navigation clavier
// ============================================

(function() {
    'use strict'; // Mode strict activé

    document.addEventListener('DOMContentLoaded', function() {

        // ── Récupération des éléments de recherche ────────────────

        const searchInput   = document.getElementById('search-input');   // Champ de saisie
        const searchResults = document.getElementById('search-results'); // Zone d'affichage des résultats

        if (!searchInput || !searchResults) { // Si l'un des deux est absent de la page
            console.warn('Éléments de recherche introuvables');
            return; // Arrête : pas de recherche sur cette page
        }

        let searchTimeout; // Référence au setTimeout pour le debounce (annulation possible)

        // ── Événement de frappe avec debounce ─────────────────────
        // Le debounce évite de lancer une recherche à chaque lettre :
        // on attend 300ms après la dernière frappe

        searchInput.addEventListener('input', function() {
            const query = this.value.trim(); // Texte saisi sans espaces en début/fin

            clearTimeout(searchTimeout); // Annule le timer de la frappe précédente

            if (query.length === 0) { // Champ vide : on cache les résultats
                searchResults.classList.remove('active'); // Cache la zone de résultats
                return;
            }

            // Lance la recherche 300ms après la dernière frappe
            searchTimeout = setTimeout(function() {
                performSearch(query); // Lance la recherche avec le terme actuel
            }, 300);
        });

        // ── Fonction de recherche ──────────────────────────────────

        function performSearch(query) {
            if (!window.PearTechDB) { // Base de données pas encore chargée
                console.warn('PearTechDB non chargé, recherche impossible');
                searchResults.innerHTML = '<div class="search-no-results">Chargement en cours...</div>';
                searchResults.classList.add('active'); // Affiche quand même le message
                return;
            }
            const results = PearTechDB.search(query); // Délègue la logique de recherche à data.js
            displaySearchResults(results); // Affiche les résultats retournés
        }

        // ── Affichage des résultats ────────────────────────────────

        function displaySearchResults(results) {
            if (results.length === 0) { // Aucun produit trouvé
                searchResults.innerHTML = '<div class="search-no-results">Aucun résultat trouvé</div>';
                searchResults.classList.add('active');
                return;
            }

            let html = ''; // Construit le HTML des résultats
            results.forEach(product => {
                // Extrait les 2 premières spécifications pour l'aperçu
                const specsPreview = Object.values(product.specs).slice(0, 2).join(' - ');
                html += `
                    <div class="search-result-item" data-id="${product.id}">
                        <div class="search-result-name">${product.name}</div>
                        <div class="search-result-specs">${specsPreview}</div>
                    </div>
                `;
            });

            searchResults.innerHTML = html;          // Injecte les résultats
            searchResults.classList.add('active');   // Affiche la zone de résultats
            attachSearchResultEvents();              // Attache les clics sur les résultats
        }

        // ── Événements sur les résultats de recherche ─────────────

        function attachSearchResultEvents() {
            const resultItems = document.querySelectorAll('.search-result-item');
            resultItems.forEach(item => {
                item.addEventListener('click', function() {
                    const productId = this.dataset.id; // Récupère l'ID du produit cliqué
                    window.location.href = `page_produit.html?id=${productId}`; // Navigue vers la fiche
                });
            });
        }

        // ── Fermeture en cliquant ailleurs ────────────────────────

        document.addEventListener('click', function(e) {
            // Ferme si le clic n'est ni dans le champ ni dans les résultats
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.classList.remove('active'); // Cache les résultats
            }
        });

        // ── Navigation clavier ────────────────────────────────────

        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                // Entrée : navigue vers le premier résultat
                const firstResult = searchResults.querySelector('.search-result-item');
                if (firstResult) {
                    firstResult.click(); // Déclenche la navigation via le click handler
                }
            } else if (e.key === 'Escape') {
                searchResults.classList.remove('active'); // Cache les résultats
                searchInput.blur(); // Enlève le focus du champ
            }
        });

        // Log du nombre de produits indexés pour la recherche
        const productCount = window.PearTechDB ? PearTechDB.products.length : 0;
        console.log('Recherche initialisée avec', productCount, 'produits');
    });
})(); // Fin de l'IIFE