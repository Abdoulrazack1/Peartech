// ============================================
// animation.js - Animations au scroll
// Gère l'apparition progressive des éléments
// et les effets visuels au défilement de page
// ============================================

// IIFE (Immediately Invoked Function Expression) :
// encapsule tout le code pour éviter de polluer le scope global
(function() {
    'use strict'; // Active le mode strict JS pour détecter les erreurs silencieuses

    // On attend que le DOM soit entièrement chargé avant d'exécuter le code
    document.addEventListener('DOMContentLoaded', function() {

        // ============================================
        // SCROLL REVEAL - Apparition des cartes au scroll
        // Utilise l'API IntersectionObserver pour détecter
        // quand un élément entre dans la zone visible de l'écran
        // ============================================

        // Options de configuration de l'IntersectionObserver
        const observerOptions = {
            threshold: 0.1,          // Déclenche quand 10% de l'élément est visible
            rootMargin: '0px 0px -50px 0px' // Marge négative en bas : l'animation se déclenche 50px avant le bord
        };

        // Crée un observateur qui surveille l'entrée des éléments dans le viewport
        const observer = new IntersectionObserver(function(entries) {
            // On parcourt chaque élément observé
            entries.forEach(entry => {
                if (entry.isIntersecting) { // Si l'élément est maintenant visible
                    entry.target.style.opacity = '1';             // On le rend visible
                    entry.target.style.transform = 'translateY(0)'; // On annule le décalage vertical initial
                }
            });
        }, observerOptions); // On passe les options définies ci-dessus

        // ── Fonction d'attachement de l'observer à une carte ──────

        // Attache l'observer à une carte produit ou catégorie
        function observeCard(card) {
            if (card.dataset.scrollObserved) return; // Empêche d'observer la même carte deux fois
            card.dataset.scrollObserved = '1'; // Marque la carte comme déjà observée

            // Vérifie si la carte est déjà dans la zone visible de l'écran
            const rect = card.getBoundingClientRect(); // Retourne la position et les dimensions de l'élément
            // Une carte est visible si son haut est au-dessus du bas de l'écran ET son bas est en dessous du haut
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

            if (isVisible) {
                // La carte est déjà visible : on l'affiche directement sans animation
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            } else {
                // La carte est hors écran : on la prépare pour l'animation d'entrée
                card.style.opacity = '0';              // Invisible au départ
                card.style.transform = 'translateY(20px)'; // Légèrement décalée vers le bas
                card.style.transition = 'opacity 0.5s ease, transform 0.5s ease'; // Transition fluide de 0.5s
                observer.observe(card); // L'IntersectionObserver commence à surveiller cet élément
            }
        }

        // ── Observer les éléments statiques déjà présents dans le DOM ──

        // Sélectionne et observe toutes les cartes de catégories et de services déjà dans la page
        document.querySelectorAll('.category-card, .service-card').forEach(observeCard);

        // ── MutationObserver : surveille les éléments ajoutés dynamiquement ──
        // Nécessaire car les product-cards sont générées par JS après le chargement initial

        // Crée un observateur du DOM pour détecter les nouveaux éléments ajoutés
        const mutationObs = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) { // Pour chaque modification du DOM
                mutation.addedNodes.forEach(function(node) { // Pour chaque nœud ajouté
                    if (node.nodeType !== 1) return; // Ignore les nœuds qui ne sont pas des éléments HTML
                    // Si le nœud ajouté est directement une product-card
                    if (node.classList && node.classList.contains('product-card')) {
                        observeCard(node); // On l'observe immédiatement
                    }
                    // Cas où un conteneur entier est re-rendu (ex: grille entière rechargée)
                    // On cherche aussi les product-cards enfants du nœud ajouté
                    node.querySelectorAll && node.querySelectorAll('.product-card').forEach(observeCard);
                });
            });
        });

        // Récupère la grille de produits si elle existe sur la page courante
        const productsGrid = document.getElementById('products-grid');
        if (productsGrid) {
            // Lance la surveillance des enfants directs et de tous les descendants
            mutationObs.observe(productsGrid, { childList: true, subtree: true });
        }

        // Observe également les product-cards déjà présentes au chargement de la page
        document.querySelectorAll('.product-card').forEach(observeCard);

        console.log('Scroll reveal activé (MutationObserver inclus)'); // Log de confirmation

        // ============================================
        // HEADER SCROLL EFFECT
        // Ajoute une ombre sous le header quand on défile
        // pour renforcer la séparation visuelle
        // ============================================

        const header = document.querySelector('.header'); // Sélectionne l'élément header

        if (header) { // Vérifie que le header existe sur cette page
            // Écoute l'événement scroll sur la fenêtre
            window.addEventListener('scroll', function() {
                if (window.pageYOffset > 50) { // Si on a scrollé de plus de 50px
                    header.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)'; // Ajoute une ombre portée
                } else {
                    header.style.boxShadow = 'none'; // Supprime l'ombre en haut de page
                }
            });
        }

        // ============================================
        // SEARCH BAR FOCUS ANIMATION
        // Légère mise en avant de la barre de recherche
        // quand l'utilisateur clique dessus
        // ============================================

        const searchInput = document.getElementById('search-input'); // Champ de saisie de recherche
        const searchBar = document.querySelector('.search-bar');     // Conteneur de la barre de recherche

        if (searchInput && searchBar) { // Vérifie que les deux éléments existent
            // Quand l'utilisateur clique sur le champ de recherche
            searchInput.addEventListener('focus', function() {
                searchBar.style.transform = 'scale(1.02)'; // Légère augmentation de taille (zoom 2%)
            });

            // Quand l'utilisateur quitte le champ de recherche
            searchInput.addEventListener('blur', function() {
                // Délai de 200ms pour éviter un effet saccadé lors du clic sur un résultat
                setTimeout(function() {
                    searchBar.style.transform = 'scale(1)'; // Retour à la taille normale
                }, 200);
            });
        }

        // ============================================
        // SMOOTH SCROLL - Défilement fluide
        // Intercepte les clics sur les liens ancres (#)
        // pour animer le défilement au lieu d'un saut brutal
        // ============================================

        // Sélectionne tous les liens dont le href commence par "#" (liens ancres)
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault(); // Annule le comportement par défaut (saut brutal)
                const target = document.querySelector(this.getAttribute('href')); // Récupère l'élément cible
                if (target) { // Vérifie que la cible existe
                    target.scrollIntoView({
                        behavior: 'smooth', // Animation fluide du défilement
                        block: 'start'      // Aligne le haut de la cible avec le haut de la fenêtre
                    });
                }
            });
        });

        console.log('Animations module initialisé'); // Confirmation que le module est chargé
    });

})(); // Fin de l'IIFE : le code s'exécute immédiatement