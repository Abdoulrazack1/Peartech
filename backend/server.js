// ============================================================
//  PearTech — Point d'entrée du serveur (API REST).
//
//  Lance Express, branche les middlewares de sécurité, monte
//  toutes les routes sous /api, puis écoute sur le port choisi.
// ============================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const pool = require('./src/config/db');
const journal = require('./src/middlewares/journal');
const { routeIntrouvable, gestionErreurs } = require('./src/middlewares/erreur');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middlewares globaux ---
app.use(helmet());                              // en-têtes HTTP de sécurité
app.use(cors({ origin: process.env.FRONT_URL || '*' })); // autorise le front à appeler l'API
app.use(express.json());                        // lecture du corps JSON des requêtes
app.use(journal);                               // journalise visites + erreurs (logs/statistiques)

// --- Route d'accueil / vérification ---
app.get('/', (req, res) => {
    res.json({
        message: 'API PearTech opérationnelle 🍐',
        version: '1.0.0',
        documentation: 'Voir le README.md',
        routes: ['/api/produits', '/api/categories', '/api/auth', '/api/favoris',
                 '/api/panier', '/api/commandes', '/api/reviews', '/api/adresses',
                 '/api/contact', '/api/admin']
    });
});

// --- Routes de l'API ---
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/produits', require('./src/routes/produitRoutes'));
app.use('/api/categories', require('./src/routes/categorieRoutes'));
app.use('/api/favoris', require('./src/routes/favoriRoutes'));
app.use('/api/panier', require('./src/routes/panierRoutes'));
app.use('/api/commandes', require('./src/routes/commandeRoutes'));
app.use('/api/reviews', require('./src/routes/reviewRoutes'));
app.use('/api/adresses', require('./src/routes/adresseRoutes'));
app.use('/api/contact', require('./src/routes/messageRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));

// --- Gestion des erreurs (toujours en dernier) ---
app.use(routeIntrouvable);
app.use(gestionErreurs);

// --- Démarrage : on vérifie d'abord la connexion à la base ---
async function demarrer() {
    try {
        const cnx = await pool.getConnection();
        await cnx.ping();
        cnx.release();
        console.log('✅ Connexion à la base de données réussie.');

        app.listen(PORT, () => {
            console.log(`🚀 Serveur PearTech démarré sur http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('❌ Impossible de se connecter à la base de données :', err.message);
        console.error('   Vérifiez que MySQL (Laragon) est démarré et que le fichier .env est correct.');
        process.exit(1);
    }
}

demarrer();
