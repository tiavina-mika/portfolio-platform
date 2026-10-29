# Cas d'utilisation — Contacts (Liste)

## Table des matières

- [Où trouver cette page](#où-trouver-cette-page)
- [À quoi sert cette page](#à-quoi-sert-cette-page)
- [Qui peut l'utiliser](#qui-peut-lutiliser)
- [Ce que l'on voit à l'écran](#ce-que-lon-voit-à-lécran)
- [Rechercher / filtrer](#rechercher--filtrer)
- [Actions possibles](#actions-possibles)
- [Cas d'utilisation typiques](#cas-dutilisation-typiques)
- [Points d'attention / limites actuelles](#points-dattention--limites-actuelles)

## Où trouver cette page

Menu de gauche → **Contacts**, ou carte **Contacts** de l'écran d'accueil, ou l'icône de message avec
pastille de nombre en haut à droite de l'écran (elle ouvre directement l'onglet « Nouveaux »).

## À quoi sert cette page

Elle rassemble les messages envoyés par les visiteurs depuis le formulaire de contact du site public.
On y lit les messages, on y répond et on supprime ceux qui ne servent plus.

## Qui peut l'utiliser

Droits de la ressource « Contact », réglés dans la page **Droits** :

| Droit | Ce qu'il permet ici |
|---|---|
| Lister | Voir la liste (sans ce droit, l'écran « introuvable » s'affiche) |
| Supprimer | Mettre un message à la corbeille |
| Supprimer définitivement | Onglet « Corbeille » et destruction définitive |

Ouvrir un message pour y répondre n'est conditionné par aucun droit supplémentaire à l'écran. Les
propriétaires et administrateurs ont tous les droits.

## Ce que l'on voit à l'écran

- Des onglets : **Tout**, **Nouveaux** (messages pas encore marqués comme vus) et **Corbeille**
  (réservé aux comptes pouvant supprimer définitivement).
- Un champ de recherche et un panneau de filtres avancés.
- Un tableau : **Nom**, **Email**, **Message** (les 100 premiers caractères), **Répondu** (coche ou non),
  **Date d'envoi** (avec l'heure) et **Actions**. Si l'expéditeur a un compte, c'est son nom de compte
  qui est affiché.
- Affichage en tableau ou en vignettes (grand écran), tri par colonne (par défaut les plus récemment
  modifiés d'abord), 20 lignes par écran (50 ou 75 au choix).

Un clic sur une ligne ouvre le message (voir [Lire et répondre à un message](CONTACTS_PREVIEW.FR.md)).

## Rechercher / filtrer

- Le champ de recherche (« Nom, email ou message ») cherche dans ces trois informations.
- Les filtres avancés : répondu ou non, date de création, date de modification, nom, e-mail.
- L'icône « Réinitialiser les filtres » remet la liste à zéro.

## Actions possibles

- **Répondre** : l'icône d'avion en papier de la ligne (ou un clic sur la ligne) ouvre le message.
- **Supprimer** : l'icône corbeille de la ligne, après confirmation, met le message à la corbeille.
- **Sélection multiple** : en cochant des lignes, on peut les **marquer comme vus ou non vus** (dans
  l'onglet « Nouveaux » : « Marquer comme vu »), ou les **supprimer** d'un coup.
- **Corbeille** : chaque ligne propose « Supprimer » (définitif, irréversible).

## Cas d'utilisation typiques

1. **Traiter les nouveaux messages** : onglet « Nouveaux », ouvrir chaque message et répondre.
2. **Retrouver un échange** : taper le nom ou l'adresse de la personne dans la recherche.
3. **Voir ce qui reste sans réponse** : filtre avancé « Répondu » sur « non ».
4. **Faire le ménage** : cocher les messages traités et les supprimer.

## Points d'attention / limites actuelles

- Ouvrir un message ne le marque pas comme vu : il faut le faire par la sélection multiple. Tant que ce
  n'est pas fait, il reste compté dans la pastille en haut de l'écran.
- Pour les comptes qui peuvent supprimer définitivement, la sélection multiple n'est pas proposée.
- Il n'existe pas de bouton « Restaurer » pour un message mis à la corbeille.
- Il est impossible de créer un message depuis le back-office : la liste ne se remplit que par le
  formulaire du site.
