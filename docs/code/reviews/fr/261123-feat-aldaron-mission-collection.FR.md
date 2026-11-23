# Revue — Missions de l'espace Aldaron

- **Branche** : `feat/aldaron-mission-collection`
- **Type** : Nouvelle fonctionnalité
- **Auteur** : `tiavinamika@gmail.com` (identité git locale ; écrit par `/dev --auto`)
- **Créée** : 2026-11-23 à 20:48
- **Apps touchées** : Serveur, Back-office (et les bibliothèques partagées du domaine)

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

L'espace Aldaron peut maintenant noter ses **missions** : le travail fait pour un client, le plus souvent
après un devis accepté. Une mission s'écrit pour un client actif, rattachée si besoin à l'un de ses devis
acceptés, confiée à un membre de l'équipe, et n'avance que dans un sens : planifiée, en cours, terminée,
ou annulée. Chaque statut a ses propres phases facultatives (maquettes, tests, garantie…). Un devis
accepté propose « Créer la mission », qui ouvre le formulaire prérempli avec le client, le titre et le
devis. Rien ne se fait tout seul : accepter un devis ne crée pas de mission. Un client qui a des missions
ne peut plus être supprimé.

## Base de données

| Classe | Nouvelle ? | Champs ajoutés / changés | À quoi elle sert |
|---|---|---|---|
| `Mission` | oui | `title`, `client` (pointeur), `quote` (pointeur, facultatif), `status`, `assignee` (pointeur `_User`, facultatif), `phase`, `startDate`, `endDate`, `description`, `createdBy`, `updatedBy` | le travail fait pour un client |

Index ajoutés (déclarés au démarrage dans `apps/server/src/config/db-indexes.ts`) :

- `_p_client` + `status` : les missions d'un client, et le refus de supprimer un client qui en a.
- `status` + `startDate` : la liste, un onglet par statut.
- `_p_assignee` + `status` : « Mes missions ».

`Mission` est fermée à l'accès direct du SDK (`ALWAYS_LOCKED_CLASSES`, `FUNCTION_ONLY_CLASSES`) : on
l'atteint par ses Cloud Functions seulement. Pas de migration : la classe est créée par sa première
sauvegarde.

## Serveur

- Six nouvelles Cloud Functions, chacune vérifiant l'espace Aldaron puis le droit sur `Mission`
  (`getMissions`, `getMission`, `createMission`, `updateMission`, `changeMissionStatus`,
  `getMissionAssignees`). Pas de fonction de suppression.
- Un trigger `beforeSave` porte toutes les règles, quoi qui enregistre la mission : née planifiée ; statut
  seulement vers l'avant, `done` et `cancelled` définitifs ; une phase doit appartenir au statut et est
  effacée quand le statut change ; démarrer ou terminer remplit une date de début ou de fin vide ; la fin
  jamais avant le début (au jour, là où l'entreprise travaille) ; client et devis figés dès que la mission
  a quitté planifiée ; devis accepté et du même client ; personne assignée capable d'ouvrir l'espace Aldaron.
- Le trigger `beforeDelete` du client refuse aussi un client qui a des missions.
- La liste des devis accepte un filtre par client, pour que le formulaire de mission propose les devis
  acceptés de son client.
- Messages du serveur en `fr`, `en`, `mg`. Inventaire mis à jour (`docs/inventory/README.md` et ses pages
  de code).

## Back-office

- **Pages touchées** : Missions (nouvelle, `http://localhost:5174/missions`), Devis
  (`http://localhost:5174/devis` en français, `/quotes` en anglais).
- Une entrée **Missions** dans le menu, visible seulement dans l'espace Aldaron et avec le droit `find` ;
  une adresse tapée depuis l'espace portfolio ramène au tableau de bord.
- La liste : un onglet par statut, une recherche sur le titre, « Mes missions » dans la recherche avancée,
  le devis sous le titre, qui la réalise, les dates, le statut avec sa phase.
- Une fenêtre pour créer et modifier (choix du client avec le raccourci « Nouveau client », titre, devis
  accepté du client, personne, phase du statut actuel, dates, description) ; actions de ligne Démarrer /
  Marquer comme terminée / Annuler, seulement celles permises.
- Dans la liste des devis, **« Créer la mission »** sur un devis accepté, avec le droit `create` sur les
  missions.
- Le choix du client du formulaire de devis a été déplacé dans les conteneurs du client pour que les deux
  formulaires le partagent (même comportement).
- Missions ajoutées au tableau des droits des rôles. Docs de fonctionnalité :
  [Missions](../../../features/bo/missions/fr/MISSIONS.FR.md) (nouvelle),
  [Devis](../../../features/bo/quotes/fr/QUOTES.FR.md) et [Clients](../../../features/bo/clients/fr/CLIENTS.FR.md)
  mises à jour.

## Voir le résultat en local

```bash
pnpm nx run server:dev
pnpm nx run bo:dev
```

Puis, dans l'espace Aldaron : `http://localhost:5174/missions` et `http://localhost:5174/devis`
(un devis accepté → menu de la ligne → « Créer la mission »).

## Bugs, régressions et failles possibles

| Gravité | Type | Ce qui peut arriver | Quand | Suite |
|---|---|---|---|---|
| 🟠 Moyenne | Bug | Le formulaire refusait une date de fin le même jour qu'un début rempli par le serveur (comparaison à l'heure près alors que le serveur compare au jour) | En modifiant une mission démarrée et en choisissant aujourd'hui comme fin | ✅ corrigé sur la branche : le formulaire compare aussi au jour |
| 🟡 Faible | Régression | Le choix du client du formulaire de devis a été déplacé et ses clés de libellés ont changé | En écrivant un devis | ✅ vérifié sur la branche : même composant, `check-i18n`, typecheck et build passent |
| 🟡 Faible | Bug | Un membre qui n'a l'espace Aldaron que par un rôle parent n'est ni proposé ni accepté comme personne assignée | Rôles construits avec l'héritage de rôles de Parse | ⏳ reporté — [dette n° 1](debt/261123-feat-debt-aldaron-mission-collection.FR.md#1-personnes-assignées-par-un-rôle-hérité) |
| 🟡 Faible | Bug | Le formulaire compare les jours dans le fuseau du navigateur, le serveur dans celui d'Antananarivo : un admin à l'étranger peut voir un refus différent près de minuit | Un admin hors du fuseau de l'entreprise | ⏳ reporté — [dette n° 2](debt/261123-feat-debt-aldaron-mission-collection.FR.md#2-jour-des-dates-dans-le-navigateur-et-sur-le-serveur) |
| 🟡 Faible | Faille | `getMissionAssignees` renvoie les noms et e-mails de l'équipe Aldaron à tout compte autorisé à lister les missions | Toujours | ✅ accepté par conception : ce sont des collègues du même espace, et l'appel vérifie l'espace et le droit |

Points reportés : [fichier de dette](debt/261123-feat-debt-aldaron-mission-collection.FR.md).

## Résultat par critère d'acceptation

| Critère | Résultat | Preuve |
|---|---|---|
| Une mission se crée depuis un devis accepté, préremplie | Traité, pas lancé en vrai | action de `Quotes.tsx` + préremplissage de `MissionForm` ; typecheck, build ; cas réel dans `tc-manual.md` |
| Un devis non accepté ou d'un autre client est refusé | Traité | `canLinkQuoteToMission` testé (`mission.utils.test.ts`) ; trigger `assertLinkableQuote` |
| Le statut n'avance que vers l'avant | Traité | transitions partagées testées ; `changeMissionStatusSchema` refuse `planned` |
| Une phase d'un autre statut est refusée, effacée au changement de statut | Traité | `isMissionPhaseOfStatus` testé ; le trigger efface la phase au changement de statut |
| Démarrer ou terminer remplit une date vide | Traité | `getMissionDatesToFill` testé |
| Un client qui a des missions ne peut pas être supprimé | Traité, pas lancé en vrai | `beforeDelete` du client + `hasClientMissionsService` |

Écarts avec `implementation.md` : aucun, sauf le rappel `onPick` du choix du client, retiré car inutilisé.
Aucun cas réel n'a été lancé : aucune base n'est joignable sur la machine (port 27017 fermé).

## Vérifications lancées

- `pnpm nx run-many -t lint typecheck -p server bo shared-domain-utils shared-domain-constants shared-domain-types` :
  ok (bo : 48 avertissements, tous `react-refresh/only-export-components` sur les fichiers de routes, le
  motif existant).
- `pnpm nx run server:test` : ok, 9 fichiers, 135 tests.
- `pnpm nx run-many -t build -p server bo` : ok.
- `pnpm check-i18n`, `pnpm check-doc-links`, `pnpm check-doc-twins --worktree`, `pnpm lint:docs` : ok.

## Ce qui reste à faire

- Les cas réels de `tickets/work/add-the-mission-collection-to-the-aldaron-workspace/tc-manual.md`
  (préproduction).
- Les paiements et l'alerte d'acompte au démarrage d'une mission :
  `060-add-quote-payments-with-the-30-40-30-schedule`.
- Les points ⚠️ ouverts de la note de conception (un statut `onHold`, rouvrir une mission terminée, une
  notification à l'annulation) restent à décider.
