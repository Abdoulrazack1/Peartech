// ============================================
// main.js - Fichier principal
// Initialisation globale et configuration
// ============================================

(function() {
    'use strict';
    
    // ============================================
    // CONFIGURATION
    // ============================================
    
    const CONFIG = {
        siteName: 'NovaCompute',
        version: '1.0.0',
        debug: true
    };
    
    // ============================================
    // INITIALISATION
    // ============================================
    
    document.addEventListener('DOMContentLoaded', function() {
        
        if (CONFIG.debug) {
            console.log('%c' + CONFIG.siteName + ' v' + CONFIG.version, 
                'color: #3B82F6; font-size: 16px; font-weight: bold');
            console.log('Modules chargés:');
            console.log('✓ theme.js - Dark/Light mode');
            console.log('✓ search.js - Recherche produits');
            console.log('✓ animations.js - Scroll reveal');
            console.log('✓ filters.js - Filtres et tabs');
            console.log('✓ cart.js - Panier');
        }
        
        // ============================================
        // ÉVÉNEMENTS GLOBAUX
        // ============================================
        
        // Écouter les changements de filtre
        document.addEventListener('filterChanged', function(e) {
            if (CONFIG.debug) {
                console.log('Filtre changé:', e.detail.filter);
            }
        });
        
        // Écouter les ajouts au panier
        document.addEventListener('productAddedToCart', function(e) {
            if (CONFIG.debug) {
                console.log('Produit ajouté:', e.detail.name);
            }
        });
        
        // Écouter les sélections de produit
        document.addEventListener('productSelected', function(e) {
            if (CONFIG.debug) {
                console.log('Produit sélectionné:', e.detail.name);
            }
        });
        
        // ============================================
        // UTILITAIRES GLOBAUX
        // ============================================
        
        // Exposer des fonctions utiles globalement
        window.NovaCompute = {
            version: CONFIG.version,
            
            // Fonction pour afficher une notification depuis n'importe où
            notify: function(message, type) {
                const event = new CustomEvent('showNotification', {
                    detail: { message: message, type: type || 'info' }
                });
                document.dispatchEvent(event);
            },
            
            // Fonction pour obtenir le thème actuel
            getTheme: function() {
                return document.body.classList.contains('dark-mode') ? 'dark' : 'light';
            },
            
            // Fonction pour changer le thème
            setTheme: function(theme) {
                if (theme === 'dark') {
                    document.body.classList.add('dark-mode');
                    localStorage.setItem('novacompute-theme', 'dark');
                } else {
                    document.body.classList.remove('dark-mode');
                    localStorage.setItem('novacompute-theme', 'light');
                }
            }
        };
        
        // ============================================
        // LOGGING PERFORMANCE
        // ============================================
        
        if (CONFIG.debug) {
            window.addEventListener('load', function() {
                const loadTime = performance.now();
                console.log('Page chargée en', Math.round(loadTime), 'ms');
            });
        }
        
    });
    
})();