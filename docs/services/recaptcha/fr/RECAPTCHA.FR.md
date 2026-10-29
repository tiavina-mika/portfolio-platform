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
- `apps/web/app/api/recaptcha-verification/route.ts` : envoie le jeton à l'API `siteverify` de Google avec la clé secrète et accepte l'appel quand `success` est vrai et que le score dépasse 0,5.

## Variables

| Variable | App | Rôle |
|---|---|---|
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | web | Clé de site, publique par nature (exposée au navigateur) |
| `RECAPTCHA_SECRET_KEY` | web | Clé secrète, côté serveur uniquement |

## Mise en place

1. Enregistrer le site dans la console d'administration reCAPTCHA avec le type v3 et ajouter les domaines (`localhost` en local, les domaines de préproduction et de production).
2. Poser la clé de site et la clé secrète dans `apps/web/.env.local` ou sur l'hébergeur.
3. Envoyer le formulaire de contact : l'appel de vérification doit répondre un score.

## Pièges

- Les clés sont liées aux domaines enregistrés : un domaine manquant fait échouer la demande de jeton.
- La route de vérification rejette les scores de 0,5 ou moins : des navigateurs stricts, VPN ou outils de confidentialité peuvent être bloqués.
- Un formulaire sans `recaptchaActionName` n'est pas protégé du tout.
