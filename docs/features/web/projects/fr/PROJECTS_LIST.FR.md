# Cas d'utilisation — Site public (Liste des projets)

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

Lien **"Projets"** du menu de navigation (présent sur toutes les pages), bouton **"Voir N autres
projets"** de la page d'accueil, ou lien "Mes projets" du pied de page. L'adresse est `/projects` en anglais et
`/projets` en français.

## À quoi sert cette page

Elle présente l'ensemble des réalisations du propriétaire : applications web, sites, outils. Elle
permet de parcourir tous les projets, bien au-delà des quelques projets mis en avant sur la page
d'accueil.

## Qui peut l'utiliser

Tout visiteur, sans connexion ni compte.

## Ce que l'on voit à l'écran

- Un titre ("Projets que j'ai développés au cours de ma carrière") et un paragraphe de présentation.
- Une grille de cartes (une colonne sur téléphone, jusqu'à quatre sur grand écran). Chaque carte
  montre l'image du projet, son nom, une courte description et un bouton **"Voir plus"**. Toute la
  carte est cliquable.
- Les projets sont triés par date de début, du plus récent au plus ancien.
- Une **pagination** en bas de page : 12 projets par page, avec des flèches et les numéros des pages
  voisines.
- Pendant le chargement, des cartes grisées s'affichent à la place des projets ; si le chargement échoue, une bannière propose de réessayer, et hors connexion un message indique que les projets reviendront avec le réseau.

Seuls les projets **actifs** (non désactivés ni supprimés dans le back-office) sont visibles. Le
nom, la description et les textes s'affichent dans la langue du visiteur.

## Rechercher / filtrer

La page n'a pas de zone de filtre visible. Deux filtres existent toutefois et s'activent depuis la
page de détail d'un projet :

- un clic sur une **technologie** (par exemple React) affiche uniquement les projets qui utilisent
  cette technologie ;
- un clic sur un **mot-clé** de la page de détail affiche de même uniquement les projets portant ce
  mot-clé.

Le menu de recherche du site (en haut de page) permet aussi de retrouver un projet par son texte,
voir [Navigation, pied de page, langue et thème](../../navigation/fr/NAVIGATION_AND_FOOTER.FR.md).

## Actions possibles

### Ouvrir un projet

Un clic sur une carte ouvre la page de détail du projet
([Détail d'un projet](PROJECT_DETAIL.FR.md)).

### Changer de page

Les flèches et les numéros de la pagination affichent les projets suivants ou précédents.

## Cas d'utilisation typiques

1. **Un client potentiel** parcourt toutes les réalisations pour juger de l'étendue du travail.
2. **Un recruteur** cherche des exemples avec une technologie précise : il l'ouvre depuis un projet
   puis clique sur la technologie pour voir les autres.
3. **Un visiteur arrivé de la page d'accueil** clique sur "Voir N autres projets" pour voir la suite.

## Points d'attention / limites actuelles

- Tant qu'aucun projet n'est actif, le message **"Aucun projet pour le moment."** s'affiche.
- Le filtre par technologie n'indique pas à l'écran qu'il est actif : la liste est simplement plus
  courte. Pour revenir à la liste complète, on repasse par le menu "Projets".
- Les filtres (technologie, mot-clé) et l'ordre sont portés par l'adresse de la page : une liste filtrée peut être copiée et partagée.
- Il n'y a pas de choix de tri pour le visiteur sur cette page.
