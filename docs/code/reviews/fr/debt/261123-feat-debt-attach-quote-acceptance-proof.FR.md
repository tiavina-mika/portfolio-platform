# Dette — Joindre un fichier de preuve d'acceptation à un devis

> Revue : [261123-feat-attach-quote-acceptance-proof.FR.md](../261123-feat-attach-quote-acceptance-proof.FR.md)
> Branche : `feat/attach-quote-acceptance-proof` · Créée le 2026-11-23 à 17:42 · Auteur : `tiavinamika@gmail.com`
> Statut global : ⏳ à faire

## Table des matières

- [Résumé](#résumé)
- [1. La preuve est servie par une adresse publique](#1-la-preuve-est-servie-par-une-adresse-publique)
- [2. Des réglages du compte Cloudinary peuvent casser la preuve](#2-des-réglages-du-compte-cloudinary-peuvent-casser-la-preuve)
- [3. Un fichier inutilisé après une acceptation refusée](#3-un-fichier-inutilisé-après-une-acceptation-refusée)
- [4. Une preuve sur deux devis](#4-une-preuve-sur-deux-devis)

## Résumé

| # | Gravité | Type | Risque | Statut |
|---|---|---|---|---|
| 1 | 🟠 Moyenne | Faille | Quiconque a l'adresse ouvre la preuve | ⏳ à faire |
| 2 | 🟠 Moyenne | Bug | PDF bloqués, ou preuves refusées, par les réglages du compte | ⏳ à faire |
| 3 | 🟡 Faible | Bug | Une preuve envoyée reste inutilisée après une acceptation refusée | ⏳ à faire |
| 4 | 🟡 Faible | Faille | Un appel forgé réutilise la preuve d'un autre devis | ⏳ à faire |

## 1. La preuve est servie par une adresse publique

- **Gravité** : 🟠 Moyenne · **Type** : Faille · **Statut** : ⏳ à faire
- **Concernés** : `apps/bo/src/services/_domain/quote.service.ts` (`uploadQuoteAcceptanceProof`),
  `apps/server/src/api/_core/cloudinary.api.ts`

**Ce qui peut arriver** — un collègue copie le lien « Preuve d'acceptation » dans un e-mail ou une
messagerie ; qui le reçoit ouvre le devis signé (noms, adresse, signature), sans compte.

**Pourquoi** — la preuve est envoyée comme tous les autres fichiers du back-office (`type: 'upload'`,
diffusion publique). Le nom généré rend l'adresse impossible à deviner, pas privée. Décision 1 de
`tickets/work/attach-an-acceptance-proof-file-to-a-quote/recommendation.md`.

**Comment vérifier** — ouvrir le lien dans une fenêtre privée : le fichier s'affiche.

**Comment corriger**

1. **(recommandé)** Envoyer la preuve en `type: 'authenticated'`, stocker `{ publicId, format }`, et
   ajouter une Cloud Function `getQuoteAcceptanceProofUrl` (espace Aldaron + droit `get` sur `Quote`) qui
   renvoie `generatePrivateDownloadUrl(publicId, format, { type: 'authenticated', expires_at: +1 min })` ;
   la cellule de statut l'appelle au clic.
   *Pourquoi* : le droit est vérifié côté serveur à chaque ouverture et un lien transmis expire en une
   minute ; la fonction utilitaire existe déjà dans `cloudinary.api.ts`.
2. Garder l'adresse publique et le dire dans la doc de fonctionnalité (fait aujourd'hui) — aucune
   protection une fois le lien divulgué.

## 2. Des réglages du compte Cloudinary peuvent casser la preuve

- **Gravité** : 🟠 Moyenne · **Type** : Bug · **Statut** : ⏳ à faire
- **Concernés** : le compte Cloudinary (console), `apps/server/src/utils/_domain/quote.utils.ts`
  (`isQuoteAcceptanceProofFile`)

**Ce qui peut arriver** — (a) le compte bloque la diffusion des PDF (un réglage de sécurité, actif par
défaut sur certains comptes) : le lien répond « 401 ». (b) Le compte utilise les « dossiers dynamiques » et
nomme les fichiers sans leur dossier dans l'identifiant public : le serveur refuse toutes les preuves
(« Cette preuve n'est pas un fichier envoyé depuis le back-office »).

**Pourquoi** — les deux dépendent du compte, pas du code ; aucun compte n'était joignable depuis la
machine qui a construit la branche.

**Comment vérifier** — cas 2 de `tc-manual.md` en pré-production ; pour (b), le `publicId` renvoyé par
l'envoi doit commencer par `quotes/acceptance-proofs/`.

**Comment corriger**

1. **(recommandé)** Vérifier les deux réglages pendant le test manuel : Settings → Security → « Allow
   delivery of PDF and ZIP files » activé ; si (b) arrive, passer `public_id_prefix` / garder `folder`
   dans la configuration de l'envoi pour que l'identifiant public porte le dossier.
   *Pourquoi* : un réglage, aucun changement de code, dans la console que le propriétaire gère déjà.
2. Assouplir le contrôle du dossier sur `asset_folder` — il faut que la réponse de l'envoi le porte,
   plus de code.

## 3. Un fichier inutilisé après une acceptation refusée

- **Gravité** : 🟡 Faible · **Type** : Bug · **Statut** : ⏳ à faire
- **Concernés** : `apps/bo/src/redux/actions/_domain/quote.action.ts` (`setQuoteStatus`)

**Ce qui peut arriver** — le fichier est envoyé, puis `changeQuoteStatus` est refusé (le devis a été
changé par quelqu'un d'autre entre-temps, droits perdus) : le fichier reste dans
`quotes/acceptance-proofs/`, référencé par rien.

**Pourquoi** — l'envoi et le changement de statut sont deux appels ; rien ne nettoie le dossier.

**Comment vérifier** — accepter, avec un fichier, un devis qu'un autre onglet a déjà refusé ; lister le
dossier.

**Comment corriger**

1. **(recommandé)** Une tâche de purge du dossier, comme `purgeOrphanedEditorFilesJob` : les fichiers de
   plus d'un jour dont aucun `Quote.acceptanceProof.publicId` ne porte le `publicId` sont supprimés. La
   tâche vit dans le domaine (`cloud/jobs/_domain/quote.jobs.ts`), jamais dans celle du cœur.
   *Pourquoi* : une tâche couvre tous les cas d'échec, et réutilise `listFilesByFolder` / `destroyFiles`.
2. Supprimer le fichier côté serveur quand l'enregistrement échoue — il faut vérifier qu'aucun autre devis
   ne le porte.

## 4. Une preuve sur deux devis

- **Gravité** : 🟡 Faible · **Type** : Faille · **Statut** : ⏳ à faire
- **Concernés** : `apps/server/src/cloud/triggers/_domain/quote.triggers.ts`

**Ce qui peut arriver** — une personne qui a le droit d'accepter des devis appelle `changeQuoteStatus` à
la main avec la preuve d'un autre devis : les deux devis montrent le même fichier.

**Pourquoi** — le trigger vérifie que le fichier est une preuve de la plateforme, pas qu'aucun autre
devis ne l'utilise.

**Comment corriger**

1. **(recommandé)** Dans le trigger, refuser une preuve dont un autre devis porte déjà le `publicId` (un
   `first()` sur `acceptanceProof.publicId` dans `quote.service.cloud.ts`, `select([])`).
   *Pourquoi* : une requête par acceptation, ce qui est rare ; ferme complètement le cas.
2. Laisser tel quel : l'appelant a déjà le droit d'accepter des devis, le tort est une preuve trompeuse.
