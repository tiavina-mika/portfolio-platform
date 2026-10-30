# Cas d'utilisation — Droits et postes

## Table des matières

- [Où trouver cette page](#où-trouver-cette-page)
- [À quoi sert cette page](#à-quoi-sert-cette-page)
- [Qui peut l'utiliser](#qui-peut-lutiliser)
- [Ce que l'on voit à l'écran](#ce-que-lon-voit-à-lécran)
- [Actions possibles](#actions-possibles)
  - [Créer un poste](#créer-un-poste)
  - [Modifier un poste](#modifier-un-poste)
  - [Supprimer un poste](#supprimer-un-poste)
  - [Donner ou retirer un poste à un compte](#donner-ou-retirer-un-poste-à-un-compte)
  - [Contrôler les comptes à poste élevé](#contrôler-les-comptes-à-poste-élevé)
  - [Consulter le journal des postes](#consulter-le-journal-des-postes)
- [Cas d'utilisation typiques](#cas-dutilisation-typiques)
- [Points d'attention / limites actuelles](#points-dattention--limites-actuelles)

## Où trouver cette page

Menu de gauche → groupe **Administration** → **Droits**. L'écran s'intitule **Postes** et son adresse
est `/postes`.

## À quoi sert cette page

Un poste regroupe ce qu'une personne a le droit de faire dans le back-office : quelles rubriques elle peut
lire, créer, modifier ou supprimer, quels menus elle voit, combien de temps sa session reste ouverte et pour
quels pays. On attribue ensuite un ou plusieurs postes à chaque compte depuis sa fiche.

Deux postes sont réservés au sommet : **Owner** (propriétaire) et **Super Admin**. Ils ont tous les droits
partout, n'apparaissent pas dans la liste modifiable et ne se règlent pas ici. Trois postes de départ
existent aussi : **Manager**, **Support Viewer** et **Team Lead**.

## Qui peut l'utiliser

| Qui | Ce qu'il peut faire |
|---|---|
| Owner et Super Admin | Tout : liste, création, modification, suppression, contrôle des comptes à poste élevé |
| Autre poste avec le droit « Lister » sur la rubrique des postes | Voir l'entrée du menu et la liste |
| Poste avec le droit « gestion du personnel » | Inviter un collègue et lui donner ou retirer des postes dans la limite de ses propres droits |

Les actions sont aussi contrôlées par le serveur : un menu visible ne suffit pas.

## Ce que l'on voit à l'écran

Deux onglets (le second réservé aux Owner et Super Admin) :

- **Postes** : un champ de recherche et un tableau avec le **libellé**, le **code unique**, la date de
  **création**, le **nombre d'utilisateurs** et les **actions** (aperçu, modification, suppression). Le bouton
  **Charger plus** affiche d'autres postes. Un bouton d'ajout est proposé aux Owner et Super Admin.
- **Comptes à poste élevé** : voir plus bas.

Une icône d'historique ouvre le **journal des postes**.

## Actions possibles

### Créer un poste

Le formulaire s'ouvre en plein écran (« Ajouter un nouveau poste »), en deux parties :

- **Identité** : le **libellé**, saisi pour chaque langue, d'où est déduit le **code** (ex. MANAGER). Une
  fois créé, le code ne peut plus être modifié.
- **Configuration des accès** :
  - la **hiérarchie des postes** : les postes inclus ; toute personne ayant ce poste reçoit aussi leurs
    droits ;
  - les **menus** visibles (Divers : migrations, cron, tests ; statistiques ; finance ; diffusion ;
    impersonation ; gestion du personnel) ;
  - la **durée d'inactivité** avant déconnexion automatique (de 15 minutes à 8 heures) ;
  - les **pays** couverts (aucun pays choisi = tous) ;
  - les **droits par ressource** : pour chaque rubrique (utilisateurs, postes, articles, pages, projets,
    catégories, contacts, signalements, notifications, paiements…), des cases lister, consulter, créer,
    modifier, supprimer et supprimer définitivement, avec des profils prédéfinis et un récapitulatif.

Une alerte prévient si on quitte le formulaire avec des modifications non enregistrées.

### Modifier un poste

Le crayon de la ligne rouvre le même formulaire ; le code est figé. Retirer des postes hérités demande une
confirmation, car leurs membres perdent les privilèges correspondants.

### Supprimer un poste

La suppression demande de **taper le nom du poste** pour confirmer. La fenêtre indique ce que perdent les
comptes concernés (ils sont conservés), que l'opération est consignée au journal et qu'elle est
irréversible. Le poste Owner ne peut pas être supprimé.

### Donner ou retirer un poste à un compte

Depuis la fiche de l'utilisateur, bloc **Postes** : ajouter un poste ou retirer celui d'une pastille, après
confirmation. Règles imposées :

- on ne peut pas modifier **ses propres** postes ;
- seul un Owner peut donner ou retirer le poste Owner ou Super Admin, et les comptes qui les détiennent ne
  peuvent être gérés que par un Owner ou un Super Admin ;
- le dernier compte Owner ne peut pas perdre son poste ;
- on ne peut pas donner un poste plus large que le sien.

Les postes ne se donnent qu'aux comptes créés dans le back-office, par exemple après une invitation (voir
[Liste des utilisateurs](../../users/fr/USERS_LIST.FR.md)).

### Contrôler les comptes à poste élevé

L'onglet **Comptes à poste élevé** liste les comptes Owner et Super Admin avec l'état de leur double
authentification et leur dernière connexion. Il signale ceux **à vérifier** (double authentification
désactivée, jamais connecté, ou inactif depuis longtemps) et alerte quand il y a **moins de deux Owner** :
le serveur en exige deux pour qu'un Owner bloqué puisse être débloqué par l'autre, avec un bouton pour
inviter un Owner.

### Consulter le journal des postes

L'icône d'historique liste les créations, modifications, suppressions et attributions de postes (qui, quoi,
quand). L'aperçu d'un poste montre aussi son propre historique.

## Cas d'utilisation typiques

1. **Créer un poste de rédacteur** avec les droits sur Articles et Pages uniquement.
2. **Donner un accès en lecture seule** : cocher seulement lister et consulter.
3. **Raccourcir la session d'un poste sensible** : régler la durée d'inactivité.
4. **Vérifier qui détient les clés** : onglet des comptes à poste élevé.
5. **Retrouver qui a changé un droit** : journal des postes.

## Points d'attention / limites actuelles

- Les droits sont appliqués par le serveur : masquer un menu ne protège pas une rubrique, c'est la coche du
  droit qui compte.
- Une personne sans aucun poste est déconnectée dès qu'elle tente d'entrer.
- Si des postes existaient déjà sous les anciens noms (Owner, Administrator, Manager), ils doivent être
  renommés OWNER, SUPER_ADMIN et MANAGER, sans quoi leurs titulaires perdent l'accès complet.
- Certaines rubriques de la liste des droits (signalements, paiements…) viennent d'un autre produit et n'ont
  pas de contenu sur le portfolio.
