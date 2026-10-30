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
- Un champ **Adresse e-mail** (obligatoire) et un bouton **"S'abonner"**.
- Sous le champ, une note rappelant que l'on peut **se désabonner à tout moment** grâce au lien de
  désabonnement présent dans chaque email reçu.

Sur grand écran, le texte est à gauche et le formulaire à droite dans un encadré ; sur téléphone, les
deux sont empilés.

## Actions possibles

### S'abonner

Le visiteur saisit son email et clique sur "S'abonner". Une adresse invalide affiche une erreur sous
le champ, et rien n'est envoyé. Sinon, le formulaire est remplacé par le message **"Presque terminé :
consultez votre boîte mail et confirmez votre inscription avec le lien que je viens de vous
envoyer."**

L'inscription se fait en **deux temps** : l'adresse n'est abonnée qu'une fois le lien de l'email de
confirmation ouvert (voir [Confirmation de l'inscription](NEWSLETTER_CONFIRM.FR.md)). La langue du
site au moment de l'inscription est conservée : l'email de confirmation puis la newsletter arrivent
dans cette langue.

Un visiteur déjà abonné voit le même message de succès, sans indication qu'il l'est déjà : le site ne
révèle pas qui figure sur la liste. Un visiteur qui s'était désabonné, ou qui n'avait jamais confirmé,
reçoit un nouveau lien de confirmation.

Le formulaire est protégé contre les inscriptions automatisées par un contrôle invisible (reCAPTCHA)
et par une limite : au-delà de 5 tentatives en une heure depuis le même appareil, un message "Trop de
requêtes en peu de temps" s'affiche. Hors connexion, un message prévient que l'inscription est
impossible.

## Ce que reçoit l'abonné

D'abord, l'**email de confirmation** avec son lien. Ensuite, chaque fois qu'un **nouvel article** est
créé dans le back-office et qu'il est actif, un email part à tous les abonnés confirmés. Il reprend le
titre et le début de l'article, un bouton pour le lire en entier, et un lien **"Se désabonner"** en bas
du message (voir [Désabonnement de la newsletter](NEWSLETTER_UNSUBSCRIBE.FR.md)).

## Cas d'utilisation typiques

1. **Un lecteur** qui vient de finir un article s'abonne pour ne pas rater les suivants.
2. **Un visiteur** découvre le site depuis la page d'accueil et laisse son email en bas de page.
3. **Un visiteur** découvre l'encart au bas d'un projet et s'abonne pour suivre les nouveautés.
4. **Un ancien abonné** se réinscrit avec le même formulaire et confirme de nouveau.

## Points d'attention / limites actuelles

- Tant que le lien de l'email n'est pas ouvert, l'adresse ne reçoit aucun article : un visiteur qui
  ne trouve pas l'email doit vérifier ses courriers indésirables ou se réinscrire.
- Une faute de frappe dans l'adresse n'abonne personne : le lien part vers une adresse erronée et
  l'inscription reste en attente.
- Seuls les articles déclenchent un envoi : les nouveaux projets ne sont pas envoyés par email.
