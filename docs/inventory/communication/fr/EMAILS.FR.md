# E-mails

## Table des matières

- [Comment les e-mails sont envoyés](#comment-les-e-mails-sont-envoyés)
- [E-mails envoyés](#e-mails-envoyés)
- [Contacts de la newsletter](#contacts-de-la-newsletter)
- [Pièges](#pièges)

## Comment les e-mails sont envoyés

Tous les e-mails passent par les e-mails transactionnels de Brevo (voir [Brevo](../../../services/brevo/fr/BREVO.FR.md)). Code : `apps/server/src/services/email.service.ts` (`sendEmail`) et `apps/server/src/cloud/utils/email.utils.cloud.ts` (les constructeurs de messages). Le corps HTML vient de `generateEmailTemplate` dans `apps/server/src/config/emails/index.ts` ; les textes sont traduits côté serveur (`apps/server/src/locales`) dans la langue de l'utilisateur. L'expéditeur par défaut est `ADMIN_EMAIL_SENDER` avec le nom de l'application.

## E-mails envoyés

| E-mail | Constructeur | Envoyé depuis | Destinataire |
|---|---|---|---|
| Code de vérification du compte | `sendEmailVerification` | Cloud Function `sendVerificationCode` et le flux de création d'utilisateur | Le nouvel utilisateur |
| Code de réinitialisation du mot de passe | `sendEmailResetPassword` | Cloud Function `sendResetPasswordVerificationCode` | L'utilisateur |
| Message libre depuis le back-office | `sendEmailToUser` | Cloud Function `sendEmailToUser` | Un utilisateur choisi par un admin |
| Nouvel article | `sendArticleToNewsletterEmails` | Job `sendArticleToNewsletterJob`, lancé quand un article est enregistré | Les abonnés actifs de la newsletter, avec un lien de désinscription |

Les fonctions de test `sendVerificationCodeTest`, `sendResetPasswordVerificationCodeTest` et `sendArticleToNewsletterTest` envoient les mêmes e-mails pour vérification.

## Contacts de la newsletter

À chaque nouvel abonnement `Newsletter`, `createContactToCloudJob` crée le contact dans Brevo (`createContactEmail`), avec les attributs `FIRSTNAME` et `LASTNAME` créés une seule fois au premier usage. Un nouveau `Contact` (formulaire de contact) crée aussi un contact Brevo dans `afterSave` (son `name` sert de nom de famille, son id d'identifiant externe).

## Pièges

- Aucun e-mail n'est envoyé au propriétaire du site à l'envoi du formulaire de contact : le message est seulement stocké dans `Contact` et affiché dans le back-office.
- `SENDER_EMAIL` est dans `apps/web/.env.example` mais n'est lu par aucun code de `apps/web`.
- `sendEmail` relance les erreurs Brevo alors que `createContactEmail` ne fait que les journaliser.
