# Devis, clients et missions Aldaron

## Table des matières

- [Objectif](#objectif)
- [Ce qui est prêt](#ce-qui-est-prêt)
- [Décisions](#décisions)
- [Qui crée, et quand](#qui-crée-et-quand)
- [Demandes de devis du site](#demandes-de-devis-du-site)
- [Modèle de données](#modèle-de-données)
  - [Client](#client)
  - [Devis](#devis)
  - [Mission](#mission)
  - [Cycle de vie d'une mission](#cycle-de-vie-dune-mission)
  - [Paiement](#paiement)
- [Serveur](#serveur)
- [Back-office](#back-office)
- [Site web](#site-web)
- [Fichiers à toucher](#fichiers-à-toucher)
- [Améliorations et manques](#améliorations-et-manques)
- [Questions ouvertes](#questions-ouvertes)
- [Ordre de travail](#ordre-de-travail)

> Note de conception, écrite avant tout code. Elle détaille l'étape 4 de [WORKSPACE_SWITCH.FR.md](WORKSPACE_SWITCH.FR.md), marquée ⏳ : les premières collections propres à Aldaron. Les listes de champs sont une proposition à confirmer avant le code.

## Objectif

- Permettre à l'espace de travail Aldaron de gérer son activité : les **clients**, les **devis** qui leur sont envoyés et les **missions** qui suivent un devis accepté, et les **paiements** de chaque devis (30 / 40 / 30).
- Ces quatre collections n'existent que dans l'espace Aldaron : l'espace portfolio ne les liste jamais, et un utilisateur dont les rôles n'ouvrent pas `aldaron` ne peut ni les lire ni les écrire.
- Rien n'est public : le site d'Aldaron ne les affiche pas.

## Ce qui est prêt

L'étape 1 du changement d'espace a laissé côté serveur les helpers nécessaires, dans `apps/server/src/cloud/utils/_core/role.utils.cloud.ts` :

| Helper | Usage pour ces collections |
|---|---|
| `resolveWorkspace(user, TargetEnum.ALDARON, locale)` | Première ligne de chaque Cloud Function d'une collection : lève l'erreur « non autorisé » traduite quand les rôles du compte n'ouvrent pas Aldaron |
| `getUserWorkspaces(user)` | Inutile ici : ces collections n'ont aucune ligne qui appartienne au portfolio, donc pas de filtre par ligne |
| `fromBO(handler, operations, className)` | Vérifie déjà le droit habituel par collection (`find`, `get`, `create`, `update`, `delete`) |

Détenir `aldaron` ouvre l'espace, pas toutes les actions dedans : les deux contrôles s'appliquent, comme pour toute fonction Aldaron.

Côté back-office, le registre `WORKSPACES` (`apps/bo/src/constants/_core/workspace.constants.ts`) et `registerRightsEntities` (table des droits des rôles) sont les deux points d'extension.

## Décisions

1. **Le code vit sous `_domain/`** (serveur et back-office), avec le domaine `Project` : devis, clients et missions sont des entités métier, et `_core` doit rester générique et ne jamais les importer.
2. **Les noms de classe vont dans `DOMAIN_COLLECTIONS`** de `libs/shared-domain-constants` (`Client`, `Quote`, `Mission`), comme `Project`.
3. **Pas de champ `target`** : une collection qui n'existe que dans Aldaron n'a pas besoin de cible par ligne ; le contrôle porte sur toute la collection, via `resolveWorkspace`.
4. **Statuts adossés à des enums**, pas des booléens (`parse-patterns.md`) : un troisième état est plausible pour chacun.
5. **Les montants sont des entiers dans la plus petite unité de la devise**, avec un code `currency` à côté, jamais un flottant.
6. **Ensembles de clés fixes uniquement** : aucun objet indexé par un identifiant de client ou une adresse e-mail.
7. **Rien n'est supprimé quand le statut d'un parent change** : un client qui a des devis ne se supprime pas, il s'archive.
8. **Un seul échéancier de paiement, 30 / 40 / 30**, identique pour tous les devis : une constante, pas un champ à éditer, donc ni éditeur d'échéancier ni pourcentages personnalisés.
9. **Une seule devise par devis** : un paiement n'a pas de devise propre et reprend celle de son devis.
10. **Pas de factures pour l'instant** : un `Payment` enregistre qui a payé quoi et quand ; une facture légale (numérotation sans trou, mentions obligatoires, conservation) aurait sa propre note.

## Qui crée, et quand

### Par qui

Toujours un utilisateur connecté du back-office, à la main. Rien n'est créé par les sites publics ni automatiquement.

- L'utilisateur doit détenir l'espace `aldaron` **et** le droit `create` sur la collection : les deux contrôles de [Ce qui est prêt](#ce-qui-est-prêt).
- Les rôles s'éditent dans le back-office, donc aucun rôle n'est codé en dur. Organisation proposée, à ajuster à l'équipe réelle :

| Qui | Rôle | Espaces | Droits |
|---|---|---|---|
| Propriétaire, super admin | `OWNER` / `SUPER_ADMIN` | Tous, sans les stocker | Tout |
| La personne qui gère les clients et envoie les devis | Un rôle comme « Aldaron commercial » | `aldaron` | `find`, `get`, `create`, `update` sur clients et devis ; `find`, `get`, `update` sur paiements ; `find`, `get` sur missions |
| La personne qui réalise le travail | Un rôle comme « Aldaron réalisation » | `aldaron` | `find`, `get` sur clients et devis ; `find`, `get`, `create`, `update` sur missions |
| Un comptable ou un lecteur | Un rôle en lecture seule | `aldaron` | `find`, `get` sur chaque collection |

- `delete` est réservé au propriétaire : un client s'archive, un devis est refusé ou expiré, pas supprimé.
- Un utilisateur de l'espace portfolio seul ne voit rien, même avec les droits, car le contrôle d'espace refuse en premier.

### Quand

| Entité | Moment | Comment |
|---|---|---|
| Client | Au premier contact, avant le premier devis | Depuis la liste des clients ; créable aussi depuis le formulaire de devis, pour ne pas interrompre la saisie |
| Devis | Une fois le client connu | Naît en `draft`, puis `sent` à l'envoi ; `accepted`, `refused` et `expired` se posent à la main (un job pourra poser `expired` plus tard) |
| Mission | Seulement après un devis `accepted` | Un bouton « Créer la mission » sur le devis accepté préremplit client, titre et devis ; une mission sans devis reste possible à la main |

Rien ne se déclenche automatiquement : accepter un devis ne crée pas de mission, car une personne choisit encore la date de début et qui fait le travail.

## Demandes de devis du site

`aldaron-web` a déjà la porte d'entrée : le simulateur de prix (« Votre estimation ») transmet son estimation à la page contact, dont le formulaire envoie la demande par l'action serveur `createQuoteRequest` puis la Cloud Function `createPublicContact`. Elle est aujourd'hui enregistrée comme un `Contact` : les réponses du formulaire (produit, supports, ce que le visiteur apporte, besoins, estimation) sont écrites en texte brut dans `message`, et l'estimation gardée dans le navigateur est effacée une fois la demande envoyée.

Cela reste le point d'entrée. Le visiteur ne crée ni client ni devis ; c'est un utilisateur du back-office qui transforme la demande en client et en devis, à la main.

| Option | Ce qui se passe | Avis |
|---|---|---|
| A. Ne rien changer | La demande reste un `Contact` en texte libre ; l'équipe ressaisit client et devis | Aucun code, mais double saisie, et les demandes Aldaron se mêlent aux contacts du portfolio |
| B. Une action « Créer le client et le devis » sur le contact **(recommandée)** | Un utilisateur crée un client (nom et e-mail repris du contact) et un devis `draft` prérempli avec l'estimation ; le contact garde un lien vers le devis | Reste manuel comme décidé, le formulaire public ne change pas |
| C. Un client `draft` créé automatiquement à l'envoi | Le formulaire crée lui-même le client | Gain de temps, mais le public écrirait dans une collection métier : doublons et spam malgré reCAPTCHA |

L'option B demande :

- **Serveur :** un champ `target` sur `Contact`, posé par `createPublicContact` (`aldaron` quand la demande vient d'`aldaron-web`, `portfolio` sinon, une ancienne ligne sans le champ valant `portfolio`). Les fonctions de liste des contacts suivent alors l'espace de travail, avec le même contrôle `resolveWorkspace` que les articles, pour que les demandes Aldaron n'apparaissent que dans l'espace Aldaron. `aldaron-web` envoie sa cible avec l'appel, comme il le fait déjà pour lire le contenu.
- **Serveur :** un pointeur `quote` sur `Contact`, posé quand un devis en est créé, pour qu'une demande déjà traitée se voie et ne puisse pas devenir un second devis par erreur.
- **Back-office :** l'action sur le détail du contact, affichée uniquement à un utilisateur qui détient le droit `create` des devis, qui ouvre le formulaire de devis prérempli et crée le client au passage (ou réutilise le client ayant le même e-mail).
- Rien ne change dans le formulaire public, et la promesse de confidentialité reste vraie : l'estimation est toujours effacée du navigateur à l'envoi.

## Modèle de données

### Client

Une personne ou une entreprise pour qui Aldaron travaille.

| Champ | Type | Notes |
|---|---|---|
| `name` | string | Obligatoire ; raison sociale ou nom complet |
| `kind` | `ClientKindEnum` | `company` ou `individual` |
| `email` | string | Obligatoire, validé, stocké en minuscules pour que `Jean@x.com` et `jean@x.com` soient un seul client |
| `phone` | string | Optionnel |
| `address` | objet | Clés fixes : `line1`, `line2`, `postalCode`, `city`, `country` |
| `taxId` | string | Optionnel, numéro d'entreprise ou de TVA |
| `notes` | string | Interne, jamais envoyé au client |
| `status` | `ClientStatusEnum` | `active`, `archived` ou `anonymized` (voir [Améliorations et manques](#améliorations-et-manques)) |

Index : `email`, et `status` + `name` pour la liste.

### Devis

Une proposition chiffrée envoyée à un client.

| Champ | Type | Notes |
|---|---|---|
| `number` | string | Référence lisible, unique, générée côté serveur (jamais saisie) |
| `client` | pointeur `Client` | Obligatoire |
| `title` | string | Obligatoire |
| `status` | `QuoteStatusEnum` | `draft`, `sent`, `accepted`, `refused`, `expired` |
| `lines` | tableau d'objets | Clés fixes : `label`, `quantity`, `unitAmount` ; borné (voir ci-dessous) |
| `currency` | string | Code ISO 4217 |
| `taxRate` | nombre | Pourcentage, optionnel |
| `totalAmount` | entier | Stocké, calculé côté serveur à la sauvegarde à partir de `lines` et `taxRate`, pour que les listes puissent trier et filtrer dessus |
| `paidAmount` | entier | Somme des paiements `paid`, tenue à jour par le trigger de `Payment` (voir [Paiement](#paiement)) pour que les listes filtrent les devis impayés et soldés |
| `issuedAt` | date | Renseignée quand le statut passe pour la première fois à `sent` |
| `validUntil` | date | Optionnelle |
| `notes` | string | Conditions affichées au client |
| `version` | entier | 1 pour un premier devis ; une révision du même devis ajoute 1 |
| `parentQuote` | pointeur `Quote` | Le devis que celui-ci révise (même `number`) ou complète par avenant (son propre `number`) ; vide pour un premier devis |
| `acceptedAt` | date | Renseignée quand le statut passe à `accepted` |
| `acceptanceMethod` | `QuoteAcceptanceMethodEnum` | `email`, `signature`, `oral`, `other` ; la preuve de l'acceptation, renseignée avec `acceptedAt` |
| `acceptanceProof` | fichier | Optionnel : devis signé, e-mail du client (stocké comme les autres fichiers du back-office) |

- `lines` est un tableau embarqué, réécrit en entier à chaque mise à jour : il est plafonné (une constante nommée, environ 50 lignes) et refusé par la validation au-delà.
- Le nom du client n'est **pas** copié dans le devis : les listes le lisent via `include('client')` avec un `select`, donc il ne devient jamais périmé.
- **Révision et avenant.** Un devis sorti de `draft` n'est jamais modifié. Une **révision** (action « Réviser » sur un devis `sent`) crée une copie `draft` avec le même `number`, `version` + 1 et `parentQuote` renseigné ; la version précédente passe à `expired`. Un **avenant** (travail en plus après l'acceptation) est un nouveau devis avec son propre `number` et un `parentQuote` qui pointe vers le devis accepté ; une fois accepté, il crée ses propres trois paiements. Un devis accepté n'est jamais révisé.
- Index : `number` + `version` (unique), `client` + `status`, `status` + `issuedAt` pour la liste.
- Les transitions autorisées sont vérifiées dans un trigger `beforeSave` : `draft → sent → accepted | refused | expired` ; un devis sorti de `draft` ne peut plus voir ses lignes modifiées.

### Mission

Le travail réalisé après l'acceptation d'un devis.

| Champ | Type | Notes |
|---|---|---|
| `title` | string | Obligatoire |
| `client` | pointeur `Client` | Obligatoire |
| `quote` | pointeur `Quote` | Optionnel ; s'il est renseigné, le devis doit être `accepted` et appartenir au même client |
| `status` | `MissionStatusEnum` | `planned`, `inProgress`, `done`, `cancelled` |
| `assignee` | pointeur `_User` | Optionnel ; l'utilisateur du back-office qui fait le travail, ce qui permet « mes missions » dans la liste |
| `phase` | `MissionPhaseEnum` | Optionnelle ; une des phases du statut courant (voir [Cycle de vie d'une mission](#cycle-de-vie-dune-mission)) |
| `startDate`, `endDate` | date | Optionnelles |
| `description` | string | Optionnelle |

Index : `client` + `status`, `status` + `startDate`.

### Cycle de vie d'une mission

```text
(devis accepté) ──► planned ──► inProgress ──► done
                       │            │
                       └──► cancelled ◄┘
```

| Étape | Qui et quand | Ce qui se passe |
|---|---|---|
| Naissance | Un utilisateur qui détient le droit `create` des missions, après un devis `accepted` | Le bouton « Créer la mission » préremplit client, titre et devis ; une mission sans devis reste possible à la main. Elle naît en `planned`. |
| `planned` | Tant que le travail n'a pas commencé | Tout peut être modifié ; le client et le devis ne changent plus ensuite |
| `inProgress` | Quand le travail démarre | Passage à la main ; une `startDate` vide est remplie avec ce jour |
| `done` | Quand le travail est livré | Passage à la main ; une `endDate` vide est remplie avec ce jour |
| `cancelled` | Depuis `planned` ou `inProgress` | Le travail est abandonné ; la mission reste visible avec ce statut |

Chaque statut a une **phase** facultative, une liste fixe valable seulement pour ce statut :

| Statut | Phase | Sens |
|---|---|---|
| `planned` | `waitingClient` | On attend le client : brief, accès, acompte |
| | `scheduled` | Tout est reçu, la date de démarrage est fixée |
| `inProgress` | `design` | Maquettes |
| | `development` | Développement |
| | `testing` | Tests et recette |
| | `clientReview` | Retours du client à intégrer |
| | `release` | Mise en production, ou publication sur l'App Store et Google Play |
| `done` | `handover` | Remise du code et des comptes |
| | `warranty` | Période de correction de bugs |
| | `closed` | Terminée, rien d'ouvert |
| `cancelled` | `byClient` | Annulée par le client |
| | `byAldaron` | Annulée par Aldaron |
| | `unpaid` | Annulée faute de paiement |

- Le simulateur d'`aldaron-web` promet la remise du code et des comptes et 30 jours de correction de bugs, ce que représentent `handover` et `warranty`.
- Pour `cancelled`, les phases sont en réalité des motifs ; le mécanisme est le même.
- Une phase peut rester vide : une mission de maintenance n'a pas de `design`, un site statique n'a pas de publication sur les stores.
- La phase change librement à l'intérieur d'un statut (`testing` puis de nouveau `development` est permis) ; seul le statut garde un ordre.
- Le trigger `beforeSave` : vérifie les transitions (pas de retour en arrière, `done` et `cancelled` sont finaux), refuse une phase qui n'appartient pas au statut courant et la vide quand le statut change, refuse une `endDate` antérieure à la `startDate`.
- Une mission ne se supprime jamais (`delete` est réservé au propriétaire) et elle bloque la suppression de son client : elle reste comme historique.
- Une mission ne modifie pas son devis (un devis reste `accepted` si sa mission est annulée), ne porte aucun montant et ne facture pas : ce serait une autre tâche. Aucun statut ne change automatiquement.

### Paiement

Un paiement attendu d'un client, ou reçu de lui, pour un devis. Les paiements d'un devis forment son historique de paiements.

L'échéancier est une constante de `src/constants/_domain/`, identique pour tous les devis :

| `kind` | Part | Échéance |
|---|---|---|
| `deposit` | 30 % | Le jour de l'acceptation du devis |
| `milestone` | 40 % | Date posée à la main |
| `balance` | 30 % | Date posée à la main |

| Champ | Type | Notes |
|---|---|---|
| `quote` | pointeur `Quote` | Obligatoire |
| `client` | pointeur `Client` | Obligatoire ; le client du devis |
| `kind` | `PaymentKindEnum` | `deposit`, `milestone`, `balance` |
| `percent` | entier | Repris de l'échéancier |
| `amount` | entier | Plus petite unité de la devise, dans la devise du devis |
| `status` | `PaymentStatusEnum` | `planned`, `due`, `paid`, `cancelled` |
| `dueDate` | date | Optionnelle |
| `paidAt` | date | Renseignée quand le statut passe à `paid`, aujourd'hui par défaut |
| `method` | `PaymentMethodEnum` | `transfer`, `card`, `cash`, `other` ; renseignée au paiement |
| `reference` | string | Référence du virement, facultative |

- **Création.** Quand un devis passe à `accepted`, le trigger `afterSave` du devis crée ses trois paiements : l'acompte en `due` avec la `dueDate` du jour, les deux autres en `planned`. Les montants viennent de `totalAmount` et le dernier absorbe le reste de l'arrondi, pour que les trois fassent toujours le total exact. Le trigger ne crée rien quand des paiements existent déjà pour le devis, donc une seconde sauvegarde ne peut pas les dupliquer. Aucun autre paiement n'est créé, et rien du tout pour un devis non accepté.
- **Marquer payé.** Un utilisateur passe un paiement à `paid` à la main et indique le moyen (et la référence s'il y en a une). Rien n'est encaissé en ligne ni relié à une banque.
- **Historique.** Un paiement `paid` n'est jamais modifié ni supprimé : une erreur se corrige en l'annulant (`cancelled`) et en enregistrant un nouveau, pour garder la trace. `delete` n'est donné à personne.
- **`paidAmount` sur le devis.** Le trigger `afterSave` de `Payment` le recalcule à partir des paiements `paid` du devis, donc le reste à payer est `totalAmount - paidAmount`.
- Index : `quote` + `status`, `status` + `dueDate` (la liste de ce qui est à payer).
- Une mission se retrouve par son devis : `Payment` ne porte pas de pointeur `mission`. Une mission `planned` dont l'acompte n'est pas encore `paid` peut afficher un rappel dans la liste ; cela ne change aucun statut.
- Droits : `Payment` est ajouté à la table des droits des rôles ; `create` et `update` reviennent au rôle commercial et au propriétaire.

## Serveur

Selon `apps/server/CLAUDE.md`, un fichier par couche et par entité, le tout branché :

- Types dans `src/types/`, schémas Zod dans `src/validations/_domain/`, listes de champs et limites dans `src/constants/_domain/`.
- Services (`cloud/services/_domain/`) : tous les `Parse.Query`, avec `select()` et un `limit()` nommé.
- Fonctions (`cloud/functions/_domain/<entité>.functions.ts`), chacune enveloppée dans `fromBO` et commençant par `resolveWorkspace` : liste, lecture, création, mise à jour, suppression (archivage pour un client). Importées dans `cloud/functions/index.ts`.
- Triggers (`cloud/triggers/_domain/`) : numéro et total du devis, transitions de statut, cohérence mission / client, refus de supprimer un client qui a encore des devis ou des missions. Importés dans `cloud/triggers/index.ts`.
- Index déclarés dans le code avec les autres index de base de `src/config/`, jamais à la main.
- Paiements : la constante d'échéancier, l'`afterSave` du devis qui crée les trois paiements à l'acceptation, les triggers de `Payment` (pas de modification d'un paiement `paid`, tenue de `paidAmount`) et les fonctions de liste et de mise à jour (aucune fonction de suppression).
- Registres du tableau de bord et de la recherche globale : le nombre de devis par statut comme première carte Aldaron ; la recherche sur les clients et les devis seulement si le registre existant peut limiter un résultat à un espace (voir [Questions ouvertes](#questions-ouvertes)).
- Clés i18n serveur en `fr`, `en` et `mg` pour chaque erreur levée.
- Permissions de classe : clé maître uniquement, comme les autres classes du back-office ; le client n'interroge jamais ces classes directement.

## Back-office

- Types, validations (react-hook-form + Zod), services, un fichier d'actions et un fichier de reducer par entité, reducers enregistrés dans `src/redux/store.ts`.
- Pages et containers sous `_domain/` (`quote/`, `client/`, `mission/`, au singulier), routes dans `routes/protected/_domain/`.
- Les entrées de la barre latérale sont ajoutées dans `useNavigationMenus.tsx` et affichées **uniquement quand l'espace actif est Aldaron** ; la règle de visibilité appartient au registre `WORKSPACES` (une liste d'entrées de menu par espace) pour rester une modification par espace, et non un `if` dans le hook.
- Chaque entité est ajoutée à la table des droits des rôles avec `registerRightsEntities`, depuis un fichier importé dans `config/domain-registrations.ts`.
- Une route saisie à la main depuis l'espace portfolio est refusée (redirection vers le tableau de bord), puisque le serveur la refuserait de toute façon.
- Deux raccourcis découlent de [Qui crée, et quand](#qui-crée-et-quand) : créer un client depuis le formulaire de devis, et un bouton « Créer la mission » sur un devis accepté. Chaque bouton n'est affiché qu'à un utilisateur qui détient le droit `create` de la collection visée.
- Les listes suivent le modèle existant (filtres, pagination) ; le formulaire de devis affiche le total calculé en direct, le serveur restant la source de vérité.
- Clés de traduction dans toutes les langues (`fr`, `en`, `mg`), `pnpm check-i18n` doit passer.

## Site web

Rien dans `apps/web`, et rien d'affiché dans `apps/aldaron-web` : ces collections sont réservées au back-office. Le seul changement dans `aldaron-web` est invisible : sa demande de devis envoie sa cible pour que le contact créé appartienne à Aldaron (voir [Demandes de devis du site](#demandes-de-devis-du-site)). `apps/web` est vérifié et laissé inchangé.

## Fichiers à toucher

| App / lib | Changement |
|---|---|
| `libs/shared-domain-constants` | `Client`, `Quote`, `Mission`, `Payment` dans `DOMAIN_COLLECTIONS` ; l'échéancier 30 / 40 / 30, lu par le serveur pour créer les paiements et par le back-office pour les afficher |
| `libs/shared-domain-types` | Enums de statuts, de phases et de types (`MissionStatusEnum`, `MissionPhaseEnum`…), seulement si le back-office et le serveur les utilisent (c'est le cas : ici, pas deux fois) |
| `apps/server` | Types, validations, constantes, services, fonctions, triggers, index, locales, carte du tableau de bord ; `target` et `quote` sur `Contact` (`createPublicContact`, fonctions de liste et de détail des contacts) |
| `apps/bo` | Types, validations, services, redux, pages, containers, routes, menu, registre `WORKSPACES`, enregistrement des droits, locales ; liste des contacts qui suit l'espace de travail et action « Créer le client et le devis » |
| `apps/aldaron-web` | `createQuoteRequest` envoie sa cible à `createPublicContact` |
| `docs/features/bo` | Une page française par entrée de barre latérale (devis, clients, missions) et leurs entrées dans `docs/features/bo/README.md` |
| `docs/inventory/README.md` | Les nouveaux fichiers de Cloud Functions et de triggers |
| `docs/code/design/en/WORKSPACE_SWITCH.md` et son jumeau | Marquer l'étape 4 ✅ quand les quatre collections sont terminées |

## Améliorations et manques

Une relecture de cette note a trouvé les points ci-dessous. Le premier groupe est déjà écrit dans le modèle plus haut ; les autres sont suivis ici avec le moment où les faire. Les marqueurs de statut suivent `implementation-completeness.md`.

### Écrit dans le modèle

- ⏳ **Révision et avenant d'un devis** : `version`, `parentQuote` (voir [Devis](#devis)).
- ⏳ **Preuve d'acceptation** : `acceptedAt`, `acceptanceMethod`, `acceptanceProof`.
- ⏳ **Qui fait une mission** : `assignee`.
- ✅ **E-mail du client en minuscules**, pour qu'une personne soit un seul client.
- ⏳ **Champs calculés fermés** : `number`, `version`, `totalAmount`, `paidAmount`, `amount` et `percent` sont calculés côté serveur, et la validation des fonctions de création et de mise à jour les **refuse** en entrée, pour qu'un client du back-office défaillant ou malveillant ne puisse pas les imposer. Fait pour le devis (`number`, `version`, `totalAmount`, `paidAmount`) ; `amount` et `percent` viendront avec les paiements.

### À construire avec la première collection

- ✅ **Numéro sans trou.** Une ligne de compteur (classe `Counter` : `name` comme `quote-2026`, `value`, index unique sur `name`) incrémentée de façon atomique avec `increment` de Parse dans la même sauvegarde, jamais lue puis écrite. Déclarée avec les autres index.
- ⏳ **Journal des changements.** Pour de l'argent, `updatedAt` ne suffit pas : qui a changé quel statut, et quand. Une collection d'événements en ajout seul (classe de l'entité, id, action, valeur précédente et nouvelle, utilisateur, date), écrite par les triggers des devis, paiements et missions. Vérifier d'abord si le projet a déjà un journal ; cette note ne l'a pas vérifié.
- ⏳ **Anonymiser un client.** L'archivage entre en conflit avec le droit à l'effacement d'un client particulier. Une action « anonymiser » (propriétaire seulement) efface nom, e-mail, téléphone, adresse, numéro fiscal et notes, garde l'id, les montants et les dates, et pose le statut `anonymized` ; les listes affichent un « client anonymisé » traduit. La durée de conservation des données comptables est à confirmer avec le comptable, et la politique de confidentialité d'`aldaron-web` doit dire combien de temps clients et devis sont gardés.
- ⏳ **Faire expirer les devis automatiquement.** Un job quotidien (`node-cron`, branché dans `index.ts` et importé dans `cloud/jobs/index.ts`) passe en `expired` un devis `sent` dont `validUntil` est dépassée. Il est ajouté aux jobs de `docs/inventory/README.md`.
- ⏳ **Fonctions pures dans `utils/`** : le total d'un devis, la répartition 30 / 40 / 30 avec son arrondi, et les changements de statut permis d'un devis, d'un paiement et d'une mission. Elles manipulent de l'argent et sont la partie à tester.

### Dans les listes et le tableau de bord

- ⏳ **Paiements en retard.** Pas de nouveau statut : un paiement `due` dont la `dueDate` est passée s'affiche « en retard » dans la liste et est compté dans une carte du tableau de bord.
- ⏳ **Acompte et démarrage.** Passer une mission en `inProgress` alors que l'acompte n'est pas `paid` affiche un avertissement, pas un blocage. Entrer en `testing` ou `release` suggère de poser la `dueDate` du paiement de 40 %.
- ⏳ **Cartes du tableau de bord.** Montant accepté, déjà encaissé, reste à encaisser, en retard, et devis par statut.
- ⏳ **Export CSV** des paiements, pour un comptable.

### Tâches séparées

- ⏳ **PDF et envoi d'un devis.** Le plus gros manque fonctionnel : sans eux un devis n'est qu'un enregistrement. Sa propre note (modèle Brevo, stockage du PDF, entrées d'inventaire).
- ⏳ **Un test runner pour le serveur.** Il n'en a pas, et les fonctions ci-dessus méritent des tests (la répartition et son arrondi, les transitions). À mettre en place comme tâche à part, pas dans celle-ci.
- ⏳ **Anciens contacts.** Un `Contact` créé avant le champ `target` se lit comme `portfolio` ; si des demandes Aldaron existent déjà, un job ponctuel les déplace, suivi dans `docs/code/todo/`.

### Plus tard, sans urgence

- ⏳ Plusieurs personnes de contact pour un client entreprise.
- ⏳ Un justificatif sur un paiement.
- ⏳ Notifications du back-office (devis accepté, paiement en retard).
- ⏳ Remises ou lignes négatives : à décider avant que la forme de `lines` soit définitive.

## Questions ouvertes

- **Ordre des collections.** La note de l'espace de travail construit les devis en premier. Un devis a besoin d'un client ; construire le client d'abord évite un devis sans vrai pointeur `client`. Recommandé : clients, puis devis, puis missions, puis paiements (qui ont besoin d'un devis accepté). Si les devis doivent passer en premier, le devis porte pour un temps un nom et un e-mail de client typés, et un job ponctuel les déplace ensuite vers une ligne `Client`.
- **Format de numérotation des devis** (`AL-2026-001`, ou une simple suite) : règle métier à confirmer. La suite doit être sans trou par année, donc le compteur est incrémenté côté serveur dans la même sauvegarde, jamais calculé dans le navigateur.
- **Document pour le client.** Un PDF ou un e-mail du devis est-il attendu ? Hors périmètre ici ; si oui, c'est une tâche à part (modèle Brevo, stockage Cloudinary) avec ses propres entrées d'inventaire. Recommandé : oui, comme prochaine note (voir [Améliorations et manques](#améliorations-et-manques)).
- **TVA et devise.** On suppose un taux de TVA et une devise par devis. Plusieurs taux par ligne, ou une devise par défaut dans les réglages, demandent une réponse avant que la forme de `lines` soit définitive.
- **Recherche et tableau de bord.** Le registre de la recherche globale ne filtre peut-être pas encore par espace : à vérifier avant d'y enregistrer clients et devis, sinon ils s'afficheraient à un utilisateur limité au portfolio.
- **Rôles de l'équipe.** Le tableau de [Qui crée, et quand](#qui-crée-et-quand) est une proposition : combien de personnes travaillent chez Aldaron, et une même personne fait-elle commercial et réalisation ? Un seul rôle qui détient tout suffit dans ce cas.
- **Cycle de vie d'une mission.** Trois points à trancher : un statut `onHold` (non prévu, aucun cas concret aujourd'hui), la réouverture d'une mission `done` (au propriétaire seulement, si elle existe), et prévenir quelqu'un quand une mission est annulée. Les phases sont proposées facultatives ; faire dépendre la liste d'un type de mission est laissé de côté.
- **Demandes de devis du site.** L'option B de [Demandes de devis du site](#demandes-de-devis-du-site) est recommandée et supposée dans l'ordre de travail ; à confirmer avant de la construire.
- **Contacts et newsletter** restent la question ouverte de la note de l'espace de travail. Le champ `target` sur `Contact` ne la tranche que pour les demandes de devis : la newsletter n'est pas touchée ici.

## Ordre de travail

1. ✅ Constantes et enums partagés, `Client` côté serveur (service, fonctions, trigger, index, i18n).
2. ✅ `Client` dans le back-office (pages, route, entrée de menu via le registre, droits), et sa page de fonctionnalité française.
3. ✅ `Quote` côté serveur (numéro, total, transitions), puis dans le back-office, et sa page de fonctionnalité française. Le fichier de preuve d'acceptation a son propre ticket (`025-attach-an-acceptance-proof-file-to-a-quote`).
   ⏳ Puis les demandes de devis : `target` et `quote` sur `Contact`, la cible envoyée par `aldaron-web`, la liste des contacts qui suit l'espace de travail et l'action « Créer le client et le devis ».
4. ⏳ `Mission` côté serveur, puis dans le back-office, et sa page de fonctionnalité française.
5. ⏳ `Payment` : la constante d'échéancier, la création à l'acceptation, les triggers, puis le back-office (paiements d'un devis, marquer payé), et sa page de fonctionnalité française.
6. ⏳ Carte du tableau de bord, inventaire, et marquage de l'étape 4 ✅ dans la note de l'espace de travail.
