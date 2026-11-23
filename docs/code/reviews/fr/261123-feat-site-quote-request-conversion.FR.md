# Revue — Transformer une demande de devis du site en client et en devis

- **Branche** : `feat/site-quote-request-conversion`
- **Type** : Nouvelle fonctionnalité
- **Auteur** : tiavina-mika *(identité git locale ; l'e-mail n'a pas pu être lu dans cette session)*
- **Créée** : 2026-11-23 à 19:34
- **Apps touchées** : Serveur, Back-office, site d'Aldaron (et la bibliothèque partagée `shared-constants`)

## Table des matières

- [En bref](#en-bref)
- [Base de données](#base-de-données)
- [Serveur](#serveur)
- [Back-office](#back-office)
- [Site d'Aldaron](#site-daldaron)
- [Voir le résultat en local](#voir-le-résultat-en-local)
- [Bugs, régressions et failles possibles](#bugs-régressions-et-failles-possibles)
- [Résultat par critère d'acceptation](#résultat-par-critère-dacceptation)
- [Vérifications lancées](#vérifications-lancées)
- [Ce qui reste à faire](#ce-qui-reste-à-faire)

## En bref

Une demande de devis envoyée depuis le site d'Aldaron est désormais rangée dans l'espace Aldaron : la page
**Contacts** liste les messages de l'espace où l'on travaille, et un message d'un espace que les rôles du
compte n'ouvrent pas se lit comme introuvable. Sous une demande Aldaron, **Créer le client et le devis** ouvre
le formulaire de devis prérempli : le client qui a la même adresse e-mail (ou un nouveau client créé depuis la
demande), le produit comme titre, et une ligne à 0 par ligne de l'estimation du visiteur, que l'équipe chiffre.
Une fois enregistrée, la demande affiche le numéro de son devis et ne peut pas devenir un second devis. Rien ne
change pour le visiteur.

## Base de données

| Classe | Nouvelle ? | Champs ajoutés / modifiés | À quoi ça sert |
|---|---|---|---|
| `Contact` | non | `target` *(ajouté : `portfolio` ou `agency`)* | l'espace où le message se lit ; un message enregistré avant n'en a pas et se lit comme celui du portfolio |
| `Contact` | non | `quote` *(ajouté : pointeur `Quote`, facultatif)* | le devis qu'une demande Aldaron est devenue ; une demande qui en a un n'est plus jamais convertie |

Index ajouté sur `Contact` : `{ target: 1, deleted: 1, createdAt: -1 }`, pour la boîte d'un espace, du plus
récent au plus ancien (celle du portfolio lit aussi les lignes sans cible). `target` est aussi précréé dans le
schéma de `Contact`. Pas de migration : les anciennes demandes Aldaron restent dans le portfolio jusqu'à
`150-move-old-contacts-to-the-aldaron-target`.

## Serveur

- `createPublicContact` accepte une `target` facultative et enregistre `portfolio` quand il n'y en a pas.
- `getContacts` reçoit l'espace (`workspace`) et le vérifie avec `resolveWorkspace`, comme les articles ;
  `getContact` répond « introuvable » pour un message d'un espace que le compte n'ouvre pas.
- Nouvelle Cloud Function `prepareQuoteFromContact` (`id`, demande `create` sur `Quote`, espace Aldaron
  seulement) : la demande doit être une demande Aldaron, hors corbeille, avec un e-mail, pas encore convertie.
  Elle renvoie le client qui a cet e-mail (quelle que soit la casse ; refusé s'il est archivé) ou en crée un
  (un particulier avec le nom, l'e-mail et le téléphone ; il faut `create` sur `Client`), et le préremplissage
  lu dans le message.
- `createQuote` accepte un `contact` facultatif : il revérifie la demande, écrit le devis, puis fait pointer
  la demande vers lui. Une demande ne peut pas être donnée avec `parentQuote`.
- Les libellés du message de demande (`Product`, `Estimate`…) sont désormais des constantes partagées par le
  site qui les écrit et le serveur qui les lit. Cinq nouveaux messages traduits (`fr`, `en`, `mg`).
- Inventaire mis à jour : [Cloud Functions](../../../inventory/code/fr/CLOUD_FUNCTIONS.FR.md),
  [collections et index](../../../inventory/code/fr/COLLECTIONS_AND_INDEXES.FR.md). Aucune nouvelle variable
  ni service.

## Back-office

- **Pages touchées** : **Contacts**, `http://localhost:5174/contacts` (les deux espaces) ; le formulaire de
  devis de **Devis**.
- La liste suit l'espace ; changer d'espace depuis la page referme le message ouvert et recharge la liste.
  L'export le suit aussi.
- Espace Aldaron, sous une demande, pour un compte qui peut créer des devis : **Créer le client et le devis**
  → la fenêtre « Nouveau devis pour <nom> », préremplie. Après l'enregistrement : « Cette demande est devenue
  le devis AL-… » avec **Voir les devis**.
- La boîte générique reçoit un registre d'actions qu'un domaine ajoute sous un message
  (`registerContactDetailActions`) : les devis y branchent la leur depuis les enregistrements du domaine, donc
  le code des contacts n'importe jamais les devis.
- Docs de fonctionnalité mises à jour : [Contacts](../../../features/bo/contacts/fr/CONTACTS_LIST.FR.md),
  [Devis](../../../features/bo/quotes/fr/QUOTES.FR.md).

## Site d'Aldaron

- **Pages touchées** : aucune de façon visible. Le formulaire de la page contact (`/fr/contact`) envoie
  `target: agency` avec la demande ; le texte du message est le même, et l'estimation est toujours effacée du
  navigateur une fois envoyée.

## Voir le résultat en local

```bash
pnpm nx run server:dev        # demande une base de données dans apps/server/.env.*
pnpm nx run bo:dev            # back-office sur http://localhost:5174
pnpm nx run aldaron-web:dev   # le site d'Aldaron
```

Envoyer le formulaire de contact du site d'Aldaron, puis dans le back-office passer dans l'espace Aldaron et
ouvrir **Contacts** (`http://localhost:5174/contacts`). Pas de story : le code du site touché ne change aucune
story, et le back-office n'a pas de Storybook.

## Bugs, régressions et failles possibles

| Gravité | Type | Ce qui peut arriver | Quand | Suite |
|---|---|---|---|---|
| 🟡 Faible | Faille | Le compteur des non-lus et la recherche globale comptent et montrent encore les messages des deux espaces : un compte limité au portfolio voit une demande Aldaron dans la recherche (son détail se lit alors « introuvable ») | toujours | ⏳ prévu — ticket `190-scope-the-contact-badge-and-search-to-the-workspace` |
| 🟡 Faible | Bug | Deux enregistrements d'un devis depuis la même demande dans la même seconde passent tous deux la vérification : deux devis, la demande pointant vers le dernier | deux onglets, ou un double clic sur Enregistrer | ⏳ reporté — [dette n° 1](debt/261123-feat-debt-site-quote-request-conversion.FR.md#1-deux-devis-depuis-une-demande-enregistrés-au-même-moment) |
| 🟡 Faible | Bug | Un client créé par le bouton reste quand on ferme le formulaire de devis sans enregistrer | l'utilisateur annule | ✅ accepté : le clic suivant le reprend par son e-mail ; dit dans la page de fonctionnalité et dans `recommendation.md` |
| 🟡 Faible | Bug | Une demande envoyée avant la branche n'a pas de cible : elle reste dans le portfolio, sans bouton | anciennes demandes Aldaron | ⏳ prévu — ticket `150-move-old-contacts-to-the-aldaron-target` |
| 🟢 Info | Faille | Un appel public forgé peut ranger un message dans la boîte Aldaron | quiconque a un jeton reCAPTCHA valide | ✅ accepté : la cible dit où un message se lit, ce n'est pas un droit ; le reCAPTCHA et la limite de débit s'appliquent toujours |

Régressions vérifiées : `getContactsService` reçoit un `workspace` (portfolio par défaut) et `getContacts`
appelle désormais `resolveWorkspace` ; ses seuls appelants du back-office (liste, première page, export)
envoient l'espace. `QuoteForm`, `QuoteFormDialog` et `createQuote` (service du back-office) reçoivent des
arguments facultatifs : « Nouveau devis », « Modifier » et « Créer un avenant » n'en passent aucun et se
comportent comme avant. `composeQuoteMessage` écrit le même texte (les constantes portent les mêmes libellés).
Les tests du serveur passent (97).

Points reportés : [fichier de dette](debt/261123-feat-debt-site-quote-request-conversion.FR.md).

## Résultat par critère d'acceptation

| Critère | Résultat | Preuve |
|---|---|---|
| Une demande de devis envoyée depuis le site d'Aldaron n'apparaît que dans les contacts de l'espace Aldaron | partiel : construit, pas lancé en vrai | `app.mutation.ts` envoie `target` ; `contact.functions.ts` (`resolveWorkspace`, `isInWorkspaces`) ; `contentTargetQuery` |
| Un utilisateur crée un client et un devis brouillon prérempli depuis ce contact en une action | partiel : construit et préremplissage testé, pas lancé en vrai | `prepareQuoteFromContact`, `ContactQuoteAction.tsx` ; `quote-request.utils.test.ts` (7 cas) |
| Si un client a le même e-mail, il est repris, pas dupliqué | partiel : construit, pas lancé en vrai | `findOrCreateClientFromContactService` (e-mail normalisé ; l'index unique tient toujours) |
| Un contact déjà converti montre son devis et ne peut pas être converti à nouveau | partiel : construit et validation testée, pas lancé en vrai | `getConvertibleContactService`, `linkContactToQuoteService`, le bandeau de `ContactQuoteAction.tsx` |
| Le formulaire public se comporte exactement comme avant pour le visiteur | traité : diff relu | seuls les libellés en constantes et le paramètre `target` en plus ont changé dans `aldaron-web` |

Écarts avec le plan : aucun. Non vérifié : tous les cas en vrai (pas de base de données locale), listés dans
`tickets/work/turn-a-site-quote-request-into-a-client-and-a-quote/tc-manual.md`.

## Vérifications lancées

- `pnpm nx run-many -t lint typecheck -p bo server aldaron-web shared-constants` : ok (avertissements
  seulement, aucun sur un fichier modifié).
- `pnpm nx run server:test` : ok, 7 fichiers, 97 tests.
- `pnpm nx run-many -t build -p server bo` : ok. `pnpm nx run aldaron-web:build` : Next a compilé et généré les
  pages, puis Nx a échoué sur un droit de lien symbolique Windows (os error 1314), un problème d'environnement
  local.
- `pnpm check-i18n`, `pnpm lint:docs`, `pnpm check-doc-links`, `pnpm check-doc-twins --worktree` : ok.

## Ce qui reste à faire

Les cas en vrai de `tc-manual.md`, en préproduction ; la portée du compteur et de la recherche
(`190-scope-the-contact-badge-and-search-to-the-workspace`) ; le déplacement des anciens contacts
(`150-move-old-contacts-to-the-aldaron-target`) ; le point reporté ci-dessus.
