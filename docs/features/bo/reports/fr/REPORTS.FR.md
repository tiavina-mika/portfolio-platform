# Cas d'utilisation — Signalements

## Table des matières

- [Où trouver cette page](#où-trouver-cette-page)
- [À quoi sert cette page](#à-quoi-sert-cette-page)
- [Qui peut l'utiliser](#qui-peut-lutiliser)
- [Ce que l'on voit à l'écran](#ce-que-lon-voit-à-lécran)
- [Actions possibles](#actions-possibles)
- [Cas d'utilisation typiques](#cas-dutilisation-typiques)
- [Points d'attention / limites actuelles](#points-dattention--limites-actuelles)

## Où trouver cette page

Menu de gauche → groupe **Communauté** → **Signalements**. Adresse : `/signalements`. Les signalements en
attente sont aussi résumés sur le tableau de bord (bloc « Alertes ») et dans la cloche de la barre du haut.

## À quoi sert cette page

Elle rassemble les signalements faits par des membres contre un autre membre ou un contenu, pour les
examiner et décider de la suite : classer sans suite, traiter, ou suspendre le compte concerné.

## Qui peut l'utiliser

Droits de la ressource « Report » (page **Droits**) : « Lister » pour la liste, « Consulter » pour un
dossier, « Modifier » pour agir. Les comptes Owner et Super Admin ont tous les droits.

## Ce que l'on voit à l'écran

- Des onglets selon ce qui est signalé : **Utilisateurs**, **Trajets**, **Avis**, **Véhicules**, avec le
  nombre de signalements.
- Un tableau : **cible**, **raison**, **détails**, **signalé par** (ou anonyme), **ancienneté** et **statut**
  (en attente, en cours d'examen, résolu, classé sans suite). Une marque signale les dossiers qui dépassent le
  délai cible et les cibles déjà signalées plusieurs fois.
- Des filtres (statut, raison, ancienneté, auteur, cible) et un bouton **Exporter**.
- Le **dossier** d'un signalement : la cible, ce qui a été signalé, l'historique des actions et les autres
  signalements sur la même cible.

## Actions possibles

- **Prendre en charge** un signalement (il passe « en cours d'examen »).
- **Résoudre** avec une note décrivant l'action prise.
- **Rejeter / classer sans suite**, un par un ou en sélection.
- **Suspendre le compte** signalé pendant 7 jours : il ne peut plus publier ni réserver, mais peut se
  connecter.
- Ouvrir la conversation liée ou le compte concerné.

## Cas d'utilisation typiques

1. **Traiter la file** : ouvrir les plus anciens d'abord, prendre en charge, résoudre.
2. **Repérer un récidiviste** : consulter les signalements déjà faits sur la même cible.
3. **Nettoyer** les signalements sans fondement en les classant sans suite.

## Points d'attention / limites actuelles

- Le site public du portfolio n'offre aucun moyen de signaler quoi que ce soit : cette liste reste vide
  tant qu'aucune autre application n'alimente les signalements.
- Les onglets Trajets, Avis et Véhicules et la plupart des raisons viennent d'une application de
  covoiturage et n'ont pas de sens pour un portfolio.
