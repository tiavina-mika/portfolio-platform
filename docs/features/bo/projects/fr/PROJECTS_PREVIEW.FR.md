# Cas d'utilisation — Projets (Aperçu)

## Table des matières

- [Où trouver cette page](#où-trouver-cette-page)
- [À quoi sert cette page](#à-quoi-sert-cette-page)
- [Qui peut l'utiliser](#qui-peut-lutiliser)
- [Ce que l'on voit à l'écran](#ce-que-lon-voit-à-lécran)
- [Actions possibles](#actions-possibles)
- [Cas d'utilisation typiques](#cas-dutilisation-typiques)
- [Points d'attention / limites actuelles](#points-dattention--limites-actuelles)

## Où trouver cette page

Depuis la liste des projets, action **Voir l'aperçu** du menu « ... » d'une ligne. Adresse :
`/projets/<identifiant>`. On y arrive aussi après l'enregistrement d'un projet, ou depuis la recherche
globale.

## À quoi sert cette page

C'est la fiche en lecture seule d'un projet : on y relit tout ce qui a été saisi, langue par langue, sans
risque de le modifier par erreur, et on le publie ou le dépublie.

## Qui peut l'utiliser

Le droit **Consulter** sur la ressource « Project » (page **Droits**) est nécessaire pour ouvrir la page ;
sans lui, elle s'affiche comme « introuvable ». Les comptes Owner et Super Admin l'ont toujours.

## Ce que l'on voit à l'écran

Le titre de la page est le nom du projet, accompagné d'une pastille **Publié** ou **Brouillon**. Des
**onglets de langue** (français, anglais, malgache) changent la langue des textes affichés. Un sommaire
permet de passer d'une section à l'autre :

- **Détails** : nom, titre, description, dates de création et de modification, période du projet (et date
  de suppression le cas échéant).
- **Classification** : types de projet, plateformes et technologies.
- **Liens** : société, site web, Youtube, liens, dépôts, liens npm et Codesandbox (chaque adresse est un
  lien cliquable).
- **SEO** : adresse du projet sur le site public, tags, meta titre et meta description.
- **Contenu du projet** et **Description de la société** : les textes mis en forme.
- **Images** du projet (image principale, logo, aperçu, galerie).
- **Statut** : actif ou non.
- **Historique** : les événements de la vie du projet (création, modifications).

## Actions possibles

Le bouton **Actions** en haut de la page ouvre un menu :

- **Publier / Ne pas publier** : rend le projet visible ou invisible sur le site public.
- **Modifier** : ouvre le formulaire de modification.
- **Voir le site web** : ouvre le projet sur le site public, dans un nouvel onglet.
- **Télécharger en JSON**.
- **Retourner à la liste**.
- **Ajouter** : ouvre le formulaire de création d'un nouveau projet.
- **Supprimer** : après confirmation, met le projet à la corbeille et revient à la liste.

## Cas d'utilisation typiques

1. **Relire un projet** avant de le publier ou après l'avoir enregistré.
2. **Vérifier une traduction** en passant d'un onglet de langue à l'autre.
3. **Contrôler les liens** d'un projet (dépôt, site, Youtube).
4. **Ouvrir la page publique** du projet pour comparer.

## Points d'attention / limites actuelles

- Le menu **Actions** affiche toutes les entrées quel que soit le poste ; une action pour laquelle le compte
  n'a pas le droit est refusée (message d'erreur ou page « introuvable »).
- La période du projet n'est affichée que si les deux dates, début et fin, sont renseignées.
- La restauration d'une ancienne version du contenu n'est pas branchée pour les projets.
