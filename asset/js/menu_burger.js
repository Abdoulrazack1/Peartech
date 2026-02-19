// ============================================
// mobile-menu.js - Menu burger responsive
// Gestion du menu mobile avec animation
// ============================================

(function() {
    'use strict';
    
    document.addEventListener('DOMContentLoaded', function() {
        
        // ============================================
        // CRÉER LE MENU BURGER
        // ============================================
        
        createBurgerButton();
        createMobileMenu();
        
        const burgerBtn = document.getElementById('burger-menu');
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileOverlay = document.querySelector('.mobile-overlay');
        
        if (!burgerBtn || !mobileMenu) {
            console.warn('Éléments menu mobile introuvables');
            return;
        }
        
        // ============================================
        // TOGGLE MENU BURGER
        // ============================================
        
        burgerBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleMobileMenu();
        });
        
        // Fermer avec l'overlay
        if (mobileOverlay) {
            mobileOverlay.addEventListener('click', closeMobileMenu);
        }
        
        // Fermer avec Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
                closeMobileMenu();
            }
        });
        
        // ============================================
        // CRÉER LE BOUTON BURGER
        // ============================================
        
        function createBurgerButton() {
            // Vérifier si existe déjà
            if (document.getElementById('burger-menu')) return;
            
            const burger = document.createElement('button');
            burger.id = 'burger-menu';
            burger.className = 'burger-btn';
            burger.setAttribute('aria-label', 'Menu');
            
            // Utiliser Material Symbols
            burger.innerHTML = `
                <span class="material-symbols-outlined burger-icon">menu</span>
            `;
            
            // Insérer au début du header
            const nav = document.querySelector('nav');
            if (nav) {
                nav.insertBefore(burger, nav.firstChild);
            }
            
            console.log('Bouton burger créé');
        }
        
        // ============================================
        // CRÉER LE MENU MOBILE
        // ============================================
        
        function createMobileMenu() {
            // Vérifier si existe déjà
            if (document.getElementById('mobile-menu')) return;
            
            // Créer l'overlay
            const overlay = document.createElement('div');
            overlay.className = 'mobile-overlay';
            document.body.appendChild(overlay);
            
            // Créer le menu
            const menu = document.createElement('div');
            menu.id = 'mobile-menu';
            menu.className = 'mobile-menu';
            
            menu.innerHTML = `
                <div class="mobile-menu-header">
                    <div class="mobile-logo">
                        <div class="logo-icon"><img src="asset/image/LogoProjetEcf.png" alt=""</div>
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
                    <!-- Recherche mobile -->
                    <div class="mobile-search">
                        <span class="material-symbols-outlined">search</span>
                        <input type="text" placeholder="Rechercher...">
                    </div>
                    
                    <!-- Navigation principale -->
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
                    
                    <!-- Catégories -->
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
                    
                    <!-- Actions -->
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
            
            // Attacher événement de fermeture
            const closeBtn = document.getElementById('mobile-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', closeMobileMenu);
            }
            
            // Fermer au clic sur un lien
            const navItems = menu.querySelectorAll('.mobile-nav-item');
            navItems.forEach(item => {
                item.addEventListener('click', function() {
                    closeMobileMenu();
                });
            });
            
            console.log('Menu mobile créé');
        }
        
        // ============================================
        // TOGGLE / OPEN / CLOSE
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
            
            // Changer l'icône en X
            const icon = burgerBtn.querySelector('.burger-icon');
            if (icon) icon.textContent = 'close';
            
            document.body.style.overflow = 'hidden';
            
            console.log('Menu mobile ouvert');
        }
        
        function closeMobileMenu() {
            mobileMenu.classList.remove('active');
            mobileOverlay.classList.remove('active');
            burgerBtn.classList.remove('active');
            
            // Remettre l'icône menu
            const icon = burgerBtn.querySelector('.burger-icon');
            if (icon) icon.textContent = 'menu';
            
            document.body.style.overflow = '';
            
            console.log('Menu mobile fermé');
        }
        
        console.log('Mobile menu module initialisé');
    });
    
})();