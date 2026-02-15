// product-grid.js
(function() {
    'use strict';

    // Fonction pour obtenir le slug de la catégorie à partir de l'ID
    function getCategorySlug(categoryId) {
        const cat = NovaComputeDB.categories.find(c => c.id === categoryId);
        return cat ? cat.slug : '';
    }

    // Fonction pour afficher les produits
    function renderProducts(products) {
        const grid = document.getElementById('products-grid');
        if (!grid) return;

        grid.innerHTML = products.map(product => {
            // Déterminer le badge
            let badge = '';
            if (product.isNew) badge = '<span class="product-badge badge-new">Nouveau</span>';
            else if (product.isBestSeller) badge = '<span class="product-badge badge-bestseller">Meilleure vente</span>';
            else if (product.categoryId === 'cat_creation') badge = '<span class="product-badge badge-creators">Créateurs</span>';
            else if (product.categoryId === 'cat_fixe') badge = '<span class="product-badge badge-office">Bureautique</span>';

            const categorySlug = getCategorySlug(product.categoryId);

            return `
                <div class="product-card" data-category="${categorySlug}">
                    <div class="product-image">
                        <img src="${product.images[0]}" alt="${product.name}">
                        ${badge}
                    </div>
                    <div class="product-info">
                        <h3 class="product-name">${product.name}</h3>
                        <p class="product-specs">${Object.values(product.specs).slice(0,3).join(' - ')}</p>
                        <div class="product-footer">
                            <div class="product-price">${product.price.toFixed(2).replace('.',',')} €</div>
                            <button class="btn-add-cart">Ajouter au panier</button>
                        </div>
                        <button class="btn-view-product">Voir le produit</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Au chargement de la page, afficher tous les produits
    document.addEventListener('DOMContentLoaded', () => {
        renderProducts(NovaComputeDB.products);
    });
})();