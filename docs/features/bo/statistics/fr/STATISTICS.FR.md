# Cas d'utilisation — Statistiques

## Table des matières

- [Où trouver cette page](#où-trouver-cette-page)
- [À quoi sert cette page](#à-quoi-sert-cette-page)
- [Qui peut l'utiliser](#qui-peut-lutiliser)
- [Ce que l'on voit à l'écran](#ce-que-lon-voit-à-lécran)
- [Actions possibles](#actions-possibles)
- [Points d'attention / limites actuelles](#points-dattention--limites-actuelles)

## Où trouver cette page

Menu de gauche → groupe **Analytique** → **Statistiques**. Adresse : `/statistiques`.

## À quoi sert cette page

Suivre l'évolution de l'activité par graphiques : inscriptions, revenus, utilisateurs actifs, signalements.
Cette rubrique vient d'une application de covoiturage ; seule une partie concerne un portfolio.

## Qui peut l'utiliser

Le droit « statistiques », accordé dans le formulaire d'un poste (page **Droits**). Les comptes Owner et
Super Admin ont tous les droits.

## Ce que l'on voit à l'écran

Une seule entrée de menu, et une navigation interne entre cinq vues : **Vue d'ensemble**, **Utilisateurs**,
**Paiements**, **Signalements** et **Annulations**. Chaque vue propose le choix de la période (7 jours, 30
jours, 90 jours, 12 mois), la comparaison avec la période précédente et l'export CSV de chaque graphique.

## Actions possibles

- Changer de vue et de période.
- Exporter un graphique en CSV.

## Points d'attention / limites actuelles

- Seule la **vue d'ensemble** est alimentée par le serveur du portfolio ; les vues Utilisateurs, Paiements,
  Signalements et Annulations appellent des fonctions que le serveur ne fournit pas et ne s'affichent pas
  correctement.
- Les graphiques parlent de trajets, de conducteurs et de remplissage : vocabulaire d'une autre application.
- Le bouton « Lever la suspension » de la vue Annulations ne fonctionne pas pour la même raison.
