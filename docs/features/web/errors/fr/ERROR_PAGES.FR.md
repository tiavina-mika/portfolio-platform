# Cas d'utilisation — Site public (Pages d'erreur)

## Table des matières

- [Où trouver ces pages](#où-trouver-ces-pages)
- [À quoi elles servent](#à-quoi-elles-servent)
- ["Page introuvable" (404)](#page-introuvable-404)
- ["Une erreur s'est produite"](#une-erreur-sest-produite)
- [Cas d'utilisation typiques](#cas-dutilisation-typiques)
- [Points d'attention / limites actuelles](#points-dattention--limites-actuelles)

---

## Où trouver ces pages

Ces pages n'ont aucun lien de menu : elles s'affichent **d'elles-mêmes** quand la situation qu'elles
décrivent se produit.

## À quoi elles servent

Un visiteur qui tombe sur une adresse inexistante ou sur un incident ne doit pas se retrouver devant
une page blanche : ces pages expliquent ce qui se passe et ramènent vers le site.

## "Page introuvable" (404)

S'affiche quand l'adresse demandée ne correspond à rien : un projet, un article ou une page de
contenu désactivé ou supprimé dans le back-office, un lien mal recopié, un lien de désabonnement ou de confirmation de newsletter qui
ne correspond à aucun abonné.

Elle affiche, centrés sur un écran vide :

- le grand nombre **404** ;
- le titre **"Page introuvable"** ;
- l'explication **"La page que vous recherchez n'existe pas ou a été déplacée."** ;
- le bouton **"Aller à la page d'accueil"** ;
- le lien **"Me contacter"**, pour signaler un lien mort ;
- le lien **"Lire le blog"**.

Le texte est dans la langue du visiteur (français ou anglais).

## "Une erreur s'est produite"

S'affiche quand une page ne parvient pas à se charger (plan du site, blog, projets, contact, pages de contenu ou incident imprévu). Elle montre le titre **"Une erreur s'est
produite."**, la consigne **"Veuillez rafraîchir la page ou réessayer plus tard."** et la phrase **"Si le
problème persiste, veuillez nous contacter."**, dont "nous contacter" mène au formulaire de contact. Le
reste de la page (menu, pied de page) reste utilisable.

## Cas d'utilisation typiques

1. **Un visiteur** ouvre un ancien lien vers un article retiré : il lit "Page introuvable" et retourne à
   l'accueil.
2. **Un visiteur** se trompe en tapant une adresse et clique sur "Aller à la page d'accueil".
3. **Un visiteur** ouvre un lien de désabonnement périmé et peut utiliser "Me contacter".
4. **Un visiteur** voit une erreur sur une page, rafraîchit la page puis, si cela persiste,
   écrit au propriétaire.

## Points d'attention / limites actuelles

- La page "Page introuvable" propose seulement deux sorties : le retour à l'accueil et le contact.
- Les formulaires (contact, newsletter) gèrent leurs erreurs eux-mêmes, avec un message sous ou près
  du formulaire ; ils n'utilisent pas ces pages.
