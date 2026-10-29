# Cas d'utilisation — Site public (Désabonnement de la newsletter)

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

Cette page n'apparaît dans aucun menu. On y arrive uniquement en cliquant sur le lien
**"Se désabonner"** situé en bas de chaque email de la newsletter. Le lien est personnel : il contient
l'adresse email de l'abonné sous une forme chiffrée. L'adresse se termine par
`/newsletter/…/unsubscribe` en anglais et `/newsletter/…/se-desabonner` en français.

## À quoi sert cette page

Elle permet à un abonné d'arrêter de recevoir la newsletter en un clic, sans compte ni mot de passe,
de dire pourquoi s'il le souhaite, et de revenir en arrière en cas d'erreur.

## Qui peut l'utiliser

Toute personne qui possède le lien reçu par email, sans connexion.

## Ce que l'on voit à l'écran

- Le titre **"Vous vous êtes désabonné avec succès de la newsletter."**, suivi de la phrase "Vous ne
  recevrez plus les dernières nouvelles et articles de [nom du propriétaire]."
- Une question, **"Dites-nous pourquoi vous voulez vous désabonner"**, avec quatre choix :
  - "L'email a été envoyé trop fréquemment."
  - "Je ne suis pas intéressé par le contenu"
  - "Le contenu me semble pas pertinent"
  - "Autre"
- Un bouton **"Soumettre"**.
- Une phrase **"Si c'est une erreur, vous pouvez se réabonner."**, dont "se réabonner" est un bouton.

## Actions possibles

### Se désabonner

Le désabonnement est effectué **dès l'ouverture de la page**, sans autre clic : le simple fait
d'arriver ici arrête les envois. La page s'affiche ensuite pour le confirmer.

### Indiquer la raison

L'abonné choisit un motif puis clique sur "Soumettre". Le message **"La raison a été soumise avec
succès."** s'affiche. Cette réponse est facultative et sert à améliorer la newsletter. Un motif doit
être choisi pour pouvoir soumettre.

### Se réabonner

Un clic sur "se réabonner" réactive l'abonnement. Un message de succès ("Vous vous êtes réabonné avec
succès à la newsletter.") apparaît et le visiteur est renvoyé à la page d'accueil. En cas de problème,
un message d'erreur l'invite à réessayer plus tard.

## Cas d'utilisation typiques

1. **Un abonné** reçoit trop d'emails, clique sur le lien et s'en va en indiquant "trop fréquemment".
2. **Un abonné** clique par erreur et utilise "se réabonner" pour annuler.
3. **Un abonné** qui n'est plus intéressé se désabonne sans donner de raison.

## Points d'attention / limites actuelles

- Le désabonnement a lieu dès l'ouverture du lien : un outil qui ouvre automatiquement les liens des
  emails (antivirus, aperçu) peut désabonner la personne sans qu'elle l'ait voulu ; elle peut alors
  utiliser "se réabonner".
- Un lien dont l'adresse ne correspond à aucun abonné affiche la page "Page introuvable"
  ([Pages d'erreur](../../errors/fr/ERROR_PAGES.FR.md)).
- Le motif ne peut être enregistré que pour un abonné actuellement désabonné ; après un
  réabonnement, il n'est plus pris en compte.
- Un abonné qui a déjà donné une raison peut en soumettre une autre : la dernière remplace la
  précédente.
- Il n'y a pas d'email de confirmation de désabonnement.
