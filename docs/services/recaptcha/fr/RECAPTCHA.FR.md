# Google reCAPTCHA

## Table des matières

- [À quoi il sert](#à-quoi-il-sert)
- [Où est le code](#où-est-le-code)
- [Variables](#variables)
- [Mise en place](#mise-en-place)
- [Pièges](#pièges)

## À quoi il sert

reCAPTCHA v3 (basé sur un score, invisible) protège les formulaires publics du site contre les robots : le formulaire de contact et celui de la newsletter.

## Où est le code

- `apps/web/hooks/useServerAction.ts` : quand un formulaire donne un `recaptchaActionName`, il obtient un jeton avec `react-google-recaptcha-hook` avant de lancer l'action serveur. Les formulaires utilisent les noms `contactForm` (`containers/contact/ContactForm.tsx`) et `newsletterForm` (`containers/newsletter/NewsLetterForm.tsx`).
- `apps/web/server/mutations/app.mutation.ts` et `newsletter.mutation.ts` : transmettent le jeton au serveur dans l'appel de la Cloud Function (`createPublicContact`, `subscribeToNewsletter`). Le site ne le vérifie plus lui-même et la route `/api/recaptcha-verification` n'existe plus.
- `apps/server/src/utils/_core/recaptcha.utils.ts` (`verifyRecaptchaToken`) : envoie le jeton à l'API `siteverify` de Google avec la clé secrète et l'accepte quand `success` est vrai et que le score dépasse 0,5. Vérifier dans la Cloud Function protège les données, pas seulement le formulaire. Ignoré en développement et en test ; une clé manquante refuse tout ailleurs.

## Variables

| Variable | App | Rôle |
|---|---|---|
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | web | Clé de site, publique par nature (exposée au navigateur) |
| `RECAPTCHA_SECRET_KEY` | server | Clé secrète, lue par le serveur seul (ce n'est plus une variable du web) |

## Mise en place

1. Enregistrer le site dans la console d'administration reCAPTCHA avec le type v3 et ajouter les domaines (`localhost` en local, les domaines de préproduction et de production).
2. Poser la clé de site dans `apps/web/.env.local` (ou sur l'hébergeur du web) et la clé secrète dans `apps/server/.env.preprod` (ou sur l'hébergeur du serveur).
3. Envoyer le formulaire de contact sur un environnement déployé : le serveur doit l'accepter (hors production la vérification est ignorée).

## Pièges

- Les clés sont liées aux domaines enregistrés : un domaine manquant fait échouer la demande de jeton.
- Le serveur rejette les scores de 0,5 ou moins : des navigateurs stricts, VPN ou outils de confidentialité peuvent être bloqués.
- Un formulaire sans `recaptchaActionName` n'est pas protégé du tout.
