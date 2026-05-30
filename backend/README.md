# Back-end PearTech — API REST

API REST du site e-commerce **PearTech** (smartphones, tablettes, montres connectées).
Réalisée en **Node.js / Express** avec une base **MySQL**, dans le cadre du **CCP2 du titre DWWM**
(« Développer la partie back-end d'une application web ou web mobile sécurisée »).

---

## 1. Technologies

| Élément | Choix |
|---|---|
| Langage / runtime | Node.js (JavaScript) |
| Framework web | Express |
| Base de données | MySQL (via Laragon / HeidiSQL) |
| Accès BDD | `mysql2` avec **requêtes préparées** |
| Authentification | JSON Web Token (JWT) |
| Mots de passe | Hachage **bcrypt** |
| Validation des saisies | express-validator |
| Sécurité HTTP | helmet, cors, express-rate-limit |

L'architecture suit le modèle **MVC** :
- `models/` → accès aux données (SQL) ;
- `controllers/` → logique métier ;
- `routes/` → points d'entrée HTTP ;
- `middlewares/` → sécurité (authentification, validation, erreurs).

---

## 2. Prérequis

- **Node.js** version 18 ou supérieure
- **Laragon** (ou tout serveur MySQL) démarré
- **HeidiSQL** (inclus dans Laragon) pour exécuter le script SQL

---

## 3. Installation (en local)

### Étape 1 — Installer les dépendances
```bash
cd backend
npm install
```

### Étape 2 — Configurer l'environnement
Copier le fichier d'exemple et l'adapter si besoin :
```bash
copy .env.example .env      # Windows
# cp .env.example .env      # Mac/Linux
```
Par défaut, la configuration correspond à Laragon (utilisateur `root`, sans mot de passe).

### Étape 3 — Créer la base de données
Ouvrir **HeidiSQL**, puis exécuter le contenu du fichier :
```
database/schema.sql
```
Cela crée la base `peartech` et ses 9 tables.

### Étape 4 — Remplir la base (catalogue + comptes)
```bash
npm run seed
```
Cela insère les 4 catégories, les 30 produits, et deux comptes :

| Rôle | Email | Mot de passe |
|---|---|---|
| Administrateur | `admin@peartech.fr` | `Admin1234` |
| Client (démo) | `demo@peartech.fr` | `Demo1234` |

### Étape 5 — Démarrer le serveur
```bash
npm start
```
L'API est disponible sur **http://localhost:3000**.

---

## 4. Modèle de données (relationnel)

```
categories (1) ───< produits (N)
utilisateurs (1) ───< adresses (N)
utilisateurs (1) ───< favoris (N) >─── (1) produits
utilisateurs (1) ───< panier (N) >─── (1) produits
utilisateurs (1) ───< commandes (1) ───< commande_articles (N) >─── produits
messages_contact   (table indépendante)
```

- Les **clés étrangères** garantissent l'intégrité des données.
- Les colonnes variables (caractéristiques, options, images) sont stockées en **JSON**
  pour rester simple ; le reste est entièrement relationnel.

---

## 5. Liste des routes de l'API

### Authentification — `/api/auth`
| Méthode | Route | Accès | Description |
|---|---|---|---|
| POST | `/inscription` | Public | Créer un compte |
| POST | `/connexion` | Public | Se connecter (renvoie un token) |
| GET | `/profil` | Connecté | Voir son profil |
| PUT | `/profil` | Connecté | Modifier ses informations |
| PUT | `/mot-de-passe` | Connecté | Changer son mot de passe |

### Produits — `/api/produits`
| Méthode | Route | Accès | Description |
|---|---|---|---|
| GET | `/` | Public | Lister (filtres : `categorie`, `recherche`, `nouveaute`, `bestseller`) |
| GET | `/:id` | Public | Détail par id **ou** slug |
| POST | `/` | Admin | Créer un produit |
| PUT | `/:id` | Admin | Modifier un produit |
| DELETE | `/:id` | Admin | Supprimer un produit |

### Catégories — `/api/categories`
| GET | `/` | Public | Lister les catégories |
| GET | `/:slug` | Public | Détail d'une catégorie |

### Favoris — `/api/favoris` (connexion obligatoire)
| GET | `/` | Lister ses favoris |
| POST | `/` | Ajouter un favori (`{ produitId }`) |
| DELETE | `/:produitId` | Retirer un favori |

### Panier — `/api/panier` (connexion obligatoire)
| Méthode | Route | Description |
|---|---|---|
| GET | `/` | Voir son panier (avec prix et total calculés côté serveur) |
| POST | `/` | Ajouter un produit (`{ produitId, quantite, options }`) — incrémente si déjà présent |
| PUT | `/:produitId` | Modifier la quantité d'une ligne (`{ quantite }`) |
| DELETE | `/:produitId` | Retirer un produit du panier |
| DELETE | `/` | Vider le panier |

### Commandes — `/api/commandes` (connexion obligatoire)
| Méthode | Route | Description |
|---|---|---|
| GET | `/` | Lister ses commandes |
| GET | `/:id` | Détail d'une commande |
| POST | `/` | Passer une commande à partir d'une liste d'articles |
| POST | `/depuis-panier` | Passer commande depuis le panier serveur (puis le vide) |

> Dans tous les cas, **le prix est recalculé côté serveur** à partir de la base.

### Adresses — `/api/adresses` (connexion obligatoire)
| GET | `/` | Lister | POST | `/` | Ajouter | PUT | `/:id` | Modifier | DELETE | `/:id` | Supprimer |

### Contact — `/api/contact`
| POST | `/` | Public | Envoyer un message |
| GET | `/` | Admin | Lire les messages reçus |

---

## 6. Sécurité mise en place

- **Mots de passe hachés** avec bcrypt (jamais stockés en clair).
- **Authentification par token JWT** envoyé dans l'en-tête `Authorization: Bearer <token>`.
- **Autorisations par rôle** (`client` / `admin`) via un middleware dédié.
- **Requêtes SQL préparées** (paramètres `?`) → protection contre les injections SQL.
- **Validation de toutes les saisies** avec express-validator.
- **helmet** (en-têtes HTTP de sécurité) et **CORS** restreint au front.
- **Limitation du nombre de tentatives de connexion** (anti force brute).
- Le **prix des commandes est recalculé par le serveur** (on ne fait pas confiance au client).

---

## 7. Exemples d'appels (curl)

```bash
# Lister les produits Apple
curl "http://localhost:3000/api/produits?categorie=apple"

# Se connecter
curl -X POST http://localhost:3000/api/auth/connexion \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"demo@peartech.fr\",\"motDePasse\":\"Demo1234\"}"

# Voir son profil (avec le token reçu)
curl http://localhost:3000/api/auth/profil \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

---

## 8. Déploiement en production

1. Installer Node.js et MySQL sur le serveur.
2. Cloner le projet et lancer `npm install --production`.
3. Créer un fichier `.env` avec :
   - les identifiants de la base de données de production ;
   - un `JWT_SECRET` **long et aléatoire** ;
   - l'URL réelle du front dans `FRONT_URL`.
4. Exécuter `database/schema.sql` puis `npm run seed` sur la base de production.
5. Démarrer l'application avec un gestionnaire de processus (ex : **PM2**) :
   ```bash
   npm install -g pm2
   pm2 start server.js --name peartech-api
   ```
6. Placer l'API derrière un reverse proxy **HTTPS** (Nginx ou Apache).

---

## 9. Intégration avec le front-end

Le site PearTech (dossier parent `../`) consomme cette API.

- **`asset/js/api.js`** : client centralisé (gère le token JWT et expose `window.PearTechAPI`).
  Il est chargé **avant** les autres scripts sur toutes les pages.
- Fonctionnalités branchées sur l'API :
  - **Compte** (`profil.js`) : inscription, connexion, profil, mot de passe ;
  - **Adresses** (`profil.js`) : ajout / modification / suppression / adresse principale en base ;
  - **Favoris** (`favoris.js`) : synchronisés quand l'utilisateur est connecté ;
  - **Panier** (`panier.js` / `cart.js`) : recopié en base (table `panier`) ;
  - **Commande** (`paiement.js`) : crée une commande réelle en base ;
  - **Contact** (`contact.js`) : enregistre le message en base.
- Le **catalogue** (produits/catégories) reste affiché côté client (`data.js`).
- Un **invité non connecté** continue d'utiliser le `localStorage` (aucune régression).

> Pour tester en local : démarrer l'API (`npm start`) **et** servir le site
> (Laragon, ou un simple serveur statique sur le dossier `../`).
```
