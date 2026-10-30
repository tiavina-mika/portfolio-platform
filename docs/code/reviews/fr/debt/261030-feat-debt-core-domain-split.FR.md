# Dette — Adoption du back-office 1lalana avec une séparation `_core` / `_domain`

> Revue : [261030-feat-core-domain-split.FR.md](../261030-feat-core-domain-split.FR.md)
> Branche : `feat/core-domain-split` · Créé le 2026-10-30 à 08:17 · Auteur : `tiavinamika@gmail.com`
> Statut global : ⏳ à faire

## Table des matières

- [Résumé](#résumé)
- [1. Les rôles existants ne sont pas renommés](#1-les-rôles-existants-ne-sont-pas-renommés)
- [2. Un serveur déployé exige deux propriétaires et une clé SMS](#2-un-serveur-déployé-exige-deux-propriétaires-et-une-clé-sms)
- [3. Des noms de classes de covoiturage restent dans le core](#3-des-noms-de-classes-de-covoiturage-restent-dans-le-core)
- [4. Trous sur les projets dans le tableau de bord, la recherche et les versions](#4-trous-sur-les-projets-dans-le-tableau-de-bord-la-recherche-et-les-versions)
- [5. Écrans du back-office sans serveur ni source de données](#5-écrans-du-back-office-sans-serveur-ni-source-de-données)
- [6. Le build du site exige un serveur Parse](#6-le-build-du-site-exige-un-serveur-parse)
- [7. Le réabonnement contourne le double opt-in](#7-le-réabonnement-contourne-le-double-opt-in)
- [8. Restes côté site](#8-restes-côté-site)
- [9. Vocabulaire et contenu de covoiturage](#9-vocabulaire-et-contenu-de-covoiturage)
- [10. Non porté et dépendances inutilisées](#10-non-porté-et-dépendances-inutilisées)

## Résumé

| # | Gravité | Type | Risque | Statut |
|---|---|---|---|---|
| 1 | 🟠 Moyenne | Régression | Les rôles `Owner` / `Administrator` / `Manager` d'une base existante ne sont pas reconnus | ⏳ à faire |
| 2 | 🟠 Moyenne | Bug | `validateEnv` bloque un portfolio à un seul propriétaire et exige une clé SMS | ⏳ décision produit |
| 3 | 🟡 Faible | Bug | Classes de covoiturage encore listées dans `collections` et les listes de sécurité | ⏳ à faire |
| 4 | 🟡 Faible | Bug | Colonne du tableau de bord, recherche par auteur, restauration de version | ⏳ à faire |
| 5 | 🟡 Faible | Bug | Écrans qui appellent des Cloud Functions inexistantes, entrée de menu masquée | ⏳ à faire |
| 6 | 🟡 Faible | Bug | `next build` exige un serveur Parse joignable | ⏳ à faire |
| 7 | 🟡 Faible | Faille | `resubscribeNewsletter` ignore `confirmed` | ⏳ à faire |
| 8 | 🟡 Faible | Bug | Restes côté site (locale zod, orphelins, clés, FAQ, `mg`) | ⏳ à faire |
| 9 | 🟡 Faible | Bug | Vocabulaire de covoiturage dans les textes et la FAQ partagée | ⏳ à faire |
| 10 | 🟡 Faible | Dette | Tests, Storybook (BO), e2e, mobile, app de docs, notation ; dépendances inutilisées | ⏳ à faire |

## 1. Les rôles existants ne sont pas renommés

- **Gravité** : 🟠 Moyenne · **Type** : Régression · **Statut** : ⏳ à faire
- **Concerné** : `libs/shared-constants/src/role.constants.ts`, `apps/server/src/cloud/utils/_core/role.utils.cloud.ts`

**Ce qui peut arriver** — une base créée avant la branche contient les lignes `_Role` `Owner`, `Administrator`, `Manager`. Le code cherche `OWNER`, `SUPER_ADMIN`, `MANAGER` : aucun compte n'est de niveau le plus haut, `ensureDefaultRolesExist` ne fait rien tant que `SUPER_ADMIN` n'existe pas, et le back-office n'affiche aucune entrée de menu.

**Pourquoi** — les noms de rôles ont changé, et il n'y a pas de job de migration.

**Comment vérifier** — démarrer le serveur sur une copie d'une ancienne base et ouvrir le back-office avec l'ancien propriétaire.

**Comment corriger**

1. **(recommandé)** Un job de migration ponctuel `renameLegacyRolesJob` dans `cloud/jobs/_core/`, lancé une fois depuis la page Divers : renommer les trois rôles sur place (garde la relation d'utilisateurs et l'ACL), puis reconstruire les CLP.
   *Pourquoi* : aucune perte de données, réversible, utilise l'outillage de jobs existant.
2. Renommer à la main dans la base (Compass / Atlas) avant le premier déploiement — peu coûteux, mais facile à oublier et non tracé.

## 2. Un serveur déployé exige deux propriétaires et une clé SMS

- **Gravité** : 🟠 Moyenne · **Type** : Bug · **Statut** : ⏳ décision produit
- **Concerné** : `apps/server/src/utils/_core/validateEnv.ts`, `apps/server/src/constants/_core/role.constants.ts` (`MIN_OWNERS_COUNT`)

**Ce qui peut arriver** — en `preProduction` / `production` le serveur s'arrête au démarrage sauf si `OWNERS_EMAILS` liste deux adresses distinctes et si `MMSDUCK_API_KEY` et `WEBSITE_REVALIDATE_SECRET` sont définis. Un portfolio à un propriétaire et sans fournisseur de SMS ne peut pas se déployer. `UPSTASH_REDIS_*` et `ADMIN_EMAIL_SENDER` sont requis même en local.

**Pourquoi** — les règles viennent de la plateforme 1lalana (un propriétaire seul n'a plus de recours s'il perd son authentificateur).

**Comment vérifier** — lancer `validateEnv()` avec une seule adresse dans `OWNERS_EMAILS`.

**Comment corriger**

1. **(recommandé)** Rendre `MIN_OWNERS_COUNT` et l'exigence de clé SMS configurables par le domaine (1 propriétaire, pas de SMS pour le portfolio) et garder les valeurs strictes comme défaut du core.
   *Pourquoi* : garde le défaut sûr d'un back-office générique, débloque le portfolio.
2. Garder la règle et demander d'ajouter une seconde adresse et un compte SMS — le plus sûr, mais coûte un service que le portfolio n'utilise pas.

## 3. Des noms de classes de covoiturage restent dans le core

- **Gravité** : 🟡 Faible · **Type** : Bug · **Statut** : ⏳ à faire
- **Concerné** : `apps/server/src/constants/_core/constants.ts` (`collections`), `security.constants.ts`, `country-scope.constants.ts`, `user.constants.ts`, `test.functions.ts` (`createRideMock`)

**Ce qui peut arriver** — `Ride`, `Request`, `Vehicle`, `Rating`, `RideShare`, `SosAlert` sont encore nommés dans les listes de classes, donc la reconstruction des permissions de classe au démarrage peut créer des classes vides et verrouillées dans MongoDB, et la fonction de test `createRideMock` reste exposée.

**Pourquoi** — le core a été copié sans le domaine des trajets et ces noms n'ont pas été retirés.

**Comment vérifier** — démarrer le serveur sur une base vide et lister les classes Parse.

**Comment corriger**

1. **(recommandé)** Retirer les noms des listes et supprimer `createRideMock` ; lancer le lint et le typecheck.
   *Pourquoi* : plus petit changement, aucune donnée en jeu.
2. Les garder et filtrer la reconstruction sur les classes présentes dans le schéma — cache le problème au lieu de le retirer.

## 4. Trous sur les projets dans le tableau de bord, la recherche et les versions

- **Gravité** : 🟡 Faible · **Type** : Bug · **Statut** : ⏳ à faire
- **Concerné** : `apps/bo/src/containers/_domain/dashboard/ProjectDashboardRecentColumns.tsx`, `apps/server/src/cloud/services/_domain/project-dashboard.service.cloud.ts`, `project-search.service.cloud.ts`, `apps/bo/src/pages/_domain/`

**Ce qui peut arriver** — la colonne « projets récents » ne s'affiche que si le serveur envoie `recent.projects`, ce qu'il ne fait pas. La liste des projets cherche dans les textes traduits mais pas par auteur. La forme d'un résultat projet dans la recherche globale n'est pas vérifiée. La restauration des versions de contenu n'est pas branchée pour `Project` (`EditProject` ne passe aucune version).

**Pourquoi** — le BO et le domaine serveur ont été portés séparément.

**Comment vérifier** — ouvrir le tableau de bord, chercher un projet par auteur, modifier un projet et chercher l'onglet des versions.

**Comment corriger**

1. **(recommandé)** Enregistrer un fournisseur d'activité récente pour `Project` dans `project-dashboard.service.cloud.ts`, aligner les champs de recherche de la liste et le résultat de la recherche globale sur le BO, passer les versions dans `EditProject`.
   *Pourquoi* : utilise les registres prévus pour cela.

## 5. Écrans du back-office sans serveur ni source de données

- **Gravité** : 🟡 Faible · **Type** : Bug · **Statut** : ⏳ à faire
- **Concerné** : `apps/bo/src/redux/actions/_core/finance.action.ts`, `statistics.action.ts`, `useNavigationMenus.tsx`, `apps/server/src/cloud/functions/_core/payment.functions.ts`

**Ce qui peut arriver** — le BO appelle 17 Cloud Functions que le serveur ne définit pas : `getFinanceOverview`, `getOverduePendingPayments`, `recheckPendingPayment`, `getDriverWalletBalance`, `getDriversWithPendingDebt`, `getUsersStatistics`, `getPaymentsStatistics`, `getReportsStatistics`, `getCancellationStatistics`, `getCancellationReasonBreakdown`, `getRidesStatistics`, `getRidesActivityHeatmap`, `getVehiclesStatistics`, `clearUserSuspension`, `getSuspendedUsers`, `getChargedPendingRequests`, `settleChargedPendingRequest`. La finance et quatre vues de statistiques sur cinq échouent. Les paiements passent par une passerelle simulée et le contrôle au démarrage en production a été retiré. L'entrée `Diffusion` a `uiRight` mais pas `hasRightName`, elle est donc masquée pour tous ; `Paramètres` n'est visible que des rôles les plus hauts.

**Pourquoi** — écrans portés de 1lalana pour des fonctionnalités que le portfolio n'a pas.

**Comment vérifier** — ouvrir Finance et Statistiques, et regarder les appels réseau.

**Comment corriger**

1. **(recommandé)** Retirer du menu et des routes Finance, Paiements et les vues de statistiques en échec (sans source de données), corriger le droit de `Diffusion`.
   *Pourquoi* : un écran qui échoue toujours est pire que pas d'écran ; le code reste dans git.
2. Implémenter les fonctions manquantes sur les données du portfolio — gros chantier, sans besoin concret.

## 6. Le build du site exige un serveur Parse

- **Gravité** : 🟡 Faible · **Type** : Bug · **Statut** : ⏳ à faire
- **Concerné** : `apps/web/next.config.mjs`, `apps/web/server/queries`

**Ce qui peut arriver** — avec `cacheComponents` les pages chargent leurs données au build : `next build` échoue sans serveur Parse joignable (rouge en local, et en CI sans serveur).

**Pourquoi** — la structure a été alignée sur le site de 1lalana.

**Comment vérifier** — `pnpm nx run web:build` avec le serveur arrêté.

**Comment corriger**

1. **(recommandé)** Builder en CI / sur Render contre l'URL du serveur déployé et le documenter ; garder les chargements.
   *Pourquoi* : correspond au mode de déploiement du site.
2. Rendre le build tolérant (valeurs vides de repli, `generateStaticParams` ne renvoyant rien) — cache de vrais échecs.

## 7. Le réabonnement contourne le double opt-in

- **Gravité** : 🟡 Faible · **Type** : Faille · **Statut** : ⏳ à faire
- **Concerné** : `apps/server/src/cloud/functions/_core/app.functions.ts` (`resubscribeNewsletter`)

**Ce qui peut arriver** — quiconque détient un lien de désabonnement chiffré valide peut réactiver (`active: true`) une adresse jamais confirmée.

**Comment corriger**

1. **(recommandé)** Ne mettre `active: true` que si `confirmed` n'est pas `false` ; sinon envoyer un e-mail de confirmation.
   *Pourquoi* : petit changement local, rétablit la garantie d'opt-in.

## 8. Restes côté site

- **Gravité** : 🟡 Faible · **Type** : Bug · **Statut** : ⏳ à faire
- **Concerné** : `apps/web/app/[locale]/layout.tsx`, `apps/web/components/Map.tsx`, `apps/web/components/Avatar.tsx`, `apps/web/utils/user.utils.ts`, `apps/web/global.d.ts`, `apps/web/translations`

**Ce qui peut arriver** — la langue des messages d'erreur zod n'est plus chargée dans le layout (à vérifier : les messages de validation sont-ils traduits) ; `Map.tsx` n'a aucun importeur, et `Avatar.tsx` (seul utilisateur de `user.utils.ts`) non plus ; le type `Messages` de `global.d.ts` n'a pas les espaces de noms `home` et `project` ; des clés de traduction sont obsolètes ; la FAQ n'est pas portée ; la langue `mg` est absente (`fr` et `en` seulement, 1lalana a `mg`).

**Comment vérifier** — envoyer le formulaire de contact avec des données invalides en `en` ; chercher les importeurs.

**Comment corriger**

1. **(recommandé)** Charger la langue zod dans le layout, supprimer les fichiers orphelins, ajouter les deux espaces de noms à `global.d.ts`, retirer les clés obsolètes avec `pnpm check-i18n`.
   *Pourquoi* : mécanique et couvert par `implementation-completeness.md`.
2. Ajouter `mg` et une page FAQ — décisions produit, suivies à part.

## 9. Vocabulaire et contenu de covoiturage

- **Gravité** : 🟡 Faible · **Type** : Bug · **Statut** : ⏳ à faire
- **Concerné** : `apps/bo/src/config/i18n/locales/*/_core/{finance,statistics}.json`, clés de tickets de `user/`, `libs/shared-faq`

**Ce qui peut arriver** — les textes de finance, statistiques et tickets parlent de trajets et de conducteurs (les clés de trajets ont été fusionnées dans les json de `_core`) ; `shared-faq` contient la FAQ de trajets de 1lalana avec l'ancienne marque, inutilisée par le site.

**Comment corriger**

1. **(recommandé)** Réécrire les textes dans les trois langues (ou les retirer avec le point 5) et vider ou réécrire `shared-faq`.
   *Pourquoi* : les mots affichés doivent correspondre au produit.

## 10. Non porté et dépendances inutilisées

- **Gravité** : 🟡 Faible · **Type** : Dette · **Statut** : ⏳ à faire
- **Concerné** : `apps/bo/package.json`, tout le dépôt

**Ce qui peut arriver** — non portés de 1lalana : tests unitaires (jest / vitest), Storybook du back-office, tests de bout en bout, application mobile, application de documentation (la route `/docs` du serveur n'a rien à servir ; `DOCS_*_PASSWORD` sont validés mais absents de `.env.example`) et notation. `apps/bo/package.json` contient `i18next-browser-languagedetector` et `mui-password-checklist`, inutilisés.

**Comment corriger**

1. **(recommandé)** Retirer les deux dépendances maintenant ; planifier les tests (serveur d'abord) comme une tâche séparée, selon `engineering-principles.md`.
   *Pourquoi* : les tests demandent leur propre mise en place et ne doivent pas être inventés dans cette branche.
