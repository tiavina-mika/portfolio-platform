# Cas d'utilisation — Paramètres

## Table des matières

- [Où trouver cette page](#où-trouver-cette-page)
- [À quoi sert cette page](#à-quoi-sert-cette-page)
- [Qui peut l'utiliser](#qui-peut-lutiliser)
- [Ce que l'on voit à l'écran](#ce-que-lon-voit-à-lécran)
- [Actions possibles](#actions-possibles)
  - [Changer la langue du back-office](#changer-la-langue-du-back-office)
  - [Changer le thème et la couleur](#changer-le-thème-et-la-couleur)
  - [Déposer ou télécharger le CV](#déposer-ou-télécharger-le-cv)
  - [Modifier les textes du site](#modifier-les-textes-du-site)
  - [Modifier les images principales du site](#modifier-les-images-principales-du-site)
- [Cas d'utilisation typiques](#cas-dutilisation-typiques)
- [Points d'attention / limites actuelles](#points-dattention--limites-actuelles)

---

## Où trouver cette page

Menu de gauche → **Paramètres** (dernier groupe du menu, après **Droits**). Adresse : `/parametres`.

## À quoi sert cette page

Elle regroupe les réglages de l'application : l'apparence et la langue du back-office, le CV du
propriétaire du portfolio et les textes et images principaux du site public.

## Qui peut l'utiliser

| Qui | Ce qu'il peut faire |
|---|---|
| Propriétaire et administrateurs | Voir l'entrée **Paramètres** dans le menu et utiliser toute la page |
| Autres rôles | L'entrée n'apparaît pas dans leur menu |

## Ce que l'on voit à l'écran

Trois onglets en haut de la page :

- **Back office** (onglet ouvert par défaut) : une carte « Langues » et une carte avec le choix du thème.
- **App** : une zone pour déposer le CV au format PDF.
- **Site web** : une carte « Détails » avec les textes du site et une carte « Images ».

Le choix de l'onglet est conservé dans l'adresse de la page.

## Actions possibles

### Changer la langue du back-office

Dans l'onglet **Back office**, choisir **Français**, **Anglais** ou **Malgache** dans la liste, puis
enregistrer. Un message confirme « Paramètres sauvegardées avec succès » et l'interface change aussitôt de
langue. Ce choix est mémorisé sur l'appareil et le navigateur utilisés.

### Changer le thème et la couleur

Dans le même onglet, un interrupteur bascule entre le thème **Jour** et le thème **Sombre**, et une
rangée de pastilles propose les couleurs du thème (rouge, bleu, jaune, violet, etc.). Les changements
s'appliquent immédiatement, sans bouton d'enregistrement, et sont mémorisés sur l'appareil.

### Déposer ou télécharger le CV

Dans l'onglet **App**, déposer un fichier **PDF** de 5 Mo au maximum. Il remplace le CV précédent et un
message confirme « CV uploadé avec succès ». Le nom du fichier apparaît ensuite avec un bouton de
téléchargement. Tant qu'aucun CV n'a été déposé, la mention « Pas encore de CV » s'affiche.

### Modifier les textes du site

Dans l'onglet **Site web**, la carte « Détails » propose un onglet par langue
(français, anglais, malgache). Pour chaque langue : une **description** (texte mis en forme : gras, italique, souligné, lien,
listes, citation) et une **citation** affichée en bas du site, sous le logo. Les deux sont obligatoires en
français (2 000 caractères au maximum pour la description, 200 pour la citation) et facultatifs dans les
autres langues. Après enregistrement, le message « Sauvegardé avec
succès » s'affiche.

### Modifier les images principales du site

Toujours dans l'onglet **Site web**, la carte « Images » permet de déposer une **image pour le mode jour**
(obligatoire) et une **image pour le mode nuit** (facultative). Elles sont affichées en haut de la page
d'accueil du site. Formats acceptés : PNG, JPG, JPEG et WebP, 6 Mo au maximum chacune.

## Cas d'utilisation typiques

1. **Passer le back-office en anglais ou en malgache** pour un collaborateur.
2. **Mettre à jour le CV** à télécharger depuis le site après une nouvelle expérience.
3. **Changer la citation du pied de page** dans les trois langues.
4. **Remplacer l'image d'accueil**, avec une version adaptée au mode nuit.

## Points d'attention / limites actuelles

- La **langue, le thème et la couleur** sont propres à l'appareil et au navigateur : ils ne suivent pas le
  compte d'un appareil à un autre.
- Les textes, la citation et les images du site sont **uniques pour tout le site** : il n'existe qu'un seul
  jeu de réglages, partagé par tous les administrateurs.
- Le nom de l'onglet « App » n'est pas traduit.
- Un nouveau CV remplace l'ancien sans confirmation ni historique.
