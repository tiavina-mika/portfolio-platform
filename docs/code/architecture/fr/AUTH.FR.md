# Authentification

## Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Inscription sur invitation](#inscription-sur-invitation)
- [Codes de vérification](#codes-de-vérification)
- [Connexion, MFA et sessions](#connexion-mfa-et-sessions)
- [Réinitialisation du mot de passe](#réinitialisation-du-mot-de-passe)
- [Actions sensibles](#actions-sensibles)
- [Routes REST authentifiées](#routes-rest-authentifiées)
- [Secrets concernés](#secrets-concernés)
- [Lacunes connues](#lacunes-connues)

## Vue d'ensemble

Seul le back-office (`apps/bo`) a des comptes. Le site public (`apps/web`) n'a pas de connexion et parle à Parse Server en client anonyme. L'authentification est le mécanisme natif Parse `_User` complété par le Cloud Code de `apps/server/src/cloud/` :

| Fichier | Rôle |
|---|---|
| `functions/_core/auth.functions.ts` | `verifyAccount`, `sendVerificationCode`, `sendResetPasswordVerificationCode`, `resetPassword`, `changePassword`, `loginWithEmail`, `loginWithPhone` |
| `functions/_core/invitation.functions.ts` | `sendBOInvitation`, `verifyBOInvitationToken` |
| `functions/_core/mfa.functions.ts` | `generateMfaSecret`, `confirmMfaEnrollment`, `verifyMfaLogin`, `disableMfa`, `regenerateMfaBackupCodes`, `adminResetMfa` |
| `functions/_core/stepUpVerification.functions.ts` | `requestStepUpVerification`, `verifyStepUpCode` |
| `functions/_core/userSession.functions.ts` | sessions par appareil : liste, révocation d'une ou de toutes les autres |
| `triggers/_core/user.triggers.ts`, `auth.triggers.ts` | règles de sauvegarde de `_User`, `beforeLogin`, `afterLogout` |

Le back-office les appelle par le SDK Parse JS ; les thunks sont dans `apps/bo/src/redux/actions/_core/auth.action.ts` et `mfa.action.ts`.

## Inscription sur invitation

Il n'y a pas d'inscription libre. Un administrateur envoie une invitation (`sendBOInvitation`, avec les rôles à donner) ; la personne invitée ouvre le lien (`verifyBOInvitationToken`) et crée son compte. `beforeSave(_User)` vérifie le jeton d'invitation par rapport à l'e-mail (`assertValidInvitationForSignup`) ; les rôles de l'invitation sont donnés une fois l'adresse vérifiée. Les premiers propriétaires sont invités au démarrage depuis `OWNERS_EMAILS`, voir [RIGHTS_ROLES.FR.md](RIGHTS_ROLES.FR.md).

## Codes de vérification

Un code est envoyé par e-mail (ou SMS via MMSDuck) et stocké chiffré avec une expiration ; `verifyAccount` se verrouille après `MAX_VERIFICATION_ATTEMPTS` erreurs jusqu'à la demande d'un nouveau code. Le code d'inscription et le code de réinitialisation ont chacun leur emplacement. Un code ne confirme que le contact auquel il a été envoyé.

## Connexion, MFA et sessions

- `beforeLogin` lève `MFA_REQUIRED` avec un jeton de défi pour un compte qui a la MFA ; le back-office appelle alors `verifyMfaLogin` avec l'authentificateur (TOTP) ou un code de secours pour obtenir la session. Les comptes à privilèges élevés doivent s'enrôler ; un propriétaire peut réinitialiser la MFA d'un administrateur (`adminResetMfa`).
- Une connexion réussie donne un jeton de session Parse conservé par le SDK. `registerSession` enregistre l'appareil ; un nouvel appareil déclenche un e-mail d'alerte. Un utilisateur peut révoquer ses autres sessions, un administrateur celles d'un utilisateur.
- Le back-office déconnecte après inactivité (délai du rôle, ou par défaut).
- L'usurpation d'identité (`impersonateUser`, `endImpersonationSession`) est réservée aux rôles ayant le droit ui `impersonation`, et journalisée.

## Réinitialisation du mot de passe

1. `sendResetPasswordVerificationCode({ email, locale })` envoie un code.
2. `verifyAccount` avec le type réinitialisation le confirme et renvoie un jeton à usage unique dédié (seul son hachage est stocké).
3. `resetPassword` consomme le jeton. Une réinitialisation prouvée par SMS sur un compte inutilisé depuis longtemps est différée, et le membre est alerté (`cancelPasswordResetDelay` l'arrête).

`changePassword` vérifie l'ancien mot de passe.

## Actions sensibles

Les actions à risque (changement de contact, gros mouvements d'argent) demandent un code de vérification renforcée (`requestStepUpVerification`, `verifyStepUpCode`).

## Routes REST authentifiées

| Route | Protection |
|---|---|
| `POST /files` | `protectionMiddleware` : en-tête `X-portfolio-key` égal à `REST_API_KEY`, et session Parse valide |
| `GET /download/...` | publique, requête validée par un schéma Zod |
| `GET /ping` | publique, utilisée par un cron pour garder l'hébergeur éveillé |
| `/docs` | route de documentation du serveur ; l'app de documentation n'est pas portée |

Le back-office envoie la clé depuis `VITE_REST_API_KEY` ; étant une variable `VITE_*`, elle est exposée au navigateur et n'est pas un secret.

## Secrets concernés

Noms seulement, voir [l'inventaire](../../../inventory/README.md) : `PARSE_APP_ID`, `PARSE_MASTER_KEY`, `REST_API_KEY`, `OWNERS_EMAILS`, `CRYPTO_FIXED_PART_KEY`, `CRYPTO_FIXED_FULL_KEY`, `UPSTASH_REDIS_*`, `MMSDUCK_API_KEY`. `validateEnv` les vérifie au démarrage (règles propres aux environnements déployés dans l'inventaire).

## Lacunes connues

- Les bases existantes gardent les anciens noms de rôles, leurs comptes ne sont donc pas reconnus comme de niveau le plus haut tant qu'ils ne sont pas renommés (voir la dette de la revue de la branche).
- `apps/web` garde un helper `saveUserLanguage` inutilisé : le site n'a pas de connexion.
