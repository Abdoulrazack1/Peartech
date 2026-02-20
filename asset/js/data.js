(function() {
    'use strict';

    const categories = [
        {
            id: 'cat_apple',
            name: 'Apple',
            slug: 'apple',
            description: 'iPhone, iPad, Apple Watch et accessoires Apple',
            icon: 'apple',
            image: '/asset/image/category_apple.jpeg',
            subcategories: ['iPhone', 'iPad', 'Apple Watch', 'Accessoires']
        },
        {
            id: 'cat_android',
            name: 'Android',
            slug: 'android',
            description: 'Smartphones Android, tablettes et montres sous Android',
            icon: 'android',
            image: '/asset/image/apple/iphone-15-pro-max.jpg',
            subcategories: ['Samsung', 'Google Pixel', 'Xiaomi', 'OnePlus', 'Autres']
        },
        {
            id: 'cat_wearables',
            name: 'Montres connectées',
            slug: 'montres',
            description: 'Montres connectées pour le sport, la santé et le quotidien',
            icon: 'watch',
            image: '/asset/image/apple/iphone-15-pro-max-2.jpg',
            subcategories: ['Apple Watch', 'Samsung Galaxy Watch', 'Fitbit', 'Garmin', 'Autres']
        },
        {
            id: 'cat_tablets',
            name: 'Tablettes',
            slug: 'tablettes',
            description: 'Tablettes pour le travail, les études et le divertissement',
            icon: 'tablet',
            image: '/asset/image/apple/iphone-15-pro.jpg',
            subcategories: ['iPad', 'Samsung Galaxy Tab', 'Amazon Fire', 'Xiaomi', 'Autres']
        }
    ];

    const products = [
        // ---- APPLE - iPhones (5) ----
        {
            id: 1,
            name: 'iPhone 15 Pro Max',
            slug: 'iphone-15-pro-max',
            categoryId: 'cat_apple',
            basePrice: 1479.00,
            oldPrice: 1599.00,
            specs: {
                processor: 'A17 Pro',
                ram: '8 Go',
                storage: '256 Go',
                screen: '6.7" Super Retina XDR',
                camera: '48 Mpx + 12 Mpx + 12 Mpx + LiDAR',
                battery: 'Autonomie jusqu\'à 29h',
                os: 'iOS 17'
            },
            description: 'L\'iPhone 15 Pro Max, le plus puissant des iPhone avec un zoom optique x5 et un design en titane.',
            images: [
                '/asset/image/apple/iphone-15-pro-max.jpg',
                '/asset/image/apple/iphone-15-pro-max-2.jpg'
            ],
            tags: ['iphone', 'apple', '15 pro max', 'ios'],
            stock: 18,
            isNew: true,
            isBestSeller: true,
            rating: 4.8,
            reviews: 1243,
            options: {
                storage: [
                    { label: '256 Go', price: 0 },
                    { label: '512 Go', price: 230 },
                    { label: '1 To', price: 460 }
                ],
                color: [
                    { label: 'Titane naturel', price: 0 },
                    { label: 'Titane bleu', price: 0 },
                    { label: 'Titane noir', price: 0 }
                ]
            }
        },
        {
            id: 2,
            name: 'iPhone 15 Pro',
            slug: 'iphone-15-pro',
            categoryId: 'cat_apple',
            basePrice: 1229.00,
            oldPrice: 1329.00,
            specs: {
                processor: 'A17 Pro',
                ram: '8 Go',
                storage: '128 Go',
                screen: '6.1" Super Retina XDR',
                camera: '48 Mpx + 12 Mpx + 12 Mpx',
                battery: 'Autonomie jusqu\'à 23h',
                os: 'iOS 17'
            },
            description: 'L\'iPhone 15 Pro, puissance et élégance dans un format compact.',
            images: [
                '/asset/image/apple/iphone-15-pro.jpg',
                '/asset/image/apple/iphone-15-pro-2.jpg'
            ],
            tags: ['iphone', 'apple', '15 pro', 'ios'],
            stock: 22,
            isNew: true,
            isBestSeller: false,
            rating: 4.2,
            reviews: 389,
            options: {
                storage: [
                    { label: '128 Go', price: 0 },
                    { label: '256 Go', price: 120 },
                    { label: '512 Go', price: 250 }
                ],
                color: [
                    { label: 'Titane naturel', price: 0 },
                    { label: 'Titane bleu', price: 0 },
                    { label: 'Titane noir', price: 0 }
                ]
            }
        },
        {
            id: 3,
            name: 'iPhone 15',
            slug: 'iphone-15',
            categoryId: 'cat_apple',
            basePrice: 969.00,
            oldPrice: null,
            specs: {
                processor: 'A16 Bionic',
                ram: '6 Go',
                storage: '128 Go',
                screen: '6.1" Super Retina XDR',
                camera: '48 Mpx + 12 Mpx',
                battery: 'Autonomie jusqu\'à 20h',
                os: 'iOS 17'
            },
            description: 'L\'iPhone 15, l\'essentiel avec l\'îlot dynamique et un appareil photo de 48 Mpx.',
            images: [
                '/asset/image/apple/iphone-15.jpeg',
                '/asset/image/apple/iphone-15-2.jpg'
            ],
            tags: ['iphone', 'apple', '15', 'ios'],
            stock: 35,
            isNew: true,
            isBestSeller: false,
            rating: 3.8,
            reviews: 156,
            options: {
                storage: [
                    { label: '128 Go', price: 0 },
                    { label: '256 Go', price: 110 },
                    { label: '512 Go', price: 230 }
                ],
                color: [
                    { label: 'Rose', price: 0 },
                    { label: 'Jaune', price: 0 },
                    { label: 'Vert', price: 0 },
                    { label: 'Bleu', price: 0 },
                    { label: 'Noir', price: 0 }
                ]
            }
        },
        {
            id: 4,
            name: 'iPhone 14 Pro',
            slug: 'iphone-14-pro',
            categoryId: 'cat_apple',
            basePrice: 1099.00,
            oldPrice: 1199.00,
            specs: {
                processor: 'A16 Bionic',
                ram: '6 Go',
                storage: '256 Go',
                screen: '6.1" Super Retina XDR',
                camera: '48 Mpx + 12 Mpx + 12 Mpx',
                battery: 'Autonomie jusqu\'à 23h',
                os: 'iOS 16'
            },
            description: 'L\'iPhone 14 Pro, encore performant avec son écran Always-On et la Dynamic Island.',
            images: [
                '/asset/image/apple/iphone-14-pro.jpg',
                '/asset/image/apple/iphone-14-pro-2.jpg'
            ],
            tags: ['iphone', 'apple', '14 pro', 'ios'],
            stock: 12,
            isNew: false,
            isBestSeller: false,
            rating: 4.5,
            reviews: 612,
            options: {
                storage: [
                    { label: '256 Go', price: 0 },
                    { label: '512 Go', price: 200 },
                    { label: '1 To', price: 400 }
                ],
                color: [
                    { label: 'Violet intense', price: 0 },
                    { label: 'Or', price: 0 },
                    { label: 'Argent', price: 0 },
                    { label: 'Noir sidéral', price: 0 }
                ]
            }
        },
        {
            id: 5,
            name: 'iPhone 14',
            slug: 'iphone-14',
            categoryId: 'cat_apple',
            basePrice: 809.00,
            oldPrice: 899.00,
            specs: {
                processor: 'A15 Bionic',
                ram: '6 Go',
                storage: '128 Go',
                screen: '6.1" Super Retina XDR',
                camera: '12 Mpx + 12 Mpx',
                battery: 'Autonomie jusqu\'à 20h',
                os: 'iOS 16'
            },
            description: 'L\'iPhone 14, un excellent rapport qualité-prix pour profiter de l\'écosystème Apple.',
            images: [
                '/asset/image/apple/iphone-14.jpg',
                '/asset/image/apple/iphone-14-2.jpg'
            ],
            tags: ['iphone', 'apple', '14', 'ios'],
            stock: 28,
            isNew: false,
            isBestSeller: false,
            rating: 3.2,
            reviews: 87,
            options: {
                storage: [
                    { label: '128 Go', price: 0 },
                    { label: '256 Go', price: 100 },
                    { label: '512 Go', price: 220 }
                ],
                color: [
                    { label: 'Bleu', price: 0 },
                    { label: 'Violet', price: 0 },
                    { label: 'Minuit', price: 0 },
                    { label: 'Lumière stellaire', price: 0 }
                ]
            }
        },

        // ---- APPLE - Apple Watch (5) ----
        {
            id: 6,
            name: 'Apple Watch Series 9',
            slug: 'apple-watch-series-9',
            categoryId: 'cat_wearables',
            categoryIds: ['cat_wearables', 'cat_apple'],
            basePrice: 449.00,
            oldPrice: 499.00,
            specs: {
                processor: 'S9 SiP',
                screen: 'Always-On Retina',
                size: '45 mm',
                connectivity: 'GPS + Cellular',
                battery: 'Jusqu\'à 18h',
                sensors: 'ECG, SpO2, accéléromètre'
            },
            description: 'L\'Apple Watch Series 9, avec le geste Double Tap et l\'écran le plus lumineux.',
            images: [
                '/asset/image/apple/apple watch series 9.jpg',
                '/asset/image/apple/apple watch series 9_2.jpg'
            ],
            tags: ['apple', 'watch', 'montre', 'montres'],
            stock: 30,
            isNew: true,
            isBestSeller: true,
            rating: 4.7,
            reviews: 834,
            options: {
                size: [
                    { label: '41 mm', price: 0 },
                    { label: '45 mm', price: 30 }
                ],
                connectivity: [
                    { label: 'GPS', price: 0 },
                    { label: 'GPS + Cellular', price: 80 }
                ],
                color: [
                    { label: 'Aluminium minuit', price: 0 },
                    { label: 'Aluminium rose', price: 0 },
                    { label: 'Aluminium argent', price: 0 },
                    { label: 'Acier inox', price: 200 }
                ]
            }
        },
        {
            id: 7,
            name: 'Apple Watch SE (2e génération)',
            slug: 'apple-watch-se-2',
            categoryId: 'cat_wearables',
            categoryIds: ['cat_wearables', 'cat_apple'],
            basePrice: 299.00,
            oldPrice: 329.00,
            specs: {
                processor: 'S8 SiP',
                screen: 'Retina',
                size: '44 mm',
                connectivity: 'GPS',
                battery: 'Jusqu\'à 18h',
                sensors: 'Accéléromètre, gyroscope'
            },
            description: 'L\'Apple Watch SE, toutes les essentiels à un prix abordable.',
            images: [
                '/asset/image/apple/apple watch SE.jpg',
                '/asset/image/apple/apple watch SE_2.jpg'
            ],
            tags: ['apple', 'watch', 'montre'],
            stock: 45,
            isNew: false,
            isBestSeller: false,
            rating: 4.0,
            reviews: 241,
            options: {
                size: [
                    { label: '40 mm', price: 0 },
                    { label: '44 mm', price: 20 }
                ],
                connectivity: [
                    { label: 'GPS', price: 0 },
                    { label: 'GPS + Cellular', price: 60 }
                ],
                color: [
                    { label: 'Argent', price: 0 },
                    { label: 'Minuit', price: 0 },
                    { label: 'Rose', price: 0 }
                ]
            }
        },
        {
            id: 8,
            name: 'Apple Watch Ultra 2',
            slug: 'apple-watch-ultra-2',
            categoryId: 'cat_wearables',
            categoryIds: ['cat_wearables', 'cat_apple'],
            basePrice: 899.00,
            oldPrice: 949.00,
            specs: {
                processor: 'S9 SiP',
                screen: 'Always-On Retina',
                size: '49 mm',
                connectivity: 'GPS + Cellular',
                battery: 'Jusqu\'à 36h',
                sensors: 'ECG, SpO2, sirène 86dB'
            },
            description: 'L\'Apple Watch Ultra 2, conçue pour les sports extrêmes et l\'aventure.',
            images: [
                '/asset/image/apple/apple watch ultra 2.jpg',
                '/asset/image/apple/apple watch ultra 2_2.jpg'
            ],
            tags: ['apple', 'watch', 'ultra', 'montre'],
            stock: 8,
            isNew: true,
            isBestSeller: false,
            rating: 3.5,
            reviews: 43,
            options: {
                bracelet: [
                    { label: 'Alpine Loop', price: 0 },
                    { label: 'Trail Loop', price: 0 },
                    { label: 'Ocean Band', price: 0 }
                ]
            }
        },

        // ---- APPLE - iPad (5) ----
        {
            id: 9,
            name: 'iPad Pro 12.9" (6e génération)',
            slug: 'ipad-pro-12-9',
            categoryId: 'cat_tablets',
            basePrice: 1299.00,
            oldPrice: 1399.00,
            specs: {
                processor: 'M2',
                ram: '16 Go',
                storage: '512 Go',
                screen: '12.9" Liquid Retina XDR',
                camera: '12 Mpx + 10 Mpx',
                battery: 'Jusqu\'à 10h',
                os: 'iPadOS 17'
            },
            description: 'L\'iPad Pro avec puce M2, écran XDR et compatibilité Apple Pencil.',
            images: [
                '/asset/image/apple/apple ipad pro 12.9.jpg',
                '/asset/image/apple/apple ipad pro 12.9_2.jpg'
            ],
            tags: ['ipad', 'apple', 'pro', 'tablette'],
            stock: 10,
            isNew: false,
            isBestSeller: true,
            rating: 4.6,
            reviews: 521,
            options: {
                storage: [
                    { label: '512 Go', price: 0 },
                    { label: '1 To', price: 300 },
                    { label: '2 To', price: 600 }
                ],
                connectivity: [
                    { label: 'Wi-Fi', price: 0 },
                    { label: 'Wi-Fi + Cellular', price: 200 }
                ]
            }
        },
        {
            id: 10,
            name: 'iPad Air 11" (5e génération)',
            slug: 'ipad-air-11',
            categoryId: 'cat_tablets',
            basePrice: 699.00,
            oldPrice: 749.00,
            specs: {
                processor: 'M1',
                ram: '8 Go',
                storage: '256 Go',
                screen: '11" Liquid Retina',
                camera: '12 Mpx',
                battery: 'Jusqu\'à 10h',
                os: 'iPadOS 17'
            },
            description: 'L\'iPad Air avec puce M1, un excellent compromis puissance/prix.',
            images: [
                '/asset/image/apple/apple ipad air 11.jpg',
                '/asset/image/apple/ipad air 11_2.jpg'
            ],
            tags: ['ipad', 'apple', 'air', 'tablette'],
            stock: 20,
            isNew: false,
            isBestSeller: true,
            rating: 4.3,
            reviews: 318,
            options: {
                storage: [
                    { label: '64 Go', price: 0 },
                    { label: '256 Go', price: 150 }
                ],
                connectivity: [
                    { label: 'Wi-Fi', price: 0 },
                    { label: 'Wi-Fi + Cellular', price: 150 }
                ]
            }
        },
        {
            id: 11,
            name: 'iPad (10e génération)',
            slug: 'ipad-10',
            categoryId: 'cat_tablets',
            basePrice: 449.00,
            oldPrice: 499.00,
            specs: {
                processor: 'A14 Bionic',
                ram: '4 Go',
                storage: '64 Go',
                screen: '10.9" Liquid Retina',
                camera: '12 Mpx',
                battery: 'Jusqu\'à 10h',
                os: 'iPadOS 17'
            },
            description: 'L\'iPad tout écran, parfait pour le quotidien et les études.',
            images: [
                '/asset/image/apple/ipad air 10ème.png',
                '/asset/image/apple/ipad air 10ème_2.jpg'
            ],
            tags: ['ipad', 'apple', 'tablette'],
            stock: 35,
            isNew: true,
            isBestSeller: false,
            rating: 3.7,
            reviews: 112,
            options: {
                storage: [
                    { label: '64 Go', price: 0 },
                    { label: '256 Go', price: 120 }
                ],
                color: [
                    { label: 'Bleu', price: 0 },
                    { label: 'Rose', price: 0 },
                    { label: 'Argent', price: 0 },
                    { label: 'Jaune', price: 0 }
                ]
            }
        },

        // ---- ANDROID - Samsung (5) ----
        {
            id: 12,
            name: 'Samsung Galaxy S24 Ultra',
            slug: 'samsung-galaxy-s24-ultra',
            categoryId: 'cat_android',
            basePrice: 1399.00,
            oldPrice: 1499.00,
            specs: {
                processor: 'Snapdragon 8 Gen 3',
                ram: '12 Go',
                storage: '512 Go',
                screen: '6.8" Dynamic AMOLED 2X 120Hz',
                camera: '200 Mpx + 12 Mpx + 50 Mpx + 10 Mpx',
                battery: '5000 mAh',
                os: 'Android 14'
            },
            description: 'Le Samsung Galaxy S24 Ultra, l\'ultime smartphone avec S Pen et zoom x100.',
            images: [
                '/asset/image/android/samsungs24-ultra.jpg',
                '/asset/image/android/samsungs24-ultra2.jpg'
            ],
            tags: ['samsung', 'android', 'galaxy s24'],
            stock: 12,
            isNew: true,
            isBestSeller: true,
            rating: 4.5,
            reviews: 445,
            options: {
                storage: [
                    { label: '512 Go', price: 0 },
                    { label: '1 To', price: 200 }
                ],
                color: [
                    { label: 'Titane gris', price: 0 },
                    { label: 'Titane violet', price: 0 },
                    { label: 'Titane noir', price: 0 }
                ]
            }
        },
        {
            id: 13,
            name: 'Samsung Galaxy S24+',
            slug: 'samsung-galaxy-s24-plus',
            categoryId: 'cat_android',
            basePrice: 1119.00,
            oldPrice: 1199.00,
            specs: {
                processor: 'Snapdragon 8 Gen 3',
                ram: '12 Go',
                storage: '256 Go',
                screen: '6.7" Dynamic AMOLED 2X 120Hz',
                camera: '50 Mpx + 12 Mpx + 10 Mpx',
                battery: '4900 mAh',
                os: 'Android 14'
            },
            description: 'Le Samsung Galaxy S24+, le grand format sans compromis.',
            images: [
                '/asset/image/android/samsungs24.jpg',
                '/asset/image/android/samsungs24_2.jpg'
            ],
            tags: ['samsung', 'android', 'galaxy s24'],
            stock: 15,
            isNew: true,
            isBestSeller: false,
            rating: 3.9,
            reviews: 178,
            options: {
                storage: [
                    { label: '256 Go', price: 0 },
                    { label: '512 Go', price: 120 }
                ],
                color: [
                    { label: 'Onyx noir', price: 0 },
                    { label: 'Jade vert', price: 0 },
                    { label: 'Violet', price: 0 }
                ]
            }
        },
        {
            id: 14,
            name: 'Samsung Galaxy Z Fold5',
            slug: 'samsung-galaxy-z-fold5',
            categoryId: 'cat_android',
            basePrice: 1799.00,
            oldPrice: 1899.00,
            specs: {
                processor: 'Snapdragon 8 Gen 2',
                ram: '12 Go',
                storage: '512 Go',
                screen: '7.6" Dynamic AMOLED 120Hz',
                camera: '50 Mpx + 12 Mpx + 10 Mpx',
                battery: '4400 mAh',
                os: 'Android 13'
            },
            description: 'Le Galaxy Z Fold5, le smartphone pliable qui se transforme en tablette.',
            images: [
                '/asset/image/android/samsung_galaxyzfold5.jpg',
                '/asset/image/android/samsung_galaxyzfold5.jpg'
            ],
            tags: ['samsung', 'android', 'fold', 'pliable'],
            stock: 5,
            isNew: false,
            isBestSeller: false,
            rating: 4.1,
            reviews: 203,
            options: {
                storage: [
                    { label: '512 Go', price: 0 },
                    { label: '1 To', price: 200 }
                ],
                color: [
                    { label: 'Noir', price: 0 },
                    { label: 'Crème', price: 0 }
                ]
            }
        },
        {
            id: 15,
            name: 'Samsung Galaxy Z Flip5',
            slug: 'samsung-galaxy-z-flip5',
            categoryId: 'cat_android',
            basePrice: 1099.00,
            oldPrice: 1199.00,
            specs: {
                processor: 'Snapdragon 8 Gen 2',
                ram: '8 Go',
                storage: '256 Go',
                screen: '6.7" Dynamic AMOLED 120Hz',
                camera: '12 Mpx + 12 Mpx',
                battery: '3700 mAh',
                os: 'Android 13'
            },
            description: 'Le Galaxy Z Flip5, le compact pliable avec grand écran externe.',
            images: [
                '/asset/image/android/Galaxy-Z-Flip-5.jpg',
                '/asset/image/android/Galaxy-Z-Flip-5-2.jpg'
            ],
            tags: ['samsung', 'android', 'flip', 'pliable'],
            stock: 18,
            isNew: false,
            isBestSeller: true,
            rating: 2.8,
            reviews: 34,
            options: {
                storage: [
                    { label: '256 Go', price: 0 },
                    { label: '512 Go', price: 120 }
                ],
                color: [
                    { label: 'Menthe', price: 0 },
                    { label: 'Lavande', price: 0 },
                    { label: 'Noir', price: 0 }
                ]
            }
        },
        {
            id: 16,
            name: 'Samsung Galaxy A55',
            slug: 'samsung-galaxy-a55',
            categoryId: 'cat_android',
            basePrice: 479.00,
            oldPrice: 529.00,
            specs: {
                processor: 'Exynos 1480',
                ram: '8 Go',
                storage: '128 Go',
                screen: '6.6" Super AMOLED 120Hz',
                camera: '50 Mpx + 12 Mpx + 5 Mpx',
                battery: '5000 mAh',
                os: 'Android 14'
            },
            description: 'Le Samsung Galaxy A55, un excellent milieu de gamme pour tous les jours.',
            images: [
                '/asset/image/android/samsung_galaxy_a55.jpg',
                '/asset/image/android/samsung_galaxy_a55_2.webp'
            ],
            tags: ['samsung', 'android', 'galaxy a'],
            stock: 40,
            isNew: true,
            isBestSeller: false,
            rating: 4.4,
            reviews: 267,
            options: {
                storage: [
                    { label: '128 Go', price: 0 },
                    { label: '256 Go', price: 60 }
                ],
                color: [
                    { label: 'Noir', price: 0 },
                    { label: 'Bleu', price: 0 },
                    { label: 'Violet', price: 0 }
                ]
            }
        },

        // ---- ANDROID - Google Pixel (3) ----
        {
            id: 17,
            name: 'Google Pixel 8 Pro',
            slug: 'google-pixel-8-pro',
            categoryId: 'cat_android',
            basePrice: 1099.00,
            oldPrice: null,
            specs: {
                processor: 'Google Tensor G3',
                ram: '12 Go',
                storage: '256 Go',
                screen: '6.7" LTPO OLED 120Hz',
                camera: '50 Mpx + 48 Mpx + 48 Mpx',
                battery: '5050 mAh',
                os: 'Android 14'
            },
            description: 'Le Pixel 8 Pro, avec l\'IA de Google et un appareil photo exceptionnel.',
            images: [
                '/asset/image/android/google_pixel8pro.jpg',
                '/asset/image/android/google_pixel8pro_2.jpg'
            ],
            tags: ['google', 'pixel', 'android'],
            stock: 20,
            isNew: true,
            isBestSeller: true,
            rating: 3.6,
            reviews: 89,
            options: {
                storage: [
                    { label: '256 Go', price: 0 },
                    { label: '512 Go', price: 150 }
                ],
                color: [
                    { label: 'Baie', price: 0 },
                    { label: 'Porcelaine', price: 0 },
                    { label: 'Noir', price: 0 }
                ]
            }
        },
        {
            id: 18,
            name: 'Google Pixel 8',
            slug: 'google-pixel-8',
            categoryId: 'cat_android',
            basePrice: 799.00,
            oldPrice: 849.00,
            specs: {
                processor: 'Google Tensor G3',
                ram: '8 Go',
                storage: '128 Go',
                screen: '6.2" OLED 120Hz',
                camera: '50 Mpx + 12 Mpx',
                battery: '4575 mAh',
                os: 'Android 14'
            },
            description: 'Le Pixel 8, compact et puissant avec les fonctionnalités IA de Google.',
            images: [
                '/asset/image/android/google_pixel8.jpg',
                '/asset/image/android/google_pixel8_2.jpg'
            ],
            tags: ['google', 'pixel', 'android'],
            stock: 25,
            isNew: true,
            isBestSeller: false,
            rating: 4.2,
            reviews: 156,
            options: {
                storage: [
                    { label: '128 Go', price: 0 },
                    { label: '256 Go', price: 100 }
                ],
                color: [
                    { label: 'Rose', price: 0 },
                    { label: 'Vert', price: 0 },
                    { label: 'Noir', price: 0 }
                ]
            }
        },
        {
            id: 19,
            name: 'Google Pixel 7 Pro',
            slug: 'google-pixel-7-pro',
            categoryId: 'cat_android',
            basePrice: 899.00,
            oldPrice: 999.00,
            specs: {
                processor: 'Google Tensor G2',
                ram: '12 Go',
                storage: '256 Go',
                screen: '6.7" LTPO OLED 120Hz',
                camera: '50 Mpx + 48 Mpx + 12 Mpx',
                battery: '5000 mAh',
                os: 'Android 13'
            },
            description: 'Le Pixel 7 Pro, un excellent choix pour la photo avec son téléobjectif.',
            images: [
                '/asset/image/android/google_pixel7pro.jpg',
                '/asset/image/android/google_pixel7pro_2.webp'
            ],
            tags: ['google', 'pixel', 'android'],
            stock: 15,
            isNew: false,
            isBestSeller: false,
            rating: 3.4,
            reviews: 62,
            options: {
                storage: [
                    { label: '256 Go', price: 0 },
                    { label: '512 Go', price: 130 }
                ],
                color: [
                    { label: 'Noir', price: 0 },
                    { label: 'Blanc', price: 0 }
                ]
            }
        },

        // ---- ANDROID - Xiaomi (3) ----
        {
            id: 20,
            name: 'Xiaomi 14 Ultra',
            slug: 'xiaomi-14-ultra',
            categoryId: 'cat_android',
            basePrice: 1299.00,
            oldPrice: 1399.00,
            specs: {
                processor: 'Snapdragon 8 Gen 3',
                ram: '16 Go',
                storage: '512 Go',
                screen: '6.73" AMOLED 120Hz',
                camera: '50 Mpx + 50 Mpx + 50 Mpx + 50 Mpx',
                battery: '5300 mAh',
                os: 'Android 14'
            },
            description: 'Le Xiaomi 14 Ultra, un appareil photo Leica quadri-capteur et une puissance exceptionnelle.',
            images: [
                '/asset/image/android/xiaomi14ultra.webp',
                '/asset/image/android/xiaomi14ultra2.webp'
            ],
            tags: ['xiaomi', 'android', 'smartphone'],
            stock: 8,
            isNew: true,
            isBestSeller: false,
            rating: 4.6,
            reviews: 389,
            options: {
                storage: [
                    { label: '512 Go', price: 0 },
                    { label: '1 To', price: 200 }
                ],
                color: [
                    { label: 'Noir', price: 0 },
                    { label: 'Blanc', price: 0 }
                ]
            }
        },
        {
            id: 21,
            name: 'Xiaomi 13T Pro',
            slug: 'xiaomi-13t-pro',
            categoryId: 'cat_android',
            basePrice: 649.00,
            oldPrice: 699.00,
            specs: {
                processor: 'Dimensity 9200+',
                ram: '12 Go',
                storage: '256 Go',
                screen: '6.67" AMOLED 144Hz',
                camera: '50 Mpx + 50 Mpx + 12 Mpx',
                battery: '5000 mAh',
                os: 'Android 13'
            },
            description: 'Le Xiaomi 13T Pro, co-développé avec Leica pour des photos sublimes.',
            images: [
                '/asset/image/android/xiaomi13tpro.jpg',
                '/asset/image/android/xiaomi13tpro2.webp'
            ],
            tags: ['xiaomi', 'android'],
            stock: 22,
            isNew: false,
            isBestSeller: true,
            rating: 3.9,
            reviews: 134,
            options: {
                storage: [
                    { label: '256 Go', price: 0 },
                    { label: '512 Go', price: 100 }
                ],
                color: [
                    { label: 'Noir', price: 0 },
                    { label: 'Bleu', price: 0 }
                ]
            }
        },

        // ---- MONTRES - Samsung Galaxy Watch (3) ----
        {
            id: 22,
            name: 'Samsung Galaxy Watch 6 Classic',
            slug: 'samsung-galaxy-watch-6-classic',
            categoryId: 'cat_wearables',
            basePrice: 399.00,
            oldPrice: 449.00,
            specs: {
                processor: 'Exynos W930',
                screen: '1.5" Super AMOLED',
                size: '47 mm',
                connectivity: 'Bluetooth',
                battery: '425 mAh',
                sensors: 'ECG, accéléromètre, gyroscope'
            },
            description: 'La Galaxy Watch 6 Classic avec sa lunette tournante, idéale pour le sport et la santé.',
            images: [
                '/asset/image/android/samsunggalaxywatch6_classic.jpg',
                '/asset/image/android/samsung_galaxywatch6_classic.jpg'
            ],
            tags: ['samsung', 'watch', 'android'],
            stock: 25,
            isNew: false,
            isBestSeller: true,
            rating: 4.3,
            reviews: 212,
            options: {
                size: [
                    { label: '43 mm', price: 0 },
                    { label: '47 mm', price: 30 }
                ],
                connectivity: [
                    { label: 'Bluetooth', price: 0 },
                    { label: '4G', price: 50 }
                ]
            }
        },
        {
            id: 23,
            name: 'Samsung Galaxy Watch 6',
            slug: 'samsung-galaxy-watch-6',
            categoryId: 'cat_wearables',
            basePrice: 299.00,
            oldPrice: 329.00,
            specs: {
                processor: 'Exynos W930',
                screen: '1.3" Super AMOLED',
                size: '40 mm',
                connectivity: 'Bluetooth',
                battery: '300 mAh',
                sensors: 'ECG, accéléromètre'
            },
            description: 'La Galaxy Watch 6, le modèle compact pour un suivi santé précis.',
            images: [
                '/asset/image/android/samsung_galaxywatch_6.webp',
                '/asset/image/android/samsung_galaxywatch_6_2.webp'
            ],
            tags: ['samsung', 'watch', 'android'],
            stock: 30,
            isNew: false,
            isBestSeller: false,
            rating: 2.5,
            reviews: 21,
            options: {
                size: [
                    { label: '40 mm', price: 0 },
                    { label: '44 mm', price: 20 }
                ],
                color: [
                    { label: 'Noir', price: 0 },
                    { label: 'Argent', price: 0 }
                ]
            }
        },

        // ---- MONTRES - Fitbit (2) ----
        {
            id: 24,
            name: 'Fitbit Charge 6',
            slug: 'fitbit-charge-6',
            categoryId: 'cat_wearables',
            basePrice: 159.00,
            oldPrice: 179.00,
            specs: {
                screen: 'OLED tactile',
                battery: 'Jusqu\'à 7 jours',
                sensors: 'ECG, SpO2, fréquence cardiaque, GPS connecté',
                features: 'Suivi d\'activité, sommeil, stress'
            },
            description: 'Le Fitbit Charge 6, le tracker d\'activité ultime pour la santé et la forme.',
            images: [
                '/asset/image/android/fitbit6charge.webp',
                '/asset/image/android/fitbit6charge2.jpg'
            ],
            tags: ['fitbit', 'tracker'],
            stock: 60,
            isNew: true,
            isBestSeller: true,
            rating: 3.8,
            reviews: 98,
            options: {
                color: [
                    { label: 'Noir', price: 0 },
                    { label: 'Blanc', price: 0 },
                    { label: 'Bleu', price: 0 }
                ]
            }
        },
        {
            id: 25,
            name: 'Fitbit Versa 4',
            slug: 'fitbit-versa-4',
            categoryId: 'cat_wearables',
            basePrice: 199.00,
            oldPrice: 229.00,
            specs: {
                screen: 'AMOLED',
                battery: 'Jusqu\'à 6 jours',
                sensors: 'Fréquence cardiaque, SpO2',
                features: 'GPS intégré, suivi d\'activité'
            },
            description: 'La Fitbit Versa 4, une montre connectée complète pour le sport et le quotidien.',
            images: [
                '/asset/image/android/fitbitversa4.jpg',
                '/asset/image/android/fitbitversa4_2.jpeg'
            ],
            tags: ['fitbit', 'montre'],
            stock: 35,
            isNew: false,
            isBestSeller: false,
            rating: 4.5,
            reviews: 334,
            options: {
                color: [
                    { label: 'Noir', price: 0 },
                    { label: 'Rose', price: 0 },
                    { label: 'Bleu', price: 0 }
                ]
            }
        },

        // ---- TABLETTES - Samsung Galaxy Tab (3) ----
        {
            id: 26,
            name: 'Samsung Galaxy Tab S9 Ultra',
            slug: 'samsung-galaxy-tab-s9-ultra',
            categoryId: 'cat_tablets',
            basePrice: 1199.00,
            oldPrice: 1299.00,
            specs: {
                processor: 'Snapdragon 8 Gen 2',
                ram: '12 Go',
                storage: '256 Go',
                screen: '14.6" Dynamic AMOLED 2X 120Hz',
                camera: '13 Mpx + 8 Mpx',
                battery: '11200 mAh',
                os: 'Android 13'
            },
            description: 'La Galaxy Tab S9 Ultra, une tablette géante avec S Pen inclus.',
            images: [
                '/asset/image/android/galaxytabs9ultra.jpg',
                '/asset/image/android/galaxytabs9ultra__2.webp'
            ],
            tags: ['samsung', 'android', 'tablette'],
            stock: 8,
            isNew: true,
            isBestSeller: true,
            rating: 3.1,
            reviews: 47,
            options: {
                storage: [
                    { label: '256 Go', price: 0 },
                    { label: '512 Go', price: 150 },
                    { label: '1 To', price: 300 }
                ],
                connectivity: [
                    { label: 'Wi-Fi', price: 0 },
                    { label: '5G', price: 150 }
                ]
            }
        },
        {
            id: 27,
            name: 'Samsung Galaxy Tab S9+',
            slug: 'samsung-galaxy-tab-s9-plus',
            categoryId: 'cat_tablets',
            basePrice: 999.00,
            oldPrice: 1099.00,
            specs: {
                processor: 'Snapdragon 8 Gen 2',
                ram: '12 Go',
                storage: '256 Go',
                screen: '12.4" Dynamic AMOLED 2X 120Hz',
                camera: '13 Mpx + 8 Mpx',
                battery: '10090 mAh',
                os: 'Android 13'
            },
            description: 'La Galaxy Tab S9+, le grand format polyvalent.',
            images: [
                '/asset/image/android/galaxytabs9+.jpg',
                '/asset/image/android/galaxytabs9+_2.jpg'
            ],
            tags: ['samsung', 'android', 'tablette'],
            stock: 12,
            isNew: true,
            isBestSeller: false,
            rating: 4.8,
            reviews: 567,
            options: {
                storage: [
                    { label: '256 Go', price: 0 },
                    { label: '512 Go', price: 150 }
                ],
                connectivity: [
                    { label: 'Wi-Fi', price: 0 },
                    { label: '5G', price: 130 }
                ]
            }
        },
        {
            id: 28,
            name: 'Samsung Galaxy Tab S9',
            slug: 'samsung-galaxy-tab-s9',
            categoryId: 'cat_tablets',
            basePrice: 799.00,
            oldPrice: 899.00,
            specs: {
                processor: 'Snapdragon 8 Gen 2',
                ram: '8 Go',
                storage: '128 Go',
                screen: '11" Dynamic AMOLED 2X 120Hz',
                camera: '13 Mpx',
                battery: '8400 mAh',
                os: 'Android 13'
            },
            description: 'La Galaxy Tab S9, la tablette compacte et puissante.',
            images: [
                '/asset/image/android/galaxys9tab.webp',
                '/asset/image/android/galaxys9tab_2.jpg'
            ],
            tags: ['samsung', 'android', 'tablette'],
            stock: 18,
            isNew: false,
            isBestSeller: false,
            rating: 4.7,
            reviews: 423,
            options: {
                storage: [
                    { label: '128 Go', price: 0 },
                    { label: '256 Go', price: 100 }
                ],
                connectivity: [
                    { label: 'Wi-Fi', price: 0 },
                    { label: '5G', price: 120 }
                ]
            }
        },

        // ---- TABLETTES - Amazon Fire (2) ----
        {
            id: 29,
            name: 'Amazon Fire Max 11',
            slug: 'amazon-fire-max-11',
            categoryId: 'cat_tablets',
            basePrice: 249.99,
            oldPrice: 279.99,
            specs: {
                processor: 'MediaTek MT8188',
                ram: '4 Go',
                storage: '64 Go',
                screen: '11" LCD',
                camera: '8 Mpx',
                battery: 'Jusqu\'à 14h',
                os: 'Fire OS 8'
            },
            description: 'La Fire Max 11, la tablette Amazon pour le divertissement et la productivité.',
            images: [
                '/asset/image/android/amazonfire_max_11.webp',
                '/asset/image/android/amazonfire_max_11_2.webp'
            ],
            tags: ['amazon', 'fire', 'tablette'],
            stock: 45,
            isNew: true,
            isBestSeller: true,
            rating: 3.5,
            reviews: 78,
            options: {
                storage: [
                    { label: '64 Go', price: 0 },
                    { label: '128 Go', price: 40 }
                ],
                with_ads: [
                    { label: 'Avec publicités', price: 0 },
                    { label: 'Sans publicités', price: 15 }
                ]
            }
        },
        {
            id: 30,
            name: 'Amazon Fire HD 10',
            slug: 'amazon-fire-hd-10',
            categoryId: 'cat_tablets',
            basePrice: 149.99,
            oldPrice: 169.99,
            specs: {
                processor: 'Octa-core',
                ram: '3 Go',
                storage: '32 Go',
                screen: '10.1" 1080p',
                camera: '5 Mpx',
                battery: 'Jusqu\'à 12h',
                os: 'Fire OS 8'
            },
            description: 'La Fire HD 10, le meilleur rapport qualité-prix pour les films et les apps.',
            images: [
                '/asset/image/android/amazonfire_hd_10.webp',
                '/asset/image/android/amazonfire_hd_10_2.jpg'
            ],
            tags: ['amazon', 'fire', 'tablette'],
            stock: 60,
            isNew: false,
            isBestSeller: false,
            rating: 4.4,
            reviews: 891,
            options: {
                storage: [
                    { label: '32 Go', price: 0 },
                    { label: '64 Go', price: 30 }
                ],
                with_ads: [
                    { label: 'Avec publicités', price: 0 },
                    { label: 'Sans publicités', price: 15 }
                ]
            }
        }
    ];

    // Fonctions utilitaires
    const helpers = {
        getProductById: function(id) {
            return products.find(p => p.id === parseInt(id));
        },
        getProductsByCategory: function(categorySlug) {
            const cat = categories.find(c => c.slug === categorySlug);
            if (!cat) return [];
            // categoryIds permet à un produit d'apparaître dans plusieurs catégories
            return products.filter(p =>
                p.categoryId === cat.id ||
                (Array.isArray(p.categoryIds) && p.categoryIds.includes(cat.id))
            );
        },
        getBestSellers: function(limit = 4) {
            return products.filter(p => p.isBestSeller).slice(0, limit);
        },
        getNewProducts: function(limit = 4) {
            return products.filter(p => p.isNew).slice(0, limit);
        },
        search: function(query) {
            const q = query.toLowerCase();
            return products.filter(p => 
                p.name.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q) ||
                p.tags.some(tag => tag.includes(q))
            );
        },
        getCategoryBySlug: function(slug) {
            return categories.find(c => c.slug === slug);
        },
        getCategorySlugFromId: function(categoryId) {
            const cat = categories.find(c => c.id === categoryId);
            return cat ? cat.slug : '';
        }
    };

    // Exposition globale
    window.PearTechDB = {
        categories: categories,
        products:   products,
        promotions: [],
        ...helpers
    };

    // Alias rétrocompatibilité (catalogue.js, recherche.js, etc. utilisent PearTechDB)
    window.PearTechDB = window.PearTechDB;

    // Alias direct pour favoris.js et product_grid.js
    window.products = products;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = window.PearTechDB;
    }

    console.log('✅ Base de données PearTech chargée :', products.length, 'produits,', categories.length, 'catégories');
})();