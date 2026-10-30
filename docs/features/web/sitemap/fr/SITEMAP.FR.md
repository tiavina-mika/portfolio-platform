# Cas d'utilisation — Site public (Plan du site)

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

Lien **"Plan du site"** du pied de page, sous "Plus d'information". L'adresse est `/sitemap` en
anglais et `/plan-du-site` en français. Il n'y a pas d'entrée dans le menu du haut.

## À quoi sert cette page

Elle donne en une seule page la liste de tout ce que le site contient, sous forme de liens : un
visiteur qui ne trouve pas ce qu'il cherche peut y retrouver n'importe quel projet, article ou page.

## Qui peut l'utiliser

Tout visiteur, sans connexion ni compte.

## Ce que l'on voit à l'écran

- Un titre **"Plan du site"** et une phrase expliquant qu'on peut aller à la page voulue en cliquant
  sur les liens.
- Jusqu'à quatre groupes de liens, chacun avec son titre, répartis sur deux colonnes sur grand écran
  et empilés sur téléphone :
  - **"Projets"** : le nom de chaque projet actif ;
  - **"Pages"** : le nom de chaque page de contenu active ;
  - **"Articles"** : le titre de chaque article actif ;
  - **"Catégories"** : le nom de chaque catégorie active (les catégories d'articles mènent à la liste
    des articles de la catégorie, les catégories de pages à la page de la catégorie).
- Les groupes qui ne contiennent aucun élément ne s'affichent pas.
- Pendant le chargement, des lignes grisées s'affichent à la place des liens.

Les noms sont affichés dans la langue du visiteur et ne contiennent que les éléments **actifs**.

## Actions possibles

### Aller à une page

Un clic sur un lien ouvre le projet, l'article, la page ou la liste filtrée correspondante.

## Cas d'utilisation typiques

1. **Un visiteur perdu** retrouve un ancien article en parcourant la liste complète.
2. **Un recruteur** voit d'un coup d'œil tous les projets réalisés.
3. **Un visiteur** accède à une page de contenu (politique de confidentialité, conditions) qui n'est
   pas dans le menu.
4. **Le propriétaire** vérifie que ses nouveaux contenus actifs apparaissent bien sur le site.

## Points d'attention / limites actuelles

- Chaque groupe affiche au plus 1000 éléments.
- Les liens "Accueil", "Contact" et les listes principales ne figurent pas dans le plan : il
  ne montre que les projets, pages, articles et catégories.
- Si le chargement échoue, un message "Une erreur s'est produite" invite à rafraîchir la page ou à
  contacter le propriétaire ([Pages d'erreur](../../errors/fr/ERROR_PAGES.FR.md)).
- Le site publie aussi, pour les moteurs de recherche, des plans techniques (accueil, blog, projets et pages) que le visiteur ne voit pas ;
  il ne se confond pas avec cette page.
