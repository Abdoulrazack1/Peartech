// ============================================
// faq.js - PearTech
// Accordéon, recherche, filtres
// ============================================

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {

        // ── Sélecteurs ───────────────────────────────────────────
        const faqList      = document.getElementById('faq-list');
        const searchInput  = document.getElementById('faq-search-input');
        const categoryBtns = document.querySelectorAll('.category-btn');

        if (!faqList) return;

        // ── Créer le message "aucun résultat" ─────────────────────
        const noResults = document.createElement('p');
        noResults.className = 'faq-no-results';
        noResults.textContent = 'Aucune question ne correspond à votre recherche.';
        faqList.after(noResults);

        // ── Récupérer les items APRÈS le rendu initial ────────────
        function getItems() {
            return Array.from(faqList.querySelectorAll('.faq-item'));
        }

        // ── Initialiser chaque item ───────────────────────────────
        function initItems() {
            getItems().forEach(function (item) {
                const answer = item.querySelector('.faq-answer');
                if (!answer) return;

                // S'assurer que la div inner existe
                let inner = answer.querySelector('.faq-answer-inner');
                if (!inner) {
                    // Compatibilité : si le HTML n'a pas .faq-answer-inner, on l'enveloppe
                    inner = document.createElement('div');
                    inner.className = 'faq-answer-inner';
                    while (answer.firstChild) inner.appendChild(answer.firstChild);
                    answer.appendChild(inner);
                }

                // Fermer à l'initialisation (hauteur 0)
                answer.style.height   = '0';
                answer.style.overflow = 'hidden';
                answer.style.display  = 'block';

                const btn = item.querySelector('.faq-question');
                if (!btn) return;

                btn.addEventListener('click', function () {
                    if (item.classList.contains('active')) {
                        closeItem(item);
                    } else {
                        // Fermer tous les autres
                        getItems().forEach(function (other) {
                            if (other !== item && other.classList.contains('active')) {
                                closeItem(other);
                            }
                        });
                        openItem(item);
                    }
                });
            });
        }

        // ── Ouvrir ───────────────────────────────────────────────
        function openItem(item) {
            const answer = item.querySelector('.faq-answer');
            if (!answer) return;

            item.classList.add('active');

            // Mesurer la hauteur naturelle du contenu
            answer.style.height = 'auto';
            const targetHeight  = answer.scrollHeight + 'px';
            answer.style.height = '0';

            // Déclencher le reflow puis animer
            answer.getBoundingClientRect();
            answer.style.transition = 'height 0.32s cubic-bezier(0.4, 0, 0.2, 1)';
            answer.style.height     = targetHeight;

            // Repasser en "auto" après animation pour les contenus dynamiques
            answer.addEventListener('transitionend', function onEnd() {
                answer.removeEventListener('transitionend', onEnd);
                if (item.classList.contains('active')) {
                    answer.style.height = 'auto';
                }
            });
        }

        // ── Fermer ───────────────────────────────────────────────
        function closeItem(item) {
            const answer = item.querySelector('.faq-answer');
            if (!answer) return;

            // Figer la hauteur actuelle avant l'animation
            answer.style.height     = answer.scrollHeight + 'px';
            answer.style.transition = 'height 0.28s cubic-bezier(0.4, 0, 0.2, 1)';

            // Reflow
            answer.getBoundingClientRect();
            answer.style.height = '0';

            item.classList.remove('active');
        }

        // ── Recherche avec debounce ───────────────────────────────
        let debounceTimer;
        if (searchInput) {
            searchInput.addEventListener('input', function () {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(applyFilters, 200);
            });

            searchInput.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') {
                    this.value = '';
                    this.blur();
                    applyFilters();
                }
            });
        }

        // ── Filtres catégorie ─────────────────────────────────────
        categoryBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                categoryBtns.forEach(function (b) { b.classList.remove('active'); });
                this.classList.add('active');
                applyFilters();
            });
        });

        // ── Filtrage combiné ──────────────────────────────────────
        function applyFilters() {
            const term = searchInput
                ? searchInput.value.toLowerCase().trim()
                : '';

            const activeBtn  = document.querySelector('.category-btn.active');
            const category   = activeBtn ? (activeBtn.dataset.category || 'all') : 'all';

            let visibleCount = 0;

            getItems().forEach(function (item) {
                const qEl = item.querySelector('.faq-question-text');
                const aEl = item.querySelector('.faq-answer');
                if (!qEl || !aEl) return;

                const qText  = qEl.textContent.toLowerCase();
                const aText  = aEl.textContent.toLowerCase();
                const iCat   = item.dataset.category || '';

                const catOk  = category === 'all' || iCat === category;
                const termOk = term === '' || qText.includes(term) || aText.includes(term);
                const show   = catOk && termOk;

                item.style.display = show ? '' : 'none';

                // Fermer les items cachés
                if (!show && item.classList.contains('active')) {
                    closeItem(item);
                }

                if (show) visibleCount++;
            });

            // Message aucun résultat
            noResults.classList.toggle('visible', visibleCount === 0);
        }

        // ── Init ─────────────────────────────────────────────────
        initItems();
        applyFilters();
    });

})();