// ============================================
// cart.js - Page panier
// Gère l'affichage des articles, les quantités,
// les codes promo, les totaux et la redirection
// vers la page de paiement
// ============================================

// Utilisation d'une IIFE (Immediately Invoked Function Expression) pour isoler le code
// et éviter les conflits de variables avec d'autres scripts
(function() {
    'use strict'; // Active le mode strict pour une meilleure sécurité et optimisation

    // Clé utilisée pour stocker le panier dans localStorage
    const CART_STORAGE_KEY = 'peartech-cart';

    // Charge le panier depuis localStorage : 
    // - JSON.parse convertit la chaîne stockée en objet JavaScript
    // - || [] fournit un tableau vide si rien n'est stocké
    // - .map() parcourt chaque article pour normaliser le champ 'image'
    let cartItems = (JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || []).map(item => {
        // Si l'article n'a pas de propriété 'image' directe
        if (!item.image) {
            // Si un tableau 'images' existe et contient des éléments, on prend la première image
            if (Array.isArray(item.images) && item.images.length > 0) {
                item.image = item.images[0];
            } else if (typeof item.images === 'string') {
                // Si 'images' est une chaîne, on l'utilise directement comme image
                item.image = item.images;
            }
        }
        return item; // Retourne l'article modifié
    });

    // Codes promo valides (objet avec code en clé, valeur = objet contenant le taux et un libellé)
    const validPromoCodes = {
        'PEARTECH10':  { discount: 0.10, label: '-10%' },
        'PEARTECH20':  { discount: 0.20, label: '-20%' },
        'BIENVENUE':   { discount: 0.05, label: '-5% bienvenue' },
        'SUMMER25':    { discount: 0.25, label: '-25% offre été' },
        'FIDELITE15':  { discount: 0.15, label: '-15% fidélité' },
        'BACK2SCHOOL': { discount: 0.12, label: '-12% rentrée' },
    };

    // Variable qui contiendra le code promo actuellement appliqué (null si aucun)
    let currentPromo = null;

    // Récupération des éléments DOM principaux de la page panier
    const cartContainer    = document.querySelector('.cart-items'); // Conteneur de la liste des articles
    const subtotalSpan     = document.getElementById('subtotal');   // Élément pour afficher le sous-total
    const shippingSpan     = document.getElementById('shipping');   // Élément pour afficher les frais de port
    const discountSpan     = document.getElementById('discount');   // Élément pour afficher la réduction
    const totalSpan        = document.getElementById('total');      // Élément pour afficher le total
    const promoInput       = document.getElementById('promo-input'); // Champ de saisie du code promo
    const applyPromoBtn    = document.getElementById('apply-promo'); // Bouton d'application du code promo
    const promoMessage     = document.getElementById('promo-message'); // Zone de message pour le code promo
    const checkoutBtn      = document.getElementById('checkout-btn'); // Bouton "Passer la commande"
    const recommendationsGrid = document.getElementById('recommendations-grid'); // Grille des recommandations

    // Image de remplacement utilisée si une image est manquante
    const PLACEHOLDER_IMAGE = '/asset/image/no-image.png';

    /**
     * Sauvegarde le panier dans localStorage et met à jour le badge du panier
     */
    function saveCart() {
        // Sauvegarde le panier (chaîne JSON) dans localStorage
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));

        // Si l'API centralisée PearTechCart existe, on l'utilise pour mettre à jour le badge
        if (window.PearTechCart) {
            // On suppose que PearTechCart a une méthode updateCart pour remplacer le panier
            window.PearTechCart.updateCart(cartItems);
        } else {
            // Fallback : mise à jour manuelle du badge
            // Calcule le nombre total d'articles (somme des quantités)
            const total = cartItems.reduce((acc, item) => acc + item.quantity, 0);
            // Sauvegarde le compteur dans localStorage (au cas où)
            localStorage.setItem('peartech-cart-count', total);
            // Récupère l'élément badge par son ID
            const badge = document.getElementById('cart-count');
            if (badge) {
                badge.textContent = total; // Met à jour le texte
                // Cache le badge si total = 0, sinon l'affiche avec display:flex
                badge.style.display = total === 0 ? 'none' : 'flex';
            }
        }
    }

    /**
     * Calcule les totaux (sous-total, frais, réduction, total) et met à jour l'affichage
     */
    function calculateTotals() {
        // Sous-total : somme des prix * quantité pour chaque article
        const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const shipping = 5.90; // Frais de port fixes
        let discount = 0; // Réduction initiale
        if (currentPromo) {
            // Si un code promo est appliqué, la réduction = sous-total * taux
            discount = subtotal * currentPromo.discount;
        }
        const total = subtotal + shipping - discount; // Total final

        // Mise à jour des éléments HTML avec les valeurs formatées
        subtotalSpan.textContent = formatPrice(subtotal);
        shippingSpan.textContent = formatPrice(shipping);
        discountSpan.textContent = `-${formatPrice(discount)}`; // Affiche avec un signe moins
        totalSpan.textContent    = formatPrice(total);
    }

    /**
     * Formate un nombre en prix français (ex: 1234.56 -> "1 234,56 €")
     * @param {number} price - Le prix à formater
     * @returns {string} Le prix formaté
     */
    function formatPrice(price) {
        // toFixed(2) pour deux décimales, remplace le point par une virgule, ajoute " €"
        return price.toFixed(2).replace('.', ',') + ' €';
    }

    /**
     * Gère les erreurs de chargement d'image en remplaçant par le placeholder
     * @param {HTMLImageElement} img - L'élément image qui a déclenché l'erreur
     */
    function handleImageError(img) {
        // Supprime l'événement onerror pour éviter une boucle infinie
        img.onerror = null;
        // Remplace la source par l'image par défaut
        img.src = PLACEHOLDER_IMAGE;
        // Affiche un avertissement dans la console
        console.warn('Image non trouvée, utilisation du placeholder', img.dataset.originalSrc || img.src);
    }

    /**
     * Affiche le panier en générant le HTML dynamiquement
     * Attache également les événements sur les boutons après le rendu
     */
    function renderCart() {
        // Si le panier est vide, on affiche un message simple
        if (cartItems.length === 0) {
            cartContainer.innerHTML = '<p class="empty-cart">Votre panier est vide.</p>';
            return; // On arrête l'exécution ici
        }

        // Construction du HTML pour chaque article
        let html = '';
        cartItems.forEach((item, index) => {
            // Génère le bloc des options (couleur, taille, etc.) si elles existent
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
        // Injecte le HTML généré dans le conteneur
        cartContainer.innerHTML = html;

        // --- Réattachement des événements après la régénération du DOM ---

        // Boutons "+" : augmenter la quantité
        document.querySelectorAll('.plus').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = this.dataset.index; // Récupère l'index de l'article
                cartItems[index].quantity++; // Incrémente la quantité
                renderCart(); // Réaffiche le panier (met à jour les prix et quantités)
                calculateTotals(); // Recalcule les totaux
                saveCart(); // Sauvegarde le panier
            });
        });

        // Boutons "-" : diminuer la quantité ou supprimer si quantité = 1
        document.querySelectorAll('.minus').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = this.dataset.index;
                if (cartItems[index].quantity > 1) {
                    cartItems[index].quantity--; // Décrémente
                } else {
                    // Si quantité = 1, demande confirmation avant suppression
                    if (confirm('Supprimer cet article du panier ?')) {
                        cartItems.splice(index, 1); // Supprime l'article du tableau
                    } else {
                        return; // Annule, ne fait rien
                    }
                }
                renderCart(); // Réaffiche
                calculateTotals();
                saveCart();
            });
        });

        // Liens "Supprimer" (dans les détails de l'article)
        document.querySelectorAll('.remove-item').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault(); // Empêche le comportement par défaut du lien
                const index = this.closest('.cart-item').dataset.index; // Trouve l'index via le parent
                if (confirm('Supprimer cet article du panier ?')) {
                    cartItems.splice(index, 1); // Supprime
                    renderCart();
                    calculateTotals();
                    saveCart();
                }
            });
        });

        // Liens "Enregistrer pour plus tard" (simulation)
        document.querySelectorAll('.save-for-later').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                alert('Fonctionnalité "Enregistrer pour plus tard" simulée.');
            });
        });
    }

    // Écouteur d'événement sur le bouton "Appliquer" du code promo
    applyPromoBtn.addEventListener('click', function() {
        // Récupère le code, supprime les espaces et le met en majuscules
        const code = promoInput.value.trim().toUpperCase();
        if (!code) {
            promoMessage.textContent = 'Veuillez entrer un code.'; // Message d'erreur si vide
            promoMessage.className = 'promo-message error'; // Applique la classe de style pour erreur
            return;
        }
        if (validPromoCodes[code]) { // Si le code existe dans l'objet
            const promo = validPromoCodes[code];
            currentPromo = { code, discount: promo.discount }; // Stocke le code appliqué
            promoMessage.textContent = `Code "${code}" appliqué : ${promo.label} !`; // Message succès
            promoMessage.className = 'promo-message success'; // Applique la classe de style succès
        } else {
            currentPromo = null; // Annule toute promo précédente
            promoMessage.textContent = 'Code invalide ou expiré.'; // Message erreur
            promoMessage.className = 'promo-message error';
        }
        calculateTotals(); // Recalcule les totaux avec la nouvelle réduction (ou sans)
    });

    // Écouteur du bouton "Passer la commande" (redirection vers paiement)
    checkoutBtn.addEventListener('click', function() {
        if (cartItems.length === 0) {
            alert('Votre panier est vide.'); // Empêche la redirection si panier vide
            return;
        }
        if (currentPromo) {
            // Si un code promo est actif, on le sauvegarde dans sessionStorage pour la page paiement
            try {
                sessionStorage.setItem('peartech-promo', JSON.stringify(currentPromo));
            } catch(e) {
                console.warn('sessionStorage indisponible, la promo ne sera pas transmise :', e);
            }
        } else {
            // Si pas de promo, on supprime l'éventuelle ancienne donnée
            try { sessionStorage.removeItem('peartech-promo'); } catch(e) {}
        }
        window.location.href = 'page_paiement.html'; // Redirection vers la page de paiement
    });

    /**
     * Charge et affiche des recommandations de produits (aléatoires)
     */
    function loadRecommendations() {
        if (!window.PearTechDB) return; // Si la base de données n'est pas disponible, on quitte
        const allProducts = PearTechDB.products; // Récupère tous les produits depuis l'objet global
        // Mélange le tableau pour avoir un ordre aléatoire
        const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
        const recommendations = shuffled.slice(0, 4); // Prend les 4 premiers après mélange

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
        recommendationsGrid.innerHTML = html; // Injecte le HTML dans la grille
    }

    // --- Initialisation ---
    renderCart();           // Affiche le panier au chargement
    calculateTotals();      // Calcule et affiche les totaux
    saveCart();             // Sauvegarde le panier (met à jour le badge)

    // Charge les recommandations (soit immédiatement si PearTechDB existe, soit après un délai)
    if (window.PearTechDB) {
        loadRecommendations();
    } else {
        // Si la base n'est pas encore chargée, on attend 500ms et on réessaie
        setTimeout(loadRecommendations, 500);
    }

    // Expose la fonction handleImageError dans le scope global
    // pour qu'elle soit accessible depuis les attributs onerror dans le HTML
    window.handleImageError = handleImageError;
})();