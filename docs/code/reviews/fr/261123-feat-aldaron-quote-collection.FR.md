# Revue — Ajouter la collection des devis à l'espace Aldaron

- **Branche** : `feat/aldaron-quote-collection`
- **Type** : Nouvelle fonctionnalité
- **Auteur** : tiavina-mika — `tiavinamika@gmail.com` *(identité git locale)*
- **Créée** : 2026-11-23 à 15:46
- **Applications touchées** : Serveur, Back-office (et les bibliothèques partagées `shared-domain-constants`,
  `shared-domain-types`, `shared-domain-utils`)

## Table des matières

- [En bref](#en-bref)
- [Base de données](#base-de-données)
- [Serveur](#serveur)
- [Back-office](#back-office)
- [Voir le résultat en local](#voir-le-résultat-en-local)
- [Bugs, régressions et failles possibles](#bugs-régressions-et-failles-possibles)
- [Résultat par critère d'acceptation](#résultat-par-critère-dacceptation)
- [Vérifications lancées](#vérifications-lancées)
- [Ce qu'il reste à faire](#ce-quil-reste-à-faire)

## En bref

L'espace Aldaron reçoit ses devis. Une personne du back-office qui travaille dans Aldaron, avec les droits
correspondants, rédige un devis brouillon pour un client actif (ou crée le client depuis le formulaire du
devis), avec des lignes chiffrées, une devise (euro ou ariary), un taux de TVA facultatif et un total
calculé pendant la saisie. Chaque devis reçoit un numéro lisible `AL-<année>-<NNN>` sans trou dans
l'année. Un brouillon est ensuite marqué envoyé, puis accepté (avec la façon dont le client a accepté),
refusé ou expiré ; tout autre passage est refusé et un devis sorti du brouillon ne peut plus être modifié.
Une devise par défaut, dans les paramètres, pré-remplit seulement un nouveau devis. Un client qui a des
devis ne peut plus être supprimé. Rien n'est public : le site n'est pas touché.

## Base de données

| Classe | Nouvelle ? | Champs ajoutés / changés | À quoi elle sert |
|---|---|---|---|
| `Quote` | oui | `number`, `client` (pointeur), `title`, `status`, `lines` (`label`, `quantity`, `unitAmount`), `currency`, `taxRate`, `totalAmount`, `paidAmount`, `issuedAt`, `validUntil`, `notes`, `version`, `acceptedAt`, `acceptanceMethod`, `createdBy`, `updatedBy` | les devis de l'espace Aldaron ; les montants sont des entiers dans la plus petite unité de la devise du devis |
| `Counter` | oui | `name`, `value` | séquences nommées incrémentées par la base elle-même ; `quote-<année>` numérote les devis d'une année |

Index ajoutés :

- `Quote` `{ number, version }` unique : un numéro, une version (une révision gardera le numéro).
- `Quote` `{ _p_client, status }` : les devis d'un client, et le refus de supprimer un client qui en a.
- `Quote` `{ status, issuedAt }` : la liste, un statut par onglet.
- `Counter` `{ name }` unique : une ligne par séquence, ce qui règle deux premiers devis d'une année créés
  en même temps.

`Quote` et `Counter` sont réservés aux rôles les plus élevés au niveau de la classe ; `Quote` n'est atteint
que par ses Cloud Functions, comme `Client`.

## Serveur

- Cinq Cloud Functions, qui vérifient d'abord l'espace Aldaron, puis le droit du rôle (`getQuotes`,
  `getQuote`, `createQuote`, `updateQuote`, `changeQuoteStatus`). Pas de fonction de suppression.
- Un trigger `beforeSave` sur `Quote` : un nouveau devis naît brouillon, version 1, rien de payé ; le total
  est recalculé à chaque sauvegarde ; le numéro est pris en dernier, une fois tous les refus passés, dans
  le fuseau horaire de l'activité ; le statut ne fait que `draft → sent → accepted | refused | expired` ;
  un devis sorti du brouillon garde son contenu ; l'envoi le date, l'acceptation date l'acceptation et
  exige la façon d'accepter. Le numéro, la version, les dates et les auteurs sont remis s'ils sont écrits
  par autre chose.
- Un trigger `beforeDelete` sur `Client` refuse la suppression d'un client qui a des devis (le lien laissé
  ouvert par la branche des clients).
- Erreurs en `fr`, `en` et `mg`. Inventaire mis à jour (`docs/inventory/README.md`, Cloud Code,
  collections et index, rôles). Aucune variable d'environnement, aucun service externe.

## Back-office

- **Pages touchées** : **Devis** (nouvelle), `http://localhost:5173/devis` (en français ; `/quotes` en
  anglais), dans l'espace Aldaron seulement ; **Paramètres → Langues**, `http://localhost:5173/parametres`
  (nouvelle ligne dans Aldaron).
- La liste : un onglet par statut, recherche sur le numéro ou le titre, colonnes devis (numéro et titre),
  client (lu à jour par le pointeur), total dans la devise du devis, dates, statut, actions.
- La fenêtre « Nouveau devis » / « Modifier » (brouillon seulement) : choix du client parmi les clients
  actifs avec un raccourci « Nouveau client », titre, lignes (au moins une, 50 au plus), devise, taux de
  TVA, validité, conditions, et le total HT / TVA / TTC mis à jour pendant la saisie.
- Les actions de la ligne ne proposent que les passages permis ; « Marquer comme accepté » demande comment
  le client a accepté.
- Paramètres → Langues, dans Aldaron : « Devise par défaut des devis » (une préférence locale), qui
  pré-remplit seulement les nouveaux devis. La page générique des paramètres l'affiche par un registre :
  `_core` n'importe pas le code des devis.
- Droits : « Devis » dans le tableau des droits des rôles. Docs de fonctionnalité :
  [Devis](../../../features/bo/quotes/fr/QUOTES.FR.md), [Clients](../../../features/bo/clients/fr/CLIENTS.FR.md),
  [Paramètres](../../../features/bo/settings/fr/SETTINGS.FR.md).

## Voir le résultat en local

```bash
pnpm nx run server:dev   # demande une base de données
pnpm nx run bo:dev       # back-office sur l'URL de Vite (http://localhost:5173 par défaut)
```

Se connecter avec un rôle qui ouvre Aldaron, passer l'espace sur Aldaron dans les Paramètres, puis ouvrir
**Devis** (`http://localhost:5173/devis`). Pas de story : le back-office n'a pas de Storybook.

## Bugs, régressions et failles possibles

| Gravité | Type | Ce qui peut arriver | Quand | Suite |
|---|---|---|---|---|
| 🟠 Moyenne | Bug | Un devis créé juste après minuit le 1er janvier à Madagascar prend le numéro de l'année précédente | l'année était lue en UTC | ✅ corrigé sur la branche : l'année est lue dans le fuseau de l'activité (`getQuoteNumberYear`, testé) |
| 🟡 Faible | Bug | Une case TVA vide donnait `null` à un champ texte, qui n'est alors plus piloté par le formulaire | ouverture du formulaire | ✅ corrigé sur la branche : la case part vide (`''`), la validation la change en `null` |
| 🟡 Faible | Bug | Un numéro est perdu (un trou dans l'année) si la base échoue entre l'incrément du compteur et l'écriture du devis | panne rare de la base | ⏳ reporté — [dette n° 1](debt/261123-feat-debt-aldaron-quote-collection.FR.md#1-un-trou-dans-la-numérotation-après-une-écriture-ratée) |
| 🟡 Faible | Bug | Deux personnes modifient le même brouillon en même temps : la dernière sauvegarde l'emporte sans prévenir | modifications simultanées | ⏳ reporté — [dette n° 2](debt/261123-feat-debt-aldaron-quote-collection.FR.md#2-deux-personnes-sur-le-même-brouillon) |

Vérifié, sans risque : deux changements de statut au même moment (le trigger lit le statut enregistré, le
second passage est donc refusé) ; les dates envoyées par le back-office (Parse les redonne en dates avant
la validation) ; `createOrUpdateClient` modifié (un argument facultatif de plus, la page Clients ne change
pas) ; le panneau Langues des paramètres (rien de nouveau hors d'Aldaron).

Fichier de dette : [261123-feat-debt-aldaron-quote-collection.FR.md](debt/261123-feat-debt-aldaron-quote-collection.FR.md).

## Résultat par critère d'acceptation

| Critère | Résultat | Preuve |
|---|---|---|
| Créer un brouillon pour un client existant et voir son total | traité, essai réel non fait | total : `quote.utils.test.ts` ; formulaire et trigger : code ; pas de base locale |
| Devise propre et taux de TVA facultatif, total aux décimales de la devise | traité | `quote.utils.test.ts`, `quote.validations.test.ts` |
| Changer la devise par défaut ne change pas un devis existant | traité, essai réel non fait | le réglage ne remplit que les `defaultValues` d'un nouveau devis ; un devis stocke `currency` |
| Un numéro lisible unique sans trou dans l'année | traité, essai réel non fait | `quote.utils.test.ts` (format, compteur par année, passage d'année) ; `$inc` atomique + index uniques ; trou reporté en cas de panne de la base |
| `draft → sent → accepted / refused / expired`, rien d'autre | traité | `quote.utils.test.ts` (passages), `quote.validations.test.ts` (jamais retour au brouillon) ; trigger |
| Les lignes d'un devis sorti du brouillon ne changent pas | traité, essai réel non fait | trigger `QUOTE_FROZEN_FIELDS`, `updateQuote` refuse un devis non brouillon |
| Numéro, total ou montant payé dans la requête ne changent rien | traité | `quote.validations.test.ts` (entrée refusée) ; le trigger recalcule le total et remet le numéro |
| Accepter note la date et la façon (et un fichier de preuve facultatif) | partiel | date et façon : trigger + test de validation ; le fichier de preuve est séparé dans `025-attach-an-acceptance-proof-file-to-a-quote` |
| La liste filtre par statut et montre le nom du client sans copie | traité, essai réel non fait | `include('client')` + `select`, onglets par statut |
| Libellés et erreurs en `fr`, `en` et `mg` | traité | `pnpm check-i18n` |

## Vérifications lancées

- `pnpm nx run-many -t lint typecheck -p server bo shared-domain-utils shared-domain-constants shared-domain-types` : ok (0 erreur).
- `pnpm nx run-many -t test build -p server bo` : ok ; tests du serveur 6 fichiers, 68 tests.
- `pnpm check-i18n`, `pnpm check-doc-links`, `pnpm check-doc-twins --worktree`, `pnpm lint:docs` : ok.
- Non vérifié : tous les cas réels (pas de base de données locale sur la machine qui a fait le travail).

## Ce qu'il reste à faire

- Les cas réels de `tickets/work/add-the-quote-collection-to-the-aldaron-workspace/tc-manual.md`.
- Le fichier de preuve d'acceptation : `025-attach-an-acceptance-proof-file-to-a-quote`.
- Révisions, demandes du site, PDF et envoi, paiements, expiration automatique : leurs propres tickets
  (`030`, `040`, `110`, `060`, `130`).
