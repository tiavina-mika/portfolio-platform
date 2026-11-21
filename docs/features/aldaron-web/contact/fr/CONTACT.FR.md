# Cas d'utilisation — Site Aldaron (Contact)

## Table des matières

- [Où trouver cette page](#où-trouver-cette-page)
- [À quoi sert cette page](#à-quoi-sert-cette-page)
- [Qui peut l'utiliser](#qui-peut-lutiliser)
- [Ce que l'on voit à l'écran](#ce-que-lon-voit-à-lécran)
- [Actions possibles](#actions-possibles)
- [Ce qui se passe après l'envoi](#ce-qui-se-passe-après-lenvoi)
- [Cas d'utilisation typiques](#cas-dutilisation-typiques)
- [Points d'attention / limites actuelles](#points-dattention--limites-actuelles)

---

## Où trouver cette page

Lien **« Contact »** du menu de navigation, lien **« Demander un devis ferme »** du pied de page,
bouton « Demander un devis ferme » des pages d'accueil, d'offre et prix, de réalisations et à propos,
ainsi que le simulateur de prix, qui y mène une fois l'estimation terminée. L'adresse est `/contact`
dans les trois langues (français, anglais, malgache).

## À quoi sert cette page

Elle permet à un porteur de projet de demander un **devis ferme** : il décrit son produit, les supports
voulus et ce qu'il apporte déjà. Le cadrage est gratuit, et Aldaron répond personnellement. Ce n'est pas
un devis automatique.

## Qui peut l'utiliser

Tout visiteur, sans connexion ni compte.

## Ce que l'on voit à l'écran

- En haut : le titre **« Parlons de votre produit. »** et une phrase qui rappelle que le cadrage est
  gratuit et qu'un devis ferme est envoyé en retour.
- Le formulaire, sur une seule colonne :
  - **Nom** (obligatoire)
  - **E-mail** (obligatoire)
  - **Votre produit en une ou deux phrases** (obligatoire)
  - **Supports** (obligatoire, plusieurs choix possibles) : site web statique, application web,
    application mobile, back-office
  - **Ce que vous apportez** (facultatif, un seul choix) : une idée, un cahier des charges ou une
    maquette ; un second clic sur le choix retenu l'annule
  - **Estimation du simulateur** (facultatif, uniquement si le visiteur vient du simulateur) :
    reprise de son estimation, modifiable
  - **Principaux besoins** (facultatif) : un besoin par ligne
  - Une case de **consentement** (obligatoire) : « J'accepte que mes données soient utilisées pour
    répondre à ma demande. »
- Le bouton **« Demander un devis ferme »**, suivi de la mention « Ce n'est pas un devis automatique :
  nous répondons personnellement. »

Règles de saisie : le nom compte au moins 2 caractères, l'e-mail doit avoir un format valide, la
description du produit compte au moins 5 caractères (300 au maximum), au moins un support doit être
choisi et le consentement doit être coché. Les besoins sont limités à 300 caractères et l'estimation à
400. Un champ mal rempli
affiche un message dans la langue du site, une fois que le visiteur a essayé d'envoyer, et ce message
disparaît dès que le champ est corrigé.

## Actions possibles

### Demander un devis ferme

Une fois les champs obligatoires remplis, un clic sur « Demander un devis ferme » envoie la demande.
Pendant l'envoi, le bouton indique « Envoi en cours… » et les champs sont bloqués. Le message **« Merci,
votre demande est envoyée. Nous vous répondons personnellement. »** apparaît ensuite sous le bouton.

Si l'envoi échoue, une bannière « Votre demande n'a pas pu être envoyée » propose de réessayer. Hors
connexion, une bannière prévient que la demande ne peut pas partir tant que le réseau n'est pas revenu ;
les champs restent utilisables pour rédiger la demande en attendant.

### Partir de l'estimation du simulateur

Quand le visiteur a terminé le simulateur, son estimation est gardée dans son navigateur. À l'ouverture
de la page Contact, le formulaire reprend les supports et ce que le visiteur apporte, et affiche
l'estimation dans un champ qu'il peut modifier. Elle est supprimée du navigateur dès que la demande est
envoyée.

## Ce qui se passe après l'envoi

La demande est enregistrée comme un message dans la section « Contacts » du back-office : le nom et
l'e-mail dans leurs champs, et tout le reste (produit, supports, ce que le visiteur apporte, besoins,
estimation) écrit ligne par ligne dans le texte du message. La langue du visiteur est conservée. Le
visiteur ne reçoit pas d'accusé de réception automatique : Aldaron répond depuis sa messagerie, à
l'adresse laissée.

## Cas d'utilisation typiques

1. **Un fondateur de startup** décrit son produit et demande un devis ferme après avoir estimé son prix.
2. **Un porteur de projet** arrive directement sur la page, avec seulement une idée, et demande un
   premier cadrage gratuit.
3. **Une personne qui a déjà une maquette** choisit « Une maquette » pour que la réponse en tienne
   compte.

## Points d'attention / limites actuelles

- Le message enregistré est limité à 1 000 caractères : si l'estimation est longue, elle est raccourcie
  pour tenir.
- Le formulaire est protégé contre les envois automatisés par un contrôle invisible (reCAPTCHA) et par une
  limite d'envois par appareil ; si l'une de ces protections refuse l'envoi, un message d'erreur
  s'affiche et rien n'est envoyé.
- Le consentement est demandé à chaque envoi ; les traitements de données sont décrits dans la
  [politique de confidentialité](../../legal/fr/PRIVACY.FR.md).
