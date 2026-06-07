# Documentation de la base de données — PearTech

Base **MySQL** `peartech` (moteur InnoDB, encodage `utf8mb4`).
Créée par `database/schema.sql`, remplie par `npm run seed` (ou `database/seed.sql`).

> **Note sur le NoSQL :** le sujet prévoyait MongoDB pour les logs et les
> statistiques. L'environnement étant Laragon / HeidiSQL, cette partie est
> réalisée en MySQL via les tables `logs` et `statistiques` + des agrégations SQL.

---

## Vue d'ensemble des relations

```
categories (1) ──< produits (N)
utilisateurs (1) ──< adresses (N)
utilisateurs (1) ──< favoris (N) >── (1) produits
utilisateurs (1) ──< reviews (N) >── (1) produits
utilisateurs (1) ──< cart (1) ──< cart_items (N) >── (1) produits
utilisateurs (1) ──< commandes (1) ──< commande_articles (N) >── (1) produits
messages_contact, logs, statistiques  : tables indépendantes
```

Toutes les clés étrangères sont en `ON DELETE CASCADE` (les données filles
suivent la suppression du parent), sauf `commande_articles.produit_id` en
`ON DELETE SET NULL` pour **conserver l'historique des commandes** même si un
produit est supprimé.

---

## Détail des tables

### `categories`
Catégories de produits (Apple, Android, Montres, Tablettes, Accessoires).
| Colonne | Type | Rôle |
|---|---|---|
| id (PK) | VARCHAR(50) | identifiant texte (ex : `cat_apple`) |
| nom, slug (unique), description, icon, image | | affichage et URL |

*Choix :* `id` en texte (slug technique) car les catégories sont peu nombreuses
et stables ; le `slug` unique sert aux URL et aux filtres.

### `produits`
Le catalogue. Les données **variables** (caractéristiques, options, images,
tags) sont stockées en **JSON** ; le reste est relationnel.
| Colonne | Type | Rôle |
|---|---|---|
| id (PK) | INT AI | identifiant |
| nom, slug (unique) | | affichage / URL |
| categorie_id (FK) | VARCHAR(50) | → `categories.id` |
| marque | VARCHAR(80) | filtre par marque (indexé) |
| prix, ancien_prix | DECIMAL(10,2) | prix actuel / barré (indexé sur prix) |
| stock | INT | gestion des stocks |
| est_nouveau, est_bestseller | BOOLEAN | mises en avant |
| note, nb_avis | | **moyenne des avis recalculée** + nombre |
| specs, options, images, tags | JSON | données flexibles |

*Choix :* JSON pour éviter une multitude de tables annexes peu utiles ici, tout
en gardant des **index** sur `categorie_id`, `marque` et `prix` pour les filtres.

### `utilisateurs`
Comptes clients et administrateurs.
| Colonne | Type | Rôle |
|---|---|---|
| id (PK) | INT AI | |
| prenom, nom | | |
| email (unique) | VARCHAR(150) | identifiant de connexion |
| mot_de_passe | VARCHAR(255) | **hash bcrypt** (jamais en clair) |
| telephone, naissance | | profil |
| role | ENUM('client','admin') | gestion des droits |

### `adresses`
Adresses de livraison (1 utilisateur → N adresses), champ `principale`.

### `favoris`
Table d'association `utilisateur ↔ produit`, clé **unique** (utilisateur_id, produit_id)
pour empêcher les doublons.

### `cart` / `cart_items`
Panier persistant : **un panier par utilisateur** (`cart`, clé unique sur
`utilisateur_id`), contenant plusieurs lignes (`cart_items`, unique sur
`cart_id + produit_id`). Permet de conserver le panier entre les sessions.

### `commandes` / `commande_articles`
Commande = en-tête (`commandes`) + lignes (`commande_articles`).
| `commandes` | |
|---|---|
| sous_total, tva, frais_port, total | détail du calcul conservé |
| statut | ENUM(`en attente`,`payée`,`expédiée`,`livrée`,`annulée`) |
| adresse_livraison | copie texte au moment de l'achat |

`commande_articles` copie le **nom et le prix** du produit au moment de l'achat
(historique figé), d'où `produit_id` en `ON DELETE SET NULL`.

### `reviews`
Avis clients : `note` (1–5) + `commentaire`. Clé **unique** (utilisateur_id,
produit_id) → un seul avis par produit et par client. À chaque ajout/modif/
suppression, `produits.note` et `produits.nb_avis` sont recalculés.

### `messages_contact`
Messages envoyés via le formulaire de contact.

### `logs` *(remplace la collection MongoDB « logs »)*
Journal applicatif : `niveau` (info/warn/error), `message`, route, code HTTP, ip.
Pas de clé étrangère sur `utilisateur_id` pour conserver le log même si le
compte est supprimé.

### `statistiques` *(remplace la collection MongoDB « statistics »)*
Une ligne par appel à l'API (chemin, méthode, ip, user-agent). Sert aux
agrégations du tableau de bord (pages les plus visitées, nombre de visites).

---

## Agrégations (équivalent des agrégations MongoDB)

- **Top produits vendus** : `SUM(quantite)` sur `commande_articles` groupé par produit.
- **Chiffre d'affaires par mois** : `SUM(total)` sur `commandes` groupé par mois.
- **Pages les plus visitées** : `COUNT(*)` sur `statistiques` groupé par chemin.

Voir `src/models/logModel.js` et `src/services/statService.js`.
