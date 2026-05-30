// ============================================
// favoris.js - Système de favoris complet
// Gère : stockage localStorage, boutons cœur,
// page dédiée, toast de notification, ajout panier
// ============================================

(function () {
    'use strict'; // Mode strict activé

    const FAV_KEY = 'peartech-favoris'; // Clé de stockage dans localStorage

    // Images de fallback par catégorie si les images produits ne se chargent pas
    const FALLBACKS = {
        'cat_apple':    'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=400&q=80',
        'cat_android':  'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80',
        'cat_wearables':'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
        'cat_tablets':  'https://images.unsplash.com/photo-1587033411391-5d9e51cce126?w=400&q=80',
    };

    // ============================================
    // API INTERNE - Fonctions de gestion des favoris
    // ============================================

    // Charge la liste des IDs favoris depuis localStorage
    function load() {
        try {
            return JSON.parse(localStorage.getItem(FAV_KEY)) || []; // Désérialise ou retourne tableau vide
        } catch {
            return []; // En cas de JSON corrompu, retourne un tableau vide
        }
    }

    // Sauvegarde la liste des IDs favoris dans localStorage
    function save(ids) {
        localStorage.setItem(FAV_KEY, JSON.stringify(ids)); // Sérialise et sauvegarde
    }

    // Vérifie si un produit est dans les favoris
    function isFavori(id) {
        return load().includes(parseInt(id)); // Convertit en entier car les IDs peuvent être des strings
    }

    // Ajoute ou retire un produit des favoris (toggle)
    function toggle(id) {
        id = parseInt(id); // Force la conversion en entier
        const ids = load();         // Charge les favoris actuels
        const idx = ids.indexOf(id); // Cherche l'ID dans la liste (-1 si absent)
        const added = idx === -1;
        if (added) {
            ids.push(id); // Produit absent : on l'ajoute
        } else {
            ids.splice(idx, 1); // Produit présent : on le retire
        }
        save(ids);          // Sauvegarde la liste mise à jour
        updateAllBadges();  // Met à jour le compteur dans le header

        // Synchronise avec le serveur si l'utilisateur est connecté (best-effort)
        if (window.PearTechAPI && PearTechAPI.isLoggedIn()) {
            const appel = added ? PearTechAPI.favorisAjouter(id) : PearTechAPI.favorisRetirer(id);
            appel.catch(e => console.warn('Sync favori échouée :', e.message));
        }
        return added;       // true si ajouté, false si retiré
    }

    // Envoie tous les favoris locaux vers le serveur (appelé après connexion)
    function pushAllToServer() {
        if (!(window.PearTechAPI && PearTechAPI.isLoggedIn())) return;
        load().forEach(id => PearTechAPI.favorisAjouter(id).catch(() => {}));
    }

    // Retourne tous les IDs favoris
    function getAll() {
        return load();
    }

    // Vide complètement les favoris
    function clear() {
        save([]);          // Sauvegarde un tableau vide
        updateAllBadges(); // Remet le badge à 0
    }

    // ============================================
    // BADGES HEADER - Compteur de favoris
    // ============================================

    function updateAllBadges() {
        const count = load().length; // Nombre de favoris actuels
        // Met à jour tous les badges dans le DOM (header desktop + mobile)
        document.querySelectorAll('#fav-count, .fav-badge').forEach(el => {
            el.textContent = count > 0 ? count : ''; // Affiche le nombre ou vide si 0
            el.dataset.count = count;                // Stocke la valeur en data attribute
            el.style.display = count > 0 ? '' : 'none'; // Cache le badge si 0
        });
    }

    // ============================================
    // BOUTON CŒUR SVG
    // ============================================

    // Crée un bouton cœur pour une carte produit
    function renderHeartBtn(productId, isFav) {
        const btn = document.createElement('button');
        btn.className = 'btn-fav';             // Classe CSS du bouton
        btn.dataset.favBtn = productId;        // Stocke l'ID pour la délégation d'événements
        btn.setAttribute('aria-label',
            (isFav ? 'Retirer des favoris' : 'Ajouter aux favoris')); // Label accessible
        btn.innerHTML = heartSVG(isFav);       // Injecte le SVG cœur (plein ou vide)
        return btn;
    }

    // Génère le SVG d'un cœur selon l'état (plein = favori, vide = non favori)
    function heartSVG(filled) {
        return `<svg viewBox="0 0 24 24" width="18" height="18"
                     fill="${filled ? '#ef4444' : 'none'}"
                     stroke="${filled ? '#ef4444' : 'currentColor'}"
                     stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
                     aria-hidden="true">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06
                             a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78
                             1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>`;
        // fill rouge si favori, transparent sinon
        // stroke rouge si favori, couleur du thème sinon
    }

    // Met à jour visuellement un bouton cœur existant
    function updateHeartBtn(btn, isFav) {
        btn.innerHTML = heartSVG(isFav); // Remplace le SVG
        btn.setAttribute('aria-label',
            isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'); // Met à jour le label
    }

    // ============================================
    // DÉLÉGATION GLOBALE - Gestion des clics sur les boutons cœur
    // Une seule écoute sur le document gère tous les boutons,
    // même ceux ajoutés dynamiquement après le chargement
    // ============================================

    document.addEventListener('click', function (e) {
        const btn = e.target.closest('[data-fav-btn]'); // Cherche le bouton le plus proche avec data-fav-btn
        if (!btn) return; // Clic en dehors d'un bouton favori : on ignore

        e.preventDefault();  // Empêche tout comportement par défaut (lien, form...)
        e.stopPropagation(); // Empêche la propagation vers les parents (ex: lien vers la fiche produit)

        const id    = parseInt(btn.dataset.favBtn); // Récupère l'ID du produit
        const added = toggle(id); // Ajoute ou retire des favoris, retourne true si ajouté

        updateHeartBtn(btn, added); // Met à jour visuellement le bouton

        // Si on est sur la page favoris et qu'on vient de désaimer un produit
        if (document.querySelector('.favoris-grid')) {
            if (!added) removeCardFromGrid(id); // Retire la card de la grille
        }

        // Affiche le toast de notification
        showToast(added ? 'Ajouté aux favoris' : 'Retiré des favoris');
    });

    // ============================================
    // PAGE FAVORIS - Affichage de la grille des produits aimés
    // ============================================

    function initFavorisPage() {
        const grid     = document.getElementById('favoris-grid');     // Grille des produits favoris
        const empty    = document.getElementById('favoris-empty');    // Message "aucun favori"
        const label    = document.getElementById('favoris-count-label'); // Compteur affiché
        const clearBtn = document.getElementById('btn-clear-all');   // Bouton "Tout supprimer"
        if (!grid) return; // Pas sur la page favoris : on arrête

        // ── Rendu de la grille ────────────────────────────────────

        function render() {
            const ids      = getAll(); // Récupère tous les IDs favoris
            const db       = window.PearTechDB; // Base de données des produits
            // Convertit les IDs en objets produits (filtre les IDs sans produit correspondant)
            const products = ids
                .map(id => db ? db.getProductById(id) : null)
                .filter(Boolean); // Retire les null

            const n = products.length; // Nombre de produits favoris
            // Met à jour le label : "X produit(s) en favori"
            if (label) label.textContent = n === 0
                ? 'Aucun produit favori'
                : `${n} produit${n > 1 ? 's' : ''} en favori`;

            if (n === 0) { // Aucun favori
                grid.innerHTML = '';                        // Vide la grille
                if (empty)    empty.hidden  = false;        // Affiche le message "vide"
                if (clearBtn) clearBtn.style.display = 'none'; // Cache le bouton supprimer tout
                return;
            }

            if (empty)    empty.hidden  = true;             // Cache le message "vide"
            if (clearBtn) clearBtn.style.display = '';      // Affiche le bouton supprimer tout

            grid.innerHTML = products.map(p => buildCard(p)).join(''); // Génère et injecte toutes les cards

            // Attache les événements "Ajouter au panier" sur les boutons
            grid.querySelectorAll('.btn-add-cart').forEach(btn => {
                btn.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    addToCart(parseInt(this.dataset.id), this); // Ajoute au panier avec feedback visuel
                });
            });
        }

        // ── Suppression animée d'une card ─────────────────────────

        function removeCard(id) {
            const card = grid.querySelector(`[data-product-id="${id}"]`); // Trouve la card par ID
            if (!card) return;
            // Animation de disparition
            card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            card.style.opacity    = '0';           // Fade out
            card.style.transform  = 'scale(0.95)'; // Légère réduction
            setTimeout(() => {
                card.remove(); // Supprime la card du DOM après l'animation
                render();      // Réévalue l'état de la page (vide ou non)
            }, 300); // Attend la fin de l'animation (300ms)
        }

        window._removeFavCard = removeCard; // Expose pour la délégation globale

        // ── Bouton "Tout supprimer" ───────────────────────────────

        if (clearBtn) {
            clearBtn.addEventListener('click', function () {
                if (!confirm('Supprimer tous vos favoris ?')) return; // Demande confirmation
                clear();  // Vide les favoris
                render(); // Met à jour l'affichage
            });
        }

        // ── Attente du chargement de data.js ─────────────────────
        // PearTechDB peut ne pas être encore disponible si data.js charge lentement

        if (window.PearTechDB) {
            render(); // Disponible immédiatement
        } else {
            let attempts = 0; // Compteur de tentatives
            const t = setInterval(() => {
                attempts++;
                if (window.PearTechDB) { clearInterval(t); render(); } // Succès : on lance le rendu
                else if (attempts > 50) { clearInterval(t); }          // Abandon après 5 secondes (50 × 100ms)
            }, 100); // Vérifie toutes les 100ms
        }
    }

    // ── Construction HTML d'une card produit ─────────────────────

    function buildCard(product) {
        const price    = product.basePrice; // Prix actuel
        const oldPrice = (product.oldPrice && product.oldPrice > price) ? product.oldPrice : null; // Ancien prix si supérieur
        const discount = oldPrice ? Math.round((1 - price / oldPrice) * 100) : 0; // Pourcentage de réduction

        // Badge (Nouveau / -X% / Meilleure vente / rien)
        const badge = product.isNew
            ? '<span class="product-badge badge-new">Nouveau</span>'
            : discount > 0
                ? `<span class="product-badge badge-promo">-${discount}%</span>`
                : product.isBestSeller
                    ? '<span class="product-badge badge-bestseller">Meilleure vente</span>'
                    : '';

        // Alerte stock bas
        const stockHtml = product.stock <= 3
            ? `<span class="stock-alert">Plus que ${product.stock} en stock !</span>`
            : product.stock <= 10
                ? '<span class="stock-low">Stock limité</span>'
                : '';

        // Texte des spécifications (processeur · RAM · stockage)
        const specsText = [product.specs.processor, product.specs.ram, product.specs.storage]
            .filter(Boolean).join(' · ')
            || Object.values(product.specs).slice(0, 2).join(' · ')
            || '';

        // Formatage des prix en français
        const priceFmt    = price.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €';
        const oldPriceFmt = oldPrice
            ? `<span class="product-old-price">${oldPrice.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>`
            : '';

        // Génération des étoiles (pleines, demi, vides)
        const rating    = product.rating || 0;
        const fullStars = Math.floor(rating);              // Partie entière = étoiles pleines
        const hasHalf   = (rating % 1) >= 0.5;            // Reste >= 0.5 = demi-étoile
        const emptyStars= 5 - fullStars - (hasHalf ? 1 : 0); // Étoiles restantes = vides
        const stars     = '★'.repeat(fullStars)
                        + (hasHalf ? '½' : '')
                        + '<span style="opacity:0.25">' + '★'.repeat(emptyStars) + '</span>';

        // Image principale avec fallback par catégorie
        const imgSrc  = product.images[0] || FALLBACKS[product.categoryId] || '';
        const fallback = FALLBACKS[product.categoryId] || '';

        // Retourne le HTML complet de la card
        return `
        <article class="product-card" aria-label="${product.name}" data-product-id="${product.id}">
            <!-- Bouton de suppression des favoris (croix rouge) -->
            <button class="btn-remove-fav" data-fav-btn="${product.id}"
                    aria-label="Retirer ${product.name} des favoris">
                <span class="material-symbols-outlined" aria-hidden="true">close</span>
            </button>
            <!-- Image avec lien vers la fiche produit -->
            <a href="page_produit.html?id=${product.id}" class="product-image"
               aria-label="Voir la fiche de ${product.name}">
                <img src="${imgSrc}" alt="${product.name}" loading="lazy"
                     data-fallback="${fallback}"
                     onerror="this.onerror=null;this.src=this.dataset.fallback||'';">
                ${badge}${stockHtml}
            </a>
            <!-- Informations du produit -->
            <div class="product-info">
                <h2 class="product-name">${product.name}</h2>
                ${specsText ? `<p class="product-specs">${specsText}</p>` : ''}
                <div class="product-rating"
                     aria-label="Note ${product.rating || 0} sur 5, ${product.reviews || 0} avis">
                    <span class="stars" aria-hidden="true">${stars}</span>
                    <span class="rating-count">${rating.toFixed(1)} · ${product.reviews || 0} avis</span>
                </div>
                <div class="product-footer">
                    <div class="product-price-block">
                        <span class="product-price">${priceFmt}</span>
                        ${oldPriceFmt}
                    </div>
                    <div class="product-actions">
                        <!-- Bouton ajout au panier -->
                        <button class="btn-add-cart" data-id="${product.id}"
                                aria-label="Ajouter ${product.name} au panier">
                            <span class="material-symbols-outlined" aria-hidden="true">shopping_cart</span>
                        </button>
                        <!-- Cœur plein car déjà en favori -->
                        <button class="btn-fav" data-fav-btn="${product.id}"
                                aria-label="Retirer ${product.name} des favoris">
                            <svg viewBox="0 0 24 24" width="18" height="18"
                                 fill="#ef4444" stroke="#ef4444"
                                 stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
                                 aria-hidden="true">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06
                                         a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78
                                         1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <a href="page_produit.html?id=${product.id}" class="btn-view-product">
                    Voir le produit
                </a>
            </div>
        </article>`;
    }

    // Retire une card de la grille favoris si on est sur la page favoris
    function removeCardFromGrid(id) {
        if (typeof window._removeFavCard === 'function') {
            window._removeFavCard(id); // Appelle la fonction exposée par initFavorisPage
        }
    }

    // ============================================
    // AJOUT AU PANIER depuis la page favoris
    // ============================================

    function addToCart(productId, btn) {
        const db      = window.PearTechDB;
        const product = db ? db.getProductById(productId) : null;
        if (!product) return; // Produit introuvable

        if (window.PearTechCart) { // Si le module panier est disponible
            window.PearTechCart.add({ // Ajoute via l'API du panier
                id:       product.id,
                name:     product.name,
                basePrice:product.basePrice,
                price:    product.basePrice,
                image:    product.images[0] || '',
                specs:    [product.specs.processor, product.specs.ram, product.specs.storage]
                              .filter(Boolean).join(' – '),
                quantity: 1 // On ajoute 1 unité
            });
        }

        // ── Feedback visuel sur le bouton ──────────────────────
        const orig = btn.innerHTML; // Sauvegarde l'icône panier originale
        // Remplace par une coche verte pendant 1.6 secondes
        btn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';
        btn.disabled  = true; // Désactive temporairement pour éviter les double-clics
        setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; }, 1600); // Restaure après 1.6s

        showToast('Produit ajouté au panier');
    }

    // ============================================
    // TOAST DE NOTIFICATION
    // ============================================

    function showToast(msg) {
        document.querySelectorAll('.fav-toast').forEach(t => t.remove()); // Supprime les toasts précédents
        const toast = document.createElement('div');
        toast.className = 'fav-toast'; // Classe CSS pour le style et l'animation
        toast.innerHTML = `<span class="material-symbols-outlined">favorite</span>${msg}`; // Icône + message
        document.body.appendChild(toast); // Ajoute le toast dans le body
        setTimeout(() => { // Commence la disparition après 2.5s
            toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            toast.style.opacity    = '0';            // Fade out
            toast.style.transform  = 'translateY(10px)'; // Glisse vers le bas
            setTimeout(() => toast.remove(), 300);   // Supprime du DOM après la fin de l'animation
        }, 2500);
    }

    // ============================================
    // EXPOSITION DE L'API PUBLIQUE
    // Permet aux autres modules d'utiliser les favoris
    // ============================================

    window.Favoris = {
        isFavori,      // Vérifie si un produit est en favori
        toggle,        // Ajoute/retire un favori
        getAll,        // Retourne tous les IDs favoris
        clear,         // Vide tous les favoris
        updateHeartBtn,// Met à jour visuellement un bouton cœur
        pushAllToServer // Pousse les favoris locaux vers le serveur (après connexion)
    };

    // ── Initialisation au chargement ──────────────────────────────

    document.addEventListener('DOMContentLoaded', function () {
        updateAllBadges(); // Synchronise les badges du header avec localStorage
        initFavorisPage(); // Active la logique de la page favoris si on y est
    });

})(); // Fin de l'IIFE