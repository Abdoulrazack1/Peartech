// ============================================
// dropdown.js - Menu déroulant avec icônes SVG
// Gestion des menus dropdown (catégories, etc.)
// ============================================

(function() {
    'use strict';
    
    document.addEventListener('DOMContentLoaded', function() {
        
        // ============================================
        // MENU CATÉGORIES DROPDOWN
        // ============================================
        
        const dropdownButton = document.querySelector('.nav-dropdown');
        
        if (!dropdownButton) {
            console.warn('Bouton dropdown introuvable');
            return;
        }
        
        // Créer le menu dropdown
        createDropdownMenu();
        
        const dropdownMenu = document.querySelector('.dropdown-menu');
        
        // Toggle du menu au clic
        dropdownButton.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log('Bouton dropdown cliqué');
            toggleDropdown();
        });
        
        // Fermer le menu en cliquant ailleurs
        document.addEventListener('click', function(e) {
            if (dropdownMenu && !dropdownMenu.contains(e.target) && !dropdownButton.contains(e.target)) {
                closeDropdown();
            }
        });
        
        // Fermer avec la touche Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && dropdownMenu.classList.contains('active')) {
                closeDropdown();
            }
        });
        
        // ============================================
        // CRÉER LE MENU DROPDOWN
        // ============================================
        
        function createDropdownMenu() {
            // Vérifier si le menu existe déjà
            if (document.querySelector('.dropdown-menu')) return;
            
            const menu = document.createElement('div');
            menu.className = 'dropdown-menu';
            
            // Récupérer les catégories depuis la base de données si disponible
            let categories = [];
            if (window.NovaComputeDB && window.NovaComputeDB.categories) {
                categories = window.NovaComputeDB.categories.map(cat => ({
                    icon: cat.icon,
                    title: cat.name,
                    description: cat.description,
                    subcategories: cat.subcategories,
                    slug: cat.slug
                }));
            } else {
                // Fallback si la DB n'est pas chargée
                categories = [
                    {
                        icon: 'apple',
                        title: 'Apple',
                        description: 'iPhone, iPad, Apple Watch et accessoires',
                        subcategories: ['iPhone', 'iPad', 'Apple Watch', 'Accessoires'],
                        slug: 'apple'
                    },
                    {
                        icon: 'android',
                        title: 'Android',
                        description: 'Samsung, Google Pixel, Xiaomi et plus',
                        subcategories: ['Samsung', 'Google Pixel', 'Xiaomi', 'OnePlus', 'Autres'],
                        slug: 'android'
                    },
                    {
                        icon: 'watch',
                        title: 'Montres connectées',
                        description: 'Apple Watch, Galaxy Watch, Fitbit, Garmin',
                        subcategories: ['Apple Watch', 'Samsung Galaxy Watch', 'Fitbit', 'Garmin', 'Autres'],
                        slug: 'montres'
                    },
                    {
                        icon: 'tablet',
                        title: 'Tablettes',
                        description: 'iPad, Samsung Tab, Amazon Fire',
                        subcategories: ['iPad', 'Samsung Galaxy Tab', 'Amazon Fire', 'Xiaomi', 'Autres'],
                        slug: 'tablettes'
                    }
                ];
            }
            
            // Générer le HTML du menu avec des SVG
            let html = '<div class="dropdown-header">Toutes les catégories</div>';
            html += '<div class="dropdown-grid">';
            
            categories.forEach(function(cat) {
                // Obtenir le SVG correspondant à l'icône
                const svgIcon = getSvgIcon(cat.icon);
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
            
            menu.innerHTML = html;
            
            // Créer un wrapper pour le dropdown si nécessaire
            let dropdownWrapper = dropdownButton.parentElement.querySelector('.dropdown-wrapper');
            if (!dropdownWrapper) {
                dropdownWrapper = document.createElement('div');
                dropdownWrapper.className = 'dropdown-wrapper';
                dropdownWrapper.style.position = 'relative';
                dropdownButton.parentElement.insertBefore(dropdownWrapper, dropdownButton);
                dropdownWrapper.appendChild(dropdownButton);
            }
            
            // Ajouter le menu au wrapper
            dropdownWrapper.appendChild(menu);
            
            console.log('Menu dropdown créé avec', categories.length, 'catégories');
            
            // Attacher les événements aux items
            attachDropdownItemEvents();
        }
        
        // Fonction pour obtenir le SVG correspondant à un nom d'icône
        function getSvgIcon(iconName) {
            const icons = {
                'apple': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.05 20.28C16.07 21.23 14.99 21.08 13.97 20.63C12.88 20.17 11.88 20.15 10.73 20.63C9.29001 21.25 8.53001 21.07 7.67001 20.28C2.79001 15.25 3.51001 7.59 9.05001 7.31C10.4 7.38 11.34 8.05 12.13 8.11C13.31 7.87 14.44 7.18 15.7 7.27C17.21 7.39 18.35 8.05 19.11 9.23C15.95 11.11 16.53 15.28 19.28 16.49C18.76 17.87 18.04 19.24 17.04 20.29L17.05 20.28ZM12.03 7.25C11.88 5.02 13.69 3.18 15.77 3C16.02 5.44 13.45 7.36 12.03 7.25Z" fill="currentColor"/></svg>`,
                'android': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 5H9V4H15V5ZM16 8H8V15H16V8ZM7.5 17C7.5 17.83 6.83 18.5 6 18.5C5.17 18.5 4.5 17.83 4.5 17V9.5C4.5 8.67 5.17 8 6 8C6.83 8 7.5 8.67 7.5 9.5V17ZM19.5 17C19.5 17.83 18.83 18.5 18 18.5C17.17 18.5 16.5 17.83 16.5 17V9.5C16.5 8.67 17.17 8 18 8C18.83 8 19.5 8.67 19.5 9.5V17Z" fill="currentColor"/></svg>`,
                'watch': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 12C19 14.2 17.2 16 15 16H9C6.8 16 5 14.2 5 12C5 9.8 6.8 8 9 8H15C17.2 8 19 9.8 19 12ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10Z" fill="currentColor"/></svg>`,
                'tablet': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z" fill="currentColor"/></svg>`,
                // Ajoutez d'autres icônes si nécessaire
            };
            return icons[iconName] || `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="2"/></svg>`;
        }
        
        // ============================================
        // TOGGLE DROPDOWN
        // ============================================
        
        function toggleDropdown() {
            const menu = document.querySelector('.dropdown-menu');
            const icon = dropdownButton.querySelector('.material-symbols-outlined');
            
            if (menu.classList.contains('active')) {
                closeDropdown();
            } else {
                openDropdown();
            }
        }
        
        function openDropdown() {
            const menu = document.querySelector('.dropdown-menu');
            const icon = dropdownButton.querySelector('.material-symbols-outlined');
            
            menu.classList.add('active');
            dropdownButton.classList.add('active');
            if (icon) icon.style.transform = 'rotate(180deg)';
            
            console.log('Dropdown ouvert');
        }
        
        function closeDropdown() {
            const menu = document.querySelector('.dropdown-menu');
            const icon = dropdownButton.querySelector('.material-symbols-outlined');
            
            menu.classList.remove('active');
            dropdownButton.classList.remove('active');
            if (icon) icon.style.transform = 'rotate(0deg)';
            
            console.log('Dropdown fermé');
        }
        
        // ============================================
        // ÉVÉNEMENTS DES ITEMS
        // ============================================
        
        function attachDropdownItemEvents() {
            const items = document.querySelectorAll('.dropdown-item');
            
            items.forEach(function(item) {
                item.addEventListener('click', function(e) {
                    const category = this.getAttribute('data-category');
                    console.log('Catégorie sélectionnée:', category);
                    
                    // Déclencher un événement custom
                    const event = new CustomEvent('categorySelected', {
                        detail: { category: category, link: this.href }
                    });
                    document.dispatchEvent(event);
                    
                    // Fermer le dropdown (le lien sera suivi après)
                    closeDropdown();
                });
            });
        }
        
        console.log('Dropdown module initialisé');
    });
    
})();