// ============================================================
//  PearTech — Remplissage de la base de données
//  Usage : npm run seed   (après avoir exécuté schema.sql)
//
//  Le catalogue (catégories + produits) est repris du fichier front
//  "asset/js/data.js". On ajoute 10 utilisateurs, 15 commandes et
//  20 avis pour respecter les jeux de données de test du sujet.
// ============================================================

require('dotenv').config();
const path = require('path');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

// data.js attend un objet "window" (code navigateur) : on en crée un faux.
global.window = {};
require(path.join(__dirname, '..', '..', 'asset', 'js', 'data.js'));
const catalogue = global.window.PearTechDB;

// Déduit la marque d'un produit à partir de son nom / ses tags
function marqueDe(p) {
    const s = ((p.name || '') + ' ' + (p.tags || []).join(' ')).toLowerCase();
    if (/iphone|ipad|apple|airpods/.test(s)) return 'Apple';
    if (/samsung|galaxy/.test(s))            return 'Samsung';
    if (/pixel|google/.test(s))              return 'Google';
    if (/xiaomi/.test(s))                    return 'Xiaomi';
    if (/fitbit/.test(s))                    return 'Fitbit';
    if (/amazon|fire/.test(s))               return 'Amazon';
    return 'Autre';
}

// Entier aléatoire entre min et max (inclus)
const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Date aléatoire dans les 6 derniers mois (format MySQL)
function datePassee() {
    const d = new Date();
    d.setDate(d.getDate() - rnd(0, 180));
    return d.toISOString().slice(0, 19).replace('T', ' ');
}

async function remplir() {
    const cnx = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'peartech'
    });

    console.log('Connecté à la base. Nettoyage des tables…');
    await cnx.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const t of ['commande_articles', 'commandes', 'cart_items', 'cart', 'reviews',
                     'favoris', 'adresses', 'statistiques', 'logs', 'messages_contact',
                     'produits', 'categories', 'utilisateurs']) {
        await cnx.query(`TRUNCATE TABLE ${t}`);
    }
    await cnx.query('SET FOREIGN_KEY_CHECKS = 1');

    // --- 1) Catégories (5) ---
    for (const c of catalogue.categories) {
        await cnx.query(
            `INSERT INTO categories (id, nom, slug, description, icon, image) VALUES (?, ?, ?, ?, ?, ?)`,
            [c.id, c.name, c.slug, c.description, c.icon, c.image]
        );
    }
    console.log(`✅ ${catalogue.categories.length} catégories`);

    // --- 2) Produits (33) ---
    for (const p of catalogue.products) {
        await cnx.query(
            `INSERT INTO produits
                (id, nom, slug, categorie_id, marque, prix, ancien_prix, description,
                 stock, est_nouveau, est_bestseller, note, nb_avis, specs, options, images, tags)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                p.id, p.name, p.slug, p.categoryId, marqueDe(p), p.basePrice, p.oldPrice,
                p.description, p.stock, !!p.isNew, !!p.isBestSeller, p.rating, p.reviews,
                JSON.stringify(p.specs || {}), JSON.stringify(p.options || {}),
                JSON.stringify(p.images || []), JSON.stringify(p.tags || [])
            ]
        );
    }
    console.log(`✅ ${catalogue.products.length} produits`);

    // --- 3) Utilisateurs (10 : 1 admin + 9 clients) ---
    const hashAdmin = await bcrypt.hash('Admin1234', 10);
    const hashDemo  = await bcrypt.hash('Demo1234', 10); // mot de passe commun aux clients de test

    await cnx.query(
        `INSERT INTO utilisateurs (prenom, nom, email, mot_de_passe, role) VALUES (?, ?, ?, ?, 'admin')`,
        ['Admin', 'PearTech', 'admin@peartech.fr', hashAdmin]
    );

    // Clients de test aux noms variés (français, africains, arabes)
    const clients = [
        ['Jean', 'Dupont', 'demo@peartech.fr'],                       // compte démo
        ['Aminata', 'Diallo', 'aminata.diallo@example.com'],
        ['Mohammed', 'Cherif', 'mohammed.cherif@example.com'],
        ['Fatou', 'Traoré', 'fatou.traore@example.com'],
        ['Yasmine', 'Benali', 'yasmine.benali@example.com'],
        ['Mamadou', 'Koné', 'mamadou.kone@example.com'],
        ['Amina', 'Haddad', 'amina.haddad@example.com'],
        ['Kwame', 'Mensah', 'kwame.mensah@example.com'],
        ['Karim', 'Belkacem', 'karim.belkacem@example.com']
    ];
    const clientIds = [];
    for (const [prenom, nom, email] of clients) {
        const [r] = await cnx.query(
            `INSERT INTO utilisateurs (prenom, nom, email, mot_de_passe, role) VALUES (?, ?, ?, ?, 'client')`,
            [prenom, nom, email, hashDemo]
        );
        clientIds.push(r.insertId);
    }
    console.log(`✅ ${clients.length + 1} utilisateurs (admin@peartech.fr / Admin1234 — demo@peartech.fr / Demo1234)`);

    // --- 4) Quelques adresses de livraison ---
    for (let i = 0; i < 5; i++) {
        await cnx.query(
            `INSERT INTO adresses (utilisateur_id, nom, rue, code_postal, ville, pays, principale)
             VALUES (?, 'Domicile', ?, ?, ?, 'France', TRUE)`,
            [clientIds[i], `${rnd(1, 99)} rue de la République`, `${rnd(10, 95)}000`, 'Paris']
        );
    }
    console.log('✅ 5 adresses');

    // --- 5) Commandes (15) avec lignes + calcul TVA/port ---
    const produits = catalogue.products;
    const statuts = ['en attente', 'payée', 'expédiée', 'livrée', 'annulée'];
    for (let i = 0; i < 15; i++) {
        const userId = clientIds[rnd(0, clientIds.length - 1)];
        const nbLignes = rnd(1, 3);
        const lignes = [];
        let sousTotal = 0;
        for (let j = 0; j < nbLignes; j++) {
            const p = produits[rnd(0, produits.length - 1)];
            const q = rnd(1, 2);
            sousTotal += p.basePrice * q;
            lignes.push({ id: p.id, nom: p.name, prix: p.basePrice, q });
        }
        sousTotal = Math.round(sousTotal * 100) / 100;
        const fraisPort = sousTotal >= 100 ? 0 : 5.90;
        const tva = Math.round((sousTotal - sousTotal / 1.2) * 100) / 100;
        const total = Math.round((sousTotal + fraisPort) * 100) / 100;
        const date = datePassee();

        const [cmd] = await cnx.query(
            `INSERT INTO commandes (utilisateur_id, sous_total, tva, frais_port, total, statut, adresse_livraison, cree_le)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, sousTotal, tva, fraisPort, total, statuts[rnd(0, statuts.length - 1)],
             'Adresse de livraison de test, 75001 Paris', date]
        );
        for (const l of lignes) {
            await cnx.query(
                `INSERT INTO commande_articles (commande_id, produit_id, nom_produit, prix_unitaire, quantite)
                 VALUES (?, ?, ?, ?, ?)`,
                [cmd.insertId, l.id, l.nom, l.prix, l.q]
            );
        }
    }
    console.log('✅ 15 commandes (avec détails)');

    // --- 6) Avis clients (20, sans doublon utilisateur+produit) ---
    const commentaires = [
        'Excellent produit, je recommande !', 'Très bon rapport qualité-prix.',
        'Conforme à mes attentes.', 'Livraison rapide, produit nickel.',
        'Un peu cher mais ça vaut le coup.', 'Déçu, je m\'attendais à mieux.',
        'Parfait, rien à redire.', 'Bonne qualité générale.', 'Correct sans plus.',
        'Je rachèterai sans hésiter.'
    ];
    const dejaVu = new Set();
    let nbAvis = 0;
    let essais = 0;
    while (nbAvis < 20 && essais < 500) {
        essais++;
        const userId = clientIds[rnd(0, clientIds.length - 1)];
        const p = produits[rnd(0, produits.length - 1)];
        const cle = userId + '-' + p.id;
        if (dejaVu.has(cle)) continue;     // un seul avis par couple (user, produit)
        dejaVu.add(cle);
        await cnx.query(
            `INSERT INTO reviews (utilisateur_id, produit_id, note, commentaire) VALUES (?, ?, ?, ?)`,
            [userId, p.id, rnd(3, 5), commentaires[rnd(0, commentaires.length - 1)]]
        );
        nbAvis++;
    }
    console.log(`✅ ${nbAvis} avis`);

    // --- 7) Recalcule la note moyenne + nb d'avis de chaque produit ---
    await cnx.query(`
        UPDATE produits p
        LEFT JOIN (
            SELECT produit_id, ROUND(AVG(note),1) AS moy, COUNT(*) AS nb
            FROM reviews GROUP BY produit_id
        ) r ON r.produit_id = p.id
        SET p.note = COALESCE(r.moy, 0), p.nb_avis = COALESCE(r.nb, 0)
    `);
    console.log('✅ Notes moyennes recalculées');

    await cnx.end();
    console.log('🎉 Base remplie avec succès.');
}

remplir().catch(err => {
    console.error('❌ Erreur pendant le remplissage :', err.message);
    process.exit(1);
});
