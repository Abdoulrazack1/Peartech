// ============================================
// catalogue.js – Page catalogue dynamique
// Gère : chargement des produits depuis l'API PearTech,
// filtrage multi-critères (sous-catégorie, prix,
// marque, caractéristiques), tri, pagination,
// vues grille/liste et tags de filtres actifs
// ============================================

(function () {
    'use strict';

    // ════════════════════════════════════════════════════════════════
    // ÉTAT GLOBAL
    // ════════════════════════════════════════════════════════════════

    let currentCategory   = null;
    let allProducts       = [];
    let filteredProducts  = [];
    let displayedProducts = [];
    let currentPage       = 1;
    const PRODUCTS_PER_PAGE = 12;
    let sortBy   = 'relevance';
    let viewMode = 'grid';

    let filters = {
        subcategories: [],
        priceMin:      0,
        priceMax:      Infinity,
        brands:        [],
        features:      []
    };

    // ════════════════════════════════════════════════════════════════
    // RÉFÉRENCES DOM
    // ════════════════════════════════════════════════════════════════

    let categoryTitle, categoryDescription, resultsCount, productsGrid,
        paginationDiv, resetFiltersBtn, sortSelect, viewBtns,
        priceMinSlider, priceMaxSlider, priceMinDisplay, priceMaxDisplay, breadcrumb;

    // ════════════════════════════════════════════════════════════════
    // UTILITAIRES
    // ════════════════════════════════════════════════════════════════

    // Détermine la marque d'un produit : priorité au champ marque, sinon premier mot du nom
    function getBrand(product) {
        if (product.marque) return product.marque;
        return (product.nom || '').split(' ')[0];
    }

    // Vérifie si un produit est compatible 5G via ses options JSON
    function has5G(product) {
        if (!product.options) return false;
        const opts = typeof product.options === 'string' ? JSON.parse(product.options) : product.options;
        return Object.values(opts).flat().some(o => o && o.label && o.label.includes('5G'));
    }

    // Vérifie si un produit intègre le GPS via specs ou options
    function hasGPS(product) {
        const specs = typeof product.specs === 'string' ? product.specs : JSON.stringify(product.specs || {});
        const opts  = typeof product.options === 'string' ? product.options : JSON.stringify(product.options || {});
        return (specs + opts).toLowerCase().includes('gps');
    }

    // Retourne les tags sous forme de tableau (ils arrivent parsés depuis l'API)
    function getTags(product) {
        if (!product.tags) return [];
        if (Array.isArray(product.tags)) return product.tags;
        try { return JSON.parse(product.tags); } catch (e) { return []; }
    }

    // Retourne les images sous forme de tableau
    function getImages(product) {
        if (!product.images) return [];
        if (Array.isArray(product.images)) return product.images;
        try { return JSON.parse(product.images); } catch (e) { return []; }
    }

    // Retourne les specs sous forme d'objet
    function getSpecs(product) {
        if (!product.specs) return {};
        if (typeof product.specs === 'object') return product.specs;
        try { return JSON.parse(product.specs); } catch (e) { return {}; }
    }

    // ════════════════════════════════════════════════════════════════
    // INITIALISATION
    // ════════════════════════════════════════════════════════════════

    document.addEventListener('DOMContentLoaded', async function () {

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

        if (!window.PearTechAPI) {
            console.error('[catalogue.js] window.PearTechAPI non chargé');
            if (productsGrid) productsGrid.innerHTML = '<p class="no-results">Impossible de charger les produits.</p>';
            return;
        }

        if (resultsCount) resultsCount.textContent = 'Chargement…';

        // Lecture du paramètre de catégorie dans l'URL
        const urlParams    = new URLSearchParams(window.location.search);
        const categorySlug = urlParams.get('categorie');

        try {
            // Chargement des catégories et des produits depuis l'API
            const categories = await PearTechAPI.categories();

            if (categorySlug) {
                const cat = categories.find(c => c.slug === categorySlug);
                if (!cat) { window.location.href = 'page_accueil.html'; return; }
                currentCategory = cat;
                // Charge uniquement les produits de cette catégorie
                const data = await PearTechAPI.produits('categorie=' + categorySlug);
                allProducts = Array.isArray(data) ? data : (data.data || []);
            } else {
                currentCategory = {
                    nom:         'Tous les produits',
                    description: 'Découvrez toute notre sélection de smartphones, tablettes, montres et accessoires high-tech.',
                    slug:        'tous'
                };
                // Charge tous les produits
                const data = await PearTechAPI.produits('');
                allProducts = Array.isArray(data) ? data : (data.data || []);
            }
        } catch (e) {
            console.error('[catalogue.js] Erreur chargement produits :', e);
            if (productsGrid) productsGrid.innerHTML = '<p class="no-results">Erreur lors du chargement des produits.</p>';
            return;
        }

        // Mise à jour des textes d'en-tête
        if (categoryTitle)       categoryTitle.textContent       = currentCategory.nom || 'Catalogue';
        if (categoryDescription) categoryDescription.textContent = currentCategory.description || '';

        // Fil d'Ariane
        if (breadcrumb) {
            breadcrumb.innerHTML = `
                <a href="page_accueil.html">Accueil</a>
                <span aria-hidden="true">/</span>
                <a href="page_catalogue.html">Toutes les catégories</a>
                <span aria-hidden="true">/</span>
                <span id="current-category-name" aria-current="page">${currentCategory.nom || 'Catalogue'}</span>`;
        }

        initFilters();
        applyFilters();

        // Événements toolbar
        if (resetFiltersBtn) resetFiltersBtn.addEventListener('click', resetFilters);

        if (sortSelect) sortSelect.addEventListener('change', function () {
            sortBy = this.value;
            applyFilters();
        });

        viewBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                viewBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
                this.classList.add('active');
                this.setAttribute('aria-pressed', 'true');
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
    // CONSTRUCTION DES FILTRES SIDEBAR
    // ════════════════════════════════════════════════════════════════

    function initFilters() {

        // ── Marques ────────────────────────────────────────────────
        const brandsMap = new Map();
        allProducts.forEach(p => {
            const b = getBrand(p);
            brandsMap.set(b, (brandsMap.get(b) || 0) + 1);
        });

        const brandsDiv = document.getElementById('brands-filter');
        if (brandsDiv) {
            brandsDiv.innerHTML = '';
            [...brandsMap.entries()].sort((a, b) => b[1] - a[1]).forEach(([label, count]) => {
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

        // ── Caractéristiques ────────────────────────────────────────
        const featSet = new Set();
        allProducts.forEach(p => {
            const specs = getSpecs(p);
            if (specs.os) {
                const os = specs.os.toLowerCase();
                if (os.includes('ios') || os.includes('ipados')) featSet.add('iOS / iPadOS');
                else if (os.includes('android'))                  featSet.add('Android');
                else if (os.includes('fire'))                     featSet.add('Fire OS');
            }
            if (has5G(p))  featSet.add('Compatible 5G');
            if (hasGPS(p)) featSet.add('GPS intégré');
            if (specs.ram) {
                const r = parseInt(specs.ram);
                if (r <= 4)       featSet.add('RAM ≤ 4 Go');
                else if (r <= 8)  featSet.add('RAM 6–8 Go');
                else if (r <= 12) featSet.add('RAM 12 Go');
                else              featSet.add('RAM 16 Go et +');
            }
            if (p.ancienPrix && p.ancienPrix > p.prix) featSet.add('En promotion');
            if (p.estNouveau)    featSet.add('Nouveautés');
            if (p.estBestSeller) featSet.add('Meilleures ventes');
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

        // ── Sous-catégories (par marque) ───────────────────────────
        const subcatMap = new Map();
        allProducts.forEach(p => {
            const b = getBrand(p);
            subcatMap.set(b, (subcatMap.get(b) || 0) + 1);
        });

        const subcatDiv = document.getElementById('subcategories-filter');
        if (subcatDiv) {
            subcatDiv.innerHTML = '';
            [...subcatMap.entries()].sort((a, b) => b[1] - a[1]).forEach(([label, count]) => {
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

        // ── Sliders de prix ────────────────────────────────────────
        const prices   = allProducts.map(p => parseFloat(p.prix) || 0);
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
    // APPLICATION DES FILTRES ET DU TRI
    // ════════════════════════════════════════════════════════════════

    function applyFilters() {
        filteredProducts = allProducts.filter(p => {
            const prix = parseFloat(p.prix) || 0;

            // Filtre marque (sous-catégories et marques utilisent getBrand)
            if (filters.subcategories.length && !filters.subcategories.includes(getBrand(p))) return false;
            if (filters.brands.length        && !filters.brands.includes(getBrand(p)))        return false;

            // Filtre prix
            if (prix < filters.priceMin || prix > filters.priceMax) return false;

            // Filtre caractéristiques
            if (filters.features.length && !filters.features.every(f => matchesFeature(p, f))) return false;

            return true;
        });

        // Tri
        switch (sortBy) {
            case 'price-asc':  filteredProducts.sort((a, b) => parseFloat(a.prix) - parseFloat(b.prix)); break;
            case 'price-desc': filteredProducts.sort((a, b) => parseFloat(b.prix) - parseFloat(a.prix)); break;
            case 'rating':     filteredProducts.sort((a, b) => (parseFloat(b.note) || 0) - (parseFloat(a.note) || 0)); break;
            case 'new':        filteredProducts.sort((a, b) => (b.estNouveau ? 1 : 0) - (a.estNouveau ? 1 : 0)); break;
        }

        if (resultsCount) resultsCount.textContent = filteredProducts.length + ' résultat'
            + (filteredProducts.length !== 1 ? 's' : '');

        currentPage = 1;
        displayCurrentPage();
        updatePagination();
        updateActiveFilters();
    }

    function matchesFeature(product, feat) {
        const specs = getSpecs(product);
        switch (feat) {
            case 'iOS / iPadOS':      return specs.os && /ios|ipados/i.test(specs.os);
            case 'Android':           return specs.os && /android/i.test(specs.os);
            case 'Fire OS':           return specs.os && /fire/i.test(specs.os);
            case 'Compatible 5G':     return has5G(product);
            case 'GPS intégré':       return hasGPS(product);
            case 'RAM ≤ 4 Go':        return specs.ram && parseInt(specs.ram) <= 4;
            case 'RAM 6–8 Go':        return specs.ram && parseInt(specs.ram) >= 6 && parseInt(specs.ram) <= 8;
            case 'RAM 12 Go':         return specs.ram && parseInt(specs.ram) === 12;
            case 'RAM 16 Go et +':    return specs.ram && parseInt(specs.ram) >= 16;
            case 'En promotion':      return product.ancienPrix && product.ancienPrix > product.prix;
            case 'Nouveautés':        return !!product.estNouveau;
            case 'Meilleures ventes': return !!product.estBestSeller;
            default: return true;
        }
    }

    function displayCurrentPage() {
        const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
        displayedProducts = filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
        renderProducts(displayedProducts);
    }

    // ════════════════════════════════════════════════════════════════
    // RENDU DES CARDS PRODUIT
    // ════════════════════════════════════════════════════════════════

    function renderProducts(products) {
        if (!productsGrid) return;

        if (!products.length) {
            productsGrid.innerHTML = '<p class="no-results">Aucun produit ne correspond à vos critères de recherche.</p>';
            return;
        }

        const FALLBACKS = {
            'cat_apple':    'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=400&q=80',
            'cat_android':  'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80',
            'cat_wearables':'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
            'cat_tablets':  'https://images.unsplash.com/photo-1587033411391-5d9e51cce126?w=400&q=80',
        };

        productsGrid.innerHTML = products.map(product => {
            const prix      = parseFloat(product.prix) || 0;
            const ancienPrix = (product.ancienPrix && parseFloat(product.ancienPrix) > prix)
                ? parseFloat(product.ancienPrix) : null;
            const discount  = ancienPrix ? Math.round((1 - prix / ancienPrix) * 100) : 0;
            const images    = getImages(product);
            const specs     = getSpecs(product);

            const badge = product.estNouveau
                ? '<span class="product-badge badge-new">Nouveau</span>'
                : discount > 0
                    ? `<span class="product-badge badge-promo">-${discount}%</span>`
                    : product.estBestSeller
                        ? '<span class="product-badge badge-bestseller">Meilleure vente</span>'
                        : '';

            const stockHtml = product.stock <= 3
                ? `<span class="stock-alert">Plus que ${product.stock} en stock !</span>`
                : product.stock <= 10
                    ? '<span class="stock-low">Stock limité</span>'
                    : '';

            const specsText = [specs.processor, specs.ram, specs.storage]
                .filter(Boolean).join(' · ') || specs.screen || '';

            const rating    = parseFloat(product.note) || 0;
            const fullStars = Math.floor(rating);
            const hasHalf   = (rating % 1) >= 0.5;
            const emptyStars= 5 - fullStars - (hasHalf ? 1 : 0);
            const stars     = '★'.repeat(fullStars)
                            + (hasHalf ? '½' : '')
                            + '<span style="opacity:0.25">' + '★'.repeat(emptyStars) + '</span>';

            const priceFmt    = prix.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €';
            const oldPriceFmt = ancienPrix
                ? `<span class="product-old-price">${ancienPrix.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>`
                : '';

            const isFav = (typeof window.Favoris !== 'undefined') && window.Favoris.isFavori(product.id);
            const fallback = FALLBACKS[product.categorieId] || '';

            return `
            <article class="product-card" aria-label="${product.nom}">
                <a href="page_produit.html?id=${product.id}" class="product-image"
                   aria-label="Voir la fiche de ${product.nom}">
                    <img src="${images[0] || fallback}"
                         alt="${product.nom}" loading="lazy"
                         data-fallback="${fallback}"
                         onerror="this.onerror=null;this.src=this.dataset.fallback||'';">
                    ${badge}${stockHtml}
                </a>
                <div class="product-info">
                    <h3 class="product-name">${product.nom}</h3>
                    ${product.marque ? `<p class="product-brand" style="font-size:.8rem;color:var(--text-muted,#888);margin:0 0 .25rem">${product.marque}</p>` : ''}
                    ${specsText ? `<p class="product-specs">${specsText}</p>` : ''}
                    <div class="product-rating"
                         aria-label="Note ${rating} sur 5, ${product.nbAvis || 0} avis">
                        <span class="stars" aria-hidden="true">${stars}</span>
                        <span class="rating-count">${rating.toFixed(1)} · ${product.nbAvis || 0} avis</span>
                    </div>
                    <div class="product-footer">
                        <div class="product-price-block">
                            <span class="product-price">${priceFmt}</span>
                            ${oldPriceFmt}
                        </div>
                        <div class="product-actions">
                            <button class="btn-add-cart" data-id="${product.id}"
                                    aria-label="Ajouter ${product.nom} au panier">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                            </button>
                            <button class="btn-fav" data-fav-btn="${product.id}"
                                    aria-label="${isFav ? 'Retirer' : 'Ajouter'} ${product.nom} ${isFav ? 'des' : 'aux'} favoris">
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

        // Ré-attache les événements panier après re-rendu
        productsGrid.querySelectorAll('.btn-add-cart').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                addToCart(parseInt(this.dataset.id), this);
            });
        });
    }

    // ════════════════════════════════════════════════════════════════
    // AJOUT AU PANIER
    // ════════════════════════════════════════════════════════════════

    function addToCart(productId, btn) {
        const product = allProducts.find(p => p.id === productId);
        if (!product) return;

        const specs  = getSpecs(product);
        const images = getImages(product);
        const CART_KEY = 'peartech-cart';
        const cart     = JSON.parse(localStorage.getItem(CART_KEY)) || [];
        const existing = cart.find(i => i.id === productId);

        if (existing) {
            existing.quantity++;
        } else {
            cart.push({
                id:       product.id,
                name:     product.nom,
                image:    images[0] || '',
                price:    parseFloat(product.prix),
                specs:    [specs.processor, specs.ram, specs.storage].filter(Boolean).join(' - '),
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
    // RÉINITIALISATION DES FILTRES
    // ════════════════════════════════════════════════════════════════

    function resetFilters() {
        document.querySelectorAll('.subcategory-checkbox, .brand-checkbox, .feature-checkbox')
            .forEach(cb => cb.checked = false);

        const prices   = allProducts.map(p => parseFloat(p.prix) || 0);
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
    // TAGS DES FILTRES ACTIFS
    // ════════════════════════════════════════════════════════════════

    function updateActiveFilters() {
        const activeDiv = document.getElementById('active-filters');
        if (!activeDiv) return;

        const prices = allProducts.map(p => parseFloat(p.prix) || 0);
        const defMin = Math.floor(Math.min(...prices));
        const defMax = Math.ceil(Math.max(...prices));

        let html = '';
        filters.subcategories.forEach(v => html += tag(v, 'sub', v));
        if (filters.priceMin > defMin || filters.priceMax < defMax)
            html += tag(`Prix : ${filters.priceMin.toLocaleString('fr-FR')} € – ${filters.priceMax.toLocaleString('fr-FR')} €`, 'price', null);
        filters.brands.forEach(v   => html += tag(v, 'brand', v));
        filters.features.forEach(v => html += tag(v, 'feature', v));

        activeDiv.innerHTML = html;

        activeDiv.querySelectorAll('.remove').forEach(btn => {
            btn.addEventListener('click', function () {
                const type  = this.dataset.filter;
                const value = this.dataset.value;

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
                    const prices   = allProducts.map(p => parseFloat(p.prix) || 0);
                    const minPrice = Math.floor(Math.min(...prices));
                    const maxPrice = Math.ceil(Math.max(...prices));
                    if (priceMinSlider) priceMinSlider.value = minPrice;
                    if (priceMaxSlider) priceMaxSlider.value = maxPrice;
                    if (priceMinDisplay) priceMinDisplay.textContent = minPrice.toLocaleString('fr-FR') + ' €';
                    if (priceMaxDisplay) priceMaxDisplay.textContent = maxPrice.toLocaleString('fr-FR') + ' €';
                    filters.priceMin = minPrice;
                    filters.priceMax = maxPrice;
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