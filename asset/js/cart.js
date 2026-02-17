// ============================================
// cart.js - Gestion de la page panier
// ============================================

(function() {
    'use strict';

    // Données simulées du panier
    let cartItems = [
        {
            id: 1,
            name: 'iPhone 15 Pro',
            image: 'https://images.unsplash.com/photo-1695048132924-405b5b5c2448?w=400',
            specs: 'A17 Pro, 8 Go RAM, 256 Go',
            price: 1229.00,
            quantity: 1,
            stock: 10
        },
        {
            id: 2,
            name: 'Apple Watch Series 9',
            image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400',
            specs: '45 mm, GPS + Cellular',
            price: 449.00,
            quantity: 1,
            stock: 5
        },
        {
            id: 3,
            name: 'iPad Air 11"',
            image: 'https://images.unsplash.com/photo-1544244011-9bbdf3b3b69f?w=400',
            specs: 'M1, 256 Go, Wi-Fi',
            price: 699.00,
            quantity: 1,
            stock: 3
        }
    ];

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

    // Fonction pour synchroniser le badge panier global
    function syncCartCount() {
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
            html += `
                <div class="cart-item" data-index="${index}">
                    <div class="item-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="item-details">
                        <a href="page_produit.html?id=${item.id}" class="item-name">${item.name}</a>
                        <div class="item-specs">${item.specs}</div>
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

        document.querySelectorAll('.plus').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = this.dataset.index;
                cartItems[index].quantity++;
                renderCart();
                calculateTotals();
                syncCartCount();
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
                    }
                }
                renderCart();
                calculateTotals();
                syncCartCount();
            });
        });

        document.querySelectorAll('.remove-item').forEach((link, idx) => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const index = this.closest('.cart-item').dataset.index;
                if (confirm('Supprimer cet article du panier ?')) {
                    cartItems.splice(index, 1);
                    renderCart();
                    calculateTotals();
                    syncCartCount();
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

    function init() {
        renderCart();
        calculateTotals();
        syncCartCount(); // Initialiser le badge
        if (window.NovaComputeDB) {
            loadRecommendations();
        } else {
            setTimeout(loadRecommendations, 500);
        }
    }

    init();
})();