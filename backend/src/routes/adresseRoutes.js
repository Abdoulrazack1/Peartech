// ============================================================
//  Routes des adresses : /api/adresses/...  (connexion obligatoire)
// ============================================================

const express = require('express');
const { body } = require('express-validator');

const adresse = require('../controllers/adresseController');
const { verifierToken } = require('../middlewares/auth');
const { valider } = require('../middlewares/erreur');
const a = require('../middlewares/asyncHandler');

const router = express.Router();

router.use(verifierToken);

const reglesAdresse = [
    body('nom').trim().notEmpty().withMessage('Le nom de l\'adresse est obligatoire.'),
    body('rue').trim().notEmpty().withMessage('La rue est obligatoire.'),
    body('codePostal').trim().notEmpty().withMessage('Le code postal est obligatoire.'),
    body('ville').trim().notEmpty().withMessage('La ville est obligatoire.')
];

router.get('/', a(adresse.lister));
router.post('/', reglesAdresse, valider, a(adresse.creer));
router.put('/:id', reglesAdresse, valider, a(adresse.modifier));
router.delete('/:id', a(adresse.supprimer));

module.exports = router;
