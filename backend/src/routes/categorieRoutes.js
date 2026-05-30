// ============================================================
//  Routes des catégories : /api/categories/...  (lecture publique)
// ============================================================

const express = require('express');
const categorie = require('../controllers/categorieController');
const a = require('../middlewares/asyncHandler');

const router = express.Router();

router.get('/', a(categorie.lister));
router.get('/:slug', a(categorie.trouver));

module.exports = router;
