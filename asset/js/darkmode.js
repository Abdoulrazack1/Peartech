// ============================================
// darkmode.js - Gestion du thème sombre/clair
// Bascule entre dark et light mode, avec
// sauvegarde de la préférence dans localStorage
// ============================================

// IIFE (Immediately Invoked Function Expression) pour isoler le code
// et éviter les conflits avec d'autres variables globales
(function() {
    'use strict'; // Active le mode strict pour une meilleure sécurité et optimisation

    // Attend que le DOM soit complètement chargé avant d'exécuter le code
    // Cela garantit que les éléments HTML (comme le bouton) sont accessibles
    document.addEventListener('DOMContentLoaded', function() {

        // Récupère l'élément bouton qui permet de basculer le thème (par son ID)
        const themeToggle = document.getElementById('theme-toggle');

        // Si le bouton n'existe pas dans la page, on affiche un avertissement
        // et on arrête l'exécution du script (return)
        if (!themeToggle) {
            console.warn('Bouton theme-toggle introuvable');
            return;
        }

        // Récupère l'icône Material Symbols à l'intérieur du bouton
        // pour pouvoir changer son texte (ex: "dark_mode" / "light_mode")
        const themeIcon = themeToggle.querySelector('.material-symbols-outlined');

        // Récupère le thème sauvegardé dans localStorage, ou 'dark' par défaut
        // L'opérateur || signifie : si localStorage.getItem retourne null/undefined, on prend 'dark'
        const savedTheme = localStorage.getItem('peartech-theme') || 'dark';

        // Applique le thème récupéré (ajoute/enlève la classe CSS et met à jour l'icône)
        applyTheme(savedTheme);

        // Ajoute un écouteur d'événement au clic sur le bouton
        themeToggle.addEventListener('click', function() {
            // Détermine le thème actuel en vérifiant si la classe 'dark-mode' est présente sur le body
            const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
            // Calcule le nouveau thème : si c'était dark, on passe à light, et vice-versa
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            // Applique le nouveau thème
            applyTheme(newTheme);

            // Sauvegarde la préférence dans localStorage pour qu'elle persiste entre les visites
            localStorage.setItem('peartech-theme', newTheme);

            // Log facultatif pour le débogage
            console.log('Thème changé:', newTheme);
        });

        /**
         * Applique le thème (dark ou light) en modifiant le DOM
         * @param {string} theme - 'dark' ou 'light'
         */
        function applyTheme(theme) {
            if (theme === 'dark') {
                // Ajoute la classe 'dark-mode' au body pour activer les styles CSS du mode sombre
                document.body.classList.add('dark-mode');
                // Si l'icône existe, on change son texte en 'light_mode' (lune)
                if (themeIcon) themeIcon.textContent = 'light_mode';
                // Met à jour l'attribut aria-pressed pour l'accessibilité (état pressé = true)
                themeToggle.setAttribute('aria-pressed', 'true'); // CORRECTION
            } else {
                // Enlève la classe 'dark-mode' du body pour revenir au mode clair
                document.body.classList.remove('dark-mode');
                // Change l'icône en 'dark_mode' (soleil)
                if (themeIcon) themeIcon.textContent = 'dark_mode';
                // Met à jour aria-pressed à false
                themeToggle.setAttribute('aria-pressed', 'false'); // CORRECTION
            }
        }

        // Log de fin d'initialisation
        console.log('Theme module initialisé - Mode:', savedTheme);
    });

})();