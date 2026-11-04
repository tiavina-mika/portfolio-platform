# Cas d'utilisation — Site public (Confirmation de l'inscription à la newsletter)

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

Cette page n'apparaît dans aucun menu. On y arrive uniquement en cliquant sur le lien de l'**email de
confirmation** reçu après avoir rempli le formulaire d'inscription
([Inscription à la newsletter](NEWSLETTER_SUBSCRIBE.FR.md)). Le lien est personnel et ne sert qu'à
cette inscription. L'adresse se termine par `/newsletter/confirm/…` en anglais et
`/newsletter/confirmer/…` en français.

## À quoi sert cette page

Elle termine l'inscription : elle prouve que la personne est bien propriétaire de l'adresse email, et
c'est seulement à ce moment que l'abonnement devient actif.

## Qui peut l'utiliser

Toute personne qui possède le lien reçu par email, sans connexion.

## Ce que l'on voit à l'écran

- Le titre **"Votre inscription est confirmée"**.
- Le message **"Merci ! Vous recevrez désormais les actualités et les articles de [nom du
  propriétaire]. Chaque email contient un lien pour vous désabonner à tout moment."**

## Actions possibles

### Confirmer l'inscription

La confirmation est faite **dès l'ouverture de la page**, sans autre clic. Ouvrir le lien une seconde
fois ne change rien : l'abonnement est confirmé une seule fois.

## Cas d'utilisation typiques

1. **Un visiteur** s'inscrit sur le site, ouvre l'email reçu et clique sur le lien : il est abonné.
2. **Un visiteur** clique deux fois sur le lien et voit de nouveau la même confirmation.

## Points d'attention / limites actuelles

- Un lien inconnu ou mal recopié affiche la page "Page introuvable"
  ([Pages d'erreur](../../errors/fr/ERROR_PAGES.FR.md)).
- Cette page n'est pas référencée par les moteurs de recherche et ne figure dans aucun plan du site.
- Si l'email de confirmation n'arrive pas, le visiteur peut se réinscrire pour en recevoir un nouveau.
