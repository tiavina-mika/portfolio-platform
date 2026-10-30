# Cas d'utilisation — Contacts (Boîte de réception)

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

Menu de gauche → groupe **Communauté** → **Contacts**, ou la ligne « contacts » de la cloche de la barre du
haut. Adresse : `/contacts`.

## À quoi sert cette page

C'est la boîte de réception des demandes envoyées par les visiteurs depuis le formulaire de contact du site
public. Chaque message devient une **demande** (un ticket) qu'on lit, à laquelle on répond, qu'on classe par
priorité, qu'on assigne à un collègue et qu'on clôt une fois traitée.

## Qui peut l'utiliser

Droits de la ressource « Contact », réglés dans la page **Droits** :

| Droit | Ce qu'il permet ici |
|---|---|
| Lister | Voir la boîte (sans ce droit, l'écran « introuvable » s'affiche) |
| Modifier | Répondre, changer le statut ou la priorité, assigner |
| Supprimer | Mettre une demande à la corbeille |
| Supprimer définitivement | Voir la corbeille et détruire définitivement |

Les comptes Owner et Super Admin ont tous les droits.

## Ce que l'on voit à l'écran

Une disposition en deux colonnes : à gauche la **file des demandes**, à droite la **conversation** de la
demande ouverte (voir [Lire et répondre à une demande](CONTACTS_PREVIEW.FR.md)).

La file comporte :

- des filtres de statut avec le nombre de demandes : **Tout**, **Ouvert**, **En cours**, **Résolu**,
  **Fermé**, et **Corbeille** pour les comptes pouvant supprimer définitivement ;
- un champ de recherche (numéro, nom, e-mail, téléphone ou message) et un panneau de filtres ;
- pour chaque demande : le demandeur, le sujet, un extrait, le statut, la priorité, la provenance et la
  dernière activité. Une demande non lue est mise en évidence ;
- le nombre de demandes et de demandes non lues, la pagination et un bouton **Exporter**.

## Rechercher / filtrer

- Le champ de recherche tape-et-cherche.
- Le panneau de filtres : date d'ajout, priorité, provenance (formulaire du site ou application), sujet et
  pays, avec le nombre de demandes correspondantes et un bouton pour réinitialiser.

## Actions possibles

- **Ouvrir une demande** : clic sur une ligne (chaque demande a sa propre adresse).
- **Supprimer** une demande (corbeille) ou la **détruire définitivement** depuis la corbeille.
- **Exporter** la file telle qu'elle est filtrée, en CSV ou Excel, sans limite de page.
- Pour répondre, changer le statut, la priorité ou l'assignation : voir la page suivante.

## Cas d'utilisation typiques

1. **Traiter les nouvelles demandes** : filtre « Ouvert », ouvrir chaque demande et répondre.
2. **Retrouver un échange** : taper le nom, l'e-mail ou le numéro de la demande.
3. **Voir ce qui est urgent** : filtrer sur la priorité.
4. **Faire le ménage** : supprimer les demandes traitées.

## Points d'attention / limites actuelles

- Il n'existe pas de bouton « Restaurer » pour une demande mise à la corbeille.
- Il est impossible de créer une demande depuis le back-office : la file ne se remplit que par le formulaire
  du site.
- Les mentions « Application », « SOS » et plusieurs sujets (remboursement, trajet, véhicule…) viennent
  d'une autre application et ne concernent pas le portfolio.
