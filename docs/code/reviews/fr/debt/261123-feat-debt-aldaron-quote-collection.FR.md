# Dette — Ajouter la collection des devis à l'espace Aldaron

> Revue : [261123-feat-aldaron-quote-collection.FR.md](../261123-feat-aldaron-quote-collection.FR.md)
> Branche : `feat/aldaron-quote-collection` · Créée le 2026-11-23 à 15:46 · Auteur : `tiavinamika@gmail.com`
> État général : ⏳ à faire

## Table des matières

- [Résumé](#résumé)
- [1. Un trou dans la numérotation après une écriture ratée](#1-un-trou-dans-la-numérotation-après-une-écriture-ratée)
- [2. Deux personnes sur le même brouillon](#2-deux-personnes-sur-le-même-brouillon)

## Résumé

| # | Gravité | Type | Risque | État |
|---|---|---|---|---|
| 1 | 🟡 Faible | Bug | Un numéro est pris mais aucun devis n'est écrit : un trou dans l'année | ⏳ à faire |
| 2 | 🟡 Faible | Bug | La dernière de deux sauvegardes simultanées d'un brouillon l'emporte sans prévenir | ⏳ à faire |

## 1. Un trou dans la numérotation après une écriture ratée

- **Gravité** : 🟡 Faible · **Type** : Bug · **État** : ⏳ à faire
- **Concerné** : `apps/server/src/cloud/triggers/_domain/quote.triggers.ts`,
  `apps/server/src/cloud/services/_core/counter.service.cloud.ts`

**Ce qui peut arriver** — une personne crée un devis ; le trigger `beforeSave` passe `quote-2026` à 7, puis
l'écriture du devis lui-même échoue (base indisponible, refus d'un index unique). `AL-2026-007` n'est
jamais utilisé : le devis suivant est `AL-2026-008`.

**Pourquoi** — le compteur et le devis sont deux écritures ; Parse Server n'a pas de transaction entre les
deux. Tous les refus du trigger passent avant l'incrément, il ne reste donc que l'échec de l'écriture en
base elle-même.

**Comment le vérifier** — faire échouer l'écriture du devis après le trigger (arrêter MongoDB entre les
deux écritures, ou forcer un doublon sur `quoteNumberVersion_unique`), puis créer le devis suivant.

**Comment corriger**

1. **(recommandé)** Garder le compteur tel quel et, si un trou compte un jour pour un comptable, contrôler
   les numéros pris : une tâche quotidienne compare le compteur au plus grand numéro de l'année et note un
   numéro manquant.
   *Pourquoi* : un devis n'est pas une facture légale (la note de conception laisse les factures de côté),
   le cas demande une panne de la base au milieu d'une sauvegarde, et une transaction demanderait un
   replica set MongoDB et du code du pilote brut autour de Parse.
2. Écrire le devis et le compteur dans une seule transaction MongoDB (pilote brut, replica set exigé) —
   exact, mais lourd et hors de la couche Parse.

## 2. Deux personnes sur le même brouillon

- **Gravité** : 🟡 Faible · **Type** : Bug · **État** : ⏳ à faire
- **Concerné** : `apps/server/src/cloud/functions/_domain/quote.functions.ts` (`updateQuote`),
  `apps/bo/src/redux/actions/_domain/quote.action.ts`

**Ce qui peut arriver** — deux personnes ouvrent le même brouillon, changent chacune une ligne et
enregistrent : la seconde sauvegarde remplace les lignes de la première sans prévenir.

**Pourquoi** — `updateQuote` écrit tous les champs saisis et ne vérifie aucune version ; c'est aussi le cas
des clients.

**Comment le vérifier** — ouvrir le même brouillon dans deux navigateurs, enregistrer une ligne différente
dans chacun, recharger la liste.

**Comment corriger**

1. **(recommandé)** Envoyer le `updatedAt` avec lequel le formulaire a été ouvert et refuser la sauvegarde
   quand celui enregistré diffère, avec un message traduit « modifié entre-temps, rechargez » — la garde
   optimiste que le CMS utilise déjà (`apps/bo/src/utils/_core/parse.utils.ts`).
   *Pourquoi* : petit, local, reprend un modèle existant ; la personne voit le conflit au lieu de perdre
   son travail.
2. Verrouiller un brouillon tant qu'il est ouvert — demande une collection de verrous et une expiration,
   bien plus que le risque.
