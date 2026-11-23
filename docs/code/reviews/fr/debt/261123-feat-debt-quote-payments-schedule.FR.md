# Dette — Paiements des devis Aldaron (30 / 40 / 30)

> Revue : [261123-feat-quote-payments-schedule.FR.md](../261123-feat-quote-payments-schedule.FR.md)
> Branche : `feat/quote-payments-schedule` · Créée le 2026-11-23 à 22:13 · Auteur : `tiavinamika@gmail.com`
> Statut global : ⏳ à faire

## Table des matières

- [Résumé](#résumé)
- [1. Un échéancier écrit en partie ne peut pas être complété](#1-un-échéancier-écrit-en-partie-ne-peut-pas-être-complété)
- [2. Deux remplaçants pour un paiement annulé](#2-deux-remplaçants-pour-un-paiement-annulé)
- [3. Une addition échouée laisse le montant payé en retard](#3-une-addition-échouée-laisse-le-montant-payé-en-retard)

## Résumé

| # | Gravité | Type | Risque | Statut |
|---|---|---|---|---|
| 1 | 🟡 Faible | Bug | Un échéancier écrit en partie ne peut pas être complété | ⏳ à faire |
| 2 | 🟡 Faible | Bug | Deux remplaçants pour un paiement annulé | ⏳ à faire |
| 3 | 🟡 Faible | Bug | Une addition échouée laisse le montant payé en retard | ⏳ à faire |

## 1. Un échéancier écrit en partie ne peut pas être complété

- **Gravité** : 🟡 Faible · **Type** : Bug · **Statut** : ⏳ à faire
- **Concerné** : `apps/server/src/cloud/services/_domain/payment.service.cloud.ts` (`createQuotePaymentsService`),
  `apps/server/src/cloud/functions/_domain/payment.functions.ts` (`createQuotePayments`)

**Ce qui peut arriver** — le devis est accepté ; son `afterSave` enregistre l'acompte, puis la base échoue
sur l'étape. Le devis garde un paiement ; « Créer l'échéancier » n'est pas affiché (le devis a des paiements)
et la fonction le refuse de toute façon.

**Pourquoi** — les trois sauvegardes ne forment pas une transaction, et la réparation vérifie « a un
paiement », pas « a son échéancier complet ».

**Comment le vérifier** — faire échouer la deuxième sauvegarde (mock de `Parse.Object.prototype.save`), puis
appeler `createQuotePayments`.

**Comment corriger**

1. **(recommandé)** Laisser l'échéancier se compléter : `createQuotePaymentsService` n'écrit que les types qui
   n'ont pas encore de paiement non annulé, et `createQuotePayments` ne refuse qu'un devis dont les trois
   types en ont un ; la fenêtre montre le bouton tant qu'un type manque.
   *Pourquoi* : idempotent, sans transaction, la même fonction répare tous les cas ; un test unitaire sur une
   fonction pure « types manquants ».
2. Écrire les trois paiements dans une transaction MongoDB (`apps/server/src/cloud/transactions/`) — demande un
   replica set dans chaque environnement et laisse le cas des anciens devis au bouton.

## 2. Deux remplaçants pour un paiement annulé

- **Gravité** : 🟡 Faible · **Type** : Bug · **Statut** : ⏳ à faire
- **Concerné** : `cancelPaymentService` dans `apps/server/src/cloud/services/_domain/payment.service.cloud.ts`

**Ce qui peut arriver** — deux personnes (ou deux onglets) annulent le même paiement au même moment : les
deux le lisent non payé, écrivent chacune un remplaçant et l'annulent. Le devis a alors un paiement de trop.

**Pourquoi** — le remplaçant est écrit avant l'annulation, et rien ne relie un remplaçant au paiement qu'il
remplace.

**Comment le vérifier** — appeler `cancelPayment` deux fois en parallèle sur un paiement, sur une base.

**Comment corriger**

1. **(recommandé)** Stocker `replaces` (pointeur vers le paiement annulé) sur le remplaçant, avec un index
   unique sparse sur `_p_replaces` dans `db-indexes.ts` : le second remplaçant est refusé par la base et la
   fonction répond « déjà corrigé ».
   *Pourquoi* : la base tient la règle contre toute course, et le pointeur documente aussi l'historique.
2. Annuler d'abord, puis n'écrire le remplaçant que si l'annulation a changé le statut — reste exposé à la
   course sans mise à jour conditionnelle.

## 3. Une addition échouée laisse le montant payé en retard

- **Gravité** : 🟡 Faible · **Type** : Bug · **Statut** : ⏳ à faire
- **Concerné** : `afterSave` `Payment` dans `apps/server/src/cloud/triggers/_domain/payment.triggers.ts`,
  `syncQuotePaidAmountService`

**Ce qui peut arriver** — un paiement est marqué payé, puis la sauvegarde du `paidAmount` du devis échoue : la
liste des devis et le résumé de la fenêtre montrent l'ancien montant payé jusqu'à ce qu'un autre paiement soit
payé ou annulé.

**Pourquoi** — l'addition se fait après la sauvegarde du paiement et son échec est seulement journalisé.

**Comment le vérifier** — faire échouer la sauvegarde du devis dans le trigger et relire le devis.

**Comment corriger**

1. **(recommandé)** Refaire l'addition à la lecture des paiements d'un devis (`getQuotePayments` compare la
   somme de ses paiements payés au `quote.paidAmount` et synchronise s'ils diffèrent).
   *Pourquoi* : se répare tout seul sur l'écran où le montant compte, un seul appel, aucun nouveau job.
2. Un job de nuit qui recalcule le `paidAmount` de chaque devis accepté — une entrée d'inventaire de plus pour
   un cas rare.
