# Dette — Transformer une demande de devis du site en client et en devis

> Revue : [261123-feat-site-quote-request-conversion.FR.md](../261123-feat-site-quote-request-conversion.FR.md)
> Branche : `feat/site-quote-request-conversion` · Créée le 2026-11-23 à 19:34 · Auteur : tiavina-mika
> Statut global : ⏳ à faire

## Table des matières

- [Résumé](#résumé)
- [1. Deux devis depuis une demande enregistrés au même moment](#1-deux-devis-depuis-une-demande-enregistrés-au-même-moment)

## Résumé

| # | Gravité | Type | Risque | Statut |
|---|---|---|---|---|
| 1 | 🟡 Faible | Bug | Deux devis depuis une demande enregistrés au même moment | ⏳ à faire |

## 1. Deux devis depuis une demande enregistrés au même moment

- **Gravité** : 🟡 Faible · **Type** : Bug · **Statut** : ⏳ à faire
- **Concerné** : `apps/server/src/cloud/functions/_domain/quote.functions.ts` (`createQuote`),
  `apps/server/src/cloud/services/_domain/contact-quote.service.cloud.ts`

**Ce qui peut arriver** — La même demande est ouverte dans deux onglets ; les deux formulaires sont
enregistrés dans la même seconde. Les deux appels `createQuote` lisent le contact avant que l'un ou l'autre
n'ait écrit son pointeur `quote`, chacun écrit un devis, et le contact finit par pointer vers le second. Le
premier devis est un brouillon que rien ne relie à la demande.

**Pourquoi** — `getConvertibleContactService` vérifie `quote` puis `linkContactToQuoteService` l'écrit, le
devis étant enregistré entre les deux : une vérification puis une écriture, sans verrou. Parse n'a pas de
transaction entre les deux classes.

**Comment le vérifier** — Lancer deux appels `createQuote` avec le même `contact` en même temps (un script
avec `Promise.all`) sur une base de test ; compter les devis créés.

**Comment le corriger**

1. **(recommandé)** Réserver la demande avant d'écrire le devis : un `increment('quoteLock')` atomique sur le
   contact (ou un index unique sur un pointeur `quoteRequest` porté par `Quote`), refuser quand le compteur
   revient au-dessus de 1, le libérer si l'enregistrement du devis échoue.
   *Pourquoi* : cela tient côté serveur quoi que fasse le client, pour une écriture d'une ligne ; un index
   unique côté devis (`_p_quoteRequest`, partiel sur l'existence) est la variante la plus solide si le
   pointeur passe sur `Quote`.
2. Désactiver le bouton Enregistrer pendant l'enregistrement et fermer le formulaire du second onglet en cas
   de succès — ne fait que réduire la fenêtre, un appel forgé passe toujours.
