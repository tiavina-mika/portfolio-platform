# Cas d'utilisation — Site public (Liste des articles)

## Table des matières

- [Où trouver cette page](#où-trouver-cette-page)
- [À quoi sert cette page](#à-quoi-sert-cette-page)
- [Qui peut l'utiliser](#qui-peut-lutiliser)
- [Ce que l'on voit à l'écran](#ce-que-lon-voit-à-lécran)
- [Rechercher / filtrer](#rechercher--filtrer)
- [Actions possibles](#actions-possibles)
- [Cas d'utilisation typiques](#cas-dutilisation-typiques)
- [Points d'attention / limites actuelles](#points-dattention--limites-actuelles)

---

## Où trouver cette page

Lien **"Articles"** du menu de navigation (présent sur toutes les pages) ou lien **"Voir tout"** du
bloc "Articles" de la page d'accueil. L'adresse est la même dans les deux langues. La même page
sert aussi à afficher les articles d'une catégorie ou d'un mot-clé précis.

## À quoi sert cette page

Elle réunit tous les articles et tutoriels que le propriétaire publie sur son blog, du plus récemment
mis à jour au plus ancien, pour que le visiteur les parcoure ou retrouve un sujet.

## Qui peut l'utiliser

Tout visiteur, sans connexion ni compte.

## Ce que l'on voit à l'écran

- En haut à gauche, le fil d'Ariane **"Articles"**. Quand on est arrivé par une catégorie, il est
  remplacé par la mention **"Categorie"** suivie du nom de la catégorie en titre.
- En haut à droite, un menu de tri (**"Le plus récent"** / **"Titre"**) et une flèche pour inverser
  l'ordre.
- Une grille de cartes (une colonne sur téléphone, trois sur grand écran). Chaque carte montre
  l'image, la première catégorie de l'article, son titre et une courte description. Toute la carte
  est cliquable.
- Une **pagination** en bas de page : 12 articles par page.
- Si aucun article ne correspond : **"Aucun article pour le moment."**

Seuls les articles **actifs** sont visibles, dans la langue du visiteur.

## Rechercher / filtrer

- **Par catégorie** : un clic sur le nom d'une catégorie, dans un article ou dans le
  [plan du site](../../sitemap/fr/SITEMAP.FR.md), affiche uniquement les articles de cette catégorie.
- **Par mot-clé** : un clic sur un mot-clé, en bas d'un article, affiche les articles portant ce
  mot-clé.
- **Par texte** : la recherche du site (voir
  [Navigation, pied de page, langue et thème](../../navigation/fr/NAVIGATION_AND_FOOTER.FR.md))
  retrouve un article par son titre, sa description ou son contenu.
- **Ordre** : la flèche à côté du menu de tri inverse l'ordre d'affichage (du plus récent au plus
  ancien, ou l'inverse).

## Actions possibles

### Ouvrir un article

Un clic sur une carte ouvre l'article ([Lire un article](ARTICLE.FR.md)).

### Changer de page

Les flèches et les numéros de la pagination affichent les articles suivants ou précédents ; l'ordre
et le filtre choisis sont conservés.

## Cas d'utilisation typiques

1. **Un lecteur régulier** vient voir les derniers articles parus.
2. **Un développeur** cherche un tutoriel sur un sujet : il clique sur un mot-clé pour voir tous les
   articles qui en parlent.
3. **Un visiteur curieux** explore une catégorie depuis le plan du site.
4. **Un lecteur** inverse l'ordre pour lire les plus anciens articles en premier.

## Points d'attention / limites actuelles

- La page ne dit pas quel mot-clé est actif : seule la catégorie est rappelée en titre.
- Un article désactivé ou supprimé dans le back-office disparaît aussitôt de la liste.
- Les articles sont ordonnés selon leur date de dernière mise à jour, pas leur date de première
  publication (sauf sur la page d'accueil, qui montre les trois derniers articles créés).
