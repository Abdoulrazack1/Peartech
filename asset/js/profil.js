// ============================================
// profil.js - Profil utilisateur + Authentification
// Auth simulée via localStorage (pas de backend)
// Clés : peartech-session, peartech-users, peartech-user-{id}
// ============================================

// IIFE : encapsule tout le code pour éviter de polluer le scope global
(function() {
    'use strict'; // Active le mode strict pour détecter les erreurs silencieuses

    // ============================================
    // AUTHENTIFICATION — clés localStorage et helpers
    // ============================================

    const SESSION_KEY = 'peartech-session'; // Clé localStorage qui stocke l'email de l'utilisateur connecté
    const USERS_KEY   = 'peartech-users';   // Clé localStorage qui stocke tous les comptes : { email: { password, prenom, nom } }

    // Génère une clé localStorage unique et sûre pour les données de profil d'un utilisateur
    // btoa() encode en base64 pour éviter les caractères spéciaux dans la clé (ex: "@", ".")
    // unescape(encodeURIComponent()) gère correctement les accents et caractères non-ASCII
    function userDataKey(email) {
        return 'peartech-user-' + btoa(unescape(encodeURIComponent(email))); // Retourne ex: "peartech-user-amVhbkBleGFtcGxlLmZy"
    }

    // Vérifie si l'utilisateur a une session active (email stocké en localStorage)
    // Le double "!!" convertit la valeur (string ou null) en booléen strict
    function isLoggedIn() {
        return !!localStorage.getItem(SESSION_KEY); // true si une session existe, false sinon
    }

    // Retourne l'email de l'utilisateur actuellement connecté (ou null si déconnecté)
    function getSessionEmail() {
        return localStorage.getItem(SESSION_KEY); // Lit directement la clé de session
    }

    // Charge et retourne l'objet contenant tous les comptes utilisateurs depuis localStorage
    function getUsers() {
        try {
            return JSON.parse(localStorage.getItem(USERS_KEY)) || {}; // Désérialise le JSON ou retourne un objet vide si rien
        } catch(e) {
            return {}; // Retourne un objet vide si le JSON est corrompu (évite un crash)
        }
    }

    // Sauvegarde l'objet des comptes utilisateurs dans localStorage
    function saveUsers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users)); // Sérialise l'objet en JSON avant de le stocker
    }

    // Crée un compte de démonstration si aucun compte n'existe encore
    // Permet de tester l'application sans créer de compte manuellement
    function initDemoAccount() {
        const users = getUsers();                          // Charge la liste des comptes existants
        if (Object.keys(users).length === 0) {             // Si aucun compte n'existe (objet vide)
            users['demo@peartech.fr'] = {                  // Crée le compte démo avec ses identifiants
                password: 'Demo1234',                      // Mot de passe du compte démo
                prenom: 'Jean',                            // Prénom par défaut du compte démo
                nom: 'Dupont'                              // Nom par défaut du compte démo
            };
            saveUsers(users);                              // Persiste le compte démo dans localStorage
        }
    }

    // ============================================
    // DONNÉES PROFIL PAR DÉFAUT
    // ============================================

    // Construit et retourne l'objet de données profil vide pour un nouvel utilisateur
    // Appelé à la première connexion d'un compte fraîchement créé
    function buildDefaultUserData(prenom, nom, email) {
        return {
            prenom: prenom,          // Prénom récupéré depuis le compte à la création
            nom: nom,                // Nom récupéré depuis le compte à la création
            email: email,            // Email de connexion, sert aussi d'identifiant unique
            naissance: '',           // Date de naissance vide par défaut (à remplir dans le profil)
            telephone: '',           // Téléphone vide par défaut
            photo: null,             // Photo de profil null : affichera l'icône SVG par défaut
            commandes: [],           // Tableau vide : l'utilisateur n'a pas encore commandé
            adresses: [],            // Tableau vide : aucune adresse de livraison enregistrée
            paiements: [],           // Tableau vide : aucun moyen de paiement enregistré
            preferences: {
                newsletter: false,              // Newsletter désactivée par défaut
                offres_personnalisees: false,   // Offres personnalisées désactivées par défaut
                notifications_commandes: true,  // Notifications de commande activées par défaut (utile)
                notifications_promos: false     // Alertes promotions désactivées par défaut
            }
        };
    }

    // Charge les données de profil de l'utilisateur connecté depuis localStorage
    // Si c'est sa première connexion, génère un profil par défaut depuis son compte
    function loadUserData() {
        const email = getSessionEmail();                         // Récupère l'email de la session en cours
        if (!email) return null;                                 // Personne connecté : retourne null

        const stored = localStorage.getItem(userDataKey(email)); // Cherche un profil existant pour cet email
        if (stored) {
            try { return JSON.parse(stored); } catch(e) {}      // Retourne le profil existant si trouvé et valide
        }

        // Aucun profil trouvé : première connexion de cet utilisateur
        const users   = getUsers();                             // Charge la liste des comptes
        const account = users[email] || {};                     // Récupère les données du compte (prenom, nom)
        return buildDefaultUserData(                            // Génère un profil vierge avec les infos du compte
            account.prenom || '',
            account.nom    || '',
            email
        );
    }

    // Sauvegarde les données de profil de l'utilisateur connecté dans localStorage
    function saveUserData(user) {
        const email = getSessionEmail();                                    // Vérifie qu'une session est active
        if (!email) return;                                                 // Sécurité : ne rien sauvegarder si déconnecté
        localStorage.setItem(userDataKey(email), JSON.stringify(user));    // Sérialise et stocke le profil
    }

    // ============================================
    // ÉCRAN D'AUTHENTIFICATION
    // ============================================

    // Crée et affiche l'écran de connexion/inscription/récupération de mot de passe
    // Appelé si l'utilisateur n'est pas connecté au chargement de la page
    function showAuthScreen() {
        const layout = document.querySelector('.profil-layout'); // Sélectionne le layout du profil (sidebar + contenu)
        if (layout) layout.style.display = 'none';              // Cache le layout profil : l'utilisateur n'est pas connecté

        const authDiv    = document.createElement('div'); // Crée le conteneur principal de l'écran d'auth
        authDiv.id       = 'auth-screen';                 // ID unique pour le retrouver et le supprimer plus tard

        // Injecte le HTML complet de l'écran d'auth (logo, onglets, 4 panels)
        authDiv.innerHTML = `
            <div class="auth-container">
                <!-- Logo PearTech centré en haut de la carte -->
                <div class="auth-logo">
                    <img src="asset/image/LogoProjetEcf.png" alt="PearTech" class="auth-logo-img">
                    <div>
                        <div class="auth-logo-title">PearTech</div>
                        <div class="auth-logo-sub">Mon espace client</div>
                    </div>
                </div>

                <!-- Onglets de navigation entre Connexion et Inscription -->
                <div class="auth-tabs" role="tablist">
                    <button class="auth-tab active" data-tab="login" role="tab" aria-selected="true">Connexion</button>
                    <button class="auth-tab" data-tab="register" role="tab" aria-selected="false">Créer un compte</button>
                </div>

                <!-- PANEL 1 : Connexion (affiché par défaut) -->
                <div class="auth-panel" id="auth-panel-login">
                    <!-- Bandeau informatif avec les identifiants du compte démo -->
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
                                <!-- autocomplete="current-password" aide le navigateur à proposer le bon mdp sauvegardé -->
                                <input type="password" id="login-password" placeholder="••••••••" autocomplete="current-password" required>
                                <!-- Bouton œil pour basculer entre texte et mot de passe masqué -->
                                <button type="button" class="toggle-pw" aria-label="Afficher/masquer le mot de passe">
                                    <span class="material-symbols-outlined">visibility</span>
                                </button>
                            </div>
                        </div>
                        <!-- Zone d'erreur de connexion, masquée par défaut (hidden) -->
                        <div id="login-error" class="auth-error" hidden></div>
                        <button type="submit" class="btn-primary auth-submit">Se connecter</button>
                        <!-- Lien vers le panel de récupération de mot de passe -->
                        <p class="auth-forgot-link">
                            <button type="button" id="btn-forgot-pw" class="link-btn">Mot de passe oublié ?</button>
                        </p>
                    </form>
                </div>

                <!-- PANEL 2 : Mot de passe oublié (masqué par défaut) -->
                <div class="auth-panel" id="auth-panel-forgot" hidden>
                    <!-- Bouton retour vers le panel de connexion -->
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
                        <!-- Zone d'erreur du formulaire oubli -->
                        <div id="forgot-error" class="auth-error" hidden></div>
                        <!-- Zone de succès (message de confirmation d'envoi) -->
                        <div id="forgot-success" class="auth-success" hidden></div>
                        <button type="submit" class="btn-primary auth-submit">Envoyer le lien</button>
                    </form>
                </div>

                <!-- PANEL 3 : Saisie du nouveau mot de passe (masqué par défaut) -->
                <div class="auth-panel" id="auth-panel-reset" hidden>
                    <h2 class="auth-panel-title">Nouveau mot de passe</h2>
                    <!-- Description dynamique : mise à jour par JS avec l'email concerné -->
                    <p class="auth-panel-desc" id="reset-desc">Choisissez un nouveau mot de passe pour votre compte.</p>
                    <form id="reset-form" novalidate>
                        <div class="form-group">
                            <label for="reset-password">Nouveau mot de passe</label>
                            <div class="password-wrapper">
                                <!-- minlength="6" validation HTML natif en complément de la validation JS -->
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
                        <!-- Zone d'erreur du formulaire de reset -->
                        <div id="reset-error" class="auth-error" hidden></div>
                        <button type="submit" class="btn-primary auth-submit">Enregistrer le nouveau mot de passe</button>
                    </form>
                </div>

                <!-- PANEL 4 : Inscription (masqué par défaut, activé via l'onglet "Créer un compte") -->
                <div class="auth-panel" id="auth-panel-register" hidden>
                    <form id="register-form" novalidate>
                        <!-- Ligne Prénom + Nom côte à côte -->
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
                                <!-- autocomplete="new-password" indique au navigateur de proposer un mot de passe fort -->
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
                        <!-- Checkbox obligatoire : acceptation des CGU/CGV avant inscription -->
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="reg-cgu" required>
                                <span>J'accepte les <a href="page_cgu.html" target="_blank">CGU</a> et les <a href="page_cgv.html" target="_blank">CGV</a></span>
                            </label>
                        </div>
                        <!-- Zone d'erreur du formulaire d'inscription -->
                        <div id="register-error" class="auth-error" hidden></div>
                        <button type="submit" class="btn-primary auth-submit">Créer mon compte</button>
                    </form>
                </div>
            </div>
        `;

        injectAuthStyles(); // Injecte dans <head> les styles CSS de l'écran d'auth (une seule fois)

        const main = document.getElementById('main-content'); // Récupère la zone de contenu principal
        if (main) main.appendChild(authDiv);                  // Insère l'écran d'auth dans le contenu principal

        attachAuthEvents(authDiv); // Attache tous les gestionnaires d'événements à l'écran d'auth
    }

    // ============================================
    // HELPER : affiche un seul panel, masque les trois autres
    // ============================================

    // Centralise la navigation entre les 4 panels d'auth pour éviter la répétition
    // name doit être 'login', 'register', 'forgot' ou 'reset'
    function showAuthPanel(name) {
        ['login', 'register', 'forgot', 'reset'].forEach(p => { // Parcourt les 4 noms de panel possibles
            const el = document.getElementById('auth-panel-' + p); // Sélectionne le panel par son ID
            if (el) el.hidden = (p !== name);                       // Masque tous sauf celui demandé
        });
    }

    // ============================================
    // ÉVÉNEMENTS DE L'ÉCRAN D'AUTH
    // ============================================

    // Attache tous les gestionnaires d'événements liés à l'authentification
    // authDiv : le conteneur #auth-screen créé dynamiquement
    function attachAuthEvents(authDiv) {

        // ── Onglets Connexion / Inscription ───────────────────────────────

        authDiv.querySelectorAll('.auth-tab').forEach(tab => {    // Sélectionne les deux boutons onglets
            tab.addEventListener('click', function() {
                authDiv.querySelectorAll('.auth-tab').forEach(t => {  // Désactive tous les onglets
                    t.classList.remove('active');                      // Retire la classe active (soulignement bleu)
                    t.setAttribute('aria-selected', 'false');         // Accessibilité : marque comme non sélectionné
                });
                this.classList.add('active');                          // Active l'onglet cliqué
                this.setAttribute('aria-selected', 'true');           // Accessibilité : marque comme sélectionné

                const target = this.dataset.tab;                      // Récupère "login" ou "register" depuis data-tab
                document.getElementById('auth-panel-login').hidden    = (target !== 'login');    // Affiche/masque le panel connexion
                document.getElementById('auth-panel-register').hidden = (target !== 'register'); // Affiche/masque le panel inscription
                document.getElementById('auth-panel-forgot').hidden   = true;                   // Toujours masqué lors du clic sur un onglet
                document.getElementById('auth-panel-reset').hidden    = true;                   // Toujours masqué lors du clic sur un onglet
            });
        });

        // ── Toggle visibilité des mots de passe ───────────────────────────
        // Gère tous les boutons "œil" présents dans l'écran d'auth au moment de sa création
        // Note : les boutons dans reset-form sont gérés séparément car injectés dynamiquement

        authDiv.querySelectorAll('.toggle-pw').forEach(btn => {    // Sélectionne tous les boutons œil
            btn.addEventListener('click', function() {
                const input = this.previousElementSibling;          // L'élément juste avant le bouton = le champ password
                const icon  = this.querySelector('.material-symbols-outlined'); // L'icône à l'intérieur du bouton
                if (input.type === 'password') {                    // Si le champ est masqué
                    input.type       = 'text';                      // Rend le texte visible
                    icon.textContent = 'visibility_off';            // Icône "œil barré" pour indiquer que c'est visible
                } else {                                            // Si le champ est visible
                    input.type       = 'password';                  // Remasque le texte
                    icon.textContent = 'visibility';                // Icône "œil" pour indiquer que c'est masqué
                }
            });
        });

        // ── Bouton "Mot de passe oublié ?" ────────────────────────────────

        const btnForgot = document.getElementById('btn-forgot-pw'); // Bouton discret sous le formulaire de connexion
        if (btnForgot) {
            btnForgot.addEventListener('click', function() {
                showAuthPanel('forgot');                                              // Passe au panel de récupération
                authDiv.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active')); // Désactive visuellement les onglets (hors flux normal)
            });
        }

        // ── Bouton "Retour à la connexion" depuis le panel oubli ──────────

        const btnBackLogin = document.getElementById('btn-back-login'); // Bouton flèche retour en haut du panel forgot
        if (btnBackLogin) {
            btnBackLogin.addEventListener('click', function() {
                showAuthPanel('login');                                               // Revient au panel de connexion
                authDiv.querySelectorAll('.auth-tab').forEach(t => {                 // Réactive l'onglet "Connexion"
                    t.classList.toggle('active', t.dataset.tab === 'login');         // Active uniquement l'onglet login
                });
                const f = document.getElementById('forgot-form');                   // Récupère le formulaire oubli
                if (f) { f.reset(); }                                                // Vide le champ email (nettoyage UX)
                document.getElementById('forgot-error').hidden   = true;            // Masque les éventuelles erreurs affichées
                document.getElementById('forgot-success').hidden = true;            // Masque le message de succès
            });
        }

        // ── Formulaire "Mot de passe oublié" ──────────────────────────────

        const forgotForm = document.getElementById('forgot-form'); // Formulaire avec le champ email de récupération
        if (forgotForm) {
            forgotForm.addEventListener('submit', function(e) {
                e.preventDefault();                                               // Bloque la soumission HTTP classique
                const email   = document.getElementById('forgot-email').value.trim().toLowerCase(); // Email saisi, normalisé en minuscules
                const errorEl = document.getElementById('forgot-error');          // Zone d'erreur du formulaire
                const succEl  = document.getElementById('forgot-success');        // Zone de message de succès

                errorEl.hidden = true;  // Cache l'erreur précédente avant revalidation
                succEl.hidden  = true;  // Cache le succès précédent avant revalidation

                if (!email) {                                                      // Vérification : champ vide
                    showAuthError(errorEl, 'Veuillez saisir votre adresse email.');
                    return;
                }
                if (!validateEmail(email)) {                                       // Vérification : format email invalide
                    showAuthError(errorEl, 'Adresse email invalide.');
                    return;
                }

                const users = getUsers(); // Charge la liste des comptes pour vérifier si l'email existe

                if (!users[email]) {
                    // Sécurité : on ne révèle pas si le compte existe ou non (protection anti-énumération)
                    // L'attaquant ne peut pas savoir quels emails sont enregistrés
                    succEl.innerHTML = `
                        <span class="material-symbols-outlined" style="font-size:1.1rem;vertical-align:middle;color:#10b981">check_circle</span>
                        Si un compte est associé à <strong>${escapeHtml(email)}</strong>, un email de réinitialisation vient d'être envoyé.
                    `;
                    succEl.hidden = false; // Affiche le message de succès générique
                    return;                // Arrête le traitement (compte inexistant mais pas signalé)
                }

                // Le compte existe : stocke temporairement l'email en attente de réinitialisation
                // Utilisé par le formulaire reset pour savoir quel compte modifier
                localStorage.setItem('peartech-reset-email', email);

                // Message de succès avec l'indication de simulation (pas de vrai email envoyé ici)
                succEl.innerHTML = `
                    <span class="material-symbols-outlined" style="font-size:1.1rem;vertical-align:middle;color:#10b981">check_circle</span>
                    Si un compte est associé à <strong>${escapeHtml(email)}</strong>, un email de réinitialisation vient d'être envoyé.<br><br>
                    <em style="font-size:.85rem;opacity:.8;">(Simulation : cliquez ci-dessous pour définir votre nouveau mot de passe.)</em>
                `;
                succEl.hidden = false; // Affiche le message de succès

                // Crée dynamiquement le bouton de passage au formulaire de reset (n'apparaît que si le compte existe)
                let resetBtn = document.getElementById('goto-reset-btn'); // Vérifie si le bouton existe déjà (soumission multiple)
                if (!resetBtn) {                                           // Crée le bouton seulement si absent
                    resetBtn             = document.createElement('button');  // Crée l'élément bouton
                    resetBtn.id          = 'goto-reset-btn';                  // ID pour le retrouver lors de soumissions multiples
                    resetBtn.type        = 'button';                          // type="button" pour ne pas soumettre le formulaire
                    resetBtn.className   = 'btn-secondary auth-submit';       // Classes CSS pour le style
                    resetBtn.style.marginTop = '.8rem';                       // Espacement depuis le message de succès
                    resetBtn.textContent = 'Définir un nouveau mot de passe →'; // Texte du bouton
                    forgotForm.appendChild(resetBtn);                         // Ajoute le bouton à la fin du formulaire
                }
                resetBtn.onclick = function() {                           // Clic sur ce bouton = passe au panel reset
                    const resetDesc = document.getElementById('reset-desc');       // Récupère la description du panel reset
                    if (resetDesc) resetDesc.textContent = `Nouveau mot de passe pour ${email}`; // Personnalise avec l'email
                    showAuthPanel('reset');                                         // Affiche le panel de nouveau mot de passe
                };
            });
        }

        // ── Formulaire "Nouveau mot de passe" ─────────────────────────────

        const resetForm = document.getElementById('reset-form'); // Formulaire avec les deux champs de nouveau mot de passe
        if (resetForm) {
            // Active les boutons œil des champs password du panel reset
            // (non couverts par le forEach initial car ce panel peut être injecté après)
            resetForm.querySelectorAll('.toggle-pw').forEach(btn => {
                btn.addEventListener('click', function() {
                    const input = this.previousElementSibling;                       // Champ password précédent le bouton
                    const icon  = this.querySelector('.material-symbols-outlined');  // Icône œil dans le bouton
                    if (input && input.tagName === 'INPUT') {                        // Vérifie que c'est bien un input
                        input.type = (input.type === 'password') ? 'text' : 'password'; // Bascule entre masqué et visible
                        if (icon) icon.textContent = (input.type === 'password') ? 'visibility' : 'visibility_off'; // Met à jour l'icône
                    }
                });
            });

            resetForm.addEventListener('submit', function(e) {
                e.preventDefault();                                                   // Bloque la soumission HTTP
                const newPass = document.getElementById('reset-password').value;     // Nouveau mot de passe saisi
                const confirm = document.getElementById('reset-confirm').value;      // Confirmation du nouveau mot de passe
                const errorEl = document.getElementById('reset-error');              // Zone d'erreur du formulaire reset
                const email   = localStorage.getItem('peartech-reset-email');        // Email du compte à modifier (stocké précédemment)

                errorEl.hidden = true; // Cache l'erreur précédente avant revalidation

                if (!email) {
                    // L'email temporaire n'est plus en localStorage : session de reset expirée ou page rechargée
                    showAuthError(errorEl, 'Session expirée. Recommencez depuis "Mot de passe oublié".');
                    return;
                }
                if (newPass.length < 6) {                                             // Validation de longueur minimale
                    showAuthError(errorEl, 'Le mot de passe doit contenir au moins 6 caractères.');
                    return;
                }
                if (newPass !== confirm) {                                            // Les deux champs doivent être identiques
                    showAuthError(errorEl, 'Les mots de passe ne correspondent pas.');
                    return;
                }

                // Tous les contrôles passés : sauvegarde le nouveau mot de passe
                const users = getUsers();               // Charge la liste des comptes
                if (users[email]) {                     // Vérifie que le compte existe encore (sécurité)
                    users[email].password = newPass;    // Remplace l'ancien mot de passe par le nouveau
                    saveUsers(users);                   // Persiste la modification dans localStorage
                }
                localStorage.removeItem('peartech-reset-email'); // Supprime l'email temporaire : reset terminé

                // Remplace le formulaire par un message de confirmation visuel avec icône verte
                resetForm.innerHTML = `
                    <div class="reset-success">
                        <span class="material-symbols-outlined reset-success-icon">check_circle</span>
                        <p>Mot de passe réinitialisé avec succès !</p>
                        <p style="font-size:.85rem;opacity:.7;">Redirection vers la connexion…</p>
                    </div>`;

                // Redirige automatiquement vers le panel de connexion après 2 secondes
                setTimeout(() => {
                    const loginEmailEl = document.getElementById('login-email'); // Champ email du formulaire de connexion
                    if (loginEmailEl) loginEmailEl.value = email;               // Pré-remplit l'email pour faciliter la reconnexion
                    showAuthPanel('login');                                       // Affiche le panel de connexion
                    authDiv.querySelectorAll('.auth-tab').forEach(t => {         // Réactive visuellement l'onglet Connexion
                        t.classList.toggle('active', t.dataset.tab === 'login'); // Active uniquement l'onglet login
                    });
                }, 2000); // Délai de 2 secondes pour laisser le temps de lire le message de confirmation
            });
        }

        // ── Formulaire de connexion ────────────────────────────────────────

        const loginForm = document.getElementById('login-form'); // Formulaire email + mot de passe du panel connexion
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();                                                     // Bloque la soumission HTTP classique
                const email    = document.getElementById('login-email').value.trim().toLowerCase(); // Email normalisé en minuscules
                const password = document.getElementById('login-password').value;      // Mot de passe (non normalisé : sensible à la casse)
                const errorEl  = document.getElementById('login-error');               // Zone d'erreur du formulaire de connexion

                if (!email || !password) {                              // Vérifie que les deux champs sont remplis
                    showAuthError(errorEl, 'Veuillez remplir tous les champs.');
                    return;
                }
                if (!validateEmail(email)) {                           // Vérifie le format de l'email
                    showAuthError(errorEl, 'Email invalide.');
                    return;
                }

                const users = getUsers(); // Charge la liste des comptes pour vérifier les identifiants
                if (!users[email] || users[email].password !== password) { // Compte inexistant OU mauvais mot de passe
                    showAuthError(errorEl, 'Email ou mot de passe incorrect.'); // Message générique (ne précise pas lequel est faux)
                    return;
                }

                // Identifiants corrects : ouvre la session
                localStorage.setItem(SESSION_KEY, email); // Stocke l'email en session : l'utilisateur est connecté
                errorEl.hidden = true;                    // Cache la zone d'erreur (nettoyage)
                initProfile();                            // Lance l'affichage du profil
            });
        }

        // ── Formulaire d'inscription ───────────────────────────────────────

        const registerForm = document.getElementById('register-form'); // Formulaire de création de compte
        if (registerForm) {
            registerForm.addEventListener('submit', function(e) {
                e.preventDefault();                                                          // Bloque la soumission HTTP
                const prenom   = document.getElementById('reg-prenom').value.trim();        // Prénom, espaces en début/fin retirés
                const nom      = document.getElementById('reg-nom').value.trim();           // Nom, nettoyé pareillement
                const email    = document.getElementById('reg-email').value.trim().toLowerCase(); // Email normalisé
                const password = document.getElementById('reg-password').value;             // Mot de passe choisi
                const confirm  = document.getElementById('reg-confirm').value;              // Confirmation du mot de passe
                const cgu      = document.getElementById('reg-cgu').checked;               // État de la checkbox CGU
                const errorEl  = document.getElementById('register-error');                 // Zone d'erreur d'inscription

                if (!prenom || !nom || !email || !password || !confirm) { // Tous les champs sauf CGU doivent être remplis
                    showAuthError(errorEl, 'Tous les champs obligatoires doivent être remplis.');
                    return;
                }
                if (!validateEmail(email)) {                           // Format d'email invalide
                    showAuthError(errorEl, 'Adresse email invalide.');
                    return;
                }
                if (password.length < 6) {                            // Mot de passe trop court
                    showAuthError(errorEl, 'Le mot de passe doit contenir au moins 6 caractères.');
                    return;
                }
                if (password !== confirm) {                           // Les deux mots de passe saisis ne correspondent pas
                    showAuthError(errorEl, 'Les mots de passe ne correspondent pas.');
                    return;
                }
                if (!cgu) {                                           // L'utilisateur n'a pas coché les CGU/CGV
                    showAuthError(errorEl, 'Vous devez accepter les CGU et CGV.');
                    return;
                }

                const users = getUsers();                   // Charge la liste des comptes existants
                if (users[email]) {                         // Vérifie si l'email est déjà utilisé
                    showAuthError(errorEl, 'Un compte existe déjà avec cet email.');
                    return;
                }

                // Toutes les validations passées : crée le compte
                users[email] = { password, prenom, nom };  // Ajoute le nouveau compte à la liste
                saveUsers(users);                           // Persiste la liste mise à jour

                localStorage.setItem(SESSION_KEY, email);  // Ouvre immédiatement la session (connexion automatique)

                // Crée et sauvegarde le profil par défaut pour ce nouvel utilisateur
                const newUserData = buildDefaultUserData(prenom, nom, email); // Génère l'objet profil vide
                localStorage.setItem(userDataKey(email), JSON.stringify(newUserData)); // Stocke le profil

                errorEl.hidden = true; // Cache la zone d'erreur (nettoyage)
                initProfile();         // Lance l'affichage du profil sans repasser par la connexion
            });
        }
    }

    // Affiche un message d'erreur dans une zone dédiée et la rend visible
    // el : l'élément DOM de la zone d'erreur — msg : le texte d'erreur à afficher
    function showAuthError(el, msg) {
        el.textContent = msg;                                         // Injecte le texte d'erreur
        el.hidden      = false;                                       // Rend la zone visible (était hidden)
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); // Fait défiler jusqu'à l'erreur si hors écran
    }

    // ============================================
    // INITIALISATION DU PROFIL (utilisateur connecté)
    // ============================================

    // Supprime l'écran d'auth et affiche le profil de l'utilisateur connecté
    // Appelé après une connexion ou inscription réussie, ou directement si déjà connecté
    function initProfile() {
        const authScreen = document.getElementById('auth-screen'); // Cherche l'écran d'auth dans le DOM
        if (authScreen) authScreen.remove();                       // Le supprime complètement s'il est présent

        const layout = document.querySelector('.profil-layout');   // Récupère le layout principal du profil
        if (layout) layout.style.display = '';                     // Réaffiche le layout (avait été masqué)

        // Personnalise le titre de la sidebar avec le prénom de l'utilisateur
        const sidebarTitle = document.querySelector('.sidebar-title'); // Titre en haut de la sidebar
        if (sidebarTitle) {
            const users   = getUsers();                    // Charge la liste des comptes
            const email   = getSessionEmail();             // Récupère l'email connecté
            const account = users[email] || {};            // Cherche le compte correspondant
            if (account.prenom) sidebarTitle.textContent = 'Bonjour, ' + account.prenom + ' !'; // Message de bienvenue personnalisé
        }

        startProfile(); // Lance l'affichage des sections du profil
    }

    // ============================================
    // PROFIL — DONNÉES ET RENDU
    // ============================================

    let userData    = null; // Données de profil de l'utilisateur connecté (chargées par startProfile)
    let sidebarLinks, contentDiv; // Références DOM initialisées dans startProfile

    // Initialise les données et la navigation du profil
    // Appelé une fois après initProfile()
    function startProfile() {
        userData     = loadUserData();                                      // Charge les données de profil depuis localStorage
        sidebarLinks = document.querySelectorAll('.sidebar-link');          // Tous les liens de navigation dans la sidebar
        contentDiv   = document.getElementById('profil-content');           // Zone de contenu dynamique à droite

        if (!contentDiv) {                                                  // Vérification de sécurité
            console.error('Élément #profil-content introuvable');
            return;
        }

        // Détermine la section à afficher en priorité :
        // ?section=commandes dans l'URL (ex: depuis page_confirmation.html) ou 'info' par défaut
        const urlParams     = new URLSearchParams(window.location.search); // Parse les paramètres de l'URL
        const initSection   = urlParams.get('section') || 'info';         // Lit ?section= ou utilise 'info'
        showSection(initSection);                                           // Affiche la section initiale

        // Attache les clics sur tous les liens de la sidebar
        sidebarLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();                   // Empêche la navigation HTML (les liens ont href="#")
                showSection(this.dataset.section);    // Charge et affiche la section correspondante
            });
        });
    }

    // ============================================
    // NAVIGATION ENTRE SECTIONS DU PROFIL
    // ============================================

    // Affiche une section du profil et met à jour l'état actif dans la sidebar
    // sectionId : identifiant de la section ('info', 'commandes', 'adresses', etc.)
    function showSection(sectionId) {
        // Met à jour l'état visuel (actif/inactif) de chaque lien de la sidebar
        sidebarLinks.forEach(link => {
            link.classList.remove('active');          // Désactive tous les liens
            link.removeAttribute('aria-current');     // Retire l'attribut d'accessibilité
            if (link.dataset.section === sectionId) { // Ré-active uniquement le lien de la section courante
                link.classList.add('active');
                link.setAttribute('aria-current', 'true'); // Indique aux lecteurs d'écran la page active
            }
        });

        // Génère le HTML de la section demandée
        let html = '';
        switch (sectionId) {
            case 'info':        html = renderInfoSection();        break; // Informations personnelles + photo
            case 'commandes':   html = renderCommandesSection();   break; // Historique des commandes
            case 'adresses':    html = renderAdressesSection();    break; // Carnet d'adresses
            case 'paiement':    html = renderPaiementSection();    break; // Moyens de paiement
            case 'preferences': html = renderPreferencesSection(); break; // Préférences de communication
            case 'securite':    html = renderSecuriteSection();    break; // Changement de mot de passe
            case 'deconnexion': html = renderDeconnexionSection(); break; // Bouton de déconnexion
            default:            html = '<p>Section inconnue</p>';         // Fallback pour les IDs non reconnus
        }
        contentDiv.innerHTML = html;          // Injecte le HTML dans la zone de contenu
        attachSectionEvents(sectionId);       // Attache les événements spécifiques à la section rendue
    }

    // ============================================
    // RENDU HTML DES SECTIONS
    // ============================================

    // Génère le HTML de la section "Informations personnelles"
    // Contient le formulaire d'édition du profil et l'upload de photo
    function renderInfoSection() {
        const user = userData; // Raccourci vers les données de l'utilisateur connecté
        return `
            <h1 class="content-title">Informations personnelles</h1>
            <!-- Section photo de profil avec prévisualisation et upload -->
            <div class="photo-section">
                <div class="photo-container">
                    <!-- Zone de prévisualisation : affiche la photo ou une icône SVG par défaut -->
                    <div class="photo-placeholder" id="photo-preview">
                        ${user.photo
                            ? `<img src="${user.photo}" alt="Photo de profil">` // Photo existante encodée en base64
                            : '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'} <!-- Silhouette SVG si pas de photo -->
                    </div>
                    <div class="photo-upload">
                        <!-- Label cliquable lié à l'input file caché (hidden) -->
                        <label for="photo-input" class="btn-secondary">Changer la photo</label>
                        <input type="file" id="photo-input" accept="image/jpeg,image/png" hidden>
                        <p class="photo-hint">JPG ou PNG, max 2 Mo</p>
                    </div>
                </div>
            </div>
            <!-- Formulaire d'édition des informations personnelles -->
            <form id="info-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="prenom">Prénom</label>
                        <!-- value pré-rempli avec les données actuelles (escapeHtml pour sécurité XSS) -->
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
                    <!-- || '' : évite d'afficher "null" ou "undefined" si le champ est vide -->
                    <input type="tel" id="telephone" value="${escapeHtml(user.telephone || '')}">
                </div>
                <div class="form-group">
                    <label for="naissance">Date de naissance</label>
                    <!-- Format attendu par type="date" : YYYY-MM-DD -->
                    <input type="date" id="naissance" value="${user.naissance || ''}">
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary">Enregistrer les modifications</button>
                </div>
            </form>
        `;
    }

    // Génère le HTML de la section "Mes commandes"
    // Affiche un état vide si aucune commande, sinon liste les commandes avec bouton de suivi
    function renderCommandesSection() {
        const commandes = userData.commandes; // Tableau des commandes de l'utilisateur
        if (!commandes || commandes.length === 0) {  // Aucune commande : affiche l'état vide
            return `
                <h1 class="content-title">Mes commandes</h1>
                <div class="empty-state">
                    <span class="material-symbols-outlined" style="font-size:3rem;opacity:.4;">receipt_long</span>
                    <p>Vous n'avez pas encore passé de commande.</p>
                    <a href="page_catalogue.html" class="btn-primary">Découvrir le catalogue</a>
                </div>`;
        }
        let html = '<h1 class="content-title">Mes commandes</h1><div class="commandes-list">'; // Ouvre la liste
        commandes.forEach(cmd => {
            // Détermine la classe CSS du badge de statut selon l'état de la commande
            const statusClass  = cmd.status === 'livré'     ? 'status-livre'
                               : cmd.status === 'en cours'  ? 'status-encours'
                               :                              'status-annule';
            const dateFormatee = new Date(cmd.date).toLocaleDateString('fr-FR'); // Formate la date en français (ex: 15/02/2025)
            html += `
                <div class="commande-card" data-commande-id="${cmd.id}">
                    <div class="commande-infos">
                        <h3>Commande ${cmd.id}</h3>
                        <!-- toFixed(2) formate le total avec 2 décimales, replace remplace le point par une virgule -->
                        <p>Date : ${dateFormatee} — Total : ${cmd.total.toFixed(2).replace('.',',')} €</p>
                        <!-- join(', ') transforme le tableau d'articles en chaîne lisible -->
                        <p>Articles : ${cmd.articles.join(', ')}</p>
                    </div>
                    <!-- Badge coloré selon le statut -->
                    <span class="commande-status ${statusClass}">${cmd.status}</span>
                    <!-- Bouton de suivi : data-commande-id permet de retrouver la commande dans attachCommandesEvents -->
                    <button class="btn-suivi" data-commande-id="${cmd.id}">Suivre</button>
                </div>`;
        });
        html += '</div>'; // Ferme la liste des commandes
        return html;
    }

    // Génère le HTML de la section "Mes adresses"
    // Affiche la grille des adresses enregistrées avec les boutons d'action
    function renderAdressesSection() {
        const adresses = userData.adresses;                                        // Tableau des adresses sauvegardées
        let html = '<h1 class="content-title">Mes adresses</h1><div class="adresses-grid">'; // Ouvre la grille
        if (!adresses || adresses.length === 0) {                                  // Aucune adresse : message d'information
            html += '<p style="color:var(--text-secondary)">Aucune adresse enregistrée.</p>';
        }
        (adresses || []).forEach(addr => { // || [] : sécurité si adresses est null
            html += `
                <!-- Classe "principale" ajoutée si c'est l'adresse par défaut -->
                <div class="adresse-card ${addr.principale ? 'principale' : ''}" data-id="${addr.id}">
                    <!-- Badge "Principale" visible uniquement sur l'adresse par défaut -->
                    ${addr.principale ? '<span class="adresse-badge">Principale</span>' : ''}
                    <h3>${escapeHtml(addr.nom)}</h3>
                    <p>${escapeHtml(addr.rue)}</p>
                    <!-- Ligne complément affichée seulement si le champ n'est pas vide -->
                    ${addr.complement ? `<p>${escapeHtml(addr.complement)}</p>` : ''}
                    <p>${escapeHtml(addr.codePostal)} ${escapeHtml(addr.ville)}</p>
                    <p>${escapeHtml(addr.pays)}</p>
                    <!-- Boutons d'action : icônes SVG inline pour éviter les dépendances externes -->
                    <div class="adresse-actions">
                        <button class="btn-icon edit-adresse" title="Modifier"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                        <button class="btn-icon delete-adresse" title="Supprimer"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>
                        <!-- Bouton "étoile" visible seulement sur les adresses non-principales -->
                        ${!addr.principale ? '<button class="btn-icon set-principale" title="Définir comme principale"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></button>' : ''}
                    </div>
                </div>`;
        });
        html += '</div><button class="btn-primary" id="add-adresse" style="margin-top:1rem">Ajouter une adresse</button>'; // Ferme la grille + bouton ajout
        return html;
    }

    // Génère le HTML de la section "Moyens de paiement"
    // Affiche les cartes bancaires et comptes PayPal enregistrés
    function renderPaiementSection() {
        const paiements = userData.paiements;                                          // Tableau des moyens de paiement
        let html = '<h1 class="content-title">Moyens de paiement</h1><div class="paiement-list">'; // Ouvre la liste
        if (!paiements || paiements.length === 0) {                                    // Aucun moyen de paiement enregistré
            html += '<p style="color:var(--text-secondary)">Aucun moyen de paiement enregistré.</p>';
        }
        (paiements || []).forEach(pm => {      // Parcourt chaque moyen de paiement
            if (pm.type === 'Visa' || pm.type === 'MasterCard') { // Cas carte bancaire (Visa ou Mastercard)
                html += `
                    <div class="paiement-card" data-id="${pm.id}">
                        <div class="paiement-icon">💳</div>
                        <div class="paiement-infos">
                            <!-- slice(-4) extrait les 4 derniers caractères du numéro masqué -->
                            <h3>${pm.type} terminant par ${pm.numero.slice(-4)}</h3>
                            <p>Expire le ${pm.expire} — ${pm.titulaire}</p>
                        </div>
                        <div class="paiement-actions">
                            <button class="btn-icon edit-paiement" title="Modifier"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                            <button class="btn-icon delete-paiement" title="Supprimer"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>
                        </div>
                    </div>`;
            } else if (pm.type === 'PayPal') { // Cas compte PayPal (affiche l'email au lieu du numéro de carte)
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
        html += '</div><button class="btn-primary" id="add-paiement" style="margin-top:1rem">Ajouter un moyen de paiement</button>'; // Ferme la liste + bouton ajout
        return html;
    }

    // Génère le HTML de la section "Préférences de communication"
    // Checkboxes pour gérer newsletter, offres et notifications
    function renderPreferencesSection() {
        const prefs = userData.preferences; // Raccourci vers l'objet de préférences
        return `
            <h1 class="content-title">Préférences de communication</h1>
            <form id="preferences-form">
                <div class="preferences-group">
                    <h3>Email</h3>
                    <!-- Ternaire : "checked" si la préférence est true, chaîne vide sinon -->
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

    // Génère le HTML de la section "Sécurité"
    // Formulaire de changement de mot de passe avec vérification de l'ancien
    function renderSecuriteSection() {
        return `
            <h1 class="content-title">Sécurité</h1>
            <form id="password-form">
                <div class="form-group">
                    <label for="current-password">Mot de passe actuel</label>
                    <!-- password-wrapper positionne le bouton œil en absolu sur le champ -->
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
                    <!-- Pas de bouton œil ici : champ de confirmation simple -->
                    <input type="password" id="confirm-password" placeholder="Répétez le mot de passe" required>
                </div>
                <button type="submit" class="btn-primary">Mettre à jour le mot de passe</button>
            </form>`;
    }

    // Génère le HTML de la section "Déconnexion"
    // Simple confirmation avant de détruire la session
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

    // Délègue l'attachement des événements à la fonction spécialisée de la section
    // Appelé systématiquement après chaque rendu dans showSection()
    function attachSectionEvents(sectionId) {
        switch (sectionId) {
            case 'info':        attachInfoEvents();        break; // Photo + formulaire infos personnelles
            case 'commandes':   attachCommandesEvents();   break; // Boutons "Suivre" des commandes
            case 'adresses':    attachAdressesEvents();    break; // CRUD adresses (ajouter/modifier/supprimer)
            case 'paiement':    attachPaiementEvents();    break; // CRUD moyens de paiement
            case 'preferences': attachPreferencesEvents(); break; // Sauvegarde des checkboxes
            case 'securite':    attachSecuriteEvents();    break; // Changement de mot de passe
            case 'deconnexion': attachDeconnexionEvents(); break; // Bouton de déconnexion
        }
    }

    // ============================================
    // ÉVÉNEMENTS — SECTION INFORMATIONS
    // ============================================

    function attachInfoEvents() {
        contentDiv.querySelectorAll('.toggle-pw').forEach(btn => attachTogglePw(btn)); // Active les boutons œil éventuellement présents

        const photoInput   = document.getElementById('photo-input');   // Input file caché pour l'upload de photo
        const photoPreview = document.getElementById('photo-preview'); // Zone de prévisualisation de la photo

        if (photoInput) {
            photoInput.addEventListener('change', function(e) {
                const file = e.target.files[0];                    // Premier fichier sélectionné par l'utilisateur
                if (!file) return;                                 // Annulation de la sélection : rien à faire
                if (file.size > 2 * 1024 * 1024) {                // Vérifie que le fichier ne dépasse pas 2 Mo (2 * 1024 * 1024 octets)
                    showMessage('Photo max 2 Mo', 'error');
                    return;
                }
                if (!file.type.match('image/(jpeg|png)')) {        // Vérifie que le type MIME est bien JPG ou PNG
                    showMessage('Format JPG ou PNG uniquement', 'error');
                    return;
                }
                const reader = new FileReader();                   // API navigateur pour lire le fichier localement
                reader.onload = function(ev) {
                    photoPreview.innerHTML = `<img src="${ev.target.result}" alt="Photo de profil">`; // Affiche l'aperçu en base64
                    userData.photo = ev.target.result;             // Stocke la photo base64 dans les données de l'utilisateur
                    saveUserData(userData);                        // Persiste immédiatement la photo dans localStorage
                    showMessage('Photo mise à jour', 'success');   // Confirme visuellement la mise à jour
                };
                reader.readAsDataURL(file);                        // Lance la lecture du fichier : déclenche onload avec le résultat base64
            });
        }

        const infoForm = document.getElementById('info-form'); // Formulaire des informations personnelles
        if (infoForm) {
            infoForm.addEventListener('submit', function(e) {
                e.preventDefault();                                                      // Bloque la soumission HTTP
                const prenom    = document.getElementById('prenom').value.trim();       // Prénom nettoyé
                const nom       = document.getElementById('nom').value.trim();          // Nom nettoyé
                const email     = document.getElementById('email').value.trim();        // Email nettoyé
                const telephone = document.getElementById('telephone').value.trim();    // Téléphone (optionnel)
                const naissance = document.getElementById('naissance').value;           // Date YYYY-MM-DD (format natif de type="date")

                if (!prenom || !nom || !email) {                                        // Validation : champs obligatoires
                    showMessage('Les champs Prénom, Nom et Email sont obligatoires', 'error');
                    return;
                }
                if (!validateEmail(email)) {                                            // Validation : format email
                    showMessage('Email invalide', 'error');
                    return;
                }

                // Mise à jour de l'objet userData avec les nouvelles valeurs
                userData.prenom    = prenom;    // Met à jour le prénom
                userData.nom       = nom;       // Met à jour le nom
                userData.email     = email;     // Met à jour l'email
                userData.telephone = telephone; // Met à jour le téléphone
                userData.naissance = naissance; // Met à jour la date de naissance
                saveUserData(userData);         // Persiste toutes les modifications
                showMessage('Informations mises à jour', 'success'); // Confirmation visuelle
            });
        }
    }

    // ============================================
    // ÉVÉNEMENTS — SECTION COMMANDES
    // ============================================

    function attachCommandesEvents() {
        document.querySelectorAll('.btn-suivi').forEach(btn => { // Sélectionne tous les boutons "Suivre"
            btn.addEventListener('click', function() {
                // Retrouve la commande correspondante par son ID dans le tableau userData.commandes
                const commande = userData.commandes.find(c => c.id === this.dataset.commandeId);
                if (commande) showSuiviModal(commande); // Ouvre la modale de suivi si la commande est trouvée
            });
        });
    }

    // Crée et affiche une modale avec la timeline de suivi d'une commande
    function showSuiviModal(commande) {
        const modal = document.createElement('div');  // Crée l'overlay de la modale
        modal.className = 'suivi-modal active';        // 'active' rend la modale visible via CSS
        modal.innerHTML = `
            <div class="suivi-modal-content">
                <h2>Suivi — Commande ${commande.id}</h2>
                <div class="suivi-timeline">
                    ${(commande.suivi || []).map((etape, i) => { // || [] : sécurité si suivi est absent
                        const last = i === commande.suivi.length - 1; // Dernière étape du tableau (= étape la plus récente)
                        // La dernière étape est "completed" si livrée, "active" si encore en cours
                        const cls  = last && commande.status === 'livré' ? 'completed' : (last ? 'active' : 'completed');
                        return `
                            <div class="timeline-item ${cls}">
                                <!-- toLocaleString formate la date en format français avec heure -->
                                <div class="timeline-date">${new Date(etape.date).toLocaleString('fr-FR')}</div>
                                <div class="timeline-title">${etape.titre}</div>
                                <div class="timeline-desc">${etape.description}</div>
                            </div>`;
                    }).join('')} <!-- join('') concatène les items sans séparateur -->
                </div>
                <button class="btn-secondary" id="close-modal">Fermer</button>
            </div>`;
        document.body.appendChild(modal);                                              // Ajoute la modale au body
        modal.querySelector('#close-modal').addEventListener('click', () => modal.remove()); // Fermeture via bouton
        modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });  // Fermeture en cliquant sur l'overlay
    }

    // ============================================
    // ÉVÉNEMENTS — SECTION ADRESSES
    // ============================================

    function attachAdressesEvents() {
        // Boutons "Modifier" : ouvrent le formulaire pré-rempli de l'adresse sélectionnée
        document.querySelectorAll('.edit-adresse').forEach(btn => {
            btn.addEventListener('click', function() {
                const id   = this.closest('.adresse-card').dataset.id;             // ID de l'adresse via data-id sur la card parente
                const addr = (userData.adresses || []).find(a => a.id === id);     // Retrouve l'adresse dans le tableau
                if (addr) showAdresseForm(addr);                                   // Ouvre le formulaire en mode édition
            });
        });

        // Boutons "Supprimer" : confirme puis retire l'adresse du tableau
        document.querySelectorAll('.delete-adresse').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.closest('.adresse-card').dataset.id; // ID de l'adresse à supprimer
                if (confirm('Supprimer cette adresse ?')) {           // Boîte de dialogue de confirmation native du navigateur
                    userData.adresses = (userData.adresses || []).filter(a => a.id !== id); // Filtre : garde toutes sauf celle supprimée
                    saveUserData(userData);                           // Persiste la liste mise à jour
                    showSection('adresses');                          // Re-rend la section pour refléter la suppression
                    showMessage('Adresse supprimée', 'success');
                }
            });
        });

        // Boutons "Étoile" : définit une adresse comme principale (désactive les autres)
        document.querySelectorAll('.set-principale').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.closest('.adresse-card').dataset.id;                           // ID de l'adresse à promouvoir
                (userData.adresses || []).forEach(a => a.principale = (a.id === id));          // true seulement pour l'adresse cliquée
                saveUserData(userData);                                                         // Persiste le changement
                showSection('adresses');                                                        // Re-rend la section
                showMessage('Adresse principale mise à jour', 'success');
            });
        });

        const addBtn = document.getElementById('add-adresse');             // Bouton "Ajouter une adresse"
        if (addBtn) addBtn.addEventListener('click', () => showAdresseForm(null)); // null = mode création (pas d'adresse existante)
    }

    // Affiche le formulaire d'ajout ou de modification d'une adresse
    // existing : l'adresse à modifier (objet) ou null pour en créer une nouvelle
    function showAdresseForm(existing) {
        const isEdit  = !!existing; // true si modification, false si création (double négation pour convertir en booléen)
        const formHtml = `
            <div class="adresse-form">
                <!-- Titre dynamique selon le mode -->
                <h3>${isEdit ? 'Modifier' : 'Ajouter'} une adresse</h3>
                <form id="adresse-form-detail">
                    <!-- existing?.nom : optional chaining — si existing est null, retourne undefined (puis || '' = chaîne vide) -->
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

        const grid = document.querySelector('.adresses-grid');     // Grille des adresses existantes
        document.querySelector('.adresse-form')?.remove();         // Supprime un formulaire déjà ouvert (évite les doublons)
        grid.insertAdjacentHTML('afterend', formHtml);             // Insère le formulaire juste après la grille

        // Bouton Annuler : ferme le formulaire sans rien modifier
        document.getElementById('cancel-adresse-form').addEventListener('click', () => {
            document.querySelector('.adresse-form').remove(); // Supprime le formulaire du DOM
        });

        // Soumission du formulaire d'adresse
        document.getElementById('adresse-form-detail').addEventListener('submit', function(e) {
            e.preventDefault(); // Bloque la soumission HTTP
            const newAddr = {
                id:         isEdit ? existing.id : 'addr' + Date.now(), // Conserve l'ID existant ou génère un ID unique via timestamp
                nom:        document.getElementById('addr-nom').value.trim(),        // Nom de l'adresse
                rue:        document.getElementById('addr-rue').value.trim(),        // Numéro et rue
                complement: document.getElementById('addr-complement').value.trim(), // Complément (peut être vide)
                codePostal: document.getElementById('addr-cp').value.trim(),         // Code postal
                ville:      document.getElementById('addr-ville').value.trim(),      // Ville
                pays:       document.getElementById('addr-pays').value.trim(),       // Pays
                principale: document.getElementById('addr-principale').checked       // État de la checkbox
            };

            if (!newAddr.nom || !newAddr.rue || !newAddr.codePostal || !newAddr.ville) { // Champs obligatoires manquants
                showMessage('Champs obligatoires manquants', 'error');
                return;
            }

            if (!userData.adresses) userData.adresses = []; // Initialise le tableau si null/undefined

            if (isEdit) {
                const idx = userData.adresses.findIndex(a => a.id === existing.id); // Trouve la position de l'adresse dans le tableau
                if (idx !== -1) userData.adresses[idx] = newAddr;                   // Remplace l'ancienne adresse par la nouvelle
            } else {
                userData.adresses.push(newAddr); // Ajoute la nouvelle adresse à la fin du tableau
            }

            // Si la nouvelle adresse est définie comme principale, désactive les autres
            if (newAddr.principale) {
                userData.adresses.forEach(a => { if (a.id !== newAddr.id) a.principale = false; });
            }

            saveUserData(userData);    // Persiste le tableau mis à jour
            showSection('adresses');   // Re-rend la section pour afficher les changements
            showMessage(isEdit ? 'Adresse mise à jour' : 'Adresse ajoutée', 'success');
        });
    }

    // ============================================
    // ÉVÉNEMENTS — SECTION PAIEMENT
    // ============================================

    function attachPaiementEvents() {
        // Boutons "Modifier" des moyens de paiement
        document.querySelectorAll('.edit-paiement').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.closest('.paiement-card').dataset.id;             // ID du moyen de paiement
                const pm = (userData.paiements || []).find(p => p.id === id);    // Retrouve le moyen de paiement
                if (pm) showPaiementForm(pm);                                     // Ouvre le formulaire en mode édition
            });
        });

        // Boutons "Supprimer" des moyens de paiement
        document.querySelectorAll('.delete-paiement').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.closest('.paiement-card').dataset.id; // ID du moyen à supprimer
                if (confirm('Supprimer ce moyen de paiement ?')) {    // Confirmation native
                    userData.paiements = (userData.paiements || []).filter(p => p.id !== id); // Retire de la liste
                    saveUserData(userData);                            // Persiste
                    showSection('paiement');                           // Re-rend
                    showMessage('Moyen de paiement supprimé', 'success');
                }
            });
        });

        const addBtn = document.getElementById('add-paiement');                  // Bouton "Ajouter un moyen de paiement"
        if (addBtn) addBtn.addEventListener('click', () => showPaiementForm(null)); // null = mode création
    }

    // Affiche le formulaire d'ajout ou de modification d'un moyen de paiement
    // existing : le moyen de paiement à modifier ou null pour en créer un
    function showPaiementForm(existing) {
        const isEdit  = !!existing; // true si modification
        const formHtml = `
            <div class="adresse-form">
                <h3>${isEdit ? 'Modifier' : 'Ajouter'} un moyen de paiement</h3>
                <form id="paiement-form-detail">
                    <div class="form-group">
                        <label for="pm-type">Type</label>
                        <!-- La valeur selected correspond au type actuel (ou Visa par défaut) -->
                        <select id="pm-type">
                            <option value="Visa" ${existing?.type==='Visa'?'selected':''}>Visa</option>
                            <option value="MasterCard" ${existing?.type==='MasterCard'?'selected':''}>MasterCard</option>
                            <option value="PayPal" ${existing?.type==='PayPal'?'selected':''}>PayPal</option>
                        </select>
                    </div>
                    <!-- Champs spécifiques aux cartes bancaires (masqués si PayPal sélectionné) -->
                    <div class="form-group" id="pm-numero-group"><label for="pm-numero">Numéro de carte</label><input type="text" id="pm-numero" value="${escapeHtml(existing?.numero||'')}" placeholder="**** **** **** ****"></div>
                    <div class="form-group" id="pm-expire-group"><label for="pm-expire">Expiration (MM/AA)</label><input type="text" id="pm-expire" value="${escapeHtml(existing?.expire||'')}" placeholder="MM/AA"></div>
                    <div class="form-group" id="pm-titulaire-group"><label for="pm-titulaire">Titulaire</label><input type="text" id="pm-titulaire" value="${escapeHtml(existing?.titulaire||'')}"></div>
                    <!-- Champ spécifique PayPal (masqué par défaut, affiché si PayPal sélectionné) -->
                    <div class="form-group" id="pm-email-group" style="display:none"><label for="pm-email">Email PayPal</label><input type="email" id="pm-email" value="${escapeHtml(existing?.email||'')}"></div>
                    <label class="checkbox-label"><input type="checkbox" id="pm-principale" ${existing?.principale?'checked':''}> Moyen principal</label>
                    <div class="form-actions">
                        <button type="submit" class="btn-primary">${isEdit ? 'Mettre à jour' : 'Ajouter'}</button>
                        <button type="button" class="btn-secondary" id="cancel-paiement-form">Annuler</button>
                    </div>
                </form>
            </div>`;

        const list = document.querySelector('.paiement-list');  // Liste des moyens de paiement existants
        document.querySelector('.adresse-form')?.remove();     // Supprime un formulaire déjà ouvert
        list.insertAdjacentHTML('afterend', formHtml);         // Insère le formulaire après la liste

        const typeSelect = document.getElementById('pm-type'); // Sélecteur de type (Visa / MasterCard / PayPal)

        // Affiche ou masque les champs selon le type sélectionné
        function toggleFields() {
            const isPayPal = typeSelect.value === 'PayPal';                                     // Détecte si PayPal est sélectionné
            document.getElementById('pm-numero-group').style.display    = isPayPal ? 'none' : 'block'; // Masque le numéro si PayPal
            document.getElementById('pm-expire-group').style.display    = isPayPal ? 'none' : 'block'; // Masque l'expiration si PayPal
            document.getElementById('pm-titulaire-group').style.display = isPayPal ? 'none' : 'block'; // Masque le titulaire si PayPal
            document.getElementById('pm-email-group').style.display     = isPayPal ? 'block' : 'none'; // Affiche l'email seulement si PayPal
        }
        toggleFields();                                        // Applique l'état initial au rendu
        typeSelect.addEventListener('change', toggleFields);   // Réapplique à chaque changement de type

        document.getElementById('cancel-paiement-form').addEventListener('click', () => {
            document.querySelector('.adresse-form').remove(); // Ferme le formulaire sans sauvegarder
        });

        document.getElementById('paiement-form-detail').addEventListener('submit', function(e) {
            e.preventDefault(); // Bloque la soumission HTTP
            const type  = typeSelect.value; // Type sélectionné ('Visa', 'MasterCard' ou 'PayPal')
            const entry = {
                id:        isEdit ? existing.id : 'pm' + Date.now(), // ID conservé ou nouveau généré via timestamp
                type,                                                 // Raccourci ES6 : équivalent à type: type
                principale: document.getElementById('pm-principale').checked // État de la checkbox "moyen principal"
            };

            if (type === 'PayPal') {
                entry.email = document.getElementById('pm-email').value.trim(); // Email du compte PayPal
                if (!validateEmail(entry.email)) {                              // Validation du format email
                    showMessage('Email PayPal invalide', 'error');
                    return;
                }
            } else {
                // Cas carte bancaire : récupère les 3 champs spécifiques
                entry.numero    = document.getElementById('pm-numero').value.trim();    // Numéro de carte (avec espaces)
                entry.expire    = document.getElementById('pm-expire').value.trim();    // Date d'expiration (MM/AA)
                entry.titulaire = document.getElementById('pm-titulaire').value.trim(); // Nom du titulaire
                if (!entry.numero || !entry.expire || !entry.titulaire) {               // Tous les champs carte sont obligatoires
                    showMessage('Tous les champs carte sont obligatoires', 'error');
                    return;
                }
            }

            if (!userData.paiements) userData.paiements = []; // Initialise si null/undefined

            if (isEdit) {
                const idx = userData.paiements.findIndex(p => p.id === existing.id); // Trouve la position dans le tableau
                if (idx !== -1) userData.paiements[idx] = entry;                     // Remplace l'ancien par le nouveau
            } else {
                userData.paiements.push(entry); // Ajoute à la fin du tableau
            }

            // Si ce moyen est défini comme principal, retire le flag des autres
            if (entry.principale) {
                userData.paiements.forEach(p => { if (p.id !== entry.id) p.principale = false; });
            }

            saveUserData(userData);    // Persiste
            showSection('paiement');   // Re-rend la section
            showMessage(isEdit ? 'Moyen mis à jour' : 'Moyen ajouté', 'success');
        });
    }

    // ============================================
    // ÉVÉNEMENTS — SECTION PRÉFÉRENCES
    // ============================================

    function attachPreferencesEvents() {
        const form = document.getElementById('preferences-form'); // Formulaire des checkboxes de préférences
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault(); // Bloque la soumission HTTP
                // Lit l'état de chaque checkbox et construit l'objet de préférences mis à jour
                userData.preferences = {
                    newsletter:              document.querySelector('input[name="newsletter"]').checked,            // Abonnement newsletter
                    offres_personnalisees:   document.querySelector('input[name="offres_personnalisees"]').checked, // Offres ciblées
                    notifications_commandes: document.querySelector('input[name="notifications_commandes"]').checked, // Notifs commandes
                    notifications_promos:    document.querySelector('input[name="notifications_promos"]').checked   // Alertes promos
                };
                saveUserData(userData);                        // Persiste les nouvelles préférences
                showMessage('Préférences enregistrées', 'success');
            });
        }
    }

    // ============================================
    // ÉVÉNEMENTS — SECTION SÉCURITÉ
    // ============================================

    function attachSecuriteEvents() {
        contentDiv.querySelectorAll('.toggle-pw').forEach(btn => attachTogglePw(btn)); // Active les boutons œil du formulaire de mot de passe

        const form = document.getElementById('password-form'); // Formulaire de changement de mot de passe
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault(); // Bloque la soumission HTTP
                const current = document.getElementById('current-password').value; // Mot de passe actuel saisi
                const newPass = document.getElementById('new-password').value;     // Nouveau mot de passe souhaité
                const confirm = document.getElementById('confirm-password').value; // Confirmation du nouveau mot de passe

                if (!current || !newPass || !confirm) {            // Tous les champs sont obligatoires
                    showMessage('Tous les champs sont obligatoires', 'error');
                    return;
                }

                // Vérifie que le mot de passe actuel correspond bien à celui stocké
                const users = getUsers();           // Charge la base des comptes
                const email = getSessionEmail();    // Email de l'utilisateur connecté
                if (!users[email] || users[email].password !== current) { // Mot de passe actuel incorrect
                    showMessage('Mot de passe actuel incorrect', 'error');
                    return;
                }
                if (newPass.length < 6) {                                          // Nouveau mot de passe trop court
                    showMessage('Le nouveau mot de passe doit contenir au moins 6 caractères', 'error');
                    return;
                }
                if (newPass !== confirm) {                                         // Les deux saisies ne correspondent pas
                    showMessage('Les nouveaux mots de passe ne correspondent pas', 'error');
                    return;
                }

                users[email].password = newPass;   // Met à jour le mot de passe dans la base des comptes
                saveUsers(users);                  // Persiste la modification
                showMessage('Mot de passe mis à jour avec succès', 'success');
                form.reset();                      // Vide les 3 champs du formulaire
            });
        }
    }

    // ============================================
    // ÉVÉNEMENTS — SECTION DÉCONNEXION
    // ============================================

    function attachDeconnexionEvents() {
        const btn = document.getElementById('logout-btn'); // Bouton "Se déconnecter"
        if (btn) {
            btn.addEventListener('click', function() {
                localStorage.removeItem(SESSION_KEY); // Supprime l'email de session : l'utilisateur est déconnecté
                window.location.reload();             // Recharge la page : déclenche showAuthScreen() car isLoggedIn() retourne false
            });
        }
    }

    // ============================================
    // UTILITAIRES PARTAGÉS
    // ============================================

    // Attache le comportement "œil" (afficher/masquer le mot de passe) à un bouton
    // btn : le bouton .toggle-pw dont l'élément précédent est l'input password
    function attachTogglePw(btn) {
        btn.addEventListener('click', function() {
            const input = this.previousElementSibling;                       // L'input password est le sibling précédent du bouton
            const icon  = this.querySelector('.material-symbols-outlined');  // Icône œil à l'intérieur du bouton
            if (input && input.tagName === 'INPUT') {                        // Vérifie que le sibling est bien un input
                input.type = (input.type === 'password') ? 'text' : 'password'; // Bascule entre masqué et visible
                if (icon) icon.textContent = (input.type === 'password') ? 'visibility' : 'visibility_off'; // Met à jour l'icône
            }
        });
    }

    // Protège les chaînes contre les injections XSS avant de les insérer dans le HTML
    // Remplace les caractères spéciaux HTML par leurs entités équivalentes
    function escapeHtml(str) {
        if (!str) return '';  // Retourne une chaîne vide si str est null, undefined ou ''
        return str.replace(/[&<>"]/g, m => ({  // Remplace les 4 caractères dangereux en HTML
            '&': '&amp;',   // & → &amp; (évite de casser les entités HTML)
            '<': '&lt;',    // < → &lt;  (évite d'injecter des balises HTML)
            '>': '&gt;',    // > → &gt;  (ferme les balises potentiellement ouvertes)
            '"': '&quot;'   // " → &quot; (évite de sortir des attributs HTML)
        }[m]));
    }

    // Vérifie qu'une adresse email a un format valide grâce à une expression régulière
    // Accepte : texte @ domaine . extension (sans espaces dans chaque partie)
    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); // test() retourne true si le format correspond
    }

    // Affiche un message de retour (succès ou erreur) en bas du contenu de section
    // Disparaît automatiquement après 3,5 secondes
    function showMessage(text, type) {
        document.querySelectorAll('.form-message').forEach(m => m.remove()); // Supprime les messages précédents pour éviter l'accumulation
        const msg       = document.createElement('div');   // Crée l'élément de message
        msg.className   = `form-message ${type}`;          // Classe CSS 'success' ou 'error' pour la couleur
        msg.textContent = text;                            // Texte du message à afficher
        if (contentDiv) contentDiv.appendChild(msg);       // Ajoute le message à la fin de la zone de contenu
        setTimeout(() => msg.remove(), 3500);              // Supprime automatiquement après 3,5 secondes
    }

    // ============================================
    // STYLES CSS DE L'ÉCRAN D'AUTHENTIFICATION
    // ============================================

    // Injecte dynamiquement dans <head> les styles CSS nécessaires à l'écran d'auth
    // Utilise un ID unique pour éviter les doublons si la fonction est appelée plusieurs fois
    function injectAuthStyles() {
        if (document.getElementById('auth-styles')) return; // Styles déjà injectés : rien à faire
        const style    = document.createElement('style');   // Crée un élément <style>
        style.id       = 'auth-styles';                     // ID pour détecter les doublons
        style.textContent = `
            /* Conteneur centré de l'écran d'auth */
            #auth-screen {
                display: flex;
                justify-content: center; /* Centre horizontalement la carte */
                padding: 3rem 1rem;      /* Espace autour de la carte */
            }
            /* Carte blanche (ou sombre) contenant tous les panels d'auth */
            .auth-container {
                width: 100%;
                max-width: 480px;                                   /* Largeur max pour rester compact */
                background: var(--card-bg, #1a1a2e);               /* Fond sombre (dark mode par défaut) */
                border: 1px solid var(--border-color, rgba(255,255,255,.1)); /* Bordure subtile */
                border-radius: 16px;                                /* Coins arrondis */
                padding: 2.5rem;                                    /* Espace intérieur généreux */
                box-shadow: 0 8px 32px rgba(0,0,0,.3);             /* Ombre portée pour la profondeur */
            }
            /* Logo PearTech centré en haut de la carte */
            .auth-logo {
                display: flex;
                align-items: center;
                gap: 1rem;
                margin-bottom: 2rem;
                justify-content: center;
            }
            .auth-logo-img   { width: 48px; height: 48px; object-fit: contain; }         /* Taille fixe du logo */
            .auth-logo-title { font-size: 1.4rem; font-weight: 700; color: var(--text-primary); } /* Titre "PearTech" */
            .auth-logo-sub   { font-size: .8rem; color: var(--text-secondary); }          /* Sous-titre "Mon espace client" */
            /* Barre des onglets Connexion / Inscription */
            .auth-tabs {
                display: flex;
                border-bottom: 2px solid var(--border-color, rgba(255,255,255,.1)); /* Ligne de séparation */
                margin-bottom: 1.8rem;
                gap: .25rem;
            }
            /* Style de base d'un onglet */
            .auth-tab {
                flex: 1;                                   /* Partage l'espace à égalité avec les autres onglets */
                padding: .65rem;
                border: none;
                background: transparent;
                color: var(--text-secondary);              /* Couleur atténuée par défaut */
                font-size: .95rem;
                font-weight: 500;
                cursor: pointer;
                border-bottom: 2px solid transparent;     /* Placeholder pour le soulignement actif */
                margin-bottom: -2px;                      /* Fait fusionner la bordure active avec la ligne des onglets */
                transition: color .2s, border-color .2s;
            }
            /* Onglet actuellement sélectionné */
            .auth-tab.active {
                color: var(--primary, #3B82F6);             /* Bleu primaire */
                border-bottom-color: var(--primary, #3B82F6); /* Soulignement bleu */
            }
            /* Bandeau d'information (identifiants du compte démo) */
            .auth-hint {
                font-size: .82rem;
                color: var(--text-secondary);
                background: rgba(59,130,246,.08);           /* Fond bleu très légèrement teinté */
                border: 1px solid rgba(59,130,246,.2);      /* Bordure bleue légère */
                border-radius: 8px;
                padding: .6rem .9rem;
                margin-bottom: 1.2rem;
            }
            /* Zone d'erreur (rouge) */
            .auth-error {
                color: #ef4444;
                font-size: .85rem;
                background: rgba(239,68,68,.08);
                border: 1px solid rgba(239,68,68,.25);
                border-radius: 8px;
                padding: .6rem .9rem;
                margin-bottom: .8rem;
            }
            /* Bouton de soumission pleine largeur */
            .auth-submit {
                width: 100%;
                margin-top: .75rem;
            }
            /* Conteneur du champ mot de passe + bouton œil superposé */
            .password-wrapper {
                position: relative;
                display: flex;
                align-items: center;
            }
            /* Le champ password prend tout l'espace, sauf la place du bouton */
            .password-wrapper input {
                flex: 1;
                padding-right: 2.8rem; /* Espace pour le bouton œil */
            }
            /* Bouton œil positionné en absolu à droite du champ */
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
            /* Lien "Mot de passe oublié ?" sous le bouton de connexion */
            .auth-forgot-link {
                text-align: center;
                margin-top: .75rem;
                font-size: .85rem;
            }
            /* Bouton stylisé comme un lien (sans fond ni bordure) */
            .link-btn {
                background: none;
                border: none;
                color: var(--primary, #3B82F6);
                cursor: pointer;
                font-size: inherit;
                padding: 0;
                text-decoration: underline;
                text-underline-offset: 2px; /* Espace entre le texte et le soulignement */
            }
            .link-btn:hover { opacity: .8; } /* Légère transparence au survol */
            /* Bouton "← Retour à la connexion" en haut des panels forgot/reset */
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
            .auth-back:hover { color: var(--text-primary); } /* Devient blanc/noir au survol */
            /* Titre h2 dans les panels forgot et reset */
            .auth-panel-title {
                font-size: 1.1rem;
                font-weight: 600;
                color: var(--text-primary);
                margin-bottom: .5rem;
            }
            /* Description sous le titre des panels forgot et reset */
            .auth-panel-desc {
                font-size: .85rem;
                color: var(--text-secondary);
                margin-bottom: 1.2rem;
                line-height: 1.5;
            }
            /* Zone de confirmation (vert) après envoi du formulaire forgot */
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
            /* Écran de confirmation centré après reset réussi (check vert + message) */
            .reset-success {
                text-align: center;
                padding: 2rem 1rem;
                color: #10b981;
            }
            /* Grande icône check verte dans l'écran de confirmation du reset */
            .reset-success-icon {
                font-size: 3rem;
                display: block;
                margin-bottom: .75rem;
            }
            /* État vide (aucune commande, etc.) : colonne centrée */
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
        document.head.appendChild(style); // Ajoute la balise <style> dans le <head> du document
    }

    // ============================================
    // POINT D'ENTRÉE — Exécution au chargement du DOM
    // ============================================

    document.addEventListener('DOMContentLoaded', function() {
        initDemoAccount(); // Crée le compte démo si aucun compte n'existe (première utilisation)

        if (!isLoggedIn()) {  // Vérifie si une session active existe dans localStorage
            showAuthScreen(); // Non connecté : affiche l'écran de connexion/inscription
        } else {
            initProfile();    // Connecté : charge et affiche directement le profil
        }
    });

})(); // Fin de l'IIFE — exécution immédiate