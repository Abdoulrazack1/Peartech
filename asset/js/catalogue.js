// ============================================
// catalogue.js – Page catalogue dynamique
// Aligné sur la structure data.js PearTech
// ============================================

(function () {
    'use strict';

    // ── État global ──────────────────────────────────────────────────
    let currentCategory   = null;
    let allProducts       = [];
    let filteredProducts  = [];
    let displayedProducts = [];
    let currentPage       = 1;
    const PRODUCTS_PER_PAGE = 12;
    let sortBy   = 'relevance';
    let viewMode = 'grid';
    let filters  = {
        subcategories: [],
        priceMin:      0,
        priceMax:      Infinity,
        brands:        [],
        features:      []
    };

    // ── Références DOM ────────────────────────────────────────────────
    let categoryTitle, categoryDescription, resultsCount, productsGrid,
        paginationDiv, resetFiltersBtn, sortSelect, viewBtns,
        priceMinSlider, priceMaxSlider, priceMinDisplay, priceMaxDisplay,
        breadcrumb;

    // ── Mapping tag → marque lisible ─────────────────────────────────
    const BRAND_MAP = {
        'apple':    'Apple',   'iphone':   'Apple',  'ipad': 'Apple',
        'samsung':  'Samsung',
        'google':   'Google',  'pixel':    'Google',
        'xiaomi':   'Xiaomi',
        'oneplus':  'OnePlus',
        'amazon':   'Amazon',  'fire':     'Amazon',
        'fitbit':   'Fitbit',
        'garmin':   'Garmin',
        'motorola': 'Motorola',
        'oppo':     'Oppo',
        'sony':     'Sony',
        'huawei':   'Huawei'
    };

    function getBrand(product) {
        for (const tag of product.tags) {
            const b = BRAND_MAP[tag.toLowerCase()];
            if (b) return b;
        }
        return product.name.split(' ')[0];
    }

    function has5G(product) {
        if (!product.options) return false;
        return Object.values(product.options).flat()
            .some(o => o.label && o.label.includes('5G'));
    }

    function hasGPS(product) {
        const haystack = JSON.stringify(product.specs || {}).toLowerCase()
                       + JSON.stringify(product.options || {}).toLowerCase();
        return haystack.includes('gps');
    }

    // ════════════════════════════════════════════════════════════════
    // INIT
    // ════════════════════════════════════════════════════════════════

    document.addEventListener('DOMContentLoaded', function () {

        categoryTitle       = document.getElementById('category-title');
        categoryDescription = document.getElementById('category-description');
        resultsCount        = document.getElementById('results-count');
        productsGrid        = document.getElementById('products-grid');
        paginationDiv       = document.getElementById('pagination');
        resetFiltersBtn     = document.getElementById('reset-filters');
        sortSelect          = document.getElementById('sort');
        viewBtns            = document.querySelectorAll('.view-btn');
        priceMinSlider      = document.getElementById('price-min');
        priceMaxSlider      = document.getElementById('price-max');
        priceMinDisplay     = document.getElementById('price-min-display');
        priceMaxDisplay     = document.getElementById('price-max-display');
        breadcrumb          = document.getElementById('breadcrumb');

        if (!window.PearTechDB) {
            console.error('[catalogue.js] window.PearTechDB non chargé');
            if (productsGrid) productsGrid.innerHTML = '<p class="no-results">Impossible de charger les produits.</p>';
            return;
        }

        // Catégorie depuis l'URL
        const urlParams    = new URLSearchParams(window.location.search);
        const categorySlug = urlParams.get('categorie');

        if (categorySlug) {
            const cat = PearTechDB.getCategoryBySlug(categorySlug);
            if (cat) {
                currentCategory = cat;
                allProducts     = PearTechDB.getProductsByCategory(cat.slug);
            } else {
                window.location.href = 'page_accueil.html';
                return;
            }
        } else {
            currentCategory = {
                name:          'Tous les produits',
                description:   'Découvrez toute notre sélection de smartphones, tablettes, montres et accessoires high-tech.',
                slug:          'tous',
                subcategories: []
            };
            allProducts = PearTechDB.products;
        }

        if (categoryTitle)       categoryTitle.textContent       = currentCategory.name;
        if (categoryDescription) categoryDescription.textContent = currentCategory.description || '';

        // Breadcrumb
        if (breadcrumb) {
            breadcrumb.innerHTML = `
                <a href="page_accueil.html">Accueil</a>
                <span aria-hidden="true">/</span>
                <a href="page_catalogue.html">Toutes les catégories</a>
                <span aria-hidden="true">/</span>
                <span id="current-category-name" aria-current="page">${currentCategory.name}</span>`;
        }

        initFilters();
        applyFilters();

        // Événements
        if (resetFiltersBtn) resetFiltersBtn.addEventListener('click', resetFilters);

        if (sortSelect) sortSelect.addEventListener('change', function () {
            sortBy = this.value;
            applyFilters();
        });

        viewBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                viewBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed','false'); });
                this.classList.add('active');
                this.setAttribute('aria-pressed','true');
                viewMode = this.dataset.view;
                productsGrid.classList.toggle('list-view', viewMode === 'list');
                renderProducts(displayedProducts);
            });
        });

        if (priceMinSlider) priceMinSlider.addEventListener('input', function () {
            if (parseInt(this.value) > parseInt(priceMaxSlider.value)) this.value = priceMaxSlider.value;
            priceMinDisplay.textContent = parseInt(this.value).toLocaleString('fr-FR') + ' €';
            filters.priceMin = parseInt(this.value);
            applyFilters();
        });

        if (priceMaxSlider) priceMaxSlider.addEventListener('input', function () {
            if (parseInt(this.value) < parseInt(priceMinSlider.value)) this.value = priceMinSlider.value;
            priceMaxDisplay.textContent = parseInt(this.value).toLocaleString('fr-FR') + ' €';
            filters.priceMax = parseInt(this.value);
            applyFilters();
        });
    });

    // ════════════════════════════════════════════════════════════════
    // INIT FILTRES
    // ════════════════════════════════════════════════════════════════

    function initFilters() {

        // Sous-catégories
        const subcatMap = new Map();
        if (currentCategory.subcategories && currentCategory.subcategories.length) {
            currentCategory.subcategories.forEach(sub => {
                const subLower = sub.toLowerCase();
                const count = allProducts.filter(p =>
                    p.name.toLowerCase().includes(subLower) ||
                    p.tags.some(t => subLower.includes(t) || t.includes(subLower))
                ).length;
                if (count > 0) subcatMap.set(sub, count);
            });
        } else {
            // Page "tous" → grouper par nom de catégorie
            PearTechDB.categories.forEach(cat => {
                const count = allProducts.filter(p => p.categoryId === cat.id).length;
                if (count > 0) subcatMap.set(cat.name, count);
            });
        }

        const subcatDiv = document.getElementById('subcategories-filter');
        if (subcatDiv) {
            subcatDiv.innerHTML = '';
            subcatMap.forEach((count, label) => {
                const el = document.createElement('label');
                el.className = 'checkbox-item';
                el.innerHTML = `<input type="checkbox" class="subcategory-checkbox" value="${label}">
                    <span>${label}</span><span class="checkbox-count">${count}</span>`;
                subcatDiv.appendChild(el);
            });
            subcatDiv.querySelectorAll('.subcategory-checkbox').forEach(cb =>
                cb.addEventListener('change', () => {
                    filters.subcategories = [...document.querySelectorAll('.subcategory-checkbox:checked')].map(c => c.value);
                    applyFilters();
                })
            );
        }

        // Marques
        const brandsMap = new Map();
        allProducts.forEach(p => {
            const b = getBrand(p);
            brandsMap.set(b, (brandsMap.get(b) || 0) + 1);
        });

        const brandsDiv = document.getElementById('brands-filter');
        if (brandsDiv) {
            brandsDiv.innerHTML = '';
            [...brandsMap.entries()].sort((a,b) => b[1]-a[1]).forEach(([label, count]) => {
                const el = document.createElement('label');
                el.className = 'checkbox-item';
                el.innerHTML = `<input type="checkbox" class="brand-checkbox" value="${label}">
                    <span>${label}</span><span class="checkbox-count">${count}</span>`;
                brandsDiv.appendChild(el);
            });
            brandsDiv.querySelectorAll('.brand-checkbox').forEach(cb =>
                cb.addEventListener('change', () => {
                    filters.brands = [...document.querySelectorAll('.brand-checkbox:checked')].map(c => c.value);
                    applyFilters();
                })
            );
        }

        // Caractéristiques (adaptées aux produits mobiles)
        const featSet = new Set();
        allProducts.forEach(p => {
            if (p.specs.os) {
                const os = p.specs.os.toLowerCase();
                if (os.includes('ios') || os.includes('ipados')) featSet.add('iOS / iPadOS');
                else if (os.includes('android'))                  featSet.add('Android');
                else if (os.includes('fire'))                     featSet.add('Fire OS');
            }
            if (has5G(p))  featSet.add('Compatible 5G');
            if (hasGPS(p)) featSet.add('GPS intégré');
            if (p.specs.ram) {
                const r = parseInt(p.specs.ram);
                if (r <= 4)       featSet.add('RAM ≤ 4 Go');
                else if (r <= 8)  featSet.add('RAM 6–8 Go');
                else if (r <= 12) featSet.add('RAM 12 Go');
                else              featSet.add('RAM 16 Go et +');
            }
            if (p.oldPrice && p.oldPrice > p.basePrice) featSet.add('En promotion');
            if (p.isNew)        featSet.add('Nouveautés');
            if (p.isBestSeller) featSet.add('Meilleures ventes');
        });

        const featDiv = document.getElementById('features-filter');
        if (featDiv) {
            featDiv.innerHTML = '';
            featSet.forEach(feat => {
                const el = document.createElement('label');
                el.className = 'checkbox-item';
                el.innerHTML = `<input type="checkbox" class="feature-checkbox" value="${feat}">
                    <span>${feat}</span>`;
                featDiv.appendChild(el);
            });
            featDiv.querySelectorAll('.feature-checkbox').forEach(cb =>
                cb.addEventListener('change', () => {
                    filters.features = [...document.querySelectorAll('.feature-checkbox:checked')].map(c => c.value);
                    applyFilters();
                })
            );
        }

        // Sliders prix
        const prices   = allProducts.map(p => p.basePrice);
        const minPrice = Math.floor(Math.min(...prices));
        const maxPrice = Math.ceil(Math.max(...prices));
        if (priceMinSlider) { priceMinSlider.min = minPrice; priceMinSlider.max = maxPrice; priceMinSlider.value = minPrice; priceMinSlider.step = 10; }
        if (priceMaxSlider) { priceMaxSlider.min = minPrice; priceMaxSlider.max = maxPrice; priceMaxSlider.value = maxPrice; priceMaxSlider.step = 10; }
        if (priceMinDisplay) priceMinDisplay.textContent = minPrice.toLocaleString('fr-FR') + ' €';
        if (priceMaxDisplay) priceMaxDisplay.textContent = maxPrice.toLocaleString('fr-FR') + ' €';
        filters.priceMin = minPrice;
        filters.priceMax = maxPrice;
    }

    // ════════════════════════════════════════════════════════════════
    // FILTRER ET TRIER
    // ════════════════════════════════════════════════════════════════

    // Map explicite sous-catégorie → prédicat de matching
    // Évite les faux positifs de la comparaison par tag partiel
    // (ex: "apple watch".includes("watch") matchait Samsung Galaxy Watch)
    const SUBCAT_MATCHERS = {
        // ── Apple ──
        'iPhone':              p => p.tags.includes('iphone'),
        'iPad':                p => p.tags.includes('ipad'),
        'Apple Watch':         p => p.categoryId === 'cat_wearables' && p.tags.includes('apple'),
        'Accessoires':         p => p.tags.some(t => ['accessoire','accessoires'].includes(t)),
        // ── Android ──
        'Samsung':             p => p.tags.includes('samsung') && !p.tags.includes('tablette') && !p.tags.some(t => ['watch','montre'].includes(t)),
        'Google Pixel':        p => p.tags.includes('google') || p.tags.includes('pixel'),
        'Xiaomi':              p => p.tags.includes('xiaomi'),
        'OnePlus':             p => p.tags.includes('oneplus'),
        // ── Wearables ──
        'Apple Watch':         p => p.categoryId === 'cat_wearables' && p.tags.includes('apple'),
        'Samsung Galaxy Watch':p => p.tags.includes('samsung') && p.tags.some(t => ['watch','montre'].includes(t)),
        'Fitbit':              p => p.tags.includes('fitbit'),
        'Garmin':              p => p.tags.includes('garmin'),
        // ── Tablettes ──
        'iPad':                p => p.tags.includes('ipad'),
        'Samsung Galaxy Tab':  p => p.tags.includes('samsung') && p.tags.includes('tablette'),
        'Amazon Fire':         p => p.tags.includes('amazon') || p.tags.includes('fire'),
        'Xiaomi':              p => p.tags.includes('xiaomi'),
        // ── Fallback ──
        'Autres':              p => true,
    };

    function matchesSubcategory(product, subs) {
        if (!subs.length) return true;
        return subs.some(sub => {
            // Utiliser le matcher explicite si disponible
            const matcher = SUBCAT_MATCHERS[sub];
            if (matcher) return matcher(product);
            // Fallback : matcher par nom de catégorie globale (page "tous")
            const cat = PearTechDB.categories.find(c => c.name === sub);
            if (cat) return product.categoryId === cat.id;
            // Fallback final : nom du produit
            return product.name.toLowerCase().includes(sub.toLowerCase());
        });
    }

    function matchesFeature(product, feat) {
        switch (feat) {
            case 'iOS / iPadOS':    return product.specs.os && /ios|ipados/i.test(product.specs.os);
            case 'Android':         return product.specs.os && /android/i.test(product.specs.os);
            case 'Fire OS':         return product.specs.os && /fire/i.test(product.specs.os);
            case 'Compatible 5G':   return has5G(product);
            case 'GPS intégré':     return hasGPS(product);
            case 'RAM ≤ 4 Go':      return product.specs.ram && parseInt(product.specs.ram) <= 4;
            case 'RAM 6–8 Go':      return product.specs.ram && parseInt(product.specs.ram) >= 6 && parseInt(product.specs.ram) <= 8;
            case 'RAM 12 Go':       return product.specs.ram && parseInt(product.specs.ram) === 12;
            case 'RAM 16 Go et +':  return product.specs.ram && parseInt(product.specs.ram) >= 16;
            case 'En promotion':    return product.oldPrice && product.oldPrice > product.basePrice;
            case 'Nouveautés':      return product.isNew === true;
            case 'Meilleures ventes': return product.isBestSeller === true;
            default: return true;
        }
    }

    function applyFilters() {
        filteredProducts = allProducts.filter(p => {
            if (!matchesSubcategory(p, filters.subcategories))        return false;
            if (p.basePrice < filters.priceMin || p.basePrice > filters.priceMax) return false;
            if (filters.brands.length   && !filters.brands.includes(getBrand(p))) return false;
            if (filters.features.length && !filters.features.every(f => matchesFeature(p, f))) return false;
            return true;
        });

        switch (sortBy) {
            case 'price-asc':  filteredProducts.sort((a,b) => a.basePrice - b.basePrice);        break;
            case 'price-desc': filteredProducts.sort((a,b) => b.basePrice - a.basePrice);        break;
            case 'rating':     filteredProducts.sort((a,b) => (b.rating||0) - (a.rating||0));   break;
            case 'new':        filteredProducts.sort((a,b) => (b.isNew?1:0) - (a.isNew?1:0));   break;
        }

        if (resultsCount) resultsCount.textContent = filteredProducts.length + ' résultat' + (filteredProducts.length !== 1 ? 's' : '');

        currentPage = 1;
        displayCurrentPage();
        updatePagination();
        updateActiveFilters();
    }

    function displayCurrentPage() {
        const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
        displayedProducts = filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
        renderProducts(displayedProducts);
    }

    // ════════════════════════════════════════════════════════════════
    // RENDU DES CARTES PRODUIT
    // ════════════════════════════════════════════════════════════════

    function renderProducts(products) {
        if (!productsGrid) return;
        if (!products.length) {
            productsGrid.innerHTML = '<p class="no-results">Aucun produit ne correspond à vos critères de recherche.</p>';
            return;
        }

        // Fallbacks Unsplash par catégorie (si image locale absente)
        const FALLBACKS = {
            'cat_apple':    'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=400&q=80',
            'cat_android':  'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80',
            'cat_wearables':'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
            'cat_tablets':  'https://images.unsplash.com/photo-1587033411391-5d9e51cce126?w=400&q=80',
        };

        productsGrid.innerHTML = products.map(product => {
            const price    = product.basePrice;
            const oldPrice = (product.oldPrice && product.oldPrice > price) ? product.oldPrice : null;
            const discount = oldPrice ? Math.round((1 - price / oldPrice) * 100) : 0;

            // Badge (Nouveau prioritaire)
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

            // Specs résumées
            const specsText = [product.specs.processor, product.specs.ram, product.specs.storage]
                .filter(Boolean).join(' · ') || product.specs.screen || '';

            // Étoiles
            const rating    = product.rating || 0;
            const fullStars = Math.floor(rating);
            const hasHalf   = (rating % 1) >= 0.5;
            const emptyStars= 5 - fullStars - (hasHalf ? 1 : 0);
            const stars     = '★'.repeat(fullStars)
                            + (hasHalf ? '½' : '')
                            + '<span style="opacity:0.25">' + '★'.repeat(emptyStars) + '</span>';

            // Prix formatés
            const priceFmt    = price.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €';
            const oldPriceFmt = oldPrice
                ? `<span class="product-old-price">${oldPrice.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>`
                : '';

            // Favori courant
            const isFav = (typeof window.Favoris !== 'undefined') && window.Favoris.isFavori(product.id);

            return `
            <article class="product-card" aria-label="${product.name}">
                <a href="page_produit.html?id=${product.id}" class="product-image"
                   aria-label="Voir la fiche de ${product.name}">
                    <img src="${product.images[0] || FALLBACKS[product.categoryId] || ''}"
                         alt="${product.name}" loading="lazy"
                         data-fallback="${FALLBACKS[product.categoryId] || ''}"
                         onerror="this.onerror=null;this.src=this.dataset.fallback||'';">
                    ${badge}${stockHtml}
                </a>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
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
                            <button class="btn-add-cart" data-id="${product.id}"
                                    aria-label="Ajouter ${product.name} au panier">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                            </button>
                            <button class="btn-fav" data-fav-btn="${product.id}"
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
                        Voir la fiche produit
                    </a>
                </div>
            </article>`;
        }).join('');

        // Panier
        productsGrid.querySelectorAll('.btn-add-cart').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                addToCart(parseInt(this.dataset.id), this);
            });
        });

        // Favoris — état initial rendu par favoris.js via window.Favoris.isFavori()
        // La délégation globale de favoris.js gère tous les clics [data-fav-btn]
    }

    // ── Ajout au panier ──────────────────────────────────────────────
    function addToCart(productId, btn) {
        const product = allProducts.find(p => p.id === productId);
        if (!product) return;

        const CART_KEY = 'peartech-cart';
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
                specs:    [product.specs.processor, product.specs.ram, product.specs.storage].filter(Boolean).join(' - '),
                quantity: 1
            });
        }

        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        const total = cart.reduce((acc, i) => acc + i.quantity, 0);
        localStorage.setItem('peartech-cart-count', total);

        const badge = document.getElementById('cart-count');
        if (badge) {
            badge.textContent = total;
            badge.style.display = 'flex';
            badge.setAttribute('aria-label', total + ' article' + (total > 1 ? 's' : '') + ' dans le panier');
        }

        const orig = btn.innerHTML;
        btn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';
        btn.disabled  = true;
        setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; }, 1600);
    }

    // ════════════════════════════════════════════════════════════════
    // PAGINATION
    // ════════════════════════════════════════════════════════════════

    function updatePagination() {
        if (!paginationDiv) return;
        const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
        if (totalPages <= 1) { paginationDiv.innerHTML = ''; return; }

        let html = `<button class="page-btn prev" data-page="${currentPage - 1}"
                             aria-label="Page précédente" ${currentPage === 1 ? 'disabled' : ''}>Précédent</button>`;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                html += `<button class="page-btn${i === currentPage ? ' active' : ''}" data-page="${i}"
                                 aria-label="Page ${i}" aria-current="${i === currentPage ? 'page' : 'false'}">${i}</button>`;
            } else if (i === currentPage - 3 || i === currentPage + 3) {
                html += `<span class="page-dots" aria-hidden="true">…</span>`;
            }
        }

        html += `<button class="page-btn next" data-page="${currentPage + 1}"
                         aria-label="Page suivante" ${currentPage === totalPages ? 'disabled' : ''}>Suivant</button>`;

        paginationDiv.innerHTML = html;
        paginationDiv.querySelectorAll('.page-btn:not([disabled])').forEach(btn => {
            btn.addEventListener('click', function () {
                const page = parseInt(this.dataset.page);
                if (!isNaN(page) && page !== currentPage) {
                    currentPage = page;
                    displayCurrentPage();
                    updatePagination();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        });
    }

    // ════════════════════════════════════════════════════════════════
    // RESET FILTRES
    // ════════════════════════════════════════════════════════════════

    function resetFilters() {
        document.querySelectorAll('.subcategory-checkbox, .brand-checkbox, .feature-checkbox')
            .forEach(cb => cb.checked = false);

        const prices   = allProducts.map(p => p.basePrice);
        const minPrice = Math.floor(Math.min(...prices));
        const maxPrice = Math.ceil(Math.max(...prices));

        if (priceMinSlider) priceMinSlider.value = minPrice;
        if (priceMaxSlider) priceMaxSlider.value = maxPrice;
        if (priceMinDisplay) priceMinDisplay.textContent = minPrice.toLocaleString('fr-FR') + ' €';
        if (priceMaxDisplay) priceMaxDisplay.textContent = maxPrice.toLocaleString('fr-FR') + ' €';
        if (sortSelect) sortSelect.value = 'relevance';

        filters = { subcategories: [], priceMin: minPrice, priceMax: maxPrice, brands: [], features: [] };
        sortBy  = 'relevance';
        applyFilters();
    }

    // ════════════════════════════════════════════════════════════════
    // FILTRES ACTIFS (tags affichés)
    // ════════════════════════════════════════════════════════════════

    function updateActiveFilters() {
        const activeDiv = document.getElementById('active-filters');
        if (!activeDiv) return;

        const prices   = allProducts.map(p => p.basePrice);
        const defMin   = Math.floor(Math.min(...prices));
        const defMax   = Math.ceil(Math.max(...prices));

        let html = '';
        filters.subcategories.forEach(v  => html += tag(v,  'sub',     v));
        if (filters.priceMin > defMin || filters.priceMax < defMax)
            html += tag(`Prix : ${filters.priceMin.toLocaleString('fr-FR')} € – ${filters.priceMax.toLocaleString('fr-FR')} €`, 'price', null);
        filters.brands.forEach(v   => html += tag(v,  'brand',   v));
        filters.features.forEach(v => html += tag(v,  'feature', v));

        activeDiv.innerHTML = html;

        activeDiv.querySelectorAll('.remove').forEach(btn => {
            btn.addEventListener('click', function () {
                const type = this.dataset.filter, value = this.dataset.value;
                if (type === 'sub') {
                    document.querySelectorAll('.subcategory-checkbox').forEach(cb => { if (cb.value === value) cb.checked = false; });
                    filters.subcategories = filters.subcategories.filter(v => v !== value);
                } else if (type === 'brand') {
                    document.querySelectorAll('.brand-checkbox').forEach(cb => { if (cb.value === value) cb.checked = false; });
                    filters.brands = filters.brands.filter(v => v !== value);
                } else if (type === 'feature') {
                    document.querySelectorAll('.feature-checkbox').forEach(cb => { if (cb.value === value) cb.checked = false; });
                    filters.features = filters.features.filter(v => v !== value);
                } else if (type === 'price') {
                    const prices   = allProducts.map(p => p.basePrice);
                    const minPrice = Math.floor(Math.min(...prices));
                    const maxPrice = Math.ceil(Math.max(...prices));
                    if (priceMinSlider) priceMinSlider.value = minPrice;
                    if (priceMaxSlider) priceMaxSlider.value = maxPrice;
                    if (priceMinDisplay) priceMinDisplay.textContent = minPrice.toLocaleString('fr-FR') + ' €';
                    if (priceMaxDisplay) priceMaxDisplay.textContent = maxPrice.toLocaleString('fr-FR') + ' €';
                    filters.priceMin = minPrice; filters.priceMax = maxPrice;
                }
                applyFilters();
            });
        });
    }

    function tag(label, filterType, value) {
        const valAttr = value ? `data-value="${value}"` : '';
        return `<span class="filter-tag">${label}
            <button class="remove" data-filter="${filterType}" ${valAttr}
                    aria-label="Retirer le filtre ${label}">×</button></span>`;
    }

})();