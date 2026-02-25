// ============================================
// cart.js - Page panier
// Gère l'affichage des articles, les quantités,
// les codes promo, les totaux et la redirection
// vers la page de paiement
// ============================================

(function() {
    'use strict';

    const CART_STORAGE_KEY = 'peartech-cart';

    // Charge le panier depuis localStorage et normalise le champ image
    let cartItems = (JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || []).map(item => {
        if (!item.image) {
            if (Array.isArray(item.images) && item.images.length > 0) {
                item.image = item.images[0];
            } else if (typeof item.images === 'string') {
                item.image = item.images;
            }
        }
        return item;
    });

    const validPromoCodes = {
        'PEARTECH10':  { discount: 0.10, label: '-10%' },
        'PEARTECH20':  { discount: 0.20, label: '-20%' },
        'BIENVENUE':   { discount: 0.05, label: '-5% bienvenue' },
        'SUMMER25':    { discount: 0.25, label: '-25% offre été' },
        'FIDELITE15':  { discount: 0.15, label: '-15% fidélité' },
        'BACK2SCHOOL': { discount: 0.12, label: '-12% rentrée' },
    };

    let currentPromo = null;

    const cartContainer    = document.querySelector('.cart-items');
    const subtotalSpan     = document.getElementById('subtotal');
    const shippingSpan     = document.getElementById('shipping');
    const discountSpan     = document.getElementById('discount');
    const totalSpan        = document.getElementById('total');
    const promoInput       = document.getElementById('promo-input');
    const applyPromoBtn    = document.getElementById('apply-promo');
    const promoMessage     = document.getElementById('promo-message');
    const checkoutBtn      = document.getElementById('checkout-btn');
    const recommendationsGrid = document.getElementById('recommendations-grid');

    const PLACEHOLDER_IMAGE = '/asset/image/no-image.png';

    // ── Sauvegarde du panier via l'API centralisée ──
    function saveCart() {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
        // Mettre à jour le badge via PearTechCart si disponible
        if (window.PearTechCart) {
            // On suppose que PearTechCart a une méthode updateCart pour remplacer le panier
            window.PearTechCart.updateCart(cartItems);
        } else {
            // Fallback
            const total = cartItems.reduce((acc, item) => acc + item.quantity, 0);
            localStorage.setItem('peartech-cart-count', total);
            const badge = document.getElementById('cart-count');
            if (badge) {
                badge.textContent = total;
                badge.style.display = total === 0 ? 'none' : 'flex';
            }
        }
    }

    function calculateTotals() {
        const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const shipping = 5.90;
        let discount = 0;
        if (currentPromo) {
            discount = subtotal * currentPromo.discount;
        }
        const total = subtotal + shipping - discount;

        subtotalSpan.textContent = formatPrice(subtotal);
        shippingSpan.textContent = formatPrice(shipping);
        discountSpan.textContent = `-${formatPrice(discount)}`;
        totalSpan.textContent    = formatPrice(total);
    }

    function formatPrice(price) {
        return price.toFixed(2).replace('.', ',') + ' €';
    }

    function handleImageError(img) {
        img.onerror = null;
        img.src = PLACEHOLDER_IMAGE;
        console.warn('Image non trouvée, utilisation du placeholder', img.dataset.originalSrc || img.src);
    }

    function renderCart() {
        if (cartItems.length === 0) {
            cartContainer.innerHTML = '<p class="empty-cart">Votre panier est vide.</p>';
            return;
        }

        let html = '';
        cartItems.forEach((item, index) => {
            const optionsHtml = item.options && item.options.length ?
                `<div class="item-options">${item.options.map(opt => `${opt.name}: ${opt.value}`).join(', ')}</div>` : '';

            html += `
                <div class="cart-item" data-index="${index}">
                    <div class="item-image">
                        <img src="${item.image || PLACEHOLDER_IMAGE}" alt="${item.name}"
                             data-original-src="${item.image}"
                             onerror="this.onerror=null;this.src='${PLACEHOLDER_IMAGE}';">
                    </div>
                    <div class="item-details">
                        <a href="page_produit.html?id=${item.id}" class="item-name">${item.name}</a>
                        <div class="item-specs">${item.specs || ''}</div>
                        ${optionsHtml}
                        <div class="item-stock">
                            <span class="material-symbols-outlined">check_circle</span>
                            En stock - Livraison estimée sous 3 jours
                        </div>
                        <div class="item-links">
                            <a href="#" class="save-for-later">Enregistrer pour plus tard</a>
                            <a href="#" class="remove-item">Supprimer</a>
                        </div>
                    </div>
                    <div class="item-actions">
                        <div class="quantity-control">
                            <button class="quantity-btn minus" data-index="${index}">-</button>
                            <input type="text" class="quantity-input" value="${item.quantity}" readonly>
                            <button class="quantity-btn plus" data-index="${index}">+</button>
                        </div>
                    </div>
                    <div class="item-price">
                        <div class="unit-price">${formatPrice(item.price)} / unité</div>
                        <div class="total-price">${formatPrice(item.price * item.quantity)}</div>
                    </div>
                </div>
            `;
        });
        cartContainer.innerHTML = html;

        // Réattachement des événements
        document.querySelectorAll('.plus').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = this.dataset.index;
                cartItems[index].quantity++;
                renderCart();
                calculateTotals();
                saveCart();
            });
        });

        document.querySelectorAll('.minus').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = this.dataset.index;
                if (cartItems[index].quantity > 1) {
                    cartItems[index].quantity--;
                } else {
                    if (confirm('Supprimer cet article du panier ?')) {
                        cartItems.splice(index, 1);
                    } else {
                        return;
                    }
                }
                renderCart();
                calculateTotals();
                saveCart();
            });
        });

        document.querySelectorAll('.remove-item').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const index = this.closest('.cart-item').dataset.index;
                if (confirm('Supprimer cet article du panier ?')) {
                    cartItems.splice(index, 1);
                    renderCart();
                    calculateTotals();
                    saveCart();
                }
            });
        });

        document.querySelectorAll('.save-for-later').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                alert('Fonctionnalité "Enregistrer pour plus tard" simulée.');
            });
        });
    }

    applyPromoBtn.addEventListener('click', function() {
        const code = promoInput.value.trim().toUpperCase();
        if (!code) {
            promoMessage.textContent = 'Veuillez entrer un code.';
            promoMessage.className = 'promo-message error';
            return;
        }
        if (validPromoCodes[code]) {
            const promo = validPromoCodes[code];
            currentPromo = { code, discount: promo.discount };
            promoMessage.textContent = `Code "${code}" appliqué : ${promo.label} !`;
            promoMessage.className = 'promo-message success';
        } else {
            currentPromo = null;
            promoMessage.textContent = 'Code invalide ou expiré.';
            promoMessage.className = 'promo-message error';
        }
        calculateTotals();
    });

    checkoutBtn.addEventListener('click', function() {
        if (cartItems.length === 0) {
            alert('Votre panier est vide.');
            return;
        }
        if (currentPromo) {
            try {
                sessionStorage.setItem('peartech-promo', JSON.stringify(currentPromo));
            } catch(e) {
                console.warn('sessionStorage indisponible, la promo ne sera pas transmise :', e);
            }
        } else {
            try { sessionStorage.removeItem('peartech-promo'); } catch(e) {}
        }
        window.location.href = 'page_paiement.html';
    });

    function loadRecommendations() {
        if (!window.PearTechDB) return;
        const allProducts = PearTechDB.products;
        const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
        const recommendations = shuffled.slice(0, 4);

        let html = '';
        recommendations.forEach(prod => {
            html += `
                <div class="recommendation-card">
                    <img src="${prod.images[0]}" alt="${prod.name}"
                         onerror="this.onerror=null; this.src='${PLACEHOLDER_IMAGE}';">
                    <h3>${prod.name}</h3>
                    <p>${formatPrice(prod.basePrice || prod.price)}</p>
                    <a href="page_produit.html?id=${prod.id}" class="btn-view-product">Voir</a>
                </div>
            `;
        });
        recommendationsGrid.innerHTML = html;
    }

    renderCart();
    calculateTotals();
    saveCart();

    if (window.PearTechDB) {
        loadRecommendations();
    } else {
        setTimeout(loadRecommendations, 500);
    }

    window.handleImageError = handleImageError;
})();