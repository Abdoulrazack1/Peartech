// ============================================
// favoris.js – Système de favoris complet
// Stockage localStorage, page dédiée, boutons cœur
// ============================================

(function () {
    'use strict';

    const FAV_KEY   = 'peartech-favoris'; // clé localStorage
    const FALLBACKS = {
        'cat_apple':    'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=400&q=80',
        'cat_android':  'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80',
        'cat_wearables':'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
        'cat_tablets':  'https://images.unsplash.com/photo-1587033411391-5d9e51cce126?w=400&q=80',
    };

    // ── API interne ──────────────────────────────────────────────────

    function load() {
        try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; }
        catch { return []; }
    }

    function save(ids) {
        localStorage.setItem(FAV_KEY, JSON.stringify(ids));
    }

    function isFavori(id) {
        return load().includes(parseInt(id));
    }

    function toggle(id) {
        id = parseInt(id);
        const ids = load();
        const idx = ids.indexOf(id);
        if (idx === -1) { ids.push(id); }
        else            { ids.splice(idx, 1); }
        save(ids);
        updateAllBadges();
        return idx === -1; // true = ajouté, false = retiré
    }

    function getAll() {
        return load();
    }

    function clear() {
        save([]);
        updateAllBadges();
    }

    // ── Badges header ────────────────────────────────────────────────

    function updateAllBadges() {
        const count = load().length;
        document.querySelectorAll('#fav-count, .fav-badge').forEach(el => {
            el.textContent = count > 0 ? count : '';
            el.dataset.count = count;
            el.style.display = count > 0 ? '' : 'none';
        });
    }

    // ── Bouton cœur (SVG) ────────────────────────────────────────────

    function renderHeartBtn(productId, isFav) {
        const btn = document.createElement('button');
        btn.className = 'btn-fav';
        btn.dataset.favBtn = productId;
        btn.setAttribute('aria-label',
            (isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'));
        btn.innerHTML = heartSVG(isFav);
        return btn;
    }

    function heartSVG(filled) {
        return `<svg viewBox="0 0 24 24" width="18" height="18"
                     fill="${filled ? '#ef4444' : 'none'}"
                     stroke="${filled ? '#ef4444' : 'currentColor'}"
                     stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
                     aria-hidden="true">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06
                             a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78
                             1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>`;
    }

    function updateHeartBtn(btn, isFav) {
        btn.innerHTML = heartSVG(isFav);
        btn.setAttribute('aria-label',
            isFav ? 'Retirer des favoris' : 'Ajouter aux favoris');
    }

    // ── Délégation globale : clics sur [data-fav-btn] ────────────────

    document.addEventListener('click', function (e) {
        const btn = e.target.closest('[data-fav-btn]');
        if (!btn) return;
        e.preventDefault();
        e.stopPropagation();

        const id   = parseInt(btn.dataset.favBtn);
        const added = toggle(id);

        updateHeartBtn(btn, added);

        // Si on est sur la page favoris : retirer la card si désaimé
        if (document.querySelector('.favoris-grid')) {
            if (!added) removeCardFromGrid(id);
        }

        showToast(added
            ? 'Ajouté aux favoris'
            : 'Retiré des favoris');
    });

    // ── Page favoris ─────────────────────────────────────────────────

    function initFavorisPage() {
        const grid     = document.getElementById('favoris-grid');
        const empty    = document.getElementById('favoris-empty');
        const label    = document.getElementById('favoris-count-label');
        const clearBtn = document.getElementById('btn-clear-all');
        if (!grid) return;

        function render() {
            const ids      = getAll();
            const db       = window.PearTechDB;
            const products = ids
                .map(id => db ? db.getProductById(id) : null)
                .filter(Boolean);

            // Compteur
            const n = products.length;
            if (label) label.textContent = n === 0
                ? 'Aucun produit favori'
                : `${n} produit${n > 1 ? 's' : ''} en favori`;

            if (n === 0) {
                grid.innerHTML = '';
                if (empty)    empty.hidden  = false;
                if (clearBtn) clearBtn.style.display = 'none';
                return;
            }

            if (empty)    empty.hidden  = true;
            if (clearBtn) clearBtn.style.display = '';

            grid.innerHTML = products.map(p => buildCard(p)).join('');

            // Événements panier
            grid.querySelectorAll('.btn-add-cart').forEach(btn => {
                btn.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    addToCart(parseInt(this.dataset.id), this);
                });
            });
        }

        function removeCard(id) {
            const card = grid.querySelector(`[data-product-id="${id}"]`);
            if (!card) return;
            card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            card.style.opacity = '0';
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
                card.remove();
                render(); // re-évalue état vide + compteur
            }, 300);
        }

        // Exposer pour la délégation globale
        window._removeFavCard = removeCard;

        if (clearBtn) {
            clearBtn.addEventListener('click', function () {
                if (!confirm('Supprimer tous vos favoris ?')) return;
                clear();
                render();
            });
        }

        // Attendre data.js si nécessaire
        if (window.PearTechDB) {
            render();
        } else {
            let attempts = 0;
            const t = setInterval(() => {
                attempts++;
                if (window.PearTechDB) { clearInterval(t); render(); }
                else if (attempts > 50)   { clearInterval(t); }
            }, 100);
        }
    }

    function buildCard(product) {
        const price    = product.basePrice;
        const oldPrice = (product.oldPrice && product.oldPrice > price) ? product.oldPrice : null;
        const discount = oldPrice ? Math.round((1 - price / oldPrice) * 100) : 0;

        const badge = product.isNew
            ? '<span class="product-badge badge-new">Nouveau</span>'
            : discount > 0
                ? `<span class="product-badge badge-promo">-${discount}%</span>`
                : product.isBestSeller
                    ? '<span class="product-badge badge-bestseller">Meilleure vente</span>'
                    : '';

        const stockHtml = product.stock <= 3
            ? `<span class="stock-alert">Plus que ${product.stock} en stock !</span>`
            : product.stock <= 10
                ? '<span class="stock-low">Stock limité</span>'
                : '';

        const specsText = [product.specs.processor, product.specs.ram, product.specs.storage]
            .filter(Boolean).join(' · ') || Object.values(product.specs).slice(0, 2).join(' · ') || '';

        const priceFmt    = price.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €';
        const oldPriceFmt = oldPrice
            ? `<span class="product-old-price">${oldPrice.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>`
            : '';

        const rating    = product.rating || 0;
        const fullStars = Math.floor(rating);
        const hasHalf   = (rating % 1) >= 0.5;
        const emptyStars= 5 - fullStars - (hasHalf ? 1 : 0);
        const stars     = '★'.repeat(fullStars)
                        + (hasHalf ? '½' : '')
                        + '<span style="opacity:0.25">' + '★'.repeat(emptyStars) + '</span>';

        const imgSrc  = product.images[0] || FALLBACKS[product.categoryId] || '';
        const fallback = FALLBACKS[product.categoryId] || '';

        return `
        <article class="product-card" aria-label="${product.name}" data-product-id="${product.id}">

            <!-- Bouton retirer des favoris -->
            <button class="btn-remove-fav" data-fav-btn="${product.id}"
                    aria-label="Retirer ${product.name} des favoris">
                <span class="material-symbols-outlined" aria-hidden="true">close</span>
            </button>

            <!-- Image -->
            <a href="page_produit.html?id=${product.id}" class="product-image"
               aria-label="Voir la fiche de ${product.name}">
                <img src="${imgSrc}" alt="${product.name}" loading="lazy"
                     data-fallback="${fallback}"
                     onerror="this.onerror=null;this.src=this.dataset.fallback||'';">
                ${badge}${stockHtml}
            </a>

            <!-- Infos -->
            <div class="product-info">
                <h2 class="product-name">${product.name}</h2>
                ${specsText ? `<p class="product-specs">${specsText}</p>` : ''}
                <div class="product-rating"
                     aria-label="Note ${product.rating || 0} sur 5, ${product.reviews || 0} avis">
                    <span class="stars" aria-hidden="true">${stars}</span>
                    <span class="rating-count">${rating.toFixed(1)} · ${product.reviews || 0} avis</span>
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
                        <!-- Cœur plein (déjà en favori) -->
                        <button class="btn-fav" data-fav-btn="${product.id}"
                                aria-label="Retirer ${product.name} des favoris">
                            <svg viewBox="0 0 24 24" width="18" height="18"
                                 fill="#ef4444" stroke="#ef4444"
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
    }

    function removeCardFromGrid(id) {
        if (typeof window._removeFavCard === 'function') {
            window._removeFavCard(id);
        }
    }

    // ── Ajout au panier (light version) ─────────────────────────────

    function addToCart(productId, btn) {
        const db      = window.PearTechDB;
        const product = db ? db.getProductById(productId) : null;
        if (!product) return;

        if (window.PearTechCart) {
            window.PearTechCart.add({
                id:       product.id,
                name:     product.name,
                basePrice:product.basePrice,
                price:    product.basePrice,
                image:    product.images[0] || '',
                specs:    [product.specs.processor, product.specs.ram, product.specs.storage]
                              .filter(Boolean).join(' – '),
                quantity: 1
            });
        }

        const orig = btn.innerHTML;
        btn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';
        btn.disabled  = true;
        setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; }, 1600);

        showToast('Produit ajouté au panier');
    }

    // ── Toast ────────────────────────────────────────────────────────

    function showToast(msg) {
        document.querySelectorAll('.fav-toast').forEach(t => t.remove());
        const toast = document.createElement('div');
        toast.className = 'fav-toast';
        toast.innerHTML = `<span class="material-symbols-outlined">favorite</span>${msg}`;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            toast.style.opacity    = '0';
            toast.style.transform  = 'translateY(10px)';
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }

    // ── Exposition globale ────────────────────────────────────────────

    window.Favoris = {
        isFavori,
        toggle,
        getAll,
        clear,
        updateHeartBtn,
    };

    // ── Init ─────────────────────────────────────────────────────────

    document.addEventListener('DOMContentLoaded', function () {
        updateAllBadges();
        initFavorisPage();
    });

})();