# Authentification

## Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Sessions](#sessions)
- [Inscription](#inscription)
- [Confirmation de l'email](#confirmation-de-lemail)
- [Connexion et déconnexion](#connexion-et-déconnexion)
- [Réinitialisation du mot de passe](#réinitialisation-du-mot-de-passe)
- [Changement du mot de passe](#changement-du-mot-de-passe)
- [Bannissement et suppression](#bannissement-et-suppression)
- [Routes REST authentifiées](#routes-rest-authentifiées)
- [Secrets concernés](#secrets-concernés)
- [Écarts connus](#écarts-connus)

## Vue d'ensemble

Seul le back-office (`apps/bo`) a des comptes utilisateurs. Le site public (`apps/web`) n'a pas de connexion : il parle à Parse Server comme client anonyme et ne lit jamais de session utilisateur (l'aide `saveUserLanguage` du web est documentée dans son code comme inutilisée tant qu'aucune authentification n'existe).

L'authentification est le mécanisme natif `_User` de Parse (l'email sert de nom d'utilisateur), complété par du Cloud Code dans `apps/server/src/cloud/` :

| Fichier | Rôle |
|---|---|
| `functions/auth.functions.ts` | `verifyAccountEmail`, `sendVerificationCode`, `sendResetPasswordVerificationCode`, `resetPassword` |
| `triggers/user.triggers.ts` | `beforeSave` / `afterSave` / `afterDelete` de `_User` |
| `triggers/auth.triggers.ts` | `beforeLogin`, `afterLogout` |
| `utils/user.utils.cloud.ts` | génération et contrôle du code de vérification, plateformes, bannissements |
| `utils/utils.cloud.ts` | `signupTriggerValidation` et les autres enveloppes de validation |

Le back-office y accède via le SDK JS de Parse (`Parse.User.signUp`, `logIn`, `logOut`, `Parse.Cloud.run`) ; les thunks Redux sont dans `apps/bo/src/redux/actions/auth.action.ts`.

## Sessions

- Une connexion réussie donne un jeton de session Parse, conservé par le SDK Parse dans le stockage du navigateur. Le back-office ne fabrique pas son propre jeton.
- `checkSession` (BO) s'exécute au chargement de l'app : il lit `Parse.User.currentAsync()`, puis vérifie la session avec `Parse.Session.current()`. Une session qui n'existe plus côté serveur vide l'utilisateur local, affiche l'erreur de mauvaise session et déconnecte ; sans utilisateur, le back-office redirige vers la page de connexion.
- L'utilisateur courant est aussi copié dans `localStorage` par `updateUserIntoLocalStorage`, et le slice Redux `settings` (persisté avec redux-persist) garde `isAuthenticated`.
- Côté serveur, le Cloud Code lit l'utilisateur dans `request.user` (jeton de session de l'appel). La route REST `POST /files` le lit dans l'en-tête `X-Parse-Session-Token`, voir [Routes REST authentifiées](#routes-rest-authentifiées).

## Inscription

1. Le formulaire d'inscription du back-office construit un `Parse.User` avec `username = email`, `platform = 'bo'` et `fromBO = true`, puis appelle `signUp()`.
2. `beforeSave(_User)` valide un nouvel utilisateur avec le schéma Zod `getSignUpFromBOSchema` : email valide, `lastName` jusqu'à 112 caractères, `firstName` optionnel jusqu'à 112, mot de passe de 8 à 64 caractères. Les messages d'erreur sont traduits avec la locale transmise dans le contexte de l'enregistrement. Il renseigne ensuite `deleted: false` et la première entrée de `platforms` (`{ name, count: 1, lastConnectedAt }`), et retire le champ auxiliaire `fromBO`.
3. `afterSave(_User)` à la création :
   - en production (`NODE_ENV=production`) : génère le code de vérification, le stocke chiffré sur l'utilisateur, envoie l'email de confirmation et crée le contact dans Brevo (`saveUserAndSendCodeToEmail`) ;
   - dans tout autre environnement : marque directement l'utilisateur `verified: true` ;
   - si l'email figure dans la variable d'environnement `OWNERS_EMAILS`, attribue le rôle `Owner`. La création du rôle propriétaire déclenche celle des autres rôles par défaut, voir [RIGHTS_ROLES.FR.md](RIGHTS_ROLES.FR.md).
4. Le champ temporaire `platform` est retiré après l'enregistrement : `platforms` est la liste conservée.

Un nouvel utilisateur n'a aucun rôle : il ne voit rien dans le back-office tant qu'un rôle ne lui est pas attribué.

## Confirmation de l'email

- Le code a 6 chiffres (`generateNumber(6)`), est stocké chiffré (AES-256-CTR, `encrypt` dans `apps/server/src/utils/encrypt.utils.ts`) dans `verification.code` avec `verification.expiredAt` une heure plus tard. Seule la forme chiffrée est en base ; le code en clair est déchiffré une fois pour être mis dans l'email.
- `verifyAccountEmail({ code, type })` chiffre le code soumis, trouve l'utilisateur portant ce code, le contrôle avec `isValidUserCode` (clés d'erreur `user:errors.incorrectCode` et `user:errors.expiredCode`), retire `verification` et, quand `type` n'est pas `resetPassword`, met `verified: true`. Elle renvoie l'email de l'utilisateur chiffré avec la clé fixe.
- `sendVerificationCode({ email, locale })` régénère et renvoie un code ; elle ne fait rien pour un utilisateur déjà vérifié.
- Toute l'étape peut être désactivée avec `DISABLE_USER_ACCOUNT_CONFIRMATION` dans `apps/server/src/utils/constants.ts`. Elle vaut `true` aujourd'hui : `beforeLogin` ne contrôle alors plus `verified` et ne renvoie pas de code. Le back-office a sa propre constante du même nom dans `apps/bo/src/utils/constants.ts` (voir [Écarts connus](#écarts-connus)).

## Connexion et déconnexion

- Connexion : `Parse.User.logIn(email, password)`, puis `loginSuccess` charge l'utilisateur courant dans Redux (les rôles sont chargés à l'entrée d'une page du tableau de bord) et redirige vers l'accueil. En cas d'échec, le formulaire affiche l'erreur traduite (identifiant ou mot de passe invalide, et quand la confirmation est activée, le code d'erreur 141 envoie l'utilisateur vers la page de vérification).
- `beforeLogin` met `isOnline: true` sur l'utilisateur.
- Quand l'enregistrement d'un utilisateur existant porte le champ `platform`, `beforeSave` incrémente le `count` et le `lastConnectedAt` de cette plateforme dans `platforms` (`getUserPlatforms`).
- Déconnexion : `Parse.User.logOut()`, puis le BO vide son stockage local et son état Redux et redirige vers la page de connexion. `afterLogout` met `isOnline: false`.

## Réinitialisation du mot de passe

1. L'utilisateur saisit son email : `sendResetPasswordVerificationCode({ email, locale })` échoue avec le message traduit `user.noAccountByEmail` si aucun compte ne correspond, sinon enregistre un nouveau code et envoie l'email de réinitialisation.
2. L'utilisateur saisit le code : le BO appelle `verifyAccountEmail` avec `type: 'resetPassword'`, qui ne marque pas le compte comme vérifié et renvoie l'email chiffré ; le BO navigue vers le formulaire de réinitialisation avec celui-ci.
3. `resetPassword` déchiffre l'email (clé fixe, forme hexadécimale sans caractères spéciaux), trouve l'utilisateur non supprimé, définit le nouveau mot de passe et retire `verification`.

## Changement du mot de passe

Un utilisateur connecté définit `password` sur son propre `Parse.User` et l'enregistre (thunk `changePassword`) ; Parse contrôle la session. Le code ne vérifie pas l'ancien mot de passe.

## Bannissement et suppression

- `toggleBanUser` (utilisateurs du back-office uniquement) définit `banned`. Le trigger `afterSave` ajoute alors `{ bannedAt, bannedBy, until }` avec `until` deux jours plus tard ; `unsetBanned` remet `banned` à faux quand tous les bannissements de l'historique sont expirés. Rien dans le chemin de connexion du serveur ne rejette aujourd'hui un utilisateur banni.
- `deleteUser` / `deleteUsers` suppriment logiquement (`deleted: true`, avec `deletedAt` et `deletedBy` renseignés par le trigger) ; `destroyUsers` détruit les utilisateurs déjà supprimés logiquement. Les deux fonctions de masse sont censées exiger un administrateur (voir l'écart sur le contrôle administrateur dans [RIGHTS_ROLES.FR.md](RIGHTS_ROLES.FR.md)).
- `createSessionTokenForAUser` (administrateur uniquement) crée un utilisateur anonyme et un jeton de session pour lui.

## Routes REST authentifiées

Les routes Express hors `/parse` sont :

| Route | Protection |
|---|---|
| `POST /files` | `protectionMiddleware({})` : en-tête `X-portfolio-key` égal à `REST_API_KEY`, et une session Parse valide (en-tête `X-Parse-Session-Token` ou paramètre `sessionToken`), contrôlée avec `getUserForSessionToken` |
| `GET /download/cv.pdf` | publique, paramètres validés par un schéma Zod |
| `GET /migration/pages/category-to-categories` | aucun middleware |
| `GET /ping` | publique, utilisée par un cron pour garder l'hébergeur éveillé |

Le back-office envoie la clé depuis `VITE_REST_API_KEY` (`protectRequest` dans `apps/bo/src/config/http.ts`). Les variables `VITE_*` étant exposées au navigateur, cette clé n'est pas un secret.

## Secrets concernés

Noms uniquement, voir l'inventaire pour la liste complète : `PARSE_APP_ID`, `PARSE_MASTER_KEY`, `REST_API_KEY`, `OWNERS_EMAILS`, et les trois variables de chiffrement `CRYPTO_FIXED_PART_KEY`, `CRYPTO_FIXED_FULL_KEY`, `CRYPTO_IV` (toutes contrôlées au démarrage par `validateEnv`, sauf `OWNERS_EMAILS`).

## Écarts connus

Constatés dans le code, non tranchés ici :

- `DISABLE_USER_ACCOUNT_CONFIRMATION` vaut `true` côté serveur et `false` dans le back-office : le formulaire d'inscription du BO envoie l'utilisateur vers la page de confirmation, mais hors production le serveur a déjà marqué le compte comme vérifié et n'a envoyé aucun code.
- Plusieurs Cloud Functions sont enveloppées par `parseFunction` seulement, donc acceptent n'importe quel appelant (par exemple `getUser`, `getUserByEmail`, `sendEmailToUser`, `getNewUsersCount`, `saveUserLanguage`) ; c'est `fromBO` qui exige un utilisateur connecté. Voir [RIGHTS_ROLES.FR.md](RIGHTS_ROLES.FR.md).
- Un utilisateur banni n'est pas rejeté par le chemin de connexion du serveur.
