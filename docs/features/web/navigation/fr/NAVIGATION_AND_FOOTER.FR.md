# Cas d'utilisation — Site public (Navigation, pied de page, langue et thème)

## Table des matières

- [Où trouver cette page](#où-trouver-cette-page)
- [À quoi sert cette page](#à-quoi-sert-cette-page)
- [Qui peut l'utiliser](#qui-peut-lutiliser)
- [Ce que l'on voit à l'écran](#ce-que-lon-voit-à-lécran)
  - [Barre de navigation sur grand écran](#barre-de-navigation-sur-grand-écran)
  - [Barre de navigation sur téléphone et tablette](#barre-de-navigation-sur-téléphone-et-tablette)
  - [Pied de page](#pied-de-page)
- [Rechercher / filtrer](#rechercher--filtrer)
- [Actions possibles](#actions-possibles)
- [Cas d'utilisation typiques](#cas-dutilisation-typiques)
- [Points d'attention / limites actuelles](#points-dattention--limites-actuelles)

---

## Où trouver cette page

Il ne s'agit pas d'une page mais d'éléments présents sur **toutes les pages** du site : la barre de
navigation en haut et le pied de page en bas.

## À quoi sert cette page

Elle permet de circuler entre les rubriques, de chercher un contenu, de télécharger le CV, de joindre
le propriétaire, de changer la langue du site (français ou anglais) et de choisir un thème clair ou
sombre.

## Qui peut l'utiliser

Tout visiteur, sans connexion ni compte.

## Ce que l'on voit à l'écran

### Barre de navigation sur grand écran

De gauche à droite :

- le **logo**, qui ramène à l'accueil ;
- une **zone de recherche** ;
- les liens du menu : **Accueil**, **Projets**, **Articles**, **Me contacter**, puis les pages de
  contenu que le propriétaire a placées dans le menu ([Pages de contenu](../../pages/fr/PAGES_CONTENT.FR.md)).
  Sur les écrans moyens, "Accueil" est masqué (le logo joue ce rôle) ;
- le bouton **"Télécharger CV"**, sauf sur la page d'accueil qui a déjà le sien, et seulement si un
  CV a été ajouté dans le back-office ;
- un bouton rond **soleil / lune** pour changer de thème.

### Barre de navigation sur téléphone et tablette

Une barre plus fine avec le logo, une loupe (ouvre la recherche), une icône de téléchargement du CV
et un bouton "hamburger". Ce dernier ouvre un menu plein écran : la liste des mêmes liens, le bouton
de changement de thème et les icônes des réseaux du propriétaire. Un clic sur un lien referme le
menu.

### Pied de page

- Le **logo**, une **citation** du propriétaire (rédigée dans le back-office dans chaque langue) et
  les icônes des réseaux : LinkedIn, WhatsApp, Instagram, email, Skype, YouTube.
- La colonne **"Plus d'information"** : "Contactez-moi", "Mes projets", "Plan du site", puis les pages
  de contenu placées dans le pied de page.
- La colonne **"Contact"** : l'adresse postale (Antananarivo, Madagascar) et l'adresse email.
- En bas, la mention de droits réservés avec l'année en cours et le **sélecteur de langue**
  (Français / Anglais).

## Rechercher / filtrer

La zone de recherche de la barre de navigation cherche dans les **articles** et les **projets**.

- Elle se lance après une courte pause dans la frappe (environ une seconde), à partir de **4 caractères**.
- Les résultats sont listés sous le champ (jusqu'à 10 articles et 10 projets), les articles d'abord.
- La recherche porte sur le titre, les mots-clés, la description et le contenu (et, pour les
  projets, le nom et la société), dans les deux langues du site.
- Si rien ne correspond, la mention **"Aucun résultat"** apparaît.
- Un clic sur un résultat ouvre la page et referme la liste.

## Actions possibles

### Changer de langue

Le sélecteur du pied de page bascule le site entre français et anglais. Le visiteur reste sur la même
page, dont l'adresse est traduite (par exemple `/projets` devient `/projects`). Le français est la
langue par défaut.

### Changer de thème

Le bouton soleil / lune bascule entre thème clair et thème sombre. Le site s'ouvre en thème clair.

### Télécharger le CV

Le bouton de la barre de navigation télécharge le CV au format PDF.

### Naviguer

Les liens du menu et du pied de page ouvrent les rubriques correspondantes.

## Cas d'utilisation typiques

1. **Un visiteur** tape le nom d'une technologie dans la recherche pour retrouver un projet ou un
   article.
2. **Un lecteur de nuit** passe en thème sombre.
3. **Un visiteur anglophone** change la langue depuis le pied de page.
4. **Un recruteur sur téléphone** ouvre le menu et télécharge le CV avec l'icône dédiée.
5. **Un visiteur** consulte la politique de confidentialité depuis le pied de page.

## Points d'attention / limites actuelles

- Le sélecteur de langue n'existe que dans le **pied de page** ; il n'est pas dans la barre du haut ni
  dans le menu mobile.
- Le lien "Mes projets" du pied de page ramène à la page d'accueil, pas à la liste des projets.
- La recherche n'affiche rien en dessous de 4 caractères.
- Les pages de contenu n'apparaissent dans le menu ou le pied de page que si elles sont actives et
  configurées pour (voir [Pages de contenu](../../pages/fr/PAGES_CONTENT.FR.md)).
