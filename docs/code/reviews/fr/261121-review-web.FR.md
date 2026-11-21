# Revue — Revue complète du site public (`apps/web`)

- **Périmètre** : toute l'app `apps/web` telle qu'elle est sur `feat/aldaron-web-prototype` (pas de diff : chaque fichier a été lu ou cherché, le code de `apps/server` n'a été lu que là où le site l'appelle)
- **Type** : Revue complète d'une app (état du code, risques, petites corrections)
- **Auteur** : Tiavina Michael Ralainirina — `tiavinamika@gmail.com` *(GitHub : `tiavina-mika`)*
- **Créée** : 2026-11-21 à 03:10
- **Apps touchées** : Site web (corrections seulement) ; Serveur et Back-office lus, non modifiés

## Table des matières

- [En bref](#en-bref)
- [Base de données](#base-de-données)
- [Site web](#site-web)
- [Voir le résultat en local](#voir-le-résultat-en-local)
- [Bugs, régressions et failles possibles](#bugs-régressions-et-failles-possibles)
- [Ce qui reste à faire](#ce-qui-reste-à-faire)

## En bref

C'est une revue de tout le site portfolio, pas d'une seule branche. Le site est en bon état : la
vérification des types et le lint passent, chaque clé de traduction existe en français et en anglais
(`pnpm check-i18n`), les formulaires sont protégés par reCAPTCHA et une limite par visiteur, et le contenu
qu'un visiteur peut voir est toujours filtré sur *actif*, *non supprimé* et *appartient au portfolio*.

La revue a cherché exprès ce qui pouvait mal tourner. Elle a trouvé **cinq petits risques, corrigés
pendant la revue** (un titre écrit dans le back-office pouvait sortir du bloc de données pour les moteurs
de recherche ; la liste des projets pouvait être triée par n'importe quel champ nommé dans l'adresse ; la
route de rafraîchissement du cache comparait son secret d'une façon qui peut le laisser fuir et plantait
sur une requête invalide ; `?page=-3` affichait une page d'erreur ; la recherche du site plantait quand
un résultat n'était écrit que dans l'autre langue), et **dix points laissés pour plus tard**, dont les plus
importants sont qu'une requête échouée est mémorisée par le cache jusqu'à une heure, que la recherche et le
lien de désinscription n'ont aucune protection contre le trafic automatique, et qu'environ 12 fichiers et
30 fonctions ne servent plus. Ils sont dans le [fichier de dette](debt/261121-review-debt-web.FR.md).

Personne n'a rien à réinstaller, et aucune variable d'environnement n'a changé.

## Base de données

Aucun changement de base de données : ni nouvelle classe, ni nouveau champ, ni nouvel index. Ce que le
site lit et écrit aujourd'hui :

| Classe | Lue ou écrite | Champs utilisés | À quoi ça sert |
|---|---|---|---|
| `Article` | lue ; compteurs écrits par le serveur | `translated`, `categories`, `previewImage`, `image`, `images`, `user`, `active`, `deleted`, `websites`, `country`, `views`, `shares`, `hasTableOfContents` | liste du blog et lecture, articles liés, plan du site |
| `Project` | lue | `translated`, `previewImage`, `image`, `technologies`, `society`, `dateStart`, `active`, `deleted` | liste et détail des projets |
| `Category` | lue | `translated`, `entity`, `image`, `parentCategory`, `hasSubcategories`, `websites` | filtres des articles, catégories de pages imbriquées (3 niveaux) |
| `Page`, `PageSection` | lue | `translated`, `active`, `deleted`, `websites`, les positions des liens | pages de contenu, menus, pied de page |
| `App` | lue | la première ligne, ordre `createdAt` | réglages du site |
| `Contact`, `Newsletter` | écrites seulement par des Cloud Functions | — | formulaire de contact, inscription à la newsletter |

Cloud Functions appelées par le site (toutes sur le serveur) : `createPublicContact`,
`subscribeToNewsletter`, `confirmNewsletterSubscription`, `resubscribeNewsletter`,
`unsubscribeNewsletter`, `addReasonToUnsubscribeToTheNewsletter`, `getArticleForClient`,
`getProjectForClient`, `incrementArticleViewCount`, `incrementShareCount`, et `saveUserLanguage`
(exportée mais appelée nulle part pour l'instant).

Les requêtes sont filtrées avec `active = true`, `deleted = false` et la contrainte du site *portfolio*
(les lignes enregistrées avant l'existence du champ `websites` sont gardées). Le site parle à Parse sans
session et sans clé maître : toute écriture passe donc par une Cloud Function.

## Site web

- **Pages touchées** (corrections seulement) : toutes les pages qui portent des données pour les moteurs
  de recherche (accueil, blog, projet, pages de contenu), la liste des projets, toutes les listes
  paginées, la recherche du site, la route de rafraîchissement du cache.
- Rien ne change visuellement pour un visiteur qui suit les liens normaux.

Les pages de l'app, avec leur URL locale (le français d'abord, l'anglais dans la deuxième colonne) :

| Page | Français | Anglais |
|---|---|---|
| Accueil | `http://localhost:9012/fr` | `http://localhost:9012/en` |
| Projets | `/fr/projets` | `/en/projects` |
| Un projet | `/fr/projets/<slug>` | `/en/projects/<slug>` — slug d'un projet actif |
| Blog | `/fr/blog` | `/en/blog` |
| Un article | `/fr/blog/<slug>` | `/en/blog/<slug>` — slug d'un article actif |
| Contact | `/fr/contact` | `/en/contact` |
| Plan du site | `/fr/plan-du-site` | `/en/sitemap` |
| Page de contenu | `/fr/<slug>` | `/en/<slug>` — slug d'une page active |
| Catégorie de pages | `/fr/<slug>/<subcategory>[/<subsubcategory>]` | idem |
| Désinscription | `/fr/newsletter/<email chiffré>/se-desabonner` | `/en/newsletter/<email chiffré>/unsubscribe` |
| Confirmation d'inscription | `/fr/newsletter/confirmer/<token>` | `/en/newsletter/confirm/<token>` |
| Image de partage | `/api/og?title=…` | idem |
| Rafraîchissement du cache (serveur à serveur) | `POST /api/revalidate` avec l'en-tête `x-revalidate-secret` | idem |

Les anciennes adresses `/articles`, `/contact-me` et `/contactez-moi` redirigent vers `/blog` et
`/contact`. La description de chaque page pour les utilisateurs est dans
[docs/features/web](../../../features/web/README.md).

## Voir le résultat en local

```bash
pnpm install
pnpm nx run server:dev   # API sur http://localhost:8089
pnpm nx run web:dev      # site sur http://localhost:9012
pnpm nx run web:sb       # Storybook sur http://localhost:6016
```

Vérifications faites pour cette revue :

- `pnpm nx run web:typecheck` : passe.
- `pnpm nx run web:lint:check` : passe.
- `pnpm check-i18n` : passe.
- `pnpm nx run web:test-storybook` : **non lancé** (demande Playwright et une longue session de navigateur).

Pour voir les cinq corrections :

- **Données pour les moteurs de recherche** : ouvrir un article et afficher le code source de la page, le bloc `application/ld+json` ne contient jamais de `<` brut.
- **Tri des projets** : `http://localhost:9012/fr/projets?orderedBy=updatedAt` trie ; `?orderedBy=unAutreChamp` est ignoré et garde l'ordre par défaut.
- **Page négative** : `http://localhost:9012/fr/blog?page=-3` affiche la première page au lieu d'une erreur.
- **Recherche** : taper trois lettres d'un mot qui n'apparaît que dans le texte anglais d'un article alors que le site est en français ; le résultat est listé au lieu d'une erreur.
- **Rafraîchissement du cache** : `curl -X POST http://localhost:9012/api/revalidate -H "x-revalidate-secret: faux"` répond 401 ; un mauvais corps avec le bon secret répond 400, pas 500.

Storybook (18 fichiers de stories, aucun pour un container) : `http://localhost:6016/?path=/docs/components-alert--docs`
et les autres groupes `App`, `Components/Button`, `Components/Footer`, `Components/Forms`, `Components/Icon`,
`Components/IconButton`, `Components/NavBar`, `Components/Scrollable`, `Components/TableOfContents`,
`Components/Typography`. Aucune story n'a été modifiée par cette revue.

## Bugs, régressions et failles possibles

Du plus grave au moins grave. Tout ce qui a été trouvé existait avant cette revue.

| Gravité | Type | Ce qui peut arriver | Quand | Suite |
|---|---|---|---|---|
| 🟡 Moyenne | Bug | Une courte panne de l'API est mémorisée par le cache : la page d'un projet ou d'un article répond « introuvable » jusqu'à une heure, une liste affiche son erreur pendant des minutes | à chaque fois que l'API est injoignable pendant un rendu | ⏳ reporté — [dette n°1](debt/261121-review-debt-web.FR.md#1-les-recherches-échouées-sont-mises-en-cache-pendant-des-minutes-ou-des-heures) |
| 🟡 Moyenne | Faille / Performance | La recherche du site n'a pas de limite par visiteur et lance jusqu'à 16 parcours de texte sur tout le contenu des articles et des projets à chaque recherche | un script (ou une frappe rapide) qui appelle la recherche | ⏳ reporté — [dette n°2](debt/261121-review-debt-web.FR.md#2-la-recherche-du-site-est-lourde-et-sans-limite) |
| 🟡 Moyenne | Bug | Ouvrir le lien de désinscription désinscrit tout de suite et envoie un e-mail : un scanner de courrier qui ouvre les liens désinscrit le lecteur | le fournisseur de courrier du lecteur scanne les liens | ⏳ reporté — [dette n°3](debt/261121-review-debt-web.FR.md#3-la-désinscription-se-fait-dès-que-le-lien-est-ouvert) |
| 🟡 Moyenne | Faille | Un contenu écrit dans le back-office pouvait fermer le bloc `<script>` des données pour les moteurs de recherche et s'exécuter comme du HTML | un éditeur écrit `</script>` dans un titre ou une description | ✅ corrigé — le `<` est maintenant écrit `<` dans le bloc |
| 🟡 Moyenne | Faille | La liste des projets passait le `orderedBy` de l'adresse tel quel à la base : n'importe quel champ de la classe pouvait servir de tri, ce qui renseigne un visiteur sur des champs qu'il ne peut pas lire | une adresse fabriquée `?orderedBy=<champ>` | ✅ corrigé — seuls `dateStart`, `createdAt`, `updatedAt` et `title` sont acceptés, le reste utilise le tri par défaut |
| 🟡 Moyenne | Bug | La recherche du site plantait quand un résultat était trouvé dans une langue mais pas écrit dans la langue courante, et toute la recherche affichait une erreur | un article ou un projet traduit dans une seule langue | ✅ corrigé — le titre retombe sur la langue par défaut, et la fonction ne plante plus quand la langue par défaut manque aussi |
| 🟡 Basse | Faille | Le secret du rafraîchissement du cache était comparé avec `!==` (fuite par le temps de réponse), un corps qui n'est pas du JSON répondait 500, et une étiquette qui n'est pas du texte était transmise | une requête devinée ou mal formée | ✅ corrigé — comparaison à temps constant, 400 sur un mauvais corps ou une mauvaise étiquette |
| 🟡 Basse | Bug | `?page=-3` donnait un décalage négatif à la base et affichait la page d'erreur | un vieux lien ou un lien écrit à la main | ✅ corrigé — les pages inférieures à 1 comptent comme la première |
| 🟡 Basse | Faille | Le compteur de vues, le compteur de partages et les actions de la newsletter (se réabonner, motif) peuvent être appelés par n'importe qui, sans limite par visiteur | un script | ⏳ reporté — [dette n°4](debt/261121-review-debt-web.FR.md#4-les-compteurs-et-les-actions-de-la-newsletter-sans-limite-par-visiteur) |
| 🟡 Basse | Faille | Pas d'en-tête `Content-Security-Policy`, et le serveur personnalisé répond à toutes les origines en CORS | un script injecté ne serait pas arrêté par le navigateur | ⏳ reporté — [dette n°5](debt/261121-review-debt-web.FR.md#5-pas-de-content-security-policy-et-cors-ouvert-à-tous-les-sites) |
| 🟡 Basse | Faille | Les fichiers de requêtes commencent par `use server` : chaque export peut devenir un point d'entrée public, et `getArticles` / `getProjects` prennent un `limit` de l'appelant | à vérifier sur un build de production | ⏳ reporté — [dette n°6](debt/261121-review-debt-web.FR.md#6-les-fichiers-de-requêtes-marqués-use-server-exposent-tous-leurs-exports) |
| 🟡 Basse | Maintenance | Fichiers et fonctions inutilisés, dont un utilitaire d'envoi de fichiers de 650 lignes copié du back-office | tout futur lecteur | ⏳ reporté — [dette n°7](debt/261121-review-debt-web.FR.md#7-code-mort-resté-dans-le-site) |
| 🟡 Basse | Docs | `apps/web/CLAUDE.md` décrit une route et une langue qui n'existent pas ; deux notes sont hors de `docs/` | tout futur lecteur | ⏳ reporté — [dette n°8](debt/261121-review-debt-web.FR.md#8-documentation-périmée-ou-mal-placée) |
| 🟡 Basse | Tests | 77 containers et les requêtes du serveur n'ont aucun test, la vérification d'accessibilité ne fait qu'avertir | toute modification | ⏳ reporté — [dette n°9](debt/261121-review-debt-web.FR.md#9-trous-de-couverture-des-tests-et-accessibilité) |
| 🟡 Basse | Maintenance | `REST_API_KEY` est obligatoire pour démarrer le site mais seul du code mort la lit | un nouvel environnement | ⏳ reporté — [dette n°10](debt/261121-review-debt-web.FR.md#10-une-variable-obligatoire-ne-sert-à-aucun-code-actif) |

Régressions vérifiées pour les corrections : `getPaginatedQuery` (utilisée par les listes du blog, des
projets et de l'accueil, une page inférieure à 1 compte maintenant comme 1), `getTranslatedField`
(utilisée par toutes les pages, seulement moins susceptible de planter), `projectSearchParamsSchema`
(utilisé par la page des projets seulement), `JsonLd` (utilisé par toutes les pages avec données
structurées) et `searchData` (utilisée par la recherche du bureau et du mobile). Aucun appelant ne dépend
de l'ancien comportement. Le site n'a pas de lanceur de tests unitaires (seulement des tests Storybook) :
les corrections ont donc été vérifiées par la vérification des types, le lint et les étapes ci-dessus, pas
par un nouveau test ; l'ajout d'un projet Vitest pour les fonctions pures est proposé dans la
[dette n°9](debt/261121-review-debt-web.FR.md#9-trous-de-couverture-des-tests-et-accessibilité).

Les dix points reportés sont détaillés, avec comment corriger chacun, dans le
[fichier de dette](debt/261121-review-debt-web.FR.md).

## Ce qui reste à faire

- Les dix points du [fichier de dette](debt/261121-review-debt-web.FR.md).
- Les tests de navigateur Storybook (`pnpm nx run web:test-storybook`) n'ont pas été lancés dans cette revue.
- Aucun test manuel dans un navigateur n'a été fait : le comportement visuel des corrections a été vérifié en lisant le code.
