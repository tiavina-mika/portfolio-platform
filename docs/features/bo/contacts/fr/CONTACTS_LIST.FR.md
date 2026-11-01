# Cas d'utilisation — Contacts (Messages reçus)

## Table des matières

- [Où trouver cette page](#où-trouver-cette-page)
- [À quoi sert cette page](#à-quoi-sert-cette-page)
- [Qui peut l'utiliser](#qui-peut-lutiliser)
- [Ce que l'on voit à l'écran](#ce-que-lon-voit-à-lécran)
- [Rechercher](#rechercher)
- [Actions possibles](#actions-possibles)
- [Cas d'utilisation typiques](#cas-dutilisation-typiques)
- [Points d'attention / limites actuelles](#points-dattention--limites-actuelles)

## Où trouver cette page

Menu de gauche → groupe **Communauté** → **Contacts**, ou la ligne « contacts » de la cloche de la barre du
haut. Adresse : `/contacts`.

## À quoi sert cette page

Lire les messages envoyés par les visiteurs depuis le formulaire de contact du site public. C'est une simple
boîte de lecture : on consulte le message et on retrouve les coordonnées de la personne pour lui écrire avec
sa propre messagerie. La page ne permet pas de répondre.

## Qui peut l'utiliser

Droits de la ressource « Contact », réglés dans la page **Droits** :

| Droit | Ce qu'il permet ici |
|---|---|
| Lister | Voir les messages (sans ce droit, l'écran « introuvable » s'affiche) |
| Supprimer | Mettre un message à la corbeille |
| Supprimer définitivement | Voir la corbeille et détruire définitivement un message |

Les comptes Owner et Super Admin ont tous les droits.

## Ce que l'on voit à l'écran

Une disposition en deux colonnes (sur téléphone, un seul écran à la fois) :

- **À gauche, la liste des messages** : pour chacun, une pastille avec les initiales, le nom de l'expéditeur,
  la date relative (« il y a 2 heures »…) et un extrait du message. Un message **non lu** est écrit en gras.
  En dessous : le nombre de messages et la pagination. Les comptes autorisés à détruire voient aussi un
  onglet **Corbeille**.
- **À droite, le message ouvert** : le nom et l'e-mail de l'expéditeur, le texte complet du message, puis
  une carte de détails : e-mail, téléphone, date d'envoi, langue du visiteur et s'il a demandé à recevoir la
  newsletter. Quand aucun message n'est ouvert, un texte invite à en choisir un.

Ouvrir un message le marque comme lu : il perd son gras dans la liste et le compteur du menu de gauche
diminue.

## Rechercher

Un champ de recherche au-dessus de la liste : on tape et la liste se met à jour toute seule, après une
courte pause. La recherche porte sur le contenu des messages et sur les coordonnées des expéditeurs.

## Actions possibles

- **Ouvrir un message** : un clic sur une ligne. Chaque message a sa propre adresse, que l'on peut copier ou
  retrouver depuis la recherche globale.
- **Supprimer** un message (menu à trois points du message) : il part à la corbeille.
- **Détruire définitivement** un message depuis la corbeille.
- **Exporter** la liste telle qu'elle est affichée (recherche comprise), en CSV ou Excel, sans limite de
  page.

## Cas d'utilisation typiques

1. **Lire les nouveaux messages** : les messages en gras sont ceux qui n'ont pas encore été ouverts.
2. **Retrouver un échange** : taper le nom, l'e-mail ou un mot du message.
3. **Faire le ménage** : supprimer les messages traités, puis vider la corbeille.
4. **Récupérer des contacts** : exporter la liste.

## Points d'attention / limites actuelles

- Il n'est pas possible de répondre depuis le back-office, ni de créer un message : la liste ne se remplit
  que par le formulaire du site.
- Le visiteur ne reçoit pas d'accusé de réception automatique.
- Il n'existe pas de bouton « Restaurer » pour un message mis à la corbeille.
