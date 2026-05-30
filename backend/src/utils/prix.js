// ============================================================
//  Utilitaire de calcul de prix (partagé panier + commande).
// ============================================================

// Normalise les options choisies en une simple liste de libellés.
// Accepte plusieurs formats venant du front ou de l'API :
//   - objet  : { storage: '512 Go', color: 'Titane bleu' }
//   - tableau d'objets : [{ name:'Stockage', value:'512 Go' }]
//   - tableau de chaînes : ['512 Go', 'Titane bleu']
function extraireLibelles(optionsChoisies) {
    if (!optionsChoisies) return [];
    if (Array.isArray(optionsChoisies)) {
        return optionsChoisies
            .map(o => (typeof o === 'string' ? o : (o.value || o.label)))
            .filter(Boolean);
    }
    if (typeof optionsChoisies === 'object') {
        return Object.values(optionsChoisies).filter(v => typeof v === 'string');
    }
    return [];
}

// Calcule le supplément lié aux options choisies pour un produit.
// On cherche chaque libellé choisi dans TOUS les groupes d'options du produit
// (robuste même si le front nomme les groupes différemment).
function calculerSupplementOptions(produit, optionsChoisies) {
    const libelles = extraireLibelles(optionsChoisies);
    if (libelles.length === 0) return 0;

    let supplement = 0;
    const groupes = produit.options || {};
    for (const cle in groupes) {
        const liste = groupes[cle];
        if (Array.isArray(liste)) {
            liste.forEach(o => {
                if (libelles.includes(o.label)) supplement += Number(o.price) || 0;
            });
        }
    }
    return supplement;
}

// Prix unitaire d'un produit avec ses options
function prixUnitaire(produit, optionsChoisies) {
    return Number(produit.prix) + calculerSupplementOptions(produit, optionsChoisies || {});
}

module.exports = { calculerSupplementOptions, prixUnitaire, extraireLibelles };
