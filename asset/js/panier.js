// ============================================
// panier.js - Gestion globale du panier
// S'occupe du stockage localStorage, du badge
// du header, et de l'ajout au panier depuis
// n'importe quelle page (accueil, catalogue, produit)
// ============================================

(function() {
    'use strict'; // Mode strict activé

    const CART_STORAGE_KEY = 'peartech-cart'; // Clé unique du panier dans localStorage

    let cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || []; // Charge le panier existant ou tableau vide

    // ── Mise à jour du badge du header ────────────────────────────

    function updateCartBadge() {
        // Calcule le nombre total d'articles (somme des quantités)
        const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
        localStorage.setItem('peartech-cart-count', totalItems); // Sauvegarde le total pour les autres pages
        const badge = document.getElementById('cart-count'); // Badge numérique sur l'icône panier
        if (badge) {
            badge.textContent = totalItems;  // Affiche le nombre
            // Cache le badge si 0 article (affichage propre), sinon montre en flex
            badge.style.display = totalItems === 0 ? 'none' : 'flex';
        }
    }

    // ── Sauvegarde du panier ──────────────────────────────────────

    function saveCart() {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart)); // Persiste le panier sérialisé
        updateCartBadge(); // Synchronise le badge à chaque sauvegarde
    }

    // ── Ajout d'un produit au panier ──────────────────────────────

    function addToCart(product) {
        // Cherche si le produit avec les mêmes options est déjà dans le panier
        const existing = cart.find(item =>
            item.id === product.id &&
            // Comparaison JSON pour les options (tableaux comparés en valeur, pas en référence)
            JSON.stringify(item.options) === JSON.stringify(product.options)
        );

        if (existing) {
            existing.quantity += product.quantity || 1; // Incrémente la quantité si déjà présent
        } else {
            // Nouveau produit : l'ajoute au tableau avec toutes ses propriétés
            cart.push({
                id:            product.id,
                name:          product.name,
                basePrice:     product.basePrice,     // Prix de base sans options
                price:         product.price,          // Prix réel avec options incluses
                image:         product.image,          // URL de l'image
                specs:         product.specs || '',    // Spécifications textuelles
                options:       product.options || [],  // Options choisies (couleur, stockage...)
                optionSummary: product.optionSummary || '', // Résumé textuel des options
                quantity:      product.quantity || 1   // Quantité (1 par défaut)
            });
        }
        saveCart(); // Sauvegarde après modification
    }

    // ── API publique du panier ────────────────────────────────────
    // Exposée sur window pour que les autres modules puissent l'utiliser

    window.PearTechCart = {
        add:      addToCart,              // Ajoute un produit
        getCart:  () => cart,             // Retourne le tableau du panier (lecture seule recommandée)
        clear:    () => { cart = []; saveCart(); } // Vide complètement le panier
    };

    updateCartBadge(); // Synchronise le badge dès le chargement de la page

    // ============================================
    // DÉLÉGATION D'ÉVÉNEMENTS - Clic sur "Ajouter au panier"
    // Une seule écoute sur le document gère tous les boutons .btn-add-cart,
    // même ceux générés dynamiquement après le chargement
    // ============================================

    document.addEventListener('click', function(e) {
        const addButton = e.target.closest('.btn-add-cart'); // Cherche le bouton le plus proche
        if (!addButton) return; // Clic ailleurs : on ignore

        e.stopPropagation(); // Empêche la propagation vers les liens parents (fiche produit)

        let product = null; // Objet produit à construire
        const productCard = addButton.closest('.product-card'); // Cherche la card parente

        if (productCard) {
            // ── Cas 1 : Bouton dans une card (accueil / catalogue / favoris) ──

            const productId = productCard.dataset.productId; // ID du produit depuis data-product-id
            if (!productId) {
                console.warn('Attribut data-product-id manquant sur .product-card');
                return;
            }
            // Récupère les informations depuis les éléments de la card
            const nameEl  = productCard.querySelector('.product-name');
            const priceEl = productCard.querySelector('.product-price');
            const imgEl   = productCard.querySelector('.product-image img');
            const specsEl = productCard.querySelector('.product-specs');

            product = {
                id:           parseInt(productId),
                name:         nameEl  ? nameEl.textContent : 'Produit',
                // Nettoie le prix : "1 299,00 €" → supprime tout sauf chiffres et virgule → remplace , par . → float
                basePrice:    priceEl ? parseFloat(priceEl.textContent.replace(/[^\d,]/g, '').replace(',', '.')) : 0,
                price:        priceEl ? parseFloat(priceEl.textContent.replace(/[^\d,]/g, '').replace(',', '.')) : 0,
                image:        imgEl   ? imgEl.src : '',
                specs:        specsEl ? specsEl.textContent : '',
                options:      [],       // Pas d'options sur les cards
                optionSummary: ''
            };
        } else {
            // ── Cas 2 : Bouton sur la page fiche produit ──────────

            const productId = addButton.dataset.productId; // ID depuis le bouton lui-même
            if (!productId) {
                console.warn('Attribut data-product-id manquant sur le bouton');
                return;
            }
            const name         = document.querySelector('.product-title')?.textContent;
            const priceElement = document.querySelector('.current-price'); // Prix actuel (avec options)
            const basePrice    = priceElement
                ? parseFloat(priceElement.textContent.replace(/[^\d,]/g, '').replace(',', '.'))
                : 0;
            const image = document.querySelector('.main-image img')?.src; // Image principale

            // ── Récupération des options sélectionnées ────────────

            const options = []; // Tableau des options choisies
            let totalPrice = basePrice; // Le prix total commence au prix de base
            const optionGroups = document.querySelectorAll('.option-group'); // Groupes d'options

            optionGroups.forEach(group => {
                const activeBtn = group.querySelector('.option-btn.active'); // Bouton d'option actif
                if (activeBtn) {
                    const optionName  = group.querySelector('.option-label')?.textContent.replace(':', '') || 'Option';
                    const optionValue = activeBtn.dataset.value || activeBtn.textContent; // Valeur choisie
                    const optionPrice = parseFloat(activeBtn.dataset.price) || 0; // Surcoût de l'option
                    options.push({
                        name:  optionName,
                        value: optionValue,
                        price: optionPrice
                    });
                    totalPrice += optionPrice; // Ajoute le surcoût au total
                }
            });

            product = {
                id:            parseInt(productId),
                name:          name || 'Produit',
                basePrice:     basePrice,
                price:         totalPrice, // Prix final = base + surcoûts des options
                image:         image || '',
                specs:         '',
                options:       options,
                optionSummary: options.map(opt => `${opt.value}`).join(' - ') // "128Go - Noir"
            };
        }

        if (!product) return; // Sécurité

        // ── Feedback visuel sur le bouton ─────────────────────────

        const originalText = addButton.textContent;
        addButton.textContent = '✓ Ajouté';              // Confirme l'ajout visuellement
        addButton.style.background = '#10b981';           // Passe en vert
        setTimeout(() => {
            addButton.textContent = originalText;         // Restaure le texte original
            addButton.style.background = '';              // Restaure la couleur originale
        }, 2000); // Après 2 secondes

        addToCart(product); // Ajoute réellement au panier
        showNotification('Produit ajouté au panier'); // Affiche le toast
    });

    // ── Toast de notification ──────────────────────────────────────

    function showNotification(message, type = 'success') {
        const existing = document.querySelector('.notification-toast');
        if (existing) existing.remove(); // Supprime un toast existant pour éviter les doublons

        const notification = document.createElement('div');
        notification.className = 'notification-toast';
        notification.textContent = message;
        // Style inline dynamique selon le type
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3B82F6'};
            color: white; padding: 1rem 1.5rem; border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 9999;
            animation: slideInNotif 0.3s ease; font-weight: 500;
        `;
        document.body.appendChild(notification); // Ajoute dans le body
        setTimeout(() => {
            notification.style.animation = 'slideOutNotif 0.3s ease'; // Lance l'animation de sortie
            setTimeout(() => notification.remove(), 300);              // Supprime après l'animation
        }, 3000); // Disparaît après 3 secondes
    }

    // ── Injection des animations CSS ──────────────────────────────
    // Ajoute les keyframes si elles ne sont pas déjà présentes dans la page

    if (!document.getElementById('notif-style')) {
        const style = document.createElement('style');
        style.id = 'notif-style'; // ID pour éviter les doublons
        style.textContent = `
            @keyframes slideInNotif {
                from { transform: translateX(400px); opacity: 0; } /* Vient de la droite */
                to   { transform: translateX(0);     opacity: 1; }
            }
            @keyframes slideOutNotif {
                from { transform: translateX(0);     opacity: 1; }
                to   { transform: translateX(400px); opacity: 0; } /* Repart vers la droite */
            }
        `;
        document.head.appendChild(style); // Ajoute dans le head de la page
    }
})(); // Fin de l'IIFE