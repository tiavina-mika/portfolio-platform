# Cas d'utilisation — Connexion et création de compte

## Table des matières

- [Où trouver cette page](#où-trouver-cette-page)
- [À quoi sert cette page](#à-quoi-sert-cette-page)
- [Qui peut l'utiliser](#qui-peut-lutiliser)
- [Ce que l'on voit à l'écran](#ce-que-lon-voit-à-lécran)
- [Actions possibles](#actions-possibles)
  - [Se connecter](#se-connecter)
  - [Créer un compte](#créer-un-compte)
  - [Confirmer son compte avec le code reçu par e-mail](#confirmer-son-compte-avec-le-code-reçu-par-e-mail)
  - [Réinitialiser un mot de passe oublié](#réinitialiser-un-mot-de-passe-oublié)
  - [Se déconnecter](#se-déconnecter)
- [Cas d'utilisation typiques](#cas-dutilisation-typiques)
- [Points d'attention / limites actuelles](#points-dattention--limites-actuelles)

---

## Où trouver cette page

Ces écrans sont accessibles **sans être connecté**, directement par l'adresse du back-office :

| Écran | Adresse |
|---|---|
| Connexion | `/connexion` |
| Création de compte | `/creation-compte` |
| Confirmation du compte | `/compte/verifier` |
| Demande de réinitialisation du mot de passe | `/compte/mot-de-passe/reinitialiser` |
| Saisie du code de réinitialisation | `/compte/code/confirmer` |

Les adresses ci-dessus sont celles de l'interface en français. Un visiteur qui ouvre une page du
back-office sans être connecté est renvoyé vers la connexion.

## À quoi sert cette page

Ces écrans permettent d'entrer dans le back-office avec son adresse e-mail et son mot de passe, de
demander un nouveau compte, de confirmer ce compte par un code reçu par e-mail et de retrouver l'accès
en cas de mot de passe oublié.

## Qui peut l'utiliser

| Qui | Ce qu'il peut faire |
|---|---|
| Toute personne, sans compte | Demander la création d'un compte, réinitialiser un mot de passe |
| Titulaire d'un compte | Se connecter |

Avoir un compte ne suffit pas pour travailler : **il faut aussi qu'un administrateur ait attribué au
moins un rôle** au compte. Une personne connectée sans aucun rôle est aussitôt déconnectée et ne voit
jamais le back-office. Les rôles se gèrent depuis la page **Droits** du menu. Un compte créé avec une adresse
désignée comme celle d'un propriétaire du site reçoit automatiquement le rôle le plus élevé.

## Ce que l'on voit à l'écran

- **Connexion** : un titre de bienvenue, un formulaire (e-mail, mot de passe) et deux liens en bas :
  « Vous n'avez pas de compte ? Créer un compte » et « Mot de passe oublié ? Réinitialiser le mot de
  passe ».
- **Création de compte** : e-mail, prénom, nom, mot de passe (avec une liste de règles qui se coche au
  fur et à mesure) et confirmation du mot de passe. Une phrase rappelle qu'un administrateur validera le
  compte.
- **Confirmation** : six cases pour saisir le code reçu par e-mail.
- **Réinitialisation** : un champ e-mail, puis six cases pour le code, puis deux champs pour le nouveau
  mot de passe et sa confirmation.

## Actions possibles

### Se connecter

On saisit son e-mail et son mot de passe, puis on valide : on arrive sur l'accueil du back-office. Si
l'e-mail ou le mot de passe est faux, le message « Email ou mot de passe incorrect » s'affiche. Si le
compte n'a pas encore été confirmé, un nouveau code est envoyé automatiquement par e-mail et l'écran de
confirmation s'ouvre avec le message correspondant.

### Créer un compte

Le formulaire demande l'e-mail, le nom (obligatoire), le prénom (facultatif) et le mot de passe saisi deux
fois. Le mot de passe doit respecter les règles affichées (8 caractères minimum, majuscule, minuscule,
chiffre, caractère spécial), ne pas être identique à l'e-mail et ne pas contenir le nom du service de
messagerie de l'e-mail. Si un compte existe déjà avec cet e-mail, un message le signale.

Ensuite, selon l'environnement : en production, un code est envoyé par e-mail et l'écran de confirmation
s'ouvre ; dans les autres environnements (développement, pré-production), le compte est confirmé
automatiquement.

### Confirmer son compte avec le code reçu par e-mail

On saisit les six chiffres du code ; la vérification se lance dès que le sixième est entré. Le code est
valable une heure. Si le code est faux ou expiré, un message d'erreur s'affiche et les cases sont vidées.
Quand le compte est confirmé, un message de succès propose un bouton **Se connecter**.

### Réinitialiser un mot de passe oublié

1. Depuis la connexion, cliquer sur **Réinitialiser le mot de passe**, saisir son e-mail, puis **Envoyer le
   code**. Un lien « Code déjà envoyé ? » permet de passer directement à l'étape suivante.
2. Saisir le code à six chiffres reçu par e-mail (valable une heure). En cas d'erreur, un lien « Renvoyer le
   code » ramène à l'étape précédente.
3. Saisir le nouveau mot de passe et sa confirmation (8 caractères minimum, identiques) puis **Confirmer**. Un
   message indique que le mot de passe est réinitialisé et un bouton ramène à la connexion.

### Se déconnecter

Depuis le menu du compte (clic sur son avatar en haut à droite), entrée **Se déconnecter**. On revient à
l'écran de connexion.

## Cas d'utilisation typiques

1. **Un collaborateur arrive** : il crée son compte, saisit le code reçu par e-mail, puis demande à un
   administrateur de lui attribuer un rôle avant de pouvoir travailler.
2. **Mot de passe oublié** : il passe par « Réinitialiser le mot de passe », saisit le code reçu, puis
   choisit un nouveau mot de passe.
3. **Compte jamais confirmé** : il tente de se connecter ; un nouveau code lui est envoyé et il peut le
   saisir tout de suite.
4. **Code expiré** : il relance la procédure pour recevoir un nouveau code.

## Points d'attention / limites actuelles

- **Pas de rôle, pas d'accès** : un compte nouvellement créé reste inutilisable tant qu'un administrateur
  ne lui a pas attribué de rôle.
- L'écran de confirmation d'un nouveau compte n'a pas de lien « Renvoyer le code » : pour recevoir un
  nouveau code, il faut tenter de se connecter (le code est renvoyé automatiquement).
- Une personne déjà connectée qui ouvre la connexion ou la création de compte est renvoyée vers l'accueil.
- Il n'existe pas de double authentification.
