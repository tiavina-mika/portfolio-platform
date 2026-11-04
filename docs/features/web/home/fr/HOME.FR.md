# Cas d'utilisation — Site public (Accueil)

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

C'est la page d'arrivée du site : l'adresse de base du site, ou le lien **"Accueil"** du menu de
navigation, ou le logo en haut à gauche de n'importe quelle page. Le site existe en français et en
anglais : la page s'ouvre dans la langue choisie par le visiteur (voir
[Navigation, pied de page, langue et thème](../../navigation/fr/NAVIGATION_AND_FOOTER.FR.md)).

## À quoi sert cette page

Elle présente le propriétaire du portfolio — un développeur Full Stack basé à Madagascar — et donne,
sur une seule page, un aperçu de tout le site : ce qu'il propose, ses derniers projets, un moyen de
le contacter, ses derniers articles et l'inscription à la newsletter. Un visiteur pressé y trouve
l'essentiel sans avoir à fouiller le site.

## Qui peut l'utiliser

Tout visiteur, sans connexion ni compte.

## Ce que l'on voit à l'écran

De haut en bas, la page enchaîne les blocs suivants :

1. **L'en-tête de présentation** : le nom du propriétaire en grand titre, un texte de présentation
   (rédigé dans le back-office, dans chaque langue), une grande image d'illustration (une version
   pour le thème clair et une pour le thème sombre) et le bouton **"Télécharger mon CV"**.
2. **"Pourquoi moi ?"** : quatre cartes avec une icône, un titre et un court texte :
   monter un projet de A à Z, renforcer, intégrer ou diriger une équipe, potentiel CTO d'une startup,
   tarifs concurrentiels. Ce contenu est le même pour tous les visiteurs d'une langue donnée ; il ne
   se modifie pas dans le back-office.
3. **"Projets développés récemment"** : le nombre total de projets entre parenthèses, une phrase de
   présentation, puis les cartes des derniers projets (jusqu'à 16). Chaque carte montre l'image, le
   nom, une courte description et un bouton **"Voir plus"**. Si d'autres projets existent, un bouton
   **"Voir N autres projets"** mène à la liste complète.
4. **"Discutons ensemble"** : une invitation à écrire, le formulaire de contact (email, nom, message)
   et, dessous, les icônes des réseaux et moyens de contact du propriétaire.
5. **"Articles"** : les trois derniers articles publiés, avec un lien **"Voir tout"** vers la liste
   des articles.
6. **"S'abonner à ma newsletter"** : une zone avec un champ email et un bouton **"S'abonner"**.

Pendant le chargement, des zones grisées remplacent les projets, les articles et le texte de
présentation.

## Actions possibles

### Télécharger le CV

Le bouton télécharge le CV au format PDF sur l'appareil du visiteur. Le même bouton est présent dans
la barre de navigation sur les autres pages. Il n'apparaît que si un CV a été ajouté dans le
back-office.

### Ouvrir un projet ou un article

Un clic sur une carte ouvre la page de détail (voir
[Détail d'un projet](../../projects/fr/PROJECT_DETAIL.FR.md) et
[Lire un article](../../blog/fr/ARTICLE.FR.md)).

### Envoyer un message ou s'abonner à la newsletter

Voir [Contact](../../contact/fr/CONTACT.FR.md) et
[Inscription à la newsletter](../../newsletter/fr/NEWSLETTER_SUBSCRIBE.FR.md).

## Cas d'utilisation typiques

1. **Un recruteur** arrive sur le site, lit la présentation et télécharge le CV en un clic.
2. **Un client potentiel** parcourt les services proposés et les derniers projets, puis utilise le
   formulaire de contact sans changer de page.
3. **Un confrère** consulte les derniers articles et s'abonne à la newsletter pour les recevoir.
4. **Un visiteur anglophone** bascule la langue en bas de page pour lire tout le site en anglais.

## Points d'attention / limites actuelles

- Les blocs **projets** et **articles** disparaissent d'eux-mêmes tant qu'il n'y a aucun projet ou
  aucun article actif : la page ne montre alors pas de bloc vide.
- La présentation et l'image d'accueil viennent du back-office ; si elles ne sont pas
  renseignées pour une langue, la zone correspondante reste vide.
- Le texte "Pourquoi moi ?" n'est pas modifiable depuis le back-office.
- Sur la page d'accueil, le bouton "Télécharger CV" de la barre de navigation est masqué, car le
  bouton de l'en-tête joue déjà ce rôle.
