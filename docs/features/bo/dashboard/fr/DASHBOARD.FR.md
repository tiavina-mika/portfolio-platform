# Cas d'utilisation — Accueil et navigation du back-office

## Table des matières

- [Où trouver cette page](#où-trouver-cette-page)
- [À quoi sert cette page](#à-quoi-sert-cette-page)
- [Qui peut l'utiliser](#qui-peut-lutiliser)
- [Ce que l'on voit à l'écran](#ce-que-lon-voit-à-lécran)
  - [Le menu de gauche](#le-menu-de-gauche)
  - [La barre du haut](#la-barre-du-haut)
  - [Les raccourcis de l'accueil](#les-raccourcis-de-laccueil)
- [Actions possibles](#actions-possibles)
- [Cas d'utilisation typiques](#cas-dutilisation-typiques)
- [Points d'attention / limites actuelles](#points-dattention--limites-actuelles)

## Où trouver cette page

C'est la première page affichée après la connexion. On y revient en cliquant sur le logo en haut du menu
de gauche.

## À quoi sert cette page

L'accueil propose des raccourcis vers les tâches les plus courantes. Autour de lui, le menu de gauche et
la barre du haut donnent accès à toutes les rubriques du back-office.

## Qui peut l'utiliser

Tout compte qui possède au moins un rôle. Une personne sans aucun rôle est renvoyée vers la
déconnexion. Ce que chacun voit dépend des droits de ses rôles (page **Droits**) : une rubrique dont le
droit « Lister » manque n'apparaît pas dans le menu. Les propriétaires et administrateurs voient tout.

## Ce que l'on voit à l'écran

### Le menu de gauche

Dans l'ordre :

1. **Articles** ;
2. **Page web**, qui se déplie en **Pages** et **Sections**, puis **Catégories** ;
3. **Utilisateurs** et **Contacts** ;
4. **Projets** ;
5. **Droits**, **Paramètres**, puis **Divers** et **Tests** : **Paramètres** n'apparaît que pour les propriétaires et administrateurs ;
   **Divers** et **Tests** sont réservés aux rôles qui ont reçu le menu correspondant.

Le bouton à trois barres réduit le menu à ses icônes ou le déploie. Sur téléphone et petite tablette, le
menu occupe tout l'écran et se referme après un choix.

### La barre du haut

- Une flèche de retour (absente sur l'accueil) qui revient à la page précédente.
- Deux icônes avec pastille de nombre : **Contacts** (nouveaux messages) et **Utilisateurs** (nouveaux
  comptes) ; un clic ouvre la liste sur l'onglet « Nouveaux ».
- Le menu du profil : **Mon profil** et **Déconnexion**.

### Les raccourcis de l'accueil

Des cartes, affichées seulement si le rôle le permet, dans cet ordre :

| Carte | Effet | Droit requis |
|---|---|---|
| Article | ouvre la création d'un article | Créer sur Articles |
| Page | ouvre la création d'une page | Créer sur Pages |
| Categories | ouvre la liste des catégories | Lister sur Catégories |
| Utilisateurs | ouvre la liste des utilisateurs | Lister sur Utilisateurs |
| Contacts | ouvre la liste des contacts | Lister sur Contact |
| Projet | ouvre la création d'un projet | Créer sur Projet |
| Droits | ouvre la liste des rôles | Lister sur Roles |

Une petite icône sur chaque carte distingue l'ouverture d'une liste de la création d'un élément.

## Actions possibles

- Cliquer sur une carte ou sur une entrée du menu pour ouvrir la rubrique.
- Réduire ou déployer le menu.
- Cliquer sur une pastille de la barre du haut pour traiter les nouveautés.
- Ouvrir son profil ou se déconnecter.

## Cas d'utilisation typiques

1. **Écrire un nouvel article** : carte Article.
2. **Traiter les nouveaux messages** : icône Contacts de la barre du haut.
3. **Naviguer sur téléphone** : bouton à trois barres, choix de la rubrique.

## Points d'attention / limites actuelles

- L'accueil ne contient aucun chiffre ni graphique, seulement des raccourcis.
- Les cartes de l'accueil et le menu n'ont pas tout à fait les mêmes conditions : les cartes de création
  demandent le droit « Créer », le menu demande « Lister ».
