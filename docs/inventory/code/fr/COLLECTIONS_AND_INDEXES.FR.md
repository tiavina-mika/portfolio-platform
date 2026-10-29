# Collections et index

## Table des matières

- [Collections](#collections)
- [Index](#index)
- [Règles de schéma](#règles-de-schéma)

## Collections

Les collections applicatives sont listées dans `libs/shared-constants/src/collection.constants.ts` (`COLLECTIONS`). Parse garde aussi ses propres collections intégrées.

| Collection | Contenu | Utilisée par |
|---|---|---|
| `Article` | Articles de blog (contenu traduit, drapeaux `active`, `deleted`) | server, bo, web |
| `Project` | Projets du portfolio | server, bo, web |
| `Page` | Pages éditoriales (et leurs objets `PageSection`, gérés par `page.triggers.ts`) | server, bo, web |
| `PageSection` | Sections regroupant les pages | server, bo, web |
| `Category` | Catégories des articles et des pages | server, bo, web |
| `Contact` | Messages envoyés depuis le formulaire de contact du site | server, bo, web |
| `Newsletter` | Abonnements à la newsletter | server, web |
| `App` | Réglages du site, dont les fichiers `image`, `imageForDarkMode` et `cv` (les anciens fichiers sont supprimés de Cloudinary au changement) | server, bo, web |
| `_User` | Utilisateurs du back-office | server, bo |
| `_Role` | Rôles et leurs champs `rights` et `ui` | server, bo |
| `_Session` | Sessions Parse | server |

`PageSection` n'est pas dans la constante `COLLECTIONS` bien qu'elle ait ses propres triggers.

## Index

Aucun index n'est déclaré dans le code : il n'y a ni `createIndex`, ni `ensureIndex`, ni définition de schéma dans `apps/server`, et `allowClientClassCreation` vaut `true`. Parse crée les index par défaut (`_id`, les index uniques de `_User` et `_Role`) et rien d'autre : les filtres et tris des listes du back-office (`getArticles`, `getProjects`, `getContacts`…) et la recherche texte sur `translated.<locale>.*` s'exécutent donc sans index dédié.

Un index ajouté à la main dans Atlas ou Compass n'est suivi nulle part : le déclarer dans le code (démarrage du serveur ou migration) et le lister ici (`.claude/rules/parse-patterns.md`).

## Règles de schéma

- Le contenu traduit est stocké sous des clés de langue fixes (`translated.fr`, `translated.en`, `translated.mg`).
- La suppression douce utilise un drapeau `deleted` (et `deletedAt`, `deletedBy`) ; la corbeille est vidée par `clearRecycleBinInCloud`.
- Un nouveau champ ne remplit jamais les anciennes lignes : les lectures le traitent comme possiblement `undefined`.
