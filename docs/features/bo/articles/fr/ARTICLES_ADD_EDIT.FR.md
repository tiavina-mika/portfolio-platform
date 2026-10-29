# Cas d'utilisation — Articles (Ajout et modification)

## Table des matières

- [Où trouver cette page](#où-trouver-cette-page)
- [À quoi sert cette page](#à-quoi-sert-cette-page)
- [Qui peut l'utiliser](#qui-peut-lutiliser)
- [Ce que l'on voit à l'écran](#ce-que-lon-voit-à-lécran)
  - [Détails (une version par langue)](#détails-une-version-par-langue)
  - [Actif](#actif)
  - [Catégories](#catégories)
  - [Images](#images)
- [Actions possibles](#actions-possibles)
  - [Créer un article](#créer-un-article)
  - [Modifier un article](#modifier-un-article)
  - [Créer une catégorie sans quitter le formulaire](#créer-une-catégorie-sans-quitter-le-formulaire)
  - [Menu Actions de la page](#menu-actions-de-la-page)
- [Cas d'utilisation typiques](#cas-dutilisation-typiques)
- [Points d'attention / limites actuelles](#points-dattention--limites-actuelles)

---

## Où trouver cette page

- **Création** : bouton rond « + » de la liste des articles. Adresse : `/articles/ajouter`.
- **Modification** : action « Modifier » dans la liste, ou menu **Actions** de la fiche d'un article.
  Adresse : `/articles/<identifiant>/modifier`.

Les deux pages utilisent le même formulaire.

## À quoi sert cette page

Elle permet de rédiger un article du blog ou de corriger un article existant : textes traduits, état actif,
catégories et images.

## Qui peut l'utiliser

Selon le rôle du compte (page **Droits**, ressource « Article »). Les propriétaires et administrateurs
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

- **Titre** (obligatoire en français).
- **Slug** : la fin de l'adresse de l'article sur le site. Il se remplit tout seul à partir du titre ; on
  peut le corriger. Laissé vide, il est déduit du titre à l'enregistrement.
- **Description** (obligatoire en français, 2 000 caractères au maximum) : courte présentation affichée sous
  le titre.
- **Contenu** : texte mis en forme, avec insertion d'images (obligatoire en français).
- **Tags** (200 caractères au maximum, séparés par des virgules), **Meta titre** (70 caractères) et **Meta
  description** (170 caractères) pour le référencement. S'ils sont vides, ils sont complétés
  automatiquement à partir du titre et de la description.

### Actif

Un interrupteur, **activé par défaut** : un article actif est visible sur le site public.

### Catégories

Une liste à choix multiples. **Au moins une catégorie est obligatoire.** Un bouton « + » permet d'en créer une
nouvelle.

### Images

- **Image** (obligatoire) : l'image principale de l'article.
- **Aperçu de l'image** (facultatif) : affiché à petite taille, à défaut l'image principale est utilisée.
- **Images** : galerie de 5 images au maximum.

Chaque image fait 5 Mo au maximum.

## Actions possibles

### Créer un article

Remplir le formulaire puis enregistrer avec les boutons fixés en bas de l'écran. À la réussite, la fiche de
l'article s'ouvre. Si l'article est **actif** à sa création, il est aussitôt **envoyé par e-mail aux abonnés
actifs à la newsletter**, chacun dans sa langue.

### Modifier un article

Le formulaire est pré-rempli. Après enregistrement, la fiche de l'article s'ouvre ; elle indique qui l'a
modifié en dernier. Les anciennes images remplacées par de nouvelles sont supprimées automatiquement.

### Créer une catégorie sans quitter le formulaire

Le bouton « + » de la carte Catégories ouvre une fenêtre de création de catégorie ; la nouvelle catégorie est
ensuite proposée dans la liste.

### Menu Actions de la page

En haut de la page : **Retourner à la liste** ; en modification, aussi **Ajouter**, **Voir l'aperçu** et
**Supprimer** (avec confirmation, l'article va à la corbeille).

## Cas d'utilisation typiques

1. **Publier un nouvel article** : rédiger en français, choisir sa catégorie, ajouter l'image, laisser
   « Actif » activé, enregistrer.
2. **Préparer un article sans le montrer** : désactiver « Actif » à la création, puis l'activer plus tard
   depuis la modification.
3. **Traduire un article** : ouvrir l'onglet de la langue et remplir les champs.
4. **Corriger une faute** dans le contenu d'un article déjà publié.
5. **Changer l'image** ou les catégories d'un article.

## Points d'attention / limites actuelles

- L'enregistrement n'est pas possible tant qu'un champ obligatoire en français est vide ou qu'aucune
  catégorie n'est choisie ; le message d'erreur est affiché sous le champ.
- Il n'y a pas de planification : l'article est visible dès qu'il est actif, et il n'existe pas d'état
  « brouillon » distinct de « non actif ».
- L'envoi à la newsletter n'a lieu **qu'à la création** d'un article actif : activer plus tard un article créé
  inactif, ou le corriger, n'envoie rien.
