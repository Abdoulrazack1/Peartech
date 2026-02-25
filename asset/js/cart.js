// ============================================
// cart.js - Page panier
// Gère l'affichage des articles, les quantités,
// les codes promo, les totaux et la redirection
// vers la page de paiement
// ============================================

// IIFE : isole toutes les variables pour éviter les conflits globaux
(function() {
    'use strict'; // Mode strict : empêche l'utilisation de variables non déclarées

    // ── Clé de stockage et chargement du panier ──────────────────

    const CART_STORAGE_KEY = 'peartech-cart'; // Clé utilisée pour localStorage

    // Charge le panier depuis localStorage et normalise le champ image
    // Certaines pages stockent "images[]" (tableau) au lieu de "image" (chaîne)
    let cartItems = (JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || []).map(item => {
        if (!item.image) { // Si l'item n'a pas de champ "image" directement
            if (Array.isArray(item.images) && item.images.length > 0) {
                item.image = item.images[0]; // Prend le premier élément du tableau images
            } else if (typeof item.images === 'string') {
                item.image = item.images; // Si images est déjà une chaîne, on l'utilise directement
            }
        }
        return item; // Retourne l'item normalisé
    });

    // ── Codes promotionnels valides ───────────────────────────────
    // Objet clé/valeur : la clé est le code, la valeur contient le taux et le label affiché

    const validPromoCodes = {
        'PEARTECH10':  { discount: 0.10, label: '-10%' },          // 10% de réduction
        'PEARTECH20':  { discount: 0.20, label: '-20%' },          // 20% de réduction
        'BIENVENUE':   { discount: 0.05, label: '-5% bienvenue' }, // 5% pour les nouveaux
        'SUMMER25':    { discount: 0.25, label: '-25% offre été' }, // 25% offre saisonnière
        'FIDELITE15':  { discount: 0.15, label: '-15% fidélité' }, // 15% pour les fidèles
        'BACK2SCHOOL': { discount: 0.12, label: '-12% rentrée' },  // 12% rentrée scolaire
    };

    let currentPromo = null; // Stocke le code promo actuellement appliqué (null = aucun)

    // ── Récupération des éléments du DOM ─────────────────────────
    // Ces variables pointent vers les éléments HTML qui seront mis à jour dynamiquement

    const cartContainer    = document.querySelector('.cart-items');       // Zone d'affichage des articles
    const subtotalSpan     = document.getElementById('subtotal');         // Affiche le sous-total
    const shippingSpan     = document.getElementById('shipping');         // Affiche les frais de port
    const discountSpan     = document.getElementById('discount');         // Affiche la réduction
    const totalSpan        = document.getElementById('total');            // Affiche le total TTC
    const promoInput       = document.getElementById('promo-input');      // Champ de saisie du code promo
    const applyPromoBtn    = document.getElementById('apply-promo');      // Bouton "Appliquer"
    const promoMessage     = document.getElementById('promo-message');    // Zone de message promo
    const checkoutBtn      = document.getElementById('checkout-btn');     // Bouton "Passer à l'étape suivante"
    const recommendationsGrid = document.getElementById('recommendations-grid'); // Grille de recommandations

    const PLACEHOLDER_IMAGE = '/asset/image/no-image.png'; // Image par défaut si une image produit est introuvable

    // ── Sauvegarde du panier ──────────────────────────────────────

    function saveCart() {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems)); // Sauvegarde le panier sérialisé
        const total = cartItems.reduce((acc, item) => acc + item.quantity, 0); // Calcule le nombre total d'articles
        localStorage.setItem('peartech-cart-count', total); // Sauvegarde le compteur séparément pour le badge header
        const badge = document.getElementById('cart-count'); // Récupère le badge du header
        if (badge) {
            badge.textContent = total; // Met à jour le chiffre affiché
            badge.style.display = total === 0 ? 'none' : 'flex'; // Cache le badge si le panier est vide
        }
    }

    // ── Calcul et affichage des totaux ────────────────────────────

    function calculateTotals() {
        // Calcule le sous-total : somme de (prix unitaire × quantité) pour chaque article
        const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const shipping = 5.90; // Frais de port fixes
        let discount = 0;      // Initialise la réduction à 0
        if (currentPromo) {
            // Applique le pourcentage de réduction au sous-total
            discount = subtotal * currentPromo.discount;
        }
        const total = subtotal + shipping - discount; // Total = sous-total + livraison - réduction

        // Met à jour les éléments HTML avec les valeurs calculées
        subtotalSpan.textContent = formatPrice(subtotal);         // Affiche le sous-total formaté
        shippingSpan.textContent = formatPrice(shipping);         // Affiche les frais de port
        discountSpan.textContent = `-${formatPrice(discount)}`;   // Affiche la réduction avec signe "-"
        totalSpan.textContent    = formatPrice(total);            // Affiche le total TTC
    }

    // ── Formateur de prix ──────────────────────────────────────────

    function formatPrice(price) {
        // Formate un nombre en prix français : 2 décimales, virgule à la place du point, et "€"
        return price.toFixed(2).replace('.', ',') + ' €';
    }

    // ── Gestion des images manquantes ─────────────────────────────

    function handleImageError(img) {
        img.onerror = null; // Supprime le handler pour éviter une boucle infinie si le placeholder est aussi absent
        img.src = PLACEHOLDER_IMAGE; // Remplace l'image cassée par le placeholder
        console.warn('Image non trouvée, utilisation du placeholder', img.dataset.originalSrc || img.src);
    }

    // ── Rendu HTML du panier ───────────────────────────────────────

    function renderCart() {
        if (cartItems.length === 0) { // Si le panier est vide
            cartContainer.innerHTML = '<p class="empty-cart">Votre panier est vide.</p>'; // Message panier vide
            return; // On arrête le rendu ici
        }

        let html = ''; // Chaîne HTML à construire
        cartItems.forEach((item, index) => { // Pour chaque article du panier
            // Construit la liste des options sélectionnées si elles existent (ex: couleur, stockage)
            const optionsHtml = item.options && item.options.length ?
                `<div class="item-options">${item.options.map(opt => `${opt.name}: ${opt.value}`).join(', ')}</div>` : '';

            // Construit le HTML d'un article du panier
            html += `
                <div class="cart-item" data-index="${index}">
                    <div class="item-image">
                        <!-- Image avec fallback inline en cas d'erreur de chargement -->
                        <img src="${item.image || '/asset/image/no-image.png'}" alt="${item.name}"
                             data-original-src="${item.image}"
                             onerror="this.onerror=null;this.src='/asset/image/no-image.png';">
                    </div>
                    <div class="item-details">
                        <!-- Lien vers la fiche produit -->
                        <a href="page_produit.html?id=${item.id}" class="item-name">${item.name}</a>
                        <div class="item-specs">${item.specs || ''}</div>
                        ${optionsHtml}
                        <!-- Indicateur de disponibilité -->
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
                        <!-- Contrôle de quantité : boutons - et + avec valeur au centre -->
                        <div class="quantity-control">
                            <button class="quantity-btn minus" data-index="${index}">-</button>
                            <input type="text" class="quantity-input" value="${item.quantity}" readonly>
                            <button class="quantity-btn plus" data-index="${index}">+</button>
                        </div>
                    </div>
                    <div class="item-price">
                        <div class="unit-price">${formatPrice(item.price)} / unité</div>
                        <!-- Prix total = prix unitaire × quantité -->
                        <div class="total-price">${formatPrice(item.price * item.quantity)}</div>
                    </div>
                </div>
            `;
        });
        cartContainer.innerHTML = html; // Injecte tout le HTML généré dans le DOM

        // ── Réattachement des événements après le re-rendu ────────
        // Les événements sont perdus à chaque innerHTML, donc on les remet

        // Bouton "+" : augmente la quantité
        document.querySelectorAll('.plus').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = this.dataset.index; // Récupère l'index de l'article depuis data-index
                cartItems[index].quantity++;       // Incrémente la quantité
                renderCart();       // Re-génère l'affichage du panier
                calculateTotals();  // Recalcule les totaux
                saveCart();         // Sauvegarde dans localStorage
            });
        });

        // Bouton "-" : diminue la quantité ou supprime l'article
        document.querySelectorAll('.minus').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = this.dataset.index;
                if (cartItems[index].quantity > 1) {
                    cartItems[index].quantity--; // Décrémente si quantité > 1
                } else {
                    // Si quantité = 1, demande confirmation avant de supprimer l'article
                    if (confirm('Supprimer cet article du panier ?')) {
                        cartItems.splice(index, 1); // Supprime l'article du tableau
                    } else {
                        return; // L'utilisateur a annulé : on ne fait rien
                    }
                }
                renderCart();
                calculateTotals();
                saveCart();
            });
        });

        // Lien "Supprimer" : supprime directement l'article
        document.querySelectorAll('.remove-item').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault(); // Empêche la navigation du lien href="#"
                const index = this.closest('.cart-item').dataset.index; // Récupère l'index depuis le parent
                if (confirm('Supprimer cet article du panier ?')) {
                    cartItems.splice(index, 1); // Supprime l'article du tableau
                    renderCart();
                    calculateTotals();
                    saveCart();
                }
            });
        });

        // Lien "Enregistrer pour plus tard" : fonctionnalité simulée
        document.querySelectorAll('.save-for-later').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault(); // Empêche la navigation
                alert('Fonctionnalité "Enregistrer pour plus tard" simulée.'); // Simulation
            });
        });
    }

    // ── Application du code promo ─────────────────────────────────

    applyPromoBtn.addEventListener('click', function() {
        const code = promoInput.value.trim().toUpperCase(); // Récupère le code et le met en majuscules
        if (!code) { // Si le champ est vide
            promoMessage.textContent = 'Veuillez entrer un code.';
            promoMessage.className = 'promo-message error'; // Classe CSS pour style rouge
            return;
        }
        if (validPromoCodes[code]) { // Si le code existe dans la liste des codes valides
            const promo = validPromoCodes[code]; // Récupère les informations du code
            currentPromo = { code, discount: promo.discount }; // Stocke le code et son taux
            promoMessage.textContent = `Code "${code}" appliqué : ${promo.label} !`; // Message de succès
            promoMessage.className = 'promo-message success'; // Classe CSS pour style vert
        } else {
            currentPromo = null; // Aucun code valide : on réinitialise
            promoMessage.textContent = 'Code invalide ou expiré.';
            promoMessage.className = 'promo-message error';
        }
        calculateTotals(); // Recalcule les totaux avec ou sans la nouvelle réduction
    });

    // ── Bouton "Passer à l'étape suivante" ────────────────────────

    checkoutBtn.addEventListener('click', function() {
        if (cartItems.length === 0) {
            alert('Votre panier est vide.');
            return;
        }
        // Sauvegarde le code promo actif avant de quitter la page
        // sessionStorage : données perdues à la fermeture de l'onglet (comportement voulu)
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

    // ── Chargement des recommandations ────────────────────────────

    function loadRecommendations() {
        if (!window.PearTechDB) return; // Arrête si la base de données n'est pas chargée
        const allProducts = PearTechDB.products; // Récupère tous les produits
        const shuffled = [...allProducts].sort(() => 0.5 - Math.random()); // Mélange aléatoirement le tableau (Fisher-Yates approximatif)
        const recommendations = shuffled.slice(0, 4); // Prend les 4 premiers après le mélange

        let html = '';
        recommendations.forEach(prod => { // Génère une card pour chaque produit recommandé
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
        recommendationsGrid.innerHTML = html; // Injecte les recommandations dans la grille
    }

    // ── Initialisation ─────────────────────────────────────────────

    renderCart();       // Affiche les articles du panier
    calculateTotals();  // Calcule et affiche les totaux
    saveCart();         // Synchronise le badge du header

    // Charge les recommandations dès que PearTechDB est disponible
    if (window.PearTechDB) {
        loadRecommendations(); // Disponible immédiatement
    } else {
        setTimeout(loadRecommendations, 500); // Attend 500ms si data.js n'est pas encore chargé
    }

    // Expose la fonction de gestion d'erreur image globalement
    // pour pouvoir l'appeler depuis les attributs onerror du HTML
    window.handleImageError = handleImageError;
})(); // Fin de l'IIFE