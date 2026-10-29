# Cas d'utilisation — Contacts (Lire et répondre)

## Table des matières

- [Où trouver cette page](#où-trouver-cette-page)
- [À quoi sert cette page](#à-quoi-sert-cette-page)
- [Qui peut l'utiliser](#qui-peut-lutiliser)
- [Ce que l'on voit à l'écran](#ce-que-lon-voit-à-lécran)
- [Actions possibles](#actions-possibles)
- [Cas d'utilisation typiques](#cas-dutilisation-typiques)
- [Points d'attention / limites actuelles](#points-dattention--limites-actuelles)

## Où trouver cette page

C'est une fenêtre qui s'ouvre au-dessus de la liste des **Contacts** : clic sur une ligne, ou icône
d'envoi dans la colonne Actions.

## À quoi sert cette page

Lire en entier le message d'un visiteur et lui répondre par e-mail.

## Qui peut l'utiliser

Tout compte qui voit la liste des contacts (droit « Lister » sur la ressource « Contact », page
**Droits**). Aucun autre droit n'est vérifié à l'écran pour répondre.

## Ce que l'on voit à l'écran

- En-tête : « Message de » suivi du nom de l'expéditeur, son adresse e-mail et la date d'envoi avec l'heure.
- Le texte complet du message.
- Si le message n'a pas été marqué comme répondu : un champ **Répondre** avec un bouton **Envoyer**.
- Sinon : **Répondu par** et **Répondu le**.

## Actions possibles

### Répondre

On saisit le texte de la réponse puis on clique sur **Envoyer**. Le back-office n'envoie pas lui-même
l'e-mail : il ouvre le logiciel de messagerie de l'ordinateur, avec l'adresse du destinataire, un sujet
« Re: » suivi du nom et de la date du message d'origine, et le texte saisi. C'est dans ce logiciel qu'il
faut valider l'envoi. Environ 12 secondes plus tard, la fenêtre se ferme et le message apparaît comme
répondu dans la liste.

### Fermer

Le bouton de fermeture de la fenêtre (ou le bouton secondaire du formulaire de réponse) referme la fenêtre sans rien envoyer.

## Cas d'utilisation typiques

1. **Répondre à une demande de collaboration** : ouvrir le message, rédiger, envoyer depuis le logiciel
   de messagerie.
2. **Relire un ancien message** déjà traité : l'ouvrir, le texte et les informations de réponse sont
   affichés.

## Points d'attention / limites actuelles

- Il faut un logiciel de messagerie configuré sur l'ordinateur ; sans lui, rien ne s'ouvre.
- Le passage à « Répondu » est enregistré dès la fermeture de la fenêtre, avec l'auteur et la date,
  même si l'e-mail n'a pas réellement été envoyé depuis la messagerie.
- La fenêtre se ferme automatiquement après l'ouverture de la messagerie, que l'e-mail soit réellement
  envoyé ou non.
