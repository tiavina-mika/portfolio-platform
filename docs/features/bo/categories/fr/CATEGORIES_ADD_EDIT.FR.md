# Cas d'utilisation — Catégories (Ajouter / Modifier)

## Table des matières

- [Où trouver cette page](#où-trouver-cette-page)
- [À quoi sert cette page](#à-quoi-sert-cette-page)
- [Qui peut l'utiliser](#qui-peut-lutiliser)
- [Ce que l'on voit à l'écran](#ce-que-lon-voit-à-lécran)
- [Actions possibles](#actions-possibles)
- [Cas d'utilisation typiques](#cas-dutilisation-typiques)
- [Points d'attention / limites actuelles](#points-dattention--limites-actuelles)

## Où trouver cette page

C'est une fenêtre qui s'ouvre au-dessus de la liste des **Catégories** : bouton rond « + » pour une
création, menu Actions → **Modifier** pour une modification. La modification est aussi possible depuis
l'aperçu d'une catégorie.

## À quoi sert cette page

Créer une catégorie ou corriger son nom, son image, son type et sa visibilité.

## Qui peut l'utiliser

Le droit **Créer** (création) ou **Modifier** (modification) sur la ressource « Catégories », réglé dans
la page **Droits**. Sans ce droit, le bouton n'est pas proposé. Les propriétaires et administrateurs ont
tous les droits.

## Ce que l'on voit à l'écran

Le titre de la fenêtre est « Créer une catégorie » ou « Modifier une catégorie ». Elle contient :

- trois **onglets de langue** ; pour chacune : **Nom** (obligatoire en français), **adresse (slug)**,
  déduite du nom et modifiable, et **Tags** séparés par une virgule ;
- une **Image** (obligatoire) : utilisée par les moteurs de recherche et pour le partage sur les réseaux
  sociaux ;
- **Catégorie pour** : « Article » ou « Page » ;
- une case **Actif** : une catégorie active est visible pour les visiteurs (cochée par défaut).

## Actions possibles

- **Enregistrer** : crée ou met à jour la catégorie et ferme la fenêtre.
- **Annuler / fermer** : abandonne la saisie.

## Cas d'utilisation typiques

1. **Ajouter une catégorie** avec son nom dans les trois langues et une image.
2. **Corriger une traduction** : modifier, ouvrir l'onglet de la langue concernée.
3. **Remplacer l'image** d'une catégorie : modifier, déposer une nouvelle image.
4. **Masquer une catégorie** : décocher « Actif ».

## Points d'attention / limites actuelles

- Seul le français est obligatoire pour le nom.
- Le formulaire exige une image : il ne s'enregistre pas sans elle.
- Remplacer l'image supprime l'ancienne.
