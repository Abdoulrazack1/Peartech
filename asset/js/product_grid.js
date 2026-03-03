// ============================================
// product_grid.js - Grille de produits page d'accueil
// Génère dynamiquement les cards produit depuis PearTechDB
// Affiche les bestsellers et nouveautés en priorité
// ============================================

// IIFE pour isoler le code et éviter les conflits
(function () {
    'use strict'; // Mode strict : meilleure sécurité et détection d'erreurs

    // Image de remplacement utilisée si aucune image n'est disponible
    const PLACEHOLDER = '/asset/image/no-image.png';

    // Images de secours (fallback) par catégorie, provenant d'Unsplash
    // Utilisées si les images locales sont manquantes
    const FALLBACKS = {
        'cat_apple':    'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=400&q=80',
        'cat_android':  'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80',
        'cat_wearables':'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
        'cat_tablets':  'https://images.unsplash.com/photo-1587033411391-5d9e51cce126?w=400&q=80',
    };

    // ── Génération du HTML des cards ──────────────────────────────

    /**
     * Génère et affiche les cards des produits fournis
     * @param {Array} productsToRender - Liste des produits à afficher
     */
    function renderProducts(productsToRender) {
        // Récupère le conteneur de la grille de produits
        const grid = document.getElementById('products-grid');
        if (!grid) return; // Si le conteneur n'existe pas, on arrête

        // Si aucun produit à afficher, on affiche un message
        if (!productsToRender || !productsToRender.length) {
            grid.innerHTML = '<p class="no-results">Aucun produit à afficher.</p>';
            return;
        }

        // Pour chaque produit, on génère une card HTML
        grid.innerHTML = productsToRender.map(product => {

            // Prix actuel du produit
            const price    = product.basePrice;
            // Ancien prix (si présent et supérieur au prix actuel)
            const oldPrice = (product.oldPrice && product.oldPrice > price) ? product.oldPrice : null;
            // Calcul de la réduction en pourcentage (arrondi)
            const discount = oldPrice ? Math.round((1 - price / oldPrice) * 100) : 0;

            // Détermine le badge à afficher sur l'image (priorité : Nouveau > Promo > Meilleure vente)
            const badge = product.isNew
                ? '<span class="product-badge badge-new">Nouveau</span>'
                : discount > 0
                    ? `<span class="product-badge badge-promo">-${discount}%</span>`
                    : product.isBestSeller
                        ? '<span class="product-badge badge-bestseller">Meilleure vente</span>'
                        : '';

            // Alerte stock : rouge si ≤ 3, orange si ≤ 10, sinon rien
            const stockHtml = product.stock <= 3
                ? `<span class="stock-alert">Plus que ${product.stock} en stock !</span>`
                : product.stock <= 10
                    ? '<span class="stock-low">Stock limité</span>'
                    : '';

            // Résumé des spécifications : processeur · RAM · stockage
            // Si l'un manque, on prend les deux premières spécifications disponibles
            const specsText = [product.specs.processor, product.specs.ram, product.specs.storage]
                .filter(Boolean).join(' · ') // Retire les null/undefined et joint avec " · "
                || Object.values(product.specs).slice(0, 2).join(' · ') // Fallback : deux premières specs
                || '';

            // Formatage du prix en français (ex: 1299.99 → "1 299,99 €")
            const priceFmt    = price.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €';
            // Affichage de l'ancien prix barré (s'il existe)
            const oldPriceFmt = oldPrice
                ? `<span class="product-old-price">${oldPrice.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>`
                : '';

            // Gestion des étoiles de notation
            const rating     = product.rating || 0; // Note du produit ou 0 par défaut
            const fullStars  = Math.floor(rating);               // Nombre d'étoiles pleines (ex: 4)
            const hasHalf    = (rating % 1) >= 0.5;             // Demi-étoile si partie décimale ≥ 0.5
            const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0); // Étoiles vides restantes
            const stars      = '★'.repeat(fullStars)            // Étoiles pleines
                             + (hasHalf ? '½' : '')            // Demi-étoile (½)
                             + '<span style="opacity:0.25">' + '★'.repeat(emptyStars) + '</span>'; // Étoiles vides grisées

            // Vérifie si le produit est déjà dans les favoris (pour afficher le cœur plein)
            const isFav = (typeof window.Favoris !== 'undefined') && window.Favoris.isFavori(product.id);

            // Récupère le slug de la catégorie (pour le data-category dans l'article)
            const categorySlug = (window.PearTechDB && window.PearTechDB.getCategorySlugFromId)
                ? window.PearTechDB.getCategorySlugFromId(product.categoryId) // Via méthode dédiée si disponible
                : (product.categoryId || '').replace('cat_', ''); // Sinon, on extrait le slug depuis l'ID

            // Construction de la card produit
            return `
            <article class="product-card" aria-label="${product.name}"
                     data-product-id="${product.id}"
                     data-category="${categorySlug}">

                <!-- Lien vers la fiche produit via l'image -->
                <a href="page_produit.html?id=${product.id}" class="product-image"
                   aria-label="Voir la fiche de ${product.name}">
                    <!-- Image : si l'URL échoue, on utilise le fallback (Unsplash ou placeholder) -->
                    <img src="${product.images[0] || FALLBACKS[product.categoryId] || PLACEHOLDER}"
                         alt="${product.name}" loading="lazy"
                         data-fallback="${FALLBACKS[product.categoryId] || PLACEHOLDER}"
                         onerror="this.onerror=null;this.src=this.dataset.fallback||'${PLACEHOLDER}';">
                    ${badge}${stockHtml} <!-- Badges et alerte stock -->
                </a>

                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    ${specsText ? `<p class="product-specs">${specsText}</p>` : ''}
                    <!-- Note et avis, avec aria-label pour accessibilité -->
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
                            <!-- Bouton ajout panier (icône Material Symbols) -->
                            <button class="btn-add-cart" data-id="${product.id}"
                                    aria-label="Ajouter ${product.name} au panier">
                                <span class="material-symbols-outlined" aria-hidden="true">shopping_cart</span>
                            </button>
                            <!-- Bouton favori (cœur SVG, plein ou vide selon isFav) -->
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
                    <!-- Lien textuel vers la fiche produit (accessible sans JS) -->
                    <a href="page_produit.html?id=${product.id}" class="btn-view-product">
                        Voir le produit
                    </a>
                </div>
            </article>`;
        }).join(''); // Concatène toutes les cards sans séparateur

        // ── Événements boutons panier ──────────────────────────────
        // Utilise window.PearTechCart (panier.js) comme source unique de vérité
        // au lieu de dupliquer la logique d'écriture dans localStorage

        grid.querySelectorAll('.btn-add-cart').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();      // Empêche tout comportement par défaut
                e.stopPropagation();     // Empêche la propagation au parent (évite d'activer le lien)
                addToCartFromGrid(parseInt(this.dataset.id), this); // Appelle la fonction d'ajout
            });
        });

        console.log('Grille produits générée :', productsToRender.length, 'produits');
    }

    // ── Ajout au panier via l'API centralisée de panier.js ────────
    // CORRECTION : suppression de la logique localStorage dupliquée.
    // On passe désormais par window.PearTechCart.add() qui est
    // la seule source de vérité pour la persistance du panier.

    /**
     * Ajoute un produit au panier en utilisant l'API centralisée (PearTechCart)
     * @param {number} productId - ID du produit
     * @param {HTMLElement} btn - Bouton cliqué (pour feedback visuel)
     */
    function addToCartFromGrid(productId, btn) {
        // Récupère la liste des produits (soit depuis PearTechDB, soit depuis une variable globale de secours)
        const products = window.PearTechDB ? window.PearTechDB.products : (window.products || []);
        const product  = products.find(p => p.id === productId);
        if (!product) {
            console.warn('Produit introuvable dans PearTechDB, id:', productId);
            return;
        }

        // Construit l'objet produit au format attendu par panier.js
        const cartItem = {
            id:            product.id,
            name:          product.name,
            image:         product.images[0] || '',
            basePrice:     product.basePrice,
            price:         product.basePrice,
            // oldPrice conservé pour afficher la réduction dans le récap paiement
            oldPrice:      (product.oldPrice && product.oldPrice > product.basePrice)
                               ? product.oldPrice
                               : null,
            specs:         [product.specs.processor, product.specs.ram, product.specs.storage]
                               .filter(Boolean).join(' - '),
            options:       [],
            optionSummary: '',
            quantity:      1
        };

        if (window.PearTechCart) {
            // Chemin normal : panier.js est chargé, on délègue complètement
            window.PearTechCart.add(cartItem);
        } else {
            // Fallback de sécurité si panier.js n'est pas encore chargé
            // (ordre de chargement des scripts incorrect)
            console.warn('window.PearTechCart indisponible, fallback localStorage direct');
            try {
                const CART_KEY = 'peartech-cart';
                const cart     = JSON.parse(localStorage.getItem(CART_KEY)) || [];
                const existing = cart.find(i => i.id === productId);
                if (existing) {
                    existing.quantity++;
                } else {
                    cart.push(cartItem);
                }
                localStorage.setItem(CART_KEY, JSON.stringify(cart));
                const total = cart.reduce((acc, i) => acc + i.quantity, 0);
                localStorage.setItem('peartech-cart-count', total);
                const badge = document.getElementById('cart-count');
                if (badge) {
                    badge.textContent   = total;
                    badge.style.display = 'flex';
                }
            } catch (e) {
                console.error('Impossible d\'ajouter au panier (localStorage indisponible) :', e);
            }
        }

        // ── Feedback visuel : icône panier → coche ────────────────

        const orig    = btn.innerHTML; // Sauvegarde le contenu original (icône panier)
        // Remplace par une coche (SVG)
        btn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';
        btn.disabled  = true; // Désactive le bouton pendant le feedback
        setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; }, 1600); // Restaure après 1.6s
    }

    // ── Initialisation avec attente de PearTechDB ─────────────────
    // Réessaie toutes les 100ms pendant 5s maximum avant d'abandonner

    /**
     * Initialise la grille : attend que PearTechDB soit disponible,
     * puis sélectionne les produits à afficher (bestsellers + nouveautés)
     * @param {number} attempts - Nombre de tentatives déjà effectuées
     */
    function init(attempts) {
        attempts = attempts || 0;
        if (window.PearTechDB) {
            const db       = window.PearTechDB;
            // Récupère d'abord les bestsellers, puis les nouveautés (sans doublon), limite à 8
            const featured = [
                ...db.products.filter(p => p.isBestSeller),
                ...db.products.filter(p => p.isNew && !p.isBestSeller)
            ].slice(0, 8);
            // S'il y a des produits mis en avant, on les affiche, sinon on prend les 8 premiers
            renderProducts(featured.length ? featured : db.products.slice(0, 8));
        } else if (attempts < 50) { // 50 * 100ms = 5s
            setTimeout(() => init(attempts + 1), 100); // Réessaie après 100ms
        } else {
            // Délai dépassé : data.js ne s'est jamais chargé
            const grid = document.getElementById('products-grid');
            if (grid) {
                grid.innerHTML = `
                    <p class="no-results">
                        Impossible de charger les produits.
                        <button onclick="location.reload()" style="margin-left:.5rem;text-decoration:underline;background:none;border:none;cursor:pointer;color:inherit;">
                            Réessayer
                        </button>
                    </p>`;
            }
            console.error('PearTechDB non chargé après 5s : vérifier le chargement de data.js');
        }
    }

    // Lance l'initialisation une fois le DOM chargé
    document.addEventListener('DOMContentLoaded', init);

    // Expose la fonction renderProducts dans le scope global
    // pour permettre un éventuel re-rendu manuel (utile pour le débogage)
    window.renderProductGrid = renderProducts;

})();