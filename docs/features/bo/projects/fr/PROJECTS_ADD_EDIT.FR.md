# Cas d'utilisation — Projets (Ajout et modification)

## Table des matières

- [Où trouver cette page](#où-trouver-cette-page)
- [À quoi sert cette page](#à-quoi-sert-cette-page)
- [Qui peut l'utiliser](#qui-peut-lutiliser)
- [Ce que l'on voit à l'écran](#ce-que-lon-voit-à-lécran)
  - [Détails (une version par langue)](#détails-une-version-par-langue)
  - [Actif](#actif)
  - [Types, plateformes et technologies](#types-plateformes-et-technologies)
  - [Liens et dates](#liens-et-dates)
  - [Images](#images)
- [Actions possibles](#actions-possibles)
  - [Créer un projet](#créer-un-projet)
  - [Modifier un projet](#modifier-un-projet)
  - [Menu Actions de la page](#menu-actions-de-la-page)
- [Cas d'utilisation typiques](#cas-dutilisation-typiques)
- [Points d'attention / limites actuelles](#points-dattention--limites-actuelles)

---

## Où trouver cette page

- **Création** : bouton rond « + » de la liste des projets. Adresse : `/projets/ajouter`.
- **Modification** : action « Modifier » dans la liste, ou menu **Actions** de la fiche d'un projet.
  Adresse : `/projets/<identifiant>/modifier`.

Les deux pages utilisent le même formulaire.

## À quoi sert cette page

Elle permet de saisir ou de corriger toutes les informations d'un projet affiché sur le site public :
textes traduits, état actif, types, technologies, liens, dates et images.

## Qui peut l'utiliser

Selon le rôle du compte (page **Droits**, ressource « Project »). Les propriétaires et administrateurs
ont tous les droits.

| Droit | Ce qu'il permet ici |
|---|---|
| Créer | Ouvrir la page de création |
| Modifier | Ouvrir la page de modification |

Sans le droit correspondant, la page s'affiche comme « introuvable ».

## Ce que l'on voit à l'écran

### Détails (une version par langue)

Un onglet par langue (français, anglais, malgache). Le **français est la langue de référence** : ses champs
obligatoires doivent être remplis, ceux des autres langues sont facultatifs. Un onglet qui contient une
erreur est signalé. Champs de chaque langue :

- **Nom** et **Titre** (obligatoires en français).
- **Slug** : la fin de l'adresse du projet sur le site. Il se remplit tout seul à partir du nom ; on peut le
  corriger. Laissé vide, il est déduit du titre à l'enregistrement.
- **Description** (obligatoire en français, 300 caractères au maximum).
- **Contenu** : texte mis en forme, avec insertion d'images (obligatoire en français).
- **Description de la société** : texte court mis en forme, 1 000 caractères au maximum.
- **Tags** (200 caractères au maximum, séparés par des virgules), **Meta titre** (70 caractères) et **Meta
  description** (170 caractères) pour le référencement. S'ils sont vides, ils sont complétés
  automatiquement à partir du titre et de la description.

### Actif

Un interrupteur, **activé par défaut** : un projet actif est visible sur le site public.

### Types, plateformes et technologies

Trois listes à choix multiples : **Types de projet** et **Technologies** (signalés comme obligatoires) et
**Plateformes** (Web, Mobile, Desktop, API).

### Liens et dates

**Société**, **Site web**, **Youtube**, puis des listes de **Liens**, **Dépôts** (GitHub, GitLab ou
Bitbucket), **Liens npm** et **Liens Codesandbox**, à compléter par autant de lignes que nécessaire. Chaque
adresse est contrôlée (site web : adresse valide ; Youtube, dépôts, npm, Codesandbox : l'adresse doit
correspondre au bon service). Un sélecteur de **période** donne les dates de début et de fin.

### Images

- **Image** (obligatoire) : l'image principale.
- **Logo de la société** et **Aperçu de l'image** (facultatifs) : l'aperçu est affiché à petite taille, à
  défaut l'image principale est utilisée.
- **Images** : galerie de 5 images au maximum.

Chaque image fait 5 Mo au maximum.

## Actions possibles

### Créer un projet

Remplir le formulaire puis enregistrer avec les boutons fixés en bas de l'écran. À la réussite, la fiche du
projet s'ouvre. En cas d'erreur de saisie, les champs concernés sont signalés et rien n'est enregistré.

### Modifier un projet

Le formulaire est pré-rempli. Après enregistrement, la fiche du projet s'ouvre. Les anciennes images
remplacées par de nouvelles sont supprimées automatiquement.

### Menu Actions de la page

En haut de la page : **Retourner à la liste** ; en modification, aussi **Ajouter**, **Voir l'aperçu** et
**Supprimer** (avec confirmation, le projet va à la corbeille).

## Cas d'utilisation typiques

1. **Ajouter un nouveau projet** en français, puis le traduire plus tard.
2. **Traduire un projet existant** : modifier, ouvrir l'onglet de la langue, remplir, enregistrer.
3. **Masquer un projet du site** sans le supprimer : désactiver l'interrupteur « Actif ».
4. **Ajouter un lien vers le dépôt** ou une démonstration en ligne.
5. **Changer l'image principale** d'un projet.

## Points d'attention / limites actuelles

- L'enregistrement n'est pas possible tant qu'un champ obligatoire en français est vide ; le message d'erreur
  est affiché sous le champ, dans l'onglet de la langue concernée.
- Un projet n'a pas de brouillon : il est publié sur le site dès qu'il est actif.
- Il n'y a pas de notification par e-mail à la création d'un projet.
