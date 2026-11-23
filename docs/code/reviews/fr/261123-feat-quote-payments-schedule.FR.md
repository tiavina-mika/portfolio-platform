# Revue — Paiements des devis Aldaron (30 / 40 / 30)

- **Branche** : `feat/quote-payments-schedule`
- **Type** : Nouvelle fonctionnalité
- **Auteur** : `tiavinamika@gmail.com` (identité git locale ; écrite par `/dev --auto`)
- **Créée** : 2026-11-23 à 22:13
- **Apps touchées** : Serveur, Back-office (et les libs partagées qu'ils utilisent)

## Table des matières

- [En bref](#en-bref)
- [Base de données](#base-de-données)
- [Serveur](#serveur)
- [Back-office](#back-office)
- [Voir le résultat en local](#voir-le-résultat-en-local)
- [Résultat par critère d'acceptation](#résultat-par-critère-dacceptation)
- [Bugs, régressions et failles possibles](#bugs-régressions-et-failles-possibles)
- [Ce qui reste à faire](#ce-qui-reste-à-faire)

## En bref

Accepter un devis Aldaron écrit désormais ses trois paiements, selon un échéancier unique pour tous les
devis : un acompte de 30 % à payer le jour même, une étape de 40 % et un solde de 30 % ; le solde prend
l'arrondi, donc les trois font toujours le total. Depuis la liste des devis, « Paiements » sur un devis
accepté montre le total, ce qui est payé et ce qui reste, et permet de marquer un paiement payé (moyen,
référence, jour), de dater l'étape et le solde, et de corriger une erreur en annulant un paiement, un nouveau
prenant sa place. Un paiement payé n'est jamais modifié et rien n'est supprimé. Le montant payé du devis suit
les paiements payés. Un devis accepté avant ce changement reçoit son échéancier par un bouton « Créer
l'échéancier ».

## Base de données

| Classe | Nouvelle ? | Champs ajoutés / modifiés | À quoi ça sert |
|---|---|---|---|
| `Payment` | oui | `quote`, `client` (pointeurs), `kind`, `percent`, `amount`, `status`, `dueDate`, `paidAt`, `method`, `reference`, `createdBy`, `updatedBy` | une part de l'échéancier d'un devis accepté, et son historique |
| `Quote` | non | `paidAmount` *(désormais tenu à jour)* | la somme des paiements payés, écrite seulement par le trigger des paiements |

Index ajoutés sur `Payment` : `_p_quote` + `status` (les paiements d'un devis, la vérification qu'il en a,
la somme des payés) et `status` + `dueDate` (ce qui est à payer, pour la liste des retards de `070`). La
classe est réservée à la clé maître (`ALWAYS_LOCKED_CLASSES`, `FUNCTION_ONLY_CLASSES`). Pas de migration : la
classe et ses index sont créés au démarrage ; les anciens devis acceptés n'ont pas de paiement tant que le
bouton n'est pas utilisé.

## Serveur

- La sauvegarde qui accepte un devis écrit ses trois paiements, une seule fois (`afterSave` `Quote`) ;
  aucune sauvegarde suivante du devis accepté n'en écrit, et un devis non accepté n'en a aucun.
- Un trigger des paiements (`beforeSave` `Payment`) garde leur part figée (devis, client, type, pourcentage,
  montant), ne laisse un paiement payé devenir qu'annulé et un paiement annulé ne plus changer, exige le
  moyen quand il est payé et met le jour à aujourd'hui (jamais un jour à venir). `afterSave` `Payment`
  additionne les paiements payés dans le `paidAmount` du devis ; le trigger du devis remet `paidAmount` à
  chaque autre sauvegarde.
- Cinq fonctions, chacune dans l'espace Aldaron seulement et vérifiant le droit sur `Payment`
  (`getQuotePayments`, `createQuotePayments`, `markPaymentAsPaid`, `setPaymentDueDate`, `cancelPayment`).
  Aucune fonction de suppression. Leurs entrées refusent le montant, le pourcentage, le type et le statut.
- Messages en `fr`, `en`, `mg`. Inventaire à jour ([Cloud Code](../../../inventory/README.md#cloud-code),
  [collections](../../../inventory/code/fr/COLLECTIONS_AND_INDEXES.FR.md)). Pas de nouvelle variable
  d'environnement ni de service.

## Back-office

- **Pages touchées** : Devis (`http://localhost:5174/devis`), nouvelle action de ligne « Paiements » sur les
  devis acceptés, pour un rôle qui a le droit Lister sur **Paiements**.
- La fenêtre des paiements : résumé (total du devis, déjà payé, reste à payer), une ligne par paiement (part
  et pourcentage, montant dans la devise du devis, échéance, statut, jour payé avec moyen et référence), et les
  actions « Marquer comme payé », « Fixer l'échéance » (étape et solde), « Annuler et ressaisir ».
- **Paiements** est une nouvelle entrée de la table des droits des rôles (groupe Opérations).
- Doc de fonctionnalité à jour : [Devis](../../../features/bo/quotes/fr/QUOTES.FR.md#les-paiements-dun-devis-accepté).

## Voir le résultat en local

```bash
pnpm nx run server:dev
pnpm nx run bo:dev
```

Puis, dans l'espace Aldaron : `http://localhost:5174/devis` → un devis accepté → menu de la ligne →
« Paiements ».

## Résultat par critère d'acceptation

| Critère | Résultat | Preuve |
|---|---|---|
| Accepter un devis crée exactement trois paiements de 30 / 40 / 30 qui font son total | Traité ; sauvegarde réelle non jouée | `apps/server/src/utils/_domain/payment.utils.test.ts` (répartition, arrondi, dix totaux) |
| Sauvegarder à nouveau le devis accepté ne crée pas d'autres paiements | Traité ; sauvegarde réelle non jouée | tests de `isQuoteJustAccepted` + vérification d'existence dans `afterSave` |
| Marquer payé enregistre le moyen et la date et met à jour le montant payé | Traité ; sauvegarde réelle non jouée | `payment.validations.test.ts`, tests de `sumPaidPayments` / `changesPaidAmount` |
| Un paiement payé ne se modifie ni ne se supprime ; corrigé en annulant et ressaisissant | Traité ; sauvegarde réelle non jouée | tests des transitions, test des CLP, aucune fonction de suppression |
| Reste = total moins payé | Traité | tests de `computeQuoteRemainingAmount` ; résumé de la fenêtre |
| Un devis non accepté n'a aucun paiement | Traité ; sauvegarde réelle non jouée | tests de `isQuoteJustAccepted` ; `getQuotePayments` n'en renvoie aucun |

Écarts avec `implementation.md` : ajout de `createQuotePayments` et de son bouton (devis acceptés avant le
changement) ; les trois paiements sont enregistrés l'un après l'autre plutôt qu'en lot (chaque sauvegarde
garde son contexte). Vérifications du 2026-11-23 : `pnpm nx run-many -t lint typecheck test -p server bo`
(164 tests serveur), lint + typecheck des trois libs partagées, `pnpm nx run-many -t build -p server bo`,
`pnpm check-i18n`, `check-doc-links`, `check-doc-twins --worktree`, `lint:docs` : tout est ok.
Non vérifié : tous les cas réels (pas de base locale), listés dans le `tc-manual.md` du ticket.

## Bugs, régressions et failles possibles

| Gravité | Type | Ce qui peut arriver | Quand | Suite |
|---|---|---|---|---|
| 🟡 Faible | Bug | Un devis garde un ou deux paiements sur trois, et « Créer l'échéancier » est refusé car il en a | L'`afterSave` de l'acceptation échoue entre deux sauvegardes (erreur de base) | ⏳ reporté — [dette n° 1](debt/261123-feat-debt-quote-payments-schedule.FR.md#1-un-échéancier-écrit-en-partie-ne-peut-pas-être-complété) |
| 🟡 Faible | Bug | Deux remplaçants pour un paiement annulé | Le même paiement annulé au même moment depuis deux onglets | ⏳ reporté — [dette n° 2](debt/261123-feat-debt-quote-payments-schedule.FR.md#2-deux-remplaçants-pour-un-paiement-annulé) |
| 🟡 Faible | Bug | Le montant payé du devis est en retard jusqu'au prochain paiement enregistré | L'addition après un paiement échoue (journalisée) | ⏳ reporté — [dette n° 3](debt/261123-feat-debt-quote-payments-schedule.FR.md#3-une-addition-échouée-laisse-le-montant-payé-en-retard) |
| 🟡 Faible | Régression | Un `paidAmount` écrit par un autre code est désormais remis | Seul le trigger des paiements l'écrit aujourd'hui ; vérifié par recherche | ✅ aucun autre écrivain sur la branche |

Détails et corrections : [fichier de dette](debt/261123-feat-debt-quote-payments-schedule.FR.md).

## Ce qui reste à faire

- Les cas réels, en préproduction : le `tc-manual.md` du ticket.
- Les rôles existants n'ont aucun droit sur **Paiements** : donner Lister / Modifier / Créer au rôle
  commercial après le déploiement.
- Paiements en retard, cartes du tableau de bord et avertissement d'acompte sur une mission :
  `070-show-the-aldaron-money-cards-on-the-dashboard` ; export CSV : `140-export-aldaron-payments-as-csv` ;
  journal des changements : `080-add-an-audit-trail-to-aldaron-money-records`.
