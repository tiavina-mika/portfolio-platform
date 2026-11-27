# Cas d'utilisation — Site Aldaron (Accueil)

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

C'est la page d'arrivée du site : l'adresse de base du site, ou le logo Aldaron en haut à gauche de
n'importe quelle page. Le site existe en français, en anglais et en malgache : la page s'ouvre dans la
langue choisie par le visiteur, qui peut en changer avec les boutons **FR**, **EN** et **MG** du bas de
page.

## À quoi sert cette page

Elle explique en une page ce que fait Aldaron — du développement web et mobile pour des startups, **à
prix fixe, écran par écran** — et ce que cela coûte. Un visiteur pressé y trouve l'essentiel : ce qui
est construit, ce qui est compris dans le prix, comment se déroule un projet, des exemples de produits
livrés, puis un accès direct au simulateur de prix et à la demande de devis.

## Qui peut l'utiliser

Tout visiteur, sans connexion ni compte.

## Ce que l'on voit à l'écran

De haut en bas, la page enchaîne les blocs suivants :

1. **L'en-tête** : le titre « Votre produit, à prix fixe, écran par écran. », une phrase d'explication,
   deux boutons (**Estimer mon prix** et **Voir l'offre et les prix**) et trois rappels : le prix
   d'entrée (à partir de 1 500 €), le prix fixé à la signature et 30 jours de correction de bugs.
2. **Ce que nous construisons** : quatre cartes — site web statique, application web, application mobile
   et back-office — chacune avec une courte description et son prix par écran. Une note rappelle le
   minimum de commande : 1 500 € pour le web, 2 000 € dès qu'il y a du mobile.
3. **Ce qui est compris** : deux cartes côte à côte. L'une (sombre) liste ce qui est compris dans chaque
   projet ; l'autre ce qui reste à la charge du client (hébergement, services tiers, comptes des
   boutiques d'applications, maintenance optionnelle).
4. **Déroulé** : quatre étapes numérotées — cadrage gratuit, signature, démonstration, mise en ligne —
   avec la part du prix payée à chacune (40 %, 30 %, 30 %).
5. **Réalisations** : trois exemples de produits livrés, avec ce qu'ils contiennent (mobile, web,
   back-office), leur délai en semaines et leur prix.
6. **Simulateur de prix** : un bandeau sombre qui invite à estimer le prix de son produit.
7. **Parlons de votre produit** : un dernier encart pour demander un devis ferme.

Tous les prix sont écrits en euros. Le sélecteur de devise en haut de page permet de les voir en dollars
ou en ariary : les montants sont alors convertis au taux du jour (arrondis au dollar ou au millier
d'ariary). Le choix est mémorisé pour les visites suivantes.

## Actions possibles

- **Estimer mon prix** (en-tête) et **Ouvrir le simulateur** (bandeau sombre) : ouvrent la page du
  simulateur de prix.
- **Voir l'offre et les prix** : ouvre la page « Offre et prix ».
- **Voir toutes les réalisations** : ouvre la page « Réalisations ».
- **Demander un devis ferme** : ouvre la page « Contact ».
- Changer de langue, de thème (clair ou sombre) ou de devise avec les commandes du haut et du bas de
  page.

## Cas d'utilisation typiques

- Un fondateur de startup découvre Aldaron : il lit l'en-tête, vérifie le prix d'entrée et ce qui est
  compris, puis ouvre le simulateur pour estimer son produit.
- Un visiteur à Madagascar passe les prix en ariary pour comparer avec son budget.
- Un visiteur déjà convaincu va directement à la demande de devis depuis l'encart final.

## Points d'attention / limites actuelles

- Les exemples de réalisations affichent pour l'instant une image de remplacement à la place d'une
  vraie capture d'écran.
- Les prix convertis en dollars ou en ariary sont indicatifs : seul le prix en euros fait foi. Si le
  taux du jour ne peut pas être obtenu, un taux de repli est utilisé.
- Les contenus de la page (textes, prix, exemples) sont fixes : ils ne se modifient pas depuis le
  back-office.
