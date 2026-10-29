# ADR 003 - Next.js pour le site public, une application monopage Vite pour le back-office

## Table des matières

- [Contexte](#contexte)
- [Décision](#décision)
- [Conséquences](#conséquences)

**Statut** : Accepté (consigné à partir du code)

## Contexte

Le site public est lu par des visiteurs et des moteurs de recherche : il lui faut du rendu serveur, des URL par locale, des métadonnées et un sitemap. Le back-office est utilisé par des utilisateurs connectés derrière une connexion : il lui faut une interface riche, pas d'indexation.

## Décision

- `apps/web` est une app [Next.js](https://nextjs.org) (App Router) avec next-intl pour les routes préfixées par la locale, Tailwind CSS et shadcn/ui. Les pages et requêtes s'exécutent côté serveur et lisent Parse via `parse/node` ; les écritures sont des server actions `next-safe-action`. Pas de connexion ni de Redux.
- `apps/bo` est une application monopage React [Vite](https://vite.dev) avec Material UI, TanStack Router et Redux Toolkit, qui parle à Parse depuis le navigateur. Son build est copié dans `apps/server/clientBuild/bo/<env>` et servi par Express : le back-office et l'API partagent donc une origine et un déploiement.

## Conséquences

- Le site peut être indexé et partagé (sitemap, Open Graph, slugs par locale) ; son build a besoin d'un serveur Parse joignable car les pages sont prérendues depuis le CMS.
- Le back-office n'a pas besoin de runtime Node propre, mais chaque version du back-office passe par l'étape de copie du serveur, et les valeurs `VITE_*` sont dans le bundle public.
- Deux piles d'interface coexistent : un composant s'écrit une fois par client ; seuls la logique et les constantes sont partagées via `libs/`.
