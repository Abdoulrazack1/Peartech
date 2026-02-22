// ============================================
// faq.js - Page FAQ PearTech
// Gère l'accordéon (ouverture/fermeture des réponses),
// la recherche par mot-clé et le filtrage par catégorie
// ============================================

(function () {
    'use strict'; // Mode strict activé

    document.addEventListener('DOMContentLoaded', function () {

        // ── Sélection des éléments du DOM ────────────────────────

        const faqList      = document.getElementById('faq-list');          // Conteneur de toutes les questions/réponses
        const searchInput  = document.getElementById('faq-search-input');  // Champ de recherche
        const categoryBtns = document.querySelectorAll('.category-btn');   // Boutons de filtre par catégorie

        if (!faqList) return; // Si la liste FAQ n'existe pas sur cette page, on arrête

        // ── Création du message "aucun résultat" ──────────────────

        const noResults = document.createElement('p'); // Crée un paragraphe
        noResults.className = 'faq-no-results';        // Classe CSS pour le style
        noResults.textContent = 'Aucune question ne correspond à votre recherche.'; // Texte affiché
        faqList.after(noResults); // Insère le message juste après la liste FAQ dans le DOM

        // ── Getter dynamique des items ────────────────────────────
        // Fonction plutôt que variable : récupère les items à chaque appel
        // pour toujours avoir la liste à jour même si le DOM change

        function getItems() {
            return Array.from(faqList.querySelectorAll('.faq-item')); // Convertit NodeList en Array
        }

        // ── Initialisation de chaque item accordéon ───────────────

        function initItems() {
            getItems().forEach(function (item) {
                const answer = item.querySelector('.faq-answer'); // Zone de réponse à afficher/cacher
                if (!answer) return; // Ignore les items mal formés

                // Vérifie si le wrapper .faq-answer-inner existe déjà dans le HTML
                let inner = answer.querySelector('.faq-answer-inner');
                if (!inner) {
                    // Compatibilité : crée le wrapper si absent du HTML
                    inner = document.createElement('div');
                    inner.className = 'faq-answer-inner'; // Classe CSS pour le padding intérieur
                    // Déplace tout le contenu existant de .faq-answer dans le nouveau wrapper
                    while (answer.firstChild) inner.appendChild(answer.firstChild);
                    answer.appendChild(inner); // Ajoute le wrapper dans .faq-answer
                }

                // Ferme toutes les réponses à l'initialisation
                answer.style.height   = '0';      // Hauteur nulle = caché
                answer.style.overflow = 'hidden'; // Masque le contenu qui dépasse
                answer.style.display  = 'block';  // Nécessaire pour que la transition height fonctionne

                const btn = item.querySelector('.faq-question'); // Bouton cliquable de la question
                if (!btn) return;

                btn.addEventListener('click', function () {
                    if (item.classList.contains('active')) {
                        closeItem(item); // L'item est ouvert : on le ferme
                    } else {
                        // L'item est fermé : on ferme tous les autres d'abord (accordéon = un seul ouvert)
                        getItems().forEach(function (other) {
                            if (other !== item && other.classList.contains('active')) {
                                closeItem(other); // Ferme les autres items ouverts
                            }
                        });
                        openItem(item); // Puis on ouvre l'item cliqué
                    }
                });
            });
        }

        // ── Animation d'ouverture ─────────────────────────────────

        function openItem(item) {
            const answer = item.querySelector('.faq-answer');
            if (!answer) return;

            item.classList.add('active'); // Ajoute la classe pour les styles CSS de l'état ouvert

            // Technique pour animer height de 0 à la vraie hauteur :
            // 1. On passe en height:auto pour mesurer la hauteur réelle du contenu
            answer.style.height = 'auto';
            const targetHeight  = answer.scrollHeight + 'px'; // Mesure la hauteur naturelle
            answer.style.height = '0'; // Remet à 0 avant d'animer

            answer.getBoundingClientRect(); // Force le reflow du navigateur (nécessaire pour que la transition démarre)
            answer.style.transition = 'height 0.32s cubic-bezier(0.4, 0, 0.2, 1)'; // Courbe d'animation Material Design
            answer.style.height     = targetHeight; // Lance l'animation vers la hauteur cible

            // Après la fin de l'animation, repasse en height:auto
            // pour que le contenu dynamique (ex: images qui se chargent) ne soit pas coupé
            answer.addEventListener('transitionend', function onEnd() {
                answer.removeEventListener('transitionend', onEnd); // Supprime le listener pour éviter les doublons
                if (item.classList.contains('active')) { // Vérifie que l'item est encore ouvert
                    answer.style.height = 'auto'; // Repasse en hauteur automatique
                }
            });
        }

        // ── Animation de fermeture ────────────────────────────────

        function closeItem(item) {
            const answer = item.querySelector('.faq-answer');
            if (!answer) return;

            // Pour animer depuis la hauteur actuelle vers 0, il faut d'abord figer la hauteur
            answer.style.height     = answer.scrollHeight + 'px'; // Fige la hauteur actuelle en pixels
            answer.style.transition = 'height 0.28s cubic-bezier(0.4, 0, 0.2, 1)'; // Légèrement plus rapide à la fermeture

            answer.getBoundingClientRect(); // Force le reflow pour que la transition parte bien de la hauteur figée
            answer.style.height = '0'; // Anime vers 0

            item.classList.remove('active'); // Retire la classe pour les styles CSS de l'état fermé
        }

        // ── Recherche avec debounce ───────────────────────────────
        // Le debounce évite de relancer le filtre à chaque frappe :
        // on attend 200ms après la dernière frappe pour filtrer

        let debounceTimer; // Stocke la référence au setTimeout pour pouvoir l'annuler
        if (searchInput) {
            searchInput.addEventListener('input', function () {
                clearTimeout(debounceTimer); // Annule le timer précédent
                debounceTimer = setTimeout(applyFilters, 200); // Lance applyFilters après 200ms de silence
            });

            searchInput.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') { // Si l'utilisateur appuie sur Escape
                    this.value = ''; // Vide le champ de recherche
                    this.blur();     // Enlève le focus du champ
                    applyFilters();  // Réaffiche tous les items
                }
            });
        }

        // ── Filtres par catégorie ──────────────────────────────────

        categoryBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                categoryBtns.forEach(function (b) { b.classList.remove('active'); }); // Désactive tous les boutons
                this.classList.add('active'); // Active le bouton cliqué
                applyFilters(); // Relance le filtrage avec la nouvelle catégorie
            });
        });

        // ── Filtrage combiné (recherche + catégorie) ──────────────

        function applyFilters() {
            // Récupère le terme de recherche normalisé en minuscules
            const term = searchInput ? searchInput.value.toLowerCase().trim() : '';

            // Récupère la catégorie active (data-category du bouton actif, ou 'all' si aucun)
            const activeBtn  = document.querySelector('.category-btn.active');
            const category   = activeBtn ? (activeBtn.dataset.category || 'all') : 'all';

            let visibleCount = 0; // Compteur des items visibles après filtrage

            getItems().forEach(function (item) {
                const qEl = item.querySelector('.faq-question-text'); // Élément texte de la question
                const aEl = item.querySelector('.faq-answer');        // Élément texte de la réponse
                if (!qEl || !aEl) return; // Ignore les items mal formés

                const qText  = qEl.textContent.toLowerCase(); // Texte de la question en minuscules
                const aText  = aEl.textContent.toLowerCase(); // Texte de la réponse en minuscules
                const iCat   = item.dataset.category || '';   // Catégorie de cet item (data-category)

                // Vérifie si la catégorie correspond ('all' accepte tout)
                const catOk  = category === 'all' || iCat === category;
                // Vérifie si le terme de recherche est présent dans la question OU la réponse
                const termOk = term === '' || qText.includes(term) || aText.includes(term);
                const show   = catOk && termOk; // L'item est visible seulement si les deux conditions sont vraies

                item.style.display = show ? '' : 'none'; // Affiche ou cache l'item

                // Si l'item est caché mais était ouvert, on le ferme proprement
                if (!show && item.classList.contains('active')) {
                    closeItem(item);
                }

                if (show) visibleCount++; // Incrémente le compteur des items visibles
            });

            // Affiche ou cache le message "aucun résultat" selon le nombre d'items visibles
            noResults.classList.toggle('visible', visibleCount === 0);
        }

        // ── Initialisation ─────────────────────────────────────────

        initItems();    // Configure les accordéons et attache les événements
        applyFilters(); // Applique le filtre initial (affiche tout)
    });

})(); // Fin de l'IIFE