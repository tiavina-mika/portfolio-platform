# Cas d'utilisation — Site Aldaron (Navigation, pied de page, langue, thème et devise)

## Table des matières

- [Où trouver cette page](#où-trouver-cette-page)
- [À quoi sert cette page](#à-quoi-sert-cette-page)
- [Qui peut l'utiliser](#qui-peut-lutiliser)
- [Ce que l'on voit à l'écran](#ce-que-lon-voit-à-lécran)
  - [Barre de navigation sur grand écran](#barre-de-navigation-sur-grand-écran)
  - [Barre de navigation sur téléphone et tablette](#barre-de-navigation-sur-téléphone-et-tablette)
  - [Pied de page](#pied-de-page)
- [Actions possibles](#actions-possibles)
- [Cas d'utilisation typiques](#cas-dutilisation-typiques)
- [Points d'attention / limites actuelles](#points-dattention--limites-actuelles)

---

## Où trouver cette page

Il ne s'agit pas d'une page mais d'éléments présents sur **toutes les pages** du site : la barre de
navigation en haut et le pied de page en bas.

## À quoi sert cette page

Elle permet de circuler entre les pages, de demander une estimation de prix, de changer la langue du
site (français, anglais ou malgache), de choisir un thème clair ou sombre et de choisir la devise dans
laquelle les prix sont affichés.

## Qui peut l'utiliser

Tout visiteur, sans connexion ni compte.

## Ce que l'on voit à l'écran

### Barre de navigation sur grand écran

De gauche à droite :

- le **logo**, qui ramène à l'accueil ;
- les liens : **Offre et prix**, **Simulateur**, **Réalisations**, **À propos**, **Contact**. La page où
  l'on se trouve est soulignée en orange ;
- le bouton **"Estimer mon prix"**, qui ouvre le simulateur ;
- le sélecteur de **devise** : euro, dollar ou ariary ;
- un bouton rond **soleil / lune** pour changer de thème.

### Barre de navigation sur téléphone et tablette

Une barre plus fine avec le logo, la devise, le thème et un bouton **"Menu"**. Ce bouton ouvre un
panneau sous la barre avec la liste des mêmes liens ; il devient **"Fermer"** tant qu'il est ouvert, et
la touche Échap le referme. Un clic sur un lien referme aussi le panneau. Sur un très petit écran, le
bouton "Estimer mon prix" disparaît de la barre : le simulateur reste dans le menu.

### Pied de page

- Le **logo**, une phrase de présentation et les icônes des réseaux : LinkedIn, Facebook, YouTube.
- La colonne **Navigation** : les mêmes liens que la barre.
- La colonne **Contact** : l'adresse e-mail et le lien **"Demander un devis ferme"**.
- Tout en bas : la mention du droit d'auteur, les liens **Mentions légales** et **Confidentialité**, et
  les boutons de langue **FR**, **EN** et **MG**.

## Actions possibles

- Aller sur une page en cliquant sur son lien.
- **Changer de langue** : la page reste la même, dans la langue choisie (les adresses sont traduites).
- **Changer de thème** : clair ou sombre. Au premier passage, le thème clair s'affiche.
- **Changer de devise** : tous les prix du site, simulateur compris, se recalculent à partir du prix en
  euros. Le choix est mémorisé sur l'appareil.
- Cliquer sur une icône de réseau : le réseau s'ouvre dans un nouvel onglet.

## Cas d'utilisation typiques

- Un fondateur à Madagascar passe les prix en ariary pour comparer avec son budget.
- Une personne lit le site en malgache : elle choisit **MG** en bas de page et reste sur la même page.
- Un visiteur sur téléphone ouvre le **Menu**, choisit **Simulateur**, et le panneau se referme.

## Points d'attention / limites actuelles

- Les prix sont toujours établis en euros. Le dollar et l'ariary sont des conversions indicatives, au
  taux du jour ; le dollar est arrondi à l'unité, l'ariary au millier.
- Si le service de taux de change est injoignable, des taux de secours fixes sont utilisés : les montants
  en dollars et en ariary sont alors approximatifs. L'euro n'est jamais touché.
- Les liens des réseaux pointent pour l'instant vers les pages d'accueil de LinkedIn, Facebook et
  YouTube : les adresses des comptes d'Aldaron sont à renseigner.
- Il n'y a plus de recherche dans la barre, ni de bouton de téléchargement du CV.
