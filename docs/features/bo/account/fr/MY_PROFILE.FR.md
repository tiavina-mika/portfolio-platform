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
- [Cas d'utilisation typiques](#cas-dutilisation-typiques)
- [Points d'attention / limites actuelles](#points-dattention--limites-actuelles)

---

## Où trouver cette page

Cette page n'est **pas dans le menu latéral** : elle s'ouvre depuis le menu du compte, en haut à droite
de l'écran (clic sur son avatar ou son prénom), entrée **Mon profil**. Ce même menu propose **Se
déconnecter**. Adresse : `/profil`.

## À quoi sert cette page

C'est la page où une personne gère **son propre** compte : son nom, son prénom, sa photo et son mot de
passe. Elle ne sert jamais à gérer le compte de quelqu'un d'autre.

## Qui peut l'utiliser

| Qui | Ce qu'il peut faire |
|---|---|
| Toute personne connectée au back-office | Tout ce qui est décrit ci-dessous, sur son propre compte uniquement |

Aucun droit particulier n'est requis.

## Ce que l'on voit à l'écran

La page a deux colonnes : à gauche ce que contient le compte, à droite la photo.

- **Détails sur vous** : le nom et le prénom, avec un crayon pour les modifier.
- **Information du compte** : l'e-mail (non modifiable) et le mot de passe, masqué sous la forme
  d'étoiles, avec un crayon pour le changer.
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

## Cas d'utilisation typiques

1. **Compléter son identité** : un nouvel arrivant renseigne son prénom et sa photo pour être reconnu.
2. **Corriger une faute** dans son nom ou son prénom.
3. **Changer de mot de passe** par précaution ou après un partage involontaire.

## Points d'attention / limites actuelles

- L'**e-mail ne peut pas être modifié** depuis cette page.
- Les **rôles et droits ne sont pas affichés ni modifiables ici** : un administrateur les attribue depuis
  la page Droits.
- Le mot de passe actuel est demandé dans la fenêtre, mais **il n'est pas contrôlé** : seul le nouveau mot
  de passe est enregistré.
- Pour un mot de passe oublié, voir la page de connexion et de création de compte.
