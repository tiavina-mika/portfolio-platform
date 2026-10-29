# Cas d'utilisation — Site public (Inscription à la newsletter)

## Table des matières

- [Où trouver cette page](#où-trouver-cette-page)
- [À quoi sert cette page](#à-quoi-sert-cette-page)
- [Qui peut l'utiliser](#qui-peut-lutiliser)
- [Ce que l'on voit à l'écran](#ce-que-lon-voit-à-lécran)
- [Actions possibles](#actions-possibles)
- [Ce que reçoit l'abonné](#ce-que-reçoit-labonné)
- [Cas d'utilisation typiques](#cas-dutilisation-typiques)
- [Points d'attention / limites actuelles](#points-dattention--limites-actuelles)

---

## Où trouver cette page

L'inscription n'a pas de page à elle : c'est un encart **"S'abonner à ma newsletter"**, placé en bas
de la page d'accueil, de chaque page de détail de projet et de chaque article. On ne le trouve pas
sur les listes de projets et d'articles, ni sur les pages de contact ou de contenu.

## À quoi sert cette page

Elle permet à un visiteur de recevoir par email les nouveaux articles et tutoriels publiés sur le
blog, ainsi que, selon le texte de l'encart, des offres spéciales.

## Qui peut l'utiliser

Tout visiteur, sans connexion ni compte.

## Ce que l'on voit à l'écran

- Un titre, **"S'abonner à ma newsletter"**, et un court texte qui explique l'intérêt de
  l'abonnement.
- Un champ **Email** (obligatoire) et un bouton **"S'abonner"**.
- Sous le champ, une note rappelant que l'on peut **se désabonner à tout moment** grâce au lien de
  désabonnement présent dans chaque email reçu.

Sur grand écran, le texte est à gauche et le formulaire à droite dans un encadré ; sur téléphone, les
deux sont empilés.

## Actions possibles

### S'abonner

Le visiteur saisit son email et clique sur "S'abonner". Le message **"Vous êtes maintenant abonné à
notre newsletter."** s'affiche et le champ est vidé. L'inscription est **immédiate** : il n'y a pas
d'email de confirmation à valider. Une adresse email invalide affiche une erreur de saisie.

La langue du site au moment de l'inscription est conservée : l'abonné reçoit ensuite les emails
dans cette langue.

Le formulaire est protégé contre les inscriptions automatisées par un contrôle invisible (reCAPTCHA).

## Ce que reçoit l'abonné

Chaque fois qu'un **nouvel article** est créé dans le back-office et qu'il est actif, un email part à
tous les abonnés actifs. Il reprend le titre et le début de l'article, un bouton pour le lire en
entier, et un lien **"Se désabonner"** en bas du message (voir
[Désabonnement de la newsletter](NEWSLETTER_UNSUBSCRIBE.FR.md)).

## Cas d'utilisation typiques

1. **Un lecteur** qui vient de finir un article s'abonne pour ne pas rater les suivants.
2. **Un visiteur** découvre le site depuis la page d'accueil et laisse son email en bas de page.
3. **Un visiteur** découvre l'encart au bas d'un projet et s'abonne pour suivre les nouveautés.

## Points d'attention / limites actuelles

- Il n'y a pas de confirmation par email (inscription sans validation) : une faute de frappe dans
  l'adresse inscrit donc une adresse erronée sans que personne ne soit prévenu.
- Le visiteur ne reçoit pas d'email de bienvenue à l'inscription.
- Un visiteur déjà inscrit qui saisit à nouveau son adresse voit le même message de succès, sans
  indication qu'il est déjà abonné.
- Seuls les articles déclenchent un envoi : les nouveaux projets ne sont pas envoyés par email.
- Pour recevoir de nouveau les emails après un désabonnement, le visiteur doit utiliser le lien
  "se réabonner" de la page de désabonnement ; se réinscrire par ce formulaire n'est pas prévu pour
  cela.
