# Cas d'utilisation — Site public (Contact)

## Table des matières

- [Où trouver cette page](#où-trouver-cette-page)
- [À quoi sert cette page](#à-quoi-sert-cette-page)
- [Qui peut l'utiliser](#qui-peut-lutiliser)
- [Ce que l'on voit à l'écran](#ce-que-lon-voit-à-lécran)
- [Actions possibles](#actions-possibles)
- [Ce qui se passe après l'envoi](#ce-qui-se-passe-après-lenvoi)
- [Cas d'utilisation typiques](#cas-dutilisation-typiques)
- [Points d'attention / limites actuelles](#points-dattention--limites-actuelles)

---

## Où trouver cette page

Lien **"Me contacter"** du menu de navigation (présent sur toutes les pages) et lien "Contactez-moi"
du pied de page. L'adresse est `/contact-me` en anglais et `/contactez-moi` en français. Le même
formulaire est aussi intégré à la page d'accueil, dans le bloc "Discutons ensemble". La page
d'erreur "Page introuvable" propose elle aussi un lien "Me contacter".

## À quoi sert cette page

Elle permet à un visiteur d'écrire directement au propriétaire du portfolio : proposition de projet,
demande de collaboration, question ou simple message.

## Qui peut l'utiliser

Tout visiteur, sans connexion ni compte.

## Ce que l'on voit à l'écran

- **Sur la page "Me contacter"** : à gauche, le titre "Me contacter" et un texte qui explique comment
  se déroule une collaboration (un premier échange pour se connaître, la compréhension du contexte et
  des objectifs, puis un accord et le démarrage de la mission) ; à droite, le formulaire dans une
  carte. Sur téléphone et tablette, le texte puis le formulaire sont empilés.
- **Sur la page d'accueil** : le même formulaire, sans titre de champs (les indications sont écrites
  dans les champs), suivi des icônes des réseaux et moyens de contact du propriétaire.
- Le formulaire comporte trois champs, tous obligatoires, signalés par une étoile :
  - **Email**
  - **Nom**
  - **Message** (zone de texte de plusieurs lignes)
- Un bouton **"Envoyer"**.

Règles de saisie : l'email doit avoir un format valide, le nom ne dépasse pas 120 caractères et le
message ne dépasse pas 500 caractères. Un champ mal rempli affiche un message d'erreur dans la langue
du site.

## Actions possibles

### Envoyer un message

Une fois les trois champs remplis, un clic sur "Envoyer" enregistre le message. Le texte **"Votre
message a été envoyé."** s'affiche, et le formulaire est vidé, prêt pour un autre message. Pendant
l'envoi, le bouton indique que l'opération est en cours.

Si l'envoi échoue, un message d'erreur apparaît et le visiteur peut réessayer.

### Utiliser les autres moyens de contact

Les icônes sous le formulaire de la page d'accueil, et celles du pied de page, mènent aux réseaux et
moyens de contact du propriétaire : LinkedIn, WhatsApp, Instagram, email, Skype et YouTube. Le pied de
page indique aussi l'adresse postale (Antananarivo, Madagascar) et l'adresse email.

## Ce qui se passe après l'envoi

Le message est enregistré et apparaît dans la section "Contacts" du back-office, où le propriétaire
le consulte et peut y répondre par email (voir la documentation du back-office). La langue du
visiteur est conservée avec le message, et si l'adresse email correspond à un utilisateur déjà connu
du système, le message est rattaché à cet utilisateur.

L'adresse email du visiteur est aussi ajoutée à la liste de contacts du service d'envoi d'emails du
propriétaire.

## Cas d'utilisation typiques

1. **Un client potentiel** décrit son projet et demande un premier échange.
2. **Un recruteur** propose un entretien après avoir lu le CV.
3. **Un confrère** pose une question sur un article ou un projet.
4. **Un visiteur sur mobile** écrit depuis la page d'accueil sans changer de page.

## Points d'attention / limites actuelles

- Le visiteur ne reçoit **pas** d'email de confirmation après l'envoi : seul le message affiché à
  l'écran confirme l'envoi.
- Il n'existe pas de case pour s'abonner à la newsletter depuis ce formulaire : l'inscription se fait
  dans la zone dédiée ([Inscription à la newsletter](../../newsletter/fr/NEWSLETTER_SUBSCRIBE.FR.md)).
- Le formulaire est protégé contre les envois automatisés par un contrôle invisible (reCAPTCHA) ; si
  ce contrôle échoue, un message d'erreur s'affiche et rien n'est envoyé.
- La réponse du propriétaire arrive par email à l'adresse laissée : il faut donc une adresse valide
  et consultée.
