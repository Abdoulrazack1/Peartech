// ============================================
// product_grid.js – Grille produits page accueil
// Structure alignée sur catalogue.js
// ============================================

(function () {
    'use strict';

    const PLACEHOLDER = '/asset/image/no-image.png';

    function renderProducts(productsToRender) {
        const grid = document.getElementById('products-grid');
        if (!grid) return;

        if (!productsToRender || !productsToRender.length) {
            grid.innerHTML = '<p class="no-results">Aucun produit à afficher.</p>';
            return;
        }

        grid.innerHTML = productsToRender.map(product => {
            const price    = product.basePrice;
            const oldPrice = (product.oldPrice && product.oldPrice > price) ? product.oldPrice : null;
            const discount = oldPrice ? Math.round((1 - price / oldPrice) * 100) : 0;

            // Badge
            const badge = product.isNew
                ? '<span class="product-badge badge-new">Nouveau</span>'
                : discount > 0
                    ? `<span class="product-badge badge-promo">-${discount}%</span>`
                    : product.isBestSeller
                        ? '<span class="product-badge badge-bestseller">Meilleure vente</span>'
                        : '';

            // Stock
            const stockHtml = product.stock <= 3
                ? `<span class="stock-alert">Plus que ${product.stock} en stock !</span>`
                : product.stock <= 10
                    ? '<span class="stock-low">Stock limité</span>'
                    : '';

            // Specs (3 premières pertinentes)
            const specsText = [product.specs.processor, product.specs.ram, product.specs.storage]
                .filter(Boolean).join(' · ')
                || Object.values(product.specs).slice(0, 2).join(' · ')
                || '';

            // Prix formatés
            const priceFmt    = price.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €';
            const oldPriceFmt = oldPrice
                ? `<span class="product-old-price">${oldPrice.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>`
                : '';

            // Étoiles
            const fullStars = Math.floor(product.rating || 0);
            const halfStar  = ((product.rating || 0) % 1) >= 0.5;
            const stars     = '★'.repeat(fullStars) + (halfStar ? '½' : '');

            // Favori courant
            const isFav = (typeof window.Favoris !== 'undefined') && window.Favoris.isFavori(product.id);

            return `
            <article class="product-card" aria-label="${product.name}"
                     data-product-id="${product.id}">
                <a href="page_produit.html?id=${product.id}" class="product-image"
                   aria-label="Voir la fiche de ${product.name}">
                    <img src="${product.images[0] || PLACEHOLDER}"
                         alt="${product.name}" loading="lazy"
                         onerror="this.onerror=null;this.src='${PLACEHOLDER}';">
                    ${badge}${stockHtml}
                </a>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    ${specsText ? `<p class="product-specs">${specsText}</p>` : ''}
                    <div class="product-rating"
                         aria-label="Note ${product.rating || 0} sur 5, ${product.reviews || 0} avis">
                        <span class="stars" aria-hidden="true">${stars}</span>
                        <span class="rating-count">${product.reviews || 0} avis</span>
                    </div>
                    <div class="product-footer">
                        <div class="product-price-block">
                            <span class="product-price">${priceFmt}</span>
                            ${oldPriceFmt}
                        </div>
                        <div class="product-actions">
                            <button class="btn-add-cart"
                                    data-id="${product.id}"
                                    aria-label="Ajouter ${product.name} au panier">
                                <span class="material-symbols-outlined" aria-hidden="true">shopping_cart</span>
                            </button>
                            <button class="btn-fav"
                                    data-fav-btn="${product.id}"
                                    aria-label="${isFav ? 'Retirer' : 'Ajouter'} ${product.name} ${isFav ? 'des' : 'aux'} favoris">
                                <svg viewBox="0 0 24 24" width="18" height="18"
                                     fill="${isFav ? '#ef4444' : 'none'}"
                                     stroke="${isFav ? '#ef4444' : 'currentColor'}"
                                     stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
                                     aria-hidden="true">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06
                                             a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78
                                             1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <a href="page_produit.html?id=${product.id}" class="btn-view-product">
                        Voir le produit
                    </a>
                </div>
            </article>`;
        }).join('');

        // ── Panier ──────────────────────────────────────────────────
        grid.querySelectorAll('.btn-add-cart').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                addToCart(parseInt(this.dataset.id), this);
            });
        });

        // ── Favoris ─────────────────────────────────────────────────
        if (typeof window.updateHeartBtn === 'function') {
            grid.querySelectorAll('[data-fav-btn]').forEach(btn => {
                window.updateHeartBtn(btn, window.Favoris.isFavori(btn.dataset.favBtn));
            });
        }

        console.log('Grille produits générée :', productsToRender.length, 'produits');
    }

    // ── Ajout au panier ─────────────────────────────────────────────
    function addToCart(productId, btn) {
        const products = window.NovaComputeDB ? window.NovaComputeDB.products : (window.products || []);
        const product  = products.find(p => p.id === productId);
        if (!product) return;

        const CART_KEY = 'nova-cart';
        const cart     = JSON.parse(localStorage.getItem(CART_KEY)) || [];
        const existing = cart.find(i => i.id === productId);

        if (existing) {
            existing.quantity++;
        } else {
            cart.push({
                id:       product.id,
                name:     product.name,
                image:    product.images[0] || '',
                price:    product.basePrice,
                specs:    [product.specs.processor, product.specs.ram, product.specs.storage]
                              .filter(Boolean).join(' - '),
                quantity: 1
            });
        }

        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        const total = cart.reduce((acc, i) => acc + i.quantity, 0);
        localStorage.setItem('nova-cart-count', total);

        const badge = document.getElementById('cart-count');
        if (badge) {
            badge.textContent = total;
            badge.style.display = 'flex';
            badge.setAttribute('aria-label', total + ' article' + (total > 1 ? 's' : '') + ' dans le panier');
        }

        // Feedback
        const orig = btn.innerHTML;
        btn.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">check</span>';
        btn.disabled  = true;
        setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; }, 1600);
    }

    // ── Init ────────────────────────────────────────────────────────
    function init(attempts) {
        attempts = attempts || 0;
        if (window.NovaComputeDB) {
            // Sur l'accueil : afficher les bestsellers + nouveautés (max 8)
            const db       = window.NovaComputeDB;
            const featured = [
                ...db.products.filter(p => p.isBestSeller),
                ...db.products.filter(p => p.isNew && !p.isBestSeller)
            ].slice(0, 8);
            renderProducts(featured.length ? featured : db.products.slice(0, 8));
        } else if (attempts < 50) {
            setTimeout(() => init(attempts + 1), 100);
        } else {
            const grid = document.getElementById('products-grid');
            if (grid) grid.innerHTML = '<p>Impossible de charger les produits. Rechargez la page.</p>';
        }
    }

    document.addEventListener('DOMContentLoaded', init);

    // API publique (peut être appelée par main.js avec un sous-ensemble)
    window.renderProductGrid = renderProducts;

})();