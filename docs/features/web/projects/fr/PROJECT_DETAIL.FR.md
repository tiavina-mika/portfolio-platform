# Cas d'utilisation — Site public (Détail d'un projet)

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

En cliquant sur la carte d'un projet, depuis la page d'accueil, la
[liste des projets](PROJECTS_LIST.FR.md), le plan du site ou les résultats de la recherche. L'adresse
se termine par un identifiant lisible propre au projet (par exemple `/projets/mon-projet` en
français, `/projects/my-project` en anglais).

## À quoi sert cette page

Elle raconte un projet en détail : ce qu'il fait, pour quelle société il a été réalisé, avec quelles
technologies, avec des captures d'écran, une vidéo et des liens pour le voir en vrai ou consulter son
code.

## Qui peut l'utiliser

Tout visiteur, sans connexion ni compte. Un projet désactivé ou supprimé dans le back-office n'est
plus accessible (la page "Page introuvable" s'affiche, voir
[Pages d'erreur](../../errors/fr/ERROR_PAGES.FR.md)).

## Ce que l'on voit à l'écran

**En haut** : le titre du projet, sa description, son image principale et jusqu'à deux boutons :

- **"Visiter le site Web"**, si le projet a un site ;
- **"Voir le code source"**, si le projet a au moins un dépôt de code (le premier est proposé).

**Colonne principale (à gauche sur grand écran)** :

- **"Description du projet"** : le texte complet, avec titres, listes et extraits de code.
- **"Capture d'écran"** : les images du projet les unes sous les autres, quand il y en a.
- **"Video"** : une vidéo YouTube intégrée, quand il y en a une.

**Carte d'informations (à droite sur grand écran, sous le texte sur téléphone)** — présente seulement
si le projet a au moins un logo, une société ou des mots-clés :

- le **logo** ;
- **"Description de la société"** et **"Société"** ;
- les **plateformes** visées ;
- les **technologies** utilisées, sous forme de boutons ;
- les **mots-clés** ;
- les icônes de **partage** (Facebook, X, LinkedIn, WhatsApp, Telegram, Reddit, Skype) et, quand il y
  en a, le nombre de partages.

**En bas** : si le projet est rattaché à une société, la liste **"Autres projets de [société]"**
(jusqu'à 18 cartes), puis la zone d'abonnement à la newsletter. Les blocs vides n'apparaissent pas.

## Actions possibles

### Visiter le site ou le code du projet

Les deux boutons du haut mènent au site du projet ou à son dépôt de code.

### Voir les projets utilisant une technologie

Un clic sur une technologie ouvre la liste des projets filtrée sur cette technologie
([Liste des projets](PROJECTS_LIST.FR.md)).

### Partager le projet

Un clic sur une icône ouvre le réseau choisi dans un nouvel onglet avec l'adresse de la page prête à
être partagée. Chaque clic est comptabilisé dans le nombre de partages.

### Découvrir d'autres projets de la même société

Les cartes du bas ouvrent les autres projets réalisés pour la même société.

## Cas d'utilisation typiques

1. **Un client potentiel** regarde les captures d'écran et ouvre le site en ligne pour juger du
   résultat.
2. **Un développeur** consulte le code source du projet et les technologies employées.
3. **Un recruteur** lit la description de la société et du contexte pour comprendre le rôle tenu.
4. **Un visiteur enthousiaste** partage le projet sur LinkedIn ou WhatsApp.

## Points d'attention / limites actuelles

- Selon le contenu saisi dans le back-office, certaines parties n'apparaissent pas : pas de
  captures, pas de vidéo, pas de société, etc. C'est normal.
- Les mots-clés de la carte d'informations sont cliquables, mais le clic n'affiche pas une liste
  filtrée : il ramène à la liste complète des projets.
- Les intitulés "Platforms" et "Tags" de la carte ne sont pas traduits : ils restent en anglais
  quelle que soit la langue du site.
- Les textes du projet (titre, description, mots-clés) s'affichent dans la langue du visiteur ; si le
  projet n'est pas traduit, l'adresse en langue par défaut reste utilisable.
