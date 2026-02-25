// ============================================
// profil.js - Profil utilisateur + Authentification
// Auth simulée via localStorage (pas de backend)
// Clés : peartech-session, peartech-users, peartech-user-{id}
// ============================================

(function() {
    'use strict';

    // ============================================
    // AUTHENTIFICATION — clés localStorage et helpers
    // ============================================

    const SESSION_KEY  = 'peartech-session';
    const USERS_KEY    = 'peartech-users';
    const RESET_TOKENS = 'peartech-reset-tokens'; // { token: { email, expiry } }

    // ── Génération d'un token de réinitialisation ─────────────────

    function generateResetToken(email) {
        // Token aléatoire de 32 caractères hexadécimaux
        const token  = Array.from(crypto.getRandomValues(new Uint8Array(16)))
                            .map(b => b.toString(16).padStart(2, '0')).join('');
        const expiry = Date.now() + 30 * 60 * 1000; // Expire dans 30 minutes

        // Charge les tokens existants et nettoie les expirés
        let tokens = {};
        try { tokens = JSON.parse(localStorage.getItem(RESET_TOKENS)) || {}; } catch(e) {}
        Object.keys(tokens).forEach(t => { if (tokens[t].expiry < Date.now()) delete tokens[t]; });

        tokens[token] = { email, expiry };
        localStorage.setItem(RESET_TOKENS, JSON.stringify(tokens));
        return token;
    }

    function validateResetToken(token) {
        let tokens = {};
        try { tokens = JSON.parse(localStorage.getItem(RESET_TOKENS)) || {}; } catch(e) {}
        const entry = tokens[token];
        if (!entry || entry.expiry < Date.now()) return null; // Expiré ou inexistant
        return entry.email;
    }

    function consumeResetToken(token) {
        let tokens = {};
        try { tokens = JSON.parse(localStorage.getItem(RESET_TOKENS)) || {}; } catch(e) {}
        delete tokens[token]; // Supprime le token après utilisation (usage unique)
        localStorage.setItem(RESET_TOKENS, JSON.stringify(tokens));
    }

    function userDataKey(email) {
        return 'peartech-user-' + btoa(unescape(encodeURIComponent(email)));
    }

    function isLoggedIn() {
        return !!localStorage.getItem(SESSION_KEY);
    }

    function getSessionEmail() {
        return localStorage.getItem(SESSION_KEY);
    }

    function getUsers() {
        try {
            return JSON.parse(localStorage.getItem(USERS_KEY)) || {};
        } catch(e) {
            return {};
        }
    }

    function saveUsers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    function initDemoAccount() {
        const users = getUsers();
        if (Object.keys(users).length === 0) {
            users['demo@peartech.fr'] = {
                password: 'Demo1234',
                prenom: 'Jean',
                nom: 'Dupont'
            };
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

        const users   = getUsers();
        const account = users[email] || {};
        return buildDefaultUserData(
            account.prenom || '',
            account.nom    || '',
            email
        );
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
        const layout = document.querySelector('.profil-layout');
        if (layout) layout.style.display = 'none';

        const authDiv    = document.createElement('div');
        authDiv.id       = 'auth-screen';

        authDiv.innerHTML = `
            <div class="auth-container">
                <div class="auth-logo">
                    <img src="asset/image/LogoProjetEcf.png" alt="PearTech" class="auth-logo-img">
                    <div>
                        <div class="auth-logo-title">PearTech</div>
                        <div class="auth-logo-sub">Mon espace client</div>
                    </div>
                </div>

                <div class="auth-tabs" role="tablist">
                    <button class="auth-tab active" data-tab="login" role="tab" aria-selected="true">Connexion</button>
                    <button class="auth-tab" data-tab="register" role="tab" aria-selected="false">Créer un compte</button>
                </div>

                <!-- PANEL 1 : Connexion -->
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
                        <p class="auth-forgot-link">
                            <button type="button" id="btn-forgot-pw" class="link-btn">Mot de passe oublié ?</button>
                        </p>
                    </form>
                </div>

                <!-- PANEL 2 : Mot de passe oublié -->
                <div class="auth-panel" id="auth-panel-forgot" hidden>
                    <button type="button" class="auth-back" id="btn-back-login">
                        <span class="material-symbols-outlined" style="font-size:1.1rem;vertical-align:middle;">arrow_back</span>
                        Retour à la connexion
                    </button>
                    <h2 class="auth-panel-title">Mot de passe oublié</h2>
                    <p class="auth-panel-desc">Saisissez votre adresse email. Si un compte existe, un lien de réinitialisation vous sera envoyé.</p>
                    <form id="forgot-form" novalidate>
                        <div class="form-group">
                            <label for="forgot-email">Adresse email</label>
                            <input type="email" id="forgot-email" placeholder="votre@email.fr" autocomplete="email" required>
                        </div>
                        <div id="forgot-error" class="auth-error" hidden></div>
                        <div id="forgot-success" class="auth-success" hidden></div>
                        <button type="submit" class="btn-primary auth-submit">Envoyer le lien</button>
                    </form>
                </div>

                <!-- PANEL 3 : Saisie du nouveau mot de passe -->
                <div class="auth-panel" id="auth-panel-reset" hidden>
                    <h2 class="auth-panel-title">Nouveau mot de passe</h2>
                    <p class="auth-panel-desc" id="reset-desc">Choisissez un nouveau mot de passe pour votre compte.</p>
                    <form id="reset-form" novalidate>
                        <div class="form-group">
                            <label for="reset-password">Nouveau mot de passe</label>
                            <div class="password-wrapper">
                                <input type="password" id="reset-password" placeholder="Min. 6 caractères" autocomplete="new-password" required minlength="6">
                                <button type="button" class="toggle-pw" aria-label="Afficher/masquer le mot de passe">
                                    <span class="material-symbols-outlined">visibility</span>
                                </button>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="reset-confirm">Confirmer le mot de passe</label>
                            <div class="password-wrapper">
                                <input type="password" id="reset-confirm" placeholder="Répétez le mot de passe" autocomplete="new-password" required>
                                <button type="button" class="toggle-pw" aria-label="Afficher/masquer le mot de passe">
                                    <span class="material-symbols-outlined">visibility</span>
                                </button>
                            </div>
                        </div>
                        <div id="reset-error" class="auth-error" hidden></div>
                        <button type="submit" class="btn-primary auth-submit">Enregistrer le nouveau mot de passe</button>
                    </form>
                </div>

                <!-- PANEL 4 : Inscription -->
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

        injectAuthStyles();

        const main = document.getElementById('main-content');
        if (main) main.appendChild(authDiv);

        attachAuthEvents(authDiv);
    }

    // ============================================
    // HELPER : affiche un seul panel, masque les trois autres
    // ============================================

    function showAuthPanel(name) {
        ['login', 'register', 'forgot', 'reset'].forEach(p => {
            const el = document.getElementById('auth-panel-' + p);
            if (el) el.hidden = (p !== name);
        });
    }

    // ============================================
    // ÉVÉNEMENTS DE L'ÉCRAN D'AUTH
    // ============================================

    function attachAuthEvents(authDiv) {

        // ── Onglets Connexion / Inscription ──
        authDiv.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                authDiv.querySelectorAll('.auth-tab').forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                this.classList.add('active');
                this.setAttribute('aria-selected', 'true');

                const target = this.dataset.tab;
                document.getElementById('auth-panel-login').hidden    = (target !== 'login');
                document.getElementById('auth-panel-register').hidden = (target !== 'register');
                document.getElementById('auth-panel-forgot').hidden   = true;
                document.getElementById('auth-panel-reset').hidden    = true;
            });
        });

        // ── Toggle visibilité des mots de passe ──
        authDiv.querySelectorAll('.toggle-pw').forEach(btn => {
            btn.addEventListener('click', function() {
                const input = this.previousElementSibling;
                const icon  = this.querySelector('.material-symbols-outlined');
                if (input && input.tagName === 'INPUT') {
                    input.type = (input.type === 'password') ? 'text' : 'password';
                    if (icon) icon.textContent = (input.type === 'password') ? 'visibility' : 'visibility_off';
                }
            });
        });

        // ── Bouton "Mot de passe oublié ?" ──
        const btnForgot = document.getElementById('btn-forgot-pw');
        if (btnForgot) {
            btnForgot.addEventListener('click', function() {
                showAuthPanel('forgot');
                authDiv.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            });
        }

        // ── Bouton "Retour à la connexion" depuis le panel oubli ──
        const btnBackLogin = document.getElementById('btn-back-login');
        if (btnBackLogin) {
            btnBackLogin.addEventListener('click', function() {
                showAuthPanel('login');
                authDiv.querySelectorAll('.auth-tab').forEach(t => {
                    t.classList.toggle('active', t.dataset.tab === 'login');
                });
                const f = document.getElementById('forgot-form');
                if (f) { f.reset(); }
                document.getElementById('forgot-error').hidden   = true;
                document.getElementById('forgot-success').hidden = true;
            });
        }

        // ── Formulaire "Mot de passe oublié" (avec lien mailto) ──
        const forgotForm = document.getElementById('forgot-form');
        if (forgotForm) {
            forgotForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const email   = document.getElementById('forgot-email').value.trim().toLowerCase();
                const errorEl = document.getElementById('forgot-error');
                const succEl  = document.getElementById('forgot-success');

                errorEl.hidden = true;
                succEl.hidden  = true;

                if (!email) {
                    showAuthError(errorEl, 'Veuillez saisir votre adresse email.');
                    return;
                }
                if (!validateEmail(email)) {
                    showAuthError(errorEl, 'Adresse email invalide.');
                    return;
                }

                const users = getUsers();

                if (!users[email]) {
                    // Message générique sans révéler l'existence du compte
                    succEl.innerHTML = `
                        <span class="material-symbols-outlined" style="font-size:1.1rem;vertical-align:middle;color:#10b981">check_circle</span>
                        Si un compte est associé à <strong>${escapeHtml(email)}</strong>, un email de réinitialisation vient d'être envoyé.
                    `;
                    succEl.hidden = false;
                    return;
                }

                // Le compte existe — génère un token et construit le lien de reset
                const token    = generateResetToken(email);
                const resetUrl = window.location.origin
                               + window.location.pathname
                               + '?reset_token=' + token;

                const mailSubject = encodeURIComponent('Réinitialisation de votre mot de passe PearTech');
                const mailBody    = encodeURIComponent(
                    'Bonjour,\r\n\r\n'
                    + 'Vous avez demandé la réinitialisation de votre mot de passe PearTech.\r\n\r\n'
                    + 'Cliquez sur le lien ci-dessous pour choisir un nouveau mot de passe :\r\n'
                    + resetUrl + '\r\n\r\n'
                    + '⚠️ Ce lien est valable 30 minutes.\r\n\r\n'
                    + 'Si vous n\'avez pas effectué cette demande, ignorez cet email.\r\n\r\n'
                    + 'L\'équipe PearTech'
                );

                // Lien Gmail compose (fonctionne directement dans le navigateur)
                const gmailUrl = 'https://mail.google.com/mail/?view=cm'
                               + '&to=' + encodeURIComponent(email)
                               + '&su=' + mailSubject
                               + '&body=' + mailBody;

                succEl.innerHTML = `
                    <span class="material-symbols-outlined" style="font-size:1.1rem;vertical-align:middle;color:#10b981">check_circle</span>
                    Lien de réinitialisation généré pour <strong>${escapeHtml(email)}</strong>.<br>
                    <div style="display:flex;flex-direction:column;gap:.5rem;margin-top:.75rem;">
                        <a href="${gmailUrl}" target="_blank" rel="noopener"
                           class="btn-primary" style="text-align:center;text-decoration:none;">
                            ✉️ Envoyer via Gmail
                        </a>
                        <button type="button" id="copy-reset-link" class="btn-secondary"
                                data-link="${escapeHtml(resetUrl)}">
                            🔗 Copier le lien de réinitialisation
                        </button>
                    </div>
                    <small style="font-size:.8rem;opacity:.65;display:block;margin-top:.5rem;">
                        Le lien est valable 30 minutes.
                    </small>
                `;
                succEl.hidden = false;

                // Bouton copier dans le presse-papier
                const copyBtn = document.getElementById('copy-reset-link');
                if (copyBtn) {
                    copyBtn.addEventListener('click', function() {
                        const link = this.dataset.link;
                        navigator.clipboard.writeText(link).then(() => {
                            this.textContent = '✅ Lien copié !';
                            setTimeout(() => { this.textContent = '🔗 Copier le lien de réinitialisation'; }, 2500);
                        }).catch(() => {
                            // Fallback si clipboard API indisponible (ex: HTTP sans HTTPS)
                            prompt('Copiez ce lien de réinitialisation :', link);
                        });
                    });
                }
                succEl.hidden = false;
            });
        }

        // ── Formulaire "Nouveau mot de passe" ──
        const resetForm = document.getElementById('reset-form');
        if (resetForm) {
            resetForm.querySelectorAll('.toggle-pw').forEach(btn => {
                btn.addEventListener('click', function() {
                    const input = this.previousElementSibling;
                    const icon  = this.querySelector('.material-symbols-outlined');
                    if (input && input.tagName === 'INPUT') {
                        input.type = (input.type === 'password') ? 'text' : 'password';
                        if (icon) icon.textContent = (input.type === 'password') ? 'visibility' : 'visibility_off';
                    }
                });
            });

            resetForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const newPass = document.getElementById('reset-password').value;
                const confirm = document.getElementById('reset-confirm').value;
                const errorEl = document.getElementById('reset-error');
                const email   = localStorage.getItem('peartech-reset-email');
                const token   = localStorage.getItem('peartech-reset-token');

                // Valide le token si présent, sinon repli sur l'ancienne clé
                const resolvedEmail = token ? validateResetToken(token) : email;

                errorEl.hidden = true;

                if (!resolvedEmail) {
                    showAuthError(errorEl, 'Lien de réinitialisation invalide ou expiré. Recommencez depuis "Mot de passe oublié".');
                    return;
                }
                if (newPass.length < 6) {
                    showAuthError(errorEl, 'Le mot de passe doit contenir au moins 6 caractères.');
                    return;
                }
                if (newPass !== confirm) {
                    showAuthError(errorEl, 'Les mots de passe ne correspondent pas.');
                    return;
                }

                const users = getUsers();
                if (users[resolvedEmail]) {
                    users[resolvedEmail].password = newPass;
                    saveUsers(users);
                }

                // Nettoyage : consomme le token (usage unique) et supprime les clés temporaires
                if (token) consumeResetToken(token);
                localStorage.removeItem('peartech-reset-token');
                localStorage.removeItem('peartech-reset-email');

                resetForm.innerHTML = `
                    <div class="reset-success">
                        <span class="material-symbols-outlined reset-success-icon">check_circle</span>
                        <p>Mot de passe réinitialisé avec succès !</p>
                        <p style="font-size:.85rem;opacity:.7;">Redirection vers la connexion…</p>
                    </div>`;

                setTimeout(() => {
                    const loginEmailEl = document.getElementById('login-email');
                    if (loginEmailEl) loginEmailEl.value = resolvedEmail;
                    showAuthPanel('login');
                    authDiv.querySelectorAll('.auth-tab').forEach(t => {
                        t.classList.toggle('active', t.dataset.tab === 'login');
                    });
                }, 2000);
            });
        }

        // ── Formulaire de connexion ──
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

                localStorage.setItem(SESSION_KEY, email);
                errorEl.hidden = true;
                initProfile();
            });
        }

        // ── Formulaire d'inscription ──
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

                users[email] = { password, prenom, nom };
                saveUsers(users);

                localStorage.setItem(SESSION_KEY, email);

                const newUserData = buildDefaultUserData(prenom, nom, email);
                localStorage.setItem(userDataKey(email), JSON.stringify(newUserData));

                errorEl.hidden = true;
                initProfile();
            });
        }
    }

    function showAuthError(el, msg) {
        el.textContent = msg;
        el.hidden      = false;
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // ============================================
    // INITIALISATION DU PROFIL (utilisateur connecté)
    // ============================================

    function initProfile() {
        const authScreen = document.getElementById('auth-screen');
        if (authScreen) authScreen.remove();

        const layout = document.querySelector('.profil-layout');
        if (layout) layout.style.display = '';

        const sidebarTitle = document.querySelector('.sidebar-title');
        if (sidebarTitle) {
            const users   = getUsers();
            const email   = getSessionEmail();
            const account = users[email] || {};
            if (account.prenom) sidebarTitle.textContent = 'Bonjour, ' + account.prenom + ' !';
        }

        startProfile();
    }

    // ============================================
    // PROFIL — DONNÉES ET RENDU
    // ============================================

    let userData    = null;
    let sidebarLinks, contentDiv;

    function startProfile() {
        userData     = loadUserData();
        sidebarLinks = document.querySelectorAll('.sidebar-link');
        contentDiv   = document.getElementById('profil-content');

        if (!contentDiv) {
            console.error('Élément #profil-content introuvable');
            return;
        }

        const urlParams     = new URLSearchParams(window.location.search);
        const initSection   = urlParams.get('section') || 'info';
        showSection(initSection);

        sidebarLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                showSection(this.dataset.section);
            });
        });
    }

    // ============================================
    // NAVIGATION ENTRE SECTIONS DU PROFIL
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
            case 'info':        html = renderInfoSection();        break;
            case 'commandes':   html = renderCommandesSection();   break;
            case 'adresses':    html = renderAdressesSection();    break;
            case 'paiement':    html = renderPaiementSection();    break;
            case 'preferences': html = renderPreferencesSection(); break;
            case 'securite':    html = renderSecuriteSection();    break;
            case 'deconnexion': html = renderDeconnexionSection(); break;
            default:            html = '<p>Section inconnue</p>';
        }
        contentDiv.innerHTML = html;
        attachSectionEvents(sectionId);
    }

    // ============================================
    // RENDU HTML DES SECTIONS
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
            const statusClass  = cmd.status === 'livré'     ? 'status-livre'
                               : cmd.status === 'en cours'  ? 'status-encours'
                               :                              'status-annule';
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
    // ROUTEUR D'ÉVÉNEMENTS PAR SECTION
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

    // ============================================
    // ÉVÉNEMENTS — SECTION INFORMATIONS
    // ============================================

    function attachInfoEvents() {
        contentDiv.querySelectorAll('.toggle-pw').forEach(btn => attachTogglePw(btn));

        const photoInput   = document.getElementById('photo-input');
        const photoPreview = document.getElementById('photo-preview');

        if (photoInput) {
            photoInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (!file) return;
                if (file.size > 2 * 1024 * 1024) {
                    showMessage('Photo max 2 Mo', 'error');
                    return;
                }
                if (!file.type.match('image/(jpeg|png)')) {
                    showMessage('Format JPG ou PNG uniquement', 'error');
                    return;
                }
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

                if (!prenom || !nom || !email) {
                    showMessage('Les champs Prénom, Nom et Email sont obligatoires', 'error');
                    return;
                }
                if (!validateEmail(email)) {
                    showMessage('Email invalide', 'error');
                    return;
                }

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

    // ============================================
    // ÉVÉNEMENTS — SECTION COMMANDES
    // ============================================

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

    // ============================================
    // ÉVÉNEMENTS — SECTION ADRESSES
    // ============================================

    function attachAdressesEvents() {
        document.querySelectorAll('.edit-adresse').forEach(btn => {
            btn.addEventListener('click', function() {
                const id   = this.closest('.adresse-card').dataset.id;
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
        const isEdit  = !!existing;
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

        document.getElementById('cancel-adresse-form').addEventListener('click', () => {
            document.querySelector('.adresse-form').remove();
        });

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

            if (!newAddr.nom || !newAddr.rue || !newAddr.codePostal || !newAddr.ville) {
                showMessage('Champs obligatoires manquants', 'error');
                return;
            }

            if (!userData.adresses) userData.adresses = [];

            if (isEdit) {
                const idx = userData.adresses.findIndex(a => a.id === existing.id);
                if (idx !== -1) userData.adresses[idx] = newAddr;
            } else {
                userData.adresses.push(newAddr);
            }

            if (newAddr.principale) {
                userData.adresses.forEach(a => { if (a.id !== newAddr.id) a.principale = false; });
            }

            saveUserData(userData);
            showSection('adresses');
            showMessage(isEdit ? 'Adresse mise à jour' : 'Adresse ajoutée', 'success');
        });
    }

    // ============================================
    // ÉVÉNEMENTS — SECTION PAIEMENT
    // ============================================

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
        const isEdit  = !!existing;
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

        document.getElementById('cancel-paiement-form').addEventListener('click', () => {
            document.querySelector('.adresse-form').remove();
        });

        document.getElementById('paiement-form-detail').addEventListener('submit', function(e) {
            e.preventDefault();
            const type  = typeSelect.value;
            const entry = {
                id:        isEdit ? existing.id : 'pm' + Date.now(),
                type,
                principale: document.getElementById('pm-principale').checked
            };

            if (type === 'PayPal') {
                entry.email = document.getElementById('pm-email').value.trim();
                if (!validateEmail(entry.email)) {
                    showMessage('Email PayPal invalide', 'error');
                    return;
                }
            } else {
                entry.numero    = document.getElementById('pm-numero').value.trim();
                entry.expire    = document.getElementById('pm-expire').value.trim();
                entry.titulaire = document.getElementById('pm-titulaire').value.trim();
                if (!entry.numero || !entry.expire || !entry.titulaire) {
                    showMessage('Tous les champs carte sont obligatoires', 'error');
                    return;
                }
            }

            if (!userData.paiements) userData.paiements = [];

            if (isEdit) {
                const idx = userData.paiements.findIndex(p => p.id === existing.id);
                if (idx !== -1) userData.paiements[idx] = entry;
            } else {
                userData.paiements.push(entry);
            }

            if (entry.principale) {
                userData.paiements.forEach(p => { if (p.id !== entry.id) p.principale = false; });
            }

            saveUserData(userData);
            showSection('paiement');
            showMessage(isEdit ? 'Moyen mis à jour' : 'Moyen ajouté', 'success');
        });
    }

    // ============================================
    // ÉVÉNEMENTS — SECTION PRÉFÉRENCES
    // ============================================

    function attachPreferencesEvents() {
        const form = document.getElementById('preferences-form');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                userData.preferences = {
                    newsletter:              document.querySelector('input[name="newsletter"]').checked,
                    offres_personnalisees:   document.querySelector('input[name="offres_personnalisees"]').checked,
                    notifications_commandes: document.querySelector('input[name="notifications_commandes"]').checked,
                    notifications_promos:    document.querySelector('input[name="notifications_promos"]').checked
                };
                saveUserData(userData);
                showMessage('Préférences enregistrées', 'success');
            });
        }
    }

    // ============================================
    // ÉVÉNEMENTS — SECTION SÉCURITÉ
    // ============================================

    function attachSecuriteEvents() {
        contentDiv.querySelectorAll('.toggle-pw').forEach(btn => attachTogglePw(btn));

        const form = document.getElementById('password-form');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                const current = document.getElementById('current-password').value;
                const newPass = document.getElementById('new-password').value;
                const confirm = document.getElementById('confirm-password').value;

                if (!current || !newPass || !confirm) {
                    showMessage('Tous les champs sont obligatoires', 'error');
                    return;
                }

                const users = getUsers();
                const email = getSessionEmail();
                if (!users[email] || users[email].password !== current) {
                    showMessage('Mot de passe actuel incorrect', 'error');
                    return;
                }
                if (newPass.length < 6) {
                    showMessage('Le nouveau mot de passe doit contenir au moins 6 caractères', 'error');
                    return;
                }
                if (newPass !== confirm) {
                    showMessage('Les nouveaux mots de passe ne correspondent pas', 'error');
                    return;
                }

                users[email].password = newPass;
                saveUsers(users);
                showMessage('Mot de passe mis à jour avec succès', 'success');
                form.reset();
            });
        }
    }

    // ============================================
    // ÉVÉNEMENTS — SECTION DÉCONNEXION
    // ============================================

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
    // UTILITAIRES PARTAGÉS
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
        return str.replace(/[&<>"]/g, m => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;'
        }[m]));
    }

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function showMessage(text, type) {
        document.querySelectorAll('.form-message').forEach(m => m.remove());
        const msg       = document.createElement('div');
        msg.className   = `form-message ${type}`;
        msg.textContent = text;
        if (contentDiv) contentDiv.appendChild(msg);
        setTimeout(() => msg.remove(), 3500);
    }

    // ============================================
    // STYLES CSS DE L'ÉCRAN D'AUTHENTIFICATION
    // ============================================

    function injectAuthStyles() {
        if (document.getElementById('auth-styles')) return;
        const style    = document.createElement('style');
        style.id       = 'auth-styles';
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
            .auth-logo-img   { width: 48px; height: 48px; object-fit: contain; }
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
            .auth-forgot-link {
                text-align: center;
                margin-top: .75rem;
                font-size: .85rem;
            }
            .link-btn {
                background: none;
                border: none;
                color: var(--primary, #3B82F6);
                cursor: pointer;
                font-size: inherit;
                padding: 0;
                text-decoration: underline;
                text-underline-offset: 2px;
            }
            .link-btn:hover { opacity: .8; }
            .auth-back {
                display: flex;
                align-items: center;
                gap: .3rem;
                background: none;
                border: none;
                color: var(--text-secondary);
                cursor: pointer;
                font-size: .85rem;
                padding: 0;
                margin-bottom: 1.2rem;
            }
            .auth-back:hover { color: var(--text-primary); }
            .auth-panel-title {
                font-size: 1.1rem;
                font-weight: 600;
                color: var(--text-primary);
                margin-bottom: .5rem;
            }
            .auth-panel-desc {
                font-size: .85rem;
                color: var(--text-secondary);
                margin-bottom: 1.2rem;
                line-height: 1.5;
            }
            .auth-success {
                color: #10b981;
                font-size: .85rem;
                background: rgba(16,185,129,.08);
                border: 1px solid rgba(16,185,129,.25);
                border-radius: 8px;
                padding: .7rem .9rem;
                margin-bottom: .8rem;
                line-height: 1.5;
            }
            .reset-success {
                text-align: center;
                padding: 2rem 1rem;
                color: #10b981;
            }
            .reset-success-icon {
                font-size: 3rem;
                display: block;
                margin-bottom: .75rem;
            }
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
    // POINT D'ENTRÉE — Exécution au chargement du DOM
    // ============================================

    document.addEventListener('DOMContentLoaded', function() {
        initDemoAccount();

        // ── Détection d'un token de réinitialisation dans l'URL ───
        // Ex : page_profil.html?reset_token=abc123
        const urlParams  = new URLSearchParams(window.location.search);
        const resetToken = urlParams.get('reset_token');

        if (resetToken) {
            const tokenEmail = validateResetToken(resetToken);
            if (tokenEmail) {
                // Token valide : stocke-le temporairement et affiche directement le panel reset
                localStorage.setItem('peartech-reset-token', resetToken);
                showAuthScreen();
                // Petit délai pour laisser le DOM s'injecter
                setTimeout(function() {
                    showAuthPanel('reset');
                    const resetDesc = document.getElementById('reset-desc');
                    if (resetDesc) resetDesc.textContent = 'Nouveau mot de passe pour ' + tokenEmail;
                    // Nettoie l'URL sans recharger la page
                    window.history.replaceState({}, '', window.location.pathname);
                }, 50);
            } else {
                // Token invalide ou expiré
                showAuthScreen();
                setTimeout(function() {
                    showAuthPanel('forgot');
                    const errEl = document.getElementById('forgot-error');
                    if (errEl) {
                        errEl.textContent = 'Ce lien de réinitialisation est invalide ou a expiré (30 min). Veuillez en demander un nouveau.';
                        errEl.hidden = false;
                    }
                    window.history.replaceState({}, '', window.location.pathname);
                }, 50);
            }
            return; // Ne pas exécuter le flux normal
        }

        if (!isLoggedIn()) {
            showAuthScreen();
        } else {
            initProfile();
        }
    });

})();