# Cas d'utilisation — Devis

## Table des matières

- [Où trouver cette page](#où-trouver-cette-page)
- [À quoi sert cette page](#à-quoi-sert-cette-page)
- [Qui peut l'utiliser](#qui-peut-lutiliser)
- [Ce que l'on voit à l'écran](#ce-que-lon-voit-à-lécran)
  - [Colonnes du tableau](#colonnes-du-tableau)
  - [Les onglets](#les-onglets)
- [Rechercher](#rechercher)
- [La vie d'un devis](#la-vie-dun-devis)
- [Actions possibles](#actions-possibles)
  - [Créer un devis](#créer-un-devis)
  - [Créer un client sans quitter le devis](#créer-un-client-sans-quitter-le-devis)
  - [Modifier un brouillon](#modifier-un-brouillon)
  - [Envoyer, accepter, refuser ou faire expirer un devis](#envoyer-accepter-refuser-ou-faire-expirer-un-devis)
  - [Réviser un devis envoyé](#réviser-un-devis-envoyé)
  - [Créer un avenant à un devis accepté](#créer-un-avenant-à-un-devis-accepté)
- [La devise par défaut](#la-devise-par-défaut)
- [Cas d'utilisation typiques](#cas-dutilisation-typiques)
- [Points d'attention / limites actuelles](#points-dattention--limites-actuelles)

## Où trouver cette page

Menu de gauche → groupe **Opérations** → **Devis**, sous les clients. L'entrée n'apparaît que lorsque la
personne travaille dans l'espace **Aldaron** (voir [Paramètres](../../settings/fr/SETTINGS.FR.md)).
Adresse : `/devis` (en français).

## À quoi sert cette page

C'est la liste des propositions chiffrées qu'Aldaron envoie à ses [clients](../../clients/fr/CLIENTS.FR.md).
On y rédige un devis en brouillon, on le marque comme envoyé, puis on note la réponse du client : accepté,
refusé, ou expiré s'il n'a jamais répondu. Un devis n'est jamais supprimé : il reste dans la liste avec
son statut, comme historique.

Chaque devis reçoit un **numéro** lisible donné automatiquement à sa création, de la forme
`AL-2026-001` : l'année, puis un rang qui repart à 001 chaque année, sans trou.

Les devis n'existent que dans l'espace Aldaron : rien n'en apparaît dans le portfolio ni sur les sites
publics.

## Qui peut l'utiliser

Il faut deux choses à la fois :

1. un **poste** qui ouvre l'espace **Aldaron** ;
2. le droit correspondant sur la ressource **Devis** (page **Droits**).

Une personne dont les postes n'ouvrent que le portfolio ne voit ni l'entrée de menu ni les devis, même
avec des droits sur la ressource. Si elle tape l'adresse de la page, elle revient au tableau de bord. Les
comptes Owner et Super Admin ont tous les droits et tous les espaces.

| Droit | Ce qu'il permet ici |
|---|---|
| Lister | Afficher la page et l'entrée **Devis** du menu |
| Créer | Bouton « Nouveau devis » en haut de la page, et action « Créer un avenant » sur un devis accepté |
| Modifier | Action « Modifier » sur un brouillon, et les actions qui changent le statut |

Le raccourci « Nouveau client » du formulaire demande en plus le droit **Créer** sur les clients.
L'action « Réviser » demande les droits **Créer** et **Modifier** : elle crée une nouvelle version et fait
expirer l'ancienne.

## Ce que l'on voit à l'écran

### Colonnes du tableau

| Colonne | Signification |
|---|---|
| Devis | Le numéro du devis (suivi de sa version, « v2 », quand il a été révisé), avec son titre en dessous ; pour une révision, le devis qu'elle révise (« Révise AL-2026-001 v1 ») ; pour un avenant, le devis qu'il complète (« Avenant au devis AL-2026-003 ») |
| Client | Le nom du client, toujours à jour : s'il est renommé, la liste montre le nouveau nom |
| Total TTC | Le montant total, dans la devise du devis |
| Créé le / Modifié le | Dates de création et de dernière modification |
| Statut | Brouillon, envoyé, accepté, refusé ou expiré ; sous un devis accepté, le lien vers sa preuve d'acceptation s'il en a une |
| Actions | Menu de la ligne |

La liste peut être triée par numéro, titre, montant, date d'envoi ou date.

### Les onglets

**Tout** montre tous les devis ; un onglet par statut (**Brouillon**, **Envoyé**, **Accepté**,
**Refusé**, **Expiré**) ne garde que les devis de ce statut.

## Rechercher

Le champ de recherche cherche une partie du **numéro** ou du **titre** du devis.

## La vie d'un devis

```text
brouillon ──► envoyé ──► accepté
                    ├──► refusé
                    └──► expiré
```

- Un devis naît **brouillon** : c'est le seul moment où l'on peut le modifier.
- **Envoyé** : on le marque ainsi une fois parti chez le client ; la date d'envoi est notée. À partir de
  là, son contenu (client, lignes, montants, devise, TVA, conditions) ne change plus : c'est ce que le
  client a reçu.
- **Accepté**, **refusé** ou **expiré** : la réponse du client. Ces trois statuts sont définitifs.

Tout autre passage est refusé (par exemple d'un brouillon directement à accepté, ou d'un devis accepté
vers envoyé).

Pour changer un devis déjà envoyé, on le **révise** : une nouvelle version brouillon est créée sous le
même numéro, et la version envoyée passe à **expiré**. Pour ajouter du travail à un devis accepté, on crée
un **avenant** : un nouveau devis, avec son propre numéro, rattaché au devis accepté. Un devis accepté
n'est jamais révisé.

## Actions possibles

### Créer un devis

Le bouton « Nouveau devis » ouvre une fenêtre avec :

- le **client** (obligatoire), choisi parmi les clients actifs en tapant une partie de son nom ou de son
  e-mail ; un client archivé ne reçoit pas de nouveau devis ;
- le **titre** (obligatoire) ;
- les **lignes** (au moins une, 50 au plus) : une description, une quantité (une demi-journée s'écrit
  0,5) et un prix unitaire hors taxes ;
- la **devise** : euro ou ariary. Les montants en ariary s'écrivent sans centimes ;
- le **taux de TVA**, en pourcentage, laissé vide s'il n'y a pas de TVA ; il s'applique à toutes les
  lignes ;
- la date de **validité**, facultative ;
- les **conditions**, visibles par le client.

En bas de la fenêtre, le total hors taxes, la TVA et le total TTC se calculent pendant la saisie. Le
total enregistré est recalculé à l'enregistrement avec la même règle : c'est lui qui fait foi.

### Créer un client sans quitter le devis

Si le client n'existe pas encore, le lien « Nouveau client » sous le champ client ouvre la fenêtre de
création d'un client. Une fois enregistré, le client est choisi tout seul dans le devis, sans perdre ce qui
était déjà saisi.

### Modifier un brouillon

L'action « Modifier » n'est proposée que sur un brouillon. Elle ouvre la même fenêtre, remplie avec le
devis.

### Envoyer, accepter, refuser ou faire expirer un devis

Le menu de la ligne ne propose que les passages possibles depuis le statut du devis :

- sur un brouillon : « Marquer comme envoyé » ;
- sur un devis envoyé : « Marquer comme accepté », « Marquer comme refusé », « Marquer comme expiré ».

Accepter un devis ouvre une petite fenêtre qui demande **comment le client a accepté** : par e-mail,
devis signé, à l'oral ou autrement. La date d'acceptation est celle du jour.

La même fenêtre permet de joindre, si on le souhaite, **une preuve d'acceptation** : le devis signé ou
l'e-mail du client, en PDF ou en image (JPG, PNG, WEBP), 5 Mo au plus. Un seul fichier par devis. La
preuve ne peut être jointe qu'au moment de l'acceptation : ni avant, ni après, ni sur un devis refusé ou
expiré. Si le fichier ne peut pas être envoyé, le devis n'est pas marqué comme accepté et on peut
recommencer.

Dans la liste, un devis accepté avec une preuve affiche un lien **« Preuve d'acceptation »** sous son
statut : il ouvre le fichier dans un nouvel onglet.

### Réviser un devis envoyé

Sur un devis envoyé, le menu de la ligne propose **« Réviser »**. Une fenêtre demande de confirmer, car la
révision ne s'annule pas :

- une **copie brouillon** du devis est créée, avec le même numéro et la version suivante (v2, puis v3…) :
  même client, mêmes lignes, même devise, même TVA et mêmes conditions ; la date de validité est reprise
  si elle n'est pas déjà passée, sinon elle est laissée vide pour être saisie à nouveau ;
- la version envoyée passe aussitôt à **expiré** : c'est la nouvelle version qu'il faut envoyer au client.

La nouvelle version apparaît en haut de la liste ; on la corrige avec « Modifier », puis on la marque comme
envoyée comme n'importe quel devis. Son client ne peut pas être changé.

Un brouillon, un devis refusé, expiré ou accepté ne se révise pas. Pour un devis accepté, le message
propose de créer un avenant à la place.

### Créer un avenant à un devis accepté

Sur un devis accepté, le menu de la ligne propose **« Créer un avenant »**. La fenêtre de création s'ouvre,
déjà remplie avec le client (qui ne peut pas être changé), la devise, le taux de TVA et les conditions du
devis accepté ; on saisit le titre et les lignes du travail en plus.

L'avenant reçoit son **propre numéro** et suit ensuite la vie d'un devis normal : brouillon, envoyé, puis
accepté ou refusé. Dans la liste, il indique le devis qu'il complète.

## La devise par défaut

Dans **Paramètres** → **Langues**, l'espace Aldaron propose la **devise par défaut des devis**. Elle ne
sert qu'à pré-remplir la devise d'un nouveau devis : chaque devis garde la sienne, donc changer ce réglage
ne modifie aucun devis existant. C'est un réglage propre à la personne connectée.

## Cas d'utilisation typiques

1. **Chiffrer une demande** : « Nouveau devis », choisir le client (ou le créer), ajouter les lignes,
   vérifier le total, enregistrer. Le devis reçoit son numéro.
2. **Corriger un brouillon** avant de l'envoyer : « Modifier ».
3. **Noter l'envoi** au client : « Marquer comme envoyé ».
4. **Noter la réponse** : « Marquer comme accepté » (en indiquant comment, et en joignant le devis signé
   si on l'a) ou « Marquer comme refusé ».
5. **Faire le point** : l'onglet Envoyé liste les devis en attente de réponse.
6. **Le client demande un changement avant de répondre** : « Réviser » sur le devis envoyé, corriger la
   nouvelle version, puis la marquer comme envoyée.
7. **Le client demande du travail en plus après avoir accepté** : « Créer un avenant » sur le devis
   accepté.

## Points d'attention / limites actuelles

- Le devis n'est pas encore produit en PDF ni envoyé par e-mail depuis le back-office : « Marquer comme
  envoyé » note seulement qu'il est parti.
- La preuve d'acceptation ne se remplace pas et ne se retire pas une fois le devis accepté. Son lien
  est une adresse longue et impossible à deviner, mais quiconque la reçoit peut ouvrir le fichier, comme
  pour les autres fichiers du back-office : ne la transmettez pas en dehors de l'équipe.
- Un devis envoyé n'expire pas tout seul à sa date de validité : il faut le marquer comme expiré.
- Pas encore de paiements rattachés à un devis accepté.
- Une demande de devis reçue depuis le site ne se transforme pas encore en devis.
- Un client qui a des devis ne peut pas être supprimé : il est archivé.
