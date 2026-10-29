# Cas d'utilisation — Utilisateurs (Fiche)

## Table des matières

- [Où trouver cette page](#où-trouver-cette-page)
- [À quoi sert cette page](#à-quoi-sert-cette-page)
- [Qui peut l'utiliser](#qui-peut-lutiliser)
- [Ce que l'on voit à l'écran](#ce-que-lon-voit-à-lécran)
- [Actions possibles](#actions-possibles)
- [Cas d'utilisation typiques](#cas-dutilisation-typiques)
- [Points d'attention / limites actuelles](#points-dattention--limites-actuelles)

## Où trouver cette page

Liste des **Utilisateurs** → clic sur une ligne, ou icône « œil » de la colonne Actions.

## À quoi sert cette page

Consulter la fiche d'un compte, lui attribuer des rôles, le bannir ou lui écrire.

## Qui peut l'utiliser

Le droit **Consulter** sur la ressource « Utilisateurs » (page **Droits**). Sans lui, ou si le compte
n'existe plus, l'écran « introuvable » s'affiche. Seules les personnes qui ont accès au back-office
peuvent bannir un compte ; seuls les propriétaires et administrateurs ont tous les droits.

## Ce que l'on voit à l'écran

Le titre est « Utilisateur - » suivi du nom de famille. À gauche :

- **Détails** : prénom, nom, dates de création, de modification (et de suppression le cas échéant),
  sexe, à propos de l'utilisateur, date de naissance avec l'âge ;
- **Contact** : e-mail, téléphone, adresse ;
- **Plateformes** : les plateformes depuis lesquelles le compte s'est connecté ;
- **Historique des bannissements**.

À droite : la carte de l'utilisateur ; le bloc **Rôles**, affiché seulement pour un compte créé depuis le
back-office ; et **Status** (vu, banni, compte vérifié).

## Actions possibles

- **Bannir / Activer** (menu Actions) : bascule l'état banni du compte.
- **Marquer comme vu / non vu** (menu Actions) : retire ou remet le compte dans les « Nouveaux ».
- **Retour à la liste** (menu Actions).
- **Écrire à l'utilisateur** : bouton flottant d'envoi, qui ouvre la fenêtre d'envoi d'e-mail.
- **Gérer les rôles** : la pastille « + » (ou « Ajouter un poste » s'il n'y a aucun rôle) ouvre une fenêtre
  pour ajouter des rôles ; la croix d'une pastille de rôle le retire.

## Cas d'utilisation typiques

1. **Donner l'accès au back-office** : fiche d'un compte du back-office → ajouter un rôle.
2. **Bannir** un compte abusif, puis consulter l'historique des bannissements.
3. **Vérifier les coordonnées** d'un utilisateur avant de le contacter.

## Points d'attention / limites actuelles

- Les rôles ne se gèrent que pour les comptes créés depuis le back-office.
- Il n'y a pas de bouton de suppression dans cette fiche : la suppression se fait depuis la liste.
- La fiche est en lecture seule : on ne modifie ni le nom ni les coordonnées d'un autre utilisateur.
