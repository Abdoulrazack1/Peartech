// ============================================================
//  Connexion à la base de données MySQL (pool de connexions).
//
//  On utilise mysql2 avec des requêtes PRÉPARÉES (paramètres ?)
//  dans tous les modèles : c'est la protection principale contre
//  les injections SQL (compétence sécurité du DWWM).
// ============================================================

require('dotenv').config();
const mysql = require('mysql2/promise');

// Un "pool" garde plusieurs connexions ouvertes et les recycle :
// plus efficace que d'ouvrir/fermer une connexion à chaque requête.
const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'peartech',
    waitForConnections: true,
    connectionLimit: 10,
    charset: 'utf8mb4'
});

module.exports = pool;
