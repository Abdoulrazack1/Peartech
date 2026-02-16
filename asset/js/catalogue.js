// ============================================
// catalogue.js - Page catalogue dynamique
// ============================================

(function() {
    'use strict';

    // État de l'application
    let currentCategory = null;
    let allProducts = [];
    let filteredProducts = [];
    let displayedProducts = [];
    let currentPage = 1;
    let productsPerPage = 12;
    let sortBy = 'relevance';
    let filters = {
        subcategories: [],
        priceMin: 0,
        priceMax: Infinity,
        brands: [],
        features: []
    };
    let viewMode = 'grid'; // grid ou list

    // Éléments DOM
    const categoryTitle = document.getElementById('category-title');
    const categoryDescription = document.getElementById('category-description');
    const resultsCount = document.getElementById('results-count');
    const productsGrid = document.getElementById('products-grid');
    const paginationDiv = document.getElementById('pagination');
    const resetFiltersBtn = document.getElementById('reset-filters');
    const sortSelect = document.getElementById('sort');
    const viewBtns = document.querySelectorAll('.view-btn');
    const priceMinSlider = document.getElementById('price-min');
    const priceMaxSlider = document.getElementById('price-max');
    const priceMinDisplay = document.getElementById('price-min-display');
    const priceMaxDisplay = document.getElementById('price-max-display');
    const breadcrumb = document.getElementById('breadcrumb');

    // Initialisation
    document.addEventListener('DOMContentLoaded', function() {
        // Récupérer la catégorie depuis l'URL
        const urlParams = new URLSearchParams(window.location.search);
        const categorySlug = urlParams.get('categorie');

        if (!window.NovaComputeDB) {
            console.error('NovaComputeDB non chargé');
            return;
        }

        // Déterminer la catégorie
        if (categorySlug) {
            const cat = NovaComputeDB.getCategoryBySlug(categorySlug);
            if (cat) {
                currentCategory = cat;
                allProducts = NovaComputeDB.getProductsByCategory(cat.slug);
            } else {
                // Si catégorie inconnue, rediriger
                window.location.href = 'page_accueil.html';
                return;
            }
        } else {
            // Pas de catégorie : afficher tous les produits
            currentCategory = { name: 'Tous les produits', description: 'Découvrez tous nos ordinateurs et accessoires.', slug: 'tous' };
            allProducts = NovaComputeDB.products;
        }

        // Mettre à jour l'affichage de la catégorie
        if (currentCategory) {
            categoryTitle.textContent = currentCategory.name;
            categoryDescription.textContent = currentCategory.description || 'Sélection de produits de qualité.';
        }

        // Initialiser les filtres
        initFilters();

        // Appliquer les filtres et afficher
        applyFilters();

        // Événements
        resetFiltersBtn.addEventListener('click', resetFilters);
        sortSelect.addEventListener('change', function() {
            sortBy = this.value;
            applyFilters();
        });

        viewBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                viewBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                viewMode = this.dataset.view;
                productsGrid.classList.toggle('list-view', viewMode === 'list');
                // Re-rendre les produits (la vue change, pas les données)
                renderProducts(displayedProducts);
            });
        });

        // Sliders prix
        priceMinSlider.addEventListener('input', function() {
            priceMinDisplay.textContent = this.value + ' €';
            filters.priceMin = parseInt(this.value);
            applyFilters();
        });
        priceMaxSlider.addEventListener('input', function() {
            priceMaxDisplay.textContent = this.value + ' €';
            filters.priceMax = parseInt(this.value);
            applyFilters();
        });

        // Breadcrumb
        if (breadcrumb) {
            let catName = currentCategory ? currentCategory.name : 'Tous les produits';
            breadcrumb.innerHTML = `
                <a href="page_accueil.html">Accueil</a>
                <span>/</span>
                <a href="page_catalogue.html">Toutes les catégories</a>
                <span>/</span>
                <span>${catName}</span>
            `;
        }
    });

    // Initialiser les filtres dynamiquement à partir des produits
    function initFilters() {
        // Extraire les sous-catégories (tags) et marques (simulées)
        const subcategories = new Map(); // tag -> count
        const brands = new Map(); // marque -> count
        const features = new Set(); // caractéristiques comme 'processeur i7', etc.

        allProducts.forEach(product => {
            // Sous-catégories basées sur les tags (on prend les 2 premiers tags pertinents)
            product.tags.slice(0, 3).forEach(tag => {
                subcategories.set(tag, (subcategories.get(tag) || 0) + 1);
            });

            // Marques simulées : on prend le premier mot du nom ou on utilise un mapping
            let brand = product.name.split(' ')[0]; // ex: "Ultrabook", "Setup", etc.
            brands.set(brand, (brands.get(brand) || 0) + 1);

            // Caractéristiques : processeur, RAM, etc.
            if (product.specs.processor) {
                if (product.specs.processor.includes('i7')) features.add('Processeur i7');
                if (product.specs.processor.includes('i5')) features.add('Processeur i5');
                if (product.specs.processor.includes('Ryzen')) features.add('Processeur Ryzen');
            }
            if (product.specs.ram) {
                if (product.specs.ram.includes('32')) features.add('RAM 32 Go');
                else if (product.specs.ram.includes('16')) features.add('RAM 16 Go');
                else if (product.specs.ram.includes('8')) features.add('RAM 8 Go');
            }
            if (product.specs.graphics && product.specs.graphics.includes('RTX')) {
                features.add('Carte graphique dédiée');
            }
        });

        // Générer les checkboxes sous-catégories
        const subcatDiv = document.getElementById('subcategories-filter');
        subcatDiv.innerHTML = '';
        subcategories.forEach((count, label) => {
            const item = document.createElement('label');
            item.className = 'checkbox-item';
            item.innerHTML = `
                <input type="checkbox" class="subcategory-checkbox" value="${label}">
                <span>${label}</span>
                <span class="checkbox-count">${count}</span>
            `;
            subcatDiv.appendChild(item);
        });
        // Ajouter événement
        document.querySelectorAll('.subcategory-checkbox').forEach(cb => {
            cb.addEventListener('change', function() {
                filters.subcategories = Array.from(document.querySelectorAll('.subcategory-checkbox:checked')).map(c => c.value);
                applyFilters();
            });
        });

        // Marques
        const brandsDiv = document.getElementById('brands-filter');
        brandsDiv.innerHTML = '';
        brands.forEach((count, label) => {
            const item = document.createElement('label');
            item.className = 'checkbox-item';
            item.innerHTML = `
                <input type="checkbox" class="brand-checkbox" value="${label}">
                <span>${label}</span>
                <span class="checkbox-count">${count}</span>
            `;
            brandsDiv.appendChild(item);
        });
        document.querySelectorAll('.brand-checkbox').forEach(cb => {
            cb.addEventListener('change', function() {
                filters.brands = Array.from(document.querySelectorAll('.brand-checkbox:checked')).map(c => c.value);
                applyFilters();
            });
        });

        // Caractéristiques
        const featuresDiv = document.getElementById('features-filter');
        featuresDiv.innerHTML = '';
        features.forEach(feature => {
            const item = document.createElement('label');
            item.className = 'checkbox-item';
            item.innerHTML = `
                <input type="checkbox" class="feature-checkbox" value="${feature}">
                <span>${feature}</span>
                <span class="checkbox-count"></span>
            `;
            featuresDiv.appendChild(item);
        });
        document.querySelectorAll('.feature-checkbox').forEach(cb => {
            cb.addEventListener('change', function() {
                filters.features = Array.from(document.querySelectorAll('.feature-checkbox:checked')).map(c => c.value);
                applyFilters();
            });
        });

        // Initialiser les sliders prix
        const prices = allProducts.map(p => p.basePrice || p.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        priceMinSlider.min = minPrice;
        priceMinSlider.max = maxPrice;
        priceMaxSlider.min = minPrice;
        priceMaxSlider.max = maxPrice;
        priceMinSlider.value = minPrice;
        priceMaxSlider.value = maxPrice;
        priceMinDisplay.textContent = minPrice + ' €';
        priceMaxDisplay.textContent = maxPrice + ' €';
        filters.priceMin = minPrice;
        filters.priceMax = maxPrice;
    }

    // Appliquer les filtres et le tri
    function applyFilters() {
        // Filtrer
        filteredProducts = allProducts.filter(product => {
            const price = product.basePrice || product.price;

            // Filtre sous-catégories
            if (filters.subcategories.length > 0) {
                const match = filters.subcategories.some(sub => product.tags.includes(sub));
                if (!match) return false;
            }

            // Filtre prix
            if (price < filters.priceMin || price > filters.priceMax) return false;

            // Filtre marques
            if (filters.brands.length > 0) {
                const brand = product.name.split(' ')[0];
                if (!filters.brands.includes(brand)) return false;
            }

            // Filtre caractéristiques (simplifié)
            if (filters.features.length > 0) {
                // Logique à adapter selon vos besoins
                let ok = true;
                filters.features.forEach(f => {
                    if (f === 'Carte graphique dédiée' && !product.specs.graphics) ok = false;
                    if (f.includes('Processeur') && product.specs.processor && !product.specs.processor.includes(f.replace('Processeur ', ''))) ok = false;
                    if (f.includes('RAM') && product.specs.ram && !product.specs.ram.includes(f.replace('RAM ', '').replace(' Go', ''))) ok = false;
                });
                return ok;
            }

            return true;
        });

        // Trier
        switch (sortBy) {
            case 'price-asc':
                filteredProducts.sort((a, b) => (a.basePrice || a.price) - (b.basePrice || b.price));
                break;
            case 'price-desc':
                filteredProducts.sort((a, b) => (b.basePrice || b.price) - (a.basePrice || a.price));
                break;
            case 'rating':
                filteredProducts.sort((a, b) => b.rating - a.rating);
                break;
            default:
                // Pertinence : on garde l'ordre original
                break;
        }

        // Mettre à jour le compteur
        resultsCount.textContent = filteredProducts.length + ' résultats';

        // Réinitialiser la pagination
        currentPage = 1;
        updatePagination();
        displayCurrentPage();

        // Mettre à jour les filtres actifs (tags)
        updateActiveFilters();
    }

    // Afficher la page courante
    function displayCurrentPage() {
        const start = (currentPage - 1) * productsPerPage;
        const end = start + productsPerPage;
        displayedProducts = filteredProducts.slice(start, end);
        renderProducts(displayedProducts);
    }

    // Générer le HTML des produits
    function renderProducts(products) {
        if (products.length === 0) {
            productsGrid.innerHTML = '<p class="no-results">Aucun produit ne correspond à vos critères.</p>';
            return;
        }

        const html = products.map(product => {
            const price = product.basePrice || product.price;
            const badge = product.isNew ? '<span class="product-badge badge-new">Nouveau</span>' :
                         product.isBestSeller ? '<span class="product-badge badge-bestseller">Meilleure vente</span>' : '';
            return `
                <div class="product-card">
                    <div class="product-image">
                        <img src="${product.images[0]}" alt="${product.name}">
                        ${badge}
                    </div>
                    <div class="product-info">
                        <h3 class="product-name">${product.name}</h3>
                        <p class="product-specs">${product.specs.processor} - ${product.specs.ram} - ${product.specs.storage}</p>
                        <div class="product-rating">
                            <span class="stars">${'★'.repeat(Math.floor(product.rating))}${product.rating % 1 >= 0.5 ? '½' : ''}</span>
                            <span class="rating-count">${product.reviews} avis</span>
                        </div>
                        <div class="product-footer">
                            <div class="product-price">${price.toFixed(2).replace('.',',')} €</div>
                            <button class="btn-add-cart">Ajouter au panier</button>
                        </div>
                        <button class="btn-view-product" onclick="window.location.href='page_produit.html?id=${product.id}'">Voir la fiche produit</button>
                    </div>
                </div>
            `;
        }).join('');

        productsGrid.innerHTML = html;
    }

    // Mettre à jour la pagination
    function updatePagination() {
        const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
        let paginationHtml = '';

        // Bouton précédent
        paginationHtml += `<button class="page-btn prev ${currentPage === 1 ? 'disabled' : ''}" data-page="${currentPage - 1}">Précédent</button>`;

        // Numéros de page
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                paginationHtml += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
            } else if (i === currentPage - 3 || i === currentPage + 3) {
                paginationHtml += `<span class="page-dots">...</span>`;
            }
        }

        // Bouton suivant
        paginationHtml += `<button class="page-btn next ${currentPage === totalPages ? 'disabled' : ''}" data-page="${currentPage + 1}">Suivant</button>`;

        paginationDiv.innerHTML = paginationHtml;

        // Ajouter événements
        document.querySelectorAll('.page-btn:not(.disabled)').forEach(btn => {
            btn.addEventListener('click', function() {
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

    // Réinitialiser tous les filtres
    function resetFilters() {
        // Décocher toutes les checkboxes
        document.querySelectorAll('.subcategory-checkbox, .brand-checkbox, .feature-checkbox').forEach(cb => cb.checked = false);
        // Remettre les sliders à leurs valeurs min/max
        const prices = allProducts.map(p => p.basePrice || p.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        priceMinSlider.value = minPrice;
        priceMaxSlider.value = maxPrice;
        priceMinDisplay.textContent = minPrice + ' €';
        priceMaxDisplay.textContent = maxPrice + ' €';
        filters = {
            subcategories: [],
            priceMin: minPrice,
            priceMax: maxPrice,
            brands: [],
            features: []
        };
        applyFilters();
    }

    // Mettre à jour l'affichage des filtres actifs
    function updateActiveFilters() {
        const activeDiv = document.getElementById('active-filters');
        let html = '';

        if (filters.subcategories.length > 0) {
            filters.subcategories.forEach(sub => {
                html += `<span class="filter-tag">${sub} <span class="remove" data-filter="sub" data-value="${sub}">×</span></span>`;
            });
        }
        if (filters.priceMin > priceMinSlider.min || filters.priceMax < priceMaxSlider.max) {
            html += `<span class="filter-tag">Prix: ${filters.priceMin}€ - ${filters.priceMax}€ <span class="remove" data-filter="price">×</span></span>`;
        }
        if (filters.brands.length > 0) {
            filters.brands.forEach(brand => {
                html += `<span class="filter-tag">${brand} <span class="remove" data-filter="brand" data-value="${brand}">×</span></span>`;
            });
        }
        if (filters.features.length > 0) {
            filters.features.forEach(feat => {
                html += `<span class="filter-tag">${feat} <span class="remove" data-filter="feature" data-value="${feat}">×</span></span>`;
            });
        }

        if (html === '') {
            activeDiv.innerHTML = '';
        } else {
            activeDiv.innerHTML = html;
        }

        // Ajouter événements pour les croix
        document.querySelectorAll('.filter-tag .remove').forEach(remove => {
            remove.addEventListener('click', function() {
                const filter = this.dataset.filter;
                const value = this.dataset.value;
                if (filter === 'sub') {
                    document.querySelectorAll('.subcategory-checkbox').forEach(cb => {
                        if (cb.value === value) cb.checked = false;
                    });
                    filters.subcategories = filters.subcategories.filter(v => v !== value);
                } else if (filter === 'brand') {
                    document.querySelectorAll('.brand-checkbox').forEach(cb => {
                        if (cb.value === value) cb.checked = false;
                    });
                    filters.brands = filters.brands.filter(v => v !== value);
                } else if (filter === 'feature') {
                    document.querySelectorAll('.feature-checkbox').forEach(cb => {
                        if (cb.value === value) cb.checked = false;
                    });
                    filters.features = filters.features.filter(v => v !== value);
                } else if (filter === 'price') {
                    priceMinSlider.value = priceMinSlider.min;
                    priceMaxSlider.value = priceMaxSlider.max;
                    filters.priceMin = parseInt(priceMinSlider.min);
                    filters.priceMax = parseInt(priceMaxSlider.max);
                    priceMinDisplay.textContent = filters.priceMin + ' €';
                    priceMaxDisplay.textContent = filters.priceMax + ' €';
                }
                applyFilters();
            });
        });
    }
})();