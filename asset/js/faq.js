// ============================================
// faq.js - Gestion de la FAQ (accordéon, recherche, filtres)
// ============================================

(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        const faqItems = document.querySelectorAll('.faq-item');
        const searchInput = document.getElementById('faq-search-input');
        const categoryBtns = document.querySelectorAll('.category-btn');
        const faqList = document.getElementById('faq-list');

        // === ACCORDÉON ===
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            question.addEventListener('click', () => {
                // Fermer les autres ? (optionnel, on peut laisser plusieurs ouverts)
                // Pour une expérience plus propre, on ferme les autres
                // Décommentez si vous voulez un seul ouvert à la fois
                /*
                if (!item.classList.contains('active')) {
                    faqItems.forEach(other => {
                        if (other !== item) other.classList.remove('active');
                    });
                }
                */
                item.classList.toggle('active');
            });
        });

        // === RECHERCHE ===
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase().trim();
                filterFaq(searchTerm, getActiveCategory());
            });
        }

        // === FILTRES PAR CATÉGORIE ===
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                categoryBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const category = this.dataset.category;
                filterFaq(getSearchTerm(), category);
            });
        });

        // Fonction pour récupérer le terme de recherche
        function getSearchTerm() {
            return searchInput ? searchInput.value.toLowerCase().trim() : '';
        }

        // Fonction pour récupérer la catégorie active
        function getActiveCategory() {
            const activeBtn = document.querySelector('.category-btn.active');
            return activeBtn ? activeBtn.dataset.category : 'all';
        }

        // Fonction de filtrage combiné
        function filterFaq(searchTerm, category) {
            let anyVisible = false;
            faqItems.forEach(item => {
                const questionText = item.querySelector('.faq-question-text').textContent.toLowerCase();
                const answerText = item.querySelector('.faq-answer p').textContent.toLowerCase();
                const itemCategory = item.dataset.category;

                // Filtre catégorie
                const categoryMatch = category === 'all' || itemCategory === category;

                // Filtre recherche
                const searchMatch = searchTerm === '' || questionText.includes(searchTerm) || answerText.includes(searchTerm);

                if (categoryMatch && searchMatch) {
                    item.style.display = 'block';
                    anyVisible = true;
                } else {
                    item.style.display = 'none';
                }
            });

            // Afficher un message si aucun résultat
            let noResultsMsg = document.querySelector('.faq-no-results');
            if (!anyVisible) {
                if (!noResultsMsg) {
                    noResultsMsg = document.createElement('div');
                    noResultsMsg.className = 'faq-no-results';
                    noResultsMsg.textContent = 'Aucune question ne correspond à votre recherche.';
                    faqList.appendChild(noResultsMsg);
                }
            } else {
                if (noResultsMsg) noResultsMsg.remove();
            }
        }

        // Initialisation : premier affichage (optionnel)
        filterFaq('', 'all');
    });
})();