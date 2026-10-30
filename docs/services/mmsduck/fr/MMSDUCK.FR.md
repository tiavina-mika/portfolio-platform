# MMSDuck (SMS)

## Table des matières

- [À quoi il sert](#à-quoi-il-sert)
- [Où est le code](#où-est-le-code)
- [Variables](#variables)
- [Mise en place](#mise-en-place)
- [Pièges](#pièges)

## À quoi il sert

MMSDuck est le fournisseur de SMS. Il envoie les codes de vérification du téléphone et de réinitialisation du mot de passe, les avis de ticket et de nouvel appareil, et le SMS de repli des notifications.

## Où est le code

- `apps/server/src/services/mmsduck.service.ts` : le client du fournisseur.
- `apps/server/src/services/sms.service.ts` : choisit le fournisseur du pays d'un numéro (`sendSms`, `sendSmsWithResult`) et prévient l'équipe quand le compte n'a plus de crédit.
- `apps/server/src/cloud/utils/_core/sms.utils.cloud.ts` : les constructeurs de messages (`sendSmsVerification`, `sendSmsToUser`...).

## Variables

| Variable | App | Rôle |
|---|---|---|
| `MMSDUCK_API_KEY` | server | Clé du fournisseur (secret). Obligatoire et non vide en `preProduction` et `production` ; facultative ailleurs |
| `ANDROID_SMS_RETRIEVER_HASH` | server | Facultatif : empreinte ajoutée aux SMS de vérification pour qu'une application Android lise le code |

## Mise en place

1. Créer un compte MMSDuck et une clé d'API, et ajouter du crédit.
2. Poser `MMSDUCK_API_KEY` sur l'hébergeur de chaque environnement déployé.

## Pièges

- En développement et en test aucun SMS n'est envoyé : le message est seulement journalisé.
- Chaque SMS coûte du crédit. Un pays qu'aucun fournisseur ne dessert est refusé avant tout envoi.
- Le serveur ne démarre pas dans un environnement déployé sans la clé.
