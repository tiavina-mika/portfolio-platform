# Cas d'utilisation — Site Aldaron (Simulateur de prix)

## Table des matières

- [Où trouver cette page](#où-trouver-cette-page)
- [À quoi sert cette page](#à-quoi-sert-cette-page)
- [Qui peut l'utiliser](#qui-peut-lutiliser)
- [Ce que l'on voit à l'écran](#ce-que-lon-voit-à-lécran)
- [Comment le prix est calculé](#comment-le-prix-est-calculé)
- [Actions possibles](#actions-possibles)
- [Cas d'utilisation typiques](#cas-dutilisation-typiques)
- [Points d'attention / limites actuelles](#points-dattention--limites-actuelles)

---

## Où trouver cette page

Dans le menu de navigation, au lien **« Simulateur »** (adresse `/simulateur` en français, `/simulator`
en anglais et en malgache). Elle est aussi proposée par le bouton **« Estimer mon prix »** de l'en-tête,
et par les blocs « Simulateur de prix » de l'accueil et de la page Offre et prix. Elle existe en
français, en anglais et en malgache, dans la langue choisie par le visiteur.

## À quoi sert cette page

Elle permet à un fondateur de startup d'**estimer lui-même le prix de son produit** en répondant à
quelques questions. L'estimation se met à jour à chaque réponse. Elle est indicative : le prix ferme
est fixé à la signature, après un cadrage gratuit.

## Qui peut l'utiliser

Tout visiteur, sans connexion ni compte.

## Ce que l'on voit à l'écran

En haut : le titre « Estimez le prix de votre produit » et une phrase d'explication. Dessous, quatre
**exemples en un clic** (une première version de SaaS, une application mobile de plus de 100 écrans,
une application mobile avec back-office complexe, un produit web et mobile avec paiement).

Puis deux colonnes sur grand écran (une seule colonne sur téléphone et tablette) :

**À gauche, les questions**, chacune dans une carte numérotée :

1. **Qu'apportez-vous ?** Une idée, un cahier des charges ou une maquette. Un encart rappelle le prix
   des maquettes par écran (aucun frais si le visiteur apporte la sienne).
2. **Quels supports ?** Site web statique, application web, mobile, back-office (un ou plusieurs). Une
   courte description de chaque support choisi s'affiche dessous.
3. **Une carte par support choisi** (site web, application web, mobile, back-office), dans cet ordre. Chacune
   demande le **nombre d'écrans** (approximatif), avec un curseur et une case numérique qui se suivent.
   - Application web : le visiteur dit si l'interface est **simple ou riche** (tableaux, filtres, tableaux
     de bord, rôles, éditeur), et peut ajouter le **paiement en ligne**.
   - Mobile : option **discussion instantanée** et option **paiement en ligne**.
   - Pour le paiement en ligne, le visiteur indique le **nombre d'intégrations** (de 1 à 5) : la première
     est comprise dans le prix de l'option, chaque suivante coûte un supplément.
4. **Maintenance optionnelle** : une case à cocher (150 à 400 € par mois, après les 30 jours de
   correction de bugs).

Les cartes des supports non choisis ne s'affichent pas, et la numérotation suit les cartes visibles.

**À droite, « Votre estimation »** (elle reste visible quand on fait défiler la page) :

- le **prix** en grand : un montant, « À partir de … » tant que rien ne dépasse le minimum de commande,
  ou « Projet d'envergure : parlons-en » au-delà d'un plafond ;
- une phrase de précision (« Première estimation, à affiner ensemble » si le visiteur n'a qu'une idée) ;
- le **détail par ligne** (supports, maquettes, options, complément au minimum de commande) ;
- **Ce qui est compris**, **Ce qui n'est pas compris** et **comment le prix est payé** (3 échéances) ;
- deux boutons : **« Demander un devis ferme (cadrage gratuit) »** et **« Copier mon récapitulatif »**.

Sur téléphone et tablette, une **barre fixée en bas de l'écran** affiche le prix et le bouton « Demander
un devis ferme », puisque l'estimation est alors plus haut dans la page.

## Comment le prix est calculé

- Chaque écran a un prix : 25 € pour un site web ou un écran mobile, 18 € pour une application web
  simple (30 € si l'interface est riche), 37,50 € pour un écran de back-office. Quand une application web
  et une application mobile sont demandées ensemble, l'application web coûte la moyenne des deux tarifs.
- Les montants de chaque ligne sont arrondis à la centaine.
- Les **maquettes** coûtent 8 € par écran si le visiteur n'a qu'une idée, 6 € s'il a un cahier des
  charges, rien s'il a déjà une maquette.
- Il y a un **minimum de commande** : 1 500 € pour le web, 2 500 € dès qu'il y a du mobile. Un
  back-office seul n'a pas de minimum, mais il est compté pour au moins 15 écrans.
- Les options s'ajoutent : paiement en ligne (500 € la première intégration, 22 € chacune de plus), discussion
  instantanée (500 €).
- L'exemple « Application mobile avec back-office complexe » applique en plus une complexité métier
  « très orientée métier », qui augmente le prix des écrans. Ce réglage n'est pas proposé séparément :
  seuls les exemples en un clic l'appliquent, et il apparaît alors dans le récapitulatif.
- Au-delà de 15 000 € d'écrans (10 000 € pour une interface web riche), la page n'affiche plus de prix :
  le projet se discute.

## Actions possibles

- **Choisir un exemple** : toutes les réponses se remplissent d'un coup. Choisir à nouveau l'exemple
  actif remet le simulateur à son état de départ.
- **Répondre aux questions** : à chaque changement, le prix et le détail se mettent à jour.
- **Demander un devis ferme** : mémorise l'estimation dans le navigateur du visiteur et ouvre la page
  **Contact**, dont le formulaire de demande de devis part de ce récapitulatif.
- **Copier mon récapitulatif** : copie dans le presse-papiers un texte qui résume les réponses
  (ce que le visiteur apporte, les supports et leur nombre d'écrans, les options), puis affiche
  « Récapitulatif copié. ».
- **Changer de devise** : le sélecteur de l'en-tête (euro par défaut, dollar, ariary) convertit tous les
  prix affichés. Le récapitulatif copié ou envoyé au formulaire reste toujours en euros.

## Cas d'utilisation typiques

- **Un fondateur compare plusieurs périmètres** : il coche d'abord le web seul, puis ajoute le mobile,
  et voit le prix évoluer.
- **Un visiteur part d'un exemple** proche de son projet, puis ajuste le nombre d'écrans.
- **Un visiteur prêt à avancer** demande un devis ferme : il arrive sur le formulaire de contact avec son
  récapitulatif déjà rempli.
- **Un visiteur sur téléphone** garde le prix et le bouton de devis sous les yeux grâce à la barre du bas.

## Points d'attention / limites actuelles

- L'estimation est **indicative** : elle ne remplace pas le devis ferme, établi après cadrage.
- Les réponses ne sont pas conservées d'une visite à l'autre : le simulateur repart de son état de
  départ (application mobile de 100 écrans avec cahier des charges) à chaque ouverture de la page.
- Les taux de change (dollar, ariary) sont récupérés sur un service gratuit et gardés 12 heures dans le
  navigateur ; si le service ne répond pas, des taux de secours sont utilisés. Le prix en dollar est arrondi
  à l'unité, le prix en ariary au millier.
- Le récapitulatif mémorisé pour le formulaire de contact reste dans le navigateur ; il n'est lu que par
  la page Contact.
