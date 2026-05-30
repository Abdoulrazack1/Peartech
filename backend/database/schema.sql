-- ============================================================
--  PearTech — Script de création de la base de données
--  À exécuter dans HeidiSQL (ou en console MySQL).
--  Compétence C5 du DWWM : mettre en place une base relationnelle.
-- ============================================================

-- 1) Création de la base + sélection
CREATE DATABASE IF NOT EXISTS peartech
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE peartech;

-- Garantit que le script est interprété en UTF-8 (accents des ENUM, etc.),
-- y compris s'il est chargé en ligne de commande.
SET NAMES utf8mb4;

-- On repart d'une base propre (ordre inverse des dépendances)
DROP TABLE IF EXISTS commande_articles;
DROP TABLE IF EXISTS commandes;
DROP TABLE IF EXISTS panier;
DROP TABLE IF EXISTS favoris;
DROP TABLE IF EXISTS adresses;
DROP TABLE IF EXISTS messages_contact;
DROP TABLE IF EXISTS produits;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS utilisateurs;

-- ------------------------------------------------------------
-- 2) Catégories (Apple, Android, Montres, Tablettes)
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
-- 3) Produits (smartphones, tablettes, montres…)
--    Les caractéristiques variables (specs, options, images, tags)
--    sont stockées en JSON pour rester simple, le reste est relationnel.
-- ------------------------------------------------------------
CREATE TABLE produits (
    id             INT          NOT NULL AUTO_INCREMENT,
    nom            VARCHAR(150) NOT NULL,
    slug           VARCHAR(150) NOT NULL,
    categorie_id   VARCHAR(50)  NOT NULL,
    prix           DECIMAL(10,2) NOT NULL,
    ancien_prix    DECIMAL(10,2) NULL,
    description    TEXT,
    stock          INT           NOT NULL DEFAULT 0,
    est_nouveau    BOOLEAN       NOT NULL DEFAULT FALSE,
    est_bestseller BOOLEAN       NOT NULL DEFAULT FALSE,
    note           DECIMAL(2,1)  NOT NULL DEFAULT 0,
    nb_avis        INT           NOT NULL DEFAULT 0,
    specs          JSON,
    options        JSON,
    images         JSON,
    tags           JSON,
    cree_le        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_produits_slug (slug),
    KEY idx_produits_categorie (categorie_id),
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
    id           INT          NOT NULL AUTO_INCREMENT,
    utilisateur_id INT        NOT NULL,
    nom          VARCHAR(100) NOT NULL,          -- ex : 'Domicile'
    rue          VARCHAR(200) NOT NULL,
    complement   VARCHAR(200),
    code_postal  VARCHAR(10)  NOT NULL,
    ville        VARCHAR(100) NOT NULL,
    pays         VARCHAR(100) NOT NULL DEFAULT 'France',
    principale   BOOLEAN      NOT NULL DEFAULT FALSE,
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
    id            INT NOT NULL AUTO_INCREMENT,
    utilisateur_id INT NOT NULL,
    produit_id    INT NOT NULL,
    ajoute_le     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_favori (utilisateur_id, produit_id),   -- pas de doublon
    CONSTRAINT fk_favoris_utilisateur
        FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_favoris_produit
        FOREIGN KEY (produit_id) REFERENCES produits (id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 7) Panier (1 ligne = 1 produit dans le panier d'un utilisateur)
--    Le panier est conservé en base : il suit l'utilisateur même
--    s'il change de navigateur ou d'appareil.
-- ------------------------------------------------------------
CREATE TABLE panier (
    id             INT NOT NULL AUTO_INCREMENT,
    utilisateur_id INT NOT NULL,
    produit_id     INT NOT NULL,
    quantite       INT NOT NULL DEFAULT 1,
    options        JSON,
    ajoute_le      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_panier (utilisateur_id, produit_id),  -- 1 ligne par produit
    CONSTRAINT fk_panier_utilisateur
        FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_panier_produit
        FOREIGN KEY (produit_id) REFERENCES produits (id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 8) Commandes + lignes de commande
-- ------------------------------------------------------------
CREATE TABLE commandes (
    id               INT NOT NULL AUTO_INCREMENT,
    utilisateur_id   INT NOT NULL,
    total            DECIMAL(10,2) NOT NULL,
    statut           ENUM('en cours','expédiée','livré','annulée')
                     NOT NULL DEFAULT 'en cours',
    adresse_livraison TEXT,
    cree_le          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_commandes_utilisateur (utilisateur_id),
    CONSTRAINT fk_commandes_utilisateur
        FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs (id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE commande_articles (
    id             INT NOT NULL AUTO_INCREMENT,
    commande_id    INT NOT NULL,
    produit_id     INT NULL,                    -- NULL si le produit est supprimé
    nom_produit    VARCHAR(150) NOT NULL,       -- copie du nom au moment de l'achat
    prix_unitaire  DECIMAL(10,2) NOT NULL,
    quantite       INT NOT NULL DEFAULT 1,
    options        JSON,
    PRIMARY KEY (id),
    KEY idx_articles_commande (commande_id),
    CONSTRAINT fk_articles_commande
        FOREIGN KEY (commande_id) REFERENCES commandes (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_articles_produit
        FOREIGN KEY (produit_id) REFERENCES produits (id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 8) Messages du formulaire de contact
-- ------------------------------------------------------------
CREATE TABLE messages_contact (
    id       INT NOT NULL AUTO_INCREMENT,
    nom      VARCHAR(100) NOT NULL,
    email    VARCHAR(150) NOT NULL,
    sujet    VARCHAR(200) NOT NULL,
    message  TEXT NOT NULL,
    cree_le  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

-- ============================================================
--  Fin du script. Lancez ensuite "npm run seed" pour remplir
--  les catégories, les produits et le compte administrateur.
-- ============================================================
