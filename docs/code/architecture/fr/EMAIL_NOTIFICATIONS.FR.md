# Emails et notifications

## Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Fournisseur et configuration](#fournisseur-et-configuration)
- [Emails envoyés](#emails-envoyés)
- [Gabarit](#gabarit)
- [Contacts Brevo](#contacts-brevo)
- [Envoi de la newsletter](#envoi-de-la-newsletter)
- [Désabonnement](#désabonnement)
- [Compteurs de notification du back-office](#compteurs-de-notification-du-back-office)
- [Fonctions de test](#fonctions-de-test)
- [Écarts connus](#écarts-connus)

## Vue d'ensemble

Tous les emails sont des emails transactionnels envoyés par le serveur via [Brevo](https://www.brevo.com) (anciennement Sendinblue). Les apps `web` et `bo` n'envoient jamais de mail : elles appellent une Cloud Function ou enregistrent un objet, et le serveur fait le reste. Il n'y a ni push, ni SMS, ni canal de notification dans l'app ; les seules « notifications » dans l'app sont les compteurs d'éléments nouveaux du back-office, voir plus bas.

| Fichier | Rôle |
|---|---|
| `apps/server/src/services/email.service.ts` | client Brevo : `sendEmail`, `createContactEmail`, `getContacts` |
| `apps/server/src/cloud/utils/email.utils.cloud.ts` | une fonction par email, construit le sujet et le corps |
| `apps/server/src/config/emails/index.ts` | mise en page HTML commune à tous les emails (`generateEmailTemplate`) |
| `apps/server/src/locales/{fr,en,mg}/common.json` | textes des emails traduits |

## Fournisseur et configuration

- SDK Brevo `@getbrevo/brevo`, un client créé au premier usage avec `BREVO_API_KEY`.
- Expéditeur : `ADMIN_EMAIL_SENDER` comme adresse et la constante `APP_NAME` (`Portfolio`) comme nom.
- `BREVO_API_KEY` et `WEBSITE_URL` sont obligatoires au démarrage (`validateEnv`) ; `ADMIN_EMAIL_SENDER` est lue là où les emails sont construits. Les liens des emails pointent vers `WEBSITE_URL` (en développement local, `http://localhost:9002`), et le logo est servi par le serveur à `/logo.svg`.
- `sendEmail` journalise la réponse de Brevo et relance l'erreur en cas d'échec ; une aide considère l'envoi réussi quand la réponse contient un `messageId`.
- Le texte de chaque email est traduit avec l'i18n du serveur (`translate(key, locale)`), voir [I18N.FR.md](I18N.FR.md). La locale vient du paramètre de la Cloud Function ou du contexte d'enregistrement ; le défaut est `fr`.

## Emails envoyés

| Email | Fonction | Envoyé quand | Destinataire |
|---|---|---|---|
| Confirmation du compte (code à 6 chiffres, valable 1 heure) | `sendEmailVerification` | à la création d'un utilisateur en production (`afterSave` de `_User`) ; Cloud Function `sendVerificationCode` ; `beforeLogin` quand la confirmation du compte est activée | le nouvel utilisateur |
| Réinitialisation du mot de passe (code à 6 chiffres, valable 1 heure) | `sendEmailResetPassword` | Cloud Function `sendResetPasswordVerificationCode` | l'utilisateur |
| Message libre | `sendEmailToUser` | Cloud Function `sendEmailToUser`, appelée par l'action « envoyer un email » des pages utilisateurs du back-office (sujet et message saisis par l'administrateur) | l'utilisateur choisi |
| Nouvel article | `sendArticleToNewsletterEmails` | `sendArticleToNewsletterJob`, voir plus bas | chaque abonné actif à la newsletter |

Rien n'est envoyé quand un visiteur soumet le formulaire de contact ou s'abonne à la newsletter : ni confirmation au visiteur, ni alerte au propriétaire du site. Le back-office est informé des nouveaux messages par les compteurs ci-dessous.

## Gabarit

`generateEmailTemplate({ title, content, buttonUrl, buttonText, footer, cardStyle, locale })` renvoie une mise en page HTML en tableau : logo lié au site, titre optionnel, contenu, bouton optionnel, pied de page optionnel et ligne de copyright avec l'année en cours. Les styles sont dans un bloc `<style>` en ligne, car les clients mail ignorent les CSS externes. Les emails ont leurs propres couleurs en dur, ce qui est accepté pour du HTML d'email.

## Contacts Brevo

Le serveur tient aussi une liste de contacts dans Brevo (`createContactToCloud` / `createContactEmail`), avec les attributs `FIRSTNAME`, `LASTNAME`, `EMAIL` et `SMS` ; les attributs sont créés une fois par processus (`ensureContactAttributes`) et une erreur est journalisée sans bloquer.

| Source | Quand |
|---|---|
| Nouvel utilisateur (production) | après l'email de confirmation, dans `saveUserAndSendCodeToEmail` |
| Nouveau `Contact` | `afterSave` de `Contact`, avec l'`objectId` du contact comme identifiant externe |
| Nouvel abonnement `Newsletter` | `afterSave` de `Newsletter` lance `createContactToCloudJob`, qui déduit un prénom et un nom de la partie de l'email avant `@` |

Un échec de création du contact Brevo est journalisé, pas levé, sauf dans le chemin de création d'utilisateur où il est transformé en erreur traduite `error.sendingVerificationCode`.

## Envoi de la newsletter

1. L'enregistrement d'un nouvel `Article` (un enregistrement authentifié, depuis le back-office) lance le job Parse `sendArticleToNewsletterJob` avec l'id de l'article.
2. Le job ne charge l'article que s'il est `active: true` et `deleted: false` ; sinon il se termine sans bruit.
3. Il parcourt les abonnements `Newsletter` qui sont `active: true` et `deleted: false`, 20 à la fois (`runParallelJob`), en attendant 250 ms après chacun.
4. Chaque abonné reçoit l'article dans sa propre `language` : titre traduit comme sujet, contenu coupé par `cutHtmlString`, un bouton vers la page de l'article (`WEBSITE_URL/<locale>/<route articles>/<slug>`), et un lien de désabonnement en pied de page.
5. Un échec pour un abonné est journalisé et le job passe au suivant.

## Désabonnement

Le lien de pied de page est `WEBSITE_URL/<locale>/newsletter/<email chiffré>/unsubscribe`, où l'email est chiffré avec la clé fixe en forme hexadécimale. La page du site appelle les Cloud Functions `unsubscribeNewsletter`, `resubscribeNewsletter` et `addReasonToUnsubscribeToTheNewsletter` (motif parmi `tooFrequent`, `notInterested`, `notRelevant`, `other`). Se désabonner met `active: false` et `unsubscribeAt` ; se réabonner inverse les deux.

## Compteurs de notification du back-office

La barre latérale montre combien d'éléments sont nouveaux. `getNewUsersCount` compte les utilisateurs avec `seen: false` et `deleted: false` ; `getObjectsCount({ className })` fait de même pour n'importe quelle classe (le back-office la charge pour `Contact` et `_User`, les `NOTIFICATION_COLLECTIONS`, à chaque entrée dans le tableau de bord). Ouvrir un élément le marque comme vu (`getUser` avec `shouldMarkAsSeen`, `toggleUserSeen`). Répondre à un contact est un indicateur (`replied`) posé depuis le back-office, pas un email.

## Fonctions de test

`sendVerificationCodeTest`, `sendResetPasswordVerificationCodeTest` et `sendArticleToNewsletterTest` (`test.functions.ts`, `fromBO`) permettent à la page Tests du back-office d'envoyer chaque email à une adresse donnée. Elles demandent le droit d'interface `tests`, voir [RIGHTS_ROLES.FR.md](RIGHTS_ROLES.FR.md).

## Écarts connus

- Seul un article nouvellement créé déclenche le job newsletter : un article créé inactif n'est pas envoyé quand il est activé plus tard.
- `sendArticleToNewsletterTest` lance le job avec `articleId` alors que le job lit `id`.
- Les corps d'email mélangent du texte traduit et du HTML construit par concaténation de chaînes ; des valeurs comme le nom d'un utilisateur sont insérées sans échappement.
