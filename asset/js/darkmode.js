// ============================================
// darkmode.js - Gestion du thème sombre/clair
// Bascule entre dark et light mode, avec
// sauvegarde de la préférence dans localStorage
// ============================================

(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {

        const themeToggle = document.getElementById('theme-toggle');

        if (!themeToggle) {
            console.warn('Bouton theme-toggle introuvable');
            return;
        }

        const themeIcon = themeToggle.querySelector('.material-symbols-outlined');

        const savedTheme = localStorage.getItem('peartech-theme') || 'dark';
        applyTheme(savedTheme);

        themeToggle.addEventListener('click', function() {
            const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            applyTheme(newTheme);
            localStorage.setItem('peartech-theme', newTheme);

            console.log('Thème changé:', newTheme);
        });

        function applyTheme(theme) {
            if (theme === 'dark') {
                document.body.classList.add('dark-mode');
                if (themeIcon) themeIcon.textContent = 'light_mode';
                themeToggle.setAttribute('aria-pressed', 'true'); // CORRECTION
            } else {
                document.body.classList.remove('dark-mode');
                if (themeIcon) themeIcon.textContent = 'dark_mode';
                themeToggle.setAttribute('aria-pressed', 'false'); // CORRECTION
            }
        }

        console.log('Theme module initialisé - Mode:', savedTheme);
    });

})();