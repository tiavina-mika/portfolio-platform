# Bascule d'espace (Portfolio / Aldaron)

## Table des matières

- [Objectif](#objectif)
- [Ce qui existe déjà](#ce-qui-existe-déjà)
- [Décisions](#décisions)
- [Le sélecteur d'espace](#le-sélecteur-despace)
- [Rôle et accès](#rôle-et-accès)
- [Ce qui change quand Aldaron est actif](#ce-qui-change-quand-aldaron-est-actif)
- [Fichiers concernés](#fichiers-concernés)
- [Questions ouvertes](#questions-ouvertes)
- [Ordre de travail](#ordre-de-travail)

> Note de conception, écrite avant tout code. Le back-office sert deux activités sur le même serveur et la même base : le portfolio et Aldaron. Un sélecteur dans la page Paramètres permet à l'utilisateur connecté de choisir l'espace dans lequel il travaille.

## Objectif

- Un seul back-office, un seul serveur Parse, une seule base ; un **espace** est une vue sur cet ensemble, nommée d'après une valeur de `TargetEnum` (`portfolio` ou `aldaron`).
- Passer à Aldaron affiche le logo d'Aldaron et masque tout ce qui ne sert qu'à modifier le site du portfolio (détails, images principales, CV).
- Qui peut basculer est décidé par le rôle de l'utilisateur, jamais par le sélecteur lui-même.
- Aldaron aura ses propres collections (devis, clients, missions) : elles n'apparaissent que dans l'espace Aldaron.

## Ce qui existe déjà

| Fait | Où |
|---|---|
| `TargetEnum { PORTFOLIO, ALDARON }` | `libs/shared-types/src/target.type.ts` |
| Les articles, pages et catégories portent `targets` (plusieurs valeurs) ; une ligne sans ce champ est lue comme portfolio | `apps/server/src/cloud/utils/_core/parse.utils.cloud.ts` (`contentTargetQuery`) |
| Un `Project` porte déjà un `target` unique (portfolio par défaut, posé par son trigger), a une liste de choix dans son formulaire et est lu par cible par le site | `project.triggers.ts`, `project.service.cloud.ts`, `ProjectFormSettingsSection.tsx` |
| `aldaron-web` lit le même serveur Parse que le site du portfolio | `apps/aldaron-web/env.ts` |
| Les réglages du back-office sont des préférences locales (redux-persist) ; les trois sections du site (`details`, `images`, `cv`) sont des formulaires enregistrés sur le serveur | `settings.constants.ts`, `Settings.tsx` |
| Les droits sont par collection (`find`, `get`, `create`, `update`, `delete`) et un domaine ajoute ses collections avec `registerRightsEntities` | `user.constants.ts`, `project-role.utils.ts` |
| Le logo de la barre latérale est le composant `Logo` et, barre repliée, une icône de `IMAGES` | `Logo.tsx`, `DashboardLayout.tsx`, `app.constants.ts` |

« Un projet est soit Aldaron, soit portfolio » est donc déjà stocké : ce qui manque, c'est que le back-office le lise (la liste des projets suit l'espace actif).

## Décisions

1. **Réutiliser `TargetEnum`** comme type d'espace. Pas de nouvel enum.
2. **L'espace actif est une préférence locale** (redux-persist, slice `settings`), comme le thème et la langue. Il n'est pas stocké sur le serveur : deux personnes sur le même compte peuvent travailler dans des espaces différents, et rien n'est enregistré au changement.
3. **Le serveur ne fait jamais confiance au sélecteur.** L'accès aux données Aldaron est vérifié à partir du rôle dans chaque Cloud Function ; le sélecteur décide seulement de ce que le back-office affiche.
4. **Aucune donnée n'est supprimée ni déplacée** quand l'espace change.
5. **Un seul registre décide de ce qu'un espace affiche** (logo, entrées de menu, sections des paramètres) : une constante simple indexée par `TargetEnum`, donc ajouter un espace ou masquer une section est une seule modification.

## Le sélecteur d'espace

- Placé dans **Paramètres**, nouvelle section `workspace` dans le groupe « back-office » du rail (à côté de la langue et de l'apparence), car c'est une préférence locale qui s'applique tout de suite et n'a rien à enregistrer.
- Affiché **uniquement à un utilisateur qui peut utiliser plus d'un espace** ; les autres ne le voient jamais et travaillent toujours dans le portfolio.
- Deux choix, chacun nommé et illustré par son propre logo. Choisir applique immédiatement : la marque de la barre latérale, le menu, le tableau de bord et les filtres des listes suivent sans rechargement.
- Valeur stockée : `workspace: TargetEnum` dans `ISettingState`. Un état sauvegardé avant l'existence du champ n'en a pas et est lu comme `portfolio`.
- Si l'espace stocké n'est plus utilisable par l'utilisateur (rôle modifié), on revient à `portfolio` au démarrage.

## Rôle et accès

Le rôle décide des espaces qu'un utilisateur peut utiliser.

- Nouveau champ sur l'objet `_Role` : `workspaces: TargetEnum[]`. Un rôle sauvegardé avant l'existence du champ n'en a pas et est lu comme `[portfolio]` : personne ne gagne d'accès par ce changement.
- Modifié dans la section **accès** du formulaire de rôle : une case par espace, `portfolio` cochée par défaut.
- Les rôles de plus haut niveau (`OWNER`, `SUPER_ADMIN`, voir `HIGHEST_LEVEL_ROLES`) ont tous les espaces sans que ce soit stocké.
- Les espaces d'un utilisateur sont l'union des `workspaces` de tous ses rôles, calculée sur le serveur et renvoyée avec l'utilisateur courant : le back-office la lit et ne la recalcule pas.
- **Application côté serveur :**
  - chaque Cloud Function d'une collection Aldaron refuse un utilisateur qui n'a pas `aldaron`, en plus du droit habituel sur la collection ;
  - les fonctions de liste et de détail des projets ne renvoient un projet Aldaron qu'à un utilisateur qui a `aldaron`, et le filtre par `target` est appliqué sur le serveur, pas dans le navigateur ;
  - les articles, pages et catégories gardent leur filtre `targets` ; un utilisateur sans `aldaron` ne voit jamais les lignes qui le nomment seul.
- Les droits habituels par collection s'appliquent toujours dans un espace : avoir `aldaron` ouvre l'espace, pas toutes les actions qu'il contient.

## Ce qui change quand Aldaron est actif

| Zone | Portfolio | Aldaron |
|---|---|---|
| Marque de la barre latérale (ouverte et repliée) | Logo et icône du portfolio (`apps/bo/public/images`) | Logo et symbole d'Aldaron, tirés des fichiers de marque (`apps/aldaron-web/public/brand`), copiés dans `apps/bo/public/images` |
| Paramètres, groupe « site » (détails, images principales, CV) | Affiché | **Masqué** : ces formulaires modifient le site du portfolio ; une URL avec `?section=cv` (ou `details`, `images`) retombe sur la section par défaut |
| Paramètres, langue et apparence | Affichés | Affichés |
| Menu | Projets, articles, pages, catégories, contacts, newsletter | Projets, articles, pages, catégories, puis les entrées Aldaron (devis, clients, missions) au fil de leur création |
| Liste et formulaire des projets | Projets dont le `target` est portfolio | Projets dont le `target` est aldaron ; la cible est préremplie avec l'espace actif à la création |
| Articles, pages, catégories | Filtrés sur `portfolio` par défaut | Filtrés sur `aldaron` par défaut ; le champ `targets` du formulaire reste modifiable |
| Tableau de bord | Cartes du portfolio | Cartes d'Aldaron |

Le titre de l'onglet et le favicon restent inchangés pour l'instant.

## Fichiers concernés

Serveur, back-office, bibliothèques partagées et docs : la fonctionnalité touche tout cela.

| App / lib | Changement |
|---|---|
| `libs/shared-types` | `TargetEnum` existe déjà ; ajouter le champ `workspaces` au type partagé du rôle s'il existe |
| `apps/server` | `workspaces` sur `_Role` (validation, fonctions de rôle, un helper qui calcule les espaces d'un utilisateur), la vérification dans les fonctions Aldaron, le filtre `target` sur les fonctions de liste des projets, les espaces renvoyés avec l'utilisateur courant |
| `apps/bo` types | `workspace` dans `ISettingState` ; `SettingsSectionEnum.WORKSPACE` ; `workspaces` sur les types du rôle et de l'utilisateur courant |
| `apps/bo` constantes | un registre `WORKSPACES` indexé par `TargetEnum` (fichiers de logo, sections des paramètres masquées) ; entrées de logo Aldaron dans `IMAGES` |
| `apps/bo` redux | action et sélecteur de l'espace actif dans le slice des paramètres |
| `apps/bo` hooks | `useWorkspace` (espace actif, espaces disponibles, setter) |
| `apps/bo` containers | `SettingsWorkspacePanel` (le sélecteur), `SettingsSectionsRail` (masquer des sections), section accès de `RoleForm` (cases des espaces) |
| `apps/bo` mise en page | `Logo` et l'icône repliée de `DashboardLayout.tsx` suivent l'espace |
| `apps/bo` listes | la liste des projets envoie le `target` actif ; les listes d'articles, pages et catégories prennent par défaut leur filtre `targets` |
| `apps/bo` i18n | clés du sélecteur, des noms d'espace et des cases du rôle, en `fr`, `en` et `mg` (`pnpm check-i18n`) |
| `apps/web`, `apps/aldaron-web` | rien : ils lisent déjà par cible |
| Docs | `docs/features/bo/settings` et `roles` (français), `docs/inventory/README.md` si un champ de rôle y figure |

## Questions ouvertes

- **Contacts et newsletter** : le formulaire de contact et la newsletter appartiennent aujourd'hui au site du portfolio. Restent-ils visibles dans l'espace Aldaron, ou `aldaron-web` aura-t-il les siens ? D'ici la décision, ils restent visibles dans les deux.
- **Variantes du logo Aldaron** : le dossier de marque contient des fichiers horizontal, empilé et symbole en versions normale, sombre et monochrome ; laquelle convient à la barre latérale claire ou sombre se vérifie avec ses styles au moment de la construire.
- **Tableau de bord** : les cartes Aldaron dépendent de la première entité Aldaron.

## Ordre de travail

1. ✅ Types partagés et champ `workspaces` du rôle, côté serveur (calcul et application), puis le formulaire de rôle.
2. ✅ La préférence d'espace, le sélecteur dans Paramètres et le registre `WORKSPACES` (logo, sections masquées).
3. ✅ Les listes des projets et du CMS qui suivent l'espace actif.
4. ⏳ La première collection Aldaron (devis), puis clients et missions, chacune derrière la vérification serveur de l'étape 1 (`resolveWorkspace` / `getUserWorkspaces`).
5. ✅ Docs : fonctionnalités, et inventaire si besoin.
