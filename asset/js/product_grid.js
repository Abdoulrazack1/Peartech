// ============================================
// product-grid.js - Génération dynamique de la grille produits
// ============================================
(function() {
    'use strict';

    function renderProducts(productsToRender) {
        const grid = document.getElementById('products-grid');
        if (!grid) {
            console.error('Élément #products-grid introuvable');
            return;
        }

        if (!window.NovaComputeDB) {
            console.error('NovaComputeDB non chargé');
            grid.innerHTML = '<p>Erreur de chargement des données</p>';
            return;
        }

        const html = productsToRender.map(product => {
            // Déterminer le badge
            let badge = '';
            if (product.isNew) badge = '<span class="product-badge badge-new">Nouveau</span>';
            else if (product.isBestSeller) badge = '<span class="product-badge badge-bestseller">Meilleure vente</span>';
            else if (product.categoryId === 'cat_creation') badge = '<span class="product-badge badge-creators">Créateurs</span>';
            else if (product.categoryId === 'cat_fixe') badge = '<span class="product-badge badge-office">Bureautique</span>';

            // Récupérer le slug de la catégorie
            let categorySlug = '';
            if (typeof NovaComputeDB.getCategorySlugFromId === 'function') {
                categorySlug = NovaComputeDB.getCategorySlugFromId(product.categoryId);
            }

            // Construire les specs (3 premières propriétés)
            const specsArray = Object.values(product.specs).slice(0,3).join(' - ');

            return `
                <div class="product-card" data-category="${categorySlug}" data-product-id="${product.id}">
                    <div class="product-image">
                        <img src="${product.images[0]}" alt="${product.name}">
                        ${badge}
                    </div>
                    <div class="product-info">
                        <h3 class="product-name">${product.name}</h3>
                        <p class="product-specs">${specsArray}</p>
                        <div class="product-footer">
                            <div class="product-price">${(product.basePrice || product.price).toFixed(2).replace('.',',')} €</div>
                            <button class="btn-add-cart">Ajouter au panier</button>
                        </div>
                        <button class="btn-view-product" onclick="window.location.href='page_produit.html?id=${product.id}'">Voir le produit</button>
                    </div>
                </div>
            `;
        }).join('');

        grid.innerHTML = html;
        console.log('Grille produits générée avec', productsToRender.length, 'produits');
    }

    // Initialisation : attendre que la DB soit chargée
    function init() {
        if (window.NovaComputeDB) {
            renderProducts(NovaComputeDB.products);
        } else {
            // Réessayer dans 100ms
            setTimeout(init, 100);
        }
    }

    document.addEventListener('DOMContentLoaded', init);
})();