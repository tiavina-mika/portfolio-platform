# Dette — Consolidation du monorepo, bibliothèques partagées et corrections (`develop`)

> Revue : [261029-develop.FR.md](../261029-develop.FR.md)
> Branche : `develop` · Créée le 2026-10-29 à 13:33 · Auteur : `tiavinamika@gmail.com`
> Statut global : ⏳ à faire

## Table des matières

- [Résumé](#résumé)
- [1. Textes au pluriel toujours affichés au singulier](#1-textes-au-pluriel-toujours-affichés-au-singulier)
- [2. Publier une section de page vérifie un autre droit que la modifier](#2-publier-une-section-de-page-vérifie-un-autre-droit-que-la-modifier)
- [3. Pages sans statut de publication absentes du site](#3-pages-sans-statut-de-publication-absentes-du-site)
- [4. Parcours corrigés non testés dans un navigateur](#4-parcours-corrigés-non-testés-dans-un-navigateur)
- [5. Fonctions de contrôle admin inutilisées côté serveur](#5-fonctions-de-contrôle-admin-inutilisées-côté-serveur)

## Résumé

| # | Gravité | Type | Risque | Statut |
|---|---|---|---|---|
| 1 | 🟡 Basse | Bug | Textes au pluriel du BO toujours au singulier (existait avant la branche) | ⏳ à faire |
| 2 | 🟡 Basse | Régression | Publier une section vérifie les droits `PageSection`, la modifier vérifie les droits `Page` | ⏳ à faire |
| 3 | 🟡 Basse | Bug | Les pages sans `active` sont désormais cachées sur le site | ⏳ à faire |
| 4 | 🟡 Basse | Bug | Parcours corrigés vérifiés seulement dans le code | ⏳ à faire |
| 5 | 🟡 Basse | Faille | `cloudValidationRules` et `isOwner` n'ont aucun appelant (existait avant la branche) | ⏳ à faire |

## 1. Textes au pluriel toujours affichés au singulier

- **Gravité** : 🟡 Basse · **Type** : Bug · **Statut** : ⏳ à faire
- **Concerné** : `apps/bo/src/config/i18n/locales/{en,fr,mg}/common.json`, `.../user.json`

**Ce qui peut arriver** — un admin sélectionne 3 lignes ; la confirmation affiche la phrase au
singulier (par ex. « Voulez-vous vraiment supprimer cet élément ? ») au lieu de la phrase au pluriel.

**Pourquoi** — les locales utilisent l'ancien suffixe `cle_plural` (3 clés par fichier :
`sureToDeleteSelected`, `selectedCount`, `newCount`, `removeRolesForThisUserSuccessfully`…).
`i18next` `^26` ne connaît que les suffixes `Intl.PluralRules` (`_one`, `_other`), et aucune option
`compatibilityJSON` n'est définie. Le commit 6d23988 n'a fait que reformater ces clés : le bug existait
avant la branche.

**Comment vérifier** — dans la liste des utilisateurs, sélectionner deux utilisateurs et ouvrir la
fenêtre de suppression ; ou appeler `i18n.t('common:sureToDeleteSelected', { count: 2 })` dans la console.

**Comment corriger**

1. **(recommandé)** Renommer `cle` / `cle_plural` en `cle_one` / `cle_other` dans les trois locales
   (pour `mg`, `_one` et `_other` aussi), puis lancer `pnpm check-i18n`.
   *Pourquoi* : c'est le format de l'i18next installé, sans option de compatibilité à traîner ; quelques
   clés seulement.
2. Définir `compatibilityJSON: 'v3'` dans `apps/bo/src/config/i18n/index.ts` — n'est plus pris en charge
   par les versions récentes d'i18next, ça repousse seulement le problème.

## 2. Publier une section de page vérifie un autre droit que la modifier

- **Gravité** : 🟡 Basse · **Type** : Régression · **Statut** : ⏳ à faire
- **Concerné** : `apps/bo/src/pages/pages/sections/PageSection.tsx`, `apps/bo/src/redux/actions/pageSection.action.ts`

**Ce qui peut arriver** — un rôle avec le droit `update` sur `Page` mais pas sur `PageSection` peut
modifier une section (l'action de modification vérifie `collection: 'Page'`) mais reçoit « pas le
droit » en utilisant **Publier / Ne pas publier** dessus (le nouvel appel `toggleActive` passe
`collection: 'PageSection'`). Les admins et propriétaires ne sont pas concernés (ils passent outre la
vérification dans `canAccessTo`).

**Pourquoi** — `pageSection.action.ts` mélange les deux : création / modification / suppression vérifient
`Page`, liste / lecture vérifient `PageSection`. Le nouvel appel a suivi le nom de la classe.

**Comment vérifier** — créer un rôle avec `Page` find/get/update et `PageSection` find/get seulement, se
connecter avec, ouvrir l'aperçu d'une section et la publier.

**Comment corriger**

1. **(recommandé)** Passer `collection: 'Page'` dans l'appel `toggleActive` de `PageSection.tsx`, comme
   les autres actions d'écriture sur les sections.
   *Pourquoi* : une ligne ; une section se modifie comme une partie de sa page, le même droit doit donc
   la couvrir.
2. Donner aux rôles des droits `PageSection` explicites et passer toutes les écritures de section sur
   `PageSection` — plus précis, mais c'est un changement du modèle de droits qui demande une décision et
   une mise à jour des rôles existants.

## 3. Pages sans statut de publication absentes du site

- **Gravité** : 🟡 Basse · **Type** : Bug · **Statut** : ⏳ à faire
- **Concerné** : `apps/web/server/queries/page.queries.ts` (`getPage`), collection Mongo `Page`

**Ce qui peut arriver** — une page importée de l'ancien portfolio sans valeur `active` affiche « Page
introuvable » sur le site, alors qu'elle s'affichait avant ce changement.

**Pourquoi** — `getPage` filtre maintenant `.equalTo('active', true)`. Le `beforeSave` du serveur définit
`deleted` à la création mais jamais de valeur `active` par défaut ; une page créée dans le back-office la
reçoit du formulaire, une page importée peut-être pas. (Le filtre sur `deleted` a été assoupli en
`notEqualTo('deleted', true)` pendant la revue pour la même raison.)

**Comment vérifier** — dans Mongo : `db.Page.countDocuments({ active: { $exists: false } })`.

**Comment corriger**

1. **(recommandé)** Lancer le comptage ci-dessus ; s'il n'est pas à 0, mettre `active: true` sur ces
   pages une fois (script ponctuel ou mise à jour Mongo), et garder le filtre.
   *Pourquoi* : une page hors ligne ne doit jamais être visible des visiteurs ; corriger les données
   garde la règle simple.
2. Filtrer avec `notEqualTo('active', false)` — affiche les pages sans statut, mais une page qui n'a
   jamais choisi de statut devient alors publique par défaut.

## 4. Parcours corrigés non testés dans un navigateur

- **Gravité** : 🟡 Basse · **Type** : Bug · **Statut** : ⏳ à faire
- **Concerné** : pages d'aperçu du BO (`toggleActive` dans `apps/bo/src/redux/actions/app.action.ts`),
  contacts (`setContactAsReplied`), réinitialisation du mot de passe (`auth.action.ts` ↔
  `auth.functions.ts`), Brevo (`apps/server/src/services/email.service.ts`), `Sort.tsx` et détail d'un
  projet sur le site

**Ce qui peut arriver** — une correction juste dans le code échoue à l'exécution, par exemple une
permission de classe qui refuse le `save()` côté client de `active` ou `replied`, ou Brevo qui rejette
une requête.

**Pourquoi** — les corrections ont été vérifiées par typecheck, lint et lecture, pas en lançant les
apps ; `apps/bo` et `apps/server` n'ont pas de tests, et les tests Storybook du site n'ont pas été lancés.

**Comment vérifier** — la liste de la section « Voir le résultat en local » de la revue, puis
`pnpm nx run web:test-storybook`. Pour Brevo, créer un contact sans téléphone et vérifier dans les
journaux du serveur la ligne `create contact success`.

**Comment corriger**

1. **(recommandé)** Parcourir chaque flux une fois en local avant de fusionner `develop` dans `main`, et
   corriger ce qui échoue sur la même branche.
   *Pourquoi* : le moyen le moins coûteux d'attraper les erreurs d'exécution ; ces apps n'ont pas encore
   de tests.
2. Mettre en place un lanceur de tests pour `apps/server` (Cloud Functions) dans une tâche à part — utile,
   mais hors de cette revue.

## 5. Fonctions de contrôle admin inutilisées côté serveur

- **Gravité** : 🟡 Basse · **Type** : Faille · **Statut** : ⏳ à faire
- **Concerné** : `apps/server/src/cloud/utils/utils.cloud.ts` (`cloudValidationRules`),
  `apps/server/src/cloud/utils/role.utils.cloud.ts` (`isOwner`)

**Ce qui peut arriver** — un développeur ajoute `validator: cloudValidationRules` à une Cloud Function en
croyant qu'elle en protège déjà d'autres ; rien ne l'a jamais exécutée. Les deux ont été corrigées
(`await` manquant, mauvais index de rôle) mais ne sont appelées par rien.

**Pourquoi** — existait avant la branche ; le travail non commité a corrigé leur logique sans les brancher.

**Comment vérifier** — `grep -rn "cloudValidationRules\|isOwner(" apps/server/src` : seulement les
définitions.

**Comment corriger**

1. **(recommandé)** Supprimer les deux fonctions.
   *Pourquoi* : aucun appelant (YAGNI, pas de code orphelin) ; les contrôles admin passent déjà par
   `isAdministrator` / `isAdministratorOrBetter`.
2. Les garder et les brancher là où un contrôle réservé au propriétaire ou à l'admin est vraiment
   nécessaire — seulement si ce besoin existe aujourd'hui.
