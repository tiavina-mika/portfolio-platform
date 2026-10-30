# Cas d'utilisation — Site public (Lire un article)

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

En cliquant sur la carte d'un article, depuis la page d'accueil, la
[liste des articles](ARTICLES_LIST.FR.md), le plan du site, la recherche ou un lien reçu dans la
newsletter. L'adresse est de la forme `/blog/<identifiant-de-l-article>`. Les anciennes adresses en
`/articles/…` redirigent vers la nouvelle.

## À quoi sert cette page

Elle permet de lire un article ou un tutoriel en entier, de le partager et de continuer la lecture
avec des articles proches.

## Qui peut l'utiliser

Tout visiteur, sans connexion ni compte. Un article désactivé ou supprimé dans le back-office n'est
plus accessible : la page "Page introuvable" s'affiche
([Pages d'erreur](../../errors/fr/ERROR_PAGES.FR.md)).

## Ce que l'on voit à l'écran

De haut en bas :

1. **L'en-tête** : le fil d'Ariane, les catégories de l'article (chacune est un lien vers les articles
   de la catégorie), le titre, une description, le temps de lecture estimé, la date de publication
   (et la date de mise à jour quand l'article a été modifié), puis l'image de couverture.
2. **Le contenu** : le texte complet, avec titres, listes et extraits de code.
3. **Les images complémentaires**, quand il y en a.
4. **Les mots-clés**, sous forme de liens.
5. **Le partage** : le nombre de partages (quand il y en a) et sept icônes — Facebook, X, LinkedIn,
   WhatsApp, Telegram, Reddit, Skype.
6. **"À lire aussi"** : les articles qui partagent une catégorie avec celui-ci.
7. **L'abonnement à la newsletter**, en bas de page.

Tout s'affiche dans la langue du visiteur. Les parties sans contenu (pas d'image de couverture, pas
de mot-clé, pas d'article similaire) n'apparaissent pas.

## Actions possibles

### Lire les articles d'une catégorie ou d'un mot-clé

Un clic sur une catégorie ou un mot-clé ouvre la [liste des articles](ARTICLES_LIST.FR.md) filtrée.

### Partager l'article

Un clic sur une icône ouvre le réseau choisi dans un nouvel onglet avec l'adresse de l'article. Chaque
clic est ajouté au nombre de partages affiché.

### Continuer la lecture

Les cartes "À lire aussi" ouvrent d'autres articles.

### S'abonner à la newsletter

Voir [Inscription à la newsletter](../../newsletter/fr/NEWSLETTER_SUBSCRIBE.FR.md).

## Cas d'utilisation typiques

1. **Un lecteur** suit un tutoriel de bout en bout, puis lit un article similaire.
2. **Un abonné à la newsletter** arrive depuis le bouton de l'e-mail reçu à la parution de l'article.
3. **Un lecteur** partage l'article à des collègues sur WhatsApp ou LinkedIn.
4. **Un visiteur** clique sur un mot-clé pour retrouver les autres articles sur le même sujet.

## Points d'attention / limites actuelles

- Il n'existe pas de page dédiée à l'auteur.
- Le nombre de partages compte les clics sur les icônes, pas les partages réellement effectués sur
  les réseaux.
- Chaque ouverture de l'article est comptée comme une vue.
- Si l'article n'a pas de version dans la langue du visiteur, son adresse en langue par défaut reste
  utilisable.
