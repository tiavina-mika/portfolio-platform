# Revue — Ajouter la collection des clients à l'espace Aldaron

- **Branche** : `feat/aldaron-client-collection`
- **Type** : Nouvelle fonctionnalité
- **Auteur** : tiavina-mika — `tiavinamika@gmail.com` *(identité git locale)*
- **Créée** : 2026-11-23 à 12:14
- **Applications touchées** : Serveur, Back-office (et les bibliothèques partagées `shared-domain-constants`,
  `shared-domain-types`)

## Table des matières

- [En bref](#en-bref)
- [Base de données](#base-de-données)
- [Serveur](#serveur)
- [Back-office](#back-office)
- [Voir le résultat en local](#voir-le-résultat-en-local)
- [Bugs, régressions et failles possibles](#bugs-régressions-et-failles-possibles)
- [Résultat par critère d'acceptation](#résultat-par-critère-dacceptation)
- [Vérifications lancées](#vérifications-lancées)
- [Ce qui reste à faire](#ce-qui-reste-à-faire)

## En bref

L'espace Aldaron reçoit sa première liste métier : les clients pour qui Aldaron travaille. Un utilisateur
du back-office qui travaille dans Aldaron, avec les droits correspondants, peut lister, chercher, créer,
modifier et archiver des clients, et remettre un client archivé dans la liste. Une adresse e-mail, quelle
que soit sa casse, désigne un seul client. L'entrée est cachée dans l'espace portfolio, et le serveur
refuse tout appel sur les clients à un compte dont les rôles n'ouvrent pas Aldaron. Rien n'est public : le
site n'est pas touché. Un rôle peut aussi désormais être enregistré avec des droits sur une classe du
domaine (`Project`, `Client`), ce que le serveur refusait.

## Base de données

| Classe | Nouvelle ? | Champs ajoutés / modifiés | À quoi elle sert |
|---|---|---|---|
| `Client` | oui | `name`, `kind` (`company` / `person`), `email` (enregistré sans espaces et en minuscules), `phone`, `address` (`line1`, `line2`, `postalCode`, `city`, `country`), `taxId`, `notes`, `status` (`active` / `archived` / `anonymized`), `createdBy`, `updatedBy` | les clients de l'espace Aldaron |

Index ajoutés :

- `{ email: 1 }`, unique, partiel sur une adresse non vide (`clientEmail_unique`) : un e-mail, un client,
  même quand deux enregistrements arrivent au même moment ; un client anonymisé à l'adresse effacée
  n'entre jamais en collision.
- `{ status: 1, name: 1 }` : la liste, un onglet (statut) trié ou cherché par nom.

La classe n'a aucun accès public : ses permissions de classe ne reprennent jamais les droits des rôles,
seuls les rôles les plus élevés gardent l'accès direct ; tout passe par les Cloud Functions.

## Serveur

- Cinq nouvelles Cloud Functions, qui vérifient d'abord que les rôles du compte ouvrent l'espace Aldaron,
  puis le droit sur `Client` : liste (`getClients`, recherche sur le nom ou l'e-mail, filtre sur le type et
  le statut, taille de page plafonnée), lecture (`getClient`), création (`createClient`), modification
  (`updateClient`), archivage ou remise dans la liste (`archiveClient`). Aucune fonction de suppression.
- Un trigger `beforeSave` sur `Client` pose le statut à la création, note qui l'a créé et modifié, met
  l'e-mail en minuscules et refuse une adresse déjà prise par un autre client, avec un message traduit qui
  nomme ce client.
- Les entrées sont validées strictement : le statut, les auteurs ou tout champ inconnu sont refusés.
- La validation des rôles accepte désormais les classes du domaine : un rôle avec un droit sur `Client`
  peut être enregistré.
- Messages en `fr`, `en`, `mg`. Inventaire mis à jour : tableau Cloud Code de
  [docs/inventory/README.md](../../../inventory/README.md),
  [Cloud Functions](../../../inventory/code/fr/CLOUD_FUNCTIONS.FR.md),
  [collections et index](../../../inventory/code/fr/COLLECTIONS_AND_INDEXES.FR.md),
  [rôles et permissions](../../../inventory/code/fr/ROLES_AND_PERMISSIONS.FR.md). Aucune nouvelle variable
  d'environnement, aucun nouveau service.

## Back-office

- **Pages touchées** : **Clients** (nouvelle), `http://localhost:5173/clients` (en français : `/clients`),
  dans le groupe **Opérations** du menu, seulement quand l'espace actif est Aldaron ; **Rôles** (la ligne
  Clients apparaît maintenant dans les droits).
- La liste a les onglets « Tous », « Actifs » et « Archivés », une recherche (nom ou e-mail), un filtre sur
  le type, le tri et la pagination. Chaque ligne montre le client, son type, son téléphone, ses dates et
  son statut.
- **Nouveau client** et **Modifier** ouvrent une fenêtre au-dessus de la liste. Un refus (adresse déjà
  prise) garde la fenêtre ouverte avec ce qui a été saisi.
- Le menu de la ligne archive un client, ou remet un client archivé dans la liste.
- Depuis l'espace portfolio, l'entrée est absente et l'adresse tapée à la main ramène au tableau de bord.
- Doc fonctionnelle : [Clients](../../../features/bo/clients/fr/CLIENTS.FR.md), listée dans
  l'[index des fonctionnalités du BO](../../../features/bo/README.md).

## Voir le résultat en local

```bash
pnpm nx run server:dev
pnpm nx run bo:dev       # back-office sur l'URL de Vite (http://localhost:5173 par défaut)
```

Se connecter avec un compte Propriétaire, Paramètres → Espace → Aldaron, puis menu → **Clients**
(`http://localhost:5173/clients`).

## Bugs, régressions et failles possibles

| Gravité | Type | Ce qui peut arriver | Quand | Suite |
|---|---|---|---|---|
| 🟠 Moyenne | Faille | Une requête SDK directe sur `Client` par un rôle limité au portfolio, avec tous les droits sur les clients, contournerait la vérification de l'espace | un rôle qui n'ouvre que Portfolio, avec des droits sur les clients | ✅ corrigé sur la branche : `Client` ne reçoit aucun droit de rôle dans ses permissions de classe (test unitaire `security.service.cloud.test.ts`) |
| 🟡 Faible | Bug | Deux enregistrements de la même nouvelle adresse au même moment : le second était refusé par l'index unique avec le message brut de Parse en anglais | deux utilisateurs créent le même client dans la même seconde | ✅ corrigé sur la branche : le refus de l'index devient le message traduit « déjà celle du client … » |
| 🟡 Faible | Bug | Passer à l'espace portfolio depuis la liste des clients laissait la liste à l'écran (le serveur refuse tout nouvel appel) | changement d'espace depuis la page Clients | ✅ corrigé sur la branche : la page revient au tableau de bord quand l'espace n'est plus Aldaron |
| 🟢 Faible | Régression | Le hook du menu filtre maintenant les entrées par espace pour tous les groupes | menu du portfolio | ✅ vérifié : le registre ne cache que `clients`, le menu du portfolio est inchangé par ailleurs |

Aucun risque reporté, pas de fichier de dette. Les cas en conditions réelles ne sont pas lancés (voir
[Vérifications lancées](#vérifications-lancées)).

## Résultat par critère d'acceptation

| Critère | Résultat | Preuve |
|---|---|---|
| Un utilisateur avec l'espace `aldaron` et le droit `create` peut créer un client depuis le back-office | partiel — code fait, non lancé en réel | fonctions + fenêtre ; test de validation `client.validations.test.ts` ; pas de base locale pour le lancer |
| Deux e-mails qui ne diffèrent que par la casse donnent un seul client | partiel — code fait, normalisation testée | `client.utils.test.ts` ; trigger + index unique non lancés en réel |
| Un client peut être modifié et archivé, et un client archivé peut être écarté de la liste | partiel — code fait, non lancé en réel | `updateClient`, `archiveClient`, onglets « Actifs » / « Archivés » |
| Un utilisateur limité au portfolio ne voit aucune entrée clients et ne peut pas appeler les fonctions clients | partiel — partie permissions de classe testée | `security.service.cloud.test.ts` ; registre du menu ; `resolveWorkspace` dans chaque fonction, non lancé en réel |
| L'entrée du menu n'apparaît que quand l'espace actif est Aldaron | partiel — code fait, non lancé en réel | `hiddenMenuIds` dans le registre des espaces |
| Les libellés et erreurs existent en `fr`, `en` et `mg` | traité | `pnpm check-i18n` |

Écarts avec le plan : la garde de suppression (`beforeDelete`) reste un `TODO(link:...)`, les devis et les
missions n'existent pas encore ; les permissions de classe ont été verrouillées (`FUNCTION_ONLY_CLASSES`),
ce que le plan laissait pour plus tard.

## Vérifications lancées

Nx s'est bloqué sur la machine (aucune sortie, un verrou sur `.nx/workspace-data`) : les scripts des
applications ont été lancés directement.

| Commande | Résultat |
|---|---|
| `pnpm --filter portfolio-server run typecheck` | ok |
| `pnpm --filter portfolio-bo run typecheck` | ok |
| `pnpm --filter portfolio-server run test` | ok, 4 fichiers, 30 tests |
| ESLint sur chaque fichier serveur et bo touché | 0 erreur (un avertissement fast-refresh sur le fichier de route, le même que sur les routes projet existantes) |
| `pnpm check-i18n`, `pnpm check-doc-links`, `pnpm check-doc-twins --worktree`, `pnpm lint:docs` | ok |
| Build | laissé à la CI de la PR |

Non vérifié : tous les cas en conditions réelles (une session back-office sur une base). Aucune base
locale n'est configurée sur la machine qui a fait le travail ; les cas sont listés dans le `tc-manual.md`
du ticket.

## Ce qui reste à faire

- Les cas réels de `tc-manual.md` (création, e-mail en double, modification / archivage / remise dans la
  liste, compte limité au portfolio, menu par espace, rôle enregistré avec des droits sur les clients).
- La garde de suppression, quand les devis existeront (`020-add-the-quote-collection-to-the-aldaron-workspace`).
- L'anonymisation (`120-anonymize-an-aldaron-client`).
