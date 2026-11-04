# MMSDuck (SMS)

## Table des matières

- [À quoi il sert](#à-quoi-il-sert)
- [Où est le code](#où-est-le-code)
- [Variables](#variables)
- [Mise en place](#mise-en-place)
- [Pièges](#pièges)

## À quoi il sert

MMSDuck est le fournisseur de SMS. Il envoie les codes de vérification du téléphone et de réinitialisation du mot de passe, les avis de nouvel appareil, et le SMS de repli des notifications.

## Où est le code

- `apps/server/src/services/mmsduck.service.ts` : le client du fournisseur.
- `apps/server/src/services/sms.service.ts` : choisit le fournisseur du pays d'un numéro (`sendSms`, `sendSmsWithResult`) et prévient l'équipe quand le compte n'a plus de crédit.
- `apps/server/src/cloud/utils/_core/sms.utils.cloud.ts` : les constructeurs de messages (`sendSmsVerification`, `sendSmsToUser`...).

## Variables

| Variable | App | Rôle |
|---|---|---|
| `MMSDUCK_API_KEY` | server | Clé du fournisseur (secret). Facultative dans tous les environnements ; sans elle chaque SMS est refusé avec un avertissement dans les logs |

## Mise en place

1. Ne rien faire tant qu'aucun SMS n'est utilisé : le serveur démarre sans la clé.
2. Pour envoyer des SMS : créer un compte MMSDuck et une clé d'API, ajouter du crédit, et poser `MMSDUCK_API_KEY` sur l'hébergeur de chaque environnement déployé.

## Pièges

- En développement et en test aucun SMS n'est envoyé : le message est seulement journalisé.
- Chaque SMS coûte du crédit. Un pays qu'aucun fournisseur ne dessert est refusé avant tout envoi.
- Sans la clé, un serveur déployé démarre quand même, mais chaque SMS est refusé (code d'erreur `sms_not_configured`, enregistré sur le destinataire) et les codes envoyés par SMS n'arrivent jamais.
