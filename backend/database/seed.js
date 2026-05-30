// ============================================================
//  PearTech — Remplissage de la base de données
//  Usage : npm run seed   (après avoir exécuté schema.sql)
//
//  Le catalogue (catégories + produits) est repris directement du
//  fichier front "asset/js/data.js" : une seule source de vérité.
//  On ajoute aussi un compte administrateur et un compte démo.
// ============================================================

require('dotenv').config();
const path = require('path');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

// --- Astuce : data.js attend un objet "window" (code navigateur).
//     On en crée un faux pour pouvoir le charger côté Node. ---
global.window = {};
require(path.join(__dirname, '..', '..', 'asset', 'js', 'data.js'));
const catalogue = global.window.PearTechDB;

async function remplir() {
    // Connexion à la base déjà créée par schema.sql
    const cnx = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'peartech'
    });

    console.log('Connecté à la base. Nettoyage des tables…');
    // On vide dans l'ordre des dépendances
    await cnx.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const table of ['commande_articles', 'commandes', 'panier', 'favoris',
                         'adresses', 'produits', 'categories', 'utilisateurs']) {
        await cnx.query(`TRUNCATE TABLE ${table}`);
    }
    await cnx.query('SET FOREIGN_KEY_CHECKS = 1');

    // --- 1) Catégories ---
    for (const c of catalogue.categories) {
        await cnx.query(
            `INSERT INTO categories (id, nom, slug, description, icon, image)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [c.id, c.name, c.slug, c.description, c.icon, c.image]
        );
    }
    console.log(`✅ ${catalogue.categories.length} catégories insérées`);

    // --- 2) Produits ---
    for (const p of catalogue.products) {
        await cnx.query(
            `INSERT INTO produits
                (id, nom, slug, categorie_id, prix, ancien_prix, description,
                 stock, est_nouveau, est_bestseller, note, nb_avis,
                 specs, options, images, tags)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                p.id, p.name, p.slug, p.categoryId, p.basePrice, p.oldPrice,
                p.description, p.stock, !!p.isNew, !!p.isBestSeller,
                p.rating, p.reviews,
                JSON.stringify(p.specs || {}),
                JSON.stringify(p.options || {}),
                JSON.stringify(p.images || []),
                JSON.stringify(p.tags || [])
            ]
        );
    }
    console.log(`✅ ${catalogue.products.length} produits insérés`);

    // --- 3) Comptes utilisateurs (mots de passe hachés avec bcrypt) ---
    const hashAdmin = await bcrypt.hash('Admin1234', 10);
    const hashDemo  = await bcrypt.hash('Demo1234', 10);

    await cnx.query(
        `INSERT INTO utilisateurs (prenom, nom, email, mot_de_passe, role)
         VALUES (?, ?, ?, ?, ?)`,
        ['Admin', 'PearTech', 'admin@peartech.fr', hashAdmin, 'admin']
    );
    await cnx.query(
        `INSERT INTO utilisateurs (prenom, nom, email, mot_de_passe, role)
         VALUES (?, ?, ?, ?, ?)`,
        ['Jean', 'Dupont', 'demo@peartech.fr', hashDemo, 'client']
    );
    console.log('✅ Comptes créés : admin@peartech.fr / Admin1234  —  demo@peartech.fr / Demo1234');

    await cnx.end();
    console.log('🎉 Base remplie avec succès.');
}

remplir().catch(err => {
    console.error('❌ Erreur pendant le remplissage :', err.message);
    process.exit(1);
});
