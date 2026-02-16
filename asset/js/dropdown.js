// ============================================
// dropdown.js - Menu déroulant
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
                        icon: 'laptop',
                        title: 'Ordinateurs Portables',
                        description: 'Ultrabooks, laptops professionnels et étudiants',
                        subcategories: ['Ultrabooks', 'Gaming Laptops', 'Professionnels', 'Étudiants'],
                        slug: 'portables'
                    },
                    {
                        icon: 'desktop_windows',
                        title: 'Ordinateurs Fixes',
                        description: 'Tours bureautiques, stations de travail',
                        subcategories: ['Bureautique', 'Stations de travail', 'Mini PC', 'All-in-One'],
                        slug: 'fixes'
                    },
                    {
                        icon: 'stadia_controller',
                        title: 'PC Gamers',
                        description: 'Gaming haute performance et configurations sur mesure',
                        subcategories: ['Setup complet', 'Tours gaming', 'RGB', 'Watercooling'],
                        slug: 'gamers'
                    },
                    {
                        icon: 'brush',
                        title: 'Création & Design',
                        description: 'Pour montage vidéo, 3D et design graphique',
                        subcategories: ['Video editing', 'Rendu 3D', 'Design graphique'],
                        slug: 'creation'
                    },
                    {
                        icon: 'memory',
                        title: 'Composants',
                        description: 'Processeurs, cartes graphiques, RAM, stockage',
                        subcategories: ['CPU', 'GPU', 'RAM', 'SSD/HDD', 'Cartes mères'],
                        slug: 'composants'
                    },
                    {
                        icon: 'devices',
                        title: 'Périphériques',
                        description: 'Écrans, claviers, souris et accessoires',
                        subcategories: ['Écrans', 'Claviers', 'Souris', 'Casques', 'Webcams'],
                        slug: 'peripheriques'
                    }
                ];
            }
            
            // Générer le HTML du menu
            let html = '<div class="dropdown-header">Toutes les catégories</div>';
            html += '<div class="dropdown-grid">';
            
            categories.forEach(function(cat) {
                html += `
                    <a href="page_catalogue.html?categorie=${cat.slug}" class="dropdown-item" data-category="${cat.title}">
                        <span class="material-symbols-outlined dropdown-icon">${cat.icon}</span>
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
        
        // ============================================
        // ANIMATION HOVER ITEMS
        // ============================================
        
        const style = document.createElement('style');
        style.textContent = `
            .dropdown-item:hover .dropdown-icon {
                transform: scale(1.1);
                color: var(--primary);
            }
        `;
        document.head.appendChild(style);
        
        console.log('Dropdown module initialisé');
    });
    
})();