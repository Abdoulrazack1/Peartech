// ============================================
// product_grid.js - Grille de produits page d'accueil
// Génère dynamiquement les cards produit depuis PearTechDB
// Affiche les bestsellers et nouveautés en priorité
// ============================================

(function () {
    'use strict'; // Mode strict activé

    const PLACEHOLDER = '/asset/image/no-image.png'; // Image affichée si aucune image disponible

    // Images Unsplash par catégorie : utilisées si les images locales ne se chargent pas
    const FALLBACKS = {
        'cat_apple':    'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=400&q=80',
        'cat_android':  'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80',
        'cat_wearables':'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
        'cat_tablets':  'https://images.unsplash.com/photo-1587033411391-5d9e51cce126?w=400&q=80',
    };

    // ── Génération du HTML des cards ──────────────────────────────

    function renderProducts(productsToRender) {
        const grid = document.getElementById('products-grid'); // Zone d'affichage
        if (!grid) return; // Grille absente sur cette page : on arrête

        if (!productsToRender || !productsToRender.length) { // Aucun produit à afficher
            grid.innerHTML = '<p class="no-results">Aucun produit à afficher.</p>';
            return;
        }

        // Génère le HTML de chaque card et les joint en une seule chaîne
        grid.innerHTML = productsToRender.map(product => {

            // ── Calcul du badge et des données dérivées ────────────

            const price    = product.basePrice; // Prix actuel
            const oldPrice = (product.oldPrice && product.oldPrice > price) ? product.oldPrice : null; // Ancien prix si supérieur
            const discount = oldPrice ? Math.round((1 - price / oldPrice) * 100) : 0; // Réduction en %

            // Badge prioritaire : Nouveau > Promo > Meilleure vente > rien
            const badge = product.isNew
                ? '<span class="product-badge badge-new">Nouveau</span>'
                : discount > 0
                    ? `<span class="product-badge badge-promo">-${discount}%</span>`
                    : product.isBestSeller
                        ? '<span class="product-badge badge-bestseller">Meilleure vente</span>'
                        : '';

            // Alerte stock : rouge si ≤ 3, orange si ≤ 10, rien sinon
            const stockHtml = product.stock <= 3
                ? `<span class="stock-alert">Plus que ${product.stock} en stock !</span>`
                : product.stock <= 10
                    ? '<span class="stock-low">Stock limité</span>'
                    : '';

            // Texte des specs : processeur · RAM · stockage (ou 2 premières specs dispo)
            const specsText = [product.specs.processor, product.specs.ram, product.specs.storage]
                .filter(Boolean).join(' · ')              // Joint les specs non nulles
                || Object.values(product.specs).slice(0, 2).join(' · ') // Fallback sur 2 premières specs
                || '';

            // Formatage du prix en français : 1299 → "1 299,00 €"
            const priceFmt    = price.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €';
            const oldPriceFmt = oldPrice
                ? `<span class="product-old-price">${oldPrice.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>`
                : '';

            // ── Génération des étoiles ─────────────────────────────

            const rating    = product.rating || 0;
            const fullStars = Math.floor(rating);               // Partie entière = étoiles pleines
            const hasHalf   = (rating % 1) >= 0.5;             // Demi-étoile si reste ≥ 0.5
            const emptyStars= 5 - fullStars - (hasHalf ? 1 : 0); // Étoiles restantes vides
            const stars     = '★'.repeat(fullStars)            // Étoiles pleines
                            + (hasHalf ? '½' : '')             // Demi-étoile éventuelle
                            + '<span style="opacity:0.25">' + '★'.repeat(emptyStars) + '</span>'; // Vides atténuées

            // Vérifie si le produit est déjà en favori pour initialiser le cœur
            const isFav = (typeof window.Favoris !== 'undefined') && window.Favoris.isFavori(product.id);

            // Récupère le slug de catégorie pour l'attribut data-category (utilisé par filtre.js)
            const categorySlug = (window.PearTechDB && window.PearTechDB.getCategorySlugFromId)
                ? window.PearTechDB.getCategorySlugFromId(product.categoryId) // Méthode helper si dispo
                : (product.categoryId || '').replace('cat_', ''); // Fallback : "cat_apple" → "apple"

            // ── Template HTML de la card ───────────────────────────

            return `
            <article class="product-card" aria-label="${product.name}"
                     data-product-id="${product.id}"
                     data-category="${categorySlug}">

                <!-- Lien image vers la fiche produit -->
                <a href="page_produit.html?id=${product.id}" class="product-image"
                   aria-label="Voir la fiche de ${product.name}">
                    <img src="${product.images[0] || FALLBACKS[product.categoryId] || PLACEHOLDER}"
                         alt="${product.name}" loading="lazy"
                         data-fallback="${FALLBACKS[product.categoryId] || PLACEHOLDER}"
                         onerror="this.onerror=null;this.src=this.dataset.fallback||'${PLACEHOLDER}';">
                    ${badge}${stockHtml}
                </a>

                <!-- Informations du produit -->
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
                            <!-- Bouton ajout au panier : data-id utilisé par panier.js -->
                            <button class="btn-add-cart" data-id="${product.id}"
                                    aria-label="Ajouter ${product.name} au panier">
                                <span class="material-symbols-outlined" aria-hidden="true">shopping_cart</span>
                            </button>
                            <!-- Bouton favori : SVG cœur plein ou vide selon l'état actuel -->
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
                    <!-- Lien texte vers la fiche produit -->
                    <a href="page_produit.html?id=${product.id}" class="btn-view-product">
                        Voir le produit
                    </a>
                </div>
            </article>`;
        }).join(''); // Joint tous les HTML sans séparateur

        // ── Événements boutons panier ──────────────────────────────
        // Attache les clics panier après le re-rendu (les anciens événements sont perdus)
        grid.querySelectorAll('.btn-add-cart').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();  // Empêche tout comportement par défaut
                e.stopPropagation(); // Empêche la propagation vers le lien parent
                addToCart(parseInt(this.dataset.id), this); // Ajoute au panier avec feedback
            });
        });

        // Note : les favoris sont gérés par délégation globale dans favoris.js
        // (pas besoin d'attacher les événements ici)

        console.log('Grille produits générée :', productsToRender.length, 'produits');
    }

    // ── Ajout au panier depuis la grille ──────────────────────────

    function addToCart(productId, btn) {
        // Cherche le produit dans la base de données
        const products = window.PearTechDB ? window.PearTechDB.products : (window.products || []);
        const product  = products.find(p => p.id === productId); // Trouve par ID
        if (!product) return; // Produit introuvable

        const CART_KEY = 'peartech-cart';
        const cart     = JSON.parse(localStorage.getItem(CART_KEY)) || []; // Charge le panier existant
        const existing = cart.find(i => i.id === productId); // Vérifie si déjà présent

        if (existing) {
            existing.quantity++; // Incrémente si déjà dans le panier
        } else {
            cart.push({ // Ajoute le produit comme nouvel article
                id:       product.id,
                name:     product.name,
                image:    product.images[0] || '',
                price:    product.basePrice,
                specs:    [product.specs.processor, product.specs.ram, product.specs.storage]
                              .filter(Boolean).join(' - '), // Spécifications en une ligne
                quantity: 1
            });
        }

        localStorage.setItem(CART_KEY, JSON.stringify(cart)); // Sauvegarde le panier mis à jour
        const total = cart.reduce((acc, i) => acc + i.quantity, 0); // Total d'articles
        localStorage.setItem('peartech-cart-count', total); // Sauvegarde le compteur pour le badge

        // Met à jour le badge du header
        const badge = document.getElementById('cart-count');
        if (badge) {
            badge.textContent = total;
            badge.style.display = 'flex'; // S'assure que le badge est visible
            badge.setAttribute('aria-label', total + ' article' + (total > 1 ? 's' : '') + ' dans le panier');
        }

        // ── Feedback visuel : remplace l'icône panier par une coche ──
        const orig = btn.innerHTML;
        btn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';
        btn.disabled  = true; // Désactive pour éviter les doubles clics
        setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; }, 1600); // Restaure après 1.6s
    }

    // ── Initialisation avec attente de PearTechDB ─────────────────

    function init(attempts) {
        attempts = attempts || 0; // Compteur de tentatives pour le fallback
        if (window.PearTechDB) {
            const db = window.PearTechDB;
            // Sélectionne en priorité : bestsellers + nouveautés (non bestsellers)
            const featured = [
                ...db.products.filter(p => p.isBestSeller),          // Tous les bestsellers
                ...db.products.filter(p => p.isNew && !p.isBestSeller) // Nouveautés non bestsellers
            ].slice(0, 8); // Maximum 8 produits sur l'accueil
            // Si pas assez de featured, prend les 8 premiers produits
            renderProducts(featured.length ? featured : db.products.slice(0, 8));
        } else if (attempts < 50) {
            setTimeout(() => init(attempts + 1), 100); // Réessaie dans 100ms (max 5 secondes)
        } else {
            // Abandon après 50 tentatives : affiche un message d'erreur
            const grid = document.getElementById('products-grid');
            if (grid) grid.innerHTML = '<p>Impossible de charger les produits. Rechargez la page.</p>';
        }
    }

    document.addEventListener('DOMContentLoaded', init); // Lance l'init au chargement du DOM

    // Expose renderProducts publiquement pour que main.js puisse l'appeler avec un sous-ensemble
    window.renderProductGrid = renderProducts;

})(); // Fin de l'IIFE