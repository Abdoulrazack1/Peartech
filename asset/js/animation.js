// ============================================
// animations.js - Animations au scroll
// Reveal et animations d'entrée
// ============================================

(function() {
    'use strict';
    
    document.addEventListener('DOMContentLoaded', function() {
        
        // ============================================
        // SCROLL REVEAL - Cartes
        // ============================================
        
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        // Fonction pour attacher l'observer à une card
        function observeCard(card) {
            if (card.dataset.scrollObserved) return; // éviter les doublons
            card.dataset.scrollObserved = '1';

            // Vérifier si la card est déjà dans le viewport
            const rect = card.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

            if (isVisible) {
                // Déjà visible : afficher directement sans animation
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            } else {
                // Hors viewport : animation scroll reveal
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                observer.observe(card);
            }
        }

        // Observer les cartes déjà présentes
        document.querySelectorAll('.category-card, .service-card').forEach(observeCard);

        // MutationObserver pour observer les product-cards générées dynamiquement
        const mutationObs = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType !== 1) return;
                    if (node.classList && node.classList.contains('product-card')) {
                        observeCard(node);
                    }
                    // Chercher dans les enfants aussi (cas où le conteneur entier est rerendu)
                    node.querySelectorAll && node.querySelectorAll('.product-card').forEach(observeCard);
                });
            });
        });

        const productsGrid = document.getElementById('products-grid');
        if (productsGrid) {
            mutationObs.observe(productsGrid, { childList: true, subtree: true });
        }

        // Aussi observer les product-cards déjà présentes au moment du DOMContentLoaded
        document.querySelectorAll('.product-card').forEach(observeCard);

        console.log('Scroll reveal activé (MutationObserver inclus)');
        
        // ============================================
        // HEADER SCROLL EFFECT
        // ============================================
        
        const header = document.querySelector('.header');
        
        if (header) {
            window.addEventListener('scroll', function() {
                if (window.pageYOffset > 50) {
                    header.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                } else {
                    header.style.boxShadow = 'none';
                }
            });
        }
        
        // ============================================
        // SEARCH BAR FOCUS ANIMATION
        // ============================================
        
        const searchInput = document.getElementById('search-input');
        const searchBar = document.querySelector('.search-bar');
        
        if (searchInput && searchBar) {
            searchInput.addEventListener('focus', function() {
                searchBar.style.transform = 'scale(1.02)';
            });
            
            searchInput.addEventListener('blur', function() {
                setTimeout(function() {
                    searchBar.style.transform = 'scale(1)';
                }, 200);
            });
        }
        
        // ============================================
        // SMOOTH SCROLL (liens ancre)
        // ============================================
        
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
        
        console.log('Animations module initialisé');
    });
    
})();