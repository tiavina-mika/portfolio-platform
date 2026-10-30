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

Menu de gauche → groupe **Communauté** → **Utilisateurs**, ou la ligne « nouveaux utilisateurs » du tableau de
bord, ou le lien « utilisateurs » de la cloche de la barre du haut (il ouvre l'onglet « Nouveaux »).

## À quoi sert cette page

Elle liste les comptes enregistrés (personnes inscrites et membres de l'équipe du back-office). On y retrouve
quelqu'un, on ouvre sa fiche, on lui écrit, on invite un collègue ou on supprime un compte.

## Qui peut l'utiliser

Droits de la ressource « Utilisateurs », réglés dans la page **Droits** :

| Droit | Ce qu'il permet ici |
|---|---|
| Lister | Voir la liste (sans ce droit, l'écran « introuvable » s'affiche) |
| Consulter | Ouvrir la fiche d'un utilisateur |
| Créer | Avec la gestion du personnel : inviter un collègue (onglet Administrateurs) |
| Supprimer | Mettre un compte à la corbeille |
| Supprimer définitivement | Onglet « Corbeille » |

Les comptes Owner et Super Admin ont tous les droits.

## Ce que l'on voit à l'écran

- Onglets : **Tout**, **Nouveaux** (comptes pas encore marqués comme vus), **Administrateurs** (membres de
  l'équipe, visible des postes autorisés), **Journaux d'audit** (traces des suppressions de comptes) et
  **Corbeille**.
- Un champ de recherche et un panneau de filtres avancés.
- Un tableau : le compte (photo, nom, e-mail ou téléphone, mention de ban ou de suspension), la complétude du
  profil, le contact, la date de création et la dernière connexion, et les **Actions**. L'onglet
  Administrateurs ajoute les **postes** et l'état de la **double authentification**.
- Affichage en tableau ou en vignettes, tri par colonne, 20 lignes par écran (50 ou 75 au choix) et bouton
  **Exporter** (CSV ou Excel).
- L'onglet **Journaux d'audit** liste, pour chaque compte supprimé : le nom et les coordonnées d'origine, qui a
  demandé la suppression (le membre, un administrateur ou le système), la raison et la date.

## Rechercher / filtrer

- Le champ de recherche (nom, e-mail ou téléphone).
- Les filtres avancés : nom, prénom, e-mail ou téléphone vérifié, dates de création et de modification, date
  de naissance, sexe, pays et plateforme.
- L'icône « Réinitialiser les filtres » remet la liste à zéro.

## Actions possibles

- **Ouvrir la fiche** : clic sur la ligne ou icône « œil » (voir [Fiche d'un utilisateur](USERS_PREVIEW.FR.md)).
- **Envoyer un message** : l'icône d'envoi de la ligne ouvre une fenêtre (objet, message) ; le message part
  vers le compte.
- **Inviter un administrateur** : dans l'onglet Administrateurs, le bouton d'invitation demande l'e-mail et
  le ou les postes à donner. La personne reçoit un lien pour créer son compte (voir
  [Connexion et création de compte](../../auth/fr/AUTH.FR.md)). L'invitation exige la gestion du personnel.
- **Supprimer** : l'icône corbeille, après confirmation, met le compte à la corbeille ; la suppression est
  consignée dans les journaux d'audit.
- **Supprimer plusieurs comptes** : cocher des lignes puis supprimer.
- **Marquer comme vu** : retire des comptes de l'onglet « Nouveaux ».
- **Corbeille** : chaque ligne ne propose que l'aperçu.

## Cas d'utilisation typiques

1. **Accueillir les nouveaux inscrits** : onglet « Nouveaux ».
2. **Retrouver un compte** par nom, e-mail ou téléphone.
3. **Voir qui a accès au back-office** : onglet « Administrateurs » (postes et double authentification).
4. **Inviter un collègue** avec les bons postes.
5. **Retrouver qui a supprimé un compte** : onglet « Journaux d'audit ».

## Points d'attention / limites actuelles

- Il est impossible de créer un utilisateur autrement que par l'invitation d'un administrateur.
- Il n'y a pas de bouton « Restaurer » pour un compte mis à la corbeille ; depuis la corbeille de cette
  liste, seul l'aperçu est possible.
- Les colonnes de profil (complétude, contact) viennent d'une application de covoiturage et peuvent rester
  vides pour un portfolio.
