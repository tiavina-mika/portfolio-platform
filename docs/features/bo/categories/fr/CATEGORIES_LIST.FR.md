# Cas d'utilisation — Catégories (Liste)

## Table des matières

- [Où trouver cette page](#où-trouver-cette-page)
- [À quoi sert cette page](#à-quoi-sert-cette-page)
- [Qui peut l'utiliser](#qui-peut-lutiliser)
- [Ce que l'on voit à l'écran](#ce-que-lon-voit-à-lécran)
- [Rechercher / filtrer](#rechercher--filtrer)
- [Actions possibles](#actions-possibles)
- [Cas d'utilisation typiques](#cas-dutilisation-typiques)
- [Points d'attention / limites actuelles](#points-dattention--limites-actuelles)

## Où trouver cette page

Menu de gauche → groupe **Contenu** → **Catégories**.

## À quoi sert cette page

Les catégories servent à classer les articles et les pages du site. Cette liste permet de les
retrouver, d'en créer, de les modifier et de les supprimer. Le nom d'une catégorie est saisi en français,
en anglais et en malgache.

## Qui peut l'utiliser

Droits de la ressource « Catégories », réglés dans la page **Droits** :

| Droit | Ce qu'il permet ici |
|---|---|
| Lister | Voir la liste (sans ce droit, l'écran « introuvable » s'affiche) |
| Consulter | « Voir l'aperçu » |
| Modifier | « Modifier » |
| Créer | Bouton rond « + » |
| Supprimer | Mettre une catégorie à la corbeille |
| Supprimer définitivement | Onglet « Corbeille » et destruction définitive |

Les comptes Owner et Super Admin ont tous les droits.

## Ce que l'on voit à l'écran

- Onglets **Tout** et **Corbeille** (ce dernier réservé aux comptes pouvant supprimer définitivement).
- Un champ de recherche et un panneau de filtres avancés.
- Un tableau : **Nom** (dans la langue choisie dans les paramètres), **Catégorie pour** (pastille « Article »
  ou « Page »), **Item** (nombre d'éléments rattachés), **Créé le**, **Modifié le** et **Actions**.
- Affichage en tableau ou en vignettes (grand écran), tri par colonne, 20 lignes par écran (50 ou 75
  au choix).

## Rechercher / filtrer

- Le champ « Rechercher une catégorie » cherche par nom.
- Les filtres avancés : type de catégorie (article ou page), actif ou non, date de création, date de
  modification, auteur (nom ou e-mail).
- L'icône « Réinitialiser les filtres » remet la liste à zéro.

## Actions possibles

- **Créer** : « + » ouvre une fenêtre (voir [Ajouter ou modifier une catégorie](CATEGORIES_ADD_EDIT.FR.md)).
- **Modifier** : menu Actions → Modifier, dans la même fenêtre.
- **Voir l'aperçu** : fiche détaillée (voir [Aperçu d'une catégorie](CATEGORIES_PREVIEW.FR.md)).
- **Voir les articles / les pages de cette catégorie** : ouvre la liste des articles ou des pages déjà
  filtrée sur la catégorie.
- **Supprimer** : après confirmation, met la catégorie à la corbeille.
- **Corbeille** : chaque ligne propose « Voir l'aperçu » et « Supprimer » (définitif, irréversible).

## Cas d'utilisation typiques

1. **Créer la catégorie « Tutoriels »** pour les articles : « + », nom, image, « Catégorie pour » Article.
2. **Voir ce qu'une catégorie contient** : colonne Item, puis « Voir les articles pour cette catégorie ».
3. **Renommer une catégorie** : Actions → Modifier.
4. **Retirer une catégorie devenue inutile** : Actions → Supprimer.

## Points d'attention / limites actuelles

- Supprimer une catégorie la retire des articles et des pages qui l'utilisaient ; ils restent
  publiés mais sans cette catégorie. La catégorie elle-même peut être restaurée depuis la corbeille, mais
  les articles et pages qui la portaient ne la retrouvent pas.
- Pour les comptes qui peuvent supprimer définitivement, la sélection de plusieurs lignes n'est pas
  proposée : les suppressions se font ligne par ligne.
- Il n'y a que deux types de catégories : articles et pages.
