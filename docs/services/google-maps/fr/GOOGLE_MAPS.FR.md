# Google Maps

## Table des matières

- [À quoi il sert](#à-quoi-il-sert)
- [Où est le code](#où-est-le-code)
- [Variables](#variables)
- [Mise en place](#mise-en-place)
- [Pièges](#pièges)

## À quoi il sert

L'API JavaScript Maps affiche une carte interactive (marqueur et fenêtre d'information) sur le site public.

## Où est le code

`apps/web/components/Map.tsx` charge l'API avec `useJsApiLoader` (`@react-google-maps/api`) et la clé issue de `apps/web/env.ts`. Seul `apps/web` l'utilise.

## Variables

| Variable | App | Rôle |
|---|---|---|
| `NEXT_PUBLIC_GOOGLE_MAP_KEY` | web | Clé de l'API JavaScript Maps. Exposée au navigateur par nature : elle se protège par des restrictions, pas par le secret. Requise par `env.ts` |

## Mise en place

1. Dans Google Cloud, créer un projet et activer l'API JavaScript Maps (un compte de facturation est requis, même dans le crédit mensuel gratuit).
2. Créer une clé d'API et la restreindre à l'API JavaScript Maps et aux référents HTTP du site (`localhost` en local, domaines de préproduction et de production).
3. Poser la clé dans `apps/web/.env.local` ou sur l'hébergeur.

## Pièges

- Une clé sans restriction est lisible dans le code source de la page et peut être détournée sur votre facture : toujours la restreindre.
- `env.ts` exige la variable : l'app web ne démarre pas sans clé, même dans un environnement qui n'affiche aucune carte.
- Une restriction de référent qui oublie un domaine affiche la carte grisée avec l'erreur dans la console du navigateur.
