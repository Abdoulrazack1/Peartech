// ============================================
// cart.js - Gestion du panier
// Ajout au panier et notifications
// ============================================

(function() {
    'use strict';
    
    document.addEventListener('DOMContentLoaded', function() {
        
        // ============================================
        // BOUTONS AJOUTER AU PANIER
        // ============================================
        
        const addToCartButtons = document.querySelectorAll('.btn-add-cart');
        
        if (addToCartButtons.length === 0) {
            console.warn('Aucun bouton panier trouvé');
            return;
        }
        
        addToCartButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // Récupérer le nom du produit
                const productCard = this.closest('.product-card');
                const productName = productCard ? productCard.querySelector('.product-name').textContent : 'Produit';
                
                // Animation du bouton
                const originalText = this.textContent;
                this.textContent = '✓ Ajouté';
                this.style.background = '#10b981';
                
                // Retour à l'état normal après 2 secondes
                setTimeout(() => {
                    this.textContent = originalText;
                    this.style.background = '';
                }, 2000);
                
                // Afficher notification
                showNotification('Produit ajouté au panier');
                
                // Déclencher un événement custom
                const event = new CustomEvent('productAddedToCart', {
                    detail: { name: productName }
                });
                document.dispatchEvent(event);
                
                console.log('Ajouté au panier:', productName);
            });
        });
        
        // ============================================
        // SYSTÈME DE NOTIFICATION
        // ============================================
        
        function showNotification(message, type = 'success') {
            // Retirer les notifications existantes
            const existing = document.querySelector('.notification-toast');
            if (existing) existing.remove();
            
            const notification = document.createElement('div');
            notification.className = 'notification-toast';
            notification.textContent = message;
            
            // Couleur selon le type
            let bgColor = '#10b981'; // success
            if (type === 'error') bgColor = '#ef4444';
            if (type === 'info') bgColor = '#3B82F6';
            
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${bgColor};
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 9999;
                animation: slideInNotif 0.3s ease;
                font-weight: 500;
            `;
            
            document.body.appendChild(notification);
            
            // Retirer après 3 secondes
            setTimeout(() => {
                notification.style.animation = 'slideOutNotif 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }
        
        // ============================================
        // ANIMATIONS NOTIFICATION
        // ============================================
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInNotif {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOutNotif {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
        
        // ============================================
        // ÉCOUTER L'ÉVÉNEMENT DE SÉLECTION PRODUIT
        // ============================================
        
        document.addEventListener('productSelected', function(e) {
            showNotification('Produit sélectionné : ' + e.detail.name, 'info');
        });
        
        console.log('Cart module initialisé -', addToCartButtons.length, 'boutons');
    });
    
})();