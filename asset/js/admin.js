// ============================================================
//  admin.js — Espace administrateur PearTech
//  Accessible uniquement aux comptes de rôle "admin".
//  Consomme les routes /api/admin/* et /api/produits (CRUD).
// ============================================================

(function () {
    'use strict';

    const app     = () => document.getElementById('admin-app');
    const content = () => document.getElementById('admin-content');

    function esc(s) {
        return (s == null ? '' : String(s)).replace(/[&<>"]/g,
            m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
    }
    function euro(n) { return Number(n).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €'; }
    function dateFr(d) { return new Date(d).toLocaleString('fr-FR'); }

    function toast(msg) {
        document.querySelectorAll('.admin-toast').forEach(t => t.remove());
        const t = document.createElement('div');
        t.className = 'admin-toast';
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 2500);
    }
    function erreur(e) {
        content().innerHTML = `<p class="err-box">Erreur : ${esc(e.message || 'inconnue')}</p>`;
    }

    document.addEventListener('DOMContentLoaded', init);

    function init() {
        if (!window.PearTechAPI) {
            app().innerHTML = '<p class="err-box" style="margin:2rem">API indisponible (back-end démarré ?).</p>';
            return;
        }
        const user = PearTechAPI.getUser();
        if (!PearTechAPI.isLoggedIn() || !user || user.role !== 'admin') {
            renderLogin();
        } else {
            renderLayout();
        }
    }

    function renderLogin() {
        app().innerHTML = `
            <div class="admin-login">
                <div class="admin-login-box">
                    <h1>PearTech <span style="color:var(--primary)">Admin</span></h1>
                    <p class="sub">Espace réservé aux administrateurs</p>
                    <form id="admin-login-form">
                        <label>Email
                            <input type="email" id="al-email" value="admin@peartech.fr" required>
                        </label>
                        <label>Mot de passe
                            <input type="password" id="al-pass" placeholder="••••••••" required>
                        </label>
                        <div id="al-err" class="err" hidden></div>
                        <button type="submit" class="btn" style="width:100%">Se connecter</button>
                    </form>
                </div>
            </div>`;

        document.getElementById('admin-login-form').addEventListener('submit', async e => {
            e.preventDefault();
            const email = document.getElementById('al-email').value.trim();
            const pass  = document.getElementById('al-pass').value;
            const errEl = document.getElementById('al-err');
            errEl.hidden = true;
            try {
                const rep = await PearTechAPI.connexion(email, pass);
                if (rep.utilisateur.role !== 'admin') {
                    PearTechAPI.clearAuth();
                    errEl.textContent = 'Ce compte n\'est pas administrateur.';
                    errEl.hidden = false;
                    return;
                }
                renderLayout();
            } catch (err) {
                errEl.textContent = err.message || 'Connexion impossible.';
                errEl.hidden = false;
            }
        });
    }

    function renderLayout() {
        const u = PearTechAPI.getUser();
        app().innerHTML = `
            <div class="admin-shell">
                <aside class="admin-side">
                    <div class="admin-brand">PearTech<span> Admin</span></div>
                    <nav>
                        <button data-sec="dashboard" class="active">Tableau de bord</button>
                        <button data-sec="statistiques">Statistiques</button>
                        <button data-sec="produits">Produits</button>
                        <button data-sec="commandes">Commandes</button>
                        <button data-sec="utilisateurs">Utilisateurs</button>
                        <button data-sec="messages">Messages</button>
                    </nav>
                    <div class="admin-foot">
                        <span>${esc(u.prenom)} ${esc(u.nom)}</span>
                        <button id="admin-logout">Déconnexion</button>
                        <a href="page_accueil.html">← Retour au site</a>
                    </div>
                </aside>
                <main class="admin-main" id="admin-content"></main>
            </div>`;

        app().querySelectorAll('.admin-side nav button').forEach(btn => {
            btn.addEventListener('click', () => {
                app().querySelectorAll('.admin-side nav button').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                show(btn.dataset.sec);
            });
        });
        document.getElementById('admin-logout').addEventListener('click', () => {
            PearTechAPI.clearAuth();
            renderLogin();
        });

        show('dashboard');
    }

    function show(sec) {
        content().innerHTML = '<p class="loading">Chargement…</p>';
        if (sec === 'dashboard')         loadDashboard();
        else if (sec === 'statistiques') loadStatistiques();
        else if (sec === 'produits')     loadProduits();
        else if (sec === 'commandes')    loadCommandes();
        else if (sec === 'utilisateurs') loadUtilisateurs();
        else if (sec === 'messages')     loadMessages();
    }

    // ── Tableau de bord ───────────────────────────────────────
    async function loadDashboard() {
        try {
            const s = await PearTechAPI.adminStats();
            content().innerHTML = `
                <h1>Tableau de bord</h1>
                <div class="cards">
                    ${card('Produits', s.nbProduits)}
                    ${card('Stock total', s.stockTotal)}
                    ${card('Stock bas (≤ 5)', s.produitsStockBas)}
                    ${card('Commandes', s.nbCommandes)}
                    ${card('Chiffre d\'affaires', euro(s.chiffreAffaires))}
                    ${card('Clients', s.nbClients)}
                    ${card('Avis', s.nbAvis)}
                    ${card('Messages', s.nbMessages)}
                    ${card('Visites API', s.nbVisites)}
                </div>`;
        } catch (e) { erreur(e); }
    }
    function card(label, val) {
        return `<div class="card"><div class="card-val">${esc(val)}</div><div class="card-lbl">${esc(label)}</div></div>`;
    }

    // ── Statistiques ──────────────────────────────────────────
    async function loadStatistiques() {
        try {
            const s = await PearTechAPI.adminStatistiques();
            content().innerHTML = `
                <h1>Statistiques</h1>
                <h2>Top produits vendus</h2>
                <table class="tbl">
                    <thead><tr><th>Produit</th><th>Quantité vendue</th><th>Chiffre d'affaires</th></tr></thead>
                    <tbody>
                    ${(s.topProduits || []).map(p => `
                        <tr><td>${esc(p.nom)}</td><td>${p.quantiteVendue}</td><td>${euro(p.chiffreAffaires)}</td></tr>
                    `).join('') || '<tr><td colspan="3">Aucune vente.</td></tr>'}
                    </tbody>
                </table>
                <h2 style="margin-top:1.5rem">Chiffre d'affaires par mois</h2>
                <table class="tbl">
                    <thead><tr><th>Mois</th><th>Commandes</th><th>Chiffre d'affaires</th></tr></thead>
                    <tbody>
                    ${(s.chiffreAffaires || []).map(m => `
                        <tr><td>${esc(m.mois)}</td><td>${m.nbCommandes}</td><td>${euro(m.chiffreAffaires)}</td></tr>
                    `).join('') || '<tr><td colspan="3">Aucune donnée.</td></tr>'}
                    </tbody>
                </table>
                <h2 style="margin-top:1.5rem">Pages les plus visitées (${s.nbVisitesTotal} visites)</h2>
                <table class="tbl">
                    <thead><tr><th>Route</th><th>Visites</th></tr></thead>
                    <tbody>
                    ${(s.visitesParChemin || []).map(v => `
                        <tr><td>${esc(v.chemin)}</td><td>${v.nbVisites}</td></tr>
                    `).join('') || '<tr><td colspan="2">Aucune visite.</td></tr>'}
                    </tbody>
                </table>`;
        } catch (e) { erreur(e); }
    }

    // ── Produits ──────────────────────────────────────────────
    let categories = [];

    async function loadProduits() {
        try {
            const [produits, cats] = await Promise.all([PearTechAPI.produits(''), PearTechAPI.categories()]);
            const liste = Array.isArray(produits) ? produits : (produits.data || []);
            categories = cats;
            content().innerHTML = `
                <div class="head-row">
                    <h1>Produits (${liste.length})</h1>
                    <button class="btn" id="add-prod">+ Ajouter un produit</button>
                </div>
                <table class="tbl">
                    <thead><tr><th>ID</th><th>Nom</th><th>Marque</th><th>Catégorie</th><th>Prix</th><th>Stock</th><th>Actions</th></tr></thead>
                    <tbody>
                    ${liste.map(p => `
                        <tr>
                            <td>${p.id}</td>
                            <td>${esc(p.nom)}</td>
                            <td>${esc(p.marque || '—')}</td>
                            <td>${esc(catName(p.categorieId))}</td>
                            <td>${euro(p.prix)}</td>
                            <td>${p.stock}</td>
                            <td class="actions">
                                <button data-edit="${p.id}">Modifier</button>
                                <button data-del="${p.id}" class="danger">Suppr.</button>
                            </td>
                        </tr>`).join('')}
                    </tbody>
                </table>`;

            document.getElementById('add-prod').addEventListener('click', () => openProdForm(null));
            content().querySelectorAll('[data-edit]').forEach(b =>
                b.addEventListener('click', () => openProdForm(liste.find(p => p.id == b.dataset.edit))));
            content().querySelectorAll('[data-del]').forEach(b =>
                b.addEventListener('click', () => delProd(b.dataset.del)));
        } catch (e) { erreur(e); }
    }

    function catName(id) { const c = categories.find(c => c.id === id); return c ? c.nom : id; }

    async function delProd(id) {
        if (!confirm('Supprimer définitivement ce produit ?')) return;
        try { await PearTechAPI.produitSupprimer(id); toast('Produit supprimé'); loadProduits(); }
        catch (e) { erreur(e); }
    }

    function openProdForm(p) {
        const isEdit = !!p;

        let imagesExistantes = [];
        if (p && p.images) {
            imagesExistantes = Array.isArray(p.images) ? p.images : JSON.parse(p.images || '[]');
        }

        const opts = categories.map(c =>
            `<option value="${c.id}" ${p && p.categorieId === c.id ? 'selected' : ''}>${esc(c.nom)}</option>`).join('');

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-box">
                <h2>${isEdit ? 'Modifier' : 'Ajouter'} un produit</h2>
                <form id="prod-form">
                    <label>Nom <input name="nom" value="${esc(p ? p.nom : '')}" required></label>
                    <label>Slug (identifiant URL) <input name="slug" value="${esc(p ? p.slug : '')}" required></label>
                    <label>Marque <input name="marque" value="${esc(p ? p.marque : '')}"></label>
                    <label>Catégorie <select name="categorieId">${opts}</select></label>
                    <div class="row">
                        <label>Prix (€) <input name="prix" type="number" step="0.01" value="${p ? p.prix : ''}" required></label>
                        <label>Ancien prix <input name="ancienPrix" type="number" step="0.01" value="${p && p.ancienPrix != null ? p.ancienPrix : ''}"></label>
                        <label>Stock <input name="stock" type="number" value="${p ? p.stock : 0}"></label>
                    </div>
                    <div class="row">
                        <label>Note (/5) <input name="note" type="number" step="0.1" value="${p ? p.note : 0}"></label>
                        <label>Nb avis <input name="nbAvis" type="number" value="${p ? p.nbAvis : 0}"></label>
                        <label class="chk"><input type="checkbox" name="estNouveau" ${p && p.estNouveau ? 'checked' : ''}> Nouveau</label>
                        <label class="chk"><input type="checkbox" name="estBestSeller" ${p && p.estBestSeller ? 'checked' : ''}> Best-seller</label>
                    </div>
                    <label>Description <textarea name="description">${esc(p ? p.description : '')}</textarea></label>
                    <label>Images (une URL ou chemin par ligne)
                        <textarea name="images" id="images-textarea">${esc(imagesExistantes.join('\n'))}</textarea>
                    </label>
                    <div class="upload-zone" style="margin-bottom:.75rem">
                        <label style="font-size:.85rem;color:var(--muted,#888);display:block;margin-bottom:.3rem">
                            Ou uploader une image locale (JPG, PNG, WEBP — 5 Mo max)
                        </label>
                        <div style="display:flex;gap:.5rem;align-items:center">
                            <input type="file" id="upload-file" accept="image/jpeg,image/png,image/webp,image/gif"
                                   style="flex:1;font-size:.85rem">
                            <button type="button" id="upload-btn" class="btn" style="white-space:nowrap">Uploader</button>
                        </div>
                        <div id="upload-status" style="font-size:.8rem;margin-top:.3rem"></div>
                    </div>
                    <label>Tags (séparés par des virgules) <input name="tags" value="${p && Array.isArray(p.tags) ? esc(p.tags.join(', ')) : ''}"></label>
                    <details>
                        <summary>Avancé — caractéristiques / options (format JSON)</summary>
                        <label>specs <textarea name="specs">${p && p.specs ? esc(JSON.stringify(p.specs, null, 2)) : '{}'}</textarea></label>
                        <label>options <textarea name="options">${p && p.options ? esc(JSON.stringify(p.options, null, 2)) : '{}'}</textarea></label>
                    </details>
                    <div id="prod-err" class="err" hidden></div>
                    <div class="modal-actions">
                        <button type="button" id="prod-cancel">Annuler</button>
                        <button type="submit" class="btn">${isEdit ? 'Enregistrer' : 'Créer'}</button>
                    </div>
                </form>
            </div>`;

        document.body.appendChild(modal);

        // ── Fermeture modale ──────────────────────────────────
        modal.querySelector('#prod-cancel').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });

        // ── Upload image locale ───────────────────────────────
        modal.querySelector('#upload-btn').addEventListener('click', async function () {
            const fileInput = modal.querySelector('#upload-file');
            const statusEl  = modal.querySelector('#upload-status');
            const textarea  = modal.querySelector('#images-textarea');

            if (!fileInput.files.length) {
                statusEl.style.color = '#e55';
                statusEl.textContent = 'Sélectionne d\'abord un fichier.';
                return;
            }

            const formData = new FormData();
            formData.append('image', fileInput.files[0]);

            statusEl.style.color = 'var(--muted,#888)';
            statusEl.textContent = 'Upload en cours…';

            try {
                const token = PearTechAPI.getToken();
                const rep = await fetch('http://localhost:3000/api/admin/upload', {
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer ' + token },
                    body: formData
                });
                const data = await rep.json();
                if (!rep.ok) throw new Error(data.erreur || 'Erreur upload');

                const current = textarea.value.trim();
                textarea.value = current ? current + '\n' + data.chemin : data.chemin;

                statusEl.style.color = '#2a9d5c';
                statusEl.textContent = '✓ Image uploadée : ' + data.chemin;
                fileInput.value = '';
            } catch (err) {
                statusEl.style.color = '#e55';
                statusEl.textContent = 'Erreur : ' + err.message;
            }
        });

        // ── Soumission formulaire ─────────────────────────────
        modal.querySelector('#prod-form').addEventListener('submit', async e => {
            e.preventDefault();
            const f = e.target;
            const errEl = modal.querySelector('#prod-err');
            errEl.hidden = true;

            let specs, options;
            try {
                specs   = JSON.parse(f.specs.value || '{}');
                options = JSON.parse(f.options.value || '{}');
            } catch (err) {
                errEl.textContent = 'Le JSON specs/options est invalide.';
                errEl.hidden = false;
                return;
            }

            const payload = {
                nom:           f.nom.value.trim(),
                slug:          f.slug.value.trim(),
                marque:        f.marque.value.trim() || null,
                categorieId:   f.categorieId.value,
                prix:          parseFloat(f.prix.value),
                ancienPrix:    f.ancienPrix.value ? parseFloat(f.ancienPrix.value) : null,
                stock:         parseInt(f.stock.value) || 0,
                note:          parseFloat(f.note.value) || 0,
                nbAvis:        parseInt(f.nbAvis.value) || 0,
                estNouveau:    f.estNouveau.checked,
                estBestSeller: f.estBestSeller.checked,
                description:   f.description.value.trim(),
                images:        f.images.value.split('\n').map(s => s.trim()).filter(Boolean),
                tags:          f.tags.value.split(',').map(s => s.trim()).filter(Boolean),
                specs:         specs,
                options:       options
            };

            try {
                if (isEdit) await PearTechAPI.produitModifier(p.id, payload);
                else        await PearTechAPI.produitCreer(payload);
                modal.remove();
                toast(isEdit ? 'Produit modifié' : 'Produit créé');
                loadProduits();
            } catch (err) {
                errEl.textContent = (err.details && err.details.map(d => d.message).join(' ')) || err.message;
                errEl.hidden = false;
            }
        });
    }

    // ── Commandes ─────────────────────────────────────────────
    async function loadCommandes() {
        try {
            const cmds = await PearTechAPI.adminCommandes();
            const statuts = ['en attente', 'payée', 'expédiée', 'livrée', 'annulée'];
            content().innerHTML = `
                <h1>Commandes (${cmds.length})</h1>
                <table class="tbl">
                    <thead><tr><th>N°</th><th>Client</th><th>Date</th><th>Articles</th><th>Total</th><th>Statut</th></tr></thead>
                    <tbody>
                    ${cmds.map(c => `
                        <tr>
                            <td>#${c.id}</td>
                            <td>${esc(c.clientEmail)}</td>
                            <td>${dateFr(c.creeLe)}</td>
                            <td>${(c.articles || []).map(a => esc(a.quantite + '× ' + a.nom)).join('<br>')}</td>
                            <td>${euro(c.total)}</td>
                            <td><select data-cmd="${c.id}">
                                ${statuts.map(s => `<option ${c.statut === s ? 'selected' : ''}>${s}</option>`).join('')}
                            </select></td>
                        </tr>`).join('')}
                    </tbody>
                </table>`;

            content().querySelectorAll('select[data-cmd]').forEach(sel =>
                sel.addEventListener('change', async () => {
                    try { await PearTechAPI.adminCommandeStatut(sel.dataset.cmd, sel.value); toast('Statut mis à jour'); }
                    catch (e) { erreur(e); }
                }));
        } catch (e) { erreur(e); }
    }

    // ── Utilisateurs ──────────────────────────────────────────
    async function loadUtilisateurs() {
        try {
            const us = await PearTechAPI.adminUtilisateurs();
            content().innerHTML = `
                <h1>Utilisateurs (${us.length})</h1>
                <table class="tbl">
                    <thead><tr><th>ID</th><th>Nom</th><th>Email</th><th>Rôle</th><th>Inscrit le</th><th>Actions</th></tr></thead>
                    <tbody>
                    ${us.map(u => `
                        <tr>
                            <td>${u.id}</td>
                            <td>${esc(u.prenom + ' ' + u.nom)}</td>
                            <td>${esc(u.email)}</td>
                            <td><select data-role="${u.id}">
                                <option value="client" ${u.role === 'client' ? 'selected' : ''}>client</option>
                                <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>admin</option>
                            </select></td>
                            <td>${dateFr(u.creeLe)}</td>
                            <td class="actions"><button data-del-user="${u.id}" class="danger">Suppr.</button></td>
                        </tr>`).join('')}
                    </tbody>
                </table>`;

            content().querySelectorAll('select[data-role]').forEach(sel =>
                sel.addEventListener('change', async () => {
                    try { await PearTechAPI.adminUtilisateurModifier(sel.dataset.role, { role: sel.value }); toast('Rôle mis à jour'); }
                    catch (e) { erreur(e); }
                }));
            content().querySelectorAll('[data-del-user]').forEach(b =>
                b.addEventListener('click', async () => {
                    if (!confirm('Supprimer cet utilisateur ?')) return;
                    try { await PearTechAPI.adminUtilisateurSupprimer(b.dataset.delUser); toast('Utilisateur supprimé'); loadUtilisateurs(); }
                    catch (e) { erreur(e); }
                }));
        } catch (e) { erreur(e); }
    }

    // ── Messages de contact ───────────────────────────────────
    async function loadMessages() {
        try {
            const ms = await PearTechAPI.adminMessages();
            content().innerHTML = `
                <h1>Messages de contact (${ms.length})</h1>
                ${ms.length === 0
                    ? '<p style="color:var(--muted)">Aucun message reçu.</p>'
                    : ms.map(m => `
                        <div class="msg">
                            <div class="msg-head"><strong>${esc(m.sujet)}</strong><span>${dateFr(m.creeLe)}</span></div>
                            <div class="msg-from">${esc(m.nom)} — ${esc(m.email)}</div>
                            <p>${esc(m.message)}</p>
                        </div>`).join('')}`;
        } catch (e) { erreur(e); }
    }

})();