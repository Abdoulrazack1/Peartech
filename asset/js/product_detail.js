// ============================================
// product-detail.js - Page produit dynamique avec options et prix évolutif
// ============================================

(function() {
    'use strict';

    // Fonction utilitaire pour obtenir le slug d'une catégorie à partir de son ID
    function getCategorySlugFromId(categoryId) {
        if (!window.PearTechDB) return '';
        const cat = PearTechDB.categories.find(c => c.id === categoryId);
        return cat ? cat.slug : '';
    }

    document.addEventListener('DOMContentLoaded', function() {
        // Récupérer l'ID du produit depuis l'URL
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        if (!productId) {
            window.location.href = 'page_accueil.html';
            return;
        }

        // Vérifier que la base de données est chargée
        if (!window.PearTechDB) {
            console.error('PearTechDB non chargé');
            document.querySelector('main').innerHTML = '<div class="container"><p>Erreur de chargement des données</p></div>';
            return;
        }

        const product = PearTechDB.getProductById(parseInt(productId));
        if (!product) {
            document.querySelector('main').innerHTML = '<div class="container"><p>Produit introuvable</p></div>';
            return;
        }

        // Récupérer le slug de la catégorie
        const categorySlug = getCategorySlugFromId(product.categoryId);

        // Générer le fil d'Ariane
        const breadcrumb = document.getElementById('breadcrumb');
        if (breadcrumb) {
            breadcrumb.innerHTML = `
                <a href="page_accueil.html">Accueil</a>
                <span>/</span>
                <a href="page_catalogue.html?categorie=${categorySlug}">${categorySlug ? categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1) : 'Catégorie'}</a>
                <span>/</span>
                <span>${product.name}</span>
            `;
        }

        // Générer le HTML de la page produit
        const productDetail = document.getElementById('product-detail');
        if (productDetail) {
            productDetail.innerHTML = generateProductHTML(product);
        }

        // Bouton "Acheter maintenant" : ajouter au panier puis rediriger
        const buyNowBtn = document.getElementById('buy-now');
        if (buyNowBtn) {
            buyNowBtn.addEventListener('click', function() {
                // Déclencher le clic sur btn-add-cart pour ajouter au panier
                const addBtn = document.querySelector('.btn-add-cart[data-product-id]');
                if (addBtn) addBtn.click();
                // Rediriger après un court délai
                setTimeout(() => { window.location.href = 'page_panier.html'; }, 300);
            });
        }

        // Synchroniser title avec aria-label sur le bouton wishlist (pour tooltip natif)
        const wishlistBtn = document.querySelector('.wishlist-btn');
        if (wishlistBtn) {
            const syncTitle = () => {
                const label = wishlistBtn.getAttribute('aria-label');
                if (label) wishlistBtn.setAttribute('title', label);
            };
            new MutationObserver(syncTitle).observe(wishlistBtn, { attributes: true, attributeFilter: ['aria-label'] });
        }

        // Initialiser les onglets
        initTabs();

        // Initialiser les miniatures
        initThumbnails(product);

        // Initialiser les options et la mise à jour du prix
        initOptions(product);

        // Générer les produits similaires
        generateSimilarProducts(product);

        // Initialiser les notes personnelles
        initNotes();

        // Charger les avis clients depuis l'API
        initAvis(product);
    });

    // Charge et affiche les vrais avis du produit (API), avec formulaire de dépôt
    function initAvis(product) {
        const liste    = document.getElementById('reviews-list');
        const formZone = document.getElementById('avis-form-zone');
        if (!liste || !window.PearTechAPI) return;

        const esc = s => (s == null ? '' : String(s)).replace(/[&<>"]/g,
            m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
        const etoiles = n => '★'.repeat(Math.round(n)) + `<span style="opacity:.3">${'★'.repeat(5 - Math.round(n))}</span>`;

        injecterStylesAvis();

        // Formulaire : visible si connecté, sinon invitation à se connecter
        function rendreForm() {
            if (!PearTechAPI.isLoggedIn()) {
                formZone.innerHTML = '<p class="avis-hint">Connectez-vous pour laisser un avis. <a href="page_profil.html">Se connecter</a></p>';
                return;
            }
            formZone.innerHTML = `
                <form id="avis-form" class="avis-form">
                    <h3>Donner mon avis</h3>
                    <select id="avis-note">
                        <option value="5">5 ★ — Excellent</option>
                        <option value="4">4 ★ — Très bien</option>
                        <option value="3">3 ★ — Correct</option>
                        <option value="2">2 ★ — Décevant</option>
                        <option value="1">1 ★ — Mauvais</option>
                    </select>
                    <textarea id="avis-commentaire" rows="3" placeholder="Votre commentaire (optionnel)"></textarea>
                    <div id="avis-msg" class="avis-msg" hidden></div>
                    <button type="submit" class="avis-submit">Publier mon avis</button>
                </form>`;

            document.getElementById('avis-form').addEventListener('submit', async e => {
                e.preventDefault();
                const note = parseInt(document.getElementById('avis-note').value);
                const commentaire = document.getElementById('avis-commentaire').value.trim();
                const msg = document.getElementById('avis-msg');
                msg.hidden = true;
                try {
                    await PearTechAPI.avisAjouter({ produitId: product.id, note, commentaire });
                    charger();
                } catch (err) {
                    msg.textContent = err.message || 'Erreur lors de l\'envoi de l\'avis.';
                    msg.hidden = false;
                }
            });
        }

        // Récupère les avis et met à jour la moyenne, la répartition et la liste
        async function charger() {
            let avis = [];
            try { avis = await PearTechAPI.avisProduit(product.id); }
            catch (e) { liste.innerHTML = '<p>Impossible de charger les avis.</p>'; return; }

            const n = avis.length;
            const moyEl  = document.getElementById('avis-moyenne');
            const barsEl = document.getElementById('avis-bars');

            if (n > 0) {
                const moyenne = avis.reduce((s, a) => s + a.note, 0) / n;
                if (moyEl) moyEl.textContent = moyenne.toFixed(1);
                const dist = [0, 0, 0, 0, 0];
                avis.forEach(a => { if (a.note >= 1 && a.note <= 5) dist[a.note - 1]++; });
                if (barsEl) barsEl.innerHTML = [5, 4, 3, 2, 1].map(star => {
                    const pct = Math.round(dist[star - 1] / n * 100);
                    return `<div class="review-bar-item"><span class="bar-label">${star}★</span>
                        <div class="bar"><div class="bar-fill" style="width:${pct}%"></div></div><span>${pct}%</span></div>`;
                }).join('');
            } else if (barsEl) {
                barsEl.innerHTML = '';
            }

            const tabBtn = document.querySelector('.tab-btn[data-tab="reviews"]');
            if (tabBtn) tabBtn.textContent = `Avis clients (${n})`;

            liste.innerHTML = n === 0
                ? '<p>Aucun avis pour le moment. Soyez le premier à donner votre avis !</p>'
                : avis.map(a => `
                    <div class="review-card">
                        <div class="review-header">
                            <span class="review-author">${esc(a.auteur)}</span>
                            <span class="review-date">${new Date(a.creeLe).toLocaleDateString('fr-FR')}</span>
                        </div>
                        <div class="stars">${etoiles(a.note)}</div>
                        ${a.commentaire ? `<p class="review-text">${esc(a.commentaire)}</p>` : ''}
                    </div>`).join('');
        }

        rendreForm();
        charger();
    }

    // Injecte les styles du bloc avis (une seule fois)
    function injecterStylesAvis() {
        if (document.getElementById('avis-styles')) return;
        const s = document.createElement('style');
        s.id = 'avis-styles';
        s.textContent = `
            .avis-form { background: var(--card-bg, rgba(0,0,0,.03)); border: 1px solid var(--border-color, #e5e7eb);
                border-radius: 12px; padding: 1rem 1.2rem; margin: 1rem 0 1.5rem; }
            .avis-form h3 { margin: 0 0 .8rem; font-size: 1rem; }
            .avis-form select, .avis-form textarea { width: 100%; margin-bottom: .7rem; padding: .55rem .7rem;
                border: 1px solid var(--border-color, #d1d5db); border-radius: 8px; font: inherit; background: var(--bg, #fff); color: inherit; }
            .avis-submit { background: var(--primary, #3B82F6); color: #fff; border: none; padding: .6rem 1.2rem;
                border-radius: 8px; cursor: pointer; font-weight: 600; }
            .avis-submit:hover { opacity: .9; }
            .avis-msg { color: #ef4444; background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.3);
                border-radius: 8px; padding: .5rem .7rem; margin-bottom: .7rem; font-size: .9rem; }
            .avis-hint { color: var(--text-secondary, #6b7280); margin: 1rem 0 1.5rem; }
        `;
        document.head.appendChild(s);
    }

    function generateProductHTML(product) {
        // Calcul du badge de stock
        const stockClass = product.stock > 0 ? 'in-stock' : 'out';
        const stockText = product.stock > 0 ? 'En stock - livraison offerte' : 'Rupture de stock';
        const stockIcon = product.stock > 0 ? 'check_circle' : 'cancel'; // conservé pour rétrocompat
        const stockSvg  = product.stock > 0
            ? '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
            : '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';

        // Prix barré si oldPrice existe
        const oldPriceHtml = product.oldPrice ? `<span class="old-price">${product.oldPrice.toFixed(2).replace('.',',')} €</span>` : '';

        // Génération des étoiles
        const fullStars = Math.floor(product.rating);
        const halfStar = product.rating % 1 >= 0.5;
        const stars = '★'.repeat(fullStars) + (halfStar ? '½' : '');

        // Construction des spécifications pour l'affichage rapide (certains produits n'ont pas ces champs)
        const specsShort = [product.specs.processor, product.specs.ram, product.specs.storage]
            .filter(Boolean).join(' - ') || 'Voir les caractéristiques';

        // Génération des options de personnalisation
        let optionsHtml = '';
        if (product.options && Object.keys(product.options).length > 0) {
            optionsHtml = '<div class="product-options">';
            for (const [key, values] of Object.entries(product.options)) {
                const optionLabel = key === 'ram' ? 'Mémoire RAM' :
                                   key === 'storage' ? 'Stockage' :
                                   key === 'color' ? 'Couleur' :
                                   key === 'rgb' ? 'Éclairage RGB' :
                                   key === 'screen' ? 'Écran' :
                                   key === 'switches' ? 'Switches' :
                                   key.charAt(0).toUpperCase() + key.slice(1);
                optionsHtml += `
                    <div class="option-group" data-option-group="${key}">
                        <span class="option-label">${optionLabel}:</span>
                        <div class="option-buttons" data-option="${key}">
                            ${values.map((opt, index) => `
                                <button class="option-btn ${index === 0 ? 'active' : ''}" data-price="${opt.price}" data-value="${opt.label}">${opt.label}</button>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
            optionsHtml += '</div>';
        }

        // État favori via favoris.js
        const isFav = (typeof window.Favoris !== 'undefined') && window.Favoris.isFavori(product.id);

        return `
            <div class="product-gallery">
                <div class="main-image" id="main-image">
                    <img src="${product.images[0]}"
                         alt="${product.name}"
                         loading="lazy"
                         onerror="this.onerror=null;this.src='/asset/image/no-image.png';">
                </div>
                <div class="thumbnail-list" id="thumbnail-list">
                    ${product.images.map((img, index) => `
                        <div class="thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}">
                            <img src="${img}"
                                 alt="${product.name} — vue ${index + 1}"
                                 loading="lazy"
                                 onerror="this.onerror=null;this.src='/asset/image/no-image.png';">
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="product-info">
                <div class="product-category">${product.tags[0] || 'PC'}</div>
                <h1 class="product-title">${product.name}</h1>
                <div class="product-subtitle">${specsShort}</div>
                
                <div class="product-rating">
                    <span class="stars">${stars}</span>
                    <span class="rating-count">${product.rating} (${product.reviews} avis)</span>
                </div>

                <div class="product-price-box">
                    <div>
                        <span class="current-price" id="current-price">${(product.basePrice || product.price).toFixed(2).replace('.',',')} €</span>
                        ${oldPriceHtml}
                    </div>
                    <div class="payment-info">ou 12 × ${((product.basePrice || product.price)/12).toFixed(2).replace('.',',')} € sans frais</div>
                    <div class="stock-status ${stockClass}">
                        ${stockSvg}
                        ${stockText}
                    </div>
                </div>

                ${optionsHtml}

                <div class="product-actions">
                    <button class="btn-primary btn-large btn-add-cart" data-product-id="${product.id}">Ajouter au panier</button>
                    <button class="btn-secondary btn-large" id="buy-now">Acheter maintenant</button>
                    <button class="wishlist-btn btn-fav" data-fav-btn="${product.id}"
                            aria-label="${isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}"
                            title="${isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}">
                        <svg viewBox="0 0 24 24" width="22" height="22"
                             fill="${isFav ? '#ef4444' : 'none'}"
                             stroke="${isFav ? '#ef4444' : 'currentColor'}"
                             stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
                             aria-hidden="true">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                    </button>
                </div>

                <div class="product-services">
                    <div class="service-item">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
                        <div>Extension de garantie</div>
                        <small>Prolongez jusqu'à 5 ans</small>
                    </div>
                    <div class="service-item">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                        <div>Installation & transfert</div>
                        <small>Logiciels et données</small>
                    </div>
                    <div class="service-item">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/></svg>
                        <div>Retour 30 jours</div>
                        <small>Gratuit</small>
                    </div>
                </div>
            </div>

            <!-- Onglets -->
            <div class="product-tabs" style="grid-column: 1/-1;">
                <div class="tabs-header">
                    <button class="tab-btn active" data-tab="desc">Description détaillée</button>
                    <button class="tab-btn" data-tab="specs">Fiche technique</button>
                    <button class="tab-btn" data-tab="reviews">Avis clients (${product.reviews})</button>
                    <button class="tab-btn" data-tab="faq">Questions / Réponses</button>
                    <button class="tab-btn" data-tab="notes">Mes notes</button>
                </div>
                <div class="tab-content active" id="tab-desc">
                    <p>${product.description}</p>
                    <h3>Pensé pour la mobilité et les journées intenses</h3>
                    <p>Ouverture instantanée, autonomie jusqu'à 15 heures et châssis aluminium ultrafin : ce produit est conçu pour vous suivre partout sans compromis sur le confort.</p>
                </div>
                <div class="tab-content" id="tab-specs">
                    <table class="specs-table">
                        ${Object.entries(product.specs).map(([key, value]) => `
                            <tr><td>${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</td><td>${value}</td></tr>
                        `).join('')}
                    </table>
                </div>
                <div class="tab-content" id="tab-reviews">
                    <div class="reviews-summary">
                        <div class="average-rating" id="avis-moyenne">${product.rating}</div>
                        <div class="review-bars" id="avis-bars"></div>
                    </div>
                    <div id="avis-form-zone"></div>
                    <div class="reviews-list" id="reviews-list">
                        <p>Chargement des avis…</p>
                    </div>
                </div>
                <div class="tab-content" id="tab-faq">
                    <p>Aucune question pour le moment. Soyez le premier à poser une question.</p>
                </div>
                <div class="tab-content" id="tab-notes">
                    <div class="personal-notes">
                        <div class="notes-header">
                            <div class="notes-header-text">
                                <h3 class="notes-title">Mes notes personnelles</h3>
                                <p class="notes-subtitle">Ces notes sont privées et sauvegardées sur votre appareil.</p>
                            </div>
                            <span class="notes-saved-indicator" id="notes-saved-indicator"></span>
                        </div>
                        <textarea
                            id="notes-textarea"
                            class="notes-textarea"
                            placeholder="Écrivez vos notes ici : comparaison avec d'autres produits, questions à poser, points importants…"
                            rows="8"
                            data-product-id="${product.id}"
                        ></textarea>
                        <div class="notes-footer">
                            <span class="notes-char-count" id="notes-char-count">0 caractère</span>
                            <div class="notes-actions">
                                <button class="notes-btn-clear" id="notes-btn-clear" type="button">Effacer</button>
                                <button class="notes-btn-save" id="notes-btn-save" type="button">Sauvegarder</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function initTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.dataset.tab;
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                const activeTab = document.getElementById(`tab-${tabId}`);
                if (activeTab) activeTab.classList.add('active');
            });
        });
    }

    function initThumbnails(product) {
        const thumbnails = document.querySelectorAll('.thumbnail');
        const mainImage = document.querySelector('#main-image img');
        const mainImageContainer = document.getElementById('main-image');

        if (!mainImage) return;

        // ── Changer d'image via miniature ────────────────────────
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', () => {
                const index = parseInt(thumb.dataset.index);
                if (product.images[index]) {
                    mainImage.src = product.images[index];
                    mainImage.alt = `${product.name} - image ${index + 1}`;
                    thumbnails.forEach(t => t.classList.remove('active'));
                    thumb.classList.add('active');
                }
            });
        });

        // ── Lightbox ──────────────────────────────────────────────
        initLightbox(product);

        // Curseur zoom sur l'image principale
        if (mainImageContainer) {
            mainImageContainer.style.cursor = 'zoom-in';
            mainImageContainer.addEventListener('click', () => {
                openLightbox(mainImage.src, mainImage.alt, product);
            });
        }
    }

    function initLightbox(product) {
        // Créer l'overlay lightbox s'il n'existe pas encore
        if (document.getElementById('lightbox-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'lightbox-overlay';
        overlay.className = 'lightbox-overlay';
        overlay.innerHTML = `
            <div class="lightbox-container">
                <button class="lightbox-close" id="lightbox-close" aria-label="Fermer">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
                <button class="lightbox-nav lightbox-prev" id="lightbox-prev" aria-label="Image précédente">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <img class="lightbox-img" id="lightbox-img" src="" alt="Vue agrandie du produit">
                <button class="lightbox-nav lightbox-next" id="lightbox-next" aria-label="Image suivante">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
                <div class="lightbox-counter" id="lightbox-counter"></div>
            </div>
        `;
        document.body.appendChild(overlay);

        let currentIndex = 0;
        const images = product.images;

        // Fermer
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeLightbox();
        });
        document.getElementById('lightbox-close').addEventListener('click', closeLightbox);

        // Navigation
        document.getElementById('lightbox-prev').addEventListener('click', (e) => {
            e.stopPropagation();
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            updateLightbox(currentIndex);
        });
        document.getElementById('lightbox-next').addEventListener('click', (e) => {
            e.stopPropagation();
            currentIndex = (currentIndex + 1) % images.length;
            updateLightbox(currentIndex);
        });

        // Clavier
        document.addEventListener('keydown', (e) => {
            if (!overlay.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') {
                currentIndex = (currentIndex - 1 + images.length) % images.length;
                updateLightbox(currentIndex);
            }
            if (e.key === 'ArrowRight') {
                currentIndex = (currentIndex + 1) % images.length;
                updateLightbox(currentIndex);
            }
        });

        // Swipe tactile
        let touchStartX = 0;
        overlay.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
        overlay.addEventListener('touchend', (e) => {
            const diff = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    currentIndex = (currentIndex + 1) % images.length;
                } else {
                    currentIndex = (currentIndex - 1 + images.length) % images.length;
                }
                updateLightbox(currentIndex);
            }
        }, { passive: true });

        function updateLightbox(index) {
            const img = document.getElementById('lightbox-img');
            img.style.opacity = '0';
            setTimeout(() => {
                img.src = images[index];
                img.alt = `${product.name} - image ${index + 1}`;
                img.style.opacity = '1';
            }, 150);
            document.getElementById('lightbox-counter').textContent = `${index + 1} / ${images.length}`;
            // Sync miniatures
            document.querySelectorAll('.thumbnail').forEach((t, i) => {
                t.classList.toggle('active', i === index);
            });
            currentIndex = index;
        }

        // Exposer openLightbox globalement dans ce scope
        window._openLightbox = function(src, alt) {
            currentIndex = images.indexOf(src);
            if (currentIndex === -1) currentIndex = 0;
            updateLightbox(currentIndex);
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        };

        window._closeLightbox = closeLightbox;

        function closeLightbox() {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    function openLightbox(src, alt, product) {
        if (window._openLightbox) window._openLightbox(src, alt);
    }

    function initOptions(product) {
        const optionGroups = document.querySelectorAll('.option-group');
        const priceElement = document.getElementById('current-price');
        if (!priceElement) return;

        // Prix de base
        let basePrice = product.basePrice || product.price;

        // Fonction pour mettre à jour le prix total
        function updatePrice() {
            let total = basePrice;
            optionGroups.forEach(group => {
                const activeBtn = group.querySelector('.option-btn.active');
                if (activeBtn && activeBtn.dataset.price) {
                    total += parseFloat(activeBtn.dataset.price);
                }
            });
            priceElement.textContent = total.toFixed(2).replace('.',',') + ' €';
            // Mettre à jour aussi le prix mensuel
            const paymentInfo = document.querySelector('.payment-info');
            if (paymentInfo) {
                paymentInfo.textContent = `ou 12 × ${(total/12).toFixed(2).replace('.',',')} € sans frais`;
            }
        }

        // Ajouter les événements sur les boutons d'option
        optionGroups.forEach(group => {
            const btns = group.querySelectorAll('.option-btn');
            btns.forEach(btn => {
                btn.addEventListener('click', () => {
                    // Retirer la classe active des autres boutons du même groupe
                    btns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    updatePrice();
                });
            });
        });

        // Initialiser le prix
        updatePrice();
    }

    function generateSimilarProducts(currentProduct) {
        const grid = document.getElementById('similar-products-grid');
        if (!grid) return;

        // Récupérer les produits de la même catégorie, exclure le courant
        const categorySlug = getCategorySlugFromId(currentProduct.categoryId);
        let similar = [];
        if (categorySlug && PearTechDB.getProductsByCategory) {
            similar = PearTechDB.getProductsByCategory(categorySlug).filter(p => p.id !== currentProduct.id).slice(0, 6);
        }

        if (similar.length === 0) {
            grid.innerHTML = '<p>Aucun produit similaire pour le moment.</p>';
            return;
        }

        grid.innerHTML = similar.map(p => {
            const badge = p.isNew ? '<span class="product-badge badge-new">Nouveau</span>' : '';
            const isFavSim = (typeof window.Favoris !== 'undefined') && window.Favoris.isFavori(p.id);
            return `
                <article class="product-card" data-product-id="${p.id}" aria-label="${p.name}">
                    <a href="page_produit.html?id=${p.id}" class="product-image"
                       aria-label="Voir la fiche de ${p.name}">
                        <img src="${p.images[0]}" alt="${p.name}" loading="lazy"
                             onerror="this.onerror=null;this.src='/asset/image/no-image.png';">
                        ${badge}
                    </a>
                    <div class="product-info">
                        <h3 class="product-name">${p.name}</h3>
                        <p class="product-specs">${[p.specs.processor, p.specs.ram].filter(Boolean).join(' · ') || 'Voir la fiche'}</p>
                        <div class="product-footer">
                            <div class="product-price-block">
                                <span class="product-price">${(p.basePrice || p.price).toFixed(2).replace('.',',')} €</span>
                            </div>
                            <div class="product-actions">
                                <button class="btn-add-cart"
                                        data-id="${p.id}"
                                        aria-label="Ajouter ${p.name} au panier">
                                    <span class="material-symbols-outlined" aria-hidden="true">shopping_cart</span>
                                </button>
                                <button class="btn-fav"
                                        data-fav-btn="${p.id}"
                                        aria-label="${isFavSim ? 'Retirer des favoris' : 'Ajouter aux favoris'}">
                                    <svg viewBox="0 0 24 24" width="18" height="18"
                                         fill="${isFavSim ? '#ef4444' : 'none'}"
                                         stroke="${isFavSim ? '#ef4444' : 'currentColor'}"
                                         stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
                                         aria-hidden="true">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <a href="page_produit.html?id=${p.id}" class="btn-view-product">Voir le produit</a>
                    </div>
                </article>
            `;
        }).join('');
    }
    // ── Notes personnelles ────────────────────────────────────────
    function initNotes() {
        // Lire l'ID directement depuis l'URL — source de vérité unique
        const urlId = new URLSearchParams(window.location.search).get('id');
        if (!urlId) return;

        const STORAGE_KEY = 'peartech-notes-' + urlId;

        const textarea  = document.getElementById('notes-textarea');
        const saveBtn   = document.getElementById('notes-btn-save');
        const clearBtn  = document.getElementById('notes-btn-clear');
        const charCount = document.getElementById('notes-char-count');
        const indicator = document.getElementById('notes-saved-indicator');

        if (!textarea || !saveBtn || !clearBtn) return;

        // Charger la note sauvegardée pour CE produit
        const saved = localStorage.getItem(STORAGE_KEY) || '';
        textarea.value = saved;
        updateCharCount(saved.length);
        if (saved) showIndicator('Sauvegardée', false);

        // Compteur en temps réel
        textarea.addEventListener('input', function () {
            updateCharCount(this.value.length);
            if (indicator) indicator.className = 'notes-saved-indicator';
        });

        // Sauvegarde manuelle
        saveBtn.addEventListener('click', function () {
            localStorage.setItem(STORAGE_KEY, textarea.value);
            showIndicator('✓ Sauvegardée', false);
        });

        // Raccourci Ctrl+S / Cmd+S
        textarea.addEventListener('keydown', function (e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                localStorage.setItem(STORAGE_KEY, textarea.value);
                showIndicator('✓ Sauvegardée', false);
            }
        });

        // Effacer
        clearBtn.addEventListener('click', function () {
            if (textarea.value === '') return;
            if (!confirm('Effacer toutes vos notes pour ce produit ?')) return;
            textarea.value = '';
            localStorage.removeItem(STORAGE_KEY);
            updateCharCount(0);
            showIndicator('Effacées', true);
            textarea.focus();
        });

        function updateCharCount(len) {
            if (!charCount) return;
            charCount.textContent = len === 0 ? '0 caractère'
                : len === 1 ? '1 caractère'
                : len + ' caractères';
        }

        function showIndicator(text, isWarning) {
            if (!indicator) return;
            indicator.textContent = text;
            indicator.className = 'notes-saved-indicator ' + (isWarning ? 'warning' : 'saved');
            clearTimeout(indicator._timer);
            indicator._timer = setTimeout(function () {
                indicator.className = 'notes-saved-indicator';
            }, 3000);
        }
    }

})();