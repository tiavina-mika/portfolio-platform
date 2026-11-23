# Dette — Missions de l'espace Aldaron

> Revue : [261123-feat-aldaron-mission-collection.FR.md](../261123-feat-aldaron-mission-collection.FR.md)
> Branche : `feat/aldaron-mission-collection` · Créée le 2026-11-23 à 20:48 · Auteur : `tiavinamika@gmail.com`
> État global : ⏳ à faire

## Table des matières

- [Résumé](#résumé)
- [1. Personnes assignées par un rôle hérité](#1-personnes-assignées-par-un-rôle-hérité)
- [2. Jour des dates dans le navigateur et sur le serveur](#2-jour-des-dates-dans-le-navigateur-et-sur-le-serveur)

## Résumé

| # | Gravité | Type | Risque | État |
|---|---|---|---|---|
| 1 | 🟡 Faible | Bug | Un membre qui a Aldaron par un rôle parent n'est pas assignable | ⏳ à faire |
| 2 | 🟡 Faible | Bug | Le formulaire et le serveur peuvent lire un jour différent près de minuit | ⏳ à faire |

## 1. Personnes assignées par un rôle hérité

- **Gravité** : 🟡 Faible · **Type** : Bug · **État** : ⏳ à faire
- **Concerné** : `apps/server/src/cloud/services/_domain/mission.service.cloud.ts`
  (`getMissionAssigneesService`), `apps/server/src/cloud/utils/_core/role.utils.cloud.ts` (`getUserWorkspaces`)

**Ce qui peut arriver** — un rôle « Réalisation » a l'espace Aldaron ; un rôle « Junior » en est le rôle
enfant dans Parse. Un membre du seul rôle « Junior » n'est pas proposé dans « Réalisée par », et une
mission qui lui est confiée par un appel direct est refusée.

**Pourquoi** — le choix et `getUserWorkspaces` lisent les rôles dont l'utilisateur est membre direct
(`equalTo('users', user)`), pas ceux hérités par la relation `roles` de Parse. C'était déjà le cas avant la
branche pour la vérification de l'espace ; la branche ne fait que la suivre.

**Comment le vérifier** — créer un rôle enfant d'un rôle Aldaron, y mettre un utilisateur seul, ouvrir le
formulaire de mission.

**Comment le corriger**

1. **(recommandé)** Attendre que le back-office édite l'héritage des rôles : aucun écran ne crée de rôle
   enfant aujourd'hui, le cas n'existe que par une modification directe de la base.
   *Pourquoi* : changer `getUserWorkspaces` touche toutes les vérifications d'espace de la plateforme pour
   un cas que personne ne peut créer depuis l'interface.
2. Résoudre les rôles hérités dans `getRolesForUser` (remonter la relation `roles`), puis le réutiliser
   dans le choix — un changement du cœur, avec des tests sur les utilitaires de droits.

## 2. Jour des dates dans le navigateur et sur le serveur

- **Gravité** : 🟡 Faible · **Type** : Bug · **État** : ⏳ à faire
- **Concerné** : `apps/bo/src/validations/_domain/mission.validation.ts` (`toDayValue`),
  `apps/server/src/utils/_domain/mission.utils.ts` (`isMissionEndBeforeStart`)

**Ce qui peut arriver** — un admin à Paris choisit une fin à 23 h 30 heure locale pour une mission que le
serveur a démarrée à 0 h 30 à Antananarivo le lendemain : le formulaire accepte, le serveur refuse (ou
l'inverse), avec le message lisible du serveur.

**Pourquoi** — le formulaire compare les jours dans le fuseau du navigateur ; le serveur dans celui de
l'entreprise.

**Comment le vérifier** — mettre le navigateur en UTC−10 et saisir des dates autour de minuit.

**Comment le corriger**

1. **(recommandé)** Garder tel quel : le serveur refuse avec un message lisible et rien de faux n'est
   enregistré.
   *Pourquoi* : le sélecteur de date enregistre minuit du jour choisi, l'écart n'apparaît que pour des
   dates remplies par le serveur la nuit, un cas rare pour une équipe qui travaille dans un seul pays.
2. Comparer aussi dans le fuseau de l'entreprise dans le formulaire (`DEFAULT_COUNTRY.timeZone` avec
   `Intl`), en partageant `toBusinessDay` via `libs/shared-utils`.
