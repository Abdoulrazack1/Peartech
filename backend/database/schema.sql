-- ============================================================
--  PearTech — Script de création de la base de données
--  À exécuter dans HeidiSQL (ou en console MySQL).
--  Compétence C5 du DWWM : mettre en place une base relationnelle.
--
--  NB : le sujet prévoyait MongoDB pour les logs/statistiques.
--  Ici, tout est réalisé en MySQL (tables "logs" et "statistiques"
--  + agrégations SQL), car l'environnement est Laragon / HeidiSQL.
-- ============================================================

-- 1) Création de la base + sélection
CREATE DATABASE IF NOT EXISTS peartech
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE peartech;

-- Garantit que le script est interprété en UTF-8 (accents des ENUM, etc.),
-- y compris s'il est chargé en ligne de commande.
SET NAMES utf8mb4;

-- On repart d'une base propre. On désactive temporairement les
-- contraintes pour pouvoir supprimer les tables dans n'importe quel ordre
-- (y compris l'ancienne table "panier" des versions précédentes).
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS cart;
DROP TABLE IF EXISTS panier;          -- ancienne version (remplacée par cart/cart_items)
DROP TABLE IF EXISTS commande_articles;
DROP TABLE IF EXISTS commandes;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS favoris;
DROP TABLE IF EXISTS adresses;
DROP TABLE IF EXISTS messages_contact;
DROP TABLE IF EXISTS logs;
DROP TABLE IF EXISTS statistiques;
DROP TABLE IF EXISTS produits;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS utilisateurs;
SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------
-- 2) Catégories de produits
-- ------------------------------------------------------------
CREATE TABLE categories (
    id          VARCHAR(50)  NOT NULL,          -- ex : 'cat_apple'
    nom         VARCHAR(100) NOT NULL,
    slug        VARCHAR(100) NOT NULL,
    description TEXT,
    icon        VARCHAR(50),
    image       VARCHAR(255),
    PRIMARY KEY (id),
    UNIQUE KEY uq_categories_slug (slug)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 3) Produits (smartphones, tablettes, montres, accessoires…)
--    Les caractéristiques variables (specs, options, images, tags)
--    sont stockées en JSON pour rester simple, le reste est relationnel.
-- ------------------------------------------------------------
CREATE TABLE produits (
    id             INT          NOT NULL AUTO_INCREMENT,
    nom            VARCHAR(150) NOT NULL,
    slug           VARCHAR(150) NOT NULL,
    categorie_id   VARCHAR(50)  NOT NULL,
    marque         VARCHAR(80)  NULL,            -- pour le filtre par marque
    prix           DECIMAL(10,2) NOT NULL,
    ancien_prix    DECIMAL(10,2) NULL,
    description    TEXT,
    stock          INT           NOT NULL DEFAULT 0,
    est_nouveau    BOOLEAN       NOT NULL DEFAULT FALSE,
    est_bestseller BOOLEAN       NOT NULL DEFAULT FALSE,
    note           DECIMAL(2,1)  NOT NULL DEFAULT 0,  -- moyenne des avis (recalculée)
    nb_avis        INT           NOT NULL DEFAULT 0,
    specs          JSON,
    options        JSON,
    images         JSON,
    tags           JSON,
    cree_le        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_produits_slug (slug),
    KEY idx_produits_categorie (categorie_id),
    KEY idx_produits_marque (marque),
    KEY idx_produits_prix (prix),
    CONSTRAINT fk_produits_categorie
        FOREIGN KEY (categorie_id) REFERENCES categories (id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 4) Utilisateurs (clients + administrateurs)
--    Le mot de passe est stocké HACHÉ (bcrypt), jamais en clair.
-- ------------------------------------------------------------
CREATE TABLE utilisateurs (
    id           INT          NOT NULL AUTO_INCREMENT,
    prenom       VARCHAR(80)  NOT NULL,
    nom          VARCHAR(80)  NOT NULL,
    email        VARCHAR(150) NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,          -- hash bcrypt
    telephone    VARCHAR(20),
    naissance    DATE NULL,
    role         ENUM('client','admin') NOT NULL DEFAULT 'client',
    cree_le      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_utilisateurs_email (email)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 5) Adresses de livraison (1 utilisateur -> N adresses)
-- ------------------------------------------------------------
CREATE TABLE adresses (
    id             INT          NOT NULL AUTO_INCREMENT,
    utilisateur_id INT          NOT NULL,
    nom            VARCHAR(100) NOT NULL,        -- ex : 'Domicile'
    rue            VARCHAR(200) NOT NULL,
    complement     VARCHAR(200),
    code_postal    VARCHAR(10)  NOT NULL,
    ville          VARCHAR(100) NOT NULL,
    pays           VARCHAR(100) NOT NULL DEFAULT 'France',
    principale     BOOLEAN      NOT NULL DEFAULT FALSE,
    PRIMARY KEY (id),
    KEY idx_adresses_utilisateur (utilisateur_id),
    CONSTRAINT fk_adresses_utilisateur
        FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs (id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 6) Favoris (table d'association utilisateur <-> produit)
-- ------------------------------------------------------------
CREATE TABLE favoris (
    id             INT NOT NULL AUTO_INCREMENT,
    utilisateur_id INT NOT NULL,
    produit_id     INT NOT NULL,
    ajoute_le      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_favori (utilisateur_id, produit_id),   -- pas de doublon
    CONSTRAINT fk_favoris_utilisateur
        FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs (id) ON DELETE CASCADE,
    CONSTRAINT fk_favoris_produit
        FOREIGN KEY (produit_id) REFERENCES produits (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 7) Panier persistant : 1 panier (cart) par utilisateur,
--    contenant plusieurs lignes (cart_items).
-- ------------------------------------------------------------
CREATE TABLE cart (
    id             INT NOT NULL AUTO_INCREMENT,
    utilisateur_id INT NOT NULL,
    cree_le        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    maj_le         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_cart_utilisateur (utilisateur_id),   -- un seul panier par client
    CONSTRAINT fk_cart_utilisateur
        FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE cart_items (
    id         INT NOT NULL AUTO_INCREMENT,
    cart_id    INT NOT NULL,
    produit_id INT NOT NULL,
    quantite   INT NOT NULL DEFAULT 1,
    options    JSON,
    ajoute_le  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_cart_item (cart_id, produit_id),     -- 1 ligne par produit
    CONSTRAINT fk_cart_items_cart
        FOREIGN KEY (cart_id) REFERENCES cart (id) ON DELETE CASCADE,
    CONSTRAINT fk_cart_items_produit
        FOREIGN KEY (produit_id) REFERENCES produits (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 8) Commandes + lignes de commande (order_items)
--    Le détail du calcul (sous-total, TVA, frais de port) est conservé.
-- ------------------------------------------------------------
CREATE TABLE commandes (
    id                INT NOT NULL AUTO_INCREMENT,
    utilisateur_id    INT NOT NULL,
    sous_total        DECIMAL(10,2) NOT NULL DEFAULT 0, -- somme des articles HT… (ici TTC produits)
    tva               DECIMAL(10,2) NOT NULL DEFAULT 0, -- montant de TVA
    frais_port        DECIMAL(10,2) NOT NULL DEFAULT 0, -- frais de livraison
    total             DECIMAL(10,2) NOT NULL,           -- montant final payé
    statut            ENUM('en attente','payée','expédiée','livrée','annulée')
                      NOT NULL DEFAULT 'en attente',
    adresse_livraison TEXT,
    cree_le           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_commandes_utilisateur (utilisateur_id),
    KEY idx_commandes_cree (cree_le),
    CONSTRAINT fk_commandes_utilisateur
        FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE commande_articles (
    id            INT NOT NULL AUTO_INCREMENT,
    commande_id   INT NOT NULL,
    produit_id    INT NULL,                     -- NULL si le produit est supprimé
    nom_produit   VARCHAR(150) NOT NULL,        -- copie du nom au moment de l'achat
    prix_unitaire DECIMAL(10,2) NOT NULL,
    quantite      INT NOT NULL DEFAULT 1,
    options       JSON,
    PRIMARY KEY (id),
    KEY idx_articles_commande (commande_id),
    CONSTRAINT fk_articles_commande
        FOREIGN KEY (commande_id) REFERENCES commandes (id) ON DELETE CASCADE,
    CONSTRAINT fk_articles_produit
        FOREIGN KEY (produit_id) REFERENCES produits (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 9) Avis clients (reviews) : note + commentaire sur un produit
-- ------------------------------------------------------------
CREATE TABLE reviews (
    id             INT NOT NULL AUTO_INCREMENT,
    utilisateur_id INT NOT NULL,
    produit_id     INT NOT NULL,
    note           TINYINT NOT NULL,            -- de 1 à 5
    commentaire    TEXT,
    cree_le        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_review (utilisateur_id, produit_id), -- 1 avis par produit et par client
    KEY idx_reviews_produit (produit_id),
    CONSTRAINT fk_reviews_utilisateur
        FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs (id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_produit
        FOREIGN KEY (produit_id) REFERENCES produits (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 10) Messages du formulaire de contact
-- ------------------------------------------------------------
CREATE TABLE messages_contact (
    id      INT NOT NULL AUTO_INCREMENT,
    nom     VARCHAR(100) NOT NULL,
    email   VARCHAR(150) NOT NULL,
    sujet   VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    cree_le TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 11) Logs applicatifs (remplace la collection MongoDB "logs")
-- ------------------------------------------------------------
CREATE TABLE logs (
    id             INT NOT NULL AUTO_INCREMENT,
    niveau         ENUM('info','warn','error') NOT NULL DEFAULT 'info',
    message        VARCHAR(255) NOT NULL,
    methode        VARCHAR(10),
    route          VARCHAR(255),
    statut         INT,                          -- code HTTP de la réponse
    utilisateur_id INT NULL,                     -- pas de FK : on garde le log même si le compte est supprimé
    ip             VARCHAR(45),
    cree_le        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_logs_cree (cree_le),
    KEY idx_logs_niveau (niveau)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 12) Statistiques de visites (remplace la collection MongoDB "statistics")
-- ------------------------------------------------------------
CREATE TABLE statistiques (
    id             INT NOT NULL AUTO_INCREMENT,
    chemin         VARCHAR(255) NOT NULL,        -- route visitée
    methode        VARCHAR(10),
    utilisateur_id INT NULL,
    ip             VARCHAR(45),
    user_agent     VARCHAR(255),
    cree_le        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_stats_cree (cree_le),
    KEY idx_stats_chemin (chemin)
) ENGINE=InnoDB;

-- ============================================================
--  Fin du script. Lancez ensuite "npm run seed" pour remplir
--  catégories, produits, utilisateurs, commandes et avis.
-- ============================================================
