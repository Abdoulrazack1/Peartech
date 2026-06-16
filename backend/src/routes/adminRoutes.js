// ============================================================
//  Routes de l'espace administrateur : /api/admin/...
//  Tout est protégé : token JWT valide + rôle "admin".
// ============================================================

const express = require('express');
const { body } = require('express-validator');
const path  = require('path');
const multer = require('multer');

const admin = require('../controllers/adminController');
const { verifierToken, verifierAdmin } = require('../middlewares/auth');
const { valider } = require('../middlewares/erreur');
const a = require('../middlewares/asyncHandler');

const router = express.Router();

// ── Configuration Multer (upload d'images produit) ────────────
// Les fichiers sont sauvegardés dans asset/image/ à la racine du front
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Remonte de src/routes/ jusqu'à la racine du projet, puis vers le front
        // Adapte ce chemin si ton dossier asset/ est ailleurs
        cb(null, path.join(__dirname, '..', '..', '..', 'asset', 'image'));
    },
    filename: function (req, file, cb) {
        // Préfixe avec un timestamp pour éviter les collisions de noms
        const ext = path.extname(file.originalname).toLowerCase();
        const nom = path.basename(file.originalname, ext)
            .replace(/[^a-z0-9_-]/gi, '_') // Remplace les caractères spéciaux par _
            .toLowerCase();
        cb(null, nom + '-' + Date.now() + ext);
    }
});

// N'accepte que les images (jpg, png, webp, gif)
const fileFilter = (req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Seules les images JPG, PNG, WEBP et GIF sont acceptées.'));
    }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5 Mo max

// Toutes les routes admin exigent un administrateur connecté
router.use(verifierToken, verifierAdmin);

// ── Upload d'image produit ─────────────────────────────────────
// POST /api/admin/upload  →  { chemin: "asset/image/nom-fichier.jpg" }
router.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ erreur: 'Aucun fichier reçu.' });
    // Renvoie le chemin relatif utilisable directement comme URL dans le front
    res.json({ chemin: 'asset/image/' + req.file.filename });
});

// Tableau de bord et statistiques
router.get('/stats', a(admin.stats));
router.get('/statistics', a(admin.statistiques));
router.get('/logs', a(admin.logs));

// Commandes
router.get('/commandes', a(admin.listerCommandes));
router.put('/commandes/:id',
    [ body('statut').notEmpty().withMessage('Statut obligatoire.') ],
    valider,
    a(admin.modifierStatutCommande)
);

// Utilisateurs
router.get('/utilisateurs', a(admin.listerUtilisateurs));
router.put('/utilisateurs/:id',
    [ body('email').optional().isEmail().withMessage('Email invalide.') ],
    valider,
    a(admin.modifierUtilisateur)
);
router.delete('/utilisateurs/:id', a(admin.supprimerUtilisateur));

// Messages de contact
router.get('/messages', a(admin.listerMessages));

module.exports = router;