# Cas d'utilisation — Projets (Liste)

## Table des matières

- [Où trouver cette page](#où-trouver-cette-page)
- [À quoi sert cette page](#à-quoi-sert-cette-page)
- [Qui peut l'utiliser](#qui-peut-lutiliser)
- [Ce que l'on voit à l'écran](#ce-que-lon-voit-à-lécran)
  - [Colonnes du tableau](#colonnes-du-tableau)
  - [Les deux onglets Tout et Corbeille](#les-deux-onglets-tout-et-corbeille)
- [Rechercher et filtrer](#rechercher-et-filtrer)
- [Actions possibles](#actions-possibles)
  - [Sur un projet](#sur-un-projet)
  - [Sur plusieurs projets à la fois](#sur-plusieurs-projets-à-la-fois)
  - [Créer un projet](#créer-un-projet)
- [Cas d'utilisation typiques](#cas-dutilisation-typiques)
- [Points d'attention / limites actuelles](#points-dattention--limites-actuelles)

## Où trouver cette page

Menu de gauche → groupe **Opérations** → **Projets**, sous le tableau de bord. Adresse : `/projets`.

## À quoi sert cette page

C'est la liste des projets présentés dans le portfolio public. Depuis cette page, on retrouve un
projet, on l'ouvre pour le consulter, on le modifie, on le supprime, on le restaure ou on en crée un nouveau.

## Qui peut l'utiliser

L'accès dépend du **poste** du compte (page **Droits**, ressource « Project »). Les comptes Owner et Super
Admin ont tous les droits.

| Droit | Ce qu'il permet ici |
|---|---|
| Lister | Afficher la page et l'entrée **Projets** du menu (sans ce droit, la page est introuvable) |
| Consulter | Action « Voir l'aperçu » |
| Modifier | Action « Modifier » |
| Créer | Bouton « Créer un projet » en haut de la page |
| Supprimer | Action « Supprimer » et suppression groupée |
| Supprimer définitivement | Onglet « Corbeille », restauration et destruction définitive |

Un bouton absent signifie que le compte n'a pas le droit correspondant.

## Ce que l'on voit à l'écran

### Colonnes du tableau

| Colonne | Signification |
|---|---|
| Projet | Nom et titre du projet, dans la langue du back-office |
| Modifié le | Dernière modification (le tri peut aussi se faire sur la date de création) |
| Auteur | La personne qui a créé le projet |
| Technologies | Les technologies utilisées |
| Statut | Publié ou brouillon (et supprimé, le cas échéant) |
| Actions | Menu « ... » de la ligne |

La liste affiche 20 projets par page (50 ou 75 au choix). Le choix de présentation (tableau ou vignettes)
est mémorisé.

### Les deux onglets Tout et Corbeille

- **Tout** : les projets non supprimés, publiés ou brouillons (vue par défaut).
- **Corbeille** : les projets supprimés, pas encore détruits. Cet onglet n'apparaît que pour les comptes
  ayant le droit « Supprimer définitivement ».

## Rechercher et filtrer

- Un champ de recherche rapide, qui cherche dans le **titre, la description et le contenu**, dans toutes
  les langues.
- Une recherche avancée pour combiner des critères : titre, types de projet, technologies, tags, statut
  (actif ou non), dates de création et de modification.
- Une icône « Réinitialiser les filtres » remet la liste à zéro.

## Actions possibles

### Sur un projet

Dans le menu « ... » de la ligne, selon les droits :

- **Modifier** : ouvre le formulaire de modification.
- **Voir l'aperçu** : ouvre la fiche en lecture seule.
- **Voir le site web** : ouvre le projet sur le site public, dans un nouvel onglet.
- **Télécharger en JSON** : enregistre le contenu du projet dans un fichier.
- **Supprimer** : après confirmation, met le projet à la corbeille. Il n'est plus visible sur le site.

Dans l'onglet **Corbeille**, le menu propose **Voir l'aperçu**, **Restaurer** (remet le projet dans la
liste) et **Supprimer**, qui détruit le projet **définitivement** après une confirmation qui précise que
l'action est irréversible.

### Sur plusieurs projets à la fois

Cocher des lignes fait apparaître une barre avec le nombre de projets sélectionnés et une icône
**Supprimer** (mise à la corbeille, ou destruction définitive dans l'onglet Corbeille), avec confirmation.
Le bouton **Exporter** produit un fichier CSV ou Excel de la page affichée ou de la sélection.

### Créer un projet

Le bouton « Créer un projet » en haut de la page (visible si le droit de créer est accordé) ouvre le
formulaire de création (voir la page « Projets (Ajout et modification) »).

## Cas d'utilisation typiques

1. **Retrouver un projet** par un mot de son titre ou de sa description.
2. **Lister les projets d'un même type** (par exemple e-commerce) avec la recherche avancée.
3. **Retirer un projet du site** : le supprimer, il passe à la corbeille.
4. **Remettre un projet supprimé par erreur** : onglet Corbeille → Restaurer.
5. **Vérifier l'affichage public** d'un projet avec « Voir le site web ».

## Points d'attention / limites actuelles

- Le serveur ne tient pas compte de la recherche par **nom** ou par **auteur** : pour chercher un projet,
  taper un mot de son titre, de sa description ou de son contenu.
- Depuis la corbeille, **« Voir l'aperçu » peut afficher « introuvable »** : la fiche d'un projet supprimé
  n'est pas toujours accessible.
