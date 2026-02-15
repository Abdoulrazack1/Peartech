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
        
        // Observer les cartes
        const cards = document.querySelectorAll('.category-card, .product-card, .service-card');
        cards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            observer.observe(card);
        });
        
        console.log('Scroll reveal activé sur', cards.length, 'éléments');
        
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