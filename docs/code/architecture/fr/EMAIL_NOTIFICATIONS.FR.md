# Emails et notifications

## Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Fournisseur et configuration](#fournisseur-et-configuration)
- [Emails envoyés](#emails-envoyés)
- [Newsletter](#newsletter)
- [Notifications dans l'application](#notifications-dans-lapplication)
- [Fonctions de test](#fonctions-de-test)
- [Lacunes connues](#lacunes-connues)

## Vue d'ensemble

Les emails sont des emails transactionnels envoyés par le serveur via [Brevo](https://www.brevo.com). Les textes de vérification peuvent aussi partir par SMS via MMSDuck, et les notifications push via Expo. Les apps `web` et `bo` n'envoient jamais rien : elles appellent une Cloud Function ou enregistrent un objet, et le serveur fait le reste. La liste complète des emails est dans [l'inventaire](../../../inventory/communication/fr/EMAILS.FR.md).

| Fichier | Rôle |
|---|---|
| `apps/server/src/services/email.service.ts` | client Brevo : `sendEmail`, `createContactEmail`, `getContacts` |
| `apps/server/src/cloud/utils/_core/email.utils.cloud.ts` et `cloud/emails/_core/` | un constructeur par email |
| `apps/server/src/emails/templates/` et `config/emails/index.ts` | modèles HTML et mise en page commune (`generateEmailTemplate`) |
| `apps/server/src/config/i18n/locales/{fr,en,mg}/_core/common.json` | textes d'emails traduits |

## Fournisseur et configuration

- `BREVO_API_KEY`, `WEBSITE_URL` et `ADMIN_EMAIL_SENDER` sont requis au démarrage (`validateEnv`). Les liens des emails pointent vers `WEBSITE_URL`.
- Les SMS exigent `MMSDUCK_API_KEY` en `preProduction` et `production` ; en développement ils sont seulement journalisés.
- Les textes sont traduits avec l'i18n du serveur, voir [I18N.FR.md](I18N.FR.md) ; la locale vient du paramètre de la fonction ou du contexte d'enregistrement, `fr` par défaut.
- Une alerte pour l'équipe (signalements, paiements en échec, jobs en échec) part par email vers l'équipe et vers Slack si `SLACK_ALERTS_WEBHOOK_URL` est défini.

## Emails envoyés

Compte (codes de vérification et de réinitialisation, invitation, code de vérification renforcée, changement de contact, bienvenue, nouvel appareil), tickets de support (accusé de réception au visiteur qui a utilisé le formulaire de contact, réponses), newsletter (confirmation, confirmation de désabonnement, nouvel article), notifications et diffusions, alertes pour l'équipe. Constructeurs, déclencheurs et destinataires sont dans la page d'inventaire ci-dessus.

## Newsletter

1. Un visiteur s'abonne sur le site : `subscribeToNewsletter` enregistre une `Newsletter` en attente (`confirmed: false`, `active: false`) et envoie un lien de confirmation (`/newsletter/confirm/<jeton>` ; seul un hachage du jeton est stocké).
2. `confirmNewsletterSubscription` l'active ; le contact est alors créé dans Brevo (`createContactToCloudJob`).
3. L'enregistrement d'un nouvel `Article` lance `sendArticleToNewsletterJob` avec l'id de l'article. Le job n'envoie que si l'article est `active: true` et `deleted: false`, aux abonnés actifs, 20 à la fois, dans la `language` de chaque abonné, avec un lien de désabonnement (`/newsletter/<email chiffré>/unsubscribe`).
4. `unsubscribeNewsletter` met `active: false` et envoie un email de confirmation ; `addReasonToUnsubscribeToTheNewsletter` enregistre le motif. L'échec pour un abonné est journalisé et le job continue.

## Notifications dans l'application

Le back-office a un système de notifications (classe `Notification`, pages de notifications, préférences, renvoi, diffusions avec compteurs de SMS par jour, `notification.jobs.ts`). Les canaux (dans l'app, email, SMS, push) sont enregistrés dans `notification.service.cloud.ts`. Les compteurs de nouveautés du menu viennent de `getObjectsCount`.

## Fonctions de test

`sendVerificationCodeTest`, `sendResetPasswordVerificationCodeTest`, `sendArticleToNewsletterTest`, `sendInvitationTest`, `sendWelcomeEmailTest`, `sendVerificationCodeSmsTest` (`test.functions.ts`) permettent à la page Tests d'envoyer chaque message à une adresse. Elles exigent le droit UI `tests`, voir [RIGHTS_ROLES.FR.md](RIGHTS_ROLES.FR.md).

## Lacunes connues

- Seul un article nouvellement créé lance le job de newsletter : un article créé inactif n'est pas envoyé quand il est activé plus tard.
- `resubscribeNewsletter` met `active: true` directement depuis un lien de désabonnement valide, même pour une adresse jamais confirmée.
- `sendArticleToNewsletterTest` lance le job avec `articleId` alors que le job lit `id`.
- Plusieurs fonctions de test parlent encore de covoiturage (`createRideMock`).
