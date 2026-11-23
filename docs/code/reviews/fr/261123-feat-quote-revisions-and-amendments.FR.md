# Revue — Ajouter les révisions et les avenants de devis

- **Branche** : `feat/quote-revisions-and-amendments`
- **Type** : Nouvelle fonctionnalité
- **Auteur** : tiavina-mika *(identité git locale ; l'e-mail n'a pas pu être lu dans cette session)*
- **Créée** : 2026-11-23 à 18:25
- **Apps touchées** : Serveur, Back-office (et la bibliothèque partagée `shared-domain-utils`)

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

Dans l'espace Aldaron, un devis envoyé peut maintenant être **révisé** : « Réviser » crée une copie
brouillon sous le même numéro avec la version suivante (v2, v3…), et la version envoyée devient expirée.
Un devis accepté peut être complété par un **avenant** : « Créer un avenant » ouvre le formulaire de devis
pré-rempli avec le client (verrouillé), la devise, le taux de TVA et les conditions, et l'avenant reçoit
son propre numéro. Dans la liste, un devis révisé affiche sa version après le numéro, et chaque révision
ou avenant nomme le devis dont il vient. Un devis accepté n'est jamais révisé.

## Base de données

| Classe | Nouvelle ? | Champs ajoutés / modifiés | À quoi ça sert |
|---|---|---|---|
| `Quote` | non | `parentQuote` *(ajouté : pointeur `Quote`, facultatif)* ; `version` *(désormais au-dessus de 1 pour une révision)* | le devis qu'une révision révise ou qu'un avenant complète |

Pas de nouvel index : `parentQuote` n'est lu qu'avec le devis (par `include`), jamais filtré ni trié.
L'index unique `number` + `version` existait déjà et sert enfin : il refuse deux révisions de la même
version écrites au même moment. Les devis créés avant la branche sont des premières versions sans parent.

## Serveur

- Nouvelle Cloud Function `reviseQuote` (`id`) : un devis envoyé seulement ; un devis accepté reçoit
  « créez plutôt un avenant ». Elle écrit une copie brouillon (contenu, client, TVA, conditions ; la
  validité seulement si elle est encore à venir) qui pointe vers le devis envoyé, puis fait expirer
  celui-ci. Elle demande les droits `create` et `update` sur `Quote`.
- `createQuote` accepte un `parentQuote` facultatif : seul un devis accepté reçoit un avenant.
- Le trigger `beforeSave` de `Quote` décide d'après le statut du devis visé, quel que soit l'appelant :
  envoyé → révision (son numéro, sa version + 1, aucun nouveau numéro pris au compteur) ; accepté →
  avenant (un numéro à lui) ; sinon refus. Le client doit être celui du parent, à la création comme à
  chaque modification. `parentQuote` appartient désormais au serveur : une modification ne peut pas le
  changer.
- La liste et la lecture d'un devis renvoient le numéro et la version du parent. Sept nouvelles erreurs
  traduites (`fr`, `en`, `mg`).
- Inventaire mis à jour : [Cloud Functions](../../../inventory/code/fr/CLOUD_FUNCTIONS.FR.md)
  (`reviseQuote`). Aucune nouvelle variable ni service.

## Back-office

- **Pages touchées** : **Devis**, `http://localhost:5174/devis` (en français ; `/quotes` en anglais),
  espace Aldaron seulement.
- Menu de la ligne d'un devis envoyé : **Réviser**, après une confirmation qui dit que la version envoyée
  expire aussitôt. Le nouveau brouillon apparaît en haut de la liste.
- Menu de la ligne d'un devis accepté : **Créer un avenant**, qui ouvre le formulaire titré « Nouvel
  avenant au devis AL-… », client verrouillé et expliqué sous le champ.
- La colonne « Devis » affiche `AL-2026-001 · v2` pour une révision, et une ligne « Révise AL-2026-001 v1 »
  ou « Avenant au devis AL-2026-003 ». Modifier le brouillon d'une révision ou d'un avenant garde son
  client verrouillé.
- Doc fonctionnelle mise à jour : [Devis](../../../features/bo/quotes/fr/QUOTES.FR.md).

## Voir le résultat en local

```bash
pnpm nx run server:dev   # demande une base de données dans apps/server/.env.*
pnpm nx run bo:dev       # back-office sur http://localhost:5174
```

Se connecter avec un poste qui ouvre Aldaron, passer dans l'espace Aldaron, ouvrir **Devis**
(`http://localhost:5174/devis`), réviser un devis envoyé, puis créer un avenant à un devis accepté. Pas de
story : le back-office n'a pas de Storybook.

## Bugs, régressions et failles possibles

| Gravité | Type | Ce qui peut arriver | Quand | Suite |
|---|---|---|---|---|
| 🟡 Faible | Bug | Une révision naît avec une date de validité déjà passée | la validité du devis envoyé est dépassée | ✅ corrigé sur la branche : la date n'est copiée que si elle est à venir, test ajouté |
| 🟡 Faible | Faille | Une révision ou un avenant écrit pour un autre client | un `createQuote` forgé, ou un client changé sur le brouillon | ✅ traité : le trigger refuse un client autre que celui du parent |
| 🟡 Faible | Bug | Deux personnes révisent le même devis en même temps et obtiennent deux v2 | un double clic ou deux onglets | ✅ traité : l'index unique refuse la seconde, avec un message lisible |
| 🟡 Faible | Bug | Le nouveau brouillon existe alors que la version envoyée reste envoyée | la base tombe entre les deux enregistrements | ⏳ reporté — [dette n° 1](debt/261123-feat-debt-quote-revisions-and-amendments.FR.md#1-une-révision-fait-deux-enregistrements-pas-un) |
| 🟡 Faible | Bug | La révision d'un avenant pointe vers l'avenant, pas vers le devis accepté | un avenant est envoyé puis révisé | ⏳ reporté — [dette n° 2](debt/261123-feat-debt-quote-revisions-and-amendments.FR.md#2-la-révision-dun-avenant-pointe-vers-lavenant) |

Régressions vérifiées : `saveQuoteService` (serveur) prend désormais `{ quote, parentQuoteId }` en dernier
argument ; ses deux appelants (`createQuote`, `updateQuote`) sont à jour. `QuoteClientField`,
`QuoteFormDialog`, `QuoteForm` et `createOrUpdateQuote` (bo) gagnent des props ou arguments facultatifs :
les chemins « Nouveau devis » et « Modifier » n'en passent aucun et se comportent comme avant. Les tests
du serveur passent (87).

Points reportés : [fichier de dette](debt/261123-feat-debt-quote-revisions-and-amendments.FR.md).

## Résultat par critère d'acceptation

| Critère | Résultat | Preuve |
|---|---|---|
| Réviser un devis envoyé crée un brouillon avec le même numéro et la version suivante | partiel : construit et règle testée, pas lancé en vrai | `reviseQuoteService`, trigger `applyParentRelation` ; `quote.utils.test.ts`, `quote.validations.test.ts` |
| La version révisée devient `expired` | partiel : construit, pas lancé en vrai | `reviseQuoteService` → `changeQuoteStatusService` |
| Un devis accepté ne peut pas être révisé | partiel : règle testée, pas lancé en vrai | `canReviseQuote` dans `quote.utils.test.ts` ; refus de `reviseQuote` ; pas d'entrée de menu |
| Un avenant a son propre numéro et pointe vers le devis accepté qu'il complète | partiel : règle testée, pas lancé en vrai | `getQuoteParentRelation`, `createQuote`, `quote.validations.test.ts` |
| Le détail d'un devis montre le devis qu'il révise ou complète | partiel : construit, pas lancé en vrai | `QuoteTitleCell.tsx` (la ligne de la liste est le détail du devis : il n'y a pas de page de détail) |

Écarts avec le plan : la date de validité d'une révision n'est copiée que si elle est à venir (correction
de la revue). Non vérifié : tous les cas en vrai (pas de base de données locale).

## Vérifications lancées

- `pnpm nx run-many -t typecheck lint test -p server bo shared-domain-utils` : ok (bo : avertissements
  seulement, aucun sur une ligne modifiée).
- `pnpm nx run server:test` : ok, 6 fichiers, 87 tests.
- `pnpm nx run-many -t build -p server bo` : ok.
- `pnpm check-i18n`, `pnpm lint:docs`, `pnpm check-doc-links`, `pnpm check-doc-twins --worktree` : ok.

## Ce qui reste à faire

Les cas en vrai de `tickets/work/add-quote-revisions-and-amendments/tc-manual.md`, en préproduction ; les
deux points reportés ci-dessus ; les paiements d'un avenant arrivent avec
`060-add-quote-payments-with-the-30-40-30-schedule`.
