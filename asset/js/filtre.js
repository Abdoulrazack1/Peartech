// filtre.js
(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        const tabs = document.querySelectorAll('.tab');
        if (tabs.length === 0) return;

        function filterProducts(filter) {
            const productCards = document.querySelectorAll('.product-card');
            productCards.forEach(card => {
                const category = card.dataset.category; // ex: "portables", "gamers", "creation"
                if (filter === 'tous' || category === filter) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeIn 0.3s ease';
                } else {
                    card.style.display = 'none';
                }
            });
        }

        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Retirer la classe active de tous les onglets
                tabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');

                // Déterminer le filtre à partir du texte de l'onglet
                const tabText = this.textContent.trim().toLowerCase();
                let filter = 'tous';
                if (tabText === 'portables') filter = 'portables';
                else if (tabText === 'gamer') filter = 'gamers';
                else if (tabText === 'création') filter = 'creation';

                filterProducts(filter);
                console.log('Filtre appliqué :', filter);
            });
        });

        // Initialisation : afficher tous les produits
        filterProducts('tous');
    });
})();