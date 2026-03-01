// ============================================
// menu_burger.js - Menu burger pour mobile
// Crée dynamiquement le bouton et le panneau
// latéral de navigation responsive
// ============================================

(function() {
    'use strict';

    // ============================================
    // CRÉATION DU BOUTON BURGER
    // ============================================

    function createBurgerButton() {
        if (document.getElementById('burger-menu')) return;

        const burger = document.createElement('button');
        burger.id = 'burger-menu';
        burger.className = 'burger-btn';
        burger.setAttribute('aria-label', 'Ouvrir le menu');
        burger.setAttribute('aria-expanded', 'false'); // État initial : fermé
        burger.setAttribute('aria-controls', 'mobile-menu'); // Indique quel élément il contrôle
        burger.innerHTML = `<span class="material-symbols-outlined burger-icon">menu</span>`;

        const nav = document.querySelector('nav');
        if (nav) nav.insertBefore(burger, nav.firstChild);
    }

    // ============================================
    // CRÉATION DU MENU MOBILE ET DE L'OVERLAY
    // ============================================

    function createMobileMenu() {
        if (document.getElementById('mobile-menu')) return;

        // Overlay sombre derrière le menu
        const overlay = document.createElement('div');
        overlay.className = 'mobile-overlay';
        overlay.setAttribute('aria-hidden', 'true'); // Invisible aux lecteurs d'écran
        document.body.appendChild(overlay);

        const menu = document.createElement('div');
        menu.id = 'mobile-menu';
        menu.className = 'mobile-menu';
        menu.setAttribute('role', 'dialog'); // Sémantique ARIA : c'est une boîte de dialogue
        menu.setAttribute('aria-label', 'Menu de navigation');
        menu.setAttribute('aria-modal', 'true'); // Indique que c'est une modale

        menu.innerHTML = `
            <div class="mobile-menu-header">
                <div class="mobile-logo">
                    <div class="logo-icon"><img src="asset/image/LogoProjetEcf.png" alt="PearTech"
                    onerror="this.onerror=null;this.style.display='none';this.insertAdjacentText('afterend','PearTech');"></div>
                    <div>
                        <div class="logo-title">PearTech</div>
                        <div class="logo-subtitle">Boutique high-tech</div>
                    </div>
                </div>
                <button class="mobile-close" id="mobile-close" aria-label="Fermer le menu">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <div class="mobile-menu-content">
                <div class="mobile-search">
                    <span class="material-symbols-outlined" aria-hidden="true">search</span>
                    <input type="text" id="mobile-search-input" placeholder="Rechercher..." autocomplete="off">
                </div>
                <nav class="mobile-nav" aria-label="Navigation principale">
                    <h3 class="mobile-nav-title">Navigation</h3>
                    <a href="page_accueil.html" class="mobile-nav-item">
                        <span class="material-symbols-outlined" aria-hidden="true">home</span>
                        Accueil
                    </a>
                    <a href="page_catalogue.html" class="mobile-nav-item">
                        <span class="material-symbols-outlined" aria-hidden="true">grid_view</span>
                        Catalogue
                    </a>
                    <a href="page_favoris.html" class="mobile-nav-item">
                        <span class="material-symbols-outlined" aria-hidden="true">favorite</span>
                        Mes favoris
                    </a>
                </nav>
                <nav class="mobile-nav" aria-label="Catégories">
                    <h3 class="mobile-nav-title">Catégories</h3>
                    <a href="page_catalogue.html?categorie=apple" class="mobile-nav-item">
                        <span class="material-symbols-outlined" aria-hidden="true">phone_iphone</span>
                        Apple
                    </a>
                    <a href="page_catalogue.html?categorie=android" class="mobile-nav-item">
                        <span class="material-symbols-outlined" aria-hidden="true">android</span>
                        Android
                    </a>
                    <a href="page_catalogue.html?categorie=montres" class="mobile-nav-item">
                        <span class="material-symbols-outlined" aria-hidden="true">watch</span>
                        Montres connectées
                    </a>
                    <a href="page_catalogue.html?categorie=tablettes" class="mobile-nav-item">
                        <span class="material-symbols-outlined" aria-hidden="true">tablet</span>
                        Tablettes
                    </a>
                </nav>
                <div class="mobile-actions">
                    <a href="page_profil.html" class="mobile-action-btn">
                        <span class="material-symbols-outlined" aria-hidden="true">person</span>
                        Mon compte
                    </a>
                    <a href="page_favoris.html" class="mobile-action-btn">
                        <span class="material-symbols-outlined" aria-hidden="true">favorite</span>
                        Favoris
                    </a>
                    <a href="page_panier.html" class="mobile-action-btn">
                        <span class="material-symbols-outlined" aria-hidden="true">shopping_cart</span>
                        Panier
                    </a>
                </div>
            </div>
        `;

        document.body.appendChild(menu);
    }

    // ============================================
    // HIGHLIGHT DE LA PAGE ACTIVE
    // ============================================

    function highlightActivePage() {
        const currentPage = window.location.pathname.split('/').pop() || 'page_accueil.html';
        const currentSearch = window.location.search; // Ex: "?categorie=apple"

        document.querySelectorAll('.mobile-nav-item').forEach(function(link) {
            const linkPage   = link.getAttribute('href').split('?')[0]; // Chemin sans paramètres
            const linkSearch = link.getAttribute('href').includes('?')
                ? '?' + link.getAttribute('href').split('?')[1]
                : '';

            // Correspond si même page ET (même paramètre OU aucun paramètre des deux)
            const pageMatch   = linkPage === currentPage;
            const searchMatch = linkSearch === '' || linkSearch === currentSearch;

            if (pageMatch && searchMatch) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page'); // Indique la page courante aux lecteurs d'écran
            }
        });
    }

    // ============================================
    // TOGGLE / OUVERTURE / FERMETURE
    // ============================================

    function openMobileMenu(burgerBtn, mobileMenu, mobileOverlay) {
        mobileMenu.classList.add('active');
        mobileOverlay.classList.add('active');
        burgerBtn.classList.add('active');
        burgerBtn.setAttribute('aria-expanded', 'true');   // Indique l'état ouvert aux lecteurs d'écran
        burgerBtn.setAttribute('aria-label', 'Fermer le menu');
        document.body.style.overflow = 'hidden'; // Bloque le scroll de la page derrière

        // Focus sur le bouton fermer pour une navigation clavier cohérente
        const closeBtn = document.getElementById('mobile-close');
        if (closeBtn) closeBtn.focus();
    }

    function closeMobileMenu(burgerBtn, mobileMenu, mobileOverlay) {
        mobileMenu.classList.remove('active');
        mobileOverlay.classList.remove('active');
        burgerBtn.classList.remove('active');
        burgerBtn.setAttribute('aria-expanded', 'false');  // Indique l'état fermé aux lecteurs d'écran
        burgerBtn.setAttribute('aria-label', 'Ouvrir le menu');
        document.body.style.overflow = ''; // Rétablit le scroll normal de la page

        // Rend le focus au bouton burger après fermeture (bonne pratique clavier)
        burgerBtn.focus();
    }

    function toggleMobileMenu(burgerBtn, mobileMenu, mobileOverlay) {
        if (mobileMenu.classList.contains('active')) {
            closeMobileMenu(burgerBtn, mobileMenu, mobileOverlay);
        } else {
            openMobileMenu(burgerBtn, mobileMenu, mobileOverlay);
        }
    }

    // ============================================
    // SWIPE TO CLOSE (fermeture au glissement)
    // ============================================

    function attachSwipeToClose(mobileMenu, burgerBtn, mobileOverlay) {
        let touchStartX = 0; // Position X au début du toucher

        mobileMenu.addEventListener('touchstart', function(e) {
            touchStartX = e.touches[0].clientX; // Mémorise la position X initiale du doigt
        }, { passive: true }); // passive: true améliore les performances de scroll

        mobileMenu.addEventListener('touchend', function(e) {
            const touchEndX  = e.changedTouches[0].clientX; // Position X finale du doigt
            const deltaX     = touchEndX - touchStartX;     // Déplacement horizontal (positif = vers la droite)
            const SWIPE_THRESHOLD = 60;                     // Seuil minimal en pixels pour déclencher la fermeture

            // Glissement vers la gauche de plus de 60px → ferme le menu
            if (deltaX < -SWIPE_THRESHOLD) {
                closeMobileMenu(burgerBtn, mobileMenu, mobileOverlay);
            }
        }, { passive: true });
    }

    // ============================================
    // GESTION DU RESIZE (fermeture auto en desktop)
    // ============================================

    function attachResizeHandler(burgerBtn, mobileMenu, mobileOverlay) {
        // MediaQueryList : observe le passage mobile ↔ desktop en temps réel
        const desktopBreakpoint = window.matchMedia('(min-width: 768px)');

        function onBreakpointChange(e) {
            // Si on passe en mode desktop ET que le menu est ouvert → fermer proprement
            if (e.matches && mobileMenu.classList.contains('active')) {
                closeMobileMenu(burgerBtn, mobileMenu, mobileOverlay);
            }
        }

        // addEventListener sur MediaQueryList (plus performant qu'écouter window resize en continu)
        if (desktopBreakpoint.addEventListener) {
            desktopBreakpoint.addEventListener('change', onBreakpointChange);
        } else {
            // Fallback pour les navigateurs anciens (Safari < 14)
            desktopBreakpoint.addListener(onBreakpointChange);
        }
    }

    // ============================================
    // SYNCHRONISATION RECHERCHE MOBILE ↔ PRINCIPALE
    // ============================================

    function attachMobileSearch(burgerBtn, mobileMenu, mobileOverlay) {
        const mobileSearchInput = document.getElementById('mobile-search-input');
        const mainSearchInput   = document.getElementById('search-input');

        if (!mobileSearchInput) return; // Champ mobile absent : rien à faire

        if (mainSearchInput) {
            // Synchronise la saisie mobile avec le champ de recherche principal
            mobileSearchInput.addEventListener('input', function() {
                mainSearchInput.value = this.value;
                mainSearchInput.dispatchEvent(new Event('input', { bubbles: true }));
            });

            mobileSearchInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    mainSearchInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
                    closeMobileMenu(burgerBtn, mobileMenu, mobileOverlay); // Ferme le menu après validation
                }
            });
        }
    }

    // ============================================
    // TRAP DE FOCUS (accessibilité clavier)
    // ============================================

    function attachFocusTrap(mobileMenu, burgerBtn, mobileOverlay) {
        mobileMenu.addEventListener('keydown', function(e) {
            if (e.key !== 'Tab') return; // On ne gère que la touche Tab

            // Récupère tous les éléments interactifs focusables dans le menu
            const focusable = Array.from(
                mobileMenu.querySelectorAll('a, button, input, [tabindex]:not([tabindex="-1"])')
            ).filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);

            if (focusable.length === 0) return;

            const firstEl = focusable[0];                      // Premier élément focusable
            const lastEl  = focusable[focusable.length - 1];   // Dernier élément focusable

            if (e.shiftKey && document.activeElement === firstEl) {
                // Tab+Shift depuis le premier élément → revient au dernier (boucle)
                e.preventDefault();
                lastEl.focus();
            } else if (!e.shiftKey && document.activeElement === lastEl) {
                // Tab depuis le dernier élément → revient au premier (boucle)
                e.preventDefault();
                firstEl.focus();
            }
        });
    }

    // ============================================
    // INITIALISATION PRINCIPALE
    // ============================================

    document.addEventListener('DOMContentLoaded', function() {

        // Création des éléments DOM (dans l'ordre correct)
        createBurgerButton();
        createMobileMenu();

        // Récupération des éléments après création
        const burgerBtn     = document.getElementById('burger-menu');
        const mobileMenu    = document.getElementById('mobile-menu');
        const mobileOverlay = document.querySelector('.mobile-overlay');

        // Sécurité : arrête si les éléments n'ont pas pu être créés
        if (!burgerBtn || !mobileMenu || !mobileOverlay) {
            console.warn('menu_burger.js : éléments introuvables, initialisation annulée');
            return;
        }

        // Mise en évidence du lien de la page active
        highlightActivePage();

        // Attache les comportements
        attachSwipeToClose(mobileMenu, burgerBtn, mobileOverlay);
        attachResizeHandler(burgerBtn, mobileMenu, mobileOverlay);
        attachMobileSearch(burgerBtn, mobileMenu, mobileOverlay);
        attachFocusTrap(mobileMenu, burgerBtn, mobileOverlay);

        // ── Événements principaux ─────────────────────────────────

        // Clic sur le bouton burger : ouvre ou ferme le menu
        burgerBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Empêche le clic de remonter jusqu'au document
            toggleMobileMenu(burgerBtn, mobileMenu, mobileOverlay);
        });

        // Clic sur l'overlay sombre : ferme le menu
        mobileOverlay.addEventListener('click', function() {
            closeMobileMenu(burgerBtn, mobileMenu, mobileOverlay);
        });

        // Clic sur le bouton croix dans le menu : ferme le menu
        const closeBtn = document.getElementById('mobile-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                closeMobileMenu(burgerBtn, mobileMenu, mobileOverlay);
            });
        }

        // Touche Échap : ferme le menu si ouvert
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
                closeMobileMenu(burgerBtn, mobileMenu, mobileOverlay);
            }
        });

        // Clic sur un lien de navigation : ferme le menu puis navigue
        mobileMenu.querySelectorAll('.mobile-nav-item').forEach(function(item) {
            item.addEventListener('click', function() {
                closeMobileMenu(burgerBtn, mobileMenu, mobileOverlay);
            });
        });

    });

})();