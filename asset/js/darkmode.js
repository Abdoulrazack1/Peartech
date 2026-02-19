// ============================================
// theme.js - Dark/Light Mode
// Gestion du thème avec sauvegarde localStorage
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
        
        // Récupérer le thème sauvegardé (défaut: dark)
        const savedTheme = localStorage.getItem('peartech-theme') || 'dark';
        
        // Appliquer le thème au chargement
        applyTheme(savedTheme);
        
        // Toggle du thème au clic
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            applyTheme(newTheme);
            localStorage.setItem('peartech-theme', newTheme);
            
            console.log('Thème changé:', newTheme);
        });
        
        // Fonction pour appliquer le thème
        function applyTheme(theme) {
            if (theme === 'dark') {
                document.body.classList.add('dark-mode');
                if (themeIcon) themeIcon.textContent = 'light_mode';
            } else {
                document.body.classList.remove('dark-mode');
                if (themeIcon) themeIcon.textContent = 'dark_mode';
            }
        }
        
        console.log('Theme module initialisé - Mode:', savedTheme);
    });
    
})();