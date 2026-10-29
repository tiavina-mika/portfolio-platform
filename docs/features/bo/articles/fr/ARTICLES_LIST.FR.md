# Cas d'utilisation — Articles (Liste)

## Table des matières

- [Où trouver cette page](#où-trouver-cette-page)
- [À quoi sert cette page](#à-quoi-sert-cette-page)
- [Qui peut l'utiliser](#qui-peut-lutiliser)
- [Ce que l'on voit à l'écran](#ce-que-lon-voit-à-lécran)
  - [Colonnes du tableau](#colonnes-du-tableau)
  - [Les deux onglets Tout et Corbeille](#les-deux-onglets-tout-et-corbeille)
- [Rechercher et filtrer](#rechercher-et-filtrer)
- [Actions possibles](#actions-possibles)
  - [Sur un article](#sur-un-article)
  - [Sur plusieurs articles à la fois](#sur-plusieurs-articles-à-la-fois)
  - [Créer un article](#créer-un-article)
- [Cas d'utilisation typiques](#cas-dutilisation-typiques)
- [Points d'attention / limites actuelles](#points-dattention--limites-actuelles)

---

## Où trouver cette page

Menu de gauche → **Articles** (premier lien du menu). Adresse : `/articles`.

La liste peut aussi s'ouvrir **restreinte à une catégorie**, en cliquant sur le nom d'une catégorie depuis
la fiche d'un article : seuls les articles classés dans cette catégorie sont alors affichés.

## À quoi sert cette page

C'est la liste des articles du blog du site public. Depuis cette page, on retrouve un article, on l'ouvre
pour le consulter, on le modifie, on le supprime ou on en crée un nouveau.

## Qui peut l'utiliser

L'accès dépend du **rôle** du compte (page **Droits**, ressource « Article »). Les propriétaires et
administrateurs ont tous les droits.

| Droit | Ce qu'il permet ici |
|---|---|
| Voir la liste | Afficher la page et l'entrée **Articles** du menu (sans ce droit, la page est introuvable) |
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
| Titre | Titre de l'article, dans la langue du back-office |
| Catégories | Catégories de l'article, dans la même langue |
| Auteur | La personne qui a créé l'article (avatar et nom) |
| Partage réseaux sociaux | Nombre total de partages sur les réseaux sociaux |
| Créé le / Modifié le | Dates de création et de dernière modification |
| Actions | Menu « ... » de la ligne |

Les en-têtes de colonnes se cliquent pour trier. Par défaut, la liste va du plus récemment modifié au plus
ancien, avec 20 articles par page (50 ou 75 au choix). Deux icônes en haut à droite basculent entre
l'affichage en tableau et en grandes vignettes ; ce choix est mémorisé.

### Les deux onglets Tout et Corbeille

- **Tout** : les articles non supprimés, publiés ou non (vue par défaut).
- **Corbeille** : les articles supprimés, pas encore détruits. Cet onglet n'apparaît que pour les comptes
  ayant le droit « Supprimer définitivement ».

## Rechercher et filtrer

- Deux champs de recherche rapide : **Rechercher titre, contenu** (cherche dans le titre, la description et
  le contenu, dans toutes les langues) et **Rechercher par auteur**.
- Une icône « Recherche avancée » ouvre une fenêtre pour combiner des critères : titre, catégorie, état
  **Publié** ou **Non publié**, dates de création et de modification, utilisateur.
- Une icône « Réinitialiser les filtres » remet la liste à zéro.

## Actions possibles

### Sur un article

Dans le menu « ... » de la ligne, selon les droits :

- **Modifier** : ouvre le formulaire de modification.
- **Voir l'aperçu** : ouvre la fiche en lecture seule.
- **Voir le site web** : ouvre l'article sur le site public, dans un nouvel onglet.
- **Supprimer** : après confirmation, met l'article à la corbeille. Il disparaît du site et n'appartient plus à
  ses catégories.

Dans l'onglet **Corbeille**, le menu propose **Voir l'aperçu** et **Supprimer** : ce dernier détruit alors
l'article **définitivement**, après une confirmation qui précise que l'action est irréversible.

### Sur plusieurs articles à la fois

Cocher des lignes fait apparaître une barre avec le nombre d'articles sélectionnés et une icône
**Supprimer** (mise à la corbeille, ou destruction définitive dans l'onglet Corbeille), avec confirmation.

### Créer un article

Le bouton rond « + » en bas de la page (visible si le droit de créer est accordé) ouvre le formulaire de
création (voir la page « Articles (Ajout et modification) »).

## Cas d'utilisation typiques

1. **Retrouver un article** par un mot de son titre ou de son contenu.
2. **Voir les articles d'une catégorie** depuis la fiche d'un article.
3. **Repérer les articles non publiés** avec la recherche avancée.
4. **Retirer un article du site** : le supprimer, il passe à la corbeille.
5. **Vider la corbeille** : sélectionner les articles puis supprimer définitivement.

## Points d'attention / limites actuelles

- **Il n'y a pas de bouton « Restaurer »** : un article mis à la corbeille ne peut pas être remis dans la
  liste depuis le back-office.
- Depuis la corbeille, **« Voir l'aperçu » n'ouvre pas la fiche** : la page affichée est « introuvable », car
  la fiche d'un article supprimé n'est plus accessible.
- Le champ **Rechercher par auteur** et les critères « utilisateur » et « titre » de la recherche avancée
  **ne donnent pas de résultat fiable** pour l'instant : pour chercher un titre, préférer le champ
  **Rechercher titre, contenu**.
- Il n'y a pas d'export de la liste.
