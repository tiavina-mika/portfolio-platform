# Cloudinary

## Table des matières

- [À quoi il sert](#à-quoi-il-sert)
- [Où est le code](#où-est-le-code)
- [Variables](#variables)
- [Mise en place](#mise-en-place)
- [Pièges](#pièges)

## À quoi il sert

Cloudinary stocke les images et fichiers envoyés depuis le back-office (images de projets et d'articles, images du site, le CV). Le site public les affiche depuis `res.cloudinary.com`.

## Où est le code

- `apps/server/src/config/config.ts` : `initializeCloudinary()` (appelée au démarrage du serveur) et le stockage mémoire de `multer`.
- `apps/server/src/services/files.service.ts` : envoi et suppression via le SDK Cloudinary.
- `apps/server/src/controllers/files.controller.ts` et `routes/files.route.ts` : la route d'envoi `/files`.
- `apps/server/src/utils/file.utils.ts` : noms de dossiers (`users/<userId>/<folder>` quand un id utilisateur est fourni).
- `apps/server/src/utils/cms.utils.ts` (`destroyOldFilesAfterUpdate`) : supprime le fichier remplacé après une mise à jour.
- `apps/web/next.config.*` : autorise `res.cloudinary.com` pour `next/image`.

## Variables

| Variable | App | Rôle |
|---|---|---|
| `CLOUDINARY_NAME` | server | Nom du cloud |
| `CLOUDINARY_API_KEY` | server | Clé d'API |
| `CLOUDINARY_API_SECRET` | server | Secret d'API (ne jamais l'exposer) |

Les trois sont requises au démarrage par `validateEnv`.

L'agence (Aldaron) peut avoir son propre compte :

| Variable | App | Rôle |
|---|---|---|
| `AGENCY_CLOUDINARY_NAME` | server | Nom du cloud du compte de l'agence |
| `AGENCY_CLOUDINARY_API_KEY` | server | Clé d'API du compte de l'agence |
| `AGENCY_CLOUDINARY_API_SECRET` | server | Secret d'API du compte de l'agence (ne jamais l'exposer) |

Facultatives, mais les trois ou aucune : un ensemble partiel arrête le démarrage. Non définies, les fichiers de l'agence vont dans le compte du portfolio.

## Mise en place

1. Créer un compte Cloudinary et copier le nom du cloud et les identifiants d'API depuis le tableau de bord.
2. Poser les trois variables dans `apps/server/.env.preprod` (local) ou sur l'hébergeur.
3. Envoyer un fichier depuis le back-office pour vérifier : il apparaît dans la Media Library sous le dossier demandé.

## Quel compte détient un fichier

- Un envoi va dans le compte de l'espace pour lequel il est fait : celui où se trouve le back-office (envoyé avec le fichier, et vérifié d'après les rôles du compte), l'espace propre du compte quand aucun n'est envoyé.
- Un fichier est retrouvé par le nom du cloud dans son adresse enregistrée (`https://res.cloudinary.com/<nom du cloud>/…`) : le supprimer, le remplacer, le mettre à la corbeille ou le télécharger passe par le compte nommé là. Les fichiers enregistrés avant que l'agence ait son compte portent le nom du portfolio : ils restent où ils sont.
- Les jobs de purge (corbeille, images d'éditeur orphelines) tournent une fois par compte.
- L'asset `agency-logo` des e-mails de l'agence est lu dans le compte de l'agence : il doit y être téléversé (racine, identifiant public `agency-logo`).

## Pièges

- Les fichiers transitent par le serveur (stockage mémoire, au plus `MAX_FILES_UPLOAD` fichiers par requête) et ne sont pas gardés sur disque.
- Utiliser un compte ou un dossier Cloudinary distinct par environnement pour que les tests de préproduction ne suppriment jamais des images de production.
- Remplacer un fichier dans le back-office supprime l'ancien de Cloudinary.
