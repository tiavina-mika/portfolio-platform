# ADR 001 - Parse Server sur MongoDB comme backend

## Table des matières

- [Contexte](#contexte)
- [Décision](#décision)
- [Conséquences](#conséquences)

**Statut** : Accepté (consigné à partir du code)

## Contexte

La plateforme a besoin d'une base dont la forme change souvent (contenu traduit par locale, blocs imbriqués), de comptes utilisateurs avec des rôles, de la gestion de fichiers, de jobs en arrière-plan et de validation côté serveur, pour un seul mainteneur. Écrire et exploiter une API REST sur mesure avec son propre ORM, son authentification et son système de rôles coûterait plus cher que le produit lui-même.

## Décision

`apps/server` fait tourner Express avec [Parse Server](https://parseplatform.org) monté sur `/parse`, adossé à MongoDB (`MONGO_URL`). Les règles métier vivent dans le Cloud Code sous `apps/server/src/cloud/` : fonctions, triggers `beforeSave` / `afterSave` / `afterDelete` et jobs. Les utilisateurs et les rôles sont les classes natives `_User` et `_Role`. Express n'ajoute que ce que Parse ne couvre pas : l'envoi de fichiers, le téléchargement du CV, les fichiers statiques du back-office et une route ping.

Les clients utilisent le SDK JS de Parse : le back-office directement depuis le navigateur, le site depuis son code serveur (`parse/node`).

## Conséquences

- Les schémas sont implicites : un champ existe quand le code l'écrit, donc les chemins de lecture doivent tolérer les champs manquants, et les index et permissions au niveau des classes sont configurés hors du code (voir [RIGHTS_ROLES.FR.md](../../architecture/fr/RIGHTS_ROLES.FR.md)).
- L'authentification, les sessions, les rôles, une API REST et les jobs sont fournis, voir [AUTH.FR.md](../../architecture/fr/AUTH.FR.md).
- Les règles côté serveur sont dans des triggers : une règle s'applique quel que soit le client ; en contrepartie, les triggers s'exécutent à chaque enregistrement et demandent de la prudence avec les appels en `master key`.
- La logique métier est liée au modèle du Cloud Code de Parse ; quitter Parse reviendrait à réécrire `apps/server`.
