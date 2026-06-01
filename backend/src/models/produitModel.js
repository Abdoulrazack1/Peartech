// ============================================================
//  Accès aux données : produits.
//  Toutes les requêtes sont préparées (paramètres ?) -> anti-injection.
// ============================================================

const pool = require('../config/db');

// Colonnes renvoyées (on évite SELECT *).
// Le "AS xxx" renomme les colonnes snake_case de la base en camelCase
// pour que le front les reçoive directement au bon format.
const COLONNES = `id, nom, slug, categorie_id AS categorieId, prix, ancien_prix AS ancienPrix,
                  description, stock, est_nouveau AS estNouveau, est_bestseller AS estBestSeller,
                  note, nb_avis AS nbAvis, specs, options, images, tags`;

// Liste les produits, avec filtres optionnels.
// filtres = { categorie, recherche, nouveaute, bestseller }
async function lister(filtres = {}) {
    // "WHERE 1 = 1" est une astuce : ça permet d'ajouter chaque filtre
    // avec "AND ..." sans se soucier de savoir si c'est le premier.
    let sql = `SELECT ${COLONNES} FROM produits WHERE 1 = 1`;
    const params = []; // valeurs des "?" (requête préparée = anti-injection)

    // Filtre par catégorie (via le slug de la catégorie)
    if (filtres.categorie) {
        sql += ` AND categorie_id = (SELECT id FROM categories WHERE slug = ?)`;
        params.push(filtres.categorie);
    }

    // Recherche texte sur le nom et la description
    if (filtres.recherche) {
        sql += ` AND (nom LIKE ? OR description LIKE ?)`;
        const motif = '%' + filtres.recherche + '%';
        params.push(motif, motif);
    }

    if (filtres.nouveaute) sql += ` AND est_nouveau = TRUE`;
    if (filtres.bestseller) sql += ` AND est_bestseller = TRUE`;

    sql += ` ORDER BY id`;

    const [lignes] = await pool.query(sql, params);
    return lignes;
}

// Récupère un produit par son identifiant
async function trouverParId(id) {
    const [lignes] = await pool.query(
        `SELECT ${COLONNES} FROM produits WHERE id = ?`, [id]
    );
    return lignes[0] || null;
}

// Récupère un produit par son slug
async function trouverParSlug(slug) {
    const [lignes] = await pool.query(
        `SELECT ${COLONNES} FROM produits WHERE slug = ?`, [slug]
    );
    return lignes[0] || null;
}

// Crée un produit (réservé admin) et renvoie son id
async function creer(p) {
    const [resultat] = await pool.query(
        `INSERT INTO produits
            (nom, slug, categorie_id, prix, ancien_prix, description, stock,
             est_nouveau, est_bestseller, note, nb_avis, specs, options, images, tags)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            p.nom, p.slug, p.categorieId, p.prix, p.ancienPrix || null,
            p.description || '', p.stock || 0, !!p.estNouveau, !!p.estBestSeller,
            p.note || 0, p.nbAvis || 0,
            JSON.stringify(p.specs || {}), JSON.stringify(p.options || {}),
            JSON.stringify(p.images || []), JSON.stringify(p.tags || [])
        ]
    );
    return resultat.insertId;
}

// Met à jour un produit existant (réservé admin)
async function modifier(id, p) {
    const [resultat] = await pool.query(
        `UPDATE produits SET
            nom = ?, slug = ?, categorie_id = ?, prix = ?, ancien_prix = ?,
            description = ?, stock = ?, est_nouveau = ?, est_bestseller = ?,
            note = ?, nb_avis = ?, specs = ?, options = ?, images = ?, tags = ?
         WHERE id = ?`,
        [
            p.nom, p.slug, p.categorieId, p.prix, p.ancienPrix || null,
            p.description || '', p.stock || 0, !!p.estNouveau, !!p.estBestSeller,
            p.note || 0, p.nbAvis || 0,
            JSON.stringify(p.specs || {}), JSON.stringify(p.options || {}),
            JSON.stringify(p.images || []), JSON.stringify(p.tags || []),
            id
        ]
    );
    return resultat.affectedRows > 0;
}

// Supprime un produit (réservé admin)
async function supprimer(id) {
    const [resultat] = await pool.query('DELETE FROM produits WHERE id = ?', [id]);
    return resultat.affectedRows > 0;
}

module.exports = { lister, trouverParId, trouverParSlug, creer, modifier, supprimer };
