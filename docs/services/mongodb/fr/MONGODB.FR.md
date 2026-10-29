# MongoDB

## Table des matières

- [À quoi il sert](#à-quoi-il-sert)
- [Où est le code](#où-est-le-code)
- [Variables](#variables)
- [Mise en place](#mise-en-place)
- [Pièges](#pièges)

## À quoi il sert

MongoDB est la seule base de données : Parse Server y stocke toutes les collections (voir [collections et index](../../../inventory/code/fr/COLLECTIONS_AND_INDEXES.FR.md)). Elle peut tourner en local ou sur un cluster hébergé comme MongoDB Atlas.

## Où est le code

`apps/server/src/index.ts` passe `MONGO_URL` à Parse Server comme `databaseURI`. Ni `web` ni `bo` ne se connectent à la base : ils passent par Parse Server.

## Variables

| Variable | App | Rôle |
|---|---|---|
| `MONGO_URL` | server | Chaîne de connexion, avec identifiants (secret, requise au démarrage) |

## Mise en place

1. En local : démarrer une instance MongoDB et pointer `MONGO_URL` dessus dans `apps/server/.env.preprod`.
2. Hébergé (Atlas) : créer un cluster et un utilisateur de base, autoriser les adresses IP de l'hébergeur (et de votre machine pour le travail local), puis copier la chaîne de connexion.
3. Utiliser une base par environnement (développement, préproduction, production).

## Pièges

- Aucun index n'est créé par le code (voir [collections et index](../../../inventory/code/fr/COLLECTIONS_AND_INDEXES.FR.md#index)) : les listes reposent sur des parcours de collection.
- Le palier gratuit d'Atlas a un petit quota de stockage et met en pause les clusters inactifs.
- Une liste d'IP autorisées Atlas qui oublie l'IP de l'hébergeur fait échouer le démarrage du serveur avec une erreur de connexion.
