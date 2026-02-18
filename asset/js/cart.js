// ============================================
// cart.js - Page panier avec options et persistance
// ============================================

(function() {
    'use strict';

    const CART_STORAGE_KEY = 'nova-cart';
    let cartItems = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];

    const validPromoCodes = {
        'PROMO10': 0.10,
        'PROMO20': 0.20,
        'BIENVENUE': 0.05
    };

    let currentPromo = null;

    const cartContainer = document.querySelector('.cart-items');
    const subtotalSpan = document.getElementById('subtotal');
    const shippingSpan = document.getElementById('shipping');
    const discountSpan = document.getElementById('discount');
    const totalSpan = document.getElementById('total');
    const promoInput = document.getElementById('promo-input');
    const applyPromoBtn = document.getElementById('apply-promo');
    const promoMessage = document.getElementById('promo-message');
    const checkoutBtn = document.getElementById('checkout-btn');
    const recommendationsGrid = document.getElementById('recommendations-grid');

    // Sauvegarder et mettre à jour le badge
    function saveCart() {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
        const total = cartItems.reduce((acc, item) => acc + item.quantity, 0);
        localStorage.setItem('nova-cart-count', total);
        const badge = document.getElementById('cart-count');
        if (badge) {
            badge.textContent = total;
            badge.style.display = total === 0 ? 'none' : 'flex';
        }
    }

    function calculateTotals() {
        const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const shipping = 5.90;
        let discount = 0;
        if (currentPromo) {
            discount = subtotal * currentPromo.reduction;
        }
        const total = subtotal + shipping - discount;

        subtotalSpan.textContent = formatPrice(subtotal);
        shippingSpan.textContent = formatPrice(shipping);
        discountSpan.textContent = `-${formatPrice(discount)}`;
        totalSpan.textContent = formatPrice(total);
    }

    function formatPrice(price) {
        return price.toFixed(2).replace('.', ',') + ' €';
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
                        <img src="${item.image}" alt="${item.name}">
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

        // Événements
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
            currentPromo = { code, reduction: validPromoCodes[code] };
            promoMessage.textContent = 'Code appliqué avec succès !';
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
        window.location.href = 'page_paiement.html';
    });

    function loadRecommendations() {
        if (!window.NovaComputeDB) return;
        const allProducts = NovaComputeDB.products;
        const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
        const recommendations = shuffled.slice(0, 4);

        let html = '';
        recommendations.forEach(prod => {
            html += `
                <div class="recommendation-card">
                    <img src="${prod.images[0]}" alt="${prod.name}">
                    <h3>${prod.name}</h3>
                    <p>${formatPrice(prod.basePrice || prod.price)}</p>
                    <a href="page_produit.html?id=${prod.id}" class="btn-view-product">Voir</a>
                </div>
            `;
        });
        recommendationsGrid.innerHTML = html;
    }

    // Initialisation
    renderCart();
    calculateTotals();
    saveCart(); // synchronise le badge
    if (window.NovaComputeDB) {
        loadRecommendations();
    } else {
        setTimeout(loadRecommendations, 500);
    }
})();