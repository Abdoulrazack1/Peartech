// ============================================
// data.js - Base de données centralisée NovaCompute
// Contient tous les produits, catégories et données statiques
// Utilisation : window.NovaComputeDB
// ============================================

(function() {
    'use strict';

    // ------------------------------------------------------------
    // CATÉGORIES
    // ------------------------------------------------------------
    const categories = [
        {
            id: 'cat_portable',
            name: 'Ordinateurs Portables',
            slug: 'portables',
            description: 'Ultrabooks, laptops professionnels et étudiants',
            icon: 'laptop',
            image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
            subcategories: ['Ultrabooks', 'Gaming Laptops', 'Professionnels', 'Étudiants']
        },
        {
            id: 'cat_fixe',
            name: 'Ordinateurs Fixes',
            slug: 'fixes',
            description: 'Tours bureautiques, stations de travail',
            icon: 'desktop_windows',
            image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400',
            subcategories: ['Bureautique', 'Stations de travail', 'Mini PC', 'All-in-One']
        },
        {
            id: 'cat_gamer',
            name: 'PC Gamers',
            slug: 'gamers',
            description: 'Gaming haute performance et configurations sur mesure',
            icon: 'stadia_controller',
            image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400',
            subcategories: ['Setup complet', 'Tours gaming', 'RGB', 'Watercooling']
        },
        {
            id: 'cat_creation',
            name: 'Création & Design',
            slug: 'creation',
            description: 'Pour montage vidéo, 3D et design graphique',
            icon: 'brush',
            image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400',
            subcategories: ['Video editing', 'Rendu 3D', 'Design graphique']
        },
        {
            id: 'cat_composants',
            name: 'Composants',
            slug: 'composants',
            description: 'Processeurs, cartes graphiques, RAM, stockage',
            icon: 'memory',
            image: 'https://images.unsplash.com/photo-1555618254-6c0b3a3e0b7a?w=400',
            subcategories: ['CPU', 'GPU', 'RAM', 'SSD/HDD', 'Cartes mères']
        },
        {
            id: 'cat_peripheriques',
            name: 'Périphériques',
            slug: 'peripheriques',
            description: 'Écrans, claviers, souris et accessoires',
            icon: 'devices',
            image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400',
            subcategories: ['Écrans', 'Claviers', 'Souris', 'Casques', 'Webcams']
        }
    ];

    // ------------------------------------------------------------
    // PRODUITS avec options de personnalisation
    // ------------------------------------------------------------
    const products = [
        {
            id: 1,
            name: 'Ultrabook Nova 14" Pro',
            slug: 'ultrabook-nova-14-pro',
            categoryId: 'cat_portable',
            basePrice: 1299.00,
            oldPrice: null,
            specs: {
                processor: 'Intel Core i5-1240P',
                ram: '16 Go LPDDR5',
                storage: '1 To SSD NVMe',
                screen: '14" QHD+ (2560x1600) IPS',
                graphics: 'Intel Iris Xe',
                os: 'Windows 11 Pro'
            },
            description: 'Ultrabook léger et puissant pour les professionnels en déplacement. Autonomie exceptionnelle de 12h.',
            images: [
                'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
                'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400'
            ],
            tags: ['intel', 'ultrabook', '14 pouces', 'ssd', 'professionnel'],
            stock: 15,
            isNew: true,
            isBestSeller: false,
            rating: 4.7,
            reviews: 23,
            // Options disponibles pour ce produit
            options: {
                ram: [
                    { label: '16 Go', price: 0 },
                    { label: '32 Go', price: 200 }
                ],
                storage: [
                    { label: '1 To SSD', price: 0 },
                    { label: '2 To SSD', price: 150 }
                ],
                color: [
                    { label: 'Gris métal', price: 0 },
                    { label: 'Argent', price: 0 }
                ]
            }
        },
        {
            id: 2,
            name: 'Setup Gamer Orion',
            slug: 'setup-gamer-orion',
            categoryId: 'cat_gamer',
            basePrice: 1899.00,
            oldPrice: 2099.00,
            specs: {
                processor: 'AMD Ryzen 7 7800X3D',
                ram: '32 Go DDR5',
                storage: '1 To SSD NVMe',
                graphics: 'NVIDIA RTX 4070 12 Go',
                cooling: 'Watercooling 240mm RGB',
                os: 'Windows 11 Famille'
            },
            description: 'Configuration gaming ultra-fluide pour jouer en 1440p et 4K. Boîtier RGB et ventilation optimisée.',
            images: [
                'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400',
                'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400'
            ],
            tags: ['ryzen', 'rtx', 'gaming', 'desktop', 'rgb'],
            stock: 8,
            isNew: false,
            isBestSeller: true,
            rating: 4.9,
            reviews: 47,
            options: {
                ram: [
                    { label: '32 Go', price: 0 },
                    { label: '64 Go', price: 250 }
                ],
                storage: [
                    { label: '1 To SSD', price: 0 },
                    { label: '2 To SSD', price: 150 },
                    { label: '4 To SSD', price: 400 }
                ],
                rgb: [
                    { label: 'RGB standard', price: 0 },
                    { label: 'RGB avancé', price: 80 }
                ]
            }
        },
        {
            id: 3,
            name: 'Studio Créatif 27"',
            slug: 'studio-creatif-27',
            categoryId: 'cat_creation',
            basePrice: 2299.00,
            oldPrice: null,
            specs: {
                processor: 'Intel Core i9-13900K',
                ram: '32 Go DDR5',
                storage: '2 To SSD NVMe',
                graphics: 'NVIDIA RTX 4060 8 Go',
                screen: '27" 4K IPS (inclus)',
                os: 'Windows 11 Pro'
            },
            description: 'Station de travail complète pour créatifs : montage vidéo, 3D, design. Écran calibré inclus.',
            images: [
                'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400',
                'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400'
            ],
            tags: ['intel', 'rtx', 'workstation', '27 pouces', '4k'],
            stock: 5,
            isNew: true,
            isBestSeller: false,
            rating: 4.8,
            reviews: 12,
            options: {
                ram: [
                    { label: '32 Go', price: 0 },
                    { label: '64 Go', price: 300 }
                ],
                storage: [
                    { label: '2 To SSD', price: 0 },
                    { label: '4 To SSD', price: 200 }
                ],
                color: [
                    { label: 'Noir', price: 0 },
                    { label: 'Blanc', price: 0 }
                ]
            }
        },
        {
            id: 4,
            name: 'Mini PC Bureau Essentiel',
            slug: 'mini-pc-bureau-essentiel',
            categoryId: 'cat_fixe',
            basePrice: 699.00,
            oldPrice: 799.00,
            specs: {
                processor: 'Intel Core i3-12100',
                ram: '8 Go DDR4',
                storage: '512 Go SSD',
                graphics: 'Intel UHD 730',
                os: 'Windows 11 Famille'
            },
            description: 'PC compact et silencieux pour la bureautique, le télétravail et le multimédia.',
            images: [
                'https://images.unsplash.com/photo-1555618254-6c0b3a3e0b7a?w=400',
                'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400'
            ],
            tags: ['intel', 'mini pc', 'bureau', 'compact', 'ssd'],
            stock: 25,
            isNew: false,
            isBestSeller: false,
            rating: 4.5,
            reviews: 31,
            options: {
                ram: [
                    { label: '8 Go', price: 0 },
                    { label: '16 Go', price: 60 }
                ],
                storage: [
                    { label: '512 Go SSD', price: 0 },
                    { label: '1 To SSD', price: 70 }
                ]
            }
        },
        {
            id: 5,
            name: 'Laptop Gaming ROG 15"',
            slug: 'laptop-gaming-rog-15',
            categoryId: 'cat_portable',
            basePrice: 1799.00,
            oldPrice: 1999.00,
            specs: {
                processor: 'Intel Core i7-13700H',
                ram: '16 Go DDR5',
                storage: '1 To SSD NVMe',
                graphics: 'NVIDIA RTX 4060 8 Go',
                screen: '15.6" Full HD 144Hz',
                os: 'Windows 11 Famille'
            },
            description: 'PC portable gaming avec écran 144Hz, clavier RGB et système de refroidissement avancé.',
            images: [
                'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400',
                'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400'
            ],
            tags: ['intel', 'rtx', 'gaming', 'portable', '15 pouces'],
            stock: 10,
            isNew: false,
            isBestSeller: true,
            rating: 4.8,
            reviews: 54,
            options: {
                ram: [
                    { label: '16 Go', price: 0 },
                    { label: '32 Go', price: 200 }
                ],
                storage: [
                    { label: '1 To SSD', price: 0 },
                    { label: '2 To SSD', price: 150 }
                ],
                screen: [
                    { label: 'FHD 144Hz', price: 0 },
                    { label: 'QHD 165Hz', price: 150 }
                ]
            }
        },
        {
            id: 6,
            name: 'MacBook Pro 16" Alternative',
            slug: 'macbook-pro-16-alternative',
            categoryId: 'cat_creation',
            basePrice: 2499.00,
            oldPrice: null,
            specs: {
                processor: 'Intel Core i9-13950HX',
                ram: '32 Go DDR5',
                storage: '2 To SSD NVMe',
                graphics: 'NVIDIA RTX 4080 12 Go',
                screen: '16" 4K Mini-LED',
                os: 'Windows 11 Pro'
            },
            description: 'PC portable ultra-puissant pour les créateurs exigeants, rivalisant avec les meilleurs MacBook.',
            images: [
                'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
                'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400'
            ],
            tags: ['intel', 'rtx', 'creation', '16 pouces', '4k'],
            stock: 3,
            isNew: true,
            isBestSeller: false,
            rating: 5.0,
            reviews: 8,
            options: {
                ram: [
                    { label: '32 Go', price: 0 },
                    { label: '64 Go', price: 400 }
                ],
                storage: [
                    { label: '2 To SSD', price: 0 },
                    { label: '4 To SSD', price: 300 }
                ]
            }
        },
        {
            id: 7,
            name: 'PC Gamer Predator',
            slug: 'pc-gamer-predator',
            categoryId: 'cat_gamer',
            basePrice: 2899.00,
            oldPrice: 3199.00,
            specs: {
                processor: 'AMD Ryzen 9 7950X3D',
                ram: '64 Go DDR5',
                storage: '2 To SSD NVMe',
                graphics: 'NVIDIA RTX 4080 16 Go',
                cooling: 'Watercooling 360mm RGB',
                os: 'Windows 11 Famille'
            },
            description: 'La bête de course pour le gaming en 4K et la réalité virtuelle. Design agressif et RGB personnalisable.',
            images: [
                'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400',
                'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400'
            ],
            tags: ['ryzen', 'rtx', 'gaming', 'haut de gamme', 'watercooling'],
            stock: 2,
            isNew: false,
            isBestSeller: false,
            rating: 4.9,
            reviews: 19,
            options: {
                ram: [
                    { label: '64 Go', price: 0 },
                    { label: '128 Go', price: 500 }
                ],
                storage: [
                    { label: '2 To SSD', price: 0 },
                    { label: '4 To SSD', price: 250 }
                ],
                rgb: [
                    { label: 'RGB standard', price: 0 },
                    { label: 'RGB premium', price: 100 }
                ]
            }
        },
        {
            id: 8,
            name: 'Chromebook Ultra 13"',
            slug: 'chromebook-ultra-13',
            categoryId: 'cat_portable',
            basePrice: 499.00,
            oldPrice: 549.00,
            specs: {
                processor: 'Intel Celeron N4500',
                ram: '8 Go LPDDR4',
                storage: '256 Go eMMC',
                screen: '13.3" Full HD',
                os: 'Chrome OS'
            },
            description: 'Ultra-léger, autonomie de 15h, idéal pour les étudiants et la navigation web.',
            images: [
                'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
                'https://images.unsplash.com/photo-1555618254-6c0b3a3e0b7a?w=400'
            ],
            tags: ['chromebook', '13 pouces', 'leger', 'etudiant'],
            stock: 40,
            isNew: true,
            isBestSeller: false,
            rating: 4.3,
            reviews: 62,
            options: {
                ram: [
                    { label: '8 Go', price: 0 },
                    { label: '16 Go', price: 80 }
                ],
                storage: [
                    { label: '256 Go eMMC', price: 0 },
                    { label: '512 Go SSD', price: 100 }
                ]
            }
        },
        {
            id: 9,
            name: 'Écran Gaming 27" 165Hz',
            slug: 'ecran-gaming-27-165hz',
            categoryId: 'cat_peripheriques',
            basePrice: 349.00,
            oldPrice: 399.00,
            specs: {
                size: '27"',
                resolution: '2560x1440 (QHD)',
                refresh: '165Hz',
                panel: 'IPS',
                response: '1ms',
                features: ['FreeSync', 'G-Sync compatible', 'HDR10']
            },
            description: 'Écran gaming immersif avec taux de rafraîchissement élevé et couleurs précises.',
            images: [
                'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400',
                'https://images.unsplash.com/photo-1555618254-6c0b3a3e0b7a?w=400'
            ],
            tags: ['ecran', 'gaming', '27 pouces', '165hz', 'qhd'],
            stock: 18,
            isNew: false,
            isBestSeller: true,
            rating: 4.7,
            reviews: 33,
            options: {} // pas d'options pour cet écran
        },
        {
            id: 10,
            name: 'Clavier Mécanique RGB',
            slug: 'clavier-mecanique-rgb',
            categoryId: 'cat_peripheriques',
            basePrice: 129.00,
            oldPrice: null,
            specs: {
                type: 'Mécanique',
                switches: 'Cherry MX Red',
                layout: 'AZERTY Français',
                backlight: 'RGB par touche',
                features: ['Repose-poignet', 'Touches multimedia']
            },
            description: 'Clavier mécanique premium pour gaming et productivité, switches linéaires et silence.',
            images: [
                'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400',
                'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400'
            ],
            tags: ['clavier', 'mecanique', 'rgb', 'azerty'],
            stock: 30,
            isNew: true,
            isBestSeller: false,
            rating: 4.6,
            reviews: 27,
            options: {
                switches: [
                    { label: 'Cherry MX Red', price: 0 },
                    { label: 'Cherry MX Blue', price: 0 },
                    { label: 'Cherry MX Brown', price: 0 }
                ]
            }
        }
    ];

    // ------------------------------------------------------------
    // FONCTIONS UTILITAIRES
    // ------------------------------------------------------------
    const helpers = {
        // Récupérer un produit par son ID
        getProductById: function(id) {
            return products.find(p => p.id === parseInt(id));
        },
        // Récupérer les produits d'une catégorie (par slug)
        getProductsByCategory: function(categorySlug) {
            const cat = categories.find(c => c.slug === categorySlug);
            if (!cat) return [];
            return products.filter(p => p.categoryId === cat.id);
        },
        // Récupérer les meilleures ventes
        getBestSellers: function(limit = 4) {
            return products.filter(p => p.isBestSeller).slice(0, limit);
        },
        // Récupérer les nouveaux produits
        getNewProducts: function(limit = 4) {
            return products.filter(p => p.isNew).slice(0, limit);
        },
        // Recherche full-text simplifiée
        search: function(query) {
            const q = query.toLowerCase();
            return products.filter(p => 
                p.name.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q) ||
                p.tags.some(tag => tag.includes(q))
            );
        },
        // Obtenir une catégorie par son slug
        getCategoryBySlug: function(slug) {
            return categories.find(c => c.slug === slug);
        },
        // Obtenir le slug d'une catégorie à partir de son ID
        getCategorySlugFromId: function(categoryId) {
            const cat = categories.find(c => c.id === categoryId);
            return cat ? cat.slug : '';
        }
    };

    // ------------------------------------------------------------
    // EXPOSITION GLOBALE
    // ------------------------------------------------------------
    window.NovaComputeDB = {
        categories: categories,
        products: products,
        promotions: [], // à remplir si besoin
        ...helpers
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = window.NovaComputeDB;
    }

    console.log('✅ Base de données NovaCompute chargée :', products.length, 'produits,', categories.length, 'catégories');
})();