// ============================================
// panier.js - Gestion globale du panier
// S'occupe du stockage localStorage, du badge
// du header, et de l'ajout au panier depuis
// n'importe quelle page (accueil, catalogue, produit)
// ============================================

(function() {
    'use strict';

    const CART_STORAGE_KEY = 'peartech-cart';

    // ── Accès localStorage sécurisé ───────────────────────────────
    // localStorage peut être indisponible (mode privé, quota dépassé, cookies bloqués)
    // Ces deux fonctions encapsulent tous les accès pour éviter les crashs silencieux

    function storageGet(key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.warn('localStorage.getItem échoué :', e);
            return null;
        }
    }

    function storageSet(key, value) {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (e) {
            // QuotaExceededError : stockage plein (fréquent en navigation privée)
            console.warn('localStorage.setItem échoué (quota ou mode privé ?) :', e);
            return false;
        }
    }

    // ── Chargement initial du panier ──────────────────────────────

    let cart = [];
    try {
        cart = JSON.parse(storageGet(CART_STORAGE_KEY)) || [];
    } catch (e) {
        // JSON invalide dans le localStorage (données corrompues)
        console.warn('Panier corrompu dans localStorage, réinitialisation :', e);
        cart = [];
    }

    // ── Mise à jour du badge du header ────────────────────────────

    function updateCartBadge() {
        const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
        storageSet('peartech-cart-count', totalItems);
        const badge = document.getElementById('cart-count');
        if (badge) {
            badge.textContent = totalItems;
            badge.style.display = totalItems === 0 ? 'none' : 'flex';
        }
    }

    // ── Sauvegarde du panier ──────────────────────────────────────

    function saveCart() {
        const ok = storageSet(CART_STORAGE_KEY, JSON.stringify(cart));
        if (!ok) {
            // Sauvegarde échouée : on prévient l'utilisateur discrètement
            // sans crasher l'application (le panier reste fonctionnel en mémoire)
            showNotification('Impossible de sauvegarder le panier (stockage indisponible).', 'error');
        }
        updateCartBadge();
    }

    // ── Ajout d'un produit au panier ──────────────────────────────

    function addToCart(product) {
        const existing = cart.find(item =>
            item.id === product.id &&
            JSON.stringify(item.options) === JSON.stringify(product.options)
        );

        if (existing) {
            existing.quantity += product.quantity || 1;
        } else {
            cart.push({
                id:            product.id,
                name:          product.name,
                basePrice:     product.basePrice,
                price:         product.price,
                image:         product.image,
                specs:         product.specs || '',
                options:       product.options || [],
                optionSummary: product.optionSummary || '',
                quantity:      product.quantity || 1
            });
        }
        saveCart();
    }

    // ── API publique du panier ────────────────────────────────────

    window.PearTechCart = {
        add:     addToCart,
        getCart: () => cart,
        clear:   () => { cart = []; saveCart(); }
    };

    updateCartBadge();

    // ============================================
    // DÉLÉGATION D'ÉVÉNEMENTS - Clic sur "Ajouter au panier"
    // ============================================

    document.addEventListener('click', function(e) {
        const addButton = e.target.closest('.btn-add-cart');
        if (!addButton) return;

        e.stopPropagation();

        let product = null;
        const productCard = addButton.closest('.product-card');

        if (productCard) {
            // ── Cas 1 : Bouton dans une card ──────────────────────

            const productId = productCard.dataset.productId;
            if (!productId) {
                console.warn('Attribut data-product-id manquant sur .product-card');
                return;
            }
            const nameEl     = productCard.querySelector('.product-name');
            const priceEl    = productCard.querySelector('.product-price');
            const oldPriceEl = productCard.querySelector('.product-old-price');
            const imgEl      = productCard.querySelector('.product-image img');
            const specsEl    = productCard.querySelector('.product-specs');

            const parsedPrice    = priceEl    ? parseFloat(priceEl.textContent.replace(/[^\d,]/g, '').replace(',', '.'))    : 0;
            const parsedOldPrice = oldPriceEl ? parseFloat(oldPriceEl.textContent.replace(/[^\d,]/g, '').replace(',', '.')) : null;

            product = {
                id:            parseInt(productId),
                name:          nameEl  ? nameEl.textContent  : 'Produit',
                basePrice:     parsedPrice,
                price:         parsedPrice,
                // oldPrice lu depuis le DOM de la card (.product-old-price) pour conserver la réduction
                oldPrice:      (parsedOldPrice && parsedOldPrice > parsedPrice) ? parsedOldPrice : null,
                image:         imgEl   ? imgEl.src : '',
                specs:         specsEl ? specsEl.textContent : '',
                options:       [],
                optionSummary: ''
            };
        } else {
            // ── Cas 2 : Bouton sur la fiche produit ───────────────

            const productId = addButton.dataset.productId;
            if (!productId) {
                console.warn('Attribut data-product-id manquant sur le bouton');
                return;
            }
            const name         = document.querySelector('.product-title')?.textContent;
            const priceElement = document.querySelector('.current-price');
            const oldPriceEl   = document.querySelector('.old-price');
            const basePrice    = priceElement
                ? parseFloat(priceElement.textContent.replace(/[^\d,]/g, '').replace(',', '.'))
                : 0;
            // oldPrice lu depuis .old-price sur la fiche produit pour conserver la réduction
            const oldPrice = oldPriceEl
                ? parseFloat(oldPriceEl.textContent.replace(/[^\d,]/g, '').replace(',', '.'))
                : null;
            const image = document.querySelector('.main-image img')?.src;

            const options = [];
            let totalPrice = basePrice;
            const optionGroups = document.querySelectorAll('.option-group');

            optionGroups.forEach(group => {
                const activeBtn = group.querySelector('.option-btn.active');
                if (activeBtn) {
                    const optionName  = group.querySelector('.option-label')?.textContent.replace(':', '') || 'Option';
                    const optionValue = activeBtn.dataset.value || activeBtn.textContent;
                    const optionPrice = parseFloat(activeBtn.dataset.price) || 0;
                    options.push({ name: optionName, value: optionValue, price: optionPrice });
                    totalPrice += optionPrice;
                }
            });

            product = {
                id:            parseInt(productId),
                name:          name || 'Produit',
                basePrice:     basePrice,
                price:         totalPrice,
                // oldPrice conservé pour l'affichage de la réduction dans paiement.js
                oldPrice:      (oldPrice && oldPrice > basePrice) ? oldPrice : null,
                image:         image || '',
                specs:         '',
                options:       options,
                optionSummary: options.map(opt => opt.value).join(' - ')
            };
        }

        if (!product) return;

        const originalText = addButton.textContent;
        addButton.textContent = '✓ Ajouté';
        addButton.style.background = '#10b981';
        setTimeout(() => {
            addButton.textContent  = originalText;
            addButton.style.background = '';
        }, 2000);

        addToCart(product);
        showNotification('Produit ajouté au panier');
    });

    // ── Toast de notification ──────────────────────────────────────

    function showNotification(message, type = 'success') {
        const existing = document.querySelector('.notification-toast');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = 'notification-toast';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3B82F6'};
            color: white; padding: 1rem 1.5rem; border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 9999;
            animation: slideInNotif 0.3s ease; font-weight: 500;
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.animation = 'slideOutNotif 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // ── Animations CSS du toast ────────────────────────────────────

    if (!document.getElementById('notif-style')) {
        const style = document.createElement('style');
        style.id = 'notif-style';
        style.textContent = `
            @keyframes slideInNotif {
                from { transform: translateX(400px); opacity: 0; }
                to   { transform: translateX(0);     opacity: 1; }
            }
            @keyframes slideOutNotif {
                from { transform: translateX(0);     opacity: 1; }
                to   { transform: translateX(400px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
})();