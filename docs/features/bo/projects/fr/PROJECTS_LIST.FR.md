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

---

## Où trouver cette page

Menu de gauche → **Projets** (groupe placé après **Utilisateurs** et **Contacts**). Adresse : `/projets`.

## À quoi sert cette page

C'est la liste des projets présentés dans le portfolio public. Depuis cette page, on retrouve un
projet, on l'ouvre pour le consulter, on le modifie, on le supprime ou on en crée un nouveau.

## Qui peut l'utiliser

L'accès dépend du **rôle** du compte (page **Droits**, ressource « Project »). Les propriétaires et
administrateurs ont tous les droits.

| Droit | Ce qu'il permet ici |
|---|---|
| Voir la liste | Afficher la page et l'entrée **Projets** du menu (sans ce droit, la page est introuvable) |
| Consulter | Action « Voir l'aperçu » |
| Modifier | Action « Modifier » |
| Créer | Bouton rond « + » en bas de page |
| Supprimer | Action « Supprimer » et suppression groupée |
| Supprimer définitivement | Onglet « Corbeille » et destruction définitive |

Un bouton absent signifie que le compte n'a pas le droit correspondant.

## Ce que l'on voit à l'écran

### Colonnes du tableau

| Colonne | Signification |
|---|---|
| Nom | Nom du projet, dans la langue du back-office |
| Titre | Titre du projet, dans la même langue |
| Société | Société pour laquelle le projet a été réalisé |
| Début / Fin | Mois et année de début et de fin |
| Créé le / Modifié le | Dates de création et de dernière modification |
| Actions | Menu « ... » de la ligne |

La liste est triée par défaut du plus récemment modifié au plus ancien et affiche 20 projets par page (50
ou 75 au choix). Deux icônes en haut à droite basculent entre l'affichage en tableau et en grandes
vignettes ; ce choix est mémorisé.

### Les deux onglets Tout et Corbeille

- **Tout** : les projets actifs ou non, non supprimés (vue par défaut).
- **Corbeille** : les projets supprimés, pas encore détruits. Cet onglet n'apparaît que pour les comptes
  ayant le droit « Supprimer définitivement ».

## Rechercher et filtrer

- Deux champs de recherche rapide : **Rechercher titre, contenu** (cherche dans le titre, la description et le
  contenu, dans toutes les langues) et **Rechercher par auteur**.
- Une icône « Recherche avancée » ouvre une fenêtre pour combiner des critères : nom, titre, types de
  projet, technologies, état actif, dates de création et de modification.
- Une icône « Réinitialiser les filtres » remet la liste à zéro.

## Actions possibles

### Sur un projet

Dans le menu « ... » de la ligne, selon les droits :

- **Modifier** : ouvre le formulaire de modification.
- **Voir l'aperçu** : ouvre la fiche en lecture seule.
- **Voir le site web** : ouvre le projet sur le site public, dans un nouvel onglet.
- **Supprimer** : après confirmation, met le projet à la corbeille. Il n'est plus visible sur le site.

Dans l'onglet **Corbeille**, le menu propose **Voir l'aperçu** et **Supprimer** : ce dernier détruit alors le
projet **définitivement**, après une confirmation qui précise que l'action est irréversible.

### Sur plusieurs projets à la fois

Cocher des lignes fait apparaître une barre avec le nombre de projets sélectionnés et une icône
**Supprimer** (mise à la corbeille, ou destruction définitive dans l'onglet Corbeille), avec confirmation.

### Créer un projet

Le bouton rond « + » en bas de la page (visible si le droit de créer est accordé) ouvre le formulaire de
création (voir la page « Projets (Ajout et modification) »).

## Cas d'utilisation typiques

1. **Retrouver un projet** par un mot de son titre ou de sa description.
2. **Lister les projets d'un même type** (par exemple e-commerce) avec la recherche avancée.
3. **Retirer un projet du site** : le supprimer, il passe à la corbeille.
4. **Vider la corbeille** : l'ouvrir, sélectionner les projets puis supprimer définitivement.
5. **Vérifier l'affichage public** d'un projet avec « Voir le site web ».

## Points d'attention / limites actuelles

- **Il n'y a pas de bouton « Restaurer »** : un projet mis à la corbeille ne peut pas être remis dans la
  liste depuis le back-office.
- Depuis la corbeille, **« Voir l'aperçu » n'ouvre pas la fiche** : la page affichée est « introuvable », car
  la fiche d'un projet supprimé n'est plus accessible.
- Le champ **Rechercher par auteur** et les critères « nom » et « titre » de la recherche avancée **ne
  donnent pas de résultat fiable** pour l'instant : pour chercher un titre, préférer le champ **Rechercher
  titre, contenu**.
- Il n'y a pas d'export de la liste.
