// ============================================
// menu_burger.js - Menu burger pour mobile
// Crée dynamiquement le bouton et le panneau
// latéral de navigation responsive
// ============================================

(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {

        createBurgerButton();
        createMobileMenu();

        const burgerBtn    = document.getElementById('burger-menu');
        const mobileMenu   = document.getElementById('mobile-menu');
        const mobileOverlay = document.querySelector('.mobile-overlay');

        if (!burgerBtn || !mobileMenu) {
            console.warn('Éléments menu mobile introuvables');
            return;
        }

        burgerBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleMobileMenu();
        });

        if (mobileOverlay) {
            mobileOverlay.addEventListener('click', closeMobileMenu);
        }

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
                closeMobileMenu();
            }
        });

        // ============================================
        // CRÉATION DU BOUTON BURGER
        // ============================================

        function createBurgerButton() {
            if (document.getElementById('burger-menu')) return;

            const burger = document.createElement('button');
            burger.id = 'burger-menu';
            burger.className = 'burger-btn';
            burger.setAttribute('aria-label', 'Menu');
            burger.innerHTML = `
                <span class="material-symbols-outlined burger-icon">menu</span>
            `;

            const nav = document.querySelector('nav');
            if (nav) {
                nav.insertBefore(burger, nav.firstChild);
            }
            console.log('Bouton burger créé');
        }

        // ============================================
        // CRÉATION DU MENU MOBILE ET DE L'OVERLAY
        // ============================================

        function createMobileMenu() {
            if (document.getElementById('mobile-menu')) return;

            const overlay = document.createElement('div');
            overlay.className = 'mobile-overlay';
            document.body.appendChild(overlay);

            const menu = document.createElement('div');
            menu.id = 'mobile-menu';
            menu.className = 'mobile-menu';

            menu.innerHTML = `
                <div class="mobile-menu-header">
                    <div class="mobile-logo">
                        <div class="logo-icon"><img src="asset/image/LogoProjetEcf.png" alt=""></div>
                        <div>
                            <div class="logo-title">PearTech</div>
                            <div class="logo-subtitle">Boutique high-tech</div>
                        </div>
                    </div>
                    <button class="mobile-close" id="mobile-close">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div class="mobile-menu-content">
                    <div class="mobile-search">
                        <span class="material-symbols-outlined">search</span>
                        <input type="text" id="mobile-search-input" placeholder="Rechercher...">
                    </div>
                    <nav class="mobile-nav">
                        <h3 class="mobile-nav-title">Navigation</h3>
                        <a href="page_accueil.html" class="mobile-nav-item">
                            <span class="material-symbols-outlined">home</span>
                            Accueil
                        </a>
                        <a href="page_catalogue.html" class="mobile-nav-item">
                            <span class="material-symbols-outlined">grid_view</span>
                            Catalogue
                        </a>
                        <a href="page_favoris.html" class="mobile-nav-item">
                            <span class="material-symbols-outlined">favorite</span>
                            Mes favoris
                        </a>
                    </nav>
                    <nav class="mobile-nav">
                        <h3 class="mobile-nav-title">Catégories</h3>
                        <a href="page_catalogue.html?categorie=apple" class="mobile-nav-item">
                            <span class="material-symbols-outlined">phone_iphone</span>
                            Apple
                        </a>
                        <a href="page_catalogue.html?categorie=android" class="mobile-nav-item">
                            <span class="material-symbols-outlined">android</span>
                            Android
                        </a>
                        <a href="page_catalogue.html?categorie=montres" class="mobile-nav-item">
                            <span class="material-symbols-outlined">watch</span>
                            Montres connectées
                        </a>
                        <a href="page_catalogue.html?categorie=tablettes" class="mobile-nav-item">
                            <span class="material-symbols-outlined">tablet</span>
                            Tablettes
                        </a>
                    </nav>
                    <div class="mobile-actions">
                        <a href="page_profil.html" class="mobile-action-btn">
                            <span class="material-symbols-outlined">person</span>
                            Mon compte
                        </a>
                        <a href="page_favoris.html" class="mobile-action-btn">
                            <span class="material-symbols-outlined">favorite</span>
                            Favoris
                        </a>
                        <a href="page_panier.html" class="mobile-action-btn">
                            <span class="material-symbols-outlined">shopping_cart</span>
                            Panier
                        </a>
                    </div>
                </div>
            `;

            document.body.appendChild(menu);

            const closeBtn = document.getElementById('mobile-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', closeMobileMenu);
            }

            const navItems = menu.querySelectorAll('.mobile-nav-item');
            navItems.forEach(item => {
                item.addEventListener('click', function() {
                    closeMobileMenu();
                });
            });

            // === CORRECTION : Lier la recherche mobile à la recherche principale ===
            const mobileSearchInput = document.getElementById('mobile-search-input');
            const mainSearchInput = document.getElementById('search-input');
            if (mobileSearchInput && mainSearchInput) {
                mobileSearchInput.addEventListener('input', function(e) {
                    // Mettre à jour le champ principal
                    mainSearchInput.value = this.value;
                    // Déclencher l'événement input pour lancer la recherche
                    mainSearchInput.dispatchEvent(new Event('input', { bubbles: true }));
                });
                mobileSearchInput.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        // Simuler la même action que la recherche principale (souvent gérée par un événement)
                        mainSearchInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
                        closeMobileMenu(); // Fermer le menu après la recherche
                    }
                });
            }

            console.log('Menu mobile créé');
        }

        // ============================================
        // TOGGLE / OUVERTURE / FERMETURE
        // ============================================

        function toggleMobileMenu() {
            if (mobileMenu.classList.contains('active')) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        }

        function openMobileMenu() {
            mobileMenu.classList.add('active');
            mobileOverlay.classList.add('active');
            burgerBtn.classList.add('active');

            const icon = burgerBtn.querySelector('.burger-icon');
            if (icon) icon.textContent = 'close';

            document.body.style.overflow = 'hidden';
            console.log('Menu mobile ouvert');
        }

        function closeMobileMenu() {
            mobileMenu.classList.remove('active');
            mobileOverlay.classList.remove('active');
            burgerBtn.classList.remove('active');

            const icon = burgerBtn.querySelector('.burger-icon');
            if (icon) icon.textContent = 'menu';

            document.body.style.overflow = '';
            console.log('Menu mobile fermé');
        }

        console.log('Mobile menu module initialisé');
    });

})();