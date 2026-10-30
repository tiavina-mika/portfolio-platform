# Gestion des erreurs

## Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Serveur](#serveur)
  - [Cloud Functions et triggers](#cloud-functions-et-triggers)
  - [Validation](#validation)
  - [Messages traduits](#messages-traduits)
  - [Routes Express](#routes-express)
  - [Jobs](#jobs)
  - [Démarrage](#démarrage)
  - [Journalisation](#journalisation)
- [Back-office](#back-office)
- [Site public](#site-public)
- [Écarts connus](#écarts-connus)

## Vue d'ensemble

Le serveur lève des `Error` simples dont le message est destiné à être montré à une personne. Un message est soit déjà traduit par le serveur, soit une clé de traduction (`namespace:chemin`) que le client traduit. Chaque client transforme ce qu'il reçoit en quelque chose de lisible : le back-office le met dans un slice Redux d'erreur affiché dans un snackbar, le site le renvoie depuis une server action.

## Serveur

### Cloud Functions et triggers

Chaque Cloud Function et chaque trigger est enveloppé dans `parseFunction` (`apps/server/src/cloud/utils/_core/utils.cloud.ts`). Elle journalise le début et la fin de l'appel avec l'id de l'objet, l'id de l'utilisateur et l'IP du client, et en cas d'échec journalise l'erreur et rejette avec `new Error(message)` : le client reçoit le message, pas une pile d'appels. Une fonction qui ne renvoie rien renvoie `'ok'`. `fromBO` ajoute par-dessus le contrôle « doit être connecté », voir [RIGHTS_ROLES.FR.md](RIGHTS_ROLES.FR.md).

Les erreurs métier sont levées avec un message de l'une de ces deux formes :

```ts
throw new Error('user:errors.userNotFound');            // clé, traduite par le client
throw new Error(translate('user.noAccountByEmail', locale)); // déjà traduit par le serveur
```

Les fonctions qui ne doivent pas faire échouer le client renvoient `false` plutôt que de lever une erreur quand un élément manque (`getArticle`, `getUserByEmail`), car un résultat `undefined` serait sérialisé comme un succès.

### Validation

- Paramètres des Cloud Functions : `parseFunctionValidation(schema)` est passé comme validateur de `Parse.Cloud.define`. Il exécute `safeParse` sur `request.params` et lève le message de la première erreur Zod. Un schéma peut être une fonction de la locale (`params.locale`, défaut `fr`) pour que ses messages soient traduits.
- Enregistrements d'objets : `parseTriggerValidation(schema)` valide `object.toJSON()` dans `beforeSave` (utilisé pour `Contact`) ; `signupTriggerValidation()` choisit le schéma d'inscription BO ou public pour la création de `_User`.
- Les schémas sont dans `apps/server/src/validations/`.

### Messages traduits

`translate(key, locale)` (`apps/server/src/config/i18n/index.ts`) lit `apps/server/src/config/i18n/locales/{fr,en,mg}/_core/common.json` via i18next avec `fr` en repli. La locale atteint les triggers par le contexte d'enregistrement (`context: { locale }`, posé par le site pour `Contact`) et les Cloud Functions par le paramètre `locale`. Les clés avec préfixe de namespace comme `user:errors.accessDenied` ne sont pas dans les fichiers du serveur : ce sont les clés du back-office.

### Routes Express

Hors Parse :

- `validateApiInput` (`middlewares/validation.middleware.ts`) valide corps, requête et paramètres avec Zod et répond `400 { error: 'Invalid data', details: [{ message, key }] }`.
- `protectionMiddleware` transmet une `HttpException(400, message)` pour une clé d'API ou une session manquante ou erronée.
- `errorMiddleware` transforme une `HttpException` en `{ message }` avec son statut, mais n'est pas enregistré sur l'app Express (voir [Écarts connus](#écarts-connus)).
- Les contrôleurs comme `uploadFiles` attrapent leurs propres erreurs et les journalisent.

### Jobs

Les jobs (`cloud/jobs/`) attrapent les erreurs, les journalisent avec `logger.info` / `logger.error` et retournent. Le job newsletter attrape aussi l'erreur de chaque abonné pour qu'un email en échec n'arrête pas les autres. Un job lancé avec un paramètre manquant lève une erreur.

### Démarrage

`validateEnv` (`envalid`) contrôle les variables d'environnement obligatoires avant le démarrage de Parse Server et arrête le processus avec la liste des manquantes. Les erreurs de `init()` sont attrapées et journalisées.

### Journalisation

`logger` (`apps/server/src/utils/logger.ts`) est un logger Winston avec des fichiers à rotation quotidienne sous `src/logs/debug` et `src/logs/error` (le dossier `logs` est ignoré par git). `parseFunction` écrit aussi dans la console.

## Back-office

- Les thunks sont créés via `actionWithLoader` (`apps/bo/src/redux/actions/_core/util.action.ts`). Il démarre et arrête un indicateur de chargement (global ou local), contrôle les droits optionnels `collection` / `action` / `uiRight`, et attrape toute erreur levée : le message passe par `translatedError` et est stocké avec `setErrorSlice`. `SnackBars.tsx` affiche l'erreur et l'efface à la fermeture.
- `translatedError` : quand le message contient `:`, il est traité comme une clé i18next et traduit (`user:errors.userNotFound`), sinon affiché tel quel. C'est pourquoi les clés du serveur portent le namespace du BO.
- Les codes d'erreur Parse sont gérés là où ils comptent : l'inscription associe le code 202 à « compte déjà existant » et 142 au message du serveur ; la connexion associe 141 au parcours de vérification quand la confirmation est activée.
- Les loaders de routes utilisent `onEnterActionWithLoader`, qui transforme l'interne `Errors.notFound` en `notFound()` de TanStack Router (page 404) et `Errors.redirect` en `redirect()`. TanStack Router ne peut pas les attraper dans l'enveloppe générique, donc les loaders n'utilisent pas `actionWithLoader`.
- `checkSession` traite une session invalide en vidant l'utilisateur local et en affichant `common:errors.badSession`.
- Les messages de validation des formulaires viennent des schémas Zod de `src/validations/`, traduits via `zod-i18n.ts` et le namespace `zod`, voir [I18N.FR.md](I18N.FR.md).

## Site public

- Les lectures (`apps/web/server/queries`) attrapent l'erreur et renvoient `{ error: message }` ; le type `IServerResponse<T>` est `T | IError`, et la page décide quoi afficher.
- Les écritures sont des server actions construites sur `next-safe-action` (`apps/web/config/safeAction.ts`). `handleServerError` renvoie, dans cet ordre : le message d'une `ActionError` tel quel ; pour une `Parse.Error`, la traduction `ServerError.<message>` quand le message est une clé, le message lui-même quand c'est une phrase, ou `ServerError.somethingWentWrong` ; pour tout le reste, une traduction `ServerError` correspondante ou le message par défaut de la bibliothèque.
- La validation de formulaire côté client utilise react-hook-form et Zod avec des messages des namespaces `zod` et `Form` de `next-intl`.
- `components/ErrorBoundary.tsx` est l'écran d'erreur (« quelque chose s'est mal passé », réessayer, contact), branché via le `error.tsx` d'une route. Seul `app/[locale]/sitemap/error.tsx` existe aujourd'hui. Les routes avec données ont un squelette `loading.tsx`, et `app/[locale]/not-found.tsx` rend la page 404.

## Écarts connus

- `errorMiddleware` n'est jamais enregistré avec `app.use(...)` dans `apps/server/src/index.ts`.
- Le middleware des server actions du web journalise l'entrée du client et le résultat de l'action avec `console.log` à chaque appel.
- Une seule route du site a un `error.tsx` ; les autres s'appuient sur la page d'erreur par défaut de Next.js.
- `parseFunction` renvoie `Promise.reject(new Error(message))` : le code d'erreur Parse d'origine est perdu, les clients ne peuvent donc se baser que sur le message.
