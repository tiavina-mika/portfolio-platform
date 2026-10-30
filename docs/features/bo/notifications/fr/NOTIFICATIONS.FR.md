# Cas d'utilisation — Notifications

## Table des matières

- [Où trouver cette page](#où-trouver-cette-page)
- [À quoi sert cette page](#à-quoi-sert-cette-page)
- [Qui peut l'utiliser](#qui-peut-lutiliser)
- [Ce que l'on voit à l'écran](#ce-que-lon-voit-à-lécran)
- [Actions possibles](#actions-possibles)
- [Cas d'utilisation typiques](#cas-dutilisation-typiques)
- [Points d'attention / limites actuelles](#points-dattention--limites-actuelles)

## Où trouver cette page

Menu de gauche → groupe **Communauté** → **Notifications**. Adresse : `/notifications`.

À ne pas confondre avec la **cloche** de la barre du haut, qui résume ce qui est nouveau dans le back-office
(contacts, utilisateurs, signalements, paiements).

## À quoi sert cette page

C'est le registre des messages envoyés par l'application à ses membres (annonces, e-mails, SMS, notifications
sur téléphone) : qui les a envoyés, à qui, par quel canal, s'ils sont arrivés et s'ils ont été lus.

## Qui peut l'utiliser

Droits de la ressource « Notification » (page **Droits**). Les comptes Owner et Super Admin ont tous les
droits.

## Ce que l'on voit à l'écran

- Des onglets **Tout**, **Nouveaux** et **Corbeille** (ce dernier pour les comptes pouvant supprimer
  définitivement), avec une recherche (message, émetteur ou code de statut) et des filtres.
- Un tableau : **statut** de la notification, **message**, **émetteur** (un compte ou le système),
  **destinataires**, **canaux** (push, e-mail, SMS, avec leur état d'envoi), **taux de lecture** et **date
  d'envoi**.
- Un détail par ligne avec l'acheminement destinataire par destinataire, et un bouton **Exporter**.

## Actions possibles

- **Ouvrir** une notification pour voir son détail et son acheminement.
- **Renvoyer** une notification, ou seulement ses envois en échec (après confirmation ; un renvoi par SMS a un
  coût, rappelé dans la fenêtre).
- **Marquer comme lue / non lue** par le destinataire, en sélection.
- **Supprimer**, **restaurer** ou **détruire définitivement** (corbeille).
- Rédiger une annonce : voir [Diffusion](BROADCAST.FR.md).

## Cas d'utilisation typiques

1. **Vérifier qu'une annonce est bien partie** et combien de personnes l'ont lue.
2. **Relancer** les envois en échec.
3. **Retrouver** ce qu'un membre a reçu.

## Points d'attention / limites actuelles

- Les types et statuts (trajet, réservation, véhicule, avis…) viennent d'une application de covoiturage ;
  sur le portfolio, les seules notifications réellement émises sont celles liées aux comptes, aux demandes
  de contact et aux annonces.
- Le renvoi par SMS dépend d'un fournisseur externe qui doit être configuré.
