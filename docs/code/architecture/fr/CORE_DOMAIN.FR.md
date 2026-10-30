# Core et Domain

## Table des matières

- [Pourquoi cette séparation](#pourquoi-cette-séparation)
- [Ce qui est core, ce qui est domain](#ce-qui-est-core-ce-qui-est-domain)
- [Test de décision](#test-de-décision)
- [Sens des dépendances](#sens-des-dépendances)
- [Registres et points de composition](#registres-et-points-de-composition)
  - [Serveur](#serveur)
  - [Back-office](#back-office)
  - [Site web](#site-web)
  - [Bibliothèques partagées](#bibliothèques-partagées)
- [Ajouter une entité métier](#ajouter-une-entité-métier)
- [Ce qui n'a pas été porté](#ce-qui-na-pas-été-porté)
- [Limites connues](#limites-connues)

## Pourquoi cette séparation

`apps/server` et `apps/bo` sont le back-office générique de la plateforme 1lalana (comptes, rôles, CMS, notifications, tickets, signalements, journal d'audit, tableaux de bord) auquel s'ajoute le métier du portfolio. Séparer les deux permet de réutiliser ou de mettre à jour la partie générique sans toucher au portfolio, et garde le métier (`Project`) à un seul endroit.

## Ce qui est core, ce qui est domain

| Côté | Contenu |
|---|---|
| `_core/` | Le code qui fonctionne encore si `_domain/` est supprimé : authentification, MFA, utilisateurs, rôles et droits, CMS (article, page, section de page, catégorie, contact, newsletter), notifications, paiements, tickets, signalements, journal d'audit, tableaux de bord et statistiques sous forme de registres |
| `_domain/` | Ce qui est propre au portfolio : l'entité `Project` et tout ce qui ne peut pas tourner sans elle |

Aujourd'hui `_domain/` ne contient que `Project` : côté serveur `project.functions.ts` (`getProjects`, `getProject`, `getProjectForClient`), `project.triggers.ts`, services, utils, constantes et validations ; côté back-office les pages, containers, redux, service, types, validations et traductions des projets.

`apps/web` n'est **pas** séparé : c'est le site public, il n'a pas de partie back-office générique. Sa structure suit l'app web de 1lalana et son design reste celui du portfolio.

## Test de décision

Le fichier importe-t-il la classe ou la collection `Project`, ou casserait-il si `_domain/` était supprimé ?

- Non : `_core/`.
- Oui : `_domain/`.

## Sens des dépendances

```text
_domain/  ->  _core/    autorisé (le domaine réutilise les briques génériques)
_core/    ->  _domain/  jamais (_core ne serait plus supprimable)
```

Le lint le vérifie : `no-restricted-imports` (`coreDomainBoundaryConfig` de `@shared/eslint-config`) échoue sur un fichier `_core` qui importe un chemin `_domain`. Les noms de classes du domaine dont `_core` a besoin (par exemple la liste des classes en lecture publique) viennent de `DOMAIN_COLLECTIONS` dans `libs/shared-domain-constants`, qui n'appartient à aucun des deux côtés.

## Registres et points de composition

Quand `_core` doit afficher des données du domaine, il expose un registre (`registerXxx(...)`) que `_domain` appelle au chargement de son module. Les seuls fichiers qui importent les deux côtés sont les points de composition.

### Serveur

| Registre (dans `_core`) | Rempli par le domaine |
|---|---|
| `registerDashboardKpiProvider(className, fn)` | `project-dashboard.service.cloud.ts` |
| `registerGlobalSearchEntity(key, config)` | `project-search.service.cloud.ts` |

D'autres registres existent et ne sont pas utilisés par le portfolio (vue d'ensemble des statistiques, cibles de signalement, canaux de notification, enrichissement de la liste d'utilisateurs, suppression de compte, export de données, gestionnaires de paiement).

Points de composition : `cloud/services/index.ts`, `cloud/functions/index.ts`, `cloud/triggers/index.ts`, `cloud/jobs/index.ts` (chacun importe les fichiers `_core` puis `_domain`) et `src/index.ts`.

### Back-office

Les registres remplissent les cartes et colonnes du tableau de bord, et les entités qui peuvent recevoir des droits de rôle (`registerRightsEntities`). Points de composition : `src/config/domain-registrations.ts` (imports à effet de bord, chargé en premier par `main.tsx`), `src/routes/protected/private.routes.tsx`, `src/redux/store.ts` et `src/hooks/useNavigationMenus.tsx`. Chacun de `pages`, `containers`, `hooks`, `services`, `types`, `utils`, `validations`, `constants`, `redux/actions`, `redux/reducers` et des dossiers de langues a un sous-dossier `_core/` et un `_domain/`. `components/` reste à plat.

### Site web

Pas de séparation, pas de registre. Les pages du domaine (`projects`) et les pages génériques (`blog`, `contact`, `newsletter`, `pages`) cohabitent sous `app/[locale]`.

### Bibliothèques partagées

Les `libs/shared-*` sont neutres : `shared-domain-constants`, `shared-domain-types` et `shared-domain-utils` portent les noms, types et helpers partagés du domaine ; `shared-validations` et `shared-faq` sont génériques.

## Ajouter une entité métier

1. D'abord les noms, types et constantes partagés dans la `libs/shared-*` concernée ; ajouter le nom de classe à `DOMAIN_COLLECTIONS`.
2. Serveur, tout sous `_domain/` : validations et constantes, service, utils, `<entité>.functions.ts`, `<entité>.triggers.ts` ; importer les fichiers dans les points `cloud/*/index.ts` ; enregistrer les fournisseurs de tableau de bord et de recherche si l'entité doit y figurer.
3. Back-office, tout sous `_domain/` : type, validation, service, action et reducer redux (enregistré dans `store.ts`), page et container, route dans `private.routes.tsx`, entrée de menu, traductions dans toutes les langues, entité de droits dans les enregistrements du domaine.
4. Site web : page, requêtes, traductions (`fr`, `en`), entrée du sitemap.
5. Docs : `docs/features/`, `docs/inventory/` et la revue de la branche.

## Ce qui n'a pas été porté

De 1lalana, laissés de côté volontairement : la fonctionnalité de notation, les tests unitaires et de composants, Storybook du back-office, les tests de bout en bout, l'application mobile et l'application de documentation. Les traces restantes (noms de classes, fonctions de test) sont listées dans le fichier de dette de la revue de la branche.

## Limites connues

- La constante `collections` du serveur et certaines listes de classes nomment encore des classes de covoiturage (`Ride`, `Request`, `Vehicle`, `Rating`, `RideShare`, `SosAlert`).
- Les écrans paiements, finance et certaines statistiques existent dans `_core` sans vraie source de données dans le portfolio.

Voir [la revue de la branche](../../reviews/fr/261030-feat-core-domain-split.FR.md) pour la liste complète.
