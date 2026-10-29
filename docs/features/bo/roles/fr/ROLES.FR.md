# Cas d'utilisation — Droits et rôles

## Table des matières

- [Où trouver cette page](#où-trouver-cette-page)
- [À quoi sert cette page](#à-quoi-sert-cette-page)
- [Qui peut l'utiliser](#qui-peut-lutiliser)
- [Ce que l'on voit à l'écran](#ce-que-lon-voit-à-lécran)
- [Actions possibles](#actions-possibles)
  - [Créer un rôle](#créer-un-rôle)
  - [Modifier un rôle](#modifier-un-rôle)
  - [Supprimer un rôle](#supprimer-un-rôle)
- [Cas d'utilisation typiques](#cas-dutilisation-typiques)
- [Points d'attention / limites actuelles](#points-dattention--limites-actuelles)

## Où trouver cette page

Menu de gauche → **Droits** (groupe du bas, avec Paramètres), ou carte **Droits** de l'écran d'accueil.
Le titre affiché sur la page est « Roles ».

## À quoi sert cette page

Un rôle regroupe ce qu'une personne a le droit de faire dans le back-office : quelles rubriques elle
peut lire, créer, modifier ou supprimer, et quels menus elle voit. On attribue ensuite un ou plusieurs
rôles à chaque compte depuis la fiche de l'utilisateur.

## Qui peut l'utiliser

En pratique, cette page est réservée aux rôles **Owner** et **Administrator**, qui ont tous les droits
partout, n'apparaissent pas dans la liste et ne se modifient pas ici. Un autre rôle qui aurait la coche
« Lister » sur la rubrique « Roles » voit bien l'entrée **Droits** dans le menu, mais l'écran
« introuvable » s'affiche à l'ouverture.

## Ce que l'on voit à l'écran

Un tableau avec les colonnes **Nom**, **Créé le**, **Nombre d'utilisateurs** et **Actions** (modifier et
supprimer). Le bouton **Charger plus** affiche dix rôles supplémentaires. Un bouton rond « + » en bas à
droite ouvre le formulaire de création. S'il n'y a aucun rôle, un message l'indique.

## Actions possibles

### Créer un rôle

Le formulaire s'ouvre en plein écran (« Ajouter un nouveau rôle ») :

- **Nom** : obligatoire ; une fois créé, il ne peut plus être modifié ;
- **Hiérarchie des rôles** : les rôles enfants ; toute autorisation accordée au rôle parent est
  implicitement accordée à ses enfants ;
- **Menu** : quels menus facultatifs sont visibles pour ce rôle (**Divers** et **Tests**) ;
- **Droits des ressources** : un tableau où chaque colonne est une rubrique (Utilisateurs, Roles, Articles,
  Pages, Projet, Catégories, Contact) et chaque ligne un droit à cocher : créer (Create), lister (Find),
  consulter (Get), modifier (Update), supprimer (Delete) et supprimer définitivement (Destroy). Ces
  libellés sont affichés en anglais. La case en haut à gauche coche tout. Les sections de page suivent les
  droits de la rubrique « Pages ».

### Modifier un rôle

Le crayon de la ligne rouvre le même formulaire (« Modifier » suivi du nom), sauf le nom qui est figé.

### Supprimer un rôle

- Un rôle sans utilisateur se supprime avec l'icône corbeille, après confirmation.
- Un rôle encore attribué à des utilisateurs demande une confirmation renforcée : taper le nom du rôle
  pour valider.
- Le rôle **Manager** ne peut pas être supprimé.

## Cas d'utilisation typiques

1. **Donner un rôle de rédacteur** : créer « Rédacteur » avec les droits sur Articles et Pages uniquement.
2. **Donner un accès en lecture seule** : cocher seulement « Find » et « Get » sur les rubriques voulues.
3. **Retirer un droit** : modifier le rôle et décocher la case.
4. **Supprimer un rôle devenu inutile** : le supprimer, en confirmant s'il a encore des utilisateurs.

## Points d'attention / limites actuelles

- Les droits sont appliqués par le serveur, pas seulement par l'affichage : un menu masqué ne suffit pas
  à protéger une rubrique, c'est la coche du droit qui compte.
- Une personne sans aucun rôle est déconnectée dès qu'elle tente d'entrer dans le back-office.
- Les libellés des droits dans le tableau sont en anglais.
