# Brevo

## Table des matières

- [À quoi il sert](#à-quoi-il-sert)
- [Où est le code](#où-est-le-code)
- [Variables](#variables)
- [Mise en place](#mise-en-place)
- [Pièges](#pièges)

## À quoi il sert

Brevo (anciennement Sendinblue) envoie les e-mails transactionnels de la plateforme et garde la liste de contacts des abonnés à la newsletter et des expéditeurs du formulaire de contact. Les e-mails eux-mêmes sont listés dans [e-mails](../../../inventory/communication/fr/EMAILS.FR.md).

## Où est le code

- `apps/server/src/services/email.service.ts` : client Brevo (`@getbrevo/brevo`, singleton), `sendEmail`, `createContactEmail`, `getContacts`.
- `apps/server/src/cloud/utils/email.utils.cloud.ts` : constructeurs de messages.
- `apps/server/src/cloud/jobs/email.jobs.ts` et `newsletter.jobs.ts` : création asynchrone des contacts et envoi de la newsletter.

Seul `apps/server` parle à Brevo ; `web` et `bo` passent par des Cloud Functions.

## Variables

| Variable | App | Rôle |
|---|---|---|
| `BREVO_API_KEY` | server | Clé d'API (requise au démarrage par `validateEnv`) |
| `ADMIN_EMAIL_SENDER` | server | Adresse d'expéditeur par défaut |
| `AGENCY_BREVO_API_KEY` | server | Facultatif : clé d'API du compte Brevo de l'agence (Aldaron). Non définie, la clé du portfolio sert |
| `AGENCY_ADMIN_EMAIL_SENDER` | server | Facultatif : adresse d'expéditeur vérifiée dans le compte Brevo de l'agence. À définir avec `AGENCY_BREVO_API_KEY` |
| `VITE_ADMIN_EMAIL_SENDER` | bo | Adresse d'expéditeur affichée aux admins (exposée dans le bundle navigateur, pas un secret) |

## Mise en place

1. Créer un compte Brevo et générer une clé d'API (réglages SMTP et API).
2. Valider l'expéditeur : l'adresse de `ADMIN_EMAIL_SENDER` doit être un expéditeur (ou domaine) vérifié dans Brevo, sinon les envois sont refusés. Idem pour `AGENCY_ADMIN_EMAIL_SENDER` dans le compte propre de l'agence.
3. Poser les variables dans `apps/server/.env.preprod` (local) ou sur l'hébergeur.
4. Démarrer le serveur et s'abonner une fois à la newsletter : les attributs de contact `FIRSTNAME` et `LASTNAME` sont créés au premier usage.

## Pièges

- L'agence a son propre compte Brevo : un e-mail vers un compte qui n'a que l'espace agence, et le contact créé pour lui, passent par `AGENCY_BREVO_API_KEY` et `AGENCY_ADMIN_EMAIL_SENDER`. Tout le reste (formulaires du site, newsletter, comptes portfolio) utilise ceux du portfolio.
- La clé d'API doit être une clé API v3 (elle commence par `xkeysib-`) ; une clé SMTP (`xsmtpsib-`) est refusée par l'API.
- Les échecs de création de contact sont seulement journalisés (le parcours utilisateur continue) ; les échecs de `sendEmail` sont relancés.
- Le plan gratuit a une limite d'envois par jour : une newsletter à beaucoup d'abonnés peut être coupée.
- Les commentaires du code citent les listes Brevo 2 et 5 ; la liste utilisée est celle configurée dans le compte Brevo, à vérifier là-bas.
