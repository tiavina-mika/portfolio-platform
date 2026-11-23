# Dette — Ajouter les révisions et les avenants de devis

> Revue : [261123-feat-quote-revisions-and-amendments.FR.md](../261123-feat-quote-revisions-and-amendments.FR.md)
> Branche : `feat/quote-revisions-and-amendments` · Créée le 2026-11-23 à 18:25 · Auteur : tiavina-mika
> Statut global : ⏳ à faire

## Table des matières

- [Résumé](#résumé)
- [1. Une révision fait deux enregistrements, pas un](#1-une-révision-fait-deux-enregistrements-pas-un)
- [2. La révision d'un avenant pointe vers l'avenant](#2-la-révision-dun-avenant-pointe-vers-lavenant)

## Résumé

| # | Gravité | Type | Risque | Statut |
|---|---|---|---|---|
| 1 | 🟡 Faible | Bug | Le nouveau brouillon existe alors que la version envoyée reste envoyée | ⏳ à faire |
| 2 | 🟡 Faible | Bug | La révision d'un avenant ne pointe plus directement vers le devis accepté | ⏳ à faire |

## 1. Une révision fait deux enregistrements, pas un

- **Gravité** : 🟡 Faible · **Type** : Bug · **Statut** : ⏳ à faire
- **Concerné** : `apps/server/src/cloud/services/_domain/quote.service.cloud.ts` (`reviseQuoteService`)

**Ce qui peut arriver** — l'utilisateur clique sur « Réviser » ; le brouillon v2 est écrit, puis la base
ou le serveur tombe avant que la v1 passe à `expired`. La liste montre la v2 en brouillon et la v1 encore
envoyée ; le client pourrait répondre à la v1.

**Pourquoi** — Parse Server n'a pas ici de transaction sur deux enregistrements en Cloud Code ; le
brouillon est écrit en premier exprès pour ne rien perdre, et un second « Réviser » sur la v1 est refusé
par l'index unique `number` + `version` (« déjà révisé »).

**Comment vérifier** — faire échouer `changeQuoteStatusService` après le premier enregistrement (une
doublure de test), appeler `reviseQuote`, lire les deux lignes.

**Comment corriger**

1. **(recommandé)** Laisser l'`afterSave` d'une nouvelle révision faire expirer son parent s'il est encore
   `sent`, en gardant l'expiration explicite du service : la seconde tentative répare la première.
   *Pourquoi* : petit, reste dans le trigger qui porte déjà la règle, et répare une révision à moitié
   faite au prochain enregistrement, sans job.
2. Utiliser une transaction MongoDB (`apps/server/src/cloud/transactions/`) — atomique, mais demande un
   replica set dans chaque environnement et un chemin de code plus lourd pour une panne rare.

## 2. La révision d'un avenant pointe vers l'avenant

- **Gravité** : 🟡 Faible · **Type** : Bug · **Statut** : ⏳ à faire
- **Concerné** : `apps/server/src/cloud/triggers/_domain/quote.triggers.ts`, le ticket des paiements
  `060-add-quote-payments-with-the-30-40-30-schedule`

**Ce qui peut arriver** — un avenant `AL-2026-004` (qui pointe vers le devis accepté `AL-2026-003`) est
envoyé, puis révisé : `AL-2026-004 v2` pointe vers `AL-2026-004 v1`, pas vers `AL-2026-003`. La liste
affiche « Révise AL-2026-004 v1 », et le lien vers le devis accepté est à une étape. Une fonctionnalité
future qui a besoin des « avenants d'un devis » devrait remonter la chaîne.

**Pourquoi** — un devis n'a qu'un pointeur `parentQuote`, qui veut dire « révise » quand les numéros sont
les mêmes et « complète » sinon ; la note de conception le définit ainsi.

**Comment vérifier** — créer un avenant, l'envoyer, le réviser, lire le `parentQuote` de la v2.

**Comment corriger**

1. **(recommandé)** Quand les paiements ou l'historique des devis d'un client en ont besoin, ajouter un
   pointeur stocké `amendedQuote` recopié sur chaque révision d'un avenant, avec un index s'il est filtré.
   *Pourquoi* : stocke la valeur qui sera interrogée (`parse-patterns.md`), ne coûte rien tant qu'aucun
   lecteur n'en a besoin, et garde à `parentQuote` le sens de la note de conception.
2. Remonter la chaîne à la lecture — pas de changement de schéma, mais une lecture de plus par version
   sur chaque liste.
