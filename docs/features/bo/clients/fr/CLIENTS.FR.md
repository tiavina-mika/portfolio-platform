# Cas d'utilisation — Clients

## Table des matières

- [Où trouver cette page](#où-trouver-cette-page)
- [À quoi sert cette page](#à-quoi-sert-cette-page)
- [Qui peut l'utiliser](#qui-peut-lutiliser)
- [Ce que l'on voit à l'écran](#ce-que-lon-voit-à-lécran)
  - [Colonnes du tableau](#colonnes-du-tableau)
  - [Les onglets Tout, Actifs et Archivés](#les-onglets-tout-actifs-et-archivés)
- [Rechercher et filtrer](#rechercher-et-filtrer)
- [Actions possibles](#actions-possibles)
  - [Créer un client](#créer-un-client)
  - [Modifier un client](#modifier-un-client)
  - [Archiver un client ou le remettre dans la liste](#archiver-un-client-ou-le-remettre-dans-la-liste)
- [Cas d'utilisation typiques](#cas-dutilisation-typiques)
- [Points d'attention / limites actuelles](#points-dattention--limites-actuelles)

## Où trouver cette page

Menu de gauche → groupe **Opérations** → **Clients**, sous les projets. L'entrée n'apparaît que lorsque
la personne travaille dans l'espace **Aldaron** (voir [Paramètres](../../settings/fr/SETTINGS.FR.md)).
Adresse : `/clients`.

## À quoi sert cette page

C'est la liste des clients pour lesquels Aldaron travaille : des entreprises ou des particuliers. On y
ajoute un client dès le premier contact, on corrige ses coordonnées et on l'archive quand on ne
travaille plus avec lui. Un client n'est jamais supprimé : il garde ainsi l'historique qui lui sera
rattaché (devis, missions).

Les clients n'existent que dans l'espace Aldaron : rien n'en apparaît dans le portfolio ni sur les sites
publics.

## Qui peut l'utiliser

Il faut deux choses à la fois :

1. un **poste** qui ouvre l'espace **Aldaron** ;
2. le droit correspondant sur la ressource **Clients** (page **Droits**).

Une personne dont les postes n'ouvrent que le portfolio ne voit ni l'entrée de menu ni les clients, même
avec des droits sur la ressource. Si elle tape l'adresse de la page, elle revient au tableau de bord. Les
comptes Owner et Super Admin ont tous les droits et tous les espaces.

| Droit | Ce qu'il permet ici |
|---|---|
| Lister | Afficher la page et l'entrée **Clients** du menu |
| Créer | Bouton « Nouveau client » en haut de la page |
| Modifier | Actions « Modifier », « Archiver » et « Remettre dans la liste » |

Un bouton absent signifie que le compte n'a pas le droit correspondant.

## Ce que l'on voit à l'écran

### Colonnes du tableau

| Colonne | Signification |
|---|---|
| Client | Nom du client, avec son adresse e-mail en dessous |
| Type | Entreprise ou particulier |
| Téléphone | Le numéro, s'il a été renseigné |
| Créé le / Modifié le | Dates d'ajout et de dernière modification |
| Statut | Actif ou archivé |
| Actions | Menu de la ligne |

La liste affiche 20 clients par page (50 ou 75 au choix). Elle peut être triée par nom, par e-mail ou
par date.

### Les onglets Tout, Actifs et Archivés

- **Tout** : tous les clients, actifs et archivés (vue par défaut).
- **Actifs** : les clients avec lesquels on travaille.
- **Archivés** : les clients archivés, pour les retrouver ou les remettre dans la liste.

## Rechercher et filtrer

- Un champ de recherche rapide, qui cherche une partie du **nom** ou de l'**adresse e-mail**.
- Une recherche avancée pour ne garder que les **entreprises** ou que les **particuliers**.

## Actions possibles

### Créer un client

Le bouton « Nouveau client » ouvre une fenêtre avec :

- le **type** (entreprise ou particulier) ;
- le **nom** (obligatoire) : nom de l'entreprise ou nom complet ;
- l'**adresse e-mail** (obligatoire) ;
- le **téléphone**, le **numéro d'entreprise ou de TVA** et l'**adresse postale**, facultatifs ;
- des **notes internes**, visibles par l'équipe seulement et jamais envoyées au client.

Une adresse e-mail ne peut appartenir qu'à un seul client, quelle que soit la façon dont elle est écrite
(majuscules ou minuscules) : si elle est déjà utilisée, un message donne le nom du client qui l'a, et la
fenêtre reste ouverte avec ce qui a été saisi.

### Modifier un client

L'action « Modifier » de la ligne ouvre la même fenêtre, remplie avec les informations du client. Les
mêmes règles s'appliquent à l'adresse e-mail.

### Archiver un client ou le remettre dans la liste

- **Archiver** : le client passe au statut « Archivé ». Rien n'est effacé.
- **Remettre dans la liste** (sur un client archivé) : il redevient « Actif ».

## Cas d'utilisation typiques

1. **Enregistrer un nouveau client** après un premier échange, avant de lui envoyer un devis.
2. **Corriger une adresse e-mail ou un numéro** qui a changé.
3. **Ranger un client** avec lequel on ne travaille plus : l'archiver, puis l'onglet Actifs ne montre
   plus que les clients en cours.
4. **Retrouver un ancien client** : onglet Archivés, puis « Remettre dans la liste ».

## Points d'attention / limites actuelles

- Il n'y a pas encore de paiements. Les [devis](../../quotes/fr/QUOTES.FR.md) et les
  [missions](../../missions/fr/MISSIONS.FR.md) d'un client ne sont pas encore affichés depuis cette page ;
  un nouveau client se crée aussi depuis le formulaire d'un devis ou d'une mission.
- Un client ne peut pas être supprimé depuis le back-office, seulement archivé ; un client qui a des
  devis ou des missions ne peut d'ailleurs jamais être supprimé.
- L'effacement des données d'un particulier (anonymisation) n'est pas encore disponible.
- Pas d'export ni de sélection de plusieurs clients à la fois.
