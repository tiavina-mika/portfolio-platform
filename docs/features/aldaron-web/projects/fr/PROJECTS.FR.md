# Cas d'utilisation — Site Aldaron (Réalisations)

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

Dans le menu de navigation, lien **"Réalisations"** (« Projects » en anglais, « Asa vita » en
malgache). Le site existe en français, en anglais et en malgache : la page s'ouvre dans la langue
choisie par le visiteur.

## À quoi sert cette page

Elle montre quelques produits livrés par Aldaron, avec pour chacun son périmètre, son délai et son
prix. Un fondateur de startup y voit à quoi ressemble un projet comparable au sien et l'ordre de
grandeur du prix avant de demander une estimation.

## Qui peut l'utiliser

Tout visiteur, sans connexion ni compte.

## Ce que l'on voit à l'écran

1. **L'introduction** : l'étiquette « Réalisations », le titre « Des produits livrés à prix fixe. » et
   une phrase qui annonce le contenu de la page.
2. **Les filtres** : cinq boutons **Tous**, **Site web**, **Application web**, **Mobile** et
   **Back-office**, chacun avec le nombre de réalisations qu'il contient. À droite, une ligne indique
   la plage affichée (par exemple « 1–4 sur 10 réalisations »).
3. **Les cartes des réalisations**, quatre par page. Chaque carte montre le domaine du projet
   (Livraison, Santé, Voyage…), son nom, une courte description, une zone réservée à la capture
   d'écran du produit, puis quatre lignes : les **supports** livrés, le nombre d'**écrans** par
   support, le **délai** en semaines et le **prix**.
4. **La pagination** (Précédent, numéros, Suivant) quand le filtre choisi contient plus de quatre
   réalisations. Sur mobile, les numéros laissent la place à l'indication « 2 / 3 ».
5. **Le bouton "Estimer mon prix"**, qui mène au simulateur.

Pendant le chargement, des zones grisées remplacent le titre et les cartes.

## Actions possibles

### Filtrer par support
Un clic sur un filtre ne garde que les réalisations livrées sur ce support et revient à la première
page. Le texte de plage s'annonce aux lecteurs d'écran à chaque changement.

### Changer de page
Les boutons **Précédent** et **Suivant** et les numéros de page font défiler les cartes. Le bouton
**Précédent** est inactif sur la première page et **Suivant** sur la dernière.

### Changer la devise des prix
Les prix sont écrits en euros. Le sélecteur de devise de la barre de navigation les convertit en
dollars ou en ariary (les taux viennent d'un service gratuit et sont mis à jour toutes les douze
heures). Le choix est mémorisé sur l'appareil du visiteur.

### Estimer son propre prix
Le bouton **"Estimer mon prix"** ouvre le simulateur de prix.

## Cas d'utilisation typiques

- Un fondateur qui prépare une application de livraison filtre sur **Mobile** et compare le nombre
  d'écrans et le prix d'un projet voisin avec son idée.
- Un visiteur au Madagascar choisit **Ar MGA** dans la barre de navigation pour lire les prix en
  ariary.

## Points d'attention / limites actuelles

- Les réalisations affichées sont des **données d'exemple** : les noms, les descriptions, les délais
  et les prix ne sont pas modifiables depuis le back-office.
- Les captures d'écran sont remplacées par une zone rayée portant la mention « Capture d'écran du
  produit » : aucune image n'est encore fournie.
- Les prix convertis en dollars ou en ariary sont indicatifs : seul le prix en euros fait foi, et
  l'ariary est arrondi au millier.
