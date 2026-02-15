// ============================================
// product-detail.js - Page produit dynamique avec options et prix évolutif
// ============================================

(function() {
    'use strict';

    // Fonction utilitaire pour obtenir le slug d'une catégorie à partir de son ID
    function getCategorySlugFromId(categoryId) {
        if (!window.NovaComputeDB) return '';
        const cat = NovaComputeDB.categories.find(c => c.id === categoryId);
        return cat ? cat.slug : '';
    }

    document.addEventListener('DOMContentLoaded', function() {
        // Récupérer l'ID du produit depuis l'URL
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        if (!productId) {
            window.location.href = 'page_accueil.html';
            return;
        }

        // Vérifier que la base de données est chargée
        if (!window.NovaComputeDB) {
            console.error('NovaComputeDB non chargé');
            document.querySelector('main').innerHTML = '<div class="container"><p>Erreur de chargement des données</p></div>';
            return;
        }

        const product = NovaComputeDB.getProductById(parseInt(productId));
        if (!product) {
            document.querySelector('main').innerHTML = '<div class="container"><p>Produit introuvable</p></div>';
            return;
        }

        // Récupérer le slug de la catégorie
        const categorySlug = getCategorySlugFromId(product.categoryId);

        // Générer le fil d'Ariane
        const breadcrumb = document.getElementById('breadcrumb');
        if (breadcrumb) {
            breadcrumb.innerHTML = `
                <a href="page_accueil.html">Accueil</a>
                <span>/</span>
                <a href="page_catalogue.html?categorie=${categorySlug}">${categorySlug ? categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1) : 'Catégorie'}</a>
                <span>/</span>
                <span>${product.name}</span>
            `;
        }

        // Générer le HTML de la page produit
        const productDetail = document.getElementById('product-detail');
        if (productDetail) {
            productDetail.innerHTML = generateProductHTML(product);
        }

        // Initialiser les onglets
        initTabs();

        // Initialiser les miniatures
        initThumbnails(product);

        // Initialiser les options et la mise à jour du prix
        initOptions(product);

        // Générer les produits similaires
        generateSimilarProducts(product);
    });

    function generateProductHTML(product) {
        // Calcul du badge de stock
        const stockClass = product.stock > 0 ? 'in-stock' : 'out';
        const stockText = product.stock > 0 ? 'En stock - livraison offerte' : 'Rupture de stock';
        const stockIcon = product.stock > 0 ? 'check_circle' : 'cancel';

        // Prix barré si oldPrice existe
        const oldPriceHtml = product.oldPrice ? `<span class="old-price">${product.oldPrice.toFixed(2).replace('.',',')} €</span>` : '';

        // Génération des étoiles
        const fullStars = Math.floor(product.rating);
        const halfStar = product.rating % 1 >= 0.5;
        const stars = '★'.repeat(fullStars) + (halfStar ? '½' : '');

        // Construction des spécifications pour l'affichage rapide
        const specsShort = `${product.specs.processor} - ${product.specs.ram} - ${product.specs.storage}`;

        // Génération des options de personnalisation
        let optionsHtml = '';
        if (product.options && Object.keys(product.options).length > 0) {
            optionsHtml = '<div class="product-options">';
            for (const [key, values] of Object.entries(product.options)) {
                const optionLabel = key === 'ram' ? 'Mémoire RAM' :
                                   key === 'storage' ? 'Stockage' :
                                   key === 'color' ? 'Couleur' :
                                   key === 'rgb' ? 'Éclairage RGB' :
                                   key === 'screen' ? 'Écran' :
                                   key === 'switches' ? 'Switches' :
                                   key.charAt(0).toUpperCase() + key.slice(1);
                optionsHtml += `
                    <div class="option-group" data-option-group="${key}">
                        <span class="option-label">${optionLabel}:</span>
                        <div class="option-buttons" data-option="${key}">
                            ${values.map((opt, index) => `
                                <button class="option-btn ${index === 0 ? 'active' : ''}" data-price="${opt.price}" data-value="${opt.label}">${opt.label}</button>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
            optionsHtml += '</div>';
        }

        return `
            <div class="product-gallery">
                <div class="main-image" id="main-image">
                    <img src="${product.images[0]}" alt="${product.name}">
                </div>
                <div class="thumbnail-list" id="thumbnail-list">
                    ${product.images.map((img, index) => `
                        <div class="thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}">
                            <img src="${img}" alt="Miniature ${index+1}">
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="product-info">
                <div class="product-category">${product.tags[0] || 'PC'}</div>
                <h1 class="product-title">${product.name}</h1>
                <div class="product-subtitle">${specsShort}</div>
                
                <div class="product-rating">
                    <span class="stars">${stars}</span>
                    <span class="rating-count">${product.rating} (${product.reviews} avis)</span>
                </div>

                <div class="product-price-box">
                    <div>
                        <span class="current-price" id="current-price">${product.basePrice.toFixed(2).replace('.',',')} €</span>
                        ${oldPriceHtml}
                    </div>
                    <div class="payment-info">ou 12 × ${(product.basePrice/12).toFixed(2).replace('.',',')} € sans frais</div>
                    <div class="stock-status ${stockClass}">
                        <span class="material-symbols-outlined">${stockIcon}</span>
                        ${stockText}
                    </div>
                </div>

                ${optionsHtml}

                <div class="product-actions">
                    <button class="btn-primary btn-large" id="add-to-cart">Ajouter au panier</button>
                    <button class="btn-secondary btn-large" id="buy-now">Acheter maintenant</button>
                    <button class="wishlist-btn">
                        <span class="material-symbols-outlined">favorite</span>
                        <span>Ajouter à ma liste</span>
                    </button>
                </div>

                <div class="product-services">
                    <div class="service-item">
                        <span class="material-symbols-outlined">verified</span>
                        <div>Extension de garantie</div>
                        <small>Prolongez jusqu'à 5 ans</small>
                    </div>
                    <div class="service-item">
                        <span class="material-symbols-outlined">build</span>
                        <div>Installation & transfert</div>
                        <small>Logiciels et données</small>
                    </div>
                    <div class="service-item">
                        <span class="material-symbols-outlined">assignment_return</span>
                        <div>Retour 30 jours</div>
                        <small>Gratuit</small>
                    </div>
                </div>
            </div>

            <!-- Onglets -->
            <div class="product-tabs" style="grid-column: 1/-1;">
                <div class="tabs-header">
                    <button class="tab-btn active" data-tab="desc">Description détaillée</button>
                    <button class="tab-btn" data-tab="specs">Fiche technique</button>
                    <button class="tab-btn" data-tab="reviews">Avis clients (${product.reviews})</button>
                    <button class="tab-btn" data-tab="faq">Questions / Réponses</button>
                </div>
                <div class="tab-content active" id="tab-desc">
                    <p>${product.description}</p>
                    <h3>Pensé pour la mobilité et les journées intenses</h3>
                    <p>Ouverture instantanée, autonomie jusqu'à 15 heures et châssis aluminium ultrafin : l'Ultrabook Nova 14" Pro est conçu pour vous suivre partout sans compromis sur le confort.</p>
                </div>
                <div class="tab-content" id="tab-specs">
                    <table class="specs-table">
                        ${Object.entries(product.specs).map(([key, value]) => `
                            <tr><td>${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</td><td>${value}</td></tr>
                        `).join('')}
                    </table>
                </div>
                <div class="tab-content" id="tab-reviews">
                    <div class="reviews-summary">
                        <div class="average-rating">${product.rating}</div>
                        <div class="review-bars">
                            ${[5,4,3,2,1].map(star => {
                                let percent = star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 7 : star === 2 ? 2 : 1;
                                return `
                                    <div class="review-bar-item">
                                        <span class="bar-label">${star}★</span>
                                        <div class="bar"><div class="bar-fill" style="width: ${percent}%"></div></div>
                                        <span>${percent}%</span>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                    <div class="reviews-list">
                        <div class="review-card">
                            <div class="review-header">
                                <span class="review-author">Jean D.</span>
                                <span class="review-date">Il y a 2 jours</span>
                            </div>
                            <div class="stars">★★★★★</div>
                            <p class="review-text">Idéal pour le télétravail. Silencieux, très léger et l'écran est parfait.</p>
                        </div>
                        <div class="review-card">
                            <div class="review-header">
                                <span class="review-author">Marie L.</span>
                                <span class="review-date">Il y a 1 semaine</span>
                            </div>
                            <div class="stars">★★★★☆</div>
                            <p class="review-text">Parfait en déplacement, l'autonomie tient la journée.</p>
                        </div>
                    </div>
                </div>
                <div class="tab-content" id="tab-faq">
                    <p>Aucune question pour le moment. Soyez le premier à poser une question.</p>
                </div>
            </div>
        `;
    }

    function initTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.dataset.tab;
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                const activeTab = document.getElementById(`tab-${tabId}`);
                if (activeTab) activeTab.classList.add('active');
            });
        });
    }

    function initThumbnails(product) {
        const thumbnails = document.querySelectorAll('.thumbnail');
        const mainImage = document.querySelector('#main-image img');

        if (!mainImage) return;

        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', () => {
                const index = thumb.dataset.index;
                if (product.images[index]) {
                    mainImage.src = product.images[index];
                    thumbnails.forEach(t => t.classList.remove('active'));
                    thumb.classList.add('active');
                }
            });
        });
    }

    function initOptions(product) {
        const optionGroups = document.querySelectorAll('.option-group');
        const priceElement = document.getElementById('current-price');
        if (!priceElement) return;

        // Prix de base
        let basePrice = product.basePrice;

        // Fonction pour mettre à jour le prix total
        function updatePrice() {
            let total = basePrice;
            optionGroups.forEach(group => {
                const activeBtn = group.querySelector('.option-btn.active');
                if (activeBtn && activeBtn.dataset.price) {
                    total += parseFloat(activeBtn.dataset.price);
                }
            });
            priceElement.textContent = total.toFixed(2).replace('.',',') + ' €';
            // Mettre à jour aussi le prix mensuel
            const paymentInfo = document.querySelector('.payment-info');
            if (paymentInfo) {
                paymentInfo.textContent = `ou 12 × ${(total/12).toFixed(2).replace('.',',')} € sans frais`;
            }
        }

        // Ajouter les événements sur les boutons d'option
        optionGroups.forEach(group => {
            const btns = group.querySelectorAll('.option-btn');
            btns.forEach(btn => {
                btn.addEventListener('click', () => {
                    // Retirer la classe active des autres boutons du même groupe
                    btns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    updatePrice();
                });
            });
        });

        // Initialiser le prix
        updatePrice();
    }

    function generateSimilarProducts(currentProduct) {
        const grid = document.getElementById('similar-products-grid');
        if (!grid) return;

        // Récupérer les produits de la même catégorie, exclure le courant
        const categorySlug = getCategorySlugFromId(currentProduct.categoryId);
        let similar = [];
        if (categorySlug && NovaComputeDB.getProductsByCategory) {
            similar = NovaComputeDB.getProductsByCategory(categorySlug).filter(p => p.id !== currentProduct.id).slice(0, 6);
        }

        if (similar.length === 0) {
            grid.innerHTML = '<p>Aucun produit similaire pour le moment.</p>';
            return;
        }

        grid.innerHTML = similar.map(p => {
            const badge = p.isNew ? '<span class="product-badge badge-new">Nouveau</span>' : '';
            return `
                <div class="product-card" data-category="${categorySlug}">
                    <div class="product-image">
                        <img src="${p.images[0]}" alt="${p.name}">
                        ${badge}
                    </div>
                    <div class="product-info">
                        <h3 class="product-name">${p.name}</h3>
                        <p class="product-specs">${p.specs.processor} - ${p.specs.ram}</p>
                        <div class="product-footer">
                            <div class="product-price">${p.basePrice.toFixed(2).replace('.',',')} €</div>
                            <button class="btn-add-cart">Ajouter au panier</button>
                        </div>
                        <button class="btn-view-product" onclick="window.location.href='page_produit.html?id=${p.id}'">Voir le produit</button>
                    </div>
                </div>
            `;
        }).join('');
    }
})();