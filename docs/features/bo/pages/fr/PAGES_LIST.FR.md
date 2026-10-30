# Cas d'utilisation — Pages (Liste)

## Table des matières

- [Où trouver cette page](#où-trouver-cette-page)
- [À quoi sert cette page](#à-quoi-sert-cette-page)
- [Qui peut l'utiliser](#qui-peut-lutiliser)
- [Ce que l'on voit à l'écran](#ce-que-lon-voit-à-lécran)
- [Rechercher / filtrer](#rechercher--filtrer)
- [Actions possibles](#actions-possibles)
- [Cas d'utilisation typiques](#cas-dutilisation-typiques)
- [Points d'attention / limites actuelles](#points-dattention--limites-actuelles)

## Où trouver cette page

Menu de gauche → groupe **Contenu** → **Pages**.

## À quoi sert cette page

C'est la liste de toutes les pages éditoriales du site public (par exemple « À propos » ou « Mentions
légales »). Elle permet de retrouver une page, de l'ouvrir, de la modifier, de la supprimer ou d'en
créer une nouvelle. Chaque page est rédigée en français, en anglais et en malgache.

## Qui peut l'utiliser

L'accès dépend du **poste** du compte, réglé dans la page **Droits** (ressource « Pages »). Les
comptes Owner et Super Admin ont tous les droits.

| Droit | Ce qu'il permet ici |
|---|---|
| Lister | Voir la page et sa liste (sans ce droit, l'écran « introuvable » s'affiche) |
| Consulter | Bouton « Voir l'aperçu » |
| Modifier | Bouton « Modifier » |
| Créer | Bouton rond « + » en bas à droite |
| Supprimer | Mettre une page à la corbeille |
| Supprimer définitivement | Onglet « Corbeille » et destruction définitive |

## Ce que l'on voit à l'écran

- Des onglets : **Tout** (pages en ligne ou non, hors corbeille) et **Corbeille** (réservé aux comptes
  qui peuvent supprimer définitivement).
- Un champ de recherche et un panneau de filtres avancés.
- Un tableau avec les colonnes : **Nom**, **Titre**, **Catégories**, **Auteur**, **Créé le**,
  **Modifié le** et **Actions**. Le nom, le titre et les catégories sont affichés dans la langue
  choisie dans les paramètres.
- Sur grand écran, deux boutons permettent de passer de l'affichage en tableau à l'affichage en
  grandes vignettes ; le choix est mémorisé sur l'ordinateur.
- En bas, la pagination : 20 pages par écran, avec la possibilité de passer à 50 ou 75.

Un clic sur le titre d'une colonne trie la liste. Par défaut, les pages modifiées le plus récemment
apparaissent en premier.

## Rechercher / filtrer

- Le champ de recherche (« Rechercher titre, contenu ») cherche dans le titre et le contenu des pages.
- Le panneau de filtres avancés propose : nom, titre, catégorie, titre pour les moteurs de recherche,
  actif ou non, date de création, date de modification et auteur (nom ou e-mail).
- Une icône « Réinitialiser les filtres » à droite remet la liste à son état de départ.
- Depuis la page **Catégories**, l'action « Voir les pages pour cette catégorie » ouvre cette liste déjà
  filtrée sur la catégorie choisie.

## Actions possibles

### Voir l'aperçu, modifier, voir sur le site

Dans le menu **Actions** de chaque ligne : **Modifier**, **Voir l'aperçu** (fiche détaillée de la page) et
**Voir le site web** (ouvre la page publique dans un nouvel onglet). Seules les actions autorisées par le
poste sont proposées.

### Supprimer une page

L'action **Supprimer** demande confirmation, puis place la page dans la corbeille : elle disparaît du
site public. On peut aussi cocher plusieurs lignes et les supprimer d'un coup (confirmation demandée).

### Créer une page

Le bouton « + » ouvre le formulaire en trois étapes décrit dans la fiche
[Ajouter ou modifier une page](PAGES_ADD_EDIT.FR.md).

### Corbeille

Dans l'onglet **Corbeille**, chaque ligne propose **Voir l'aperçu** et **Supprimer** (suppression
définitive, irréversible). Les catégories d'une page supprimée sont mises de côté avec elle.

## Cas d'utilisation typiques

1. **Retrouver une page** : taper un mot de son titre dans la recherche.
2. **Contrôler ce qui est en ligne** : filtre avancé « Actif ».
3. **Voir les pages d'une catégorie** : depuis la liste des catégories, « Voir les pages pour cette
   catégorie ».
4. **Retirer une page obsolète** : menu Actions → Supprimer.
5. **Vider la corbeille** : onglet Corbeille, cocher les pages puis supprimer.

## Points d'attention / limites actuelles

- Dans l'onglet Corbeille, l'action **Restaurer** remet une page dans la liste ; on peut aussi la détruire
  définitivement.
- Un clic sur une ligne n'ouvre pas la page : il faut passer par le menu Actions.
- Supprimer définitivement une page l'enlève aussi des sections qui la contenaient ; une section qui
  n'a plus aucune page est détruite à son tour (voir [Sections de page](PAGE_SECTIONS.FR.md)).
