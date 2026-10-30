# Cas d'utilisation — Projets (Ajout et modification)

## Table des matières

- [Où trouver cette page](#où-trouver-cette-page)
- [À quoi sert cette page](#à-quoi-sert-cette-page)
- [Qui peut l'utiliser](#qui-peut-lutiliser)
- [Ce que l'on voit à l'écran](#ce-que-lon-voit-à-lécran)
  - [Contenu (une version par langue)](#contenu-une-version-par-langue)
  - [SEO](#seo)
  - [Images](#images)
  - [Classification](#classification)
  - [Réglages](#réglages)
- [Actions possibles](#actions-possibles)
- [Cas d'utilisation typiques](#cas-dutilisation-typiques)
- [Points d'attention / limites actuelles](#points-dattention--limites-actuelles)

## Où trouver cette page

- **Création** : bouton « Créer un projet » de la liste des projets. Adresse : `/projets/ajouter`.
- **Modification** : action « Modifier » dans la liste, ou menu **Actions** de la fiche d'un projet.
  Adresse : `/projets/<identifiant>/modifier`.

Les deux pages utilisent le même formulaire.

## À quoi sert cette page

Elle permet de saisir ou de corriger toutes les informations d'un projet affiché sur le site public :
textes traduits, référencement, images, types, technologies, liens, dates et état de publication.

## Qui peut l'utiliser

Selon le poste du compte (page **Droits**, ressource « Project »). Les comptes Owner et Super Admin ont
tous les droits.

| Droit | Ce qu'il permet ici |
|---|---|
| Créer | Ouvrir la page de création |
| Modifier | Ouvrir la page de modification |

Sans le droit correspondant, la page s'affiche comme « introuvable ».

## Ce que l'on voit à l'écran

Le formulaire est découpé en cinq sections que l'on parcourt avec un sommaire, avec un aperçu à côté (le
rendu du projet, l'aperçu de partage pour le SEO, ou un récapitulatif pour la classification et les
réglages). Sur la section d'une langue, des onglets (français, anglais, malgache) permettent de passer d'une
langue à l'autre : le **français est la langue de référence**, ses champs obligatoires doivent être remplis,
ceux des autres langues sont facultatifs. Un onglet qui contient une erreur est signalé. Le sommaire indique
aussi combien de champs restent à compléter.

### Contenu (une version par langue)

**Nom**, **Titre**, **Description**, **Contenu** (texte mis en forme, avec images) et **Description de la
société**. Nom, titre, description et contenu sont obligatoires en français.

### SEO

**Slug** (la fin de l'adresse du projet sur le site, rempli à partir du nom et corrigeable), **Tags**,
**Meta titre** et **Meta description**. Laissés vides, ils sont complétés à partir du titre et de la
description.

### Images

- **Image** (obligatoire) : l'image principale.
- **Logo** de la société et **Aperçu de l'image** (facultatifs) : l'aperçu est utilisé sur les cartes de
  projet et au partage du lien ; à défaut, l'image principale est utilisée.
- **Images** : galerie de 5 images au maximum.

Chaque image fait 5 Mo au maximum.

### Classification

**Types de projet** et **Technologies** (au moins une valeur chacun) et **Plateformes** (Web, Mobile,
Desktop, API).

### Réglages

- **Actif** : un interrupteur ; un projet actif est visible sur le site public.
- **Société**, **Site web**, **Youtube** et une **période** (dates de début et de fin).
- Des listes de **Liens**, **Dépôts** (GitHub, GitLab ou Bitbucket), **Liens npm** et **Liens Codesandbox**,
  à compléter par autant de lignes que nécessaire. Chaque adresse est contrôlée : le site web doit être une
  adresse valide ; les dépôts, npm et Codesandbox doivent correspondre au bon service.

## Actions possibles

- **Créer** : remplir le formulaire puis enregistrer. À la réussite, la fiche du projet s'ouvre. En cas
  d'erreur de saisie, les champs concernés sont signalés et rien n'est enregistré.
- **Modifier** : le formulaire est pré-rempli ; l'heure du dernier enregistrement est indiquée. Après
  enregistrement, la fiche du projet s'ouvre. Les anciennes images remplacées sont supprimées
  automatiquement.
- **Quitter sans enregistrer** : une alerte prévient quand des modifications ne sont pas enregistrées.

## Cas d'utilisation typiques

1. **Ajouter un nouveau projet** en français, puis le traduire plus tard.
2. **Traduire un projet existant** : modifier, ouvrir l'onglet de la langue, remplir, enregistrer.
3. **Masquer un projet du site** sans le supprimer : désactiver l'interrupteur « Actif ».
4. **Ajouter un lien vers le dépôt** ou une démonstration en ligne.
5. **Changer l'image principale** d'un projet.

## Points d'attention / limites actuelles

- L'enregistrement n'est pas possible tant qu'un champ obligatoire en français est vide ; le message d'erreur
  est affiché sous le champ, dans l'onglet de la langue concernée.
- Un projet n'a pas de brouillon séparé : il est publié sur le site dès qu'il est actif.
- Le formulaire ne propose pas encore de restaurer une ancienne version du contenu pour les projets.
- Il n'y a pas de notification par e-mail à la création d'un projet.
