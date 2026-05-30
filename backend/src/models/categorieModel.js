// ============================================================
//  Accès aux données : catégories.
// ============================================================

const pool = require('../config/db');

// Liste toutes les catégories
async function listerToutes() {
    const [lignes] = await pool.query(
        'SELECT id, nom, slug, description, icon, image FROM categories ORDER BY nom'
    );
    return lignes;
}

// Récupère une catégorie par son slug (ex : 'apple')
async function trouverParSlug(slug) {
    const [lignes] = await pool.query(
        'SELECT id, nom, slug, description, icon, image FROM categories WHERE slug = ?',
        [slug]
    );
    return lignes[0] || null;
}

module.exports = { listerToutes, trouverParSlug };
