# Cas d'utilisation — Paramètres

## Table des matières

- [Où trouver cette page](#où-trouver-cette-page)
- [À quoi sert cette page](#à-quoi-sert-cette-page)
- [Qui peut l'utiliser](#qui-peut-lutiliser)
- [Ce que l'on voit à l'écran](#ce-que-lon-voit-à-lécran)
- [Actions possibles](#actions-possibles)
  - [Changer la langue du back-office](#changer-la-langue-du-back-office)
  - [Changer le thème, la couleur et le menu](#changer-le-thème-la-couleur-et-le-menu)
  - [Modifier les textes du site](#modifier-les-textes-du-site)
  - [Modifier les images principales du site](#modifier-les-images-principales-du-site)
- [Cas d'utilisation typiques](#cas-dutilisation-typiques)
- [Points d'attention / limites actuelles](#points-dattention--limites-actuelles)

## Où trouver cette page

Menu de gauche → groupe **Administration** → **Paramètres**. Adresse : `/parametres`.

## À quoi sert cette page

Elle regroupe les réglages de l'application : la langue et l'apparence du back-office, et les textes et
images principaux du site public.

## Qui peut l'utiliser

| Qui | Ce qu'il peut faire |
|---|---|
| Owner et Super Admin | Voir l'entrée **Paramètres** dans le menu et utiliser toute la page |
| Autres postes | L'entrée n'apparaît pas dans leur menu |

## Ce que l'on voit à l'écran

Un volet de navigation à gauche (sur petit écran, il passe au-dessus) avec deux groupes :

- **Back office** : **Langues** (section ouverte par défaut) et **Apparence** ;
- **Site web** : **Détails** et **Images**.

À droite, la section choisie. L'en-tête de la page indique, pour les sections du site web, si des
modifications ne sont pas encore enregistrées, et porte le bouton **Enregistrer**. Le choix de la section
est conservé dans l'adresse de la page.

## Actions possibles

### Changer la langue du back-office

Section **Langues** : choisir la langue d'affichage (français, anglais ou malgache). L'interface change
aussitôt ; il n'y a rien à enregistrer. Ce choix est mémorisé sur l'appareil et le navigateur utilisés.

### Changer le thème, la couleur et le menu

Section **Apparence**, avec application immédiate et sans bouton d'enregistrement :

- le **mode** : jour ou sombre ;
- les **couleurs du thème** : une rangée de pastilles de couleur ;
- le **style du menu latéral** : marine, noir, blanc ou couleur du thème (le style blanc ne s'applique qu'en
  mode jour ; en mode sombre le style marine est utilisé).

### Modifier les textes du site

Section **Détails** : un onglet par langue (français, anglais, malgache). Pour chaque langue, un **titre**,
une **description** (texte mis en forme : gras, italique, souligné, lien, listes, citation) et une
**citation** affichée en bas du site, sous le logo. Le français est obligatoire, les autres langues sont
facultatives. Le bouton **Enregistrer** de l'en-tête valide ; le message « Sauvegardé avec succès » confirme.

### Modifier les images principales du site

Section **Images** : une **image pour le mode jour** et une **image pour le mode nuit**, affichées en haut
de la page d'accueil du site. Le bouton **Enregistrer** de l'en-tête valide.

## Cas d'utilisation typiques

1. **Passer le back-office en anglais ou en malgache** pour un collaborateur.
2. **Changer la citation du pied de page** dans les trois langues.
3. **Remplacer l'image d'accueil**, avec une version adaptée au mode nuit.
4. **Choisir un menu plus sombre** ou aux couleurs du thème.

## Points d'attention / limites actuelles

- La **langue, le thème, la couleur et le style du menu** sont propres à l'appareil et au navigateur : ils
  ne suivent pas le compte d'un appareil à un autre.
- Les textes et images du site sont **uniques pour tout le site** : il n'existe qu'un seul jeu de réglages,
  partagé par tous.
- Le dépôt du CV, qui existait avant l'adoption du nouveau back-office, n'est plus proposé ici.
