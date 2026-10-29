# Cas d'utilisation — Sections de page (Liste, Ajouter / Modifier, Aperçu)

## Table des matières

- [Où trouver cette page](#où-trouver-cette-page)
- [À quoi sert cette page](#à-quoi-sert-cette-page)
- [Qui peut l'utiliser](#qui-peut-lutiliser)
- [Ce que l'on voit à l'écran](#ce-que-lon-voit-à-lécran)
  - [La liste des sections](#la-liste-des-sections)
  - [L'aperçu d'une section](#laperçu-dune-section)
  - [Le formulaire](#le-formulaire)
- [Actions possibles](#actions-possibles)
- [Cas d'utilisation typiques](#cas-dutilisation-typiques)
- [Points d'attention / limites actuelles](#points-dattention--limites-actuelles)

## Où trouver cette page

- Liste : menu de gauche → **Page web** → **Sections**.
- Création : depuis l'aperçu d'une page, bouton « + » du bloc **Sections**.
- Modification : crayon d'une section dans l'aperçu de la page, ou dans l'aperçu de la section.

## À quoi sert cette page

Une section est un bloc de contenu éditorial rattaché à une page du site : un titre, une description
et une série de **blocs** (titre, texte, image à gauche, à droite ou en bas). Cette rubrique permet de
suivre toutes les sections et de les corriger.

## Qui peut l'utiliser

Les sections suivent les droits de la ressource **Pages** (page **Droits**) : Lister pour la liste,
Consulter pour l'aperçu, Modifier pour le formulaire d'édition, Créer pour ajouter, Supprimer pour
mettre à la corbeille. Sans le droit nécessaire, l'écran « introuvable » s'affiche.

## Ce que l'on voit à l'écran

### La liste des sections

Même présentation que la liste des pages : onglets **Tout** et **Corbeille** (ce dernier réservé aux
comptes pouvant supprimer définitivement), recherche, filtres, tri, 20 lignes par écran. Colonnes :
**Titre**, **Description**, **Auteur**, **Créé le**, **Modifié le**, **Actions**. Le menu Actions propose
**Voir l'aperçu** et **Supprimer**. Il n'y a pas de bouton de création dans cette liste.

### L'aperçu d'une section

Onglets de langue, puis : la liste des **pages** qui utilisent la section (avec un œil pour ouvrir la
page et un crayon pour modifier la section depuis cette page), les **détails**, l'aperçu de chaque
**bloc**, et le **statut** (actif ou non).

### Le formulaire

Par langue : **Titre** (obligatoire en français) et **Description**. Puis la liste des blocs, chacun avec un
**titre** (obligatoire en français), une **description**, un **contenu** (obligatoire en français, 3000
caractères au maximum), une **image** facultative et, si une image est déposée, sa **position** (gauche,
droite ou en bas, obligatoire). Chaque bloc peut être supprimé, et « Ajouter un bloc » en crée un nouveau.
Une case **Actif** rend la section visible.

## Actions possibles

- **Créer** : depuis l'aperçu d'une page ; la section est rattachée à cette page et on revient à l'aperçu
  de la page une fois enregistrée.
- **Modifier** : après enregistrement, on arrive sur l'aperçu de la section.
- **Supprimer** : met la section à la corbeille (depuis la liste, l'aperçu ou le formulaire).
- **Supprimer définitivement** : onglet Corbeille, comptes autorisés seulement.

## Cas d'utilisation typiques

1. **Ajouter une rubrique « Nos services »** à une page : aperçu de la page → « + » → saisir les blocs.
2. **Illustrer un bloc** : déposer une image et choisir sa position.
3. **Retirer une section** : liste des sections → Actions → Supprimer.
4. **Savoir où est utilisée une section** : aperçu de la section, bloc des pages.

## Points d'attention / limites actuelles

- Une section se crée toujours à partir d'une page ; l'écran ne permet pas de rattacher une section
  existante à une deuxième page.
- Dans la liste, les filtres de catégorie, de nom de page et de meta titre ne concernent pas les
  sections ; la recherche porte sur le titre et la description.
- Supprimer définitivement une page détruit les sections qui n'appartenaient qu'à elle.
- Pas de bouton « Restaurer » pour une section mise à la corbeille.
