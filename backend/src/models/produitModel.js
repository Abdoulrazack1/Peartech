// ============================================================
//  Accès aux données : produits.
//  Toutes les requêtes sont préparées (paramètres ?) -> anti-injection.
// ============================================================

const pool = require('../config/db');

// Colonnes renvoyées (on évite SELECT *).
// Le "AS xxx" renomme les colonnes snake_case en camelCase pour le front.
const COLONNES = `id, nom, slug, categorie_id AS categorieId, marque, prix, ancien_prix AS ancienPrix,
                  description, stock, est_nouveau AS estNouveau, est_bestseller AS estBestSeller,
                  note, nb_avis AS nbAvis, specs, options, images, tags`;

// Construit la clause WHERE commune (filtres) + les paramètres associés.
// filtres = { categorie, recherche, prixMin, prixMax, marque, nouveaute, bestseller }
function construireFiltres(filtres) {
    let where = ' WHERE 1 = 1';   // "1 = 1" : permet d'ajouter chaque filtre avec AND
    const params = [];

    if (filtres.categorie) {       // catégorie via son slug
        where += ' AND categorie_id = (SELECT id FROM categories WHERE slug = ?)';
        params.push(filtres.categorie);
    }
    if (filtres.recherche) {       // recherche texte (nom ou description)
        where += ' AND (nom LIKE ? OR description LIKE ?)';
        const motif = '%' + filtres.recherche + '%';
        params.push(motif, motif);
    }
    if (filtres.marque) {          // filtre par marque
        where += ' AND marque = ?';
        params.push(filtres.marque);
    }
    if (filtres.prixMin) {         // prix minimum
        where += ' AND prix >= ?';
        params.push(filtres.prixMin);
    }
    if (filtres.prixMax) {         // prix maximum
        where += ' AND prix <= ?';
        params.push(filtres.prixMax);
    }
    if (filtres.nouveaute)  where += ' AND est_nouveau = TRUE';
    if (filtres.bestseller) where += ' AND est_bestseller = TRUE';

    return { where, params };
}

// Traduit le paramètre de tri en clause ORDER BY (valeurs contrôlées = pas d'injection)
function construireTri(tri) {
    switch (tri) {
        case 'prix_asc':  return ' ORDER BY prix ASC';
        case 'prix_desc': return ' ORDER BY prix DESC';
        case 'nom_asc':   return ' ORDER BY nom ASC';
        case 'nom_desc':  return ' ORDER BY nom DESC';
        case 'populaire': return ' ORDER BY note DESC, nb_avis DESC';
        case 'nouveaute': return ' ORDER BY cree_le DESC';
        default:          return ' ORDER BY id';
    }
}

// Liste les produits avec filtres, tri et pagination (limit/offset).
async function lister(filtres = {}) {
    const { where, params } = construireFiltres(filtres);
    let sql = `SELECT ${COLONNES} FROM produits` + where + construireTri(filtres.tri);

    // Pagination : on ajoute LIMIT/OFFSET si demandés
    if (filtres.limit) {
        sql += ' LIMIT ? OFFSET ?';
        params.push(parseInt(filtres.limit), parseInt(filtres.offset) || 0);
    }

    const [lignes] = await pool.query(sql, params);
    return lignes;
}

// Compte le nombre total de produits correspondant aux filtres (pour la pagination)
async function compter(filtres = {}) {
    const { where, params } = construireFiltres(filtres);
    const [[r]] = await pool.query(`SELECT COUNT(*) AS total FROM produits` + where, params);
    return r.total;
}

// Liste les marques distinctes (pour proposer un filtre)
async function listerMarques() {
    const [lignes] = await pool.query(
        'SELECT DISTINCT marque FROM produits WHERE marque IS NOT NULL ORDER BY marque'
    );
    return lignes.map(l => l.marque);
}

// Récupère un produit par son identifiant
async function trouverParId(id) {
    const [lignes] = await pool.query(`SELECT ${COLONNES} FROM produits WHERE id = ?`, [id]);
    return lignes[0] || null;
}

// Récupère un produit par son slug
async function trouverParSlug(slug) {
    const [lignes] = await pool.query(`SELECT ${COLONNES} FROM produits WHERE slug = ?`, [slug]);
    return lignes[0] || null;
}

// Crée un produit (réservé admin) et renvoie son id
async function creer(p) {
    const [resultat] = await pool.query(
        `INSERT INTO produits
            (nom, slug, categorie_id, marque, prix, ancien_prix, description, stock,
             est_nouveau, est_bestseller, note, nb_avis, specs, options, images, tags)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            p.nom, p.slug, p.categorieId, p.marque || null, p.prix, p.ancienPrix || null,
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
            nom = ?, slug = ?, categorie_id = ?, marque = ?, prix = ?, ancien_prix = ?,
            description = ?, stock = ?, est_nouveau = ?, est_bestseller = ?,
            note = ?, nb_avis = ?, specs = ?, options = ?, images = ?, tags = ?
         WHERE id = ?`,
        [
            p.nom, p.slug, p.categorieId, p.marque || null, p.prix, p.ancienPrix || null,
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

module.exports = {
    lister, compter, listerMarques, trouverParId, trouverParSlug, creer, modifier, supprimer
};
