// ============================================
// dropdown.js - Menu déroulant des catégories
// Crée dynamiquement le menu, gère son ouverture
// et sa fermeture, et les événements des items
// ============================================

(function() {
    'use strict'; // Mode strict activé

    document.addEventListener('DOMContentLoaded', function() {

        // ── Récupération du bouton déclencheur ────────────────────

        const dropdownButton = document.querySelector('.nav-dropdown'); // Bouton "CATÉGORIES" dans le header

        if (!dropdownButton) { // Si le bouton n'existe pas sur cette page
            console.warn('Bouton dropdown introuvable');
            return; // Arrêt : pas de dropdown à créer
        }

        createDropdownMenu(); // Génère et insère le menu dans le DOM

        const dropdownMenu = document.querySelector('.dropdown-menu'); // Récupère le menu maintenant qu'il est créé

        // ── Événement d'ouverture/fermeture au clic ───────────────

        dropdownButton.addEventListener('click', function(e) {
            e.stopPropagation(); // Empêche l'événement de remonter au document (éviterait la fermeture immédiate)
            console.log('Bouton dropdown cliqué');
            toggleDropdown(); // Bascule l'état du menu (ouvert ↔ fermé)
        });

        // ── Fermeture en cliquant en dehors du menu ───────────────

        document.addEventListener('click', function(e) {
            // Vérifie que le clic n'est ni dans le menu ni sur le bouton
            if (dropdownMenu && !dropdownMenu.contains(e.target) && !dropdownButton.contains(e.target)) {
                closeDropdown(); // Ferme le menu si le clic est ailleurs
            }
        });

        // ── Fermeture avec la touche Escape ───────────────────────

        document.addEventListener('keydown', function(e) {
            // Ferme le menu si Escape est pressée et que le menu est ouvert
            if (e.key === 'Escape' && dropdownMenu.classList.contains('active')) {
                closeDropdown();
            }
        });

        // ============================================
        // CRÉATION DU MENU DROPDOWN
        // Construit le HTML du menu à partir des données
        // de PearTechDB ou d'un fallback statique
        // ============================================

        function createDropdownMenu() {
            if (document.querySelector('.dropdown-menu')) return; // Le menu existe déjà : on ne le recrée pas

            const menu = document.createElement('div'); // Crée un div pour le menu
            menu.className = 'dropdown-menu';           // Lui applique la classe CSS

            let categories = []; // Tableau des catégories à afficher

            // Utilise les vraies catégories de la base de données si disponible
            if (window.PearTechDB && window.PearTechDB.categories) {
                categories = window.PearTechDB.categories.map(cat => ({
                    icon: cat.icon,                   // Nom de l'icône
                    title: cat.name,                  // Nom affiché
                    description: cat.description,     // Description courte
                    subcategories: cat.subcategories, // Sous-catégories
                    slug: cat.slug                    // Identifiant URL (ex: "apple")
                }));
            } else {
                // Fallback : catégories en dur si data.js n'est pas encore chargé
                categories = [
                    { icon: 'apple',  title: 'Apple',              description: 'iPhone, iPad, Apple Watch et accessoires',    subcategories: ['iPhone', 'iPad', 'Apple Watch', 'Accessoires'],                  slug: 'apple' },
                    { icon: 'android',title: 'Android',            description: 'Samsung, Google Pixel, Xiaomi et plus',       subcategories: ['Samsung', 'Google Pixel', 'Xiaomi', 'OnePlus', 'Autres'],        slug: 'android' },
                    { icon: 'watch',  title: 'Montres connectées', description: 'Apple Watch, Galaxy Watch, Fitbit, Garmin',   subcategories: ['Apple Watch', 'Samsung Galaxy Watch', 'Fitbit', 'Garmin', 'Autres'], slug: 'montres' },
                    { icon: 'tablet', title: 'Tablettes',          description: 'iPad, Samsung Tab, Amazon Fire',             subcategories: ['iPad', 'Samsung Galaxy Tab', 'Amazon Fire', 'Xiaomi', 'Autres'],  slug: 'tablettes' }
                ];
            }

            // ── Construction du HTML du menu ──────────────────────

            let html = '<div class="dropdown-header">Toutes les catégories</div>'; // Titre du menu
            html += '<div class="dropdown-grid">'; // Grille des catégories

            categories.forEach(function(cat) {
                const svgIcon = getSvgIcon(cat.icon); // Récupère le SVG correspondant à l'icône
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

            html += '</div>'; // Ferme le dropdown-grid
            // Lien "Voir tout le catalogue" en bas du menu
            html += '<div class="dropdown-footer"><a href="page_catalogue.html" class="dropdown-view-all">Voir tout le catalogue →</a></div>';

            menu.innerHTML = html; // Injecte le HTML dans l'élément menu

            // ── Insertion du menu dans le DOM ─────────────────────
            // On crée un wrapper relatif pour que le menu absolu se positionne correctement

            let dropdownWrapper = dropdownButton.parentElement.querySelector('.dropdown-wrapper');
            if (!dropdownWrapper) { // Crée le wrapper s'il n'existe pas encore
                dropdownWrapper = document.createElement('div');
                dropdownWrapper.className = 'dropdown-wrapper';
                dropdownWrapper.style.position = 'relative'; // Nécessaire pour le positionnement absolu du menu
                dropdownButton.parentElement.insertBefore(dropdownWrapper, dropdownButton); // Insère avant le bouton
                dropdownWrapper.appendChild(dropdownButton); // Déplace le bouton dans le wrapper
            }

            dropdownWrapper.appendChild(menu); // Ajoute le menu après le bouton dans le wrapper

            console.log('Menu dropdown créé avec', categories.length, 'catégories');
            attachDropdownItemEvents(); // Attache les événements aux items du menu
        }

        // ── Icônes SVG ────────────────────────────────────────────
        // Retourne le SVG inline correspondant à un nom d'icône
        // Nécessaire car Material Icons n'a pas de logo Apple ou Android officiel

        function getSvgIcon(iconName) {
            const icons = {
                'apple': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.05 20.28C16.07 21.23 14.99 21.08 13.97 20.63C12.88 20.17 11.88 20.15 10.73 20.63C9.29001 21.25 8.53001 21.07 7.67001 20.28C2.79001 15.25 3.51001 7.59 9.05001 7.31C10.4 7.38 11.34 8.05 12.13 8.11C13.31 7.87 14.44 7.18 15.7 7.27C17.21 7.39 18.35 8.05 19.11 9.23C15.95 11.11 16.53 15.28 19.28 16.49C18.76 17.87 18.04 19.24 17.04 20.29L17.05 20.28ZM12.03 7.25C11.88 5.02 13.69 3.18 15.77 3C16.02 5.44 13.45 7.36 12.03 7.25Z" fill="currentColor"/></svg>`, // SVG logo Apple
                'android': `<svg width="24" height="24" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 2.5L4.5 5.5M12.5 2.5L10.5 5.5M4 9.5H5M10 9.5H11M1.5 12.5V10.5C1.5 7.18629 4.18629 4.5 7.5 4.5C10.8137 4.5 13.5 7.18629 13.5 10.5V12.5H1.5Z" stroke="#b3b3b3"/></svg>`, // SVG robot Android
                'watch': `<svg fill="#b3b3b3" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17,6.78V3a1,1,0,0,0-1-1H8A1,1,0,0,0,7,3V6.78A3,3,0,0,0,6,9v6a3,3,0,0,0,1,2.22V21a1,1,0,0,0,1,1h8a1,1,0,0,0,1-1V17.22A3,3,0,0,0,18,15V9A3,3,0,0,0,17,6.78ZM9,4h6V6H9Zm6,16H9V18h6Zm1-5a1,1,0,0,1-1,1H9a1,1,0,0,1-1-1V9A1,1,0,0,1,9,8h6a1,1,0,0,1,1,1Z"/></svg>`, // SVG montre connectée
                'tablet': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z" fill="currentColor"/></svg>` // SVG tablette
            };
            // Retourne le SVG correspondant ou un cercle générique si l'icône est inconnue
            return icons[iconName] || `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="2"/></svg>`;
        }

        // ── Toggle ouverture/fermeture ─────────────────────────────

        function toggleDropdown() {
            const menu = document.querySelector('.dropdown-menu');
            // Vérifie l'état actuel et bascule
            if (menu.classList.contains('active')) {
                closeDropdown();
            } else {
                openDropdown();
            }
        }

        function openDropdown() {
            const menu = document.querySelector('.dropdown-menu');
            const icon = dropdownButton.querySelector('.material-symbols-outlined'); // Icône chevron

            menu.classList.add('active');          // Rend le menu visible (CSS gère le display)
            dropdownButton.classList.add('active'); // Indique visuellement que le bouton est actif
            if (icon) icon.style.transform = 'rotate(180deg)'; // Tourne le chevron vers le haut

            console.log('Dropdown ouvert');
        }

        function closeDropdown() {
            const menu = document.querySelector('.dropdown-menu');
            const icon = dropdownButton.querySelector('.material-symbols-outlined');

            menu.classList.remove('active');          // Cache le menu
            dropdownButton.classList.remove('active'); // Désactive le style du bouton
            if (icon) icon.style.transform = 'rotate(0deg)'; // Remet le chevron vers le bas

            console.log('Dropdown fermé');
        }

        // ── Événements sur les items du menu ──────────────────────

        function attachDropdownItemEvents() {
            const items = document.querySelectorAll('.dropdown-item'); // Tous les liens de catégorie

            items.forEach(function(item) {
                item.addEventListener('click', function(e) {
                    const category = this.getAttribute('data-category'); // Récupère le nom de la catégorie
                    console.log('Catégorie sélectionnée:', category);

                    // Émet un événement custom pour que d'autres modules puissent réagir
                    const event = new CustomEvent('categorySelected', {
                        detail: { category: category, link: this.href }
                    });
                    document.dispatchEvent(event); // Publie l'événement sur le document

                    closeDropdown(); // Ferme le menu (la navigation vers le lien se fait normalement)
                });
            });
        }

        console.log('Dropdown module initialisé');
    });

})(); // Fin de l'IIFE