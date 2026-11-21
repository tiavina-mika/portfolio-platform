# Dette — Revue complète du site public (`apps/web`)

> Revue : [261121-review-web.FR.md](../261121-review-web.FR.md)
> Périmètre : `apps/web` · Créée le 2026-11-21 à 03:10 · Auteur : `tiavinamika@gmail.com`
> Statut global : ⏳ à faire

Chaque point ci-dessous existait avant la revue.

## Table des matières

- [Résumé](#résumé)
- [1. Les recherches échouées sont mises en cache pendant des minutes ou des heures](#1-les-recherches-échouées-sont-mises-en-cache-pendant-des-minutes-ou-des-heures)
- [2. La recherche du site est lourde et sans limite](#2-la-recherche-du-site-est-lourde-et-sans-limite)
- [3. La désinscription se fait dès que le lien est ouvert](#3-la-désinscription-se-fait-dès-que-le-lien-est-ouvert)
- [4. Les compteurs et les actions de la newsletter sans limite par visiteur](#4-les-compteurs-et-les-actions-de-la-newsletter-sans-limite-par-visiteur)
- [5. Pas de Content Security Policy et CORS ouvert à tous les sites](#5-pas-de-content-security-policy-et-cors-ouvert-à-tous-les-sites)
- [6. Les fichiers de requêtes marqués use server exposent tous leurs exports](#6-les-fichiers-de-requêtes-marqués-use-server-exposent-tous-leurs-exports)
- [7. Code mort resté dans le site](#7-code-mort-resté-dans-le-site)
- [8. Documentation périmée ou mal placée](#8-documentation-périmée-ou-mal-placée)
- [9. Trous de couverture des tests et accessibilité](#9-trous-de-couverture-des-tests-et-accessibilité)
- [10. Une variable obligatoire ne sert à aucun code actif](#10-une-variable-obligatoire-ne-sert-à-aucun-code-actif)

## Résumé

| # | Gravité | Type | Risque | Statut |
|---|---|---|---|---|
| 1 | 🟡 Moyenne | Bug | Une requête échouée est mise en cache : un projet ou un article répond « introuvable » jusqu'à une heure | ⏳ à faire |
| 2 | 🟡 Moyenne | Faille | La recherche du site n'a pas de limite et parcourt tout le texte des articles et des projets | ⏳ à faire |
| 3 | 🟡 Moyenne | Bug | Le lien de désinscription désinscrit sur une simple visite : les scanners de courrier désinscrivent les lecteurs | ⏳ à faire |
| 4 | 🟡 Basse | Faille | Les compteurs et les actions serveur de la newsletter peuvent être appelés sans limite | ⏳ à faire |
| 5 | 🟡 Basse | Faille | Pas de `Content-Security-Policy`, CORS ouvert à toutes les origines | ⏳ à faire |
| 6 | 🟡 Basse | Faille | `use server` en tête des fichiers de requêtes fait de chaque export un point d'entrée public possible (à vérifier) | ⏳ à faire |
| 7 | 🟡 Basse | Maintenance | Environ 12 fichiers et 30 fonctions inutilisés | ⏳ à faire |
| 8 | 🟡 Basse | Docs | `apps/web/CLAUDE.md` est périmé, deux notes sont hors de `docs/` | ⏳ à faire |
| 9 | 🟡 Basse | Tests | Pas de tests unitaires, aucune story pour un container, contrôle d'accessibilité sur `todo` | ⏳ à faire |
| 10 | 🟡 Basse | Maintenance | `REST_API_KEY` est obligatoire mais seul du code mort la lit | ⏳ à faire |

## 1. Les recherches échouées sont mises en cache pendant des minutes ou des heures

- **Gravité** : 🟡 Moyenne · **Type** : Bug · **Statut** : ⏳ à faire
- **Concerné** : `apps/web/server/queries/article.queries.ts`, `project.queries.ts`, `page.queries.ts`, `category.queries.ts`, `app.queries.ts` ; les pages qui les appellent

**Ce qui peut arriver** — Le serveur d'API redémarre ou répond lentement pendant qu'un visiteur ouvre
`/fr/projets/<slug>`. `getProject` attrape l'erreur et *renvoie* `{ error }`. Comme la fonction est
marquée `'use cache'` (`cacheLife('hours')`), cet échec est stocké comme une vraie réponse.
`getCachedProject` le transforme en `null`, la page appelle `notFound()`, et chaque visiteur reçoit un 404
pour ce projet jusqu'à l'expiration de l'entrée, alors que l'API est revenue une seconde plus tard. Les
listes font pareil pendant des minutes (`getArticles`, `getProjects` : `{ error }` est mis en cache, puis
`ProjectsData` le lance).

**Pourquoi** — Dans une fonction `'use cache'`, seule une erreur lancée n'est pas stockée. Les fonctions
ont été écrites pour renvoyer des objets `IServerResponse`, que le cache ne distingue pas d'un succès.

**Comment vérifier** — Arrêter le serveur, ouvrir la page d'un projet qui n'est pas encore en cache,
relancer le serveur, recharger dans l'heure : la page est toujours un 404. En dev, écrire un log dans le
`catch` de `getProject` pour voir que la deuxième requête n'y passe pas.

**Comment corriger**

1. **(recommandé)** Laisser l'erreur sortir de la fonction en cache et l'attraper un niveau plus haut,
   dans un petit enrobage sans cache (`getProject` lance ; la page attrape et décide entre 404 et
   barrière d'erreur).
   *Pourquoi* : c'est la façon documentée de ne pas mettre un échec en cache, il n'y a qu'une source de
   vérité, et les pages savent déjà afficher une erreur (`error.tsx` existe sur les routes de liste et de
   détail). Cela oblige à toucher les appelants d'environ 20 fonctions, un par un.
2. Garder la forme `{ error }` mais donner à une réponse échouée une durée de cache très courte. Plus
   petit changement, mais à vérifier d'abord : on n'est pas sûr que la durée de cache puisse être choisie
   après l'exécution de l'appel.
3. Retirer `'use cache'` des pages de détail et ne compter que sur le rafraîchissement par étiquette.
   Simple, mais chaque visite rappelle l'API.

## 2. La recherche du site est lourde et sans limite

- **Gravité** : 🟡 Moyenne · **Type** : Faille / Performance · **Statut** : ⏳ à faire
- **Concerné** : `apps/web/server/mutations/search.mutation.ts`, `apps/web/hooks/useSiteSearch.ts`

**Ce qui peut arriver** — `searchData` est une action serveur publique. À chaque recherche, elle construit,
par collection (`Article`, `Project`), une requête qui combine en OU une expression régulière non ancrée,
insensible à la casse, sur `title`, `tags`, `description` et `content` pour chaque langue (jusqu'à 16
parcours de texte), et récupère des documents entiers (pas de `select`). Un script qui poste des recherches
en boucle coûte un parcours complet à la base à chaque fois, et rien ne l'arrête : les formulaires ont une
limite par visiteur, la recherche n'en a aucune.

**Pourquoi** — Une expression régulière sur un champ texte ne peut pas utiliser d'index. La recherche a été
écrite sans la limite des formulaires (`createVisitorRateLimit`) et le client ne vérifie que la longueur du
texte. Le serveur accepte 2 lettres alors que le client en envoie 3 (`MIN_SEARCH_LENGTH`).

**Comment vérifier** — Appeler `searchData` 100 fois de suite avec des mots différents et regarder la charge
de la base ; ou lire le profileur Mongo pour le `$or` de `matches`.

**Comment corriger**

1. **(recommandé)** Ajouter une limite par visiteur avec l'outil existant (`createVisitorRateLimit`, dans
   la même famille de fichiers que `formRateLimit.server.ts`, par exemple 30 recherches par minute),
   aligner le minimum du serveur sur celui du client (3), et ajouter un `.select` limité à
   `translated.<locale>.title` et `slug`.
   *Pourquoi* : trois petits changements, aucune nouvelle infrastructure, le gain en coût et en sécurité
   est immédiat.
2. Remplacer le parcours par expression régulière par un index texte Mongo sur les champs traduits et une
   requête `$text`. Plus rapide et classé, mais cela demande une décision de schéma (un index par langue)
   et un changement serveur : c'est une tâche à part.
3. Retirer la recherche du site public. Supprime le risque, supprime une fonctionnalité.

## 3. La désinscription se fait dès que le lien est ouvert

- **Gravité** : 🟡 Moyenne · **Type** : Bug · **Statut** : ⏳ à faire
- **Concerné** : `apps/web/app/[locale]/newsletter/[encryptedEmail]/unsubscribe/page.tsx`, `apps/server/src/cloud/functions/_core/app.functions.ts` (`unsubscribeNewsletter`)

**Ce qui peut arriver** — Un lecteur reçoit une newsletter. Son fournisseur de courrier (ou un scanner de
sécurité d'entreprise) ouvre chaque lien du message pour le vérifier. La page s'affiche, appelle
`unsubscribeNewsletter`, la ligne passe à `active: false` et l'e-mail « vous êtes désinscrit » part. Le
lecteur n'a jamais choisi de partir. Un lien mal formé fait aussi planter la page (le `decrypt` échoue dans
le rendu) et affiche la page d'erreur générale au lieu de « introuvable ».

**Pourquoi** — Le changement d'état est fait pendant l'affichage d'une page atteinte par `GET`. La même
page propose ensuite un bouton « se réabonner » : le produit considère donc déjà la désinscription comme
annulable.

**Comment vérifier** — Faire un `curl` sur l'adresse de désinscription d'une adresse de test, puis regarder
la ligne `Newsletter`.

**Comment corriger**

1. **(recommandé)** La page vérifie seulement que le lien est valide (une nouvelle fonction en lecture
   seule, ou `unsubscribeNewsletter` avec un `dryRun`), affiche un bouton « Confirmer la désinscription »,
   et le bouton appelle la fonction existante par une action serveur. Attraper l'erreur de `decrypt` et
   appeler `notFound()`.
   *Pourquoi* : c'est ce que recommandent les fournisseurs de courrier pour les parcours en un clic et cela
   supprime la surprise ; coût : un clic de plus pour un vrai lecteur, un changement serveur et un petit
   changement de page, dans les deux apps.
2. Garder la désinscription immédiate mais ignorer les scanners connus (user agents). Fragile : les
   scanners changent.
3. Laisser tel quel et accepter les fausses désinscriptions. Le bouton de réabonnement limite les dégâts,
   mais le lecteur ne sait pas pourquoi il ne reçoit plus rien.

## 4. Les compteurs et les actions de la newsletter sans limite par visiteur

- **Gravité** : 🟡 Basse · **Type** : Faille · **Statut** : ⏳ à faire
- **Concerné** : `apps/web/server/mutations/app.mutation.ts` (`incrementShareCountBySocial`, `incrementArticleViewCount`), `apps/web/server/mutations/newsletter.mutation.ts` (`resubscribeToNewsletter`, `addReasonToUnsubscribeToTheNewsletter`), `apps/web/containers/articles/ArticleViewTracker.tsx`

**Ce qui peut arriver** — Le « une fois par session » du compteur de vues n'existe que dans le navigateur
(`sessionStorage`). Un script appelle `incrementArticleViewCount` avec l'identifiant d'un article publié en
boucle et le nombre de vues grandit sans borne ; pareil pour les compteurs de partage (le serveur n'accepte
que des articles et des pages et une liste fixe de réseaux, rien d'autre ne peut être écrit). Les actions
de la newsletter demandent une adresse chiffrée valide : le risque est faible, mais elles peuvent être
rejouées.

**Pourquoi** — Seules les actions de contact et d'inscription appellent `assertNotLimited`.

**Comment vérifier** — Appeler l'action 50 fois avec le même identifiant et lire `views` sur l'article.

**Comment corriger**

1. **(recommandé)** Donner aux compteurs et aux actions de la newsletter leur propre
   `createVisitorRateLimit` (par exemple 60 par heure pour le compteur de vues, 30 pour les partages, 10
   pour les actions de la newsletter) dans `formRateLimit.server.ts`, et un `assert…Allowed` pour chacun.
   *Pourquoi* : même modèle que les formulaires, aucun changement serveur, coût borné.
2. Déplacer le « une fois par visiteur » côté serveur, avec une clé de courte durée par adresse et par
   article dans Redis. Exact, mais plus d'infrastructure pour un chiffre de vanité.
3. Accepter : les chiffres ne servent qu'à l'affichage. Le moins cher, mais le chiffre n'est pas fiable.

## 5. Pas de Content Security Policy et CORS ouvert à tous les sites

- **Gravité** : 🟡 Basse · **Type** : Faille · **Statut** : ⏳ à faire
- **Concerné** : `apps/web/next.config.mjs` (`headers`), `apps/web/server.js` (`app.use(cors())`)

**Ce qui peut arriver** — Le site envoie `nosniff`, `Referrer-Policy`, `Permissions-Policy` et HSTS, mais
pas de `Content-Security-Policy`. Si un script arrive un jour sur une page (un tiers compromis, du texte
riche venu du back-office), le navigateur ne l'arrête pas. Le serveur Express répond aussi à toutes les
requêtes, y compris les routes du site, avec `Access-Control-Allow-Origin: *`.

**Pourquoi** — La politique demande la liste exacte de ce que le site charge (Google reCAPTCHA, Google
Analytics, Sentry, images Cloudinary, polices) et n'a jamais été écrite ; `cors()` a été ajouté pour le
ping local de l'API.

**Comment vérifier** — `curl -I` sur la page d'accueil pour chercher l'en-tête ; envoyer une requête avec
un en-tête `Origin` vers `/en/blog` et lire la réponse.

**Comment corriger**

1. **(recommandé)** Ajouter d'abord un en-tête `Content-Security-Policy-Report-Only` (avec les hôtes
   autorisés et un nonce pour les scripts en ligne de Next.js), surveiller Sentry pendant une semaine,
   puis le passer en mode bloquant ; limiter `cors()` à la route `/api/ping`.
   *Pourquoi* : le mode rapport montre ce qui casserait sans risque pour les visiteurs ; cela demande un
   test manuel dans un navigateur, c'est pourquoi ce n'était pas fait dans la revue.
2. Ajouter tout de suite une politique bloquante. Plus rapide, mais un hôte oublié casse reCAPTCHA ou les
   statistiques.
3. Laisser. Les éditeurs sont de confiance et le texte riche est rendu par un analyseur, mais il n'y a pas
   de seconde ligne de défense.

## 6. Les fichiers de requêtes marqués use server exposent tous leurs exports

- **Gravité** : 🟡 Basse · **Type** : Faille (à vérifier) · **Statut** : ⏳ à faire
- **Concerné** : `apps/web/server/queries/article.queries.ts`, `project.queries.ts` ; `apps/web/server/mutations/app.mutation.ts` (`saveUserLanguage`)

**Ce qui peut arriver** — Un fichier `'use server'` transforme chaque fonction asynchrone exportée en
fonction serveur qu'un navigateur peut appeler par POST dès qu'il a l'identifiant. Next.js ne garde que
celles qu'un composant client atteint : aujourd'hui, les fonctions de requêtes ne sont probablement pas
appelables. Si un jour un composant client en importe une, `getArticles` / `getProjects` accepteraient un
`limit` de n'importe quelle taille venu de l'appelant. `saveUserLanguage` est exportée et utilisée nulle
part.

**Pourquoi** — La directive a été mise en tête de fichiers qui ne sont lus que par des composants serveur,
où elle n'est pas nécessaire (`'use cache'` suffit et se pose par fonction).

**Comment vérifier** — Sur un build de production, lire `.next/server/server-reference-manifest.json` et
chercher les fonctions de requêtes.

**Comment corriger**

1. **(recommandé)** Retirer le `'use server'` de tête des deux fichiers de requêtes (des requêtes ne sont
   pas des actions) et supprimer `saveUserLanguage` jusqu'à l'arrivée de la connexion. Vérifier que le
   build et les pages fonctionnent toujours.
   *Pourquoi* : surface minimale, et la directive cesse de mentir sur ce que sont les fichiers.
2. Garder la directive et plafonner `limit` dans les fonctions. Protège la valeur, pas l'exposition.

## 7. Code mort resté dans le site

- **Gravité** : 🟡 Basse · **Type** : Maintenance · **Statut** : ⏳ à faire
- **Concerné** : `apps/web/components`, `hooks`, `utils`, `server`

**Ce qui peut arriver** — Rien ne casse, mais chaque futur lecteur le paie et la règle du projet « pas de
code orphelin » n'est pas respectée. Non utilisés en dehors de leur propre fichier, trouvés en cherchant
chaque import :

- Composants : `components/animation/CountUp.tsx`, `components/animation/RevealOnView.tsx`,
  `components/Avatar.tsx`, `components/DropdownMenu.tsx` (et le `ui/DropdownMenu.tsx` qu'il est seul à
  utiliser), `components/forms/fields/CheckboxField.tsx`, `components/IntlMessage.tsx`,
  `components/UnknownError.tsx`, `components/ui/Badge.tsx`, `components/ui/Command.tsx`,
  `components/ui/Popover.tsx`.
- Hooks : `hooks/useDevice.ts`, `hooks/useRevealOnView.ts`.
- `utils/file.utils.ts` (650 lignes d'utilitaires d'envoi copiés du back-office, seuls les utilitaires de
  types MIME servent) et `config/http.ts` que seul ce fichier importe.
- Fonctions : `setValue`, `setValues`, `setFormDataValues`, `createMockParseObject` dans `parse.utils.ts` ;
  `formatRideDay`, `formatRideTime` dans `date.utils.ts` (des mots d'un autre projet) ; `mergeHeaders`,
  `getLocaleByPathname`, `getAllTranslatedUrls` dans `next.utils.ts` ; `goToArticlesByCategory` ;
  `getNameInitials` ; `isCleanedString`, `isServerActionLoading`, `hasServerActionFailed`, `unSlugify`,
  `getAnimationProps`, `unwrapParagraphs` dans `utils.ts` ; `getPaginatedPages`, `getExistingPageSlugs` ;
  les constantes `DISABLE_USER_ACCOUNT_CONFIRMATION`, `EMAIL`, `PHONE`, `OPTIMIZED_IMAGE_HOSTNAMES` ; et
  environ 40 types exportés.

**Pourquoi** — L'app est partie d'un autre projet et d'un modèle ; le reste n'a jamais été enlevé.

**Comment vérifier** — `pnpm nx run web:depcheck` pour les paquets, et une recherche de chaque nom
ci-dessus.

**Comment corriger**

1. **(recommandé)** Supprimer en un seul changement, groupe par groupe, en lançant la vérification des
   types et le lint après chaque groupe (quelques-uns peuvent servir à une story ou à un import dynamique ;
   la recherche a inclus `stories/`).
   *Pourquoi* : git garde l'historique, et `engineering-principles.md` le demande.
2. Déplacer ceux gardés « pour plus tard » vers `docs/code/todo/` et supprimer le reste. Seulement si l'un
   d'eux est vraiment prévu.

## 8. Documentation périmée ou mal placée

- **Gravité** : 🟡 Basse · **Type** : Docs · **Statut** : ⏳ à faire
- **Concerné** : `apps/web/CLAUDE.md`, `apps/web/docs/NOTE.md`, `apps/web/docs/Upgrade.md`

**Ce qui peut arriver** — Un nouveau développeur suit la mauvaise carte :

- `apps/web/CLAUDE.md` liste une route `download-cv` dans `app/api/` (le CV est téléchargé depuis le
  serveur d'API, `/download/cv.pdf`) et dit que les traductions existent en `en, fr, mg` (le site n'a que
  `fr` et `en`).
- `apps/web/docs/NOTE.md` et `Upgrade.md` vivent dans l'app, où les règles du projet ne veulent pas de
  documents, ne sont pas dans `docs/`, n'ont pas de table des matières, et `NOTE.md` contient d'anciennes
  adresses d'hébergement et des notes sur `next-auth` que le site n'utilise plus.

**Pourquoi** — Écrits avant la réduction des routes et des langues.

**Comment vérifier** — `ls apps/web/app/api` et `apps/web/translations`.

**Comment corriger**

1. **(recommandé)** Corriger `apps/web/CLAUDE.md` (liste des routes, langues), déplacer ce qui est encore
   vrai de `NOTE.md` et `Upgrade.md` dans `docs/code/` (jumeaux anglais et français avec table des
   matières) et supprimer les originaux.
   *Pourquoi* : un seul endroit pour les documents, et la vérification des jumeaux les couvre.
2. Supprimer les deux notes sans rien déplacer. Plus rapide, mais les notes de mise à jour peuvent encore
   servir.

## 9. Trous de couverture des tests et accessibilité

- **Gravité** : 🟡 Basse · **Type** : Tests · **Statut** : ⏳ à faire
- **Concerné** : `apps/web/stories`, `apps/web/vitest.config.ts`, `apps/web/.storybook/preview.tsx`

**Ce qui peut arriver** — Une modification d'une fonction pure (pagination, slugs, JSON-LD, champs
traduits, cartes pour les aperçus de liens) ou d'un container n'est pas détectée. Les seuls tests sont les
stories Storybook : 18 fichiers de stories pour 86 composants et 77 containers, aucun pour un container. La
vérification d'accessibilité tourne avec `test: 'todo'` : elle signale sans faire échouer. Les cinq
corrections de la revue n'ont pas de test parce qu'il n'y a pas d'endroit où le mettre.

**Pourquoi** — Le seul projet Vitest est `storybook`.

**Comment vérifier** — `find apps/web -name "*.test.*"` ne trouve rien.

**Comment corriger**

1. **(recommandé)** Ajouter un deuxième projet Vitest (`unit`, environnement Node) pour les fonctions pures
   de `utils/` et `validations/`, en commençant par les cinq de la revue, comme tâche à part
   (`engineering-principles.md` demande de ne pas inventer un lanceur dans une tâche sans rapport). Puis
   ajouter des stories pour les containers qui n'ont que des props (cartes, formulaires) et vider la dette
   d'accessibilité règle par règle avant de passer `test` à `'error'`.
   *Pourquoi* : les fonctions pures sont les tests les moins chers et les plus utiles ici.
2. Seulement étendre les stories. Couvre l'affichage, pas la logique.

## 10. Une variable obligatoire ne sert à aucun code actif

- **Gravité** : 🟡 Basse · **Type** : Maintenance · **Statut** : ⏳ à faire
- **Concerné** : `apps/web/env.ts`, `apps/web/.env.example`, `apps/web/config/http.ts`, `apps/web/.storybook/storybook-env.ts`, `docs/inventory/README.md`

**Ce qui peut arriver** — `REST_API_KEY` doit être définie pour que le site démarre (`z.string()`), mais
le seul lecteur est `config/http.ts`, que seul le `file.utils.ts` mort importe. Un nouvel environnement se
voit demander une valeur qui ne sert à rien, et c'est une clé du serveur.

**Pourquoi** — Reste du code qui envoyait des fichiers directement au serveur (voir le point 7).

**Comment vérifier** — Chercher `REST_API_KEY` dans `apps/web` en dehors de `env.ts`.

**Comment corriger**

1. **(recommandé)** Après le point 7, retirer la variable de `env.ts`, `.env.example`,
   `.storybook/storybook-env.ts` et du tableau de l'inventaire, et prévenir ceux qui déploient le site
   qu'elle peut être supprimée.
   *Pourquoi* : un secret de moins à porter, et la règle d'inventaire demande la mise à jour dans le même
   changement.
2. La passer en `optional()` et la garder. Supprime l'échec au démarrage, garde une variable inutile.
