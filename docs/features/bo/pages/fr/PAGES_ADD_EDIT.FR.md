# Cas d'utilisation — Pages (Ajouter / Modifier)

## Table des matières

- [Où trouver cette page](#où-trouver-cette-page)
- [À quoi sert cette page](#à-quoi-sert-cette-page)
- [Qui peut l'utiliser](#qui-peut-lutiliser)
- [Ce que l'on voit à l'écran](#ce-que-lon-voit-à-lécran)
  - [Étape 1 — Détails traduits](#étape-1--détails-traduits)
  - [Étape 2 — Images](#étape-2--images)
  - [Étape 3 — Visibilité, catégories et emplacement](#étape-3--visibilité-catégories-et-emplacement)
- [Actions possibles](#actions-possibles)
- [Cas d'utilisation typiques](#cas-dutilisation-typiques)
- [Points d'attention / limites actuelles](#points-dattention--limites-actuelles)

## Où trouver cette page

- Création : bouton rond « + » en bas à droite de la liste des **Pages**, ou carte **Page** de l'écran
  d'accueil.
- Modification : menu **Actions** d'une page → **Modifier** (depuis la liste ou depuis l'aperçu).

## À quoi sert cette page

Rédiger une page du site public, ou corriger une page existante. Le contenu se saisit langue par langue
(français, anglais, malgache) dans un formulaire en trois étapes.

## Qui peut l'utiliser

Le droit **Créer** (création) ou **Modifier** (modification) sur la ressource « Pages », réglé dans la
page **Droits**. Sans ce droit, l'écran « introuvable » s'affiche. Les comptes Owner et
Super Admin ont tous les droits.

## Ce que l'on voit à l'écran

Le titre de la page est « Nouvelle page » ou « Modifier la page - … ». Le bouton principal de chaque étape
indique la progression (« Suivant (1/3) »…) ; un bouton « Précédent » revient en arrière. Rien n'est
enregistré avant la dernière étape.

### Étape 1 — Détails traduits

Trois onglets de langue. Pour chaque langue :

- **Nom de la page** : sert de texte de lien ; l'adresse de la page (« slug ») en est déduite
  automatiquement et reste modifiable. Obligatoire en français.
- **Titre** : affiché en haut de la page ; à défaut, c'est le nom qui est affiché.
- **Description** (jusqu'à 2000 caractères).
- **Contenu** : éditeur de texte riche (titres, liens, images…). Obligatoire en français.
- **Adresse (slug)**, **Tags** (séparés par une virgule), **Meta titre** et **Meta description** pour les
  moteurs de
  recherche (environ 70 et 170 caractères au maximum).

Un onglet de langue qui contient une erreur est signalé.

### Étape 2 — Images

Trois zones de dépôt, toutes facultatives : **Image de bannière** (en haut de la page), **Aperçu de
l'image** (petite taille, pour une carte ou une liste) et **Images** (jusqu'à 5).

### Étape 3 — Visibilité, catégories et emplacement

- **Actif** : interrupteur ; une page active est visible sur le site (activé par défaut à la création).
- **Catégorie** : une ou plusieurs catégories, parmi celles qui existent.
- **Emplacement du lien** : **Dans le menu**, **Dans le pied de page**, les deux, ou aucun.

## Actions possibles

- **Terminer et enregistrer** (étape 3) : enregistre la page et ouvre son aperçu.
- **Précédent** : revient à l'étape précédente ; à l'étape 1, revient à l'écran d'où l'on vient.
- En modification, le menu **Actions** de l'en-tête permet aussi de revenir à la liste, d'ajouter une
  nouvelle page, de voir l'aperçu ou de supprimer la page.

## Cas d'utilisation typiques

1. **Créer une page « À propos »** : nom et contenu en français, puis compléter l'anglais et le malgache,
   cocher « Dans le menu ».
2. **Traduire une page** : modifier la page, ouvrir l'onglet de la langue manquante à l'étape 1.
3. **Mettre une page hors ligne sans la supprimer** : étape 3, désactiver « Actif ».
4. **Changer l'image de bannière** : étape 2, déposer une nouvelle image.

## Points d'attention / limites actuelles

- Seul le français est obligatoire ; les pages sans traduction ne sont pas bloquées.
- Une page n'est enregistrée qu'à la fin des trois étapes : quitter avant perd la saisie.
- Les sections de la page ne se créent pas ici mais depuis l'aperçu de la page
  (voir [Sections de page](PAGE_SECTIONS.FR.md)).
