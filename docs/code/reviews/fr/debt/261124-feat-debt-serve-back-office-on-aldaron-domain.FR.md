# Dette — Servir le back-office sur un domaine Aldaron

> Review : [261124-feat-serve-back-office-on-aldaron-domain.FR.md](../261124-feat-serve-back-office-on-aldaron-domain.FR.md)
> Branche : `feat/serve-back-office-on-aldaron-domain` · Créé le 2026-11-24 à 08:32 · Auteur : `tiavinamika@gmail.com`
> Statut global : ⏳ à faire

## Table des matières

- [Résumé](#résumé)
- [1. Les envois de fichiers suivent l'adresse de la page](#1-les-envois-de-fichiers-suivent-ladresse-de-la-page)
- [2. Les rôles mixtes reçoivent le lien du portfolio](#2-les-rôles-mixtes-reçoivent-le-lien-du-portfolio)

## Résumé

| # | Gravité | Type | Risque | Statut |
|---|---|---|---|---|
| 1 | 🟡 Faible | Régression | Les envois de fichiers appellent l'adresse de la page au lieu de `VITE_SERVER_URL` | ⏳ à faire |
| 2 | 🟡 Faible | Bug | Des rôles qui ouvrent les deux espaces reçoivent le lien du portfolio | ⏳ à faire |

## 1. Les envois de fichiers suivent l'adresse de la page

- **Gravité** : 🟡 Faible · **Type** : Régression · **Statut** : ⏳ à faire
- **Concerné** : `apps/bo/src/utils/_core/utils.ts` (`getServerUrl`), `apps/bo/src/config/http.ts`

**Ce qui peut arriver** — Si le back-office était déployé sur un autre hôte que le serveur, les envois de fichiers iraient vers l'hôte du back-office et échoueraient.

**Pourquoi** — `getServerUrl` renvoyait `VITE_SERVER_URL` hors local ; il renvoie maintenant `window.location.origin`, comme `initializeParse` le faisait déjà pour tous les appels Parse. Aujourd'hui le serveur sert le back-office, les deux sont donc égaux.

**Comment vérifier** — Se connecter sur le back-office déployé et envoyer une image ; la requête doit atteindre l'hôte du serveur.

**Comment corriger**

1. **(recommandé)** Garder le changement et préciser dans le guide de déploiement que le back-office doit être servi par le serveur.
   *Pourquoi* : c'est déjà l'architecture, et une seule règle pour Parse et les envois est plus simple.
2. Rétablir `VITE_SERVER_URL` et ajouter une valeur par domaine — coûte une variable de build par domaine et annule l'intérêt d'un seul build.

## 2. Les rôles mixtes reçoivent le lien du portfolio

- **Gravité** : 🟡 Faible · **Type** : Bug · **Statut** : ⏳ à faire
- **Concerné** : `apps/server/src/cloud/services/_core/userRole.service.cloud.ts` (`getLandingWorkspace`)

**Ce qui peut arriver** — Une personne invitée avec des rôles qui ouvrent les deux espaces, ou avec un rôle qui en hérite un, est envoyée vers l'adresse du portfolio.

**Pourquoi** — La règle choisit l'adresse Aldaron seulement si aucun rôle n'ouvre le portfolio, et lit les rôles accordés sans leurs parents.

**Comment vérifier** — Inviter avec un rôle portfolio et un rôle Aldaron ; le lien est celui du portfolio.

**Comment corriger**

1. **(recommandé)** Ne rien changer et décider d'abord la règle produit (qui arrive où).
   *Pourquoi* : le compte obtient exactement les espaces que ses rôles ouvrent ; seule la première adresse diffère, et aucune règle n'existe encore.
2. Préférer l'adresse Aldaron dès qu'Aldaron est ouvert — enverrait sur le mauvais domaine le personnel portfolio qui a un rôle Aldaron.
