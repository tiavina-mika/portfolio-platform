# Cas d'utilisation — Pages d'erreur et messages

## Table des matières

- [Où trouver cette page](#où-trouver-cette-page)
- [À quoi sert cette page](#à-quoi-sert-cette-page)
- [Qui peut l'utiliser](#qui-peut-lutiliser)
- [Ce que l'on voit à l'écran](#ce-que-lon-voit-à-lécran)
- [Actions possibles](#actions-possibles)
- [Cas d'utilisation typiques](#cas-dutilisation-typiques)
- [Points d'attention / limites actuelles](#points-dattention--limites-actuelles)

## Où trouver cette page

Elle s'affiche d'elle-même, à la place de la page demandée, dans les cas listés plus bas. Il n'y a pas
d'entrée de menu.

## À quoi sert cette page

Dire clairement que la page demandée n'est pas accessible et ramener à l'accueil. Les erreurs qui
surviennent pendant une action (enregistrement, suppression…) ne passent pas par cette page : elles
s'affichent dans un bandeau de message.

## Qui peut l'utiliser

Tout le monde peut la voir. Elle remplace aussi bien une page inexistante qu'une page que le rôle du
compte n'autorise pas.

## Ce que l'on voit à l'écran

Une carte centrée avec :

- le grand chiffre **404** ;
- le message « Cette page est introuvable. » ;
- un bouton **Retourner à l'accueil**.

Elle apparaît dans quatre situations :

1. une adresse qui n'existe pas dans le back-office ;
2. un élément qui n'existe plus ou n'a jamais existé (page, catégorie, utilisateur… ouvert par son lien) ;
3. une rubrique pour laquelle le rôle n'a pas le droit nécessaire (par exemple ouvrir la liste des pages
   sans le droit « Lister » sur les pages) ;
4. un formulaire de création ou de modification ouvert sans le droit « Créer » ou « Modifier ».

Pour une action refusée une fois sur la page (par exemple supprimer sans en avoir le droit), un bandeau
rouge s'affiche en bas de l'écran avec un message comme « vous n'êtes pas autorisé à effectuer cette
action », sans quitter la page.

## Actions possibles

- **Retourner à l'accueil** : ouvre l'écran d'accueil du back-office.

## Cas d'utilisation typiques

1. **Un lien enregistré vers un élément supprimé** : la page d'erreur s'affiche ; retour à l'accueil.
2. **Une rubrique qui disparaît du menu** : le rôle ne permet plus de la voir ; contacter un
   administrateur pour obtenir le droit.
3. **Une faute de frappe dans l'adresse** : retour à l'accueil, puis menu.

## Points d'attention / limites actuelles

- Le message est le même quelle que soit la cause : on ne sait pas si la page n'existe pas ou si l'accès
  est refusé.
- Une personne sans aucun rôle n'arrive pas sur cette page : elle est renvoyée vers la déconnexion.
- Une personne non connectée est renvoyée vers l'écran de connexion.
