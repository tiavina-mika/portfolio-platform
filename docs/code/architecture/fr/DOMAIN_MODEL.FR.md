# Modèle de domaine

## Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Conventions communes aux collections](#conventions-communes-aux-collections)
  - [Champs traduits](#champs-traduits)
  - [Suppression logique](#suppression-logique)
  - [Fichiers](#fichiers)
- [Collections de contenu](#collections-de-contenu)
  - [Project](#project)
  - [Article](#article)
  - [Page](#page)
  - [PageSection](#pagesection)
  - [Category](#category)
  - [App](#app)
- [Collections des visiteurs](#collections-des-visiteurs)
  - [Contact](#contact)
  - [Newsletter](#newsletter)
- [Collections d'accès](#collections-daccès)
  - [User](#user)
  - [Role](#role)
- [Relations](#relations)
- [Comportement côté serveur à l'enregistrement](#comportement-côté-serveur-à-lenregistrement)

## Vue d'ensemble

Les données vivent dans MongoDB et sont lues et écrites via Parse Server (`apps/server`). Les noms de collections partagés entre les apps sont dans `libs/shared-constants/src/collection.constants.ts` (`Article`, `Newsletter`, `Page`, `Category`, `Project`, `Contact`, `App`) ; le serveur a aussi sa propre constante `collections` (`apps/server/src/constants/_core/constants.ts`) et les noms de classes du domaine sont dans `DOMAIN_COLLECTIONS` (`libs/shared-domain-constants`), voir [CORE_DOMAIN.FR.md](CORE_DOMAIN.FR.md). Le back-office générique ajoute des classes non détaillées ci-dessous (`Notification`, `Payment`, `Report`, `TicketMessage`, `UserAuditLog`, `RoleAuditLog`, `UserSession`, `Invitation`, `ContentVersion`, ...) : voir l'inventaire. Une classe `Test` existe aussi, utilisée uniquement par les fonctions et jobs de test.

Les champs ci-dessous sont ceux que le code lit ou écrit (triggers du Cloud Code et interfaces `*Attributes` de `apps/bo`). Parse ajoute `objectId`, `createdAt`, `updatedAt` et `ACL` à chaque classe.

## Conventions communes aux collections

### Champs traduits

Les locales sont `fr`, `en` et `mg` (`libs/shared-constants/src/locale.constants.ts`, défaut `fr`). Les textes de Project, Article, Page, PageSection et Category sont stockés dans un objet `translated` dont les clés sont les locales, un ensemble fixe déclaré par le code :

```ts
translated: { fr: { title, slug, ... }, en: { title, slug, ... }, mg: { ... } }
```

À chaque enregistrement de ces collections, le serveur complète le `slug` manquant (slugifié depuis le titre ou le nom), `metaTitle` et `metaDescription` de chaque locale présente.

### Suppression logique

Les contenus, utilisateurs, contacts et abonnements newsletter portent un booléen `deleted`. Supprimer depuis le back-office met `deleted: true` (ainsi que `deletedAt` / `deletedBy` là où le trigger les renseigne) ; l'enregistrement est détruit plus tard depuis la corbeille du back-office (`destroyUsers` ne détruit que les utilisateurs déjà marqués supprimés). Les requêtes publiques comme `getArticleForClient` filtrent sur `deleted: false` et `active: true`.

### Fichiers

Les images et documents sont stockés sur Cloudinary et référencés par un objet `{ url, publicId }` (`IFileCloud`). Quand un élément est supprimé logiquement, ses fichiers sont déplacés dans un dossier `recycleBin/` ; quand un élément est détruit ou qu'un fichier est remplacé, les anciens fichiers sont détruits. Le job `clearRecycleBinInCloudJob` vide ce dossier.

## Collections de contenu

### Project

Un projet du portfolio.

| Champ | Contenu |
|---|---|
| `translated` | par locale : `title`, `name`, `description`, `content`, `societyDescription`, et les champs SEO `slug`, `metaTitle`, `metaDescription`, `tags` |
| `logo`, `image`, `previewImage`, `images` | fichiers |
| `editorFiles` | fichiers insérés dans l'éditeur de texte riche |
| `website`, `society`, `youtube` | chaînes |
| `links`, `repositories`, `npm`, `codesandbox` | tableaux de `{ url }` |
| `platforms`, `technologies`, `types` | tableaux de chaînes (les technologies viennent de `PROJECT_TECHNOLOGIES` dans `libs/shared-domain-constants`) |
| `categories` | pointeurs vers `Category` |
| `dateStart`, `dateEnd` | dates |
| `shares`, `totalMediaShare` | compteurs de partages par réseau social, et leur total |
| `active`, `deleted`, `user`, `deletedAt` | état de publication, propriétaire, suppression logique |

### Article

Un article de blog.

| Champ | Contenu |
|---|---|
| `translated` | par locale : `title`, `description`, `content`, `slug`, `metaTitle`, `metaDescription`, `tags` |
| `image`, `previewImage`, `images`, `editorFiles` | fichiers |
| `categories` | pointeurs vers `Category` ; déplacés dans `deletedCategories` quand l'article est supprimé logiquement |
| `shares`, `totalMediaShare` | compteurs de partages |
| `active`, `deleted` | état de publication, suppression logique |
| `user`, `updatedBy`, `deletedBy`, `deletedAt` | champs d'audit renseignés par les triggers |

### Page

Une page éditoriale.

| Champ | Contenu |
|---|---|
| `translated` | par locale : `name`, `title`, `description`, `content`, `blockTitle`, `blockDescription` et les champs SEO |
| `bannerImage`, `previewImage`, `images`, `editorFiles` | fichiers |
| `categories`, `deletedCategories` | pointeurs vers `Category` |
| `sections` | pointeurs vers `PageSection` |
| `linkLocations` | où la page est liée : `menu`, `footer` |
| `active`, `deleted`, `user`, `updatedBy`, `deletedBy`, `deletedAt` | état et champs d'audit |

### PageSection

Une section regroupant des pages.

| Champ | Contenu |
|---|---|
| `translated` | par locale : `title`, `description` |
| `pages` | pointeurs vers `Page` |
| `blocks` | liste de `{ id, translated, image, imagePosition }` (`imagePosition` : `left`, `right`, `bottom`) |
| `active`, `deleted`, `user`, `updatedBy`, `deletedBy`, `deletedAt` | état et champs d'audit |

### Category

Une catégorie d'articles ou de pages.

| Champ | Contenu |
|---|---|
| `translated` | par locale : `name`, `slug`, `tags` |
| `entity` | `article` ou `page` : le type d'élément auquel la catégorie s'applique |
| `image` | fichier |
| `itemCount` | nombre d'éléments liés, tenu à jour par un job |
| `active`, `deleted`, `user`, `updatedBy`, `deletedBy`, `deletedAt` | état et champs d'audit |

### App

Réglages du site avec trois fichiers : `image`, `imageForDarkMode` et `cv` (servi par `GET /download/cv.pdf`). Quand l'un d'eux change, l'ancien fichier est détruit.

## Collections des visiteurs

### Contact

Un message envoyé depuis le formulaire de contact public ; c'est aussi le premier message d'un ticket de support traité dans le back-office (`TicketMessage` porte les réponses).

| Champ | Contenu |
|---|---|
| `email`, `name`, `message` | saisis par le visiteur ; validés côté serveur (nom 120 caractères au plus, message 500) |
| `locale` | locale du visiteur, transmise dans le contexte de l'enregistrement |
| `user` | pointeur vers le `_User` ayant le même email, s'il existe |
| `replied`, `repliedAt`, `repliedBy` | renseignés quand le back-office répond |
| `reference`, `priority`, `subject`, `phone`, `source`, `lastMessageAt`, `seen` | champs de ticket remplis par le serveur |
| `deleted` | suppression logique |

### Newsletter

Un abonnement à la newsletter.

| Champ | Contenu |
|---|---|
| `email` | email de l'abonné |
| `language` | locale dans laquelle les articles sont envoyés |
| `confirmed`, `confirmationTokenHash` | double opt-in : un abonnement commence à `confirmed: false` et seul le hachage du jeton de confirmation est stocké |
| `active` | `false` tant que non confirmé et une fois désabonné |
| `unsubscribeAt`, `reason` | date et motif du désabonnement (`tooFrequent`, `notInterested`, `notRelevant`, `other`) |
| `user` | pointeur vers le `_User` ayant le même email, s'il existe |
| `deleted` | suppression logique |

## Collections d'accès

### User

Un utilisateur du back-office (`_User`). L'email sert aussi de nom d'utilisateur.

| Champ | Contenu |
|---|---|
| `email`, `username`, `password`, `firstName`, `lastName` | identité ; le mot de passe fait de 8 à 64 caractères |
| `emailVerified`, `phoneVerified`, `phone` | contacts confirmés par un code (voir [AUTH.FR.md](AUTH.FR.md)) |
| `verification` | `{ code, expiredAt }` : le code à 6 chiffres est stocké chiffré et valable 1 heure |
| `platforms` | liste de `{ name, count, lastConnectedAt }` par plateforme de connexion (`web`, `bo`, `android`, `ios`) |
| `locale` | langue préférée |
| `isOnline`, `seen` | présence, et indicateur de vue du nouvel utilisateur par le back-office |
| `banned`, `bans` | indicateur de bannissement et historique de `{ bannedAt, bannedBy, until }` |
| `deleted`, `deletedAt`, `deletedBy` | suppression logique |

### Role

Un rôle (`_Role`), champs Parse standard (`name`, `users`, `roles` pour les rôles parents) plus les champs personnalisés `rights` (par collection), `ui` (zones du back-office), `countries` et un délai d'inactivité. Les noms de rôles sont `OWNER`, `SUPER_ADMIN`, `MANAGER`, ... Voir [RIGHTS_ROLES.FR.md](RIGHTS_ROLES.FR.md).

## Relations

```text
User ──< Role (relation users)         Role >── Role (rôles parents)
User ──< Project / Article / Page / PageSection / Category (user, updatedBy, deletedBy)
Article / Page / Project >──< Category (categories)
Page >──< PageSection (sections / pages)
Contact >── User (user, rapproché par email)
Newsletter >── User (user, rapproché par email)
```

## Comportement côté serveur à l'enregistrement

| Collection | `beforeSave` | `afterSave` / `afterDelete` |
|---|---|---|
| Project | slugs et SEO par défaut ; renseigne `user`, `deleted: false` à la création ; incrémente `totalMediaShare` quand `shares` change | déplace les fichiers vers la corbeille à la suppression, détruit les fichiers remplacés ; détruit les fichiers à la destruction |
| Article | comme Page (`beforeSave` partagé) | met à jour les compteurs de catégories ; à la création lance le job newsletter ; déplace les fichiers vers la corbeille à la suppression |
| Page | slugs, titres et SEO par défaut ; à la suppression logique déplace `categories` vers `deletedCategories` | met à jour les compteurs de catégories ; supprime logiquement les blocs qu'elle contient ; à la destruction retire la page de ses sections et détruit les sections vides |
| PageSection | renseigne `user` / `updatedBy` | à la suppression logique déplace les images des blocs vers la corbeille ; détruit les images de blocs remplacées |
| Category | slugs ; renseigne `user` / `updatedBy` | à la suppression logique déplace son image et la détache des éléments ; à la destruction la détache des éléments |
| Contact | validation, renseigne `deleted`, `replied`, `locale`, `user` | renseigne `repliedAt` / `repliedBy` ; crée le contact dans Brevo |
| Newsletter | à la création renseigne `deleted`, `active`, `user`, sauf si un abonnement avec le même email existe déjà (les valeurs par défaut sont alors ignorées) | à la création lance `createContactToCloudJob` |
| App | aucun | détruit les fichiers remplacés |
| `_User` | validation à l'inscription ; renseigne `deleted`, `platforms` | code de vérification à la création, rôle propriétaire, horodatages de suppression et de bannissement |

Les règles d'accès sont dans [RIGHTS_ROLES.FR.md](RIGHTS_ROLES.FR.md), les emails dans [EMAIL_NOTIFICATIONS.FR.md](EMAIL_NOTIFICATIONS.FR.md).
