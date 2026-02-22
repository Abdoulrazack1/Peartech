// ============================================
// catalogue.js – Page catalogue dynamique
// Gère : chargement des produits depuis PearTechDB,
// filtrage multi-critères (sous-catégorie, prix,
// marque, caractéristiques), tri, pagination,
// vues grille/liste et tags de filtres actifs
// ============================================

(function () {
    'use strict'; // Mode strict : détecte les erreurs silencieuses

    // ════════════════════════════════════════════════════════════════
    // ÉTAT GLOBAL
    // Variables partagées par toutes les fonctions du module
    // ════════════════════════════════════════════════════════════════

    let currentCategory   = null;      // Objet catégorie en cours (ex: { name: 'Apple', slug: 'apple', ... })
    let allProducts       = [];        // Tous les produits de la catégorie (avant tout filtre)
    let filteredProducts  = [];        // Produits après application des filtres et du tri
    let displayedProducts = [];        // Produits actuellement affichés sur la page courante
    let currentPage       = 1;         // Numéro de la page en cours (commence à 1)
    const PRODUCTS_PER_PAGE = 12;      // Nombre de produits affichés par page (constante non modifiable)
    let sortBy   = 'relevance';        // Critère de tri actif : 'relevance', 'price-asc', 'price-desc', 'rating', 'new'
    let viewMode = 'grid';             // Mode d'affichage : 'grid' (grille) ou 'list' (liste)

    // Objet contenant tous les filtres actifs
    let filters  = {
        subcategories: [],             // Tableau des sous-catégories cochées (ex: ['iPhone', 'iPad'])
        priceMin:      0,              // Prix minimum sélectionné (slider)
        priceMax:      Infinity,       // Prix maximum sélectionné (slider)
        brands:        [],             // Tableau des marques cochées (ex: ['Apple', 'Samsung'])
        features:      []              // Tableau des caractéristiques cochées (ex: ['Compatible 5G'])
    };

    // ════════════════════════════════════════════════════════════════
    // RÉFÉRENCES DOM
    // Déclarées ici pour être accessibles dans toutes les fonctions,
    // initialisées dans DOMContentLoaded
    // ════════════════════════════════════════════════════════════════

    let categoryTitle,       // H1 : titre de la catégorie
        categoryDescription, // Paragraphe : description de la catégorie
        resultsCount,        // Span : "X résultats"
        productsGrid,        // Div : grille des cards produit
        paginationDiv,       // Div : boutons de pagination
        resetFiltersBtn,     // Bouton : réinitialiser tous les filtres
        sortSelect,          // Select : critère de tri
        viewBtns,            // NodeList : boutons grille/liste
        priceMinSlider,      // Input range : prix minimum
        priceMaxSlider,      // Input range : prix maximum
        priceMinDisplay,     // Span : affichage textuel du prix min
        priceMaxDisplay,     // Span : affichage textuel du prix max
        breadcrumb;          // Nav : fil d'Ariane

    // ════════════════════════════════════════════════════════════════
    // UTILITAIRES : MARQUE ET CARACTÉRISTIQUES
    // ════════════════════════════════════════════════════════════════

    // Table de correspondance : tag produit → nom de marque lisible
    // Nécessaire car les tags sont en minuscules (ex: 'iphone') mais on affiche 'Apple'
    const BRAND_MAP = {
        'apple':    'Apple',   'iphone':   'Apple',  'ipad': 'Apple', // Produits Apple
        'samsung':  'Samsung',                                          // Produits Samsung
        'google':   'Google',  'pixel':    'Google',                   // Produits Google
        'xiaomi':   'Xiaomi',                                           // Produits Xiaomi
        'oneplus':  'OnePlus',                                          // Produits OnePlus
        'amazon':   'Amazon',  'fire':     'Amazon',                   // Produits Amazon
        'fitbit':   'Fitbit',                                           // Montres Fitbit
        'garmin':   'Garmin',                                           // Montres/GPS Garmin
        'motorola': 'Motorola',                                         // Téléphones Motorola
        'oppo':     'Oppo',                                             // Téléphones Oppo
        'sony':     'Sony',                                             // Produits Sony
        'huawei':   'Huawei'                                            // Produits Huawei
    };

    // Détermine la marque d'un produit à partir de ses tags
    function getBrand(product) {
        for (const tag of product.tags) { // Parcourt chaque tag du produit
            const b = BRAND_MAP[tag.toLowerCase()]; // Cherche le tag (en minuscules) dans la table
            if (b) return b; // Retourne la marque dès qu'on la trouve
        }
        return product.name.split(' ')[0]; // Fallback : prend le premier mot du nom (ex: "Samsung Galaxy" → "Samsung")
    }

    // Vérifie si un produit est compatible 5G en inspectant ses options
    function has5G(product) {
        if (!product.options) return false; // Pas d'options définies : pas de 5G
        // Object.values donne un tableau de tableaux → flat() l'aplatit en un seul tableau
        // some() retourne true dès qu'une option contient "5G" dans son label
        return Object.values(product.options).flat()
            .some(o => o.label && o.label.includes('5G'));
    }

    // Vérifie si un produit intègre le GPS en cherchant dans toutes ses specs et options
    function hasGPS(product) {
        // JSON.stringify convertit l'objet en chaîne pour faciliter la recherche de texte
        // On cherche "gps" (minuscules) dans les specs ET les options combinées
        const haystack = JSON.stringify(product.specs || {}).toLowerCase()
                       + JSON.stringify(product.options || {}).toLowerCase();
        return haystack.includes('gps'); // True si "gps" est trouvé quelque part
    }

    // ════════════════════════════════════════════════════════════════
    // INITIALISATION - DOMContentLoaded
    // Point d'entrée : tout commence ici au chargement de la page
    // ════════════════════════════════════════════════════════════════

    document.addEventListener('DOMContentLoaded', function () {

        // ── Récupération des éléments du DOM ─────────────────────
        // On fait ça en une seule fois pour éviter des querySelector répétés

        categoryTitle       = document.getElementById('category-title');
        categoryDescription = document.getElementById('category-description');
        resultsCount        = document.getElementById('results-count');
        productsGrid        = document.getElementById('products-grid');
        paginationDiv       = document.getElementById('pagination');
        resetFiltersBtn     = document.getElementById('reset-filters');
        sortSelect          = document.getElementById('sort');
        viewBtns            = document.querySelectorAll('.view-btn'); // Plusieurs boutons
        priceMinSlider      = document.getElementById('price-min');
        priceMaxSlider      = document.getElementById('price-max');
        priceMinDisplay     = document.getElementById('price-min-display');
        priceMaxDisplay     = document.getElementById('price-max-display');
        breadcrumb          = document.getElementById('breadcrumb');

        // ── Vérification que PearTechDB est chargé ────────────────
        // data.js doit être chargé avant catalogue.js dans le HTML

        if (!window.PearTechDB) {
            console.error('[catalogue.js] window.PearTechDB non chargé'); // Erreur critique
            if (productsGrid) productsGrid.innerHTML = '<p class="no-results">Impossible de charger les produits.</p>';
            return; // Arrête l'exécution : impossible d'aller plus loin sans les données
        }

        // ── Lecture de la catégorie depuis l'URL ──────────────────
        // Ex: page_catalogue.html?categorie=apple → slug = "apple"

        const urlParams    = new URLSearchParams(window.location.search); // Parse les paramètres GET
        const categorySlug = urlParams.get('categorie'); // Récupère la valeur du paramètre "categorie"

        if (categorySlug) {
            // Une catégorie spécifique est demandée
            const cat = PearTechDB.getCategoryBySlug(categorySlug); // Cherche la catégorie dans la DB
            if (cat) {
                currentCategory = cat; // Stocke la catégorie trouvée
                allProducts     = PearTechDB.getProductsByCategory(cat.slug); // Charge les produits de cette catégorie
            } else {
                // Catégorie inconnue (slug invalide) : redirige vers l'accueil pour éviter une page vide
                window.location.href = 'page_accueil.html';
                return;
            }
        } else {
            // Pas de paramètre = page "Tous les produits"
            currentCategory = {
                name:          'Tous les produits',
                description:   'Découvrez toute notre sélection de smartphones, tablettes, montres et accessoires high-tech.',
                slug:          'tous',
                subcategories: [] // Pas de sous-catégories prédéfinies pour "tous"
            };
            allProducts = PearTechDB.products; // Tous les produits de la base
        }

        // ── Mise à jour des textes d'en-tête ──────────────────────

        if (categoryTitle)       categoryTitle.textContent       = currentCategory.name;         // Titre H1
        if (categoryDescription) categoryDescription.textContent = currentCategory.description || ''; // Description

        // ── Construction du fil d'Ariane ──────────────────────────
        // Accueil > Toutes les catégories > [Catégorie courante]

        if (breadcrumb) {
            breadcrumb.innerHTML = `
                <a href="page_accueil.html">Accueil</a>
                <span aria-hidden="true">/</span>
                <a href="page_catalogue.html">Toutes les catégories</a>
                <span aria-hidden="true">/</span>
                <!-- aria-current="page" indique la page active aux lecteurs d'écran -->
                <span id="current-category-name" aria-current="page">${currentCategory.name}</span>`;
        }

        initFilters();  // Construit les checkboxes et sliders dans la sidebar
        applyFilters(); // Applique le filtrage initial (sans filtre = affiche tout)

        // ── Événements de la toolbar ──────────────────────────────

        if (resetFiltersBtn) resetFiltersBtn.addEventListener('click', resetFilters); // Bouton "Réinitialiser"

        // Changement du critère de tri
        if (sortSelect) sortSelect.addEventListener('change', function () {
            sortBy = this.value; // Stocke le nouveau critère ('price-asc', 'rating'...)
            applyFilters();      // Relance le filtrage+tri avec le nouveau critère
        });

        // Basculement entre vue grille et vue liste
        viewBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                // Désactive tous les boutons de vue
                viewBtns.forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-pressed', 'false'); // Accessibilité : état du bouton toggle
                });
                this.classList.add('active');              // Active le bouton cliqué
                this.setAttribute('aria-pressed', 'true'); // Indique aux lecteurs d'écran qu'il est pressé
                viewMode = this.dataset.view;              // Récupère 'grid' ou 'list' depuis data-view
                productsGrid.classList.toggle('list-view', viewMode === 'list'); // Ajoute/retire la classe CSS
                renderProducts(displayedProducts); // Re-rendu des cards dans le nouveau mode
            });
        });

        // Slider prix minimum : empêche de dépasser le max et met à jour le filtre
        if (priceMinSlider) priceMinSlider.addEventListener('input', function () {
            if (parseInt(this.value) > parseInt(priceMaxSlider.value)) {
                this.value = priceMaxSlider.value; // Bloque le min si > max
            }
            priceMinDisplay.textContent = parseInt(this.value).toLocaleString('fr-FR') + ' €'; // Met à jour l'affichage
            filters.priceMin = parseInt(this.value); // Met à jour le filtre en mémoire
            applyFilters(); // Relance le filtrage avec le nouveau prix min
        });

        // Slider prix maximum : empêche de descendre sous le min et met à jour le filtre
        if (priceMaxSlider) priceMaxSlider.addEventListener('input', function () {
            if (parseInt(this.value) < parseInt(priceMinSlider.value)) {
                this.value = priceMinSlider.value; // Bloque le max si < min
            }
            priceMaxDisplay.textContent = parseInt(this.value).toLocaleString('fr-FR') + ' €'; // Met à jour l'affichage
            filters.priceMax = parseInt(this.value); // Met à jour le filtre en mémoire
            applyFilters(); // Relance le filtrage avec le nouveau prix max
        });
    });

    // ════════════════════════════════════════════════════════════════
    // CONSTRUCTION DES FILTRES SIDEBAR
    // Génère dynamiquement les checkboxes à partir des produits réels
    // pour que les filtres reflètent toujours le catalogue actuel
    // ════════════════════════════════════════════════════════════════

    function initFilters() {

        // ── Sous-catégories ───────────────────────────────────────
        // Map : sous-catégorie → nombre de produits correspondants
        // Utilisée pour afficher le compteur "(X)" à côté de chaque checkbox

        const subcatMap = new Map(); // Map clé = nom, valeur = nombre de produits

        if (currentCategory.subcategories && currentCategory.subcategories.length) {
            // Catégorie spécifique : utilise les sous-catégories définies dans la DB
            currentCategory.subcategories.forEach(sub => {
                const subLower = sub.toLowerCase(); // Normalise en minuscules pour la comparaison
                const count = allProducts.filter(p =>
                    p.name.toLowerCase().includes(subLower) || // Le nom du produit contient la sous-cat
                    p.tags.some(t => subLower.includes(t) || t.includes(subLower)) // Ou un tag correspond
                ).length;
                if (count > 0) subcatMap.set(sub, count); // N'ajoute que si au moins 1 produit correspond
            });
        } else {
            // Page "tous" : regroupe par nom de catégorie principale (Apple, Android, Montres...)
            PearTechDB.categories.forEach(cat => {
                const count = allProducts.filter(p => p.categoryId === cat.id).length; // Produits de cette catégorie
                if (count > 0) subcatMap.set(cat.name, count); // Ajoute avec le compteur
            });
        }

        // Injection des checkboxes de sous-catégories dans le DOM
        const subcatDiv = document.getElementById('subcategories-filter');
        if (subcatDiv) {
            subcatDiv.innerHTML = ''; // Vide le conteneur avant de le remplir
            subcatMap.forEach((count, label) => { // Pour chaque sous-catégorie
                const el = document.createElement('label');
                el.className = 'checkbox-item'; // Classe CSS pour le style aligné
                el.innerHTML = `<input type="checkbox" class="subcategory-checkbox" value="${label}">
                    <span>${label}</span><span class="checkbox-count">${count}</span>`;
                subcatDiv.appendChild(el); // Ajoute la checkbox dans le DOM
            });

            // Écoute les changements sur les checkboxes de sous-catégories
            subcatDiv.querySelectorAll('.subcategory-checkbox').forEach(cb =>
                cb.addEventListener('change', () => {
                    // Collecte toutes les checkboxes sous-catégories cochées → tableau de valeurs
                    filters.subcategories = [...document.querySelectorAll('.subcategory-checkbox:checked')].map(c => c.value);
                    applyFilters(); // Relance le filtrage
                })
            );
        }

        // ── Marques ────────────────────────────────────────────────
        // Construit la liste des marques présentes dans les produits actuels

        const brandsMap = new Map(); // Map : marque → nombre de produits
        allProducts.forEach(p => {
            const b = getBrand(p); // Détermine la marque du produit
            brandsMap.set(b, (brandsMap.get(b) || 0) + 1); // Incrémente le compteur (0 si première fois)
        });

        // Injection des checkboxes de marques, triées par nombre de produits décroissant
        const brandsDiv = document.getElementById('brands-filter');
        if (brandsDiv) {
            brandsDiv.innerHTML = ''; // Vide avant de remplir
            // [...brandsMap.entries()] convertit la Map en tableau de [clé, valeur]
            // .sort((a,b) => b[1]-a[1]) trie par valeur (compte) décroissant (plus de produits en premier)
            [...brandsMap.entries()].sort((a,b) => b[1]-a[1]).forEach(([label, count]) => {
                const el = document.createElement('label');
                el.className = 'checkbox-item';
                el.innerHTML = `<input type="checkbox" class="brand-checkbox" value="${label}">
                    <span>${label}</span><span class="checkbox-count">${count}</span>`;
                brandsDiv.appendChild(el);
            });
            // Écoute les changements sur les checkboxes de marques
            brandsDiv.querySelectorAll('.brand-checkbox').forEach(cb =>
                cb.addEventListener('change', () => {
                    filters.brands = [...document.querySelectorAll('.brand-checkbox:checked')].map(c => c.value);
                    applyFilters();
                })
            );
        }

        // ── Caractéristiques ────────────────────────────────────────
        // Génère dynamiquement les filtres selon les caractéristiques réelles des produits
        // (pas de liste en dur : si aucun produit 5G, le filtre 5G n'apparaît pas)

        const featSet = new Set(); // Set = ensemble sans doublons (chaque feature une seule fois)
        allProducts.forEach(p => {
            if (p.specs.os) { // Si le produit a un OS défini
                const os = p.specs.os.toLowerCase(); // Normalise en minuscules
                if (os.includes('ios') || os.includes('ipados')) featSet.add('iOS / iPadOS'); // Produit Apple
                else if (os.includes('android'))                  featSet.add('Android');      // Produit Android
                else if (os.includes('fire'))                     featSet.add('Fire OS');       // Tablette Amazon Fire
            }
            if (has5G(p))  featSet.add('Compatible 5G');   // Ajoute "5G" si le produit le supporte
            if (hasGPS(p)) featSet.add('GPS intégré');     // Ajoute "GPS" si présent dans les specs/options
            if (p.specs.ram) { // Si la RAM est renseignée
                const r = parseInt(p.specs.ram); // Convertit en entier (ex: "8 Go" → 8)
                if (r <= 4)       featSet.add('RAM ≤ 4 Go');    // Entrée de gamme
                else if (r <= 8)  featSet.add('RAM 6–8 Go');    // Milieu de gamme
                else if (r <= 12) featSet.add('RAM 12 Go');     // Haut de gamme
                else              featSet.add('RAM 16 Go et +'); // Ultra haut de gamme
            }
            if (p.oldPrice && p.oldPrice > p.basePrice) featSet.add('En promotion');  // En promo si ancien prix > prix actuel
            if (p.isNew)        featSet.add('Nouveautés');        // Marqué comme nouveau
            if (p.isBestSeller) featSet.add('Meilleures ventes'); // Marqué comme bestseller
        });

        // Injection des checkboxes de caractéristiques
        const featDiv = document.getElementById('features-filter');
        if (featDiv) {
            featDiv.innerHTML = ''; // Vide avant de remplir
            featSet.forEach(feat => { // Pour chaque caractéristique trouvée
                const el = document.createElement('label');
                el.className = 'checkbox-item';
                // Pas de compteur ici : plus difficile à calculer, pas indispensable UX
                el.innerHTML = `<input type="checkbox" class="feature-checkbox" value="${feat}">
                    <span>${feat}</span>`;
                featDiv.appendChild(el);
            });
            featDiv.querySelectorAll('.feature-checkbox').forEach(cb =>
                cb.addEventListener('change', () => {
                    filters.features = [...document.querySelectorAll('.feature-checkbox:checked')].map(c => c.value);
                    applyFilters();
                })
            );
        }

        // ── Sliders de prix ────────────────────────────────────────
        // Initialise les sliders avec les prix min et max réels du catalogue

        const prices   = allProducts.map(p => p.basePrice); // Tableau de tous les prix
        const minPrice = Math.floor(Math.min(...prices));    // Prix le plus bas (arrondi à l'inférieur)
        const maxPrice = Math.ceil(Math.max(...prices));     // Prix le plus haut (arrondi au supérieur)

        // Configure les deux sliders : plage, valeur initiale et pas
        if (priceMinSlider) { priceMinSlider.min = minPrice; priceMinSlider.max = maxPrice; priceMinSlider.value = minPrice; priceMinSlider.step = 10; }
        if (priceMaxSlider) { priceMaxSlider.min = minPrice; priceMaxSlider.max = maxPrice; priceMaxSlider.value = maxPrice; priceMaxSlider.step = 10; }

        // Affiche les valeurs textuelles initiales
        if (priceMinDisplay) priceMinDisplay.textContent = minPrice.toLocaleString('fr-FR') + ' €';
        if (priceMaxDisplay) priceMaxDisplay.textContent = maxPrice.toLocaleString('fr-FR') + ' €';

        // Initialise les filtres de prix avec les vraies valeurs min/max
        filters.priceMin = minPrice;
        filters.priceMax = maxPrice;
    }

    // ════════════════════════════════════════════════════════════════
    // MATCHING DES SOUS-CATÉGORIES
    // Prédicats explicites pour éviter les faux positifs
    // (ex: "apple watch" contient "watch" ce qui matchait Samsung Galaxy Watch)
    // ════════════════════════════════════════════════════════════════

    const SUBCAT_MATCHERS = {
        // ── Apple ──
        'iPhone':              p => p.tags.includes('iphone'),                                // Produits avec le tag "iphone"
        'iPad':                p => p.tags.includes('ipad'),                                  // Produits avec le tag "ipad"
        'Apple Watch':         p => p.categoryId === 'cat_wearables' && p.tags.includes('apple'), // Montres Apple uniquement
        'Accessoires':         p => p.tags.some(t => ['accessoire','accessoires'].includes(t)), // Tag accessoire
        // ── Android ──
        'Samsung':             p => p.tags.includes('samsung') && !p.tags.includes('tablette') && !p.tags.some(t => ['watch','montre'].includes(t)), // Samsung mais pas tablette ni montre
        'Google Pixel':        p => p.tags.includes('google') || p.tags.includes('pixel'),  // Google ou Pixel
        'Xiaomi':              p => p.tags.includes('xiaomi'),                               // Marque Xiaomi
        'OnePlus':             p => p.tags.includes('oneplus'),                              // Marque OnePlus
        // ── Wearables ──
        'Samsung Galaxy Watch':p => p.tags.includes('samsung') && p.tags.some(t => ['watch','montre'].includes(t)), // Samsung + watch
        'Fitbit':              p => p.tags.includes('fitbit'),                               // Marque Fitbit
        'Garmin':              p => p.tags.includes('garmin'),                               // Marque Garmin
        // ── Tablettes ──
        'Samsung Galaxy Tab':  p => p.tags.includes('samsung') && p.tags.includes('tablette'), // Samsung + tablette
        'Amazon Fire':         p => p.tags.includes('amazon') || p.tags.includes('fire'),   // Amazon ou Fire OS
        // ── Fallback universel ──
        'Autres':              p => true, // Accepte tout : utilisé si aucun autre matcher ne correspond
    };

    // Vérifie si un produit correspond à la liste de sous-catégories filtrées
    function matchesSubcategory(product, subs) {
        if (!subs.length) return true; // Aucune sous-catégorie cochée : tous les produits passent

        return subs.some(sub => { // Au moins une sous-catégorie cochée doit correspondre (OR logique)
            // 1. Utilise le matcher explicite si disponible (plus précis)
            const matcher = SUBCAT_MATCHERS[sub];
            if (matcher) return matcher(product); // Retourne le résultat du prédicat
            // 2. Fallback : cherche la catégorie par son nom (pour la page "tous")
            const cat = PearTechDB.categories.find(c => c.name === sub);
            if (cat) return product.categoryId === cat.id; // Vérifie l'ID de catégorie
            // 3. Fallback final : cherche le nom dans le nom du produit
            return product.name.toLowerCase().includes(sub.toLowerCase());
        });
    }

    // Vérifie si un produit possède une caractéristique spécifique
    function matchesFeature(product, feat) {
        switch (feat) {
            case 'iOS / iPadOS':    return product.specs.os && /ios|ipados/i.test(product.specs.os); // Regex insensible à la casse
            case 'Android':         return product.specs.os && /android/i.test(product.specs.os);
            case 'Fire OS':         return product.specs.os && /fire/i.test(product.specs.os);
            case 'Compatible 5G':   return has5G(product);  // Délègue à la fonction utilitaire
            case 'GPS intégré':     return hasGPS(product); // Délègue à la fonction utilitaire
            case 'RAM ≤ 4 Go':      return product.specs.ram && parseInt(product.specs.ram) <= 4;  // RAM faible
            case 'RAM 6–8 Go':      return product.specs.ram && parseInt(product.specs.ram) >= 6 && parseInt(product.specs.ram) <= 8; // RAM moyenne
            case 'RAM 12 Go':       return product.specs.ram && parseInt(product.specs.ram) === 12; // RAM haute
            case 'RAM 16 Go et +':  return product.specs.ram && parseInt(product.specs.ram) >= 16; // RAM très haute
            case 'En promotion':    return product.oldPrice && product.oldPrice > product.basePrice; // Prix barré
            case 'Nouveautés':      return product.isNew === true;       // Marqué isNew dans data.js
            case 'Meilleures ventes': return product.isBestSeller === true; // Marqué isBestSeller dans data.js
            default: return true; // Feature inconnue : le produit passe par défaut (ne bloque pas)
        }
    }

    // ════════════════════════════════════════════════════════════════
    // APPLICATION DES FILTRES ET DU TRI
    // Fonction centrale appelée après chaque modification d'un filtre
    // ════════════════════════════════════════════════════════════════

    function applyFilters() {
        // Filtre allProducts selon tous les critères actifs
        filteredProducts = allProducts.filter(p => {
            if (!matchesSubcategory(p, filters.subcategories))            return false; // Sous-cat ne correspond pas
            if (p.basePrice < filters.priceMin || p.basePrice > filters.priceMax) return false; // Hors fourchette de prix
            if (filters.brands.length   && !filters.brands.includes(getBrand(p)))  return false; // Marque non sélectionnée
            // every() : toutes les features sélectionnées doivent correspondre (AND logique)
            if (filters.features.length && !filters.features.every(f => matchesFeature(p, f))) return false;
            return true; // Le produit passe tous les filtres
        });

        // Tri des produits filtrés selon le critère choisi
        switch (sortBy) {
            case 'price-asc':  filteredProducts.sort((a,b) => a.basePrice - b.basePrice);        break; // Prix croissant
            case 'price-desc': filteredProducts.sort((a,b) => b.basePrice - a.basePrice);        break; // Prix décroissant
            case 'rating':     filteredProducts.sort((a,b) => (b.rating||0) - (a.rating||0));   break; // Meilleures notes
            case 'new':        filteredProducts.sort((a,b) => (b.isNew?1:0) - (a.isNew?1:0));   break; // Nouveautés d'abord
            // 'relevance' (défaut) : pas de tri, garde l'ordre de la DB
        }

        // Met à jour le compteur "X résultat(s)"
        if (resultsCount) resultsCount.textContent = filteredProducts.length + ' résultat'
            + (filteredProducts.length !== 1 ? 's' : ''); // Accorde "résultat" avec le nombre

        currentPage = 1;        // Repart toujours à la page 1 après un changement de filtre
        displayCurrentPage();   // Affiche la première page des résultats
        updatePagination();     // Génère les boutons de pagination
        updateActiveFilters();  // Met à jour les tags de filtres actifs
    }

    // Calcule et affiche la tranche de produits de la page courante
    function displayCurrentPage() {
        const start = (currentPage - 1) * PRODUCTS_PER_PAGE; // Index du premier produit de la page
        // slice extrait PRODUCTS_PER_PAGE éléments à partir de start
        displayedProducts = filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
        renderProducts(displayedProducts); // Génère le HTML des cards
    }

    // ════════════════════════════════════════════════════════════════
    // RENDU DES CARDS PRODUIT
    // ════════════════════════════════════════════════════════════════

    function renderProducts(products) {
        if (!productsGrid) return; // Grille absente : on arrête

        if (!products.length) { // Aucun produit après filtrage
            productsGrid.innerHTML = '<p class="no-results">Aucun produit ne correspond à vos critères de recherche.</p>';
            return;
        }

        // Images Unsplash par catégorie en fallback si les images locales sont absentes
        const FALLBACKS = {
            'cat_apple':    'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=400&q=80',
            'cat_android':  'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80',
            'cat_wearables':'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
            'cat_tablets':  'https://images.unsplash.com/photo-1587033411391-5d9e51cce126?w=400&q=80',
        };

        productsGrid.innerHTML = products.map(product => {

            // ── Calcul du badge et des données affichées ──────────

            const price    = product.basePrice; // Prix actuel
            const oldPrice = (product.oldPrice && product.oldPrice > price) ? product.oldPrice : null; // Ancien prix si strictement supérieur
            const discount = oldPrice ? Math.round((1 - price / oldPrice) * 100) : 0; // Réduction en % arrondie

            // Badge : priorité Nouveau > Promo > Bestseller > rien
            const badge = product.isNew
                ? '<span class="product-badge badge-new">Nouveau</span>'
                : discount > 0
                    ? `<span class="product-badge badge-promo">-${discount}%</span>`
                    : product.isBestSeller
                        ? '<span class="product-badge badge-bestseller">Meilleure vente</span>'
                        : '';

            // Alerte stock : rouge ≤ 3, orange ≤ 10, rien au-dessus
            const stockHtml = product.stock <= 3
                ? `<span class="stock-alert">Plus que ${product.stock} en stock !</span>`
                : product.stock <= 10
                    ? '<span class="stock-low">Stock limité</span>'
                    : '';

            // Résumé des spécifications : processeur · RAM · stockage (ou écran en fallback)
            const specsText = [product.specs.processor, product.specs.ram, product.specs.storage]
                .filter(Boolean).join(' · ') // Retire les nulls/undefined et joint avec "·"
                || product.specs.screen      // Fallback : taille d'écran si les 3 premiers sont vides
                || '';

            // Génération des étoiles : ★ pleines + ½ éventuelle + ★ vides atténuées
            const rating    = product.rating || 0;
            const fullStars = Math.floor(rating);               // Ex: 4.3 → 4 étoiles pleines
            const hasHalf   = (rating % 1) >= 0.5;             // 4.5 → demi-étoile
            const emptyStars= 5 - fullStars - (hasHalf ? 1 : 0); // Complète jusqu'à 5 étoiles
            const stars     = '★'.repeat(fullStars)
                            + (hasHalf ? '½' : '')
                            + '<span style="opacity:0.25">' + '★'.repeat(emptyStars) + '</span>';

            // Formatage des prix en français : 1299.99 → "1 299,99 €"
            const priceFmt    = price.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €';
            const oldPriceFmt = oldPrice
                ? `<span class="product-old-price">${oldPrice.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>`
                : '';

            // Vérifie si le produit est déjà en favori pour initialiser le cœur (plein ou vide)
            const isFav = (typeof window.Favoris !== 'undefined') && window.Favoris.isFavori(product.id);

            // ── HTML de la card ────────────────────────────────────

            return `
            <article class="product-card" aria-label="${product.name}">
                <!-- Lien image vers la fiche produit -->
                <a href="page_produit.html?id=${product.id}" class="product-image"
                   aria-label="Voir la fiche de ${product.name}">
                    <!-- onerror : si l'image locale est manquante, utilise le fallback Unsplash -->
                    <img src="${product.images[0] || FALLBACKS[product.categoryId] || ''}"
                         alt="${product.name}" loading="lazy"
                         data-fallback="${FALLBACKS[product.categoryId] || ''}"
                         onerror="this.onerror=null;this.src=this.dataset.fallback||'';">
                    ${badge}${stockHtml}
                </a>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    ${specsText ? `<p class="product-specs">${specsText}</p>` : ''}
                    <!-- aria-label synthétise note et nombre d'avis pour les lecteurs d'écran -->
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
                            <!-- Bouton panier : SVG inline pour éviter une dépendance externe -->
                            <button class="btn-add-cart" data-id="${product.id}"
                                    aria-label="Ajouter ${product.name} au panier">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                            </button>
                            <!-- Bouton favori : cœur plein si isFav, vide sinon -->
                            <button class="btn-fav" data-fav-btn="${product.id}"
                                    aria-label="${isFav ? 'Retirer' : 'Ajouter'} ${product.name} ${isFav ? 'des' : 'aux'} favoris">
                                <svg viewBox="0 0 24 24" width="18" height="18"
                                     fill="${isFav ? '#ef4444' : 'none'}"
                                     stroke="${isFav ? '#ef4444' : 'currentColor'}"
                                     stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
                                     aria-hidden="true">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06
                                             a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78
                                             1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <!-- Lien textuel vers la fiche produit (accessible même sans JS actif) -->
                    <a href="page_produit.html?id=${product.id}" class="btn-view-product">
                        Voir la fiche produit
                    </a>
                </div>
            </article>`;
        }).join(''); // Concatène tous les HTML des cards sans séparateur

        // ── Événements boutons panier (ré-attachés après chaque re-rendu) ──
        // Les événements sont perdus quand on réécrit innerHTML, donc on les réattache
        productsGrid.querySelectorAll('.btn-add-cart').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.stopPropagation(); // Empêche le clic de remonter vers le lien de la card
                addToCart(parseInt(this.dataset.id), this); // Ajoute au panier
            });
        });

        // Note : les favoris sont gérés par délégation globale dans favoris.js
        // (écoute sur document → pas besoin de réattacher ici)
    }

    // ════════════════════════════════════════════════════════════════
    // AJOUT AU PANIER
    // ════════════════════════════════════════════════════════════════

    function addToCart(productId, btn) {
        const product = allProducts.find(p => p.id === productId); // Cherche le produit dans les données
        if (!product) return; // Produit introuvable : on arrête

        const CART_KEY = 'peartech-cart'; // Clé localStorage du panier
        const cart     = JSON.parse(localStorage.getItem(CART_KEY)) || []; // Charge le panier ou tableau vide
        const existing = cart.find(i => i.id === productId); // Vérifie si déjà dans le panier

        if (existing) {
            existing.quantity++; // Déjà présent : incrémente la quantité
        } else {
            cart.push({ // Nouveau produit : ajoute avec toutes les infos nécessaires
                id:       product.id,
                name:     product.name,
                image:    product.images[0] || '', // Première image ou chaîne vide
                price:    product.basePrice,        // Prix actuel
                // Spécifications en une ligne séparée par " - " (filtre les nulls avec filter(Boolean))
                specs:    [product.specs.processor, product.specs.ram, product.specs.storage].filter(Boolean).join(' - '),
                quantity: 1 // Toujours 1 au premier ajout
            });
        }

        localStorage.setItem(CART_KEY, JSON.stringify(cart)); // Sauvegarde le panier mis à jour
        const total = cart.reduce((acc, i) => acc + i.quantity, 0); // Total d'articles toutes lignes
        localStorage.setItem('peartech-cart-count', total); // Sauvegarde le compteur pour le badge

        // Met à jour le badge dans le header
        const badge = document.getElementById('cart-count');
        if (badge) {
            badge.textContent = total;
            badge.style.display = 'flex'; // S'assure que le badge est visible
            badge.setAttribute('aria-label', total + ' article' + (total > 1 ? 's' : '') + ' dans le panier');
        }

        // ── Feedback visuel : remplace l'icône panier par une coche ──
        const orig = btn.innerHTML;
        // SVG coche verte
        btn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';
        btn.disabled  = true; // Désactive pour éviter les double-clics
        setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; }, 1600); // Restaure après 1.6s
    }

    // ════════════════════════════════════════════════════════════════
    // PAGINATION
    // ════════════════════════════════════════════════════════════════

    function updatePagination() {
        if (!paginationDiv) return; // Pas de zone pagination sur cette page

        const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE); // Nombre total de pages (arrondi supérieur)

        if (totalPages <= 1) {
            paginationDiv.innerHTML = ''; // Cache la pagination si une seule page
            return;
        }

        // ── Bouton "Précédent" ────────────────────────────────────
        let html = `<button class="page-btn prev" data-page="${currentPage - 1}"
                             aria-label="Page précédente" ${currentPage === 1 ? 'disabled' : ''}>Précédent</button>`;

        // ── Boutons numérotés avec ellipses ────────────────────────
        // Affiche toujours : page 1, page dernière, et les 2 pages autour de la page courante
        // Ajoute "…" quand il y a un saut dans la numérotation

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                // Ce numéro de page doit être affiché
                html += `<button class="page-btn${i === currentPage ? ' active' : ''}" data-page="${i}"
                                 aria-label="Page ${i}" aria-current="${i === currentPage ? 'page' : 'false'}">${i}</button>`;
            } else if (i === currentPage - 3 || i === currentPage + 3) {
                // Position juste avant/après la fenêtre centrale : affiche "…"
                html += `<span class="page-dots" aria-hidden="true">…</span>`;
            }
            // Les autres numéros sont simplement ignorés (ni bouton ni ellipse)
        }

        // ── Bouton "Suivant" ──────────────────────────────────────
        html += `<button class="page-btn next" data-page="${currentPage + 1}"
                         aria-label="Page suivante" ${currentPage === totalPages ? 'disabled' : ''}>Suivant</button>`;

        paginationDiv.innerHTML = html; // Injecte les boutons

        // Attache les clics sur les boutons non désactivés
        paginationDiv.querySelectorAll('.page-btn:not([disabled])').forEach(btn => {
            btn.addEventListener('click', function () {
                const page = parseInt(this.dataset.page); // Numéro de page cible
                if (!isNaN(page) && page !== currentPage) { // Ignore si même page ou invalide
                    currentPage = page;            // Change la page courante
                    displayCurrentPage();          // Affiche les produits de cette page
                    updatePagination();            // Régénère la pagination (met à jour l'état "active")
                    window.scrollTo({ top: 0, behavior: 'smooth' }); // Remonte en haut de page
                }
            });
        });
    }

    // ════════════════════════════════════════════════════════════════
    // RÉINITIALISATION DES FILTRES
    // ════════════════════════════════════════════════════════════════

    function resetFilters() {
        // Décoche toutes les checkboxes de filtres
        document.querySelectorAll('.subcategory-checkbox, .brand-checkbox, .feature-checkbox')
            .forEach(cb => cb.checked = false); // Décoche chaque checkbox

        // Recalcule les vrais min/max des prix pour les sliders
        const prices   = allProducts.map(p => p.basePrice);
        const minPrice = Math.floor(Math.min(...prices)); // Prix le plus bas
        const maxPrice = Math.ceil(Math.max(...prices));  // Prix le plus haut

        // Remet les sliders à leurs valeurs initiales
        if (priceMinSlider) priceMinSlider.value = minPrice;
        if (priceMaxSlider) priceMaxSlider.value = maxPrice;

        // Remet les affichages textuels des sliders
        if (priceMinDisplay) priceMinDisplay.textContent = minPrice.toLocaleString('fr-FR') + ' €';
        if (priceMaxDisplay) priceMaxDisplay.textContent = maxPrice.toLocaleString('fr-FR') + ' €';

        if (sortSelect) sortSelect.value = 'relevance'; // Remet le tri en "Pertinence"

        // Réinitialise l'objet filtres avec les valeurs par défaut
        filters = { subcategories: [], priceMin: minPrice, priceMax: maxPrice, brands: [], features: [] };
        sortBy  = 'relevance'; // Réinitialise aussi le tri global

        applyFilters(); // Relance avec aucun filtre → affiche tout
    }

    // ════════════════════════════════════════════════════════════════
    // TAGS DES FILTRES ACTIFS
    // Affiche les filtres cochés sous forme de pastilles cliquables
    // pour que l'utilisateur puisse les retirer individuellement
    // ════════════════════════════════════════════════════════════════

    function updateActiveFilters() {
        const activeDiv = document.getElementById('active-filters'); // Zone des tags
        if (!activeDiv) return;

        // Calcule les valeurs par défaut des sliders pour détecter si le filtre prix est actif
        const prices = allProducts.map(p => p.basePrice);
        const defMin = Math.floor(Math.min(...prices)); // Prix min par défaut
        const defMax = Math.ceil(Math.max(...prices));  // Prix max par défaut

        let html = '';
        filters.subcategories.forEach(v => html += tag(v, 'sub',   v)); // Tag par sous-catégorie cochée
        // Tag prix : affiché seulement si différent des valeurs par défaut
        if (filters.priceMin > defMin || filters.priceMax < defMax)
            html += tag(`Prix : ${filters.priceMin.toLocaleString('fr-FR')} € – ${filters.priceMax.toLocaleString('fr-FR')} €`, 'price', null);
        filters.brands.forEach(v   => html += tag(v, 'brand',   v)); // Tag par marque cochée
        filters.features.forEach(v => html += tag(v, 'feature', v)); // Tag par caractéristique cochée

        activeDiv.innerHTML = html; // Injecte les tags dans le DOM

        // Écoute les clics sur les boutons "×" de chaque tag
        activeDiv.querySelectorAll('.remove').forEach(btn => {
            btn.addEventListener('click', function () {
                const type  = this.dataset.filter; // Type du filtre ('sub', 'brand', 'feature', 'price')
                const value = this.dataset.value;  // Valeur du filtre à retirer

                if (type === 'sub') {
                    // Décoche la checkbox correspondante
                    document.querySelectorAll('.subcategory-checkbox').forEach(cb => { if (cb.value === value) cb.checked = false; });
                    filters.subcategories = filters.subcategories.filter(v => v !== value); // Retire de l'état
                } else if (type === 'brand') {
                    document.querySelectorAll('.brand-checkbox').forEach(cb => { if (cb.value === value) cb.checked = false; });
                    filters.brands = filters.brands.filter(v => v !== value);
                } else if (type === 'feature') {
                    document.querySelectorAll('.feature-checkbox').forEach(cb => { if (cb.value === value) cb.checked = false; });
                    filters.features = filters.features.filter(v => v !== value);
                } else if (type === 'price') {
                    // Remet les sliders à leurs valeurs par défaut
                    const prices   = allProducts.map(p => p.basePrice);
                    const minPrice = Math.floor(Math.min(...prices));
                    const maxPrice = Math.ceil(Math.max(...prices));
                    if (priceMinSlider) priceMinSlider.value = minPrice;
                    if (priceMaxSlider) priceMaxSlider.value = maxPrice;
                    if (priceMinDisplay) priceMinDisplay.textContent = minPrice.toLocaleString('fr-FR') + ' €';
                    if (priceMaxDisplay) priceMaxDisplay.textContent = maxPrice.toLocaleString('fr-FR') + ' €';
                    filters.priceMin = minPrice;
                    filters.priceMax = maxPrice;
                }
                applyFilters(); // Relance le filtrage après suppression du tag
            });
        });
    }

    // Génère le HTML d'un tag de filtre actif avec son bouton de suppression
    function tag(label, filterType, value) {
        const valAttr = value ? `data-value="${value}"` : ''; // Attribut data-value facultatif (absent pour le filtre prix)
        return `<span class="filter-tag">${label}
            <button class="remove" data-filter="${filterType}" ${valAttr}
                    aria-label="Retirer le filtre ${label}">×</button></span>`;
        // data-filter : type du filtre pour savoir quoi effacer au clic
        // aria-label : description accessible du bouton pour les lecteurs d'écran
    }

})(); // Fin de l'IIFE