# Cas d'utilisation — Missions

## Table des matières

- [Où trouver cette page](#où-trouver-cette-page)
- [À quoi sert cette page](#à-quoi-sert-cette-page)
- [Qui peut l'utiliser](#qui-peut-lutiliser)
- [Ce que l'on voit à l'écran](#ce-que-lon-voit-à-lécran)
  - [Colonnes du tableau](#colonnes-du-tableau)
  - [Les onglets](#les-onglets)
- [Rechercher et filtrer](#rechercher-et-filtrer)
- [La vie d'une mission](#la-vie-dune-mission)
  - [Les statuts](#les-statuts)
  - [Les phases](#les-phases)
- [Actions possibles](#actions-possibles)
  - [Créer une mission](#créer-une-mission)
  - [Créer la mission d'un devis accepté](#créer-la-mission-dun-devis-accepté)
  - [Modifier une mission](#modifier-une-mission)
  - [Démarrer, terminer ou annuler une mission](#démarrer-terminer-ou-annuler-une-mission)
- [Cas d'utilisation typiques](#cas-dutilisation-typiques)
- [Points d'attention / limites actuelles](#points-dattention--limites-actuelles)

## Où trouver cette page

Menu de gauche → groupe **Opérations** → **Missions**, sous les devis. L'entrée n'apparaît que lorsque la
personne travaille dans l'espace **Aldaron** (voir [Paramètres](../../settings/fr/SETTINGS.FR.md)).
Adresse : `/missions` (en français).

## À quoi sert cette page

Une mission, c'est le travail réalisé pour un [client](../../clients/fr/CLIENTS.FR.md), le plus souvent après
qu'il a accepté un [devis](../../quotes/fr/QUOTES.FR.md). La page permet de noter ce travail, de dire qui le
fait, de le faire avancer (planifiée, en cours, terminée, ou annulée) et de suivre où il en est.

Une mission n'est jamais supprimée : elle reste dans la liste avec son statut, comme historique. Elle ne
contient aucun montant : l'argent reste sur le devis.

Les missions n'existent que dans l'espace Aldaron : rien n'en apparaît dans le portfolio ni sur les sites
publics.

## Qui peut l'utiliser

Il faut deux choses à la fois :

1. un **poste** qui ouvre l'espace **Aldaron** ;
2. le droit correspondant sur la ressource **Missions** (page **Droits**).

Une personne dont les postes n'ouvrent que le portfolio ne voit ni l'entrée de menu ni les missions, même
avec des droits sur la ressource. Si elle tape l'adresse de la page, elle revient au tableau de bord. Les
comptes Owner et Super Admin ont tous les droits et tous les espaces.

| Droit | Ce qu'il permet ici |
|---|---|
| Lister | Afficher la page et l'entrée **Missions** du menu |
| Créer | Bouton « Nouvelle mission » en haut de la page, et action « Créer la mission » sur un devis accepté |
| Modifier | Action « Modifier », et les actions qui changent le statut |

Le choix d'un devis dans le formulaire demande en plus le droit **Lister** sur les devis ; sans lui, seul
le devis déjà rattaché est affiché. Le raccourci « Nouveau client » demande le droit **Créer** sur les
clients.

## Ce que l'on voit à l'écran

### Colonnes du tableau

| Colonne | Signification |
|---|---|
| Mission | Le titre de la mission, avec en dessous le numéro du devis qu'elle réalise, ou « Sans devis » |
| Client | Le nom du client, toujours à jour |
| Réalisée par | La personne de l'équipe qui fait le travail, ou « Personne pour l'instant » |
| Dates | Les dates de début et de fin, ou « non fixée » |
| Statut | Planifiée, en cours, terminée ou annulée, avec la phase en dessous quand il y en a une |
| Actions | Menu de la ligne |

La liste peut être triée par titre, date de début, date de fin ou date de modification.

### Les onglets

**Tout** montre toutes les missions ; un onglet par statut (**Planifiée**, **En cours**, **Terminée**,
**Annulée**) ne garde que les missions de ce statut.

## Rechercher et filtrer

- Le champ de recherche cherche une partie du **titre** de la mission.
- La recherche avancée propose **« Mes missions »** : seules les missions confiées à la personne connectée
  restent affichées.

## La vie d'une mission

### Les statuts

Une mission naît **planifiée**. Elle avance ensuite dans un seul sens :

- planifiée → **en cours** (« Démarrer ») → **terminée** (« Marquer comme terminée ») ;
- planifiée ou en cours → **annulée** (« Annuler la mission »).

Une mission terminée ou annulée ne change plus de statut, et une mission ne revient jamais en arrière.

- **Démarrer** une mission dont la date de début est vide la remplit avec le jour même.
- **Terminer** une mission dont la date de fin est vide la remplit avec le jour même.
- Le client et le devis ne peuvent être changés que tant que la mission est planifiée.
- La date de fin ne peut pas précéder la date de début.

### Les phases

Chaque statut a ses propres **phases**, facultatives, pour dire plus précisément où en est le travail.
Le formulaire ne propose que celles du statut actuel de la mission :

| Statut | Phases |
|---|---|
| Planifiée | En attente du client (brief, accès, acompte), Programmée |
| En cours | Maquettes, Développement, Tests et recette, Retours du client, Mise en production |
| Terminée | Remise du code et des accès, Garantie, Clôturée |
| Annulée | Annulée par le client, Annulée par nous, Impayé |

On passe librement d'une phase à l'autre dans un même statut (revenir des tests au développement, par
exemple). Quand le statut change, la phase est effacée : on choisit celle du nouveau statut.

## Actions possibles

### Créer une mission

Bouton **« Nouvelle mission »** en haut de la page. La fenêtre demande :

- le **client** (obligatoire), choisi parmi les clients actifs ; le raccourci « Nouveau client » le crée
  sans quitter la mission ;
- le **titre** (obligatoire) ;
- le **devis** (facultatif), choisi parmi les devis **acceptés** de ce client ; changer de client vide ce
  choix ;
- la personne qui la **réalise** (facultatif), choisie parmi les membres de l'équipe qui ont accès à
  l'espace Aldaron ;
- la **phase**, les **dates de début et de fin** et une **description** (facultatives).

### Créer la mission d'un devis accepté

Sur un devis accepté, le menu de la ligne de la page **Devis** propose **« Créer la mission »**. La même
fenêtre s'ouvre, déjà remplie avec le client, le titre et le devis. Accepter un devis ne crée jamais de
mission tout seul : c'est une personne qui décide du début et de qui s'en charge.

### Modifier une mission

Action **« Modifier »** du menu de la ligne, quel que soit le statut : on peut encore changer la phase
(passer en garantie, puis clôturer une mission terminée), les dates, la personne ou la description. Le
client et le devis restent bloqués dès que la mission a démarré.

### Démarrer, terminer ou annuler une mission

Le menu de la ligne ne propose que les changements possibles depuis le statut actuel (voir
[Les statuts](#les-statuts)). Le changement s'applique tout de suite et un message le confirme.

## Cas d'utilisation typiques

1. **Lancer le travail d'un devis accepté** : page Devis, « Créer la mission », choisir qui la réalise.
2. **Suivre son propre travail** : recherche avancée, « Mes missions ».
3. **Commencer** : « Démarrer » ; la date de début se remplit si elle était vide.
4. **Dire où on en est** : « Modifier », choisir la phase (tests, retours du client…).
5. **Livrer** : « Marquer comme terminée », puis la phase « Garantie », puis « Clôturée ».
6. **Le client renonce** : « Annuler la mission », puis la phase « Annulée par le client ».

## Points d'attention / limites actuelles

- Annuler une mission ne change pas son devis : il reste accepté.
- Pas de statut « en pause », et une mission terminée ne peut pas être rouverte.
- Personne n'est prévenu quand une mission est annulée ou confiée à quelqu'un.
- Pas encore de paiements, ni d'alerte quand une mission démarre avant le paiement de l'acompte.
- Les missions d'un client ne sont pas encore affichées depuis la page Clients.
- Un client qui a des missions ne peut pas être supprimé : il est archivé.
