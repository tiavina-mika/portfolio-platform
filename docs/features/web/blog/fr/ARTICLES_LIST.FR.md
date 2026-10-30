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

Lien **"Blog"** du menu de navigation (présent sur toutes les pages), lien **"Voir tout"** du bloc
"Articles" de la page d'accueil, ou lien "Lire le blog" de la page "Page introuvable". L'adresse est
`/blog` dans les deux langues. Les anciennes adresses en `/articles` redirigent automatiquement vers
`/blog`, pour que les liens déjà partagés continuent de fonctionner. La même page sert aussi à
afficher les articles d'une catégorie ou d'un mot-clé précis.

## À quoi sert cette page

Elle réunit tous les articles et tutoriels que le propriétaire publie sur son blog, pour que le
visiteur les parcoure ou retrouve un sujet.

## Qui peut l'utiliser

Tout visiteur, sans connexion ni compte.

## Ce que l'on voit à l'écran

- En haut, le fil d'Ariane **"Blog"** et le titre **"Articles"**. Quand on est arrivé par une
  catégorie, ils sont remplacés par la mention **"Catégorie"** suivie du nom de la catégorie en titre.
- Une rangée de **catégories** sous forme de pastilles (**"Toutes"** puis chaque catégorie) ; la
  pastille choisie est mise en évidence.
- Un choix d'ordre : **"Trier par"** **"Plus récents"** / **"Plus anciens"**.
- Une grille de cartes (une colonne sur téléphone, trois sur grand écran). Chaque carte montre
  l'image, la première catégorie de l'article, son titre, une courte description et le temps de
  lecture. Toute la carte est cliquable.
- Une **pagination** en bas de page : 12 articles par page.
- Si aucun article ne correspond : **"Aucun article pour le moment."**
- Pendant le chargement, des cartes grisées s'affichent. Si le chargement échoue, un message invite à
  vérifier la connexion et à réessayer ; hors connexion, un message indique que les articles
  reviendront avec le réseau.

Seuls les articles **actifs** sont visibles, dans la langue du visiteur.

## Rechercher / filtrer

- **Par catégorie** : un clic sur une pastille, sur le nom d'une catégorie dans un article ou dans le
  [plan du site](../../sitemap/fr/SITEMAP.FR.md) affiche uniquement les articles de cette catégorie.
- **Par mot-clé** : un clic sur un mot-clé, en bas d'un article, affiche les articles portant ce
  mot-clé.
- **Par texte** : la recherche du site (voir
  [Navigation, pied de page, langue et thème](../../navigation/fr/NAVIGATION_AND_FOOTER.FR.md))
  retrouve un article par son titre, sa description ou son contenu.
- **Ordre** : les liens "Plus récents" / "Plus anciens" changent l'ordre d'affichage.

Chaque choix modifie l'adresse de la page : une liste filtrée peut donc être copiée et partagée.

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
3. **Un visiteur curieux** explore une catégorie depuis les pastilles ou le plan du site.
4. **Un lecteur** choisit "Plus anciens" pour lire les premiers articles en premier.

## Points d'attention / limites actuelles

- La page ne dit pas quel mot-clé est actif : seule la catégorie est rappelée en titre.
- Un article désactivé ou supprimé dans le back-office disparaît de la liste (le site peut mettre
  quelques instants à se mettre à jour).
- La page d'accueil montre les trois derniers articles.
