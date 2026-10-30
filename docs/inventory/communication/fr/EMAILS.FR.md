# E-mails

## Table des matières

- [Comment les e-mails sont envoyés](#comment-les-e-mails-sont-envoyés)
- [E-mails envoyés](#e-mails-envoyés)
- [Contacts de la newsletter](#contacts-de-la-newsletter)
- [Pièges](#pièges)

## Comment les e-mails sont envoyés

Tous les e-mails passent par les e-mails transactionnels de Brevo (voir [Brevo](../../../services/brevo/fr/BREVO.FR.md)). Code : `apps/server/src/services/email.service.ts` (`sendEmail`) et `apps/server/src/cloud/utils/_core/email.utils.cloud.ts` (les constructeurs de messages). Le corps HTML vient de `generateEmailTemplate` dans `apps/server/src/config/emails/index.ts` et `apps/server/src/emails/templates/` ; les textes sont traduits côté serveur (`apps/server/src/config/i18n/locales`) dans la langue de l'utilisateur. L'expéditeur par défaut est `ADMIN_EMAIL_SENDER` avec le nom de l'application.

## E-mails envoyés

| E-mail | Constructeur | Envoyé depuis | Destinataire |
|---|---|---|---|
| Code de vérification du compte | `sendEmailVerification` (`sendVerificationCodeToEmail`) | Cloud Functions `sendVerificationCode`, flux `verifyAccount` et création d'utilisateur | Le nouvel utilisateur |
| Code de réinitialisation du mot de passe | `sendEmailResetPassword` | Cloud Function `sendResetPasswordVerificationCode` | L'utilisateur |
| Invitation au back-office | `sendInvitationEmail` | Cloud Function `sendBOInvitation`, et l'invitation des owners au démarrage du serveur | La personne invitée |
| Code de vérification renforcée | `sendStepUpVerificationEmail` | Cloud Function `requestStepUpVerification` | L'utilisateur connecté |
| Code de changement de contact | `sendContactChangeVerificationEmail` | Cloud Function `requestContactChange` | L'utilisateur |
| Accusé de réception et réponse à un ticket | `sendTicketAcknowledgementEmail`, `sendTicketReplyEmail` | Formulaire de contact / `sendTicketMessage` | Le visiteur qui a écrit |
| Confirmation de newsletter (double opt-in) | `sendNewsletterConfirmationEmail` | Cloud Function `subscribeToNewsletter` | L'abonné, avec le lien de confirmation |
| Confirmation de désabonnement | `sendNewsletterUnsubscribeConfirmationEmail` | Cloud Function `unsubscribeNewsletter` | L'abonné |
| Nouvel article | `sendArticleToNewsletterEmails` | Job `sendArticleToNewsletterJob`, lancé quand un article est enregistré | Les abonnés actifs de la newsletter, avec un lien de désinscription |
| Message libre et notifications | `sendEmailToUser`, `sendNotificationEmailToUsers` | `sendMessageToUser`, envois et diffusions de notifications | Des utilisateurs choisis par un admin |
| Avis de compte | `sendWelcomeEmail`, `sendAccountReactivatedEmail`, `sendNewDeviceLoginEmail`, `sendPasswordResetDelayedEmail` | Triggers et services d'utilisateur et de connexion | L'utilisateur |
| Alertes à l'équipe | `sendEmailToStaffInTheirOwnLocale` | Signalements, paiements en échec, jobs en échec, grosses opérations d'argent | L'équipe (et Slack quand `SLACK_ALERTS_WEBHOOK_URL` est renseigné) |

Les textes de vérification partent aussi par SMS via MMSDuck (`sendSmsVerification`, SMS de ticket et de nouvel appareil) : en développement et en test ils sont seulement journalisés.

Les fonctions de test (`sendVerificationCodeTest`, `sendResetPasswordVerificationCodeTest`, `sendArticleToNewsletterTest`, `sendInvitationTest`, `sendWelcomeEmailTest`) envoient les mêmes e-mails pour vérification.

## Contacts de la newsletter

À chaque nouvel abonnement `Newsletter`, `createContactToCloudJob` crée le contact dans Brevo (`createContactEmail`), avec les attributs `FIRSTNAME` et `LASTNAME` créés une seule fois au premier usage. Un nouveau `Contact` (formulaire de contact) crée aussi un contact Brevo dans `afterSave` (son `name` sert de nom de famille, son id d'identifiant externe).

## Pièges

- Aucun e-mail n'est envoyé au propriétaire du site à l'envoi du formulaire de contact : le message est stocké dans `Contact` comme un ticket, affiché dans le back-office, et le visiteur reçoit un accusé de réception.
- `sendEmail` relance les erreurs Brevo alors que `createContactEmail` ne fait que les journaliser.
