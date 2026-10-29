# Cas d'utilisation — Utilisateurs (Liste)

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

Menu de gauche → **Utilisateurs**, ou carte de l'écran d'accueil, ou l'icône d'ajout d'utilisateur avec
pastille de nombre en haut à droite de l'écran (elle ouvre directement l'onglet « Nouveaux »).

## À quoi sert cette page

Elle liste les comptes enregistrés (visiteurs inscrits et personnes qui ont accès au back-office). On y
retrouve quelqu'un, on ouvre sa fiche, on lui écrit ou on supprime son compte.

## Qui peut l'utiliser

Droits de la ressource « Utilisateurs », réglés dans la page **Droits** :

| Droit | Ce qu'il permet ici |
|---|---|
| Lister | Voir la liste (sans ce droit, l'écran « introuvable » s'affiche) |
| Consulter | Ouvrir la fiche d'un utilisateur |
| Supprimer | Mettre un compte à la corbeille |
| Supprimer définitivement | Onglet « Corbeille » |

L'onglet « Administrateurs » n'est visible que des propriétaires et administrateurs, qui seuls peuvent
aussi supprimer plusieurs comptes en une fois. Ils ont tous les droits.

## Ce que l'on voit à l'écran

- Onglets : **Tout**, **Nouveaux** (comptes pas encore marqués comme vus), **Administrateurs** (comptes
  du back-office) et **Corbeille**.
- Un champ de recherche et un panneau de filtres avancés.
- Un tableau : **Nom** (photo, nom de famille et prénom), **Email**, **Compte vérifié** (coche ou non),
  **Créé le**, **Rôles** (renseignés dans l'onglet Administrateurs seulement) et **Actions**.
- Affichage en tableau ou en vignettes (grand écran), tri par colonne, 20 lignes par écran (50 ou 75
  au choix).

## Rechercher / filtrer

- Le champ « Rechercher par nom ou email ».
- Les filtres avancés : nom, prénom, compte vérifié, date de création, date de modification, date de
  naissance, sexe et plateforme d'inscription.
- L'icône « Réinitialiser les filtres » remet la liste à zéro.

## Actions possibles

- **Ouvrir la fiche** : clic sur la ligne ou icône « œil » (voir [Fiche d'un utilisateur](USERS_PREVIEW.FR.md)).
- **Envoyer un e-mail** : l'icône d'envoi ouvre une fenêtre (adresse préremplie, objet, message). Le
  message part depuis le site ; si l'adresse ne correspond à aucun compte, une erreur est affichée.
- **Supprimer** : l'icône corbeille, après confirmation, met le compte à la corbeille.
- **Supprimer plusieurs comptes** : cocher des lignes puis supprimer (réservé aux administrateurs).
- **Corbeille** : chaque ligne ne propose que l'aperçu.

## Cas d'utilisation typiques

1. **Accueillir les nouveaux inscrits** : onglet « Nouveaux ».
2. **Retrouver un compte** par nom ou adresse e-mail.
3. **Voir qui a accès au back-office** : onglet « Administrateurs » (colonne Rôles).
4. **Écrire à un utilisateur** : icône d'envoi.

## Points d'attention / limites actuelles

- Il est impossible de créer un utilisateur depuis cette page.
- Il n'y a pas de bouton « Restaurer » pour un compte mis à la corbeille ; depuis la corbeille de cette
  liste, seul l'aperçu est possible.
- Pour les comptes qui peuvent supprimer définitivement, la sélection multiple n'est pas proposée.
