# Cas d'utilisation — Projets (Aperçu)

## Table des matières

- [Où trouver cette page](#où-trouver-cette-page)
- [À quoi sert cette page](#à-quoi-sert-cette-page)
- [Qui peut l'utiliser](#qui-peut-lutiliser)
- [Ce que l'on voit à l'écran](#ce-que-lon-voit-à-lécran)
- [Actions possibles](#actions-possibles)
- [Cas d'utilisation typiques](#cas-dutilisation-typiques)
- [Points d'attention / limites actuelles](#points-dattention--limites-actuelles)

---

## Où trouver cette page

Depuis la liste des projets, action **Voir l'aperçu** du menu « ... » d'une ligne. Adresse :
`/projets/<identifiant>`. On y arrive aussi automatiquement après l'enregistrement d'un projet.

## À quoi sert cette page

C'est la fiche en lecture seule d'un projet : on y relit tout ce qui a été saisi, langue par langue, sans
risque de le modifier par erreur.

## Qui peut l'utiliser

Le droit **Consulter** sur la ressource « Project » (page **Droits**) est nécessaire pour ouvrir la page ;
sans lui, elle s'affiche comme « introuvable ». Les propriétaires et administrateurs l'ont toujours.

## Ce que l'on voit à l'écran

Le titre de la page est « Projet - » suivi du nom du projet. Sous le titre, des **onglets de langue**
(français, anglais, malgache) changent la langue des textes affichés.

Colonne de gauche :

- **Détails** : nom, titre, description, dates de création et de modification, et période du projet.
- **SEO** : adresse du projet sur le site public, tags, meta titre et meta description.
- **Autres** : société, site web, Youtube, liens, dépôts, liens npm et Codesandbox (chaque adresse est un
  lien cliquable).
- **Description de la société** et **Description du projet** : les textes mis en forme.
- Les **images** du projet (image principale, logo, aperçu, galerie).

Colonne de droite :

- **Status** : une ligne « Supprimé » et une ligne « Actif », chacune avec une coche ou une croix.
- **Technologies**, **Types de projet** et **Plateformes** : les valeurs choisies, séparées par des virgules.

## Actions possibles

Le bouton **Actions** en haut de la page ouvre un menu :

- **Modifier** : ouvre le formulaire de modification.
- **Voir le site web** : ouvre le projet sur le site public, dans un nouvel onglet.
- **Retourner à la liste**.
- **Ajouter** : ouvre le formulaire de création d'un nouveau projet.
- **Supprimer** : après confirmation, met le projet à la corbeille et revient à la liste.

## Cas d'utilisation typiques

1. **Relire un projet** avant de le publier ou après l'avoir enregistré.
2. **Vérifier une traduction** en passant d'un onglet de langue à l'autre.
3. **Contrôler les liens** d'un projet (dépôt, site, Youtube).
4. **Ouvrir la page publique** du projet pour comparer.

## Points d'attention / limites actuelles

- Le menu **Actions** affiche toutes les entrées quel que soit le rôle ; une action pour laquelle le compte n'a
  pas le droit est refusée (message d'erreur ou page « introuvable »).
- L'entrée **Publier / Ne pas publier** du menu active ou désactive un projet d'un clic (même effet que
  l'interrupteur « Actif » du formulaire) ; elle exige le droit de modification.
- La période du projet n'est affichée que si les deux dates, début et fin, sont renseignées.
- Un projet mis à la corbeille ne peut plus être ouvert en aperçu.
