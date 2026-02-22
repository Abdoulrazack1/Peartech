// ============================================
// darkmode.js - Gestion du thème sombre/clair
// Bascule entre dark et light mode, avec
// sauvegarde de la préférence dans localStorage
// ============================================

(function() {
    'use strict'; // Mode strict activé

    document.addEventListener('DOMContentLoaded', function() {

        // ── Récupération du bouton de bascule ─────────────────────

        const themeToggle = document.getElementById('theme-toggle'); // Bouton dans le header

        if (!themeToggle) { // Si le bouton n'est pas trouvé (page sans header ?)
            console.warn('Bouton theme-toggle introuvable');
            return; // On arrête : impossible d'activer le toggle
        }

        // Récupère l'icône Material Symbols à l'intérieur du bouton (sun ou moon)
        const themeIcon = themeToggle.querySelector('.material-symbols-outlined');

        // ── Chargement de la préférence sauvegardée ───────────────

        // Lit le thème depuis localStorage, ou utilise 'dark' par défaut si aucune préférence
        const savedTheme = localStorage.getItem('peartech-theme') || 'dark';

        applyTheme(savedTheme); // Applique immédiatement le thème sauvegardé au chargement de la page

        // ── Événement de clic sur le bouton ───────────────────────

        themeToggle.addEventListener('click', function() {
            // Détermine le thème actuellement actif en vérifiant la classe CSS du body
            const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark'; // Bascule vers l'autre thème

            applyTheme(newTheme); // Applique le nouveau thème
            localStorage.setItem('peartech-theme', newTheme); // Sauvegarde la nouvelle préférence

            console.log('Thème changé:', newTheme); // Log de debug
        });

        // ── Fonction d'application du thème ───────────────────────

        function applyTheme(theme) {
            if (theme === 'dark') {
                document.body.classList.add('dark-mode');         // Ajoute la classe qui active le dark mode via CSS
                if (themeIcon) themeIcon.textContent = 'light_mode'; // Affiche l'icône soleil (pour passer en clair)
            } else {
                document.body.classList.remove('dark-mode');      // Retire la classe pour revenir au thème clair
                if (themeIcon) themeIcon.textContent = 'dark_mode'; // Affiche l'icône lune (pour passer en sombre)
            }
        }

        console.log('Theme module initialisé - Mode:', savedTheme); // Log de confirmation
    });

})(); // Fin de l'IIFE