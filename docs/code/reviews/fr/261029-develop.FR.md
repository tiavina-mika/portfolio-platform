# Revue — Consolidation du monorepo, bibliothèques partagées et corrections (`develop`)

- **Branche** : `develop` (comparée à `main`, 12 commits + travail non commité)
- **Type** : Maintenance, avec plusieurs corrections
- **Auteur** : Tiavina Michael Ralainirina — `tiavinamika@gmail.com` *(GitHub : `tiavina-mika`)*
- **Créée** : 2026-10-29 à 13:33
- **Apps touchées** : Serveur, Back-office, Site web (et les bibliothèques partagées `libs/shared-*`)

## Table des matières

- [En bref](#en-bref)
- [Base de données](#base-de-données)
- [Serveur](#serveur)
- [Back-office](#back-office)
- [Site web](#site-web)
- [Voir le résultat en local](#voir-le-résultat-en-local)
- [Bugs, régressions et failles possibles](#bugs-régressions-et-failles-possibles)
- [Ce qui reste à faire](#ce-qui-reste-à-faire)

## En bref

Cette branche range le monorepo après l'import des trois apps. Les types et constantes utilisés par
plusieurs apps (collections, rôles, langues, technologies des projets, types de fichiers) sont
désormais au même endroit, dans les bibliothèques partagées, au lieu d'être recopiés dans chaque app.
Les apps ont été mises à jour pour les nouvelles versions de leurs outils (MUI 9, zod 4, le nouveau SDK
e-mail Brevo), et toutes les erreurs de types et de lint ont été corrigées. Les traductions ont été
harmonisées entre les trois apps. Une documentation complète a été écrite : architecture, décisions,
pages fonctionnelles du back-office et du site, inventaire et services externes.

Le travail non commité par-dessus corrige plusieurs vrais bugs :

- Les contrôles admin du serveur laissaient passer n'importe quel utilisateur connecté.
- L'entrée **Publier / Ne pas publier** ne faisait rien.
- La réinitialisation du mot de passe échouait.
- **Répondu** sur un message de contact n'était jamais enregistré.
- Sur le site :
  - Le tri des articles n'avait aucun effet.
  - La section liens d'un projet ne s'affichait presque jamais.
  - Une page désactivée ou supprimée restait accessible par son adresse.

Rien à réinstaller au-delà du `pnpm install` habituel, aucune variable d'environnement modifiée.

## Base de données

Aucun changement de base : ni nouvelle classe, ni nouveau champ, ni index. Des champs existants sont
maintenant utilisés là où ils auraient dû l'être :

| Classe | Nouvelle ? | Champs lus / écrits autrement | À quoi ça sert |
|---|---|---|---|
| `Article`, `Project`, `Category`, `Page`, `PageSection` | non | `active` *(désormais écrit par l'entrée Publier du menu)* | mettre un élément en ligne ou hors ligne depuis sa page d'aperçu |
| `Contact` | non | `replied` *(désormais enregistré, il n'était modifié qu'à l'écran)* | se souvenir qu'un message a reçu une réponse |
| `Page` | non | `active`, `deleted` *(désormais filtrés par le site)* | cacher aux visiteurs les pages hors ligne ou supprimées |

## Serveur

- **Contrôles admin corrigés (sécurité).** Plusieurs actions sont réservées aux administrateurs : la
  suppression définitive d'utilisateurs, les listes d'admins et le trigger de suppression
  d'utilisateur. Leur contrôle n'attendait pas sa réponse, il acceptait donc toujours. Seuls les
  administrateurs passent désormais.
- **Contrôle « propriétaire » corrigé.** Il regardait le mauvais rôle (Administrator au lieu d'Owner).
  Rien ne l'appelle aujourd'hui.
- **Réinitialisation du mot de passe corrigée.** Le serveur attend maintenant l'e-mail chiffré sous le
  même nom que celui envoyé par le back-office (`encryptedEmail`), pour la Cloud Function
  `resetPassword`.
- **Les e-mails passent par le nouveau SDK Brevo (v6).** Les e-mails de vérification, de
  réinitialisation et de newsletter, ainsi que la synchronisation des contacts vers Brevo, utilisent le
  nouveau client. Ils doivent se comporter comme avant. Deux détails ont été corrigés pendant cette
  revue : un numéro de téléphone vide n'est plus envoyé à Brevo, et les attributs qui existent déjà ne
  sont plus recréés à chaque nouveau contact.
- Aucune nouvelle Cloud Function, trigger, job ou variable d'environnement. Les pages d'inventaire ont
  été réécrites d'après le code ([inventaire](../../../inventory/README.md),
  [services](../../../services/README.md)).

## Back-office

- **Pages touchées** :
  - Les pages d'aperçu d'un article, d'un projet, d'une catégorie, d'une page et d'une section de
    page, où se trouve l'entrée **Publier / Ne pas publier** du menu.
  - La liste des contacts, où se trouve l'action **Répondu**.
  - La page de réinitialisation du mot de passe.
- **Publier / Ne pas publier** met maintenant vraiment l'élément en ligne ou hors ligne et rafraîchit
  l'aperçu. Avant, l'élément ne changeait pas.
- **Marquer comme répondu** sur un message de contact est maintenant enregistré : l'état reste après
  rechargement. Une erreur affiche désormais un message au lieu d'échouer en silence.
- La **réinitialisation du mot de passe** depuis le lien de l'e-mail fonctionne de nouveau.
- Les formulaires, tableaux, sélecteurs de date et listes déroulantes ont été mis à jour pour MUI 9 et
  zod 4, sans changement visible attendu.
- Traductions complétées : des messages qui affichaient une clé brute affichent du vrai texte.
- Docs fonctionnelles écrites pour chaque page du menu : [index du back-office](../../../features/bo/README.md)
  (par ex. [aperçu d'un article](../../../features/bo/articles/fr/ARTICLES_PREVIEW.FR.md),
  [liste des contacts](../../../features/bo/contacts/fr/CONTACTS_LIST.FR.md)).

## Site web

- **Pages touchées** :
  - Liste des articles : `http://localhost:9002/fr/articles`
  - Détail d'un projet : `http://localhost:9002/fr/projets/<slug>` (le slug de n'importe quel projet
    publié)
  - Page éditoriale : `http://localhost:9002/fr/<slug>` (le slug de n'importe quelle page)
- **Liste des articles** : choisir un tri (« Le plus récent » / « Titre ») change maintenant l'ordre et
  revient à la page 1. Avant, le choix était ignoré.
- **Détail d'un projet** : la section **Liens** (liens, GitHub, npm, CodeSandbox) s'affiche maintenant
  dès que le projet en a un. Avant, elle n'apparaissait que pour les projets qui n'avaient que des
  liens CodeSandbox.
- **Pages éditoriales** : une page mise hors ligne ou supprimée dans le back-office affiche « Page
  introuvable », même par son adresse directe.
- Docs fonctionnelles écrites pour chaque page publique : [index du site](../../../features/web/README.md).

## Voir le résultat en local

```bash
pnpm install
pnpm nx run server:dev   # API sur http://localhost:8089
pnpm nx run bo:dev       # back-office sur l'URL Vite (http://localhost:5173 par défaut)
pnpm nx run web:dev      # site sur http://localhost:9002
pnpm nx run web:sb       # Storybook sur http://localhost:6006
```

Back-office (chemins en français, langue par défaut) :

- Aperçu d'un article : `http://localhost:5173/articles/<id>`, puis l'entrée **Publier / Ne pas publier**
- Aperçu d'un projet : `http://localhost:5173/projets/<id>`
- Aperçu d'une catégorie : `http://localhost:5173/categories/<id>`
- Aperçu d'une page : `http://localhost:5173/pages/<id>`
- Aperçu d'une section de page : `http://localhost:5173/sections-de-page/<id>`
- Contacts : `http://localhost:5173/contacts`, ouvrir un message puis le marquer comme répondu
- Réinitialisation du mot de passe : `http://localhost:5173/compte/mot-de-passe/reinitialiser`

Site : voir les URL dans [Site web](#site-web).

Storybook : quatre stories ont seulement eu leur chemin d'import ajusté (aucun changement visuel) :

- `http://localhost:6006/?path=/story/components-iconbutton--icon-button`
- `http://localhost:6006/?path=/story/components-forms--form-demo`
- `http://localhost:6006/?path=/story/components-typography-pagetitle--page-title`
- `http://localhost:6006/?path=/story/components-typography-title--h-1`

## Bugs, régressions et failles possibles

Vérifications lancées pendant la revue : typecheck (server, web, bo), lint (tous les projets, 0 erreur)
et `pnpm check-i18n` passent. Les tests Storybook n'ont pas été lancés.

| Gravité | Type | Ce qui peut arriver | Quand | Suite |
|---|---|---|---|---|
| 🔴 Haute | Faille | N'importe quel utilisateur connecté au back-office passe les contrôles admin du serveur (suppression d'utilisateurs, listes d'admins) | toujours, sur `main` aussi | ✅ corrigé sur la branche : le contrôle attend la réponse sur le rôle |
| 🟠 Moyenne | Bug | Brevo refuse un contact à cause d'un numéro vide : la synchro des contacts, newsletter et inscriptions s'arrête, en silence | chaque nouveau contact sans téléphone | ✅ corrigé sur la branche : les valeurs absentes ne sont plus envoyées |
| 🟠 Moyenne | Bug | Publier / Ne pas publier sans effet ; Répondu perdu au rechargement ; réinitialisation du mot de passe en échec ; tri des articles et liens des projets ignorés ; pages hors ligne accessibles | toujours, avant le travail non commité | ✅ corrigé sur la branche |
| 🟡 Basse | Bug | L'enregistrement de « Répondu » échoue sans message | erreur réseau ou de droits | ✅ corrigé sur la branche : passe par le chargement et le message d'erreur habituels |
| 🟡 Basse | Bug | Une page enregistrée sans valeur `deleted` disparaît du site | pages créées sans utilisateur connecté | ✅ corrigé sur la branche : le site ne cache que les pages marquées supprimées |
| 🟡 Basse | Bug | Attributs Brevo recréés (et une erreur journalisée) à chaque nouveau contact | chaque création de contact | ✅ corrigé sur la branche : « existe déjà » compte comme fait |
| 🟡 Basse | Bug | Les pages dont le statut de publication n'a jamais été défini disparaissent du site | pages importées sans `active` | ⏳ reporté — [dette n°3](debt/261029-debt-develop.FR.md#3-pages-sans-statut-de-publication-absentes-du-site) |
| 🟡 Basse | Bug | Les textes au pluriel du back-office s'affichent toujours au singulier | messages du type « 3 éléments sélectionnés » ; existait avant | ⏳ reporté — [dette n°1](debt/261029-debt-develop.FR.md#1-textes-au-pluriel-toujours-affichés-au-singulier) |
| 🟡 Basse | Régression | Un rôle autorisé à modifier une section de page peut être refusé en la publiant | rôles avec des droits sur `Page` mais pas sur `PageSection` | ⏳ reporté — [dette n°2](debt/261029-debt-develop.FR.md#2-publier-une-section-de-page-vérifie-un-autre-droit-que-la-modifier) |
| 🟡 Basse | Bug | Les parcours corrigés ont été vérifiés dans le code seulement, pas dans un navigateur | avant de fusionner dans `main` | ⏳ reporté — [dette n°4](debt/261029-debt-develop.FR.md#4-parcours-corrigés-non-testés-dans-un-navigateur) |
| 🟡 Basse | Faille | Deux fonctions de contrôle admin du serveur ne sont appelées par rien, un futur appelant peut croire qu'elles protègent déjà quelque chose | existait avant | ⏳ reporté — [dette n°5](debt/261029-debt-develop.FR.md#5-fonctions-de-contrôle-admin-inutilisées-côté-serveur) |

Points reportés : [fichier de dette](debt/261029-debt-develop.FR.md).

## Ce qui reste à faire

- Commiter les corrections non commitées (pas fait : commit uniquement sur demande).
- Parcourir les flux corrigés dans un navigateur et lancer `pnpm nx run web:test-storybook`
  ([dette n°4](debt/261029-debt-develop.FR.md#4-parcours-corrigés-non-testés-dans-un-navigateur)).
- 28 avertissements de lint restent (surtout des dépendances de `useEffect` manquantes), inchangés par
  cette revue.
