# Dette — Servir le back-office sur un domaine Aldaron

> Review : [261124-feat-serve-back-office-on-aldaron-domain.FR.md](../261124-feat-serve-back-office-on-aldaron-domain.FR.md)
> Branche : `feat/serve-back-office-on-aldaron-domain` · Créé le 2026-11-24 à 08:32 · Auteur : `tiavinamika@gmail.com`
> Statut global : ⏳ à faire

## Table des matières

- [Résumé](#résumé)
- [1. Les rôles mixtes reçoivent le lien du portfolio](#1-les-rôles-mixtes-reçoivent-le-lien-du-portfolio)

## Résumé

| # | Gravité | Type | Risque | Statut |
|---|---|---|---|---|
| 1 | 🟡 Faible | Bug | Des rôles qui ouvrent les deux espaces reçoivent le lien du portfolio | ⏳ à faire |

## 1. Les rôles mixtes reçoivent le lien du portfolio

- **Gravité** : 🟡 Faible · **Type** : Bug · **Statut** : ⏳ à faire
- **Concerné** : `apps/server/src/cloud/services/_core/userRole.service.cloud.ts` (`getLandingWorkspace`)

**Ce qui peut arriver** — Une personne invitée avec des rôles qui ouvrent les deux espaces, ou avec un rôle qui en hérite un, est envoyée vers l'adresse du portfolio.

**Pourquoi** — La règle choisit l'adresse Aldaron seulement si aucun rôle n'ouvre le portfolio, et lit les rôles accordés sans leurs parents.

**Comment vérifier** — Inviter avec un rôle portfolio et un rôle Aldaron ; le lien est celui du portfolio.

**Comment corriger**

1. **(recommandé)** Ne rien changer et décider d'abord la règle produit (qui arrive où).
   *Pourquoi* : le compte obtient exactement les espaces que ses rôles ouvrent ; seule la première adresse diffère, et aucune règle n'existe encore.
2. Préférer l'adresse Aldaron dès qu'Aldaron est ouvert — enverrait sur le mauvais domaine le personnel portfolio qui a un rôle Aldaron.
