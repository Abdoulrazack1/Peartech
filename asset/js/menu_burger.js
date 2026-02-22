// ============================================
// menu_burger.js - Menu burger pour mobile
// Crée dynamiquement le bouton et le panneau
// latéral de navigation responsive
// ============================================

(function() {
    'use strict'; // Mode strict activé

    document.addEventListener('DOMContentLoaded', function() {

        // ── Création des éléments du menu mobile ─────────────────

        createBurgerButton(); // Crée et insère le bouton hamburger dans le header
        createMobileMenu();   // Crée le panneau de navigation latéral et l'overlay

        // Récupère les éléments créés (ils existent maintenant dans le DOM)
        const burgerBtn    = document.getElementById('burger-menu');   // Bouton hamburger
        const mobileMenu   = document.getElementById('mobile-menu');   // Panneau latéral
        const mobileOverlay = document.querySelector('.mobile-overlay'); // Fond semi-transparent

        if (!burgerBtn || !mobileMenu) { // Vérifie que les éléments ont bien été créés
            console.warn('Éléments menu mobile introuvables');
            return;
        }

        // ── Événements d'ouverture et fermeture ───────────────────

        burgerBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Empêche l'événement de remonter (évite fermeture immédiate)
            toggleMobileMenu(); // Bascule l'état du menu
        });

        if (mobileOverlay) { // Si l'overlay existe
            mobileOverlay.addEventListener('click', closeMobileMenu); // Clic sur le fond = ferme le menu
        }

        // Fermeture avec la touche Escape (accessibilité clavier)
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
                closeMobileMenu();
            }
        });

        // ============================================
        // CRÉATION DU BOUTON BURGER
        // ============================================

        function createBurgerButton() {
            if (document.getElementById('burger-menu')) return; // Déjà créé : on ne recrée pas

            const burger = document.createElement('button'); // Crée un élément bouton
            burger.id = 'burger-menu';                       // ID pour le récupérer ensuite
            burger.className = 'burger-btn';                 // Classe CSS pour le style
            burger.setAttribute('aria-label', 'Menu');       // Label accessible (lecteurs d'écran)

            // Icône Material Symbols : "menu" = trois barres horizontales (hamburger)
            burger.innerHTML = `
                <span class="material-symbols-outlined burger-icon">menu</span>
            `;

            const nav = document.querySelector('nav'); // Récupère la navigation dans le header
            if (nav) {
                nav.insertBefore(burger, nav.firstChild); // Insère le bouton avant le premier élément du nav
            }

            console.log('Bouton burger créé');
        }

        // ============================================
        // CRÉATION DU MENU MOBILE ET DE L'OVERLAY
        // ============================================

        function createMobileMenu() {
            if (document.getElementById('mobile-menu')) return; // Déjà créé

            // ── Overlay (fond semi-transparent) ───────────────────
            const overlay = document.createElement('div');
            overlay.className = 'mobile-overlay'; // Classe CSS pour le fond sombre
            document.body.appendChild(overlay);   // Ajoute à la fin du body

            // ── Panneau de navigation latéral ─────────────────────
            const menu = document.createElement('div');
            menu.id = 'mobile-menu';         // ID pour le récupérer ensuite
            menu.className = 'mobile-menu';  // Classe CSS pour le style du panneau

            // Construction du HTML interne du menu
            menu.innerHTML = `
                <!-- En-tête du menu avec logo et bouton fermer -->
                <div class="mobile-menu-header">
                    <div class="mobile-logo">
                        <div class="logo-icon"><img src="asset/image/LogoProjetEcf.png" alt=""></div>
                        <div>
                            <div class="logo-title">PearTech</div>
                            <div class="logo-subtitle">Boutique high-tech</div>
                        </div>
                    </div>
                    <!-- Bouton de fermeture (croix) -->
                    <button class="mobile-close" id="mobile-close">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div class="mobile-menu-content">
                    <!-- Barre de recherche adaptée au mobile -->
                    <div class="mobile-search">
                        <span class="material-symbols-outlined">search</span>
                        <input type="text" placeholder="Rechercher...">
                    </div>

                    <!-- Navigation principale (pages du site) -->
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

                    <!-- Navigation par catégories de produits -->
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

                    <!-- Raccourcis vers les pages compte, favoris, panier -->
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

            document.body.appendChild(menu); // Ajoute le panneau à la fin du body

            // ── Bouton fermer (croix) dans l'en-tête du menu ─────
            const closeBtn = document.getElementById('mobile-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', closeMobileMenu); // Clic sur la croix = ferme
            }

            // ── Fermeture automatique au clic sur un lien ─────────
            // Évite que le menu reste ouvert après navigation
            const navItems = menu.querySelectorAll('.mobile-nav-item');
            navItems.forEach(item => {
                item.addEventListener('click', function() {
                    closeMobileMenu(); // Ferme le menu quand l'utilisateur clique sur un lien
                });
            });

            console.log('Menu mobile créé');
        }

        // ============================================
        // TOGGLE / OUVERTURE / FERMETURE
        // ============================================

        function toggleMobileMenu() {
            if (mobileMenu.classList.contains('active')) {
                closeMobileMenu(); // Déjà ouvert : on ferme
            } else {
                openMobileMenu();  // Fermé : on ouvre
            }
        }

        function openMobileMenu() {
            mobileMenu.classList.add('active');    // Affiche le panneau (CSS gère la translation)
            mobileOverlay.classList.add('active'); // Affiche le fond semi-transparent
            burgerBtn.classList.add('active');     // Style actif sur le bouton burger

            const icon = burgerBtn.querySelector('.burger-icon');
            if (icon) icon.textContent = 'close'; // Change l'icône hamburger → croix

            document.body.style.overflow = 'hidden'; // Bloque le scroll de la page derrière le menu

            console.log('Menu mobile ouvert');
        }

        function closeMobileMenu() {
            mobileMenu.classList.remove('active');    // Cache le panneau
            mobileOverlay.classList.remove('active'); // Cache l'overlay
            burgerBtn.classList.remove('active');     // Retire le style actif du bouton

            const icon = burgerBtn.querySelector('.burger-icon');
            if (icon) icon.textContent = 'menu'; // Remet l'icône hamburger

            document.body.style.overflow = ''; // Rétablit le scroll normal de la page

            console.log('Menu mobile fermé');
        }

        console.log('Mobile menu module initialisé');
    });

})(); // Fin de l'IIFE