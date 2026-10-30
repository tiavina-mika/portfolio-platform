# Cas d'utilisation — Mon profil (compte back-office)

## Table des matières

- [Où trouver cette page](#où-trouver-cette-page)
- [À quoi sert cette page](#à-quoi-sert-cette-page)
- [Qui peut l'utiliser](#qui-peut-lutiliser)
- [Ce que l'on voit à l'écran](#ce-que-lon-voit-à-lécran)
- [Actions possibles](#actions-possibles)
  - [Modifier son nom et son prénom](#modifier-son-nom-et-son-prénom)
  - [Changer sa photo de profil](#changer-sa-photo-de-profil)
  - [Changer son mot de passe](#changer-son-mot-de-passe)
  - [Activer ou désactiver la double authentification](#activer-ou-désactiver-la-double-authentification)
- [Cas d'utilisation typiques](#cas-dutilisation-typiques)
- [Points d'attention / limites actuelles](#points-dattention--limites-actuelles)

---

## Où trouver cette page

Cette page n'est **pas dans le menu latéral** : elle s'ouvre depuis le menu du compte, en haut à droite
de l'écran (clic sur son avatar ou son prénom), entrée **Mon profil**. Ce même menu propose **À propos** (version et environnement de l'application) et **Déconnexion**. Adresse : `/profil`.

## À quoi sert cette page

C'est la page où une personne gère **son propre** compte : son nom, son prénom, sa photo, son mot de
passe et sa double authentification. Elle ne sert jamais à gérer le compte de quelqu'un d'autre.

## Qui peut l'utiliser

| Qui | Ce qu'il peut faire |
|---|---|
| Toute personne connectée au back-office | Tout ce qui est décrit ci-dessous, sur son propre compte uniquement |

Aucun droit particulier n'est requis.

## Ce que l'on voit à l'écran

La page a deux colonnes : à gauche ce que contient le compte, à droite la photo et les informations de suivi.

- **Détails sur vous** : le nom et le prénom, avec un crayon pour les modifier.
- **Information du compte** : l'e-mail (non modifiable) et le mot de passe, masqué sous la forme
  d'étoiles, avec un crayon pour le changer.
- **Double authentification** : son état (activée ou non) et le bouton pour l'activer ou la désactiver.
- **Postes** : la liste des postes du compte, attribués par un administrateur (lecture seule).
- **Activité du compte** : dernière connexion, date de création du compte et téléphone du compte.
- **Photo** : l'avatar du compte, avec un petit bouton en forme d'appareil photo posé dessus. Sur un écran
  étroit, la photo passe au-dessus.

## Actions possibles

### Modifier son nom et son prénom

Le crayon de la carte « Détails sur vous » ouvre une fenêtre « Modifier mes informations » avec les deux
champs. Le nom est obligatoire, le prénom facultatif (112 caractères au maximum chacun). Après validation, la
fenêtre se ferme et les nouvelles valeurs apparaissent dans la page.

### Changer sa photo de profil

Le bouton appareil photo ouvre le choix d'une image sur l'appareil ; l'image choisie remplace aussitôt la
photo du compte.

### Changer son mot de passe

Le crayon à côté du mot de passe ouvre la fenêtre « Change le mot de passe », qui demande le mot de passe
actuel, le nouveau mot de passe (entre 8 et 64 caractères) et sa confirmation, qui doit être identique.
Après validation, un message indique que le mot de passe a été modifié avec succès.

### Activer ou désactiver la double authentification

Le bouton de la ligne « Double authentification » demande d'abord le mot de passe, puis affiche un QR code à
scanner avec une application d'authentification et un champ pour le code à six chiffres. Des codes de
secours s'affichent alors une seule fois : il faut les noter. Pour la désactiver, le code d'authentification
est redemandé. Voir aussi [Connexion et création de compte](../../auth/fr/AUTH.FR.md).

## Cas d'utilisation typiques

1. **Compléter son identité** : un nouvel arrivant renseigne son prénom et sa photo pour être reconnu.
2. **Corriger une faute** dans son nom ou son prénom.
3. **Changer de mot de passe** par précaution ou après un partage involontaire.

## Points d'attention / limites actuelles

- L'**e-mail ne peut pas être modifié** depuis cette page.
- Les **postes ne sont pas modifiables ici** : un administrateur les attribue depuis la fiche de l'utilisateur
  (page Droits pour les créer).
- Pour un mot de passe oublié, voir la page de connexion et de création de compte.
- Le nom et le prénom, la photo et le mot de passe se modifient ici ; l'e-mail et les postes, non.
