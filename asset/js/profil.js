// ============================================
// profil.js - Profil utilisateur + Authentification
// Auth simulée via localStorage (pas de backend)
// Clés : peartech-session, peartech-users, peartech-user-{id}
// ============================================

(function() {
    'use strict';

    // ============================================
    // AUTHENTIFICATION - clés et helpers
    // ============================================

    const SESSION_KEY = 'peartech-session'; // email de l'utilisateur connecté
    const USERS_KEY   = 'peartech-users';   // { email: { password, prenom, nom } }

    // Identifiant sûr pour la clé de données profil (base64 de l'email)
    function userDataKey(email) {
        return 'peartech-user-' + btoa(unescape(encodeURIComponent(email)));
    }

    // Vérifie si une session est active
    function isLoggedIn() {
        return !!localStorage.getItem(SESSION_KEY);
    }

    // Retourne l'email connecté
    function getSessionEmail() {
        return localStorage.getItem(SESSION_KEY);
    }

    // Charge la base des comptes
    function getUsers() {
        try {
            return JSON.parse(localStorage.getItem(USERS_KEY)) || {};
        } catch(e) {
            return {};
        }
    }

    // Sauvegarde la base des comptes
    function saveUsers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    // Crée un compte démo si aucun compte n'existe (pour faciliter les tests)
    function initDemoAccount() {
        const users = getUsers();
        if (Object.keys(users).length === 0) {
            users['demo@peartech.fr'] = { password: 'Demo1234', prenom: 'Jean', nom: 'Dupont' };
            saveUsers(users);
        }
    }

    // ============================================
    // DONNÉES PROFIL PAR DÉFAUT
    // ============================================

    function buildDefaultUserData(prenom, nom, email) {
        return {
            prenom: prenom,
            nom: nom,
            email: email,
            naissance: '',
            telephone: '',
            photo: null,
            commandes: [],
            adresses: [],
            paiements: [],
            preferences: {
                newsletter: false,
                offres_personnalisees: false,
                notifications_commandes: true,
                notifications_promos: false
            }
        };
    }

    function loadUserData() {
        const email = getSessionEmail();
        if (!email) return null;
        const stored = localStorage.getItem(userDataKey(email));
        if (stored) {
            try { return JSON.parse(stored); } catch(e) {}
        }
        // Première connexion : crée le profil depuis le compte
        const users = getUsers();
        const account = users[email] || {};
        return buildDefaultUserData(account.prenom || '', account.nom || '', email);
    }

    function saveUserData(user) {
        const email = getSessionEmail();
        if (!email) return;
        localStorage.setItem(userDataKey(email), JSON.stringify(user));
    }

    // ============================================
    // ÉCRAN D'AUTHENTIFICATION
    // ============================================

    function showAuthScreen() {
        // Cache le layout profil
        const layout = document.querySelector('.profil-layout');
        if (layout) layout.style.display = 'none';

        // Crée le conteneur d'auth
        const authDiv = document.createElement('div');
        authDiv.id = 'auth-screen';
        authDiv.innerHTML = `
            <div class="auth-container">
                <div class="auth-logo">
                    <img src="asset/image/LogoProjetEcf.png" alt="PearTech" class="auth-logo-img">
                    <div>
                        <div class="auth-logo-title">PearTech</div>
                        <div class="auth-logo-sub">Mon espace client</div>
                    </div>
                </div>

                <!-- Onglets Connexion / Inscription -->
                <div class="auth-tabs" role="tablist">
                    <button class="auth-tab active" data-tab="login" role="tab" aria-selected="true">Connexion</button>
                    <button class="auth-tab" data-tab="register" role="tab" aria-selected="false">Créer un compte</button>
                </div>

                <!-- Panneau Connexion -->
                <div class="auth-panel" id="auth-panel-login">
                    <p class="auth-hint">
                        <span class="material-symbols-outlined" aria-hidden="true" style="font-size:1rem;vertical-align:middle;">info</span>
                        Compte démo : <strong>demo@peartech.fr</strong> / <strong>Demo1234</strong>
                    </p>
                    <form id="login-form" novalidate>
                        <div class="form-group">
                            <label for="login-email">Adresse email</label>
                            <input type="email" id="login-email" placeholder="votre@email.fr" autocomplete="email" required>
                        </div>
                        <div class="form-group">
                            <label for="login-password">Mot de passe</label>
                            <div class="password-wrapper">
                                <input type="password" id="login-password" placeholder="••••••••" autocomplete="current-password" required>
                                <button type="button" class="toggle-pw" aria-label="Afficher/masquer le mot de passe">
                                    <span class="material-symbols-outlined">visibility</span>
                                </button>
                            </div>
                        </div>
                        <div id="login-error" class="auth-error" hidden></div>
                        <button type="submit" class="btn-primary auth-submit">Se connecter</button>
                    </form>
                </div>

                <!-- Panneau Inscription -->
                <div class="auth-panel" id="auth-panel-register" hidden>
                    <form id="register-form" novalidate>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="reg-prenom">Prénom <span aria-hidden="true">*</span></label>
                                <input type="text" id="reg-prenom" autocomplete="given-name" required>
                            </div>
                            <div class="form-group">
                                <label for="reg-nom">Nom <span aria-hidden="true">*</span></label>
                                <input type="text" id="reg-nom" autocomplete="family-name" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="reg-email">Adresse email <span aria-hidden="true">*</span></label>
                            <input type="email" id="reg-email" placeholder="votre@email.fr" autocomplete="email" required>
                        </div>
                        <div class="form-group">
                            <label for="reg-password">Mot de passe <span aria-hidden="true">*</span></label>
                            <div class="password-wrapper">
                                <input type="password" id="reg-password" placeholder="Min. 6 caractères" autocomplete="new-password" required minlength="6">
                                <button type="button" class="toggle-pw" aria-label="Afficher/masquer le mot de passe">
                                    <span class="material-symbols-outlined">visibility</span>
                                </button>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="reg-confirm">Confirmer le mot de passe <span aria-hidden="true">*</span></label>
                            <input type="password" id="reg-confirm" placeholder="Répétez le mot de passe" autocomplete="new-password" required>
                        </div>
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="reg-cgu" required>
                                <span>J'accepte les <a href="page_cgu.html" target="_blank">CGU</a> et les <a href="page_cgv.html" target="_blank">CGV</a></span>
                            </label>
                        </div>
                        <div id="register-error" class="auth-error" hidden></div>
                        <button type="submit" class="btn-primary auth-submit">Créer mon compte</button>
                    </form>
                </div>
            </div>
        `;

        // Injecte les styles nécessaires
        injectAuthStyles();

        // Insère avant le footer
        const footer = document.querySelector('.footer');
        const main = document.getElementById('main-content');
        if (main) main.appendChild(authDiv);

        // Attache les événements
        attachAuthEvents(authDiv);
    }

    function attachAuthEvents(authDiv) {
        // Onglets
        authDiv.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                authDiv.querySelectorAll('.auth-tab').forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                this.classList.add('active');
                this.setAttribute('aria-selected', 'true');

                const target = this.dataset.tab;
                document.getElementById('auth-panel-login').hidden  = (target !== 'login');
                document.getElementById('auth-panel-register').hidden = (target !== 'register');
            });
        });

        // Toggle visibilité mot de passe
        authDiv.querySelectorAll('.toggle-pw').forEach(btn => {
            btn.addEventListener('click', function() {
                const input = this.previousElementSibling;
                const icon  = this.querySelector('.material-symbols-outlined');
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.textContent = 'visibility_off';
                } else {
                    input.type = 'password';
                    icon.textContent = 'visibility';
                }
            });
        });

        // Formulaire connexion
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const email    = document.getElementById('login-email').value.trim().toLowerCase();
                const password = document.getElementById('login-password').value;
                const errorEl  = document.getElementById('login-error');

                if (!email || !password) {
                    showAuthError(errorEl, 'Veuillez remplir tous les champs.');
                    return;
                }
                if (!validateEmail(email)) {
                    showAuthError(errorEl, 'Email invalide.');
                    return;
                }

                const users = getUsers();
                if (!users[email] || users[email].password !== password) {
                    showAuthError(errorEl, 'Email ou mot de passe incorrect.');
                    return;
                }

                // Connexion réussie
                localStorage.setItem(SESSION_KEY, email);
                errorEl.hidden = true;
                initProfile();
            });
        }

        // Formulaire inscription
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const prenom   = document.getElementById('reg-prenom').value.trim();
                const nom      = document.getElementById('reg-nom').value.trim();
                const email    = document.getElementById('reg-email').value.trim().toLowerCase();
                const password = document.getElementById('reg-password').value;
                const confirm  = document.getElementById('reg-confirm').value;
                const cgu      = document.getElementById('reg-cgu').checked;
                const errorEl  = document.getElementById('register-error');

                if (!prenom || !nom || !email || !password || !confirm) {
                    showAuthError(errorEl, 'Tous les champs obligatoires doivent être remplis.');
                    return;
                }
                if (!validateEmail(email)) {
                    showAuthError(errorEl, 'Adresse email invalide.');
                    return;
                }
                if (password.length < 6) {
                    showAuthError(errorEl, 'Le mot de passe doit contenir au moins 6 caractères.');
                    return;
                }
                if (password !== confirm) {
                    showAuthError(errorEl, 'Les mots de passe ne correspondent pas.');
                    return;
                }
                if (!cgu) {
                    showAuthError(errorEl, 'Vous devez accepter les CGU et CGV.');
                    return;
                }

                const users = getUsers();
                if (users[email]) {
                    showAuthError(errorEl, 'Un compte existe déjà avec cet email.');
                    return;
                }

                // Création du compte
                users[email] = { password, prenom, nom };
                saveUsers(users);

                // Connexion automatique
                localStorage.setItem(SESSION_KEY, email);

                // Crée le profil par défaut
                const newUserData = buildDefaultUserData(prenom, nom, email);
                localStorage.setItem(userDataKey(email), JSON.stringify(newUserData));

                errorEl.hidden = true;
                initProfile();
            });
        }
    }

    function showAuthError(el, msg) {
        el.textContent = msg;
        el.hidden = false;
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // ============================================
    // INITIALISATION DU PROFIL (utilisateur connecté)
    // ============================================

    function initProfile() {
        // Supprime l'écran d'auth s'il est présent
        const authScreen = document.getElementById('auth-screen');
        if (authScreen) authScreen.remove();

        // Réaffiche le layout profil
        const layout = document.querySelector('.profil-layout');
        if (layout) layout.style.display = '';

        // Met à jour l'intitulé de la sidebar
        const sidebarTitle = document.querySelector('.sidebar-title');
        if (sidebarTitle) {
            const users = getUsers();
            const email = getSessionEmail();
            const account = users[email] || {};
            if (account.prenom) sidebarTitle.textContent = 'Bonjour, ' + account.prenom + ' !';
        }

        // Lance le profil normal
        startProfile();
    }

    // ============================================
    // PROFIL - DONNÉES ET RENDU
    // ============================================

    let userData = null;
    let sidebarLinks, contentDiv;

    function startProfile() {
        userData = loadUserData();
        sidebarLinks = document.querySelectorAll('.sidebar-link');
        contentDiv = document.getElementById('profil-content');

        if (!contentDiv) {
            console.error('Élément #profil-content introuvable');
            return;
        }

        // Section initiale : lire ?section= dans l'URL ou 'info' par défaut
        const urlParams = new URLSearchParams(window.location.search);
        const initSection = urlParams.get('section') || 'info';
        showSection(initSection);

        sidebarLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                showSection(this.dataset.section);
            });
        });
    }

    // ============================================
    // SECTIONS DU PROFIL
    // ============================================

    function showSection(sectionId) {
        sidebarLinks.forEach(link => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
            if (link.dataset.section === sectionId) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'true');
            }
        });

        let html = '';
        switch (sectionId) {
            case 'info':         html = renderInfoSection();        break;
            case 'commandes':    html = renderCommandesSection();   break;
            case 'adresses':     html = renderAdressesSection();    break;
            case 'paiement':     html = renderPaiementSection();    break;
            case 'preferences':  html = renderPreferencesSection(); break;
            case 'securite':     html = renderSecuriteSection();    break;
            case 'deconnexion':  html = renderDeconnexionSection(); break;
            default:             html = '<p>Section inconnue</p>';
        }
        contentDiv.innerHTML = html;
        attachSectionEvents(sectionId);
    }

    // ============================================
    // RENDU DES SECTIONS
    // ============================================

    function renderInfoSection() {
        const user = userData;
        return `
            <h1 class="content-title">Informations personnelles</h1>
            <div class="photo-section">
                <div class="photo-container">
                    <div class="photo-placeholder" id="photo-preview">
                        ${user.photo
                            ? `<img src="${user.photo}" alt="Photo de profil">`
                            : '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'}
                    </div>
                    <div class="photo-upload">
                        <label for="photo-input" class="btn-secondary">Changer la photo</label>
                        <input type="file" id="photo-input" accept="image/jpeg,image/png" hidden>
                        <p class="photo-hint">JPG ou PNG, max 2 Mo</p>
                    </div>
                </div>
            </div>
            <form id="info-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="prenom">Prénom</label>
                        <input type="text" id="prenom" value="${escapeHtml(user.prenom)}" required>
                    </div>
                    <div class="form-group">
                        <label for="nom">Nom</label>
                        <input type="text" id="nom" value="${escapeHtml(user.nom)}" required>
                    </div>
                </div>
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" value="${escapeHtml(user.email)}" required>
                </div>
                <div class="form-group">
                    <label for="telephone">Téléphone</label>
                    <input type="tel" id="telephone" value="${escapeHtml(user.telephone || '')}">
                </div>
                <div class="form-group">
                    <label for="naissance">Date de naissance</label>
                    <input type="date" id="naissance" value="${user.naissance || ''}">
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary">Enregistrer les modifications</button>
                </div>
            </form>
        `;
    }

    function renderCommandesSection() {
        const commandes = userData.commandes;
        if (!commandes || commandes.length === 0) {
            return `
                <h1 class="content-title">Mes commandes</h1>
                <div class="empty-state">
                    <span class="material-symbols-outlined" style="font-size:3rem;opacity:.4;">receipt_long</span>
                    <p>Vous n'avez pas encore passé de commande.</p>
                    <a href="page_catalogue.html" class="btn-primary">Découvrir le catalogue</a>
                </div>`;
        }
        let html = '<h1 class="content-title">Mes commandes</h1><div class="commandes-list">';
        commandes.forEach(cmd => {
            const statusClass = cmd.status === 'livré' ? 'status-livre'
                : cmd.status === 'en cours' ? 'status-encours' : 'status-annule';
            const dateFormatee = new Date(cmd.date).toLocaleDateString('fr-FR');
            html += `
                <div class="commande-card" data-commande-id="${cmd.id}">
                    <div class="commande-infos">
                        <h3>Commande ${cmd.id}</h3>
                        <p>Date : ${dateFormatee} — Total : ${cmd.total.toFixed(2).replace('.',',')} €</p>
                        <p>Articles : ${cmd.articles.join(', ')}</p>
                    </div>
                    <span class="commande-status ${statusClass}">${cmd.status}</span>
                    <button class="btn-suivi" data-commande-id="${cmd.id}">Suivre</button>
                </div>`;
        });
        html += '</div>';
        return html;
    }

    function renderAdressesSection() {
        const adresses = userData.adresses;
        let html = '<h1 class="content-title">Mes adresses</h1><div class="adresses-grid">';
        if (!adresses || adresses.length === 0) {
            html += '<p style="color:var(--text-secondary)">Aucune adresse enregistrée.</p>';
        }
        (adresses || []).forEach(addr => {
            html += `
                <div class="adresse-card ${addr.principale ? 'principale' : ''}" data-id="${addr.id}">
                    ${addr.principale ? '<span class="adresse-badge">Principale</span>' : ''}
                    <h3>${escapeHtml(addr.nom)}</h3>
                    <p>${escapeHtml(addr.rue)}</p>
                    ${addr.complement ? `<p>${escapeHtml(addr.complement)}</p>` : ''}
                    <p>${escapeHtml(addr.codePostal)} ${escapeHtml(addr.ville)}</p>
                    <p>${escapeHtml(addr.pays)}</p>
                    <div class="adresse-actions">
                        <button class="btn-icon edit-adresse" title="Modifier"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                        <button class="btn-icon delete-adresse" title="Supprimer"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>
                        ${!addr.principale ? '<button class="btn-icon set-principale" title="Définir comme principale"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></button>' : ''}
                    </div>
                </div>`;
        });
        html += '</div><button class="btn-primary" id="add-adresse" style="margin-top:1rem">Ajouter une adresse</button>';
        return html;
    }

    function renderPaiementSection() {
        const paiements = userData.paiements;
        let html = '<h1 class="content-title">Moyens de paiement</h1><div class="paiement-list">';
        if (!paiements || paiements.length === 0) {
            html += '<p style="color:var(--text-secondary)">Aucun moyen de paiement enregistré.</p>';
        }
        (paiements || []).forEach(pm => {
            if (pm.type === 'Visa' || pm.type === 'MasterCard') {
                html += `
                    <div class="paiement-card" data-id="${pm.id}">
                        <div class="paiement-icon">💳</div>
                        <div class="paiement-infos">
                            <h3>${pm.type} terminant par ${pm.numero.slice(-4)}</h3>
                            <p>Expire le ${pm.expire} — ${pm.titulaire}</p>
                        </div>
                        <div class="paiement-actions">
                            <button class="btn-icon edit-paiement" title="Modifier"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                            <button class="btn-icon delete-paiement" title="Supprimer"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>
                        </div>
                    </div>`;
            } else if (pm.type === 'PayPal') {
                html += `
                    <div class="paiement-card" data-id="${pm.id}">
                        <div class="paiement-icon">📧</div>
                        <div class="paiement-infos">
                            <h3>PayPal</h3>
                            <p>${escapeHtml(pm.email)}</p>
                        </div>
                        <div class="paiement-actions">
                            <button class="btn-icon edit-paiement" title="Modifier"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                            <button class="btn-icon delete-paiement" title="Supprimer"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>
                        </div>
                    </div>`;
            }
        });
        html += '</div><button class="btn-primary" id="add-paiement" style="margin-top:1rem">Ajouter un moyen de paiement</button>';
        return html;
    }

    function renderPreferencesSection() {
        const prefs = userData.preferences;
        return `
            <h1 class="content-title">Préférences de communication</h1>
            <form id="preferences-form">
                <div class="preferences-group">
                    <h3>Email</h3>
                    <label class="checkbox-label"><input type="checkbox" name="newsletter" ${prefs.newsletter ? 'checked' : ''}> Recevoir la newsletter</label>
                    <label class="checkbox-label"><input type="checkbox" name="offres_personnalisees" ${prefs.offres_personnalisees ? 'checked' : ''}> Recevoir des offres personnalisées</label>
                </div>
                <div class="preferences-group">
                    <h3>Notifications</h3>
                    <label class="checkbox-label"><input type="checkbox" name="notifications_commandes" ${prefs.notifications_commandes ? 'checked' : ''}> Notifications de commande (email)</label>
                    <label class="checkbox-label"><input type="checkbox" name="notifications_promos" ${prefs.notifications_promos ? 'checked' : ''}> Alertes promotions</label>
                </div>
                <button type="submit" class="btn-primary">Enregistrer les préférences</button>
            </form>`;
    }

    function renderSecuriteSection() {
        return `
            <h1 class="content-title">Sécurité</h1>
            <form id="password-form">
                <div class="form-group">
                    <label for="current-password">Mot de passe actuel</label>
                    <div class="password-wrapper">
                        <input type="password" id="current-password" placeholder="••••••••" required>
                        <button type="button" class="toggle-pw" aria-label="Afficher/masquer"><span class="material-symbols-outlined">visibility</span></button>
                    </div>
                </div>
                <div class="form-group">
                    <label for="new-password">Nouveau mot de passe</label>
                    <div class="password-wrapper">
                        <input type="password" id="new-password" placeholder="Min. 6 caractères" required minlength="6">
                        <button type="button" class="toggle-pw" aria-label="Afficher/masquer"><span class="material-symbols-outlined">visibility</span></button>
                    </div>
                </div>
                <div class="form-group">
                    <label for="confirm-password">Confirmer le nouveau mot de passe</label>
                    <input type="password" id="confirm-password" placeholder="Répétez le mot de passe" required>
                </div>
                <button type="submit" class="btn-primary">Mettre à jour le mot de passe</button>
            </form>`;
    }

    function renderDeconnexionSection() {
        return `
            <h1 class="content-title">Déconnexion</h1>
            <div class="deconnexion-section">
                <p>Êtes-vous sûr de vouloir vous déconnecter ?</p>
                <button class="btn-primary" id="logout-btn">Se déconnecter</button>
            </div>`;
    }

    // ============================================
    // ÉVÉNEMENTS DES SECTIONS
    // ============================================

    function attachSectionEvents(sectionId) {
        switch (sectionId) {
            case 'info':        attachInfoEvents();        break;
            case 'commandes':   attachCommandesEvents();   break;
            case 'adresses':    attachAdressesEvents();    break;
            case 'paiement':    attachPaiementEvents();    break;
            case 'preferences': attachPreferencesEvents(); break;
            case 'securite':    attachSecuriteEvents();    break;
            case 'deconnexion': attachDeconnexionEvents(); break;
        }
    }

    function attachInfoEvents() {
        // Toggle visibilité mdp dans la section sécurité (si injectés dynamiquement)
        contentDiv.querySelectorAll('.toggle-pw').forEach(btn => attachTogglePw(btn));

        const photoInput   = document.getElementById('photo-input');
        const photoPreview = document.getElementById('photo-preview');
        if (photoInput) {
            photoInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (!file) return;
                if (file.size > 2 * 1024 * 1024) { showMessage('Photo max 2 Mo', 'error'); return; }
                if (!file.type.match('image/(jpeg|png)')) { showMessage('Format JPG ou PNG uniquement', 'error'); return; }
                const reader = new FileReader();
                reader.onload = function(ev) {
                    photoPreview.innerHTML = `<img src="${ev.target.result}" alt="Photo de profil">`;
                    userData.photo = ev.target.result;
                    saveUserData(userData);
                    showMessage('Photo mise à jour', 'success');
                };
                reader.readAsDataURL(file);
            });
        }

        const infoForm = document.getElementById('info-form');
        if (infoForm) {
            infoForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const prenom    = document.getElementById('prenom').value.trim();
                const nom       = document.getElementById('nom').value.trim();
                const email     = document.getElementById('email').value.trim();
                const telephone = document.getElementById('telephone').value.trim();
                const naissance = document.getElementById('naissance').value;

                if (!prenom || !nom || !email) { showMessage('Les champs Prénom, Nom et Email sont obligatoires', 'error'); return; }
                if (!validateEmail(email)) { showMessage('Email invalide', 'error'); return; }

                userData.prenom    = prenom;
                userData.nom       = nom;
                userData.email     = email;
                userData.telephone = telephone;
                userData.naissance = naissance;
                saveUserData(userData);
                showMessage('Informations mises à jour', 'success');
            });
        }
    }

    function attachCommandesEvents() {
        document.querySelectorAll('.btn-suivi').forEach(btn => {
            btn.addEventListener('click', function() {
                const commande = userData.commandes.find(c => c.id === this.dataset.commandeId);
                if (commande) showSuiviModal(commande);
            });
        });
    }

    function showSuiviModal(commande) {
        const modal = document.createElement('div');
        modal.className = 'suivi-modal active';
        modal.innerHTML = `
            <div class="suivi-modal-content">
                <h2>Suivi — Commande ${commande.id}</h2>
                <div class="suivi-timeline">
                    ${(commande.suivi || []).map((etape, i) => {
                        const last = i === commande.suivi.length - 1;
                        const cls  = last && commande.status === 'livré' ? 'completed' : (last ? 'active' : 'completed');
                        return `
                            <div class="timeline-item ${cls}">
                                <div class="timeline-date">${new Date(etape.date).toLocaleString('fr-FR')}</div>
                                <div class="timeline-title">${etape.titre}</div>
                                <div class="timeline-desc">${etape.description}</div>
                            </div>`;
                    }).join('')}
                </div>
                <button class="btn-secondary" id="close-modal">Fermer</button>
            </div>`;
        document.body.appendChild(modal);
        modal.querySelector('#close-modal').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    }

    function attachAdressesEvents() {
        document.querySelectorAll('.edit-adresse').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.closest('.adresse-card').dataset.id;
                const addr = (userData.adresses || []).find(a => a.id === id);
                if (addr) showAdresseForm(addr);
            });
        });
        document.querySelectorAll('.delete-adresse').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.closest('.adresse-card').dataset.id;
                if (confirm('Supprimer cette adresse ?')) {
                    userData.adresses = (userData.adresses || []).filter(a => a.id !== id);
                    saveUserData(userData);
                    showSection('adresses');
                    showMessage('Adresse supprimée', 'success');
                }
            });
        });
        document.querySelectorAll('.set-principale').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.closest('.adresse-card').dataset.id;
                (userData.adresses || []).forEach(a => a.principale = (a.id === id));
                saveUserData(userData);
                showSection('adresses');
                showMessage('Adresse principale mise à jour', 'success');
            });
        });
        const addBtn = document.getElementById('add-adresse');
        if (addBtn) addBtn.addEventListener('click', () => showAdresseForm(null));
    }

    function showAdresseForm(existing) {
        const isEdit = !!existing;
        const formHtml = `
            <div class="adresse-form">
                <h3>${isEdit ? 'Modifier' : 'Ajouter'} une adresse</h3>
                <form id="adresse-form-detail">
                    <div class="form-group"><label for="addr-nom">Nom (ex: Domicile)</label><input type="text" id="addr-nom" value="${escapeHtml(existing?.nom || '')}" required></div>
                    <div class="form-group"><label for="addr-rue">Rue</label><input type="text" id="addr-rue" value="${escapeHtml(existing?.rue || '')}" required></div>
                    <div class="form-group"><label for="addr-complement">Complément (optionnel)</label><input type="text" id="addr-complement" value="${escapeHtml(existing?.complement || '')}"></div>
                    <div class="form-row">
                        <div class="form-group"><label for="addr-cp">Code postal</label><input type="text" id="addr-cp" value="${escapeHtml(existing?.codePostal || '')}" required></div>
                        <div class="form-group"><label for="addr-ville">Ville</label><input type="text" id="addr-ville" value="${escapeHtml(existing?.ville || '')}" required></div>
                    </div>
                    <div class="form-group"><label for="addr-pays">Pays</label><input type="text" id="addr-pays" value="${escapeHtml(existing?.pays || 'France')}" required></div>
                    <label class="checkbox-label"><input type="checkbox" id="addr-principale" ${existing?.principale ? 'checked' : ''}> Adresse principale</label>
                    <div class="form-actions">
                        <button type="submit" class="btn-primary">${isEdit ? 'Mettre à jour' : 'Ajouter'}</button>
                        <button type="button" class="btn-secondary" id="cancel-adresse-form">Annuler</button>
                    </div>
                </form>
            </div>`;
        const grid = document.querySelector('.adresses-grid');
        document.querySelector('.adresse-form')?.remove();
        grid.insertAdjacentHTML('afterend', formHtml);
        document.getElementById('cancel-adresse-form').addEventListener('click', () => document.querySelector('.adresse-form').remove());
        document.getElementById('adresse-form-detail').addEventListener('submit', function(e) {
            e.preventDefault();
            const newAddr = {
                id:         isEdit ? existing.id : 'addr' + Date.now(),
                nom:        document.getElementById('addr-nom').value.trim(),
                rue:        document.getElementById('addr-rue').value.trim(),
                complement: document.getElementById('addr-complement').value.trim(),
                codePostal: document.getElementById('addr-cp').value.trim(),
                ville:      document.getElementById('addr-ville').value.trim(),
                pays:       document.getElementById('addr-pays').value.trim(),
                principale: document.getElementById('addr-principale').checked
            };
            if (!newAddr.nom || !newAddr.rue || !newAddr.codePostal || !newAddr.ville) { showMessage('Champs obligatoires manquants', 'error'); return; }
            if (!userData.adresses) userData.adresses = [];
            if (isEdit) {
                const idx = userData.adresses.findIndex(a => a.id === existing.id);
                if (idx !== -1) userData.adresses[idx] = newAddr;
            } else {
                userData.adresses.push(newAddr);
            }
            if (newAddr.principale) userData.adresses.forEach(a => { if (a.id !== newAddr.id) a.principale = false; });
            saveUserData(userData);
            showSection('adresses');
            showMessage(isEdit ? 'Adresse mise à jour' : 'Adresse ajoutée', 'success');
        });
    }

    function attachPaiementEvents() {
        document.querySelectorAll('.edit-paiement').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.closest('.paiement-card').dataset.id;
                const pm = (userData.paiements || []).find(p => p.id === id);
                if (pm) showPaiementForm(pm);
            });
        });
        document.querySelectorAll('.delete-paiement').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.closest('.paiement-card').dataset.id;
                if (confirm('Supprimer ce moyen de paiement ?')) {
                    userData.paiements = (userData.paiements || []).filter(p => p.id !== id);
                    saveUserData(userData);
                    showSection('paiement');
                    showMessage('Moyen de paiement supprimé', 'success');
                }
            });
        });
        const addBtn = document.getElementById('add-paiement');
        if (addBtn) addBtn.addEventListener('click', () => showPaiementForm(null));
    }

    function showPaiementForm(existing) {
        const isEdit = !!existing;
        const formHtml = `
            <div class="adresse-form">
                <h3>${isEdit ? 'Modifier' : 'Ajouter'} un moyen de paiement</h3>
                <form id="paiement-form-detail">
                    <div class="form-group">
                        <label for="pm-type">Type</label>
                        <select id="pm-type">
                            <option value="Visa" ${existing?.type==='Visa'?'selected':''}>Visa</option>
                            <option value="MasterCard" ${existing?.type==='MasterCard'?'selected':''}>MasterCard</option>
                            <option value="PayPal" ${existing?.type==='PayPal'?'selected':''}>PayPal</option>
                        </select>
                    </div>
                    <div class="form-group" id="pm-numero-group"><label for="pm-numero">Numéro de carte</label><input type="text" id="pm-numero" value="${escapeHtml(existing?.numero||'')}" placeholder="**** **** **** ****"></div>
                    <div class="form-group" id="pm-expire-group"><label for="pm-expire">Expiration (MM/AA)</label><input type="text" id="pm-expire" value="${escapeHtml(existing?.expire||'')}" placeholder="MM/AA"></div>
                    <div class="form-group" id="pm-titulaire-group"><label for="pm-titulaire">Titulaire</label><input type="text" id="pm-titulaire" value="${escapeHtml(existing?.titulaire||'')}"></div>
                    <div class="form-group" id="pm-email-group" style="display:none"><label for="pm-email">Email PayPal</label><input type="email" id="pm-email" value="${escapeHtml(existing?.email||'')}"></div>
                    <label class="checkbox-label"><input type="checkbox" id="pm-principale" ${existing?.principale?'checked':''}> Moyen principal</label>
                    <div class="form-actions">
                        <button type="submit" class="btn-primary">${isEdit ? 'Mettre à jour' : 'Ajouter'}</button>
                        <button type="button" class="btn-secondary" id="cancel-paiement-form">Annuler</button>
                    </div>
                </form>
            </div>`;
        const list = document.querySelector('.paiement-list');
        document.querySelector('.adresse-form')?.remove();
        list.insertAdjacentHTML('afterend', formHtml);
        const typeSelect = document.getElementById('pm-type');
        function toggleFields() {
            const isPayPal = typeSelect.value === 'PayPal';
            document.getElementById('pm-numero-group').style.display    = isPayPal ? 'none' : 'block';
            document.getElementById('pm-expire-group').style.display    = isPayPal ? 'none' : 'block';
            document.getElementById('pm-titulaire-group').style.display = isPayPal ? 'none' : 'block';
            document.getElementById('pm-email-group').style.display     = isPayPal ? 'block' : 'none';
        }
        toggleFields();
        typeSelect.addEventListener('change', toggleFields);
        document.getElementById('cancel-paiement-form').addEventListener('click', () => document.querySelector('.adresse-form').remove());
        document.getElementById('paiement-form-detail').addEventListener('submit', function(e) {
            e.preventDefault();
            const type = typeSelect.value;
            const entry = { id: isEdit ? existing.id : 'pm' + Date.now(), type, principale: document.getElementById('pm-principale').checked };
            if (type === 'PayPal') {
                entry.email = document.getElementById('pm-email').value.trim();
                if (!validateEmail(entry.email)) { showMessage('Email PayPal invalide', 'error'); return; }
            } else {
                entry.numero    = document.getElementById('pm-numero').value.trim();
                entry.expire    = document.getElementById('pm-expire').value.trim();
                entry.titulaire = document.getElementById('pm-titulaire').value.trim();
                if (!entry.numero || !entry.expire || !entry.titulaire) { showMessage('Tous les champs carte sont obligatoires', 'error'); return; }
            }
            if (!userData.paiements) userData.paiements = [];
            if (isEdit) {
                const idx = userData.paiements.findIndex(p => p.id === existing.id);
                if (idx !== -1) userData.paiements[idx] = entry;
            } else {
                userData.paiements.push(entry);
            }
            if (entry.principale) userData.paiements.forEach(p => { if (p.id !== entry.id) p.principale = false; });
            saveUserData(userData);
            showSection('paiement');
            showMessage(isEdit ? 'Moyen mis à jour' : 'Moyen ajouté', 'success');
        });
    }

    function attachPreferencesEvents() {
        const form = document.getElementById('preferences-form');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                userData.preferences = {
                    newsletter:               document.querySelector('input[name="newsletter"]').checked,
                    offres_personnalisees:    document.querySelector('input[name="offres_personnalisees"]').checked,
                    notifications_commandes:  document.querySelector('input[name="notifications_commandes"]').checked,
                    notifications_promos:     document.querySelector('input[name="notifications_promos"]').checked
                };
                saveUserData(userData);
                showMessage('Préférences enregistrées', 'success');
            });
        }
    }

    function attachSecuriteEvents() {
        // Toggle visibilité
        contentDiv.querySelectorAll('.toggle-pw').forEach(btn => attachTogglePw(btn));

        const form = document.getElementById('password-form');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                const current = document.getElementById('current-password').value;
                const newPass = document.getElementById('new-password').value;
                const confirm = document.getElementById('confirm-password').value;

                if (!current || !newPass || !confirm) { showMessage('Tous les champs sont obligatoires', 'error'); return; }

                // Vérification du mot de passe actuel
                const users = getUsers();
                const email = getSessionEmail();
                if (!users[email] || users[email].password !== current) {
                    showMessage('Mot de passe actuel incorrect', 'error');
                    return;
                }
                if (newPass.length < 6) { showMessage('Le nouveau mot de passe doit contenir au moins 6 caractères', 'error'); return; }
                if (newPass !== confirm) { showMessage('Les nouveaux mots de passe ne correspondent pas', 'error'); return; }

                users[email].password = newPass;
                saveUsers(users);
                showMessage('Mot de passe mis à jour avec succès', 'success');
                form.reset();
            });
        }
    }

    function attachDeconnexionEvents() {
        const btn = document.getElementById('logout-btn');
        if (btn) {
            btn.addEventListener('click', function() {
                localStorage.removeItem(SESSION_KEY);
                window.location.reload();
            });
        }
    }

    // ============================================
    // UTILITAIRES
    // ============================================

    function attachTogglePw(btn) {
        btn.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const icon  = this.querySelector('.material-symbols-outlined');
            if (input && input.tagName === 'INPUT') {
                input.type = (input.type === 'password') ? 'text' : 'password';
                if (icon) icon.textContent = (input.type === 'password') ? 'visibility' : 'visibility_off';
            }
        });
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>"]/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[m]));
    }

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function showMessage(text, type) {
        document.querySelectorAll('.form-message').forEach(m => m.remove());
        const msg = document.createElement('div');
        msg.className = `form-message ${type}`;
        msg.textContent = text;
        if (contentDiv) contentDiv.appendChild(msg);
        setTimeout(() => msg.remove(), 3500);
    }

    // ============================================
    // STYLES DE L'ÉCRAN D'AUTH
    // ============================================

    function injectAuthStyles() {
        if (document.getElementById('auth-styles')) return;
        const style = document.createElement('style');
        style.id = 'auth-styles';
        style.textContent = `
            #auth-screen {
                display: flex;
                justify-content: center;
                padding: 3rem 1rem;
            }
            .auth-container {
                width: 100%;
                max-width: 480px;
                background: var(--card-bg, #1a1a2e);
                border: 1px solid var(--border-color, rgba(255,255,255,.1));
                border-radius: 16px;
                padding: 2.5rem;
                box-shadow: 0 8px 32px rgba(0,0,0,.3);
            }
            .auth-logo {
                display: flex;
                align-items: center;
                gap: 1rem;
                margin-bottom: 2rem;
                justify-content: center;
            }
            .auth-logo-img { width: 48px; height: 48px; object-fit: contain; }
            .auth-logo-title { font-size: 1.4rem; font-weight: 700; color: var(--text-primary); }
            .auth-logo-sub   { font-size: .8rem; color: var(--text-secondary); }
            .auth-tabs {
                display: flex;
                border-bottom: 2px solid var(--border-color, rgba(255,255,255,.1));
                margin-bottom: 1.8rem;
                gap: .25rem;
            }
            .auth-tab {
                flex: 1;
                padding: .65rem;
                border: none;
                background: transparent;
                color: var(--text-secondary);
                font-size: .95rem;
                font-weight: 500;
                cursor: pointer;
                border-bottom: 2px solid transparent;
                margin-bottom: -2px;
                transition: color .2s, border-color .2s;
            }
            .auth-tab.active {
                color: var(--primary, #3B82F6);
                border-bottom-color: var(--primary, #3B82F6);
            }
            .auth-hint {
                font-size: .82rem;
                color: var(--text-secondary);
                background: rgba(59,130,246,.08);
                border: 1px solid rgba(59,130,246,.2);
                border-radius: 8px;
                padding: .6rem .9rem;
                margin-bottom: 1.2rem;
            }
            .auth-error {
                color: #ef4444;
                font-size: .85rem;
                background: rgba(239,68,68,.08);
                border: 1px solid rgba(239,68,68,.25);
                border-radius: 8px;
                padding: .6rem .9rem;
                margin-bottom: .8rem;
            }
            .auth-submit {
                width: 100%;
                margin-top: .75rem;
            }
            .password-wrapper {
                position: relative;
                display: flex;
                align-items: center;
            }
            .password-wrapper input {
                flex: 1;
                padding-right: 2.8rem;
            }
            .toggle-pw {
                position: absolute;
                right: .7rem;
                background: none;
                border: none;
                cursor: pointer;
                color: var(--text-secondary);
                padding: 0;
                display: flex;
                align-items: center;
            }
            .toggle-pw .material-symbols-outlined { font-size: 1.1rem; }
            .empty-state {
                text-align: center;
                padding: 3rem 1rem;
                color: var(--text-secondary);
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 1rem;
            }
        `;
        document.head.appendChild(style);
    }

    // ============================================
    // POINT D'ENTRÉE
    // ============================================

    document.addEventListener('DOMContentLoaded', function() {
        initDemoAccount();

        if (!isLoggedIn()) {
            showAuthScreen();
        } else {
            initProfile();
        }
    });

})();