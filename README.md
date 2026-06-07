# PearTech

E-commerce téléphonie & high-tech, réalisé en autonomie dans le cadre de ma formation **DWWM**.
Le projet est **full-stack** : un front en JavaScript natif (orienté composants, sans framework) et un
**back-end Node.js / Express + MySQL** qui expose une API REST sécurisée (compétences du **CCP2**).

## Stack

**Front-end** : HTML5 · CSS3 · JavaScript ES6+
**Back-end** : Node.js · Express · MySQL (mysql2) · JWT · bcrypt
**Outils** : Git · Laragon · HeidiSQL

## Fonctionnalités

**Catalogue & produits**
- Filtrage combinable (marque, prix, OS, stockage) et tri sans rechargement
- Fiches produits : galerie, caractéristiques, avis, stock et délai de livraison

**Compte & commande (via l'API + base de données)**
- Inscription / connexion sécurisées (mot de passe haché bcrypt, jeton JWT)
- Profil, adresses de livraison, favoris, panier persistant
- Tunnel de commande : panier → paiement → confirmation (commande enregistrée en base)

**Espace administrateur** (`page_admin.html`, réservé au rôle admin)
- Tableau de bord (produits, stock, chiffre d'affaires, clients, messages)
- Gestion des produits (créer / modifier / supprimer)
- Suivi des commandes et changement de statut
- Liste des utilisateurs et messages de contact

**Légal & support** : CGU, CGV, mentions légales, FAQ, contact

## Structure

```
Peartech/
├── asset/
│   ├── css/                  # styles (dont page_admin.css)
│   └── js/                   # scripts front
│       ├── api.js            # client de l'API (token JWT) — chargé partout
│       ├── admin.js          # logique de l'espace administrateur
│       └── ...               # panier, favoris, profil, paiement, etc.
├── backend/                  # API REST Node/Express + MySQL
│   ├── database/             # schema.sql (création BDD) + seed.js (données)
│   ├── src/                  # config, middlewares, models, controllers, routes
│   ├── server.js             # point d'entrée du serveur
│   └── README.md             # documentation détaillée de l'API
├── page_accueil.html · page_catalogue.html · page_produit.html
├── page_panier.html · page_paiement.html · page_confirmation.html
├── page_favoris.html · page_profil.html · page_admin.html
└── page_cgu.html · page_cgv.html · page_mentionlegal.html · page_faq.html
```

---

## Lancer le projet — process complet (localhost)

> Pré-requis : **Laragon** installé (fournit MySQL + HeidiSQL), **Node.js 18+**, **VS Code**.
> Le projet a **3 briques** à démarrer DANS CET ORDRE : base MySQL → back-end (API) → front (site).

### Étape 0 — Ouvrir le projet dans VS Code
- VS Code → **Fichier → Ouvrir le dossier…** → choisir `C:\laragon\www\ordi`.
- Ouvrir un terminal intégré : **Terminal → Nouveau terminal** (`Ctrl+ù`).

### Étape 1 — Démarrer MySQL (la base)
- Ouvrir **Laragon** → cliquer **« Démarrer tout »** (le bouton vert).
- MySQL tourne alors sur `127.0.0.1:3306`. *(Sans ça, l'API affichera « Impossible de se connecter à la base de données ».)*

### Étape 2 — Initialiser la base de données *(à faire une seule fois)*
1. Dans **HeidiSQL** (lancé via Laragon → menu **Base de données / HeidiSQL**), ouvrir puis
   exécuter le script **`backend/database/schema.sql`** (touche **F9** pour tout exécuter).
   → crée la base `peartech` et toutes ses tables.
2. Remplir les données de test, dans le terminal VS Code :
   ```bash
   cd backend
   npm install      # installe les dépendances (1re fois uniquement)
   npm run seed     # insère catégories, produits, utilisateurs, commandes, avis
   ```
   *(Alternative au seed : exécuter `backend/database/seed.sql` dans HeidiSQL.)*

### Étape 3 — Démarrer le back-end (l'API) → `http://localhost:3000`
Dans le terminal VS Code :
```bash
cd backend     # si tu n'y es pas déjà
npm start
```
Tu dois voir :
```
✅ Connexion à la base de données réussie.
🚀 Serveur PearTech démarré sur http://localhost:3000
```
- Vérification : ouvre **http://localhost:3000** dans le navigateur → tu dois voir un message JSON « API PearTech opérationnelle ».
- **Laisse ce terminal ouvert** (l'API tourne tant qu'il l'est ; `Ctrl+C` pour l'arrêter).

### Étape 4 — Démarrer le front (le site) → `http://127.0.0.1:5500`
Le site est en HTML : on le sert avec l'extension **Live Server**.
1. Onglet **Extensions** (`Ctrl+Shift+X`) → chercher **« Live Server »** (Ritwick Dey) → **Install**.
2. Dans l'explorateur de fichiers VS Code, **clic droit sur `page_accueil.html` → « Open with Live Server »**.
3. Le navigateur s'ouvre sur **`http://127.0.0.1:5500/page_accueil.html`**. ✅

> **Important :** garde le terminal de l'API (étape 3) ouvert pendant que tu utilises le site,
> sinon les connexions/commandes afficheront « Serveur injoignable ».
>
> *Alternative sans Live Server :* dans Laragon, démarrer **Apache** → le site est servi sur
> `http://localhost/ordi/page_accueil.html`.

### Récap express (chaque session, une fois la BDD initialisée)
| # | Action | Résultat |
|---|---|---|
| 1 | Laragon → **Démarrer tout** | MySQL en route |
| 2 | Terminal VS Code : `cd backend` puis `npm start` | API sur `http://localhost:3000` |
| 3 | Clic droit `page_accueil.html` → **Open with Live Server** | Site sur `http://127.0.0.1:5500` |

---

## Identifiants de connexion

Comptes créés par `npm run seed` :

| Rôle | Email | Mot de passe | Accès |
|---|---|---|---|
| **Administrateur** | `admin@peartech.fr` | `Admin1234` | Espace admin (`page_admin.html`) |
| **Client (démo)** | `demo@peartech.fr` | `Demo1234` | Compte client (`page_profil.html`) |

> ⚠️ L'espace admin (`page_admin.html`) n'est accessible qu'avec le compte **administrateur**.
>
> Le seed crée aussi 8 autres clients de test aux noms variés (ex : `aminata.diallo@example.com`,
> `mohammed.cherif@example.com`, `fatou.traore@example.com`, `yasmine.benali@example.com`…),
> tous avec le mot de passe **`Demo1234`**.

## Adresses utiles

| Élément | URL |
|---|---|
| Site (Live Server) | http://127.0.0.1:5500/page_accueil.html |
| Espace admin | http://127.0.0.1:5500/page_admin.html |
| API (back-end) | http://localhost:3000 |
| Documentation de l'API | voir `backend/README.md` |

## Dépannage rapide

- **`EADDRINUSE: ... port 3000`** : un serveur tourne déjà sur le port 3000. Fermer l'autre terminal,
  ou libérer le port : `Get-NetTCPConnection -LocalPort 3000 | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }`
- **`Impossible de se connecter à la base de données`** : MySQL n'est pas démarré → relancer Laragon.
- **« Serveur injoignable » sur le site** : le back-end n'est pas lancé → `npm start` dans `backend`.

## Auteur

Abdoulrazack Abdillahi Mahamoud — [abdoul.abdillahi@gmail.com](mailto:abdoul.abdillahi@gmail.com)
