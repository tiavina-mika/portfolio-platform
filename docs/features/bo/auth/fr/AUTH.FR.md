# Cas d'utilisation — Connexion et création de compte

## Table des matières

- [Où trouver cette page](#où-trouver-cette-page)
- [À quoi sert cette page](#à-quoi-sert-cette-page)
- [Qui peut l'utiliser](#qui-peut-lutiliser)
- [Ce que l'on voit à l'écran](#ce-que-lon-voit-à-lécran)
- [Actions possibles](#actions-possibles)
  - [Se connecter](#se-connecter)
  - [Créer son compte à partir d'une invitation](#créer-son-compte-à-partir-dune-invitation)
  - [Confirmer son compte avec le code reçu par e-mail](#confirmer-son-compte-avec-le-code-reçu-par-e-mail)
  - [Réinitialiser un mot de passe oublié](#réinitialiser-un-mot-de-passe-oublié)
  - [Activer et utiliser la double authentification](#activer-et-utiliser-la-double-authentification)
  - [Se déconnecter](#se-déconnecter)
- [Cas d'utilisation typiques](#cas-dutilisation-typiques)
- [Points d'attention / limites actuelles](#points-dattention--limites-actuelles)

## Où trouver cette page

Ces écrans sont accessibles **sans être connecté**, directement par l'adresse du back-office :

| Écran | Adresse |
|---|---|
| Connexion | `/connexion` |
| Vérification en deux étapes | `/connexion/mfa` |
| Création de compte (lien d'invitation) | `/invite?token=…` |
| Confirmation du compte | `/compte/verifier` |
| Demande de réinitialisation du mot de passe | `/compte/mot-de-passe/reinitialiser` |
| Saisie du code de réinitialisation | `/compte/code/confirmer` |

Les adresses ci-dessus sont celles de l'interface en français. Un visiteur qui ouvre une page du
back-office sans être connecté est renvoyé vers la connexion.

## À quoi sert cette page

Ces écrans permettent d'entrer dans le back-office avec son adresse e-mail et son mot de passe (avec un
second code si la double authentification est active), de créer son compte quand on a été invité et de
retrouver l'accès en cas de mot de passe oublié.

## Qui peut l'utiliser

| Qui | Ce qu'il peut faire |
|---|---|
| Toute personne, sans compte | Réinitialiser un mot de passe ; créer un compte **uniquement avec un lien d'invitation** |
| Titulaire d'un compte | Se connecter |

Il n'y a **pas de création de compte libre** : un administrateur invite la personne depuis la liste des
utilisateurs (voir [Liste des utilisateurs](../../users/fr/USERS_LIST.FR.md)) et lui attribue les postes. Une
personne connectée sans aucun poste est aussitôt déconnectée. Un compte créé avec une adresse désignée comme
celle d'un propriétaire du site reçoit automatiquement le poste le plus élevé.

## Ce que l'on voit à l'écran

- **Connexion** : un titre de bienvenue, un formulaire (e-mail, mot de passe) et un lien « Mot de passe
  oublié ? Réinitialiser le mot de passe ».
- **Vérification en deux étapes** : un champ pour le code à six chiffres de l'application
  d'authentification, ou un code de secours.
- **Création de compte** : e-mail (déjà rempli par l'invitation), prénom, nom, mot de passe (avec une liste
  de règles qui se coche au fur et à mesure) et confirmation du mot de passe.
- **Confirmation** : six cases pour saisir le code reçu par e-mail.
- **Réinitialisation** : un champ e-mail, puis six cases pour le code, puis deux champs pour le nouveau
  mot de passe et sa confirmation.

## Actions possibles

### Se connecter

On saisit son e-mail et son mot de passe, puis on valide : on arrive sur le tableau de bord. Si l'e-mail
ou le mot de passe est faux, un message l'indique. Si le compte n'a pas encore été confirmé, un nouveau
code est envoyé automatiquement par e-mail et l'écran de confirmation s'ouvre. Si la double authentification
est active, l'écran de vérification en deux étapes s'ouvre ensuite.

### Créer son compte à partir d'une invitation

Le lien reçu par e-mail ouvre le formulaire de création de compte avec l'adresse déjà renseignée. Le mot de
passe doit respecter les règles affichées (longueur minimale, majuscule, minuscule, chiffre, caractère
spécial). Si le lien est invalide, expiré ou déjà utilisé, on est renvoyé à la connexion avec un message qui
demande un nouveau lien à un administrateur.

### Confirmer son compte avec le code reçu par e-mail

On saisit les six chiffres du code ; la vérification se lance dès que le sixième est entré. Si le code est
faux ou expiré, un message d'erreur s'affiche. Quand le compte est confirmé, un message de succès propose un
bouton **Se connecter**.

### Réinitialiser un mot de passe oublié

1. Depuis la connexion, cliquer sur **Réinitialiser le mot de passe**, saisir son e-mail, puis **Envoyer le
   code**. Un lien « Code déjà envoyé ? » permet de passer directement à l'étape suivante.
2. Saisir le code à six chiffres reçu par e-mail. En cas d'erreur, un lien « Renvoyer le code » ramène à
   l'étape précédente.
3. Saisir le nouveau mot de passe et sa confirmation puis **Confirmer**. Un message indique que le mot de
   passe est réinitialisé et un bouton ramène à la connexion.

### Activer et utiliser la double authentification

Depuis **Mon profil** (voir [Mon profil](../../account/fr/MY_PROFILE.FR.md)), on active la double
authentification : on redonne son mot de passe, on scanne un QR code avec une application
d'authentification (Google Authenticator, Authy…), on saisit le code à six chiffres, puis on note les
**codes de secours** affichés une seule fois (chacun ne sert qu'une fois). Ensuite, chaque connexion demande
un code. Pour les comptes **Owner** et **Super Admin**, une fenêtre impose cette configuration dès la
connexion, avant toute autre action. Un administrateur peut réinitialiser la double authentification d'un
compte depuis sa fiche.

### Se déconnecter

Depuis le menu du compte (clic sur son avatar en haut à droite), entrée **Déconnexion**. On revient à
l'écran de connexion. Une session inactive trop longtemps est aussi fermée automatiquement ; la durée dépend
du poste du compte.

## Cas d'utilisation typiques

1. **Un collaborateur arrive** : il reçoit une invitation, crée son compte avec le lien, puis commence à
   travailler avec les postes qui lui ont été donnés.
2. **Mot de passe oublié** : il passe par « Réinitialiser le mot de passe », saisit le code reçu, puis
   choisit un nouveau mot de passe.
3. **Compte jamais confirmé** : il tente de se connecter ; un nouveau code lui est envoyé et il peut le
   saisir tout de suite.
4. **Téléphone perdu** : il utilise un code de secours, ou demande à un administrateur de réinitialiser sa
   double authentification.

## Points d'attention / limites actuelles

- **Pas de poste, pas d'accès** : un compte sans poste est déconnecté dès qu'il tente d'entrer.
- Le lien d'invitation est à usage unique et expire.
- L'écran de confirmation d'un nouveau compte n'a pas de lien « Renvoyer le code » : pour recevoir un
  nouveau code, il faut tenter de se connecter (le code est renvoyé automatiquement).
- Une personne déjà connectée qui ouvre la connexion est renvoyée vers le tableau de bord.
