# Documentation du déploiement — PearTech API

## 1. Prérequis

- **Node.js** 18+
- **MySQL** 8 (fourni par Laragon)
- **HeidiSQL** (inclus dans Laragon) pour exécuter les scripts SQL

## 2. Installation en local (développement)

```bash
cd backend
npm install                 # installe les dépendances
copy .env.example .env      # configure l'environnement (Windows)
```

Créer la base puis la remplir :

1. Dans **HeidiSQL**, exécuter `database/schema.sql` (crée la base + les tables).
2. Remplir les données de test, au choix :
   - `npm run seed` (script Node, recommandé), **ou**
   - exécuter `database/seed.sql` dans HeidiSQL.

Démarrer le serveur :

```bash
npm start                   # http://localhost:3000
```

## 3. Variables d'environnement (`.env`)

| Variable | Description |
|---|---|
| `PORT` | port du serveur (défaut 3000) |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | connexion MySQL |
| `JWT_SECRET` | clé secrète de signature des tokens (**à changer en prod**) |
| `JWT_EXPIRES_IN` | durée de l'access token (ex : `1h`) |
| `JWT_REFRESH_EXPIRES_IN` | durée du refresh token (ex : `7d`) |
| `FRONT_URL` | origine autorisée par CORS (vide = tout autoriser, dev) |

## 4. Mise en production

1. Installer Node.js et MySQL sur le serveur.
2. `npm install --production`.
3. Créer un `.env` de production :
   - identifiants MySQL de production ;
   - `JWT_SECRET` **long et aléatoire** ;
   - `FRONT_URL` = URL réelle du front.
4. Exécuter `database/schema.sql` puis `npm run seed` (ou `seed.sql`).
5. Lancer avec un gestionnaire de processus (**PM2**) :
   ```bash
   npm install -g pm2
   pm2 start server.js --name peartech-api
   pm2 startup && pm2 save     # redémarrage automatique
   ```
6. Placer l'API derrière un reverse proxy **HTTPS** (Nginx / Apache).

## 5. Comptes de test

| Rôle | Email | Mot de passe |
|---|---|---|
| Administrateur | `admin@peartech.fr` | `Admin1234` |
| Client | `demo@peartech.fr` | `Demo1234` |

---

## 6. Scénario de test complet (parcours d'achat)

> Toutes les commandes `curl` ci-dessous supposent l'API sur `http://localhost:3000`.
> Sur Windows, utiliser un seul niveau de guillemets ou Postman.

### 1) Inscription
```bash
curl -X POST http://localhost:3000/api/auth/inscription \
  -H "Content-Type: application/json" \
  -d '{"prenom":"Test","nom":"User","email":"test@mail.fr","motDePasse":"Test1234"}'
```
→ renvoie `token`, `refreshToken` et l'utilisateur.

### 2) Connexion et récupération du JWT
```bash
curl -X POST http://localhost:3000/api/auth/connexion \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@peartech.fr","motDePasse":"Demo1234"}'
```
→ copier le `token` renvoyé (utilisé ci-dessous comme `$TOKEN`).

### 3) Consultation des produits (filtres, tri, recherche, pagination)
```bash
curl "http://localhost:3000/api/produits?categorie=apple&prixMax=1200&tri=prix_asc&page=1&limit=10"
curl "http://localhost:3000/api/produits?recherche=ipad"
```

### 4) Ajout de produits au panier
```bash
curl -X POST http://localhost:3000/api/panier \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"produitId":3,"quantite":1}'
```

### 5) Création de la commande (depuis le panier)
```bash
curl -X POST http://localhost:3000/api/commandes/depuis-panier \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"adresseLivraison":"10 rue de Paris, 75001 Paris"}'
```
→ renvoie `commandeId`, `sousTotal`, `tva`, `fraisPort`, `total`.
   Un email de confirmation (simulé) est affiché dans la console du serveur.

### 6) Vérification du stock mis à jour
```bash
curl "http://localhost:3000/api/produits/3"
```
→ le `stock` a diminué de la quantité commandée.

### 7) Consultation de la commande créée
```bash
curl http://localhost:3000/api/commandes \
  -H "Authorization: Bearer $TOKEN"
```

### 8) Ajout d'un avis
```bash
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"produitId":3,"note":5,"commentaire":"Très bon produit !"}'
```
→ la note moyenne du produit est recalculée automatiquement.

### Bonus — espace admin
```bash
# Connexion admin -> $ATOKEN
curl http://localhost:3000/api/admin/statistics -H "Authorization: Bearer $ATOKEN"
```
→ top produits, chiffre d'affaires par mois, pages les plus visitées.
