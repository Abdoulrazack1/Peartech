// ============================================
// profil.js - Gestion complète du profil utilisateur
// Données persistantes via localStorage
// Sections : infos, commandes, adresses, paiement, préférences, sécurité, déconnexion
// ============================================

(function() {
    'use strict';

    // Données par défaut de l'utilisateur (simulées)
    const DEFAULT_USER = {
        prenom: 'Jean',
        nom: 'Dupont',
        email: 'jean.dupont@email.com',
        naissance: '1980-01-01',
        telephone: '01 23 45 67 89',
        photo: null,
        commandes: [
            { 
                id: 'CMD-2025-001', 
                date: '2025-02-15', 
                total: 1299.00, 
                status: 'livré',
                articles: ['iPhone 15 Pro'],
                suivi: [
                    { date: '2025-02-15 14:30', titre: 'Commande livrée', description: 'Colis déposé dans votre boîte aux lettres' },
                    { date: '2025-02-14 09:15', titre: 'En cours de livraison', description: 'Votre colis est en cours d\'acheminement' },
                    { date: '2025-02-13 18:20', titre: 'Colis expédié', description: 'Votre commande a été expédiée de notre entrepôt' },
                    { date: '2025-02-12 10:05', titre: 'Commande confirmée', description: 'Votre commande a été validée' }
                ]
            },
            { 
                id: 'CMD-2025-042', 
                date: '2025-03-03', 
                total: 449.00, 
                status: 'en cours',
                articles: ['Apple Watch Series 9'],
                suivi: [
                    { date: '2025-03-04 08:30', titre: 'Colis expédié', description: 'Votre commande a été expédiée' },
                    { date: '2025-03-03 15:20', titre: 'Commande confirmée', description: 'Votre commande a été validée' }
                ]
            },
            { 
                id: 'CMD-2025-078', 
                date: '2025-01-22', 
                total: 89.00, 
                status: 'livré',
                articles: ['Écran Gaming 27"'],
                suivi: [
                    { date: '2025-01-24 11:10', titre: 'Commande livrée', description: 'Colis déposé dans votre boîte aux lettres' },
                    { date: '2025-01-23 16:45', titre: 'Colis expédié', description: 'Votre commande a été expédiée' },
                    { date: '2025-01-22 09:30', titre: 'Commande confirmée', description: 'Votre commande a été validée' }
                ]
            }
        ],
        adresses: [
            { id: 'addr1', nom: 'Domicile', rue: '15 rue de la Paix', complement: '', codePostal: '75001', ville: 'Paris', pays: 'France', principale: true },
            { id: 'addr2', nom: 'Bureau', rue: '8 avenue des Champs', complement: 'Bureau 402', codePostal: '75008', ville: 'Paris', pays: 'France', principale: false }
        ],
        paiements: [
            { id: 'pm1', type: 'Visa', numero: '**** **** **** 4242', expire: '04/26', titulaire: 'Jean Dupont', principale: true },
            { id: 'pm2', type: 'PayPal', email: 'jean.dupont@email.com', principale: false }
        ],
        preferences: {
            newsletter: true,
            offres_personnalisees: false,
            notifications_commandes: true,
            notifications_promos: false
        }
    };

    // Charger les données depuis localStorage ou utiliser les défauts
    function loadUserData() {
        const stored = localStorage.getItem('novaUser');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.warn('Données utilisateur corrompues, réinitialisation', e);
                localStorage.removeItem('novaUser');
            }
        }
        return JSON.parse(JSON.stringify(DEFAULT_USER)); // copie profonde
    }

    // Sauvegarder les données
    function saveUserData(user) {
        localStorage.setItem('novaUser', JSON.stringify(user));
    }

    let userData = loadUserData();

    // Éléments DOM — initialisés dans DOMContentLoaded pour éviter les crashes si le script se charge tôt
    let sidebarLinks, contentDiv;

    document.addEventListener('DOMContentLoaded', function() {
        sidebarLinks = document.querySelectorAll('.sidebar-link');
        contentDiv = document.getElementById('profil-content');

        if (!contentDiv) {
            console.error('Élément #profil-content introuvable');
            return;
        }

        // Initialisation : afficher la section par défaut (info)
        showSection('info');

        // Gestion des clics sur la sidebar
        sidebarLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const section = this.dataset.section;
                showSection(section);
            });
        });
    });
    function showSection(sectionId) {
        // Mettre à jour la classe active sur les liens
        sidebarLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === sectionId) {
                link.classList.add('active');
            }
        });

        // Générer le contenu selon la section
        let html = '';
        switch (sectionId) {
            case 'info':
                html = renderInfoSection();
                break;
            case 'commandes':
                html = renderCommandesSection();
                break;
            case 'adresses':
                html = renderAdressesSection();
                break;
            case 'paiement':
                html = renderPaiementSection();
                break;
            case 'preferences':
                html = renderPreferencesSection();
                break;
            case 'securite':
                html = renderSecuriteSection();
                break;
            case 'deconnexion':
                html = renderDeconnexionSection();
                break;
            default:
                html = '<p>Section inconnue</p>';
        }
        contentDiv.innerHTML = html;

        // Attacher les événements spécifiques à la section
        attachSectionEvents(sectionId);
    }

    // --- Rendu des sections ---

    function renderInfoSection() {
        const user = userData;
        return `
            <h1 class="content-title">Informations personnelles</h1>
            <div class="photo-section">
                <div class="photo-container">
                    <div class="photo-placeholder" id="photo-preview">
                        ${user.photo ? `<img src="${user.photo}" alt="Photo de profil">` : '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'}
                    </div>
                    <div class="photo-upload">
                        <label for="photo-input" class="btn-secondary">Changer la photo</label>
                        <input type="file" id="photo-input" accept="image/jpeg,image/png" hidden>
                        <p class="photo-hint">JPG ou PNG, max 2Mo</p>
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
                    <input type="date" id="naissance" value="${user.naissance}" required>
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
            return '<h1 class="content-title">Mes commandes</h1><p>Vous n\'avez pas encore passé de commande.</p>';
        }
        let html = '<h1 class="content-title">Mes commandes</h1><div class="commandes-list">';
        commandes.forEach(cmd => {
            const statusClass = cmd.status === 'livré' ? 'status-livre' : (cmd.status === 'en cours' ? 'status-encours' : 'status-annule');
            const dateFormatee = new Date(cmd.date).toLocaleDateString('fr-FR');
            html += `
                <div class="commande-card" data-commande-id="${cmd.id}">
                    <div class="commande-infos">
                        <h3>Commande ${cmd.id}</h3>
                        <p>Date : ${dateFormatee} - Total : ${cmd.total.toFixed(2).replace('.',',')} €</p>
                        <p>Articles : ${cmd.articles.join(', ')}</p>
                    </div>
                    <span class="commande-status ${statusClass}">${cmd.status}</span>
                    <button class="btn-suivi" data-commande-id="${cmd.id}">Suivre</button>
                </div>
            `;
        });
        html += '</div>';
        return html;
    }

    function renderAdressesSection() {
        const adresses = userData.adresses;
        let html = '<h1 class="content-title">Mes adresses</h1><div class="adresses-grid">';
        adresses.forEach(addr => {
            html += `
                <div class="adresse-card ${addr.principale ? 'principale' : ''}" data-id="${addr.id}">
                    ${addr.principale ? '<span class="adresse-badge">Principale</span>' : ''}
                    <h3>${escapeHtml(addr.nom)}</h3>
                    <p>${escapeHtml(addr.rue)}</p>
                    ${addr.complement ? `<p>${escapeHtml(addr.complement)}</p>` : ''}
                    <p>${escapeHtml(addr.codePostal)} ${escapeHtml(addr.ville)}</p>
                    <p>${escapeHtml(addr.pays)}</p>
                    <div class="adresse-actions">
                        <button class="btn-icon edit-adresse" title="Modifier"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                        <button class="btn-icon delete-adresse" title="Supprimer"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>
                        ${!addr.principale ? '<button class="btn-icon set-principale" title="Définir comme principale"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></button>' : ''}
                    </div>
                </div>
            `;
        });
        html += '</div>';
        html += '<button class="btn-primary" id="add-adresse">Ajouter une adresse</button>';
        return html;
    }

    function renderPaiementSection() {
        const paiements = userData.paiements;
        let html = '<h1 class="content-title">Moyens de paiement</h1><div class="paiement-list">';
        paiements.forEach(pm => {
            if (pm.type === 'Visa' || pm.type === 'MasterCard') {
                html += `
                    <div class="paiement-card" data-id="${pm.id}">
                        <div class="paiement-icon">💳</div>
                        <div class="paiement-infos">
                            <h3>${pm.type} terminant par ${pm.numero.slice(-4)}</h3>
                            <p>Expire le ${pm.expire} - ${pm.titulaire}</p>
                        </div>
                        <div class="paiement-actions">
                            <button class="btn-icon edit-paiement" title="Modifier"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                            <button class="btn-icon delete-paiement" title="Supprimer"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>
                        </div>
                    </div>
                `;
            } else if (pm.type === 'PayPal') {
                html += `
                    <div class="paiement-card" data-id="${pm.id}">
                        <div class="paiement-icon">📧</div>
                        <div class="paiement-infos">
                            <h3>PayPal</h3>
                            <p>${pm.email}</p>
                        </div>
                        <div class="paiement-actions">
                            <button class="btn-icon edit-paiement" title="Modifier"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                            <button class="btn-icon delete-paiement" title="Supprimer"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>
                        </div>
                    </div>
                `;
            }
        });
        html += '</div>';
        html += '<button class="btn-primary" id="add-paiement">Ajouter un moyen de paiement</button>';
        return html;
    }

    function renderPreferencesSection() {
        const prefs = userData.preferences;
        return `
            <h1 class="content-title">Préférences de communication</h1>
            <form id="preferences-form">
                <div class="preferences-group">
                    <h3>Email</h3>
                    <label class="checkbox-label">
                        <input type="checkbox" name="newsletter" ${prefs.newsletter ? 'checked' : ''}> Recevoir la newsletter
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" name="offres_personnalisees" ${prefs.offres_personnalisees ? 'checked' : ''}> Recevoir des offres personnalisées
                    </label>
                </div>
                <div class="preferences-group">
                    <h3>Notifications</h3>
                    <label class="checkbox-label">
                        <input type="checkbox" name="notifications_commandes" ${prefs.notifications_commandes ? 'checked' : ''}> Notifications de commande (email)
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" name="notifications_promos" ${prefs.notifications_promos ? 'checked' : ''}> Alertes promotions
                    </label>
                </div>
                <button type="submit" class="btn-primary">Enregistrer les préférences</button>
            </form>
        `;
    }

    function renderSecuriteSection() {
        return `
            <h1 class="content-title">Sécurité</h1>
            <form id="password-form">
                <div class="form-group">
                    <label for="current-password">Mot de passe actuel</label>
                    <input type="password" id="current-password" placeholder="**********" required>
                </div>
                <div class="form-group">
                    <label for="new-password">Nouveau mot de passe</label>
                    <input type="password" id="new-password" placeholder="Saisir nouveau mot de passe" required minlength="6">
                </div>
                <div class="form-group">
                    <label for="confirm-password">Confirmer le nouveau mot de passe</label>
                    <input type="password" id="confirm-password" placeholder="Confirmer" required>
                </div>
                <button type="submit" class="btn-primary">Mettre à jour le mot de passe</button>
            </form>
        `;
    }

    function renderDeconnexionSection() {
        return `
            <h1 class="content-title">Déconnexion</h1>
            <div class="deconnexion-section">
                <p>Êtes-vous sûr de vouloir vous déconnecter ?</p>
                <button class="btn-primary" id="logout-btn">Se déconnecter</button>
            </div>
        `;
    }

    // --- Gestion des événements par section ---

    function attachSectionEvents(sectionId) {
        switch (sectionId) {
            case 'info':
                attachInfoEvents();
                break;
            case 'commandes':
                attachCommandesEvents();
                break;
            case 'adresses':
                attachAdressesEvents();
                break;
            case 'paiement':
                attachPaiementEvents();
                break;
            case 'preferences':
                attachPreferencesEvents();
                break;
            case 'securite':
                attachSecuriteEvents();
                break;
            case 'deconnexion':
                attachDeconnexionEvents();
                break;
        }
    }

    // --- Événements spécifiques ---

    function attachInfoEvents() {
        const photoInput = document.getElementById('photo-input');
        const photoPreview = document.getElementById('photo-preview');
        if (photoInput) {
            photoInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    if (file.size > 2 * 1024 * 1024) {
                        showMessage('La photo ne doit pas dépasser 2 Mo', 'error');
                        photoInput.value = '';
                        return;
                    }
                    if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
                        showMessage('Format accepté : JPG ou PNG', 'error');
                        photoInput.value = '';
                        return;
                    }
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        photoPreview.innerHTML = `<img src="${e.target.result}" alt="Photo de profil">`;
                        // Sauvegarder en base64 (simulé)
                        userData.photo = e.target.result;
                        saveUserData(userData);
                        showMessage('Photo mise à jour', 'success');
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        const infoForm = document.getElementById('info-form');
        if (infoForm) {
            infoForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const prenom = document.getElementById('prenom').value.trim();
                const nom = document.getElementById('nom').value.trim();
                const email = document.getElementById('email').value.trim();
                const telephone = document.getElementById('telephone').value.trim();
                const naissance = document.getElementById('naissance').value;

                if (!prenom || !nom || !email || !naissance) {
                    showMessage('Tous les champs obligatoires doivent être remplis', 'error');
                    return;
                }
                if (!validateEmail(email)) {
                    showMessage('Email invalide', 'error');
                    return;
                }
                userData.prenom = prenom;
                userData.nom = nom;
                userData.email = email;
                userData.telephone = telephone;
                userData.naissance = naissance;
                saveUserData(userData);
                showMessage('Informations mises à jour avec succès', 'success');
            });
        }
    }

    function attachCommandesEvents() {
        // Gestion du bouton "Suivre"
        document.querySelectorAll('.btn-suivi').forEach(btn => {
            btn.addEventListener('click', function() {
                const commandeId = this.dataset.commandeId;
                const commande = userData.commandes.find(c => c.id === commandeId);
                if (commande) {
                    showSuiviModal(commande);
                }
            });
        });
    }

    function showSuiviModal(commande) {
        // Créer une modale de suivi
        const modal = document.createElement('div');
        modal.className = 'suivi-modal active';
        modal.innerHTML = `
            <div class="suivi-modal-content">
                <h2>Suivi de commande ${commande.id}</h2>
                <div class="suivi-timeline">
                    ${commande.suivi.map((etape, index) => {
                        const isLast = index === commande.suivi.length - 1;
                        const statusClass = isLast && commande.status === 'livré' ? 'completed' : (index === commande.suivi.length - 1 ? 'active' : 'completed');
                        return `
                            <div class="timeline-item ${statusClass}">
                                <div class="timeline-date">${new Date(etape.date).toLocaleString('fr-FR')}</div>
                                <div class="timeline-title">${etape.titre}</div>
                                <div class="timeline-desc">${etape.description}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
                <button class="btn-secondary" id="close-modal">Fermer</button>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('#close-modal').addEventListener('click', () => {
            modal.remove();
        });

        // Fermer en cliquant sur l'overlay
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    function attachAdressesEvents() {
        // Éditer une adresse
        document.querySelectorAll('.edit-adresse').forEach(btn => {
            btn.addEventListener('click', function() {
                const card = this.closest('.adresse-card');
                const id = card.dataset.id;
                const adresse = userData.adresses.find(a => a.id === id);
                if (adresse) showAdresseForm(adresse);
            });
        });

        // Supprimer une adresse
        document.querySelectorAll('.delete-adresse').forEach(btn => {
            btn.addEventListener('click', function() {
                const card = this.closest('.adresse-card');
                const id = card.dataset.id;
                if (confirm('Supprimer cette adresse ?')) {
                    userData.adresses = userData.adresses.filter(a => a.id !== id);
                    saveUserData(userData);
                    showSection('adresses'); // re-rend la section
                    showMessage('Adresse supprimée', 'success');
                }
            });
        });

        // Définir comme principale
        document.querySelectorAll('.set-principale').forEach(btn => {
            btn.addEventListener('click', function() {
                const card = this.closest('.adresse-card');
                const id = card.dataset.id;
                userData.adresses.forEach(a => a.principale = (a.id === id));
                saveUserData(userData);
                showSection('adresses');
                showMessage('Adresse principale mise à jour', 'success');
            });
        });

        // Ajouter une adresse
        const addBtn = document.getElementById('add-adresse');
        if (addBtn) {
            addBtn.addEventListener('click', () => showAdresseForm(null));
        }
    }

    function showAdresseForm(adresseExistante) {
        const isEdit = !!adresseExistante;
        const formHtml = `
            <div class="adresse-form">
                <h3>${isEdit ? 'Modifier' : 'Ajouter'} une adresse</h3>
                <form id="adresse-form-detail">
                    <div class="form-group">
                        <label for="addr-nom">Nom de l'adresse (ex: Domicile)</label>
                        <input type="text" id="addr-nom" value="${escapeHtml(adresseExistante?.nom || '')}" required>
                    </div>
                    <div class="form-group">
                        <label for="addr-rue">Rue</label>
                        <input type="text" id="addr-rue" value="${escapeHtml(adresseExistante?.rue || '')}" required>
                    </div>
                    <div class="form-group">
                        <label for="addr-complement">Complément (optionnel)</label>
                        <input type="text" id="addr-complement" value="${escapeHtml(adresseExistante?.complement || '')}">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="addr-cp">Code postal</label>
                            <input type="text" id="addr-cp" value="${escapeHtml(adresseExistante?.codePostal || '')}" required>
                        </div>
                        <div class="form-group">
                            <label for="addr-ville">Ville</label>
                            <input type="text" id="addr-ville" value="${escapeHtml(adresseExistante?.ville || '')}" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="addr-pays">Pays</label>
                        <input type="text" id="addr-pays" value="${escapeHtml(adresseExistante?.pays || 'France')}" required>
                    </div>
                    <div class="checkbox-label">
                        <label>
                            <input type="checkbox" id="addr-principale" ${adresseExistante?.principale ? 'checked' : ''}> Définir comme adresse principale
                        </label>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn-primary">${isEdit ? 'Mettre à jour' : 'Ajouter'}</button>
                        <button type="button" class="btn-secondary" id="cancel-adresse-form">Annuler</button>
                    </div>
                </form>
            </div>
        `;

        // Insérer le formulaire après la grille
        const grid = document.querySelector('.adresses-grid');
        const existingForm = document.querySelector('.adresse-form');
        if (existingForm) existingForm.remove();
        grid.insertAdjacentHTML('afterend', formHtml);

        document.getElementById('cancel-adresse-form').addEventListener('click', () => {
            document.querySelector('.adresse-form').remove();
        });

        document.getElementById('adresse-form-detail').addEventListener('submit', function(e) {
            e.preventDefault();
            const newAdresse = {
                id: isEdit ? adresseExistante.id : 'addr' + Date.now(),
                nom: document.getElementById('addr-nom').value.trim(),
                rue: document.getElementById('addr-rue').value.trim(),
                complement: document.getElementById('addr-complement').value.trim(),
                codePostal: document.getElementById('addr-cp').value.trim(),
                ville: document.getElementById('addr-ville').value.trim(),
                pays: document.getElementById('addr-pays').value.trim(),
                principale: document.getElementById('addr-principale').checked
            };
            if (!newAdresse.nom || !newAdresse.rue || !newAdresse.codePostal || !newAdresse.ville || !newAdresse.pays) {
                showMessage('Tous les champs obligatoires doivent être remplis', 'error');
                return;
            }
            if (isEdit) {
                // Remplacer l'ancienne
                const index = userData.adresses.findIndex(a => a.id === adresseExistante.id);
                if (index !== -1) userData.adresses[index] = newAdresse;
            } else {
                userData.adresses.push(newAdresse);
            }
            // Si la nouvelle est principale, enlever le flag aux autres
            if (newAdresse.principale) {
                userData.adresses.forEach(a => {
                    if (a.id !== newAdresse.id) a.principale = false;
                });
            }
            saveUserData(userData);
            showSection('adresses');
            showMessage(isEdit ? 'Adresse mise à jour' : 'Adresse ajoutée', 'success');
        });
    }

    function attachPaiementEvents() {
        // Éditer un moyen de paiement
        document.querySelectorAll('.edit-paiement').forEach(btn => {
            btn.addEventListener('click', function() {
                const card = this.closest('.paiement-card');
                const id = card.dataset.id;
                const pm = userData.paiements.find(p => p.id === id);
                if (pm) showPaiementForm(pm);
            });
        });

        // Supprimer un moyen de paiement
        document.querySelectorAll('.delete-paiement').forEach(btn => {
            btn.addEventListener('click', function() {
                const card = this.closest('.paiement-card');
                const id = card.dataset.id;
                if (confirm('Supprimer ce moyen de paiement ?')) {
                    userData.paiements = userData.paiements.filter(p => p.id !== id);
                    saveUserData(userData);
                    showSection('paiement');
                    showMessage('Moyen de paiement supprimé', 'success');
                }
            });
        });

        // Ajouter
        const addBtn = document.getElementById('add-paiement');
        if (addBtn) {
            addBtn.addEventListener('click', () => showPaiementForm(null));
        }
    }

    function showPaiementForm(paiementExistant) {
        const isEdit = !!paiementExistant;
        const formHtml = `
            <div class="adresse-form">
                <h3>${isEdit ? 'Modifier' : 'Ajouter'} un moyen de paiement</h3>
                <form id="paiement-form-detail">
                    <div class="form-group">
                        <label for="pm-type">Type</label>
                        <select id="pm-type" required>
                            <option value="Visa" ${paiementExistant?.type === 'Visa' ? 'selected' : ''}>Visa</option>
                            <option value="MasterCard" ${paiementExistant?.type === 'MasterCard' ? 'selected' : ''}>MasterCard</option>
                            <option value="PayPal" ${paiementExistant?.type === 'PayPal' ? 'selected' : ''}>PayPal</option>
                        </select>
                    </div>
                    <div class="form-group" id="pm-numero-group">
                        <label for="pm-numero">Numéro de carte</label>
                        <input type="text" id="pm-numero" value="${escapeHtml(paiementExistant?.numero || '')}" placeholder="**** **** **** ****">
                    </div>
                    <div class="form-group" id="pm-expire-group">
                        <label for="pm-expire">Date d'expiration (MM/AA)</label>
                        <input type="text" id="pm-expire" value="${escapeHtml(paiementExistant?.expire || '')}" placeholder="MM/AA">
                    </div>
                    <div class="form-group" id="pm-titulaire-group">
                        <label for="pm-titulaire">Titulaire</label>
                        <input type="text" id="pm-titulaire" value="${escapeHtml(paiementExistant?.titulaire || '')}">
                    </div>
                    <div class="form-group" id="pm-email-group" style="display: none;">
                        <label for="pm-email">Email PayPal</label>
                        <input type="email" id="pm-email" value="${escapeHtml(paiementExistant?.email || '')}">
                    </div>
                    <div class="checkbox-label">
                        <label>
                            <input type="checkbox" id="pm-principale" ${paiementExistant?.principale ? 'checked' : ''}> Définir comme moyen principal
                        </label>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn-primary">${isEdit ? 'Mettre à jour' : 'Ajouter'}</button>
                        <button type="button" class="btn-secondary" id="cancel-paiement-form">Annuler</button>
                    </div>
                </form>
            </div>
        `;

        const grid = document.querySelector('.paiement-list');
        const existingForm = document.querySelector('.adresse-form');
        if (existingForm) existingForm.remove();
        grid.insertAdjacentHTML('afterend', formHtml);

        // Gestion dynamique des champs selon le type
        const typeSelect = document.getElementById('pm-type');
        function toggleFields() {
            const type = typeSelect.value;
            document.getElementById('pm-numero-group').style.display = type === 'PayPal' ? 'none' : 'block';
            document.getElementById('pm-expire-group').style.display = type === 'PayPal' ? 'none' : 'block';
            document.getElementById('pm-titulaire-group').style.display = type === 'PayPal' ? 'none' : 'block';
            document.getElementById('pm-email-group').style.display = type === 'PayPal' ? 'block' : 'none';
        }
        toggleFields();
        typeSelect.addEventListener('change', toggleFields);

        document.getElementById('cancel-paiement-form').addEventListener('click', () => {
            document.querySelector('.adresse-form').remove();
        });

        document.getElementById('paiement-form-detail').addEventListener('submit', function(e) {
            e.preventDefault();
            const type = typeSelect.value;
            const nouvelle = {
                id: isEdit ? paiementExistant.id : 'pm' + Date.now(),
                type: type,
                principale: document.getElementById('pm-principale').checked
            };
            if (type === 'PayPal') {
                nouvelle.email = document.getElementById('pm-email').value.trim();
                if (!validateEmail(nouvelle.email)) {
                    showMessage('Email PayPal invalide', 'error');
                    return;
                }
            } else {
                nouvelle.numero = document.getElementById('pm-numero').value.trim();
                nouvelle.expire = document.getElementById('pm-expire').value.trim();
                nouvelle.titulaire = document.getElementById('pm-titulaire').value.trim();
                if (!nouvelle.numero || !nouvelle.expire || !nouvelle.titulaire) {
                    showMessage('Tous les champs de carte sont obligatoires', 'error');
                    return;
                }
            }
            if (isEdit) {
                const index = userData.paiements.findIndex(p => p.id === paiementExistant.id);
                if (index !== -1) userData.paiements[index] = nouvelle;
            } else {
                userData.paiements.push(nouvelle);
            }
            if (nouvelle.principale) {
                userData.paiements.forEach(p => {
                    if (p.id !== nouvelle.id) p.principale = false;
                });
            }
            saveUserData(userData);
            showSection('paiement');
            showMessage(isEdit ? 'Moyen de paiement mis à jour' : 'Moyen de paiement ajouté', 'success');
        });
    }

    function attachPreferencesEvents() {
        const prefsForm = document.getElementById('preferences-form');
        if (prefsForm) {
            prefsForm.addEventListener('submit', function(e) {
                e.preventDefault();
                userData.preferences = {
                    newsletter: document.querySelector('input[name="newsletter"]').checked,
                    offres_personnalisees: document.querySelector('input[name="offres_personnalisees"]').checked,
                    notifications_commandes: document.querySelector('input[name="notifications_commandes"]').checked,
                    notifications_promos: document.querySelector('input[name="notifications_promos"]').checked
                };
                saveUserData(userData);
                showMessage('Préférences enregistrées', 'success');
            });
        }
    }

    function attachSecuriteEvents() {
        const passwordForm = document.getElementById('password-form');
        if (passwordForm) {
            passwordForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const current = document.getElementById('current-password').value;
                const newPass = document.getElementById('new-password').value;
                const confirm = document.getElementById('confirm-password').value;

                if (!current || !newPass || !confirm) {
                    showMessage('Tous les champs sont obligatoires', 'error');
                    return;
                }
                if (newPass !== confirm) {
                    showMessage('Les nouveaux mots de passe ne correspondent pas', 'error');
                    return;
                }
                if (newPass.length < 6) {
                    showMessage('Le mot de passe doit contenir au moins 6 caractères', 'error');
                    return;
                }
                // Ici on simule un changement (dans une vraie app, on enverrait au serveur)
                showMessage('Mot de passe mis à jour avec succès', 'success');
                passwordForm.reset();
            });
        }
    }

    function attachDeconnexionEvents() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                // Simuler une déconnexion (effacer localStorage si souhaité)
                // localStorage.removeItem('novaUser'); // optionnel
                window.location.href = 'page_accueil.html';
            });
        }
    }

    // --- Utilitaires ---
    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>"]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            if (m === '"') return '&quot;';
            return m;
        });
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function showMessage(text, type) {
        const oldMessages = document.querySelectorAll('.form-message');
        oldMessages.forEach(msg => msg.remove());

        const message = document.createElement('div');
        message.className = `form-message ${type}`;
        message.textContent = text;
        contentDiv.appendChild(message);

        setTimeout(() => {
            message.remove();
        }, 3000);
    }

})();