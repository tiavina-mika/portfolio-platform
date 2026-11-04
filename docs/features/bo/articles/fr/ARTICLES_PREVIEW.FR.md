# Cas d'utilisation — Articles (Aperçu)

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

Depuis la liste des articles, action **Voir l'aperçu** du menu « ... » d'une ligne. Adresse :
`/articles/<identifiant>`. On y arrive aussi automatiquement après l'enregistrement d'un article.

## À quoi sert cette page

C'est la fiche en lecture seule d'un article : on y relit tout ce qui a été saisi, langue par langue, et on
voit qui l'a créé, qui l'a modifié et combien de fois il a été partagé.

## Qui peut l'utiliser

Le droit **Consulter** sur la ressource « Article » (page **Droits**) est nécessaire pour ouvrir la page ;
sans lui, elle s'affiche comme « introuvable ». Les comptes Owner et Super Admin l'ont toujours.

## Ce que l'on voit à l'écran

Le titre de la page est « Article - » suivi du titre de l'article. Sous le titre, des **onglets de langue**
(français, anglais, malgache) changent la langue des textes affichés.

Colonne de gauche :

- **Détails** : titre, description, catégories (chacune est un lien vers la liste des articles de cette
  catégorie), dates de création et de modification.
- **SEO** : adresse de l'article sur le site public, tags, meta titre et meta description.
- **Contenu de l'article** : le texte mis en forme.
- Les **images** de l'article.

Colonne de droite :

- **Créé par** : l'auteur de l'article.
- **Status** : une ligne « Supprimé » et une ligne « Actif », chacune avec une coche ou une croix.
- **Partage** : le nombre de partages par réseau social, puis le total.

En bas de page, des cartes **Modifié par** (dernière personne ayant modifié l'article) apparaissent
lorsque l'information existe.

## Actions possibles

Le bouton **Actions** en haut de la page ouvre un menu :

- **Modifier** : ouvre le formulaire de modification.
- **Voir le site web** : ouvre l'article sur le site public, dans un nouvel onglet.
- **Retourner à la liste**.
- **Ajouter** : ouvre le formulaire de création d'un nouvel article.
- **Supprimer** : après confirmation, met l'article à la corbeille et revient à la liste.

## Cas d'utilisation typiques

1. **Relire un article** après l'avoir enregistré.
2. **Vérifier une traduction** en passant d'un onglet de langue à l'autre.
3. **Connaître l'auteur** ou le dernier éditeur d'un article.
4. **Suivre la diffusion** d'un article grâce au nombre de partages.
5. **Retrouver les articles de la même catégorie** en cliquant sur le nom de la catégorie.

## Points d'attention / limites actuelles

- Le menu **Actions** affiche toutes les entrées quel que soit le poste ; une action pour laquelle le compte n'a
  pas le droit est refusée (message d'erreur ou page « introuvable »).
- L'entrée **Publier / Ne pas publier** du menu active ou désactive un article d'un clic (même effet que
  l'interrupteur « Actif » du formulaire) ; elle exige le droit de modification.
- Un article mis à la corbeille ne peut plus être ouvert en aperçu.
- Les compteurs de partage ne sont qu'une lecture : ils ne se modifient pas depuis cette page.
