// ============================================
// dropdown.js - Menu déroulant des catégories
// Crée dynamiquement le menu, gère son ouverture
// et sa fermeture, et les événements des items
// ============================================

// IIFE (Immediately Invoked Function Expression) pour isoler le code
// et éviter les conflits avec d'autres variables globales
(function() {
    'use strict'; // Active le mode strict pour une meilleure sécurité et optimisation

    // Attend que le DOM soit complètement chargé avant d'exécuter le code
    document.addEventListener('DOMContentLoaded', function() {

        // Récupère le bouton qui déclenche l'ouverture du dropdown (par sa classe .nav-dropdown)
        const dropdownButton = document.querySelector('.nav-dropdown');

        // Si le bouton n'existe pas, on affiche un avertissement et on arrête l'exécution
        if (!dropdownButton) {
            console.warn('Bouton dropdown introuvable');
            return;
        }

        // Vérifie si la base de données PearTechDB est déjà chargée
        if (window.PearTechDB) {
            // Si oui, on crée immédiatement le menu et on attache les événements
            createDropdownMenu();
            attachDropdownEvents();
        } else {
            // Sinon, on écoute l'événement personnalisé 'PearTechDBReady' émis par data.js
            document.addEventListener('PearTechDBReady', function() {
                createDropdownMenu();
                attachDropdownEvents();
            });
        }

        // ============================================
        // ATTACHEMENT DES ÉVÉNEMENTS GLOBAUX
        // ============================================

        /**
         * Attache les événements liés au dropdown :
         * - clic sur le bouton pour ouvrir/fermer
         * - clic ailleurs pour fermer
         * - touche Échap pour fermer
         */
        function attachDropdownEvents() {
            const dropdownMenu = document.querySelector('.dropdown-menu');
            if (!dropdownMenu) return;

            // Clic sur le bouton : bascule l'état du dropdown
            dropdownButton.addEventListener('click', function(e) {
                e.stopPropagation(); // Empêche la propagation du clic pour ne pas déclencher la fermeture immédiate
                toggleDropdown();
            });

            // Clic n'importe où dans le document : ferme le dropdown si on clique en dehors du menu et du bouton
            document.addEventListener('click', function(e) {
                if (!dropdownMenu.contains(e.target) && !dropdownButton.contains(e.target)) {
                    closeDropdown();
                }
            });

            // Touche Échap : ferme le dropdown s'il est ouvert
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && dropdownMenu.classList.contains('active')) {
                    closeDropdown();
                }
            });
        }

        // ============================================
        // CRÉATION DU MENU DROPDOWN
        // ============================================

        /**
         * Construit dynamiquement le menu déroulant à partir des catégories
         * issues de PearTechDB (ou d'un fallback statique si la DB est absente)
         */
        function createDropdownMenu() {
            // Si le menu existe déjà, on ne le recrée pas
            if (document.querySelector('.dropdown-menu')) return;

            // Crée l'élément div du menu
            const menu = document.createElement('div');
            menu.className = 'dropdown-menu';

            // Tableau qui contiendra les catégories à afficher
            let categories = [];

            // Si PearTechDB est disponible, on utilise ses catégories
            if (window.PearTechDB && window.PearTechDB.categories) {
                categories = window.PearTechDB.categories.map(cat => ({
                    icon:          cat.icon,
                    title:         cat.name,
                    description:   cat.description,
                    subcategories: cat.subcategories,
                    slug:          cat.slug
                }));
            } else {
                // Fallback statique (si data.js n'est pas chargé) pour éviter une erreur
                console.warn('PearTechDB non disponible : menu dropdown en mode statique.');
                categories = [
                    { icon: 'apple',  title: 'Apple',              description: 'iPhone, iPad, Apple Watch et accessoires',    subcategories: ['iPhone', 'iPad', 'Apple Watch', 'Accessoires'],                     slug: 'apple' },
                    { icon: 'android',title: 'Android',            description: 'Samsung, Google Pixel, Xiaomi et plus',       subcategories: ['Samsung', 'Google Pixel', 'Xiaomi', 'OnePlus', 'Autres'],           slug: 'android' },
                    { icon: 'watch',  title: 'Montres connectées', description: 'Apple Watch, Galaxy Watch, Fitbit, Garmin',   subcategories: ['Apple Watch', 'Samsung Galaxy Watch', 'Fitbit', 'Garmin', 'Autres'], slug: 'montres' },
                    { icon: 'tablet', title: 'Tablettes',          description: 'iPad, Samsung Tab, Amazon Fire',             subcategories: ['iPad', 'Samsung Galaxy Tab', 'Amazon Fire', 'Xiaomi', 'Autres'],     slug: 'tablettes' }
                ];
            }

            // Construction du HTML du menu
            let html = '<div class="dropdown-header">Toutes les catégories</div>';
            html += '<div class="dropdown-grid">';

            // Pour chaque catégorie, on génère un item de dropdown
            categories.forEach(function(cat) {
                const svgIcon = getSvgIcon(cat.icon); // Récupère l'icône SVG correspondante
                html += `
                    <a href="page_catalogue.html?categorie=${cat.slug}" class="dropdown-item" data-category="${cat.title}">
                        <span class="dropdown-icon">${svgIcon}</span>
                        <div class="dropdown-content">
                            <div class="dropdown-title">${cat.title}</div>
                            <div class="dropdown-description">${cat.description}</div>
                            ${cat.subcategories ? `
                                <div class="dropdown-subcategories">
                                    ${cat.subcategories.map(sub => `<span class="subcategory-tag">${sub}</span>`).join('')}
                                </div>
                            ` : ''}
                        </div>
                    </a>
                `;
            });

            html += '</div>';
            html += '<div class="dropdown-footer"><a href="page_catalogue.html" class="dropdown-view-all">Voir tout le catalogue →</a></div>';

            // Insère le HTML dans le menu
            menu.innerHTML = html;

            // S'assure que le bouton est enveloppé dans un conteneur relatif pour positionner le menu
            let dropdownWrapper = dropdownButton.parentElement.querySelector('.dropdown-wrapper');
            if (!dropdownWrapper) {
                dropdownWrapper = document.createElement('div');
                dropdownWrapper.className = 'dropdown-wrapper';
                dropdownWrapper.style.position = 'relative';
                dropdownButton.parentElement.insertBefore(dropdownWrapper, dropdownButton);
                dropdownWrapper.appendChild(dropdownButton);
            }

            // Ajoute le menu dans le wrapper
            dropdownWrapper.appendChild(menu);

            console.log('Menu dropdown créé avec', categories.length, 'catégories');
            // Attache les événements aux items du menu
            attachDropdownItemEvents();
        }

        // ── Icônes SVG ─────────────────────────────────────────────
        /**
         * Retourne le code SVG correspondant au nom de l'icône
         * @param {string} iconName - Nom de l'icône ('apple', 'android', 'watch', 'tablet')
         * @returns {string} Code SVG
         */
        function getSvgIcon(iconName) {
            const icons = {
                'apple':  `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.05 20.28C16.07 21.23 14.99 21.08 13.97 20.63C12.88 20.17 11.88 20.15 10.73 20.63C9.29001 21.25 8.53001 21.07 7.67001 20.28C2.79001 15.25 3.51001 7.59 9.05001 7.31C10.4 7.38 11.34 8.05 12.13 8.11C13.31 7.87 14.44 7.18 15.7 7.27C17.21 7.39 18.35 8.05 19.11 9.23C15.95 11.11 16.53 15.28 19.28 16.49C18.76 17.87 18.04 19.24 17.04 20.29L17.05 20.28ZM12.03 7.25C11.88 5.02 13.69 3.18 15.77 3C16.02 5.44 13.45 7.36 12.03 7.25Z" fill="currentColor"/></svg>`,
                'android':`<svg width="24" height="24" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 2.5L4.5 5.5M12.5 2.5L10.5 5.5M4 9.5H5M10 9.5H11M1.5 12.5V10.5C1.5 7.18629 4.18629 4.5 7.5 4.5C10.8137 4.5 13.5 7.18629 13.5 10.5V12.5H1.5Z" stroke="#b3b3b3"/></svg>`,
                'watch':  `<svg fill="#b3b3b3" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17,6.78V3a1,1,0,0,0-1-1H8A1,1,0,0,0,7,3V6.78A3,3,0,0,0,6,9v6a3,3,0,0,0,1,2.22V21a1,1,0,0,0,1,1h8a1,1,0,0,0,1-1V17.22A3,3,0,0,0,18,15V9A3,3,0,0,0,17,6.78ZM9,4h6V6H9Zm6,16H9V18h6Zm1-5a1,1,0,0,1-1,1H9a1,1,0,0,1-1-1V9A1,1,0,0,1,9,8h6a1,1,0,0,1,1,1Z"/></svg>`,
                'tablet': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z" fill="currentColor"/></svg>`
            };
            // Retourne l'icône demandée, ou un cercle par défaut si le nom n'est pas reconnu
            return icons[iconName] || `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="2"/></svg>`;
        }

        // ── Gestion de l'ouverture/fermeture ───────────────────────

        /**
         * Bascule l'état du dropdown (ouvre si fermé, ferme si ouvert)
         */
        function toggleDropdown() {
            const menu = document.querySelector('.dropdown-menu');
            if (!menu) return;
            menu.classList.contains('active') ? closeDropdown() : openDropdown();
        }

        /**
         * Ouvre le dropdown
         */
        function openDropdown() {
            const menu = document.querySelector('.dropdown-menu');
            const icon = dropdownButton.querySelector('.material-symbols-outlined');
            if (!menu) return;

            menu.classList.add('active'); // Affiche le menu
            dropdownButton.classList.add('active'); // Marque le bouton comme actif
            if (icon) icon.style.transform = 'rotate(180deg)'; // Tourne l'icône vers le haut
        }

        /**
         * Ferme le dropdown
         */
        function closeDropdown() {
            const menu = document.querySelector('.dropdown-menu');
            const icon = dropdownButton.querySelector('.material-symbols-outlined');
            if (!menu) return;

            menu.classList.remove('active'); // Cache le menu
            dropdownButton.classList.remove('active'); // Enlève l'état actif du bouton
            if (icon) icon.style.transform = 'rotate(0deg)'; // Remet l'icône dans sa position initiale
        }

        /**
         * Attache un événement de clic à chaque item du dropdown
         * pour pouvoir éventuellement réagir à la sélection et fermer le menu
         */
        function attachDropdownItemEvents() {
            document.querySelectorAll('.dropdown-item').forEach(function(item) {
                item.addEventListener('click', function(e) {
                    const category = this.getAttribute('data-category'); // Récupère la catégorie cliquée
                    // Crée un événement personnalisé pour informer d'autres parties de l'application
                    const event    = new CustomEvent('categorySelected', {
                        detail: { category: category, link: this.href }
                    });
                    document.dispatchEvent(event);
                    closeDropdown(); // Ferme le menu après le clic
                });
            });
        }

        console.log('Dropdown module initialisé');
    });

})();