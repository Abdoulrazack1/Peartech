// ============================================
// panier.js - Gestion globale du panier
// S'occupe du stockage localStorage, du badge
// du header, et de l'ajout au panier depuis
// n'importe quelle page (accueil, catalogue, produit)
// ============================================

// IIFE pour isoler le code et éviter les conflits avec d'autres scripts
(function() {
    'use strict'; // Mode strict : détecte les erreurs silencieuses

    // Clé utilisée pour stocker le panier dans localStorage
    const CART_STORAGE_KEY = 'peartech-cart';

    // ── Accès localStorage sécurisé ───────────────────────────────
    // localStorage peut être indisponible (mode privé, quota dépassé, cookies bloqués)
    // Ces deux fonctions encapsulent tous les accès pour éviter les crashs silencieux

    /**
     * Récupère une valeur depuis localStorage de manière sécurisée
     * @param {string} key - La clé à lire
     * @returns {string|null} La valeur ou null si erreur
     */
    function storageGet(key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            // En cas d'erreur (ex: mode privé), on log un avertissement
            console.warn('localStorage.getItem échoué :', e);
            return null;
        }
    }

    /**
     * Écrit une valeur dans localStorage de manière sécurisée
     * @param {string} key - La clé à écrire
     * @param {string} value - La valeur à stocker
     * @returns {boolean} true si réussi, false sinon
     */
    function storageSet(key, value) {
        try {
            localStorage.setItem(key, value);
            return true; // Succès
        } catch (e) {
            // QuotaExceededError : stockage plein (fréquent en navigation privée)
            console.warn('localStorage.setItem échoué (quota ou mode privé ?) :', e);
            return false; // Échec
        }
    }

    // ── Chargement initial du panier ──────────────────────────────

    // Variable interne contenant l'état du panier (tableau d'articles)
    let cart = [];
    try {
        // Récupère le panier depuis localStorage et le parse en JSON
        // Si la clé n'existe pas, storageGet retourne null, donc [] après ||
        cart = JSON.parse(storageGet(CART_STORAGE_KEY)) || [];
    } catch (e) {
        // JSON invalide dans le localStorage (données corrompues)
        console.warn('Panier corrompu dans localStorage, réinitialisation :', e);
        cart = []; // On réinitialise le panier
    }

    // ── Mise à jour du badge du header ────────────────────────────

    /**
     * Met à jour le compteur d'articles affiché dans le header
     * (élément avec id="cart-count")
     */
    function updateCartBadge() {
        // Calcule le nombre total d'articles (somme des quantités)
        const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
        // Sauvegarde le compteur dans localStorage pour les pages qui n'ont pas ce script
        storageSet('peartech-cart-count', totalItems);
        // Met à jour l'élément du DOM s'il existe
        const badge = document.getElementById('cart-count');
        if (badge) {
            badge.textContent = totalItems; // Affiche le nombre
            badge.style.display = totalItems === 0 ? 'none' : 'flex'; // Cache si zéro
        }
    }

    // ── Sauvegarde du panier ──────────────────────────────────────

    /**
     * Sauvegarde le panier courant dans localStorage
     * et met à jour le badge
     */
    function saveCart() {
        // Tente d'écrire le panier (converti en JSON) dans localStorage
        const ok = storageSet(CART_STORAGE_KEY, JSON.stringify(cart));
        if (!ok) {
            // Sauvegarde échouée : on prévient l'utilisateur discrètement
            // sans crasher l'application (le panier reste fonctionnel en mémoire)
            showNotification('Impossible de sauvegarder le panier (stockage indisponible).', 'error');
        }
        updateCartBadge(); // Met à jour le badge quoi qu'il arrive
    }

    // ── Ajout d'un produit au panier ──────────────────────────────

    /**
     * Ajoute un produit au panier. Si un article identique existe déjà
     * (même id et mêmes options), on incrémente la quantité.
     * @param {Object} product - Le produit à ajouter
     * @param {number} product.id - ID du produit
     * @param {string} product.name - Nom du produit
     * @param {number} product.basePrice - Prix de base (sans options)
     * @param {number} product.price - Prix total avec options (pour affichage)
     * @param {string} product.image - URL de l'image
     * @param {string} product.specs - Spécifications (optionnel)
     * @param {Array} product.options - Options sélectionnées (pour distinguer les variantes)
     * @param {string} product.optionSummary - Résumé textuel des options
     * @param {number} product.quantity - Quantité à ajouter (défaut 1)
     */
    function addToCart(product) {
        // Cherche un article existant avec le même id ET les mêmes options
        // On compare les options via JSON.stringify pour une comparaison en profondeur
        const existing = cart.find(item =>
            item.id === product.id &&
            JSON.stringify(item.options) === JSON.stringify(product.options)
        );

        if (existing) {
            // Article déjà présent : on augmente la quantité
            existing.quantity += product.quantity || 1;
        } else {
            // Nouvel article : on l'ajoute au tableau
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
        saveCart(); // Persiste le changement
    }

    // ── API publique du panier ────────────────────────────────────

    // Expose les fonctions nécessaires aux autres scripts (notamment product_grid.js)
    window.PearTechCart = {
        add:     addToCart,          // Méthode pour ajouter un produit
        getCart: () => cart,         // Retourne l'état actuel du panier
        clear:   () => { cart = []; saveCart(); } // Vide complètement le panier
    };

    // Initialise le badge au chargement du script
    updateCartBadge();

    // ============================================
    // DÉLÉGATION D'ÉVÉNEMENTS - Clic sur "Ajouter au panier"
    // ============================================

    // Écoute tous les clics sur le document
    document.addEventListener('click', function(e) {
        // Vérifie si le clic ou l'un de ses parents a la classe 'btn-add-cart'
        const addButton = e.target.closest('.btn-add-cart');
        if (!addButton) return; // Pas un bouton panier → on ignore

        e.stopPropagation(); // Empêche la propagation pour éviter les comportements inattendus

        let product = null; // Sera construit à partir du DOM
        const productCard = addButton.closest('.product-card'); // Cherche si le bouton est dans une card

        if (productCard) {
            // ── Cas 1 : Bouton dans une card (page accueil, catalogue, favoris) ───

            const productId = productCard.dataset.productId; // ID stocké dans data-product-id
            if (!productId) {
                console.warn('Attribut data-product-id manquant sur .product-card');
                return;
            }
            // Récupère les éléments à l'intérieur de la card
            const nameEl     = productCard.querySelector('.product-name');
            const priceEl    = productCard.querySelector('.product-price');
            const oldPriceEl = productCard.querySelector('.product-old-price');
            const imgEl      = productCard.querySelector('.product-image img');
            const specsEl    = productCard.querySelector('.product-specs');

            // Parse le prix : enlève tout sauf chiffres, virgules et points, puis remplace virgule par point
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
            // ── Cas 2 : Bouton sur la fiche produit (page_produit.html) ───────────

            const productId = addButton.dataset.productId; // L'ID est directement sur le bouton
            if (!productId) {
                console.warn('Attribut data-product-id manquant sur le bouton');
                return;
            }
            // Récupère les informations depuis la structure spécifique de la page produit
            const name         = document.querySelector('.product-title')?.textContent;
            const priceElement = document.querySelector('.current-price');
            const oldPriceEl   = document.querySelector('.old-price');
            const basePrice    = priceElement
                ? parseFloat(priceElement.textContent.replace(/[^\d,]/g, '').replace(',', '.'))
                : 0;
            const oldPrice = oldPriceEl
                ? parseFloat(oldPriceEl.textContent.replace(/[^\d,]/g, '').replace(',', '.'))
                : null;
            const image = document.querySelector('.main-image img')?.src;

            // Collecte les options sélectionnées (couleur, stockage, etc.)
            const options = [];
            let totalPrice = basePrice; // Prix total incluant les options
            const optionGroups = document.querySelectorAll('.option-group');

            optionGroups.forEach(group => {
                const activeBtn = group.querySelector('.option-btn.active');
                if (activeBtn) {
                    // Récupère le nom de l'option (ex: "Couleur") en enlevant les deux-points
                    const optionName  = group.querySelector('.option-label')?.textContent.replace(':', '') || 'Option';
                    // Valeur choisie (ex: "Titane naturel")
                    const optionValue = activeBtn.dataset.value || activeBtn.textContent;
                    // Prix additionnel (ex: +50€) stocké dans data-price
                    const optionPrice = parseFloat(activeBtn.dataset.price) || 0;
                    options.push({ name: optionName, value: optionValue, price: optionPrice });
                    totalPrice += optionPrice; // Ajoute au prix total
                }
            });

            product = {
                id:            parseInt(productId),
                name:          name || 'Produit',
                basePrice:     basePrice,
                price:         totalPrice, // Prix avec options
                // oldPrice conservé pour l'affichage de la réduction dans paiement.js
                oldPrice:      (oldPrice && oldPrice > basePrice) ? oldPrice : null,
                image:         image || '',
                specs:         '',
                options:       options,
                optionSummary: options.map(opt => opt.value).join(' - ') // Résumé pour l'affichage
            };
        }

        // Si aucun produit n'a pu être construit, on arrête
        if (!product) return;

        // ── Feedback visuel immédiat sur le bouton ──────────────────

        const originalText = addButton.textContent; // Sauvegarde le texte original
        addButton.textContent = '✓ Ajouté';          // Remplace par confirmation
        addButton.style.background = '#10b981';      // Passe en vert
        setTimeout(() => {
            addButton.textContent  = originalText;   // Restaure le texte après 2s
            addButton.style.background = '';         // Restaure la couleur par défaut
        }, 2000);

        // Ajoute le produit au panier
        addToCart(product);
        // Affiche une notification toast
        showNotification('Produit ajouté au panier');
    });

    // ── Toast de notification ──────────────────────────────────────

    /**
     * Affiche une notification temporaire en haut à droite
     * @param {string} message - Texte à afficher
     * @param {string} type - 'success', 'error', ou défaut (bleu)
     */
    function showNotification(message, type = 'success') {
        // Supprime une éventuelle notification existante pour éviter les doublons
        const existing = document.querySelector('.notification-toast');
        if (existing) existing.remove();

        // Crée l'élément notification
        const notification = document.createElement('div');
        notification.className = 'notification-toast';
        notification.textContent = message;
        // Applique un style inline (couleur selon le type)
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3B82F6'};
            color: white; padding: 1rem 1.5rem; border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 9999;
            animation: slideInNotif 0.3s ease; font-weight: 500;
        `;
        document.body.appendChild(notification);
        // Disparaît après 3 secondes
        setTimeout(() => {
            notification.style.animation = 'slideOutNotif 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // ── Animations CSS du toast ────────────────────────────────────
    // Injecte les keyframes nécessaires dans le head si pas déjà présentes

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