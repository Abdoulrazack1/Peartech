// ============================================
// panier.js - Gestion du panier (délégation)
// ============================================
(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        // Délégation sur tout le document
        document.addEventListener('click', function(e) {
            const addButton = e.target.closest('.btn-add-cart');
            if (!addButton) return;

            e.stopPropagation();

            // Récupérer le nom du produit
            const productCard = addButton.closest('.product-card');
            let productName = 'Produit';
            if (productCard) {
                const nameElement = productCard.querySelector('.product-name');
                if (nameElement) productName = nameElement.textContent;
            } else {
                // Page produit
                const titleElement = document.querySelector('.product-title');
                if (titleElement) productName = titleElement.textContent;
            }

            // Animation
            const originalText = addButton.textContent;
            addButton.textContent = '✓ Ajouté';
            addButton.style.background = '#10b981';
            setTimeout(() => {
                addButton.textContent = originalText;
                addButton.style.background = '';
            }, 2000);

            showNotification('Produit ajouté au panier');
            document.dispatchEvent(new CustomEvent('productAddedToCart', { detail: { name: productName } }));
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

        // Ajout des animations CSS
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
    });
})();