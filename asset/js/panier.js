// ============================================
// panier.js - Gestion complète du panier avec options
// ============================================
(function() {
    'use strict';

    const CART_STORAGE_KEY = 'nova-cart';

    // Charger le panier depuis localStorage
    let cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];

    // Mettre à jour le badge
    function updateCartBadge() {
        const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
        localStorage.setItem('nova-cart-count', totalItems);
        const badge = document.getElementById('cart-count');
        if (badge) {
            badge.textContent = totalItems;
            badge.style.display = totalItems === 0 ? 'none' : 'flex';
        }
    }

    // Sauvegarder le panier
    function saveCart() {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        updateCartBadge();
    }

    // Ajouter un produit avec options
    function addToCart(product) {
        // Vérifier si un produit identique (même ID et mêmes options) existe déjà
        const existing = cart.find(item => 
            item.id === product.id && 
            JSON.stringify(item.options) === JSON.stringify(product.options)
        );
        if (existing) {
            existing.quantity += product.quantity || 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                basePrice: product.basePrice,
                price: product.price, // prix unitaire avec options
                image: product.image,
                specs: product.specs || '',
                options: product.options || [],
                optionSummary: product.optionSummary || '',
                quantity: product.quantity || 1
            });
        }
        saveCart();
    }

    // Exposer l'API pour d'autres scripts
    window.NovaCart = {
        add: addToCart,
        getCart: () => cart,
        clear: () => { cart = []; saveCart(); }
    };

    // Initialiser le badge
    updateCartBadge();

    // Délégation pour les clics sur .btn-add-cart
    document.addEventListener('click', function(e) {
        const addButton = e.target.closest('.btn-add-cart');
        if (!addButton) return;

        e.stopPropagation();

        let product = null;
        const productCard = addButton.closest('.product-card');

        if (productCard) {
            // Page d'accueil / catalogue
            const productId = productCard.dataset.productId;
            if (!productId) {
                console.warn('Attribut data-product-id manquant sur .product-card');
                return;
            }
            const nameEl = productCard.querySelector('.product-name');
            const priceEl = productCard.querySelector('.product-price');
            const imgEl = productCard.querySelector('.product-image img');
            const specsEl = productCard.querySelector('.product-specs');

            product = {
                id: parseInt(productId),
                name: nameEl ? nameEl.textContent : 'Produit',
                basePrice: priceEl ? parseFloat(priceEl.textContent.replace(/[^\d,]/g, '').replace(',', '.')) : 0,
                price: priceEl ? parseFloat(priceEl.textContent.replace(/[^\d,]/g, '').replace(',', '.')) : 0,
                image: imgEl ? imgEl.src : '',
                specs: specsEl ? specsEl.textContent : '',
                options: [],
                optionSummary: ''
            };
        } else {
            // Page produit
            const productId = addButton.dataset.productId;
            if (!productId) {
                console.warn('Attribut data-product-id manquant sur le bouton');
                return;
            }
            const name = document.querySelector('.product-title')?.textContent;
            const priceElement = document.querySelector('.current-price');
            const basePrice = priceElement ? parseFloat(priceElement.textContent.replace(/[^\d,]/g, '').replace(',', '.')) : 0;
            const image = document.querySelector('.main-image img')?.src;
            
            // Récupérer les options sélectionnées
            const options = [];
            let totalPrice = basePrice;
            const optionGroups = document.querySelectorAll('.option-group');
            optionGroups.forEach(group => {
                const activeBtn = group.querySelector('.option-btn.active');
                if (activeBtn) {
                    const optionName = group.querySelector('.option-label')?.textContent.replace(':', '') || 'Option';
                    const optionValue = activeBtn.dataset.value || activeBtn.textContent;
                    const optionPrice = parseFloat(activeBtn.dataset.price) || 0;
                    options.push({
                        name: optionName,
                        value: optionValue,
                        price: optionPrice
                    });
                    totalPrice += optionPrice;
                }
            });

            product = {
                id: parseInt(productId),
                name: name || 'Produit',
                basePrice: basePrice,
                price: totalPrice,
                image: image || '',
                specs: '',
                options: options,
                optionSummary: options.map(opt => `${opt.value}`).join(' - ')
            };
        }

        if (!product) return;

        // Animation
        const originalText = addButton.textContent;
        addButton.textContent = '✓ Ajouté';
        addButton.style.background = '#10b981';
        setTimeout(() => {
            addButton.textContent = originalText;
            addButton.style.background = '';
        }, 2000);

        addToCart(product);
        showNotification('Produit ajouté au panier');
    });

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

    // Ajout des animations CSS si absentes
    if (!document.getElementById('notif-style')) {
        const style = document.createElement('style');
        style.id = 'notif-style';
        style.textContent = `
            @keyframes slideInNotif {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutNotif {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(400px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
})();