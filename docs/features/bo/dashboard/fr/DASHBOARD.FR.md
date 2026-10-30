# Cas d'utilisation — Accueil et navigation du back-office

## Table des matières

- [Où trouver cette page](#où-trouver-cette-page)
- [À quoi sert cette page](#à-quoi-sert-cette-page)
- [Qui peut l'utiliser](#qui-peut-lutiliser)
- [Ce que l'on voit à l'écran](#ce-que-lon-voit-à-lécran)
  - [Le tableau de bord](#le-tableau-de-bord)
  - [Le menu de gauche](#le-menu-de-gauche)
  - [La barre du haut](#la-barre-du-haut)
- [Actions possibles](#actions-possibles)
- [Cas d'utilisation typiques](#cas-dutilisation-typiques)
- [Points d'attention / limites actuelles](#points-dattention--limites-actuelles)

## Où trouver cette page

C'est la première page affichée après la connexion. On y revient avec l'entrée **Tableau de bord** du menu
de gauche, ou en cliquant sur le logo.

## À quoi sert cette page

Le tableau de bord donne en un coup d'œil l'état du site : des chiffres clés, ce qui demande une action et
l'activité récente. Autour de lui, le menu de gauche et la barre du haut donnent accès à toutes les
rubriques du back-office.

## Qui peut l'utiliser

Tout compte qui possède au moins un poste. Une personne sans aucun poste est renvoyée vers la
déconnexion. Ce que chacun voit dépend des droits de ses postes (page **Droits**) : une rubrique dont le
droit « Lister » manque n'apparaît pas dans le menu. Les comptes aux postes **Owner** et **Super Admin**
voient tout. Le tableau de bord n'affiche que les blocs que le poste a le droit de lire ; une phrase
précise alors que certaines informations ne sont pas affichées pour ce poste, et un poste qui ne peut rien
lire voit un message avec des liens vers les pages qui lui sont ouvertes.

## Ce que l'on voit à l'écran

### Le tableau de bord

De haut en bas :

1. **Chiffres clés** : nombre d'utilisateurs (avec les nouveaux de la semaine), revenus du mois et nombre de
   transactions, et nombre de **projets actifs**.
2. **Alertes** : les **paiements échoués** et les **signalements en cours** les plus récents, avec un lien
   « Voir tous… » vers la liste correspondante.
3. **Activité récente** : les **nouveaux utilisateurs** et les **derniers projets**.

Le bouton **Actualiser** relit les chiffres ; l'heure de la dernière mise à jour est indiquée à côté. En cas
d'échec de chargement, une carte propose de réessayer.

### Le menu de gauche

Les entrées sont regroupées ; un groupe sans aucune entrée autorisée n'apparaît pas :

- **Opérations** : **Tableau de bord**, **Projets**.
- **Communauté** : **Utilisateurs**, **Contacts**, **Signalements**, **Notifications**, **Diffusion**,
  **Paiements**.
- **Analytique** : **Statistiques** (droit « statistiques »).
- **Finance** : **Finance** (droit « finance »).
- **Contenu** : **Articles**, **Pages**, **Catégories**.
- **Administration** : **Droits** (appelée « Postes » dans l'écran), **Paramètres**, **Divers**.

Des pastilles de nombre signalent les éléments nouveaux (utilisateurs, contacts, signalements, notifications,
paiements, etc.). Le bouton à trois barres réduit le menu à ses icônes ou le déploie. Sur téléphone, le menu
occupe tout l'écran et se referme après un choix.

### La barre du haut

- Un **fil d'Ariane** qui indique le groupe et la page en cours, et un bouton pour réduire le menu.
- Un sélecteur de **pays / devise**, affiché seulement quand plusieurs pays sont disponibles.
- Une **recherche globale** : à partir de deux lettres, elle cherche dans les articles, catégories, pages,
  contacts, utilisateurs et projets, et ouvre l'élément choisi.
- Une **cloche de notifications** : elle résume ce qui est nouveau (messages de contact, nouveaux
  utilisateurs, signalements, paiements, paiements échoués) avec un lien vers chaque liste, et un compteur
  d'alertes SOS non résolues quand il y en a.
- Le **menu du profil** : **Mon profil**, **À propos** (nom de l'application, version, environnement) et
  **Déconnexion**.

## Actions possibles

- Cliquer sur une ligne d'alerte ou d'activité, ou sur un lien « Voir tous… », pour ouvrir l'élément ou la
  liste.
- Actualiser les chiffres.
- Naviguer avec le menu, la recherche globale ou la cloche.
- Réduire ou déployer le menu.
- Ouvrir son profil, la page À propos, ou se déconnecter.

## Cas d'utilisation typiques

1. **Voir combien de projets sont en ligne** : carte « Projets actifs ».
2. **Traiter ce qui est nouveau** : cloche de la barre du haut, puis la liste concernée.
3. **Retrouver un élément rapidement** : recherche globale.
4. **Naviguer sur téléphone** : bouton à trois barres, choix de la rubrique.

## Points d'attention / limites actuelles

- Les cartes « revenus du mois », « paiements échoués » et « signalements » viennent d'un socle conçu pour
  une plateforme de paiement : sur un portfolio sans paiements, elles restent à zéro ou vides.
- La colonne des **derniers projets** n'apparaît pas pour l'instant : l'information n'est pas fournie par
  le serveur.
- La cloche peut mentionner des alertes SOS, un vocabulaire hérité d'une autre application et sans
  objet ici.
- La recherche globale sur les projets n'a pas été vérifiée de bout en bout.
