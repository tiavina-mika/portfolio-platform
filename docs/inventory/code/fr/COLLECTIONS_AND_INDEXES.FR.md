# Collections et index

## Table des matières

- [Collections](#collections)
- [Index](#index)
- [Règles de schéma](#règles-de-schéma)
- [Pièges](#pièges)

## Collections

Les noms de classes du domaine sont dans `libs/shared-domain-constants` (`DOMAIN_COLLECTIONS`) ; ceux du cœur dans la constante serveur `collections` (`apps/server/src/constants/_core/constants.ts`). Parse garde aussi ses propres collections intégrées.

| Collection | Contenu | Utilisée par |
|---|---|---|
| `Project` (domaine) | Projets du portfolio | server, bo, web |
| `Client` (domaine) | Clients de l'espace Aldaron ; atteints par leurs Cloud Functions seulement, jamais publics | server, bo |
| `Quote` (domaine) | Devis de l'espace Aldaron : numéro, pointeur vers le client, lignes, devise, taux de TVA, total et statut calculés par le serveur ; atteints par leurs Cloud Functions seulement, jamais publics | server, bo |
| `Article` | Articles de blog (contenu traduit, drapeaux `active`, `deleted`) | server, bo, web |
| `Page` | Pages éditoriales | server, bo, web |
| `PageSection` | Sections regroupant les pages | server, bo, web |
| `Category` | Catégories d'articles et de pages | server, bo, web |
| `Contact` | Messages des formulaires de contact des sites ; `target` nomme l'espace où il se lit (absent = portfolio), `quote` le devis qu'une demande Aldaron est devenue | server, bo, web, aldaron-web |
| `Newsletter` | Abonnements à la newsletter (double opt-in, confirmé par un jeton haché) | server, web |
| `App` | Réglages du site, dont les fichiers `image`, `imageForDarkMode` et `cv` (les anciens fichiers sont supprimés de Cloudinary au changement) | server, bo, web |
| `Notification`, `NotificationResend` | Notifications envoyées depuis le back-office et leurs renvois | server, bo |
| `UserAuditLog`, `RoleAuditLog`, `SessionAuditLog`, `MfaAuditLog`, `UserModerationLog` | Journaux d'audit (verrouillés, écrits par le serveur seul) | server, bo |
| `UserSession` | Appareils et sessions | server |
| `Invitation` | Invitations au back-office (jeton, rôle, expiration) | server, bo |
| `ImpersonationSession` | Sessions « se connecter en tant que » | server, bo |
| `ContentVersion` | Historique des contenus du CMS (Page, Article…) | server, bo |
| `Counter` | Séquences nommées incrémentées de façon atomique (`quote-<année>` numérote les devis d'une année) ; verrouillée, écrite par les triggers seuls | server |
| `_User` | Utilisateurs du back-office | server, bo |
| `_Role` | Rôles et leurs champs `rights`, `ui`, `countries` et `workspaces` | server, bo |
| `_Session` | Sessions Parse | server |

## Index

Les index sont déclarés dans le code, dans `apps/server/src/config/db-indexes.ts` (`INDEXES_BY_COLLECTION`), et créés au démarrage pour que chaque environnement ait les mêmes. Les anciens index à faire disparaître sont listés dans `LEGACY_INDEXES_BY_COLLECTION`. Points principaux :

- `Project` et `Article` : `translated.fr.slug`, `translated.en.slug` et `translated.mg.slug`, pour la lecture publique par slug.
- `Newsletter` : `email`, et `confirmationTokenHash` (sparse) pour le lien de confirmation.
- `Client` : `email` (unique quand non vide, pour qu'une adresse soit un seul client) et `status` + `name` pour la liste.
- `Quote` : `number` + `version` (unique), `_p_client` + `status` (les devis d'un client, et le refus de supprimer un client qui en a), `status` + `issuedAt` pour la liste.
- `Counter` : `name` (unique, une ligne par séquence).
- `Notification` : liste par destinataire, filtres d'état de lecture et de type d'envoi, `idempotencyKey` (unique, sparse).
- `Invitation` : `token` (unique, sparse) et `email`.
- `User`, `Contact`, `Category`, `Page` (`code`, unique quand renseigné), `ContentVersion`, `UserSession` et les journaux d'audit ont leurs propres index.
- `_Join:users:_Role` : `relatedId` et `owningId`.

`allowClientClassCreation` vaut `false`, et les permissions de classe sont reconstruites à chaque démarrage à partir des rôles (voir [rôles et permissions](ROLES_AND_PERMISSIONS.FR.md)). Un nouvel index va dans `db-indexes.ts`, jamais à la main dans Atlas ou Compass (`.claude/rules/parse-patterns.md`), et les champs Pointer utilisent leur nom de colonne Mongo (`_p_<champ>`).

## Règles de schéma

- Le contenu traduit est stocké sous des clés de langue fixes (`translated.fr`, `translated.en`, `translated.mg`).
- La suppression logique utilise un drapeau `deleted` (et `deletedAt`, `deletedBy`) ; la corbeille est vidée par `clearRecycleBinInCloud`.
- Un nouveau champ ne remplit jamais les anciennes lignes : les chemins de lecture le traitent comme possiblement `undefined`.

## Pièges

- Les noms de classe `Project`, `Client` et `Quote` ne sont pas dans `collections` : ils viennent de `DOMAIN_COLLECTIONS`, donc un fichier du cœur qui en a besoin doit les importer depuis la lib partagée.
