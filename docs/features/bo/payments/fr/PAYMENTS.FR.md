# Cas d'utilisation — Paiements

## Table des matières

- [Où trouver cette page](#où-trouver-cette-page)
- [À quoi sert cette page](#à-quoi-sert-cette-page)
- [Qui peut l'utiliser](#qui-peut-lutiliser)
- [Ce que l'on voit à l'écran](#ce-que-lon-voit-à-lécran)
- [Actions possibles](#actions-possibles)
- [Points d'attention / limites actuelles](#points-dattention--limites-actuelles)

## Où trouver cette page

Menu de gauche → groupe **Communauté** → **Paiements**. Adresse : `/paiements`.

## À quoi sert cette page

C'est le journal des paiements de la plateforme : encaissements, reversements et remboursements, avec leur
état. Cette rubrique vient d'une application de covoiturage payant ; le portfolio n'encaisse aucun paiement.

## Qui peut l'utiliser

Droits de la ressource « Payment » (page **Droits**). Le droit **Modifier** conditionne les actions qui
touchent à l'argent (rejouer, rembourser). Les comptes Owner et Super Admin ont tous les droits.

## Ce que l'on voit à l'écran

- Des onglets par sens du flux, **En attente**, **Échoués**, **Nouveaux** et **Corbeille**.
- Un tableau : **référence**, **type**, **personne**, **statut** et **montant** ; un détail par ligne
  (parties, tentatives, vérifications, historique).
- Un récapitulatif du journal, une bande de santé des opérateurs de paiement mobile et, le cas échéant, les
  réservations débitées à régulariser.
- Une recherche (référence, numéro, nom), des filtres et un bouton **Exporter**.

## Actions possibles

- **Rejouer** un paiement échoué, **rembourser** un paiement (total ou partiel, avec motif), **renvoyer le
  reçu** par e-mail.
- Confirmer ou rembourser une réservation débitée mais jamais confirmée.

## Points d'attention / limites actuelles

- Le portfolio n'a pas de vraie passerelle de paiement : le serveur utilise une passerelle simulée, et la
  liste reste vide en l'absence de paiement.
- Le vocabulaire (trajet, conducteur, passager, Mvola, Orange Money, Airtel Money) vient de l'application
  d'origine.
- Certaines actions (régularisation des réservations débitées) appellent des fonctions que le serveur du
  portfolio ne fournit pas.
