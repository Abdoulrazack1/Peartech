// ============================================
// main.js - Point d'entrée principal
// Initialise les événements globaux, expose des
// utilitaires communs et log les performances
// ============================================

(function() {
    'use strict'; // Mode strict activé

    // ── Configuration globale ─────────────────────────────────────

    const CONFIG = {
        siteName: 'PearTech', // Nom du site (utilisé dans les logs)
        version: '1.0.0',     // Version de l'application
        debug: true           // Active les logs de debug (mettre false en production)
    };

    document.addEventListener('DOMContentLoaded', function() {

        // ── Log de démarrage ──────────────────────────────────────

        if (CONFIG.debug) {
            // Affiche le nom du site en bleu gras dans la console
            console.log('%c' + CONFIG.siteName + ' v' + CONFIG.version,
                'color: #3B82F6; font-size: 16px; font-weight: bold');
            // Liste tous les modules qui doivent être chargés
            console.log('Modules chargés:');
            console.log('✓ theme.js - Dark/Light mode');
            console.log('✓ search.js - Recherche produits');
            console.log('✓ animations.js - Scroll reveal');
            console.log('✓ filters.js - Filtres et tabs');
            console.log('✓ cart.js - Panier');
        }

        // ── Écoute des événements custom globaux ──────────────────
        // Ces événements sont émis par les autres modules via dispatchEvent

        // Écoute les changements de filtre (émis par filtre.js)
        document.addEventListener('filterChanged', function(e) {
            if (CONFIG.debug) {
                console.log('Filtre changé:', e.detail.filter); // Log le nouveau filtre appliqué
            }
        });

        // Écoute les ajouts au panier (émis par panier.js)
        document.addEventListener('productAddedToCart', function(e) {
            if (CONFIG.debug) {
                console.log('Produit ajouté:', e.detail.name); // Log le nom du produit ajouté
            }
        });

        // Écoute les sélections de produit (émis par product_grid.js ou catalogue.js)
        document.addEventListener('productSelected', function(e) {
            if (CONFIG.debug) {
                console.log('Produit sélectionné:', e.detail.name);
            }
        });

        // ── Utilitaires globaux accessibles partout ───────────────
        // window.PearTech permet à tous les scripts d'accéder à ces fonctions

        window.PearTech = {
            version: CONFIG.version, // Expose la version de l'app

            // Déclenche un événement de notification (ex: pour une future modale toast)
            notify: function(message, type) {
                const event = new CustomEvent('showNotification', {
                    detail: { message: message, type: type || 'info' } // Type par défaut : 'info'
                });
                document.dispatchEvent(event); // Publie l'événement sur le document
            },

            // Retourne le thème actuel ('dark' ou 'light')
            getTheme: function() {
                return document.body.classList.contains('dark-mode') ? 'dark' : 'light';
            },

            // Change le thème et le sauvegarde dans localStorage
            setTheme: function(theme) {
                if (theme === 'dark') {
                    document.body.classList.add('dark-mode');           // Active le dark mode
                    localStorage.setItem('peartech-theme', 'dark');    // Sauvegarde la préférence
                } else {
                    document.body.classList.remove('dark-mode');        // Désactive le dark mode
                    localStorage.setItem('peartech-theme', 'light');   // Sauvegarde la préférence
                }
            }
        };

        // ── Mesure du temps de chargement ─────────────────────────

        if (CONFIG.debug) {
            window.addEventListener('load', function() { // Après le chargement complet (images, scripts...)
                const loadTime = performance.now(); // Temps écoulé depuis la navigation en ms
                console.log('Page chargée en', Math.round(loadTime), 'ms');
            });
        }
    });

})(); // Fin de l'IIFE