# Manual test guide — missions of the Aldaron workspace

## Before starting

- **Where**: pre-production (or a local stack on a database: `/rd` with the server and the bo).
- **Account**: an Owner or Super Admin account (every workspace, every right). For case 10, a second
  account whose role opens the Aldaron workspace.
- **Starting state**: the back-office in the **Aldaron** workspace (Settings), language French. At least
  one active client "Client Test" with one **accepted** quote and one **sent** quote; a second active
  client "Autre Client" with one accepted quote.

## Cases

### 1 — Create a mission from an accepted quote

1. Menu **Devis**. On the accepted quote of "Client Test", open the row menu.
2. Click **« Créer la mission »**. Expected: a window "Nouvelle mission pour le devis AL-…", with the client
   "Client Test", the quote's title and the quote already filled.
3. In **« Réalisée par »**, pick yourself. Click **« Enregistrer »**.
4. Menu **Missions**. Expected: the mission leads the list, status **Planifiée**, "Devis AL-…" under its title.

Failure: the action shows on a sent quote, or the fields are empty.

### 2b — A wrong quote is refused

1. **Missions** → **« Nouvelle mission »**, client "Client Test". Open **Devis**: expected, only the accepted
   quote is proposed (not the sent one).
2. Change the client to "Autre Client". Expected: the quote box empties, and only its accepted quote is
   proposed.

### 3b — The status moves forward only

1. On a planned mission, open the row menu: expected **Démarrer** and **Annuler la mission** only.
2. Click **Démarrer**. Expected: status **En cours**; the menu now shows **Marquer comme terminée** and
   **Annuler la mission**.
3. Click **Marquer comme terminée**. Expected: status **Terminée**; no status action left, only **Modifier**.

### 4b — The phase follows the status

1. On a planned mission, **Modifier** → **Phase**: expected only "En attente du client" and "Programmée".
   Pick "Programmée", save. Expected: "Programmée" under the status.
2. **Démarrer** it. Expected: no phase shown any more; **Modifier** → **Phase** now offers the in-progress
   phases (Maquettes… Mise en production).

### 5b — Dates filled when empty

1. Create a mission with no dates. **Démarrer**. Expected: "Début : <today>".
2. **Marquer comme terminée**. Expected: "Fin : <today>".
3. On another mission, type a start date of last week, then **Démarrer**. Expected: the typed date stays.

### 6 — A client with missions cannot be deleted

Needs a master-key call (a developer): delete a client that has a mission and no quote. Expected: refused
with « Le client « … » a des missions : archivez-le au lieu de le supprimer. »

### 10 — My missions and the tabs

1. Give one mission to the second account and one to yourself.
2. Missions → recherche avancée → **« Mes missions »**. Expected: only your mission.
3. Click each tab (Planifiée, En cours, Terminée, Annulée). Expected: only the missions of that status.

### 12 — The quote form still picks a client

1. **Devis** → **« Nouveau devis »**. The client box proposes the active clients; typing narrows them.
2. **« Nouveau client »**, fill, save. Expected: the new client is picked in the quote, nothing typed lost.

## Buttons with no intended effect

None.

## Not testable for now

- Payments and the deposit warning on a mission start: ticket `060-add-quote-payments-with-the-30-40-30-schedule`.

## Result to send back

| # | ok / ko | remark |
|---|---|---|
| 1 | | |
| 2b | | |
| 3b | | |
| 4b | | |
| 5b | | |
| 6 | | |
| 10 | | |
| 12 | | |
