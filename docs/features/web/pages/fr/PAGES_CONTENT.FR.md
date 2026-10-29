# Cas d'utilisation — Site public (Pages de contenu)

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

Ces pages n'ont pas d'adresse fixe : chacune est créée dans le back-office (section "Pages et
sections") et obtient son propre lien, du type `/a-propos`, directement après la langue. Selon la
configuration choisie dans le back-office, une page apparaît :

- dans le **menu de navigation** du haut (après "Me contacter") ;
- ou dans le **pied de page**, sous "Plus d'information" ;
- et, dans tous les cas où elle est active, dans le [plan du site](../../sitemap/fr/SITEMAP.FR.md).

## À quoi sert cette page

Elle permet de publier du contenu éditorial libre qui n'est ni un projet ni un article : une page "À
propos", une politique de confidentialité, des conditions d'utilisation, une page de services... Le
propriétaire les crée et les modifie sans intervention d'un développeur.

## Qui peut l'utiliser

Tout visiteur, sans connexion ni compte. La création et la modification se font dans le back-office
par les personnes autorisées.

## Ce que l'on voit à l'écran

- Un **en-tête** avec le titre de la page, une image de bannière (si elle est renseignée) et un texte
  de présentation.
- Le **contenu principal** : texte mis en forme avec titres, listes et extraits de code.
- Éventuellement une zone de **sections** : un titre général et un texte d'introduction, puis une suite
  de sections. Chaque section a un titre, un texte, un contenu détaillé et une image, placée à gauche,
  à droite ou en dessous du texte selon le choix fait dans le back-office.

Le lien de la page, son titre et tous ses textes existent dans chaque langue du site et s'affichent
dans celle du visiteur. Dans le menu, l'intitulé de la page commence par une majuscule.

## Actions possibles

La page se lit simplement. Elle peut contenir des liens vers d'autres pages ou des sites extérieurs,
selon ce que le propriétaire a rédigé.

## Cas d'utilisation typiques

1. **Un visiteur** ouvre la page "À propos" depuis le menu pour mieux connaître le propriétaire.
2. **Un visiteur** consulte la politique de confidentialité depuis le pied de page avant de remplir le
   formulaire de contact.
3. **Un client potentiel** lit une page de présentation des services, découpée en sections illustrées.
4. **Le propriétaire** ajoute une nouvelle page dans le back-office : elle apparaît dans le menu ou le
   pied de page sans autre intervention.

## Points d'attention / limites actuelles

- Une page qui n'est pas active n'apparaît ni dans le menu, ni dans le pied de page, ni dans le plan
  du site.
- Une page sans adresse définie dans la langue du visiteur affiche la page "Page introuvable"
  ([Pages d'erreur](../../errors/fr/ERROR_PAGES.FR.md)).
- Une page dont aucune position (menu ou pied de page) n'est cochée n'est pas proposée dans la
  navigation, mais reste accessible par son adresse directe. Une page désactivée ou supprimée dans le
  back-office n'est plus accessible, même par son adresse.
- Les adresses des pages sont directement après la langue : elles ne doivent pas reprendre le nom d'une
  rubrique existante (projets, articles, contact, plan du site).
