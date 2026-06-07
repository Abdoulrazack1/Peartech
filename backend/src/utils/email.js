// ============================================================
//  Envoi d'emails (Nodemailer).
//
//  On utilise le transport "jsonTransport" : aucun serveur SMTP réel
//  n'est nécessaire, le mail est juste construit puis affiché dans la
//  console. C'est la "simulation" prévue par le sujet (remplaçable par
//  un vrai SMTP en production en changeant le transport).
// ============================================================

const nodemailer = require('nodemailer');

// Transport de simulation : ne contacte aucun serveur, renvoie le mail en JSON.
const transport = nodemailer.createTransport({ jsonTransport: true });

// Envoie (simule) un email de confirmation de commande.
async function envoyerConfirmationCommande(destinataire, commande) {
    const lignes = (commande.articles || [])
        .map(a => `- ${a.quantite} x ${a.nom} : ${a.prixUnitaire} €`)
        .join('\n');

    const info = await transport.sendMail({
        from: 'PearTech <no-reply@peartech.fr>',
        to: destinataire,
        subject: `Confirmation de votre commande #${commande.id}`,
        text:
            `Bonjour,\n\n` +
            `Merci pour votre commande #${commande.id} chez PearTech.\n\n` +
            `${lignes}\n\n` +
            `Sous-total : ${commande.sousTotal} €\n` +
            `Frais de port : ${commande.fraisPort} €\n` +
            `Total payé : ${commande.total} €\n\n` +
            `Vous recevrez un email lors de l'expédition.\n\n` +
            `L'équipe PearTech`
    });

    // Trace visible côté serveur (preuve que l'email a bien été "envoyé")
    console.log(`📧 Email de confirmation simulé envoyé à ${destinataire} (commande #${commande.id})`);
    return info;
}

module.exports = { envoyerConfirmationCommande };
