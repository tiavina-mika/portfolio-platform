# Revue — Joindre un fichier de preuve d'acceptation à un devis

- **Branche** : `feat/attach-quote-acceptance-proof`
- **Type** : Nouvelle fonctionnalité
- **Auteur** : tiavina-mika — `tiavinamika@gmail.com` *(identité git locale)*
- **Créée** : 2026-11-23 à 17:42
- **Apps touchées** : Serveur, Back-office (et la bibliothèque partagée `shared-domain-constants`)

## Table des matières

- [En bref](#en-bref)
- [Base de données](#base-de-données)
- [Serveur](#serveur)
- [Back-office](#back-office)
- [Voir le résultat en local](#voir-le-résultat-en-local)
- [Bugs, régressions et failles possibles](#bugs-régressions-et-failles-possibles)
- [Résultat par critère d'acceptation](#résultat-par-critère-dacceptation)
- [Vérifications lancées](#vérifications-lancées)
- [Ce qui reste à faire](#ce-qui-reste-à-faire)

## En bref

Quand une personne du back-office travaillant dans l'espace Aldaron marque un devis comme accepté, elle
peut maintenant joindre un fichier de preuve : le devis signé ou l'e-mail du client, en PDF ou en image
(JPG, PNG, WEBP), 5 Mo au plus. Le fichier est stocké avec les autres fichiers du back-office, sous un nom
généré. Dans la liste des devis, un devis accepté avec une preuve affiche un lien « Preuve d'acceptation »
sous son statut, qui ouvre le fichier dans un nouvel onglet. Le serveur n'accepte une preuve qu'avec
l'acceptation elle-même, et seulement un fichier du dossier de preuves de la plateforme. Accepter sans
fichier fonctionne comme avant.

## Base de données

| Classe | Nouvelle ? | Champs ajoutés / modifiés | À quoi ça sert |
|---|---|---|---|
| `Quote` | non | `acceptanceProof` *(ajouté : `{ publicId, url }`, facultatif)* | le fichier sur lequel repose l'acceptation |

Pas d'index : le champ n'est lu qu'avec le devis, jamais filtré ni trié. Les devis acceptés avant la
branche n'ont simplement pas de preuve.

## Serveur

- `changeQuoteStatus` accepte un `acceptanceProof` facultatif (`{ publicId, url }`, rien d'autre),
  seulement avec `status: accepted`.
- Le `beforeSave` de `Quote` refuse une preuve sur tout autre passage (et sur un devis déjà accepté), et
  refuse un fichier qui n'est pas une adresse `https` du compte Cloudinary de la plateforme, sous
  `quotes/acceptance-proofs/`, avec une extension acceptée : aucun lien étranger ne peut être enregistré
  puis ouvert par un collègue. Un nouveau devis n'en porte jamais.
- La liste et la lecture d'un devis renvoient la preuve. Deux nouvelles erreurs traduites (`fr`, `en`,
  `mg`).
- Aucune nouvelle Cloud Function, aucun nouveau fichier de triggers, variable ou service : l'inventaire
  ne change pas.

## Back-office

- **Pages touchées** : **Devis**, `http://localhost:5174/devis` (en français ; `/quotes` en anglais),
  espace Aldaron seulement.
- La fenêtre « Accepter le devis » a une zone de dépôt facultative « Preuve d'acceptation » sous
  « Comment le client a accepté ». À la confirmation, le fichier est envoyé d'abord, puis le devis est
  accepté ; si l'envoi échoue, le devis reste envoyé et un message le dit.
- La cellule de statut d'un devis accepté avec preuve affiche le lien « Preuve d'acceptation » (nouvel
  onglet, nommé « Preuve d'acceptation du devis AL-… (s'ouvre dans un nouvel onglet) » pour les lecteurs
  d'écran).
- Doc de fonctionnalité mise à jour : [Devis](../../../features/bo/quotes/fr/QUOTES.FR.md).

## Voir le résultat en local

```bash
pnpm nx run server:dev   # demande une base et un compte Cloudinary dans apps/server/.env.*
pnpm nx run bo:dev       # back-office sur http://localhost:5174
```

Se connecter avec un rôle qui ouvre Aldaron, passer dans l'espace Aldaron, ouvrir **Devis**
(`http://localhost:5174/devis`), marquer un devis envoyé comme accepté avec un PDF. Pas de story : le
back-office n'a pas de Storybook.

## Bugs, régressions et failles possibles

| Gravité | Type | Ce qui peut arriver | Quand | Suite |
|---|---|---|---|---|
| 🟠 Moyenne | Faille | Une preuve (données personnelles, signature) est accessible à qui obtient son adresse | le lien est transmis hors de l'équipe | ⏳ reporté — [dette n°1](debt/261123-feat-debt-attach-quote-acceptance-proof.FR.md#1-la-preuve-est-servie-par-une-adresse-publique) |
| 🟠 Moyenne | Bug | Le lien de preuve répond « non autorisé », ou toutes les preuves sont refusées | le compte Cloudinary bloque les PDF, ou nomme les fichiers sans leur dossier | ⏳ reporté — [dette n°2](debt/261123-feat-debt-attach-quote-acceptance-proof.FR.md#2-des-réglages-du-compte-cloudinary-peuvent-casser-la-preuve) |
| 🟡 Faible | Bug | Une preuve envoyée reste inutilisée dans le stockage | l'acceptation est refusée après l'envoi | ⏳ reporté — [dette n°3](debt/261123-feat-debt-attach-quote-acceptance-proof.FR.md#3-un-fichier-inutilisé-après-une-acceptation-refusée) |
| 🟡 Faible | Faille | Deux devis pointent vers le même fichier de preuve | un appel forgé réutilise la preuve d'un autre devis | ⏳ reporté — [dette n°4](debt/261123-feat-debt-attach-quote-acceptance-proof.FR.md#4-une-preuve-sur-deux-devis) |
| 🟡 Faible | Bug | Une extension en majuscules (`.PDF`) refusée | toujours, avant la correction | ✅ corrigé sur la branche : l'extension est comparée en minuscules, test ajouté |

Régressions vérifiées : `setQuoteStatus` (bo) et `changeQuoteStatusService` (serveur) changent de
signature ; leurs seuls appelants (`Quotes.tsx`, `changeQuoteStatus`) sont à jour. Les tests du serveur
passent (78).

Points reportés : [fichier de dette](debt/261123-feat-debt-attach-quote-acceptance-proof.FR.md).

## Résultat par critère d'acceptation

| Critère | Résultat | Preuve |
|---|---|---|
| Joindre un fichier (PDF ou image) en acceptant | partiel : construit, pas lancé en vrai | `QuoteAcceptDialog.tsx`, `quote.action.ts` ; contrôle serveur testé dans `quote.utils.test.ts` |
| Ouvrir la preuve depuis la liste | partiel : construit, pas lancé en vrai | `QuoteStatusCell.tsx` |
| Pas de preuve sur un devis qui n'est pas en train d'être accepté | traité | `quote.validations.test.ts`, `quote.utils.test.ts` (`canAttachQuoteAcceptanceProof`) + trigger |
| Libellés et erreurs en `fr`, `en`, `mg` | traité | `pnpm check-i18n` |

Écarts avec le plan : aucun. Non vérifié : tous les cas réels (pas de base locale ni de compte
Cloudinary).

## Vérifications lancées

- `pnpm nx run-many -t lint typecheck -p server bo` : ok (avertissements seulement, déjà présents).
- `pnpm nx run server:test` : ok, 6 fichiers, 78 tests.
- `pnpm nx run-many -t build -p server bo` : ok.
- `pnpm check-i18n`, `pnpm lint:docs`, `pnpm check-doc-links`, `pnpm check-doc-twins --worktree` : ok.

## Ce qui reste à faire

Les cas réels de `tickets/work/attach-an-acceptance-proof-file-to-a-quote/tc-manual.md`, en
pré-production ; les quatre points reportés ci-dessus.
