# Aldaron Quotes, Clients and Missions

## Table of Contents

- [Goal](#goal)
- [What is ready](#what-is-ready)
- [Decisions](#decisions)
- [Who creates, and when](#who-creates-and-when)
- [Quote requests from the website](#quote-requests-from-the-website)
- [Data model](#data-model)
  - [Client](#client)
  - [Quote](#quote)
  - [Mission](#mission)
  - [Mission lifecycle](#mission-lifecycle)
  - [Payment](#payment)
- [Server](#server)
- [Back-office](#back-office)
- [Website](#website)
- [Files to touch](#files-to-touch)
- [Improvements and what is missing](#improvements-and-what-is-missing)
- [Open questions](#open-questions)
- [Order of work](#order-of-work)

> Design note, written before any code. It details step 4 of [WORKSPACE_SWITCH.md](WORKSPACE_SWITCH.md), marked ⏳ there: the first Aldaron-only collections. Field lists are a proposal to be confirmed before the code.

## Goal

- Let the Aldaron workspace manage its business: **clients**, the **quotes** sent to them and the **missions** that follow an accepted quote, and the **payments** of each quote (30 / 40 / 30).
- These four collections exist only in the Aldaron workspace: the portfolio workspace never lists them, and a user whose roles do not open `aldaron` can neither read nor write them.
- Nothing is public: Aldaron's website does not display them.

## What is ready

Step 1 of the workspace switch left the server helpers needed here, in `apps/server/src/cloud/utils/_core/role.utils.cloud.ts`:

| Helper | Use for these collections |
|---|---|
| `resolveWorkspace(user, TargetEnum.ALDARON, locale)` | First line of every Cloud Function of a collection: it throws the translated "unauthorized" error when the account's roles do not open Aldaron |
| `getUserWorkspaces(user)` | Not needed here: these collections have no row that belongs to the portfolio, so there is no per-row filter |
| `fromBO(handler, operations, className)` | Already checks the usual per-collection right (`find`, `get`, `create`, `update`, `delete`) |

Holding `aldaron` opens the workspace, not every action in it: both checks apply, as for any Aldaron function.

On the back-office side, the `WORKSPACES` registry (`apps/bo/src/constants/_core/workspace.constants.ts`) and `registerRightsEntities` (role rights table) are the two extension points.

## Decisions

1. **Code lives under `_domain/`** (server and back-office), with the `Project` domain: quotes, clients and missions are business entities, and `_core` must stay generic and never import them.
2. **Class names go to `DOMAIN_COLLECTIONS`** in `libs/shared-domain-constants` (`Client`, `Quote`, `Mission`), like `Project`.
3. **No `target` field**: a collection that only exists in Aldaron needs no per-row target; the check is on the whole collection, through `resolveWorkspace`.
4. **Enum-backed statuses**, not booleans (`parse-patterns.md`): a third state is plausible for each of them.
5. **Amounts are integers in the smallest currency unit** with a `currency` code next to them, never a float.
6. **Fixed key sets only**: no object keyed by a client id or an email.
7. **Nothing is deleted when its parent changes status**: a client with quotes cannot be deleted, it is archived.
8. **One payment schedule, 30 / 40 / 30**, the same for every quote: a constant, not a field to edit, so no schedule editor and no custom percentages.
9. **One currency per quote**: a payment has no currency of its own and takes its quote's.
10. **No invoices for now**: a `Payment` records who paid what and when; a legal invoice (gapless numbering, mandatory mentions, retention) would be its own note.

## Who creates, and when

### By whom

Always a signed-in back-office user, by hand. Nothing is created by the public sites or automatically.

- The user must hold the `aldaron` workspace **and** the `create` right on the collection: the two checks of [What is ready](#what-is-ready).
- Roles are edited in the back-office, so no new role is hard-coded. Proposed setup, to be adjusted to the real team:

| Who | Role | Workspaces | Rights |
|---|---|---|---|
| Owner, super admin | `OWNER` / `SUPER_ADMIN` | All, without storing them | Everything |
| The person who deals with clients and sends quotes | A role such as "Aldaron sales" | `aldaron` | `find`, `get`, `create`, `update` on clients and quotes; `find`, `get`, `update` on payments; `find`, `get` on missions |
| The person who does the work | A role such as "Aldaron delivery" | `aldaron` | `find`, `get` on clients and quotes; `find`, `get`, `create`, `update` on missions |
| An accountant or a reader | A read-only role | `aldaron` | `find`, `get` on every collection |

- `delete` is given to the owner only: a client is archived and a quote is refused or expired, not removed.
- A user of the portfolio workspace alone sees none of it, even with the rights, because the workspace check refuses first.

### When

| Entity | Moment | How |
|---|---|---|
| Client | At the first contact, before the first quote | From the client list; also creatable from the quote form, so the typing is not interrupted |
| Quote | Once the client exists | Born as `draft`, then `sent` when sent; `accepted`, `refused` and `expired` are set by hand (a job may set `expired` later) |
| Mission | Only after an `accepted` quote | A "Create the mission" button on the accepted quote prefills client, title and quote; a mission with no quote stays possible by hand |

Nothing fires automatically: accepting a quote does not create a mission, because a person still chooses the start date and who does the work.

## Quote requests from the website

`aldaron-web` already has the way in: the price simulator ("Votre estimation") hands its estimate to the contact page, whose form sends the request through the `createQuoteRequest` server action and the `createPublicContact` Cloud Function. It is stored today as a `Contact`: the answers of the form (product, platforms, what the visitor brings, needs, estimate) are written as plain text into `message`, and the stored estimate is erased from the browser once the request is sent.

That stays the entry point. The visitor creates no client and no quote; a back-office user turns the request into them by hand.

| Option | What happens | Verdict |
|---|---|---|
| A. Change nothing | The request stays a free-text `Contact`; the team retypes client and quote | No code, but double typing, and Aldaron requests mix with the portfolio's contacts |
| B. A "Create the client and the quote" action on the contact **(recommended)** | A user creates a client (name and e-mail taken from the contact) and a `draft` quote prefilled with the estimate; the contact keeps a link to the quote | Stays manual as decided, the public form does not change |
| C. A `draft` client created automatically on send | The form creates the client itself | Saves time, but the public would write into a business collection: duplicates and spam despite reCAPTCHA |

Option B asks for:

- **Server:** a `target` field on `Contact`, set by `createPublicContact` (`aldaron` when the request comes from `aldaron-web`, `portfolio` otherwise, an old row without it reading as `portfolio`). The contact list functions then follow the workspace, with the same `resolveWorkspace` check as articles, so Aldaron requests show only in the Aldaron workspace. `aldaron-web` sends its target with the call, as it already does to read content.
- **Server:** a `quote` pointer on `Contact`, set when a quote is created from it, so a request already handled is visible and cannot be turned into a second quote by mistake.
- **Back-office:** the action on the contact detail, shown only to a user holding the `create` right of quotes, which opens the quote form prefilled and creates the client on the way (or reuses the client with the same e-mail).
- Nothing changes in the public form, and the privacy promise stays true: the estimate is still erased from the browser when sent.

## Data model

### Client

A person or a company Aldaron works for.

| Field | Type | Notes |
|---|---|---|
| `name` | string | Required; company name or full name |
| `kind` | `ClientKindEnum` | `company` or `individual` |
| `email` | string | Required, validated, stored in lowercase so that `Jean@x.com` and `jean@x.com` are one client |
| `phone` | string | Optional |
| `address` | object | Fixed keys: `line1`, `line2`, `postalCode`, `city`, `country` |
| `taxId` | string | Optional, company number or VAT number |
| `notes` | string | Internal, never sent to the client |
| `status` | `ClientStatusEnum` | `active`, `archived` or `anonymized` (see [Improvements and what is missing](#improvements-and-what-is-missing)) |

Index: `email`, and `status` + `name` for the list.

### Quote

A priced proposal sent to a client.

| Field | Type | Notes |
|---|---|---|
| `number` | string | Human reference, unique, generated on the server (never typed) |
| `client` | pointer `Client` | Required |
| `title` | string | Required |
| `status` | `QuoteStatusEnum` | `draft`, `sent`, `accepted`, `refused`, `expired` |
| `lines` | array of objects | Fixed keys: `label`, `quantity`, `unitAmount`; bounded (see below) |
| `currency` | string | ISO 4217 code |
| `taxRate` | number | Percentage, optional |
| `totalAmount` | integer | Stored, computed on the server on save from `lines` and `taxRate`, so lists can sort and filter on it |
| `paidAmount` | integer | Sum of the `paid` payments, kept up to date by the `Payment` trigger (see [Payment](#payment)) so lists can filter unpaid and settled quotes |
| `issuedAt` | date | Set when the status first becomes `sent` |
| `validUntil` | date | Optional |
| `notes` | string | Terms shown to the client |
| `version` | integer | 1 for a first quote; a revision of the same quote adds 1 |
| `parentQuote` | pointer `Quote` | The quote this one revises (same `number`) or amends (its own `number`); empty for a first quote |
| `acceptedAt` | date | Set when the status becomes `accepted` |
| `acceptanceMethod` | `QuoteAcceptanceMethodEnum` | `email`, `signature`, `oral`, `other`; the proof of the acceptance, set with `acceptedAt` |
| `acceptanceProof` | file | Optional: signed quote, e-mail of the client (stored like the other files of the back-office) |

- `lines` is an embedded array, rewritten in full on every update: it is capped (a named constant, around 50 lines) and rejected by validation beyond it.
- The client's name is **not** copied into the quote: lists read it through `include('client')` with a `select`, so it never goes stale.
- **Revision and amendment.** A quote that left `draft` is never edited. A **revision** ("Revise" action on a `sent` quote) creates a `draft` copy with the same `number`, `version` + 1 and `parentQuote` set; the previous version becomes `expired`. An **amendment** (extra work after acceptance) is a new quote with its own `number` and `parentQuote` pointing to the accepted one; once accepted, it creates its own three payments. An accepted quote is never revised.
- Indexes: `number` + `version` (unique), `client` + `status`, `status` + `issuedAt` for the list.
- Allowed transitions are checked in a `beforeSave` trigger: `draft → sent → accepted | refused | expired`; a quote that left `draft` can no longer have its lines changed.

### Mission

The work done after a quote is accepted.

| Field | Type | Notes |
|---|---|---|
| `title` | string | Required |
| `client` | pointer `Client` | Required |
| `quote` | pointer `Quote` | Optional; when set, the quote must be `accepted` and belong to the same client |
| `status` | `MissionStatusEnum` | `planned`, `inProgress`, `done`, `cancelled` |
| `assignee` | pointer `_User` | Optional; the back-office user who does the work, who can be asked "my missions" in the list |
| `phase` | `MissionPhaseEnum` | Optional; one of the phases of the current status (see [Mission lifecycle](#mission-lifecycle)) |
| `startDate`, `endDate` | date | Optional |
| `description` | string | Optional |

Indexes: `client` + `status`, `status` + `startDate`.

### Mission lifecycle

```text
(accepted quote) ──► planned ──► inProgress ──► done
                        │            │
                        └──► cancelled ◄┘
```

| Step | Who and when | What happens |
|---|---|---|
| Birth | A user holding the `create` right of missions, after an `accepted` quote | The "Create the mission" button prefills client, title and quote; a mission with no quote stays possible by hand. It starts as `planned`. |
| `planned` | Until the work starts | Everything can be edited; client and quote can no longer change afterwards |
| `inProgress` | When the work starts | Set by hand; an empty `startDate` is filled with that day |
| `done` | When the work is delivered | Set by hand; an empty `endDate` is filled with that day |
| `cancelled` | From `planned` or `inProgress` | The work is dropped; the mission stays visible with this status |

Each status has an optional **phase**, a fixed list valid only for that status:

| Status | Phase | Meaning |
|---|---|---|
| `planned` | `waitingClient` | Waiting for the client: brief, access, deposit |
| | `scheduled` | Everything received, start date set |
| `inProgress` | `design` | Mock-ups |
| | `development` | Development |
| | `testing` | Tests and acceptance |
| | `clientReview` | Client feedback to integrate |
| | `release` | Production release, or publication on the App Store and Google Play |
| `done` | `handover` | Handover of the code and the accounts |
| | `warranty` | Bug-fix period |
| | `closed` | Finished, nothing open |
| `cancelled` | `byClient` | Cancelled by the client |
| | `byAldaron` | Cancelled by Aldaron |
| | `unpaid` | Cancelled for lack of payment |

- The simulator of `aldaron-web` promises the handover of the code and the accounts and 30 days of bug fixing, which is what `handover` and `warranty` stand for.
- For `cancelled` the phases are really reasons; the mechanism is the same.
- A phase may stay empty: a maintenance mission has no `design`, a static site has no store release.
- The phase moves freely inside a status (`testing` then `development` again is allowed); only the status keeps an order.
- The `beforeSave` trigger: checks the transitions (no way back, `done` and `cancelled` are final), refuses a phase that does not belong to the current status and clears it when the status changes, refuses an `endDate` before the `startDate`.
- A mission is never deleted (`delete` is the owner's) and it blocks the deletion of its client, so it stays as history.
- A mission does not change its quote (a quote stays `accepted` if the mission is cancelled), holds no amount and does not bill: that would be another task. Nothing changes status automatically.

### Payment

A payment expected from, or received from, a client for a quote. The payments of a quote are its payment history.

The schedule is a constant of `src/constants/_domain/`, the same for every quote:

| `kind` | Share | Due |
|---|---|---|
| `deposit` | 30 % | The day the quote is accepted |
| `milestone` | 40 % | Date set by hand |
| `balance` | 30 % | Date set by hand |

| Field | Type | Notes |
|---|---|---|
| `quote` | pointer `Quote` | Required |
| `client` | pointer `Client` | Required; the quote's client |
| `kind` | `PaymentKindEnum` | `deposit`, `milestone`, `balance` |
| `percent` | integer | Taken from the schedule |
| `amount` | integer | Smallest currency unit, in the currency of the quote |
| `status` | `PaymentStatusEnum` | `planned`, `due`, `paid`, `cancelled` |
| `dueDate` | date | Optional |
| `paidAt` | date | Set when the status becomes `paid`, today by default |
| `method` | `PaymentMethodEnum` | `transfer`, `card`, `cash`, `other`; set when paid |
| `reference` | string | Reference of the transfer, optional |

- **Creation.** When a quote becomes `accepted`, the quote's `afterSave` trigger creates its three payments: the deposit as `due` with today's `dueDate`, the two others as `planned`. Amounts come from `totalAmount` and the last one takes the rounding remainder, so the three always add up exactly. The trigger creates nothing when payments already exist for the quote, so a second save cannot duplicate them. No other payment is created, and nothing at all for a quote that is not accepted.
- **Marking paid.** A user sets a payment to `paid` by hand and gives the method (and the reference if any). Nothing is collected online and nothing is linked to a bank.
- **History.** A `paid` payment is never edited or deleted: a mistake is corrected by cancelling it (`cancelled`) and recording a new one, so the trace stays. `delete` is given to nobody.
- **`paidAmount` on the quote.** The `Payment` `afterSave` trigger recomputes it from the quote's `paid` payments, so the remainder to pay is `totalAmount - paidAmount`.
- Indexes: `quote` + `status`, `status` + `dueDate` (the list of what is due).
- A mission is reached through its quote: `Payment` holds no `mission` pointer. A `planned` mission whose deposit is not yet `paid` may show a reminder in the list; it changes no status.
- Rights: `Payment` is added to the role rights table; `create` and `update` belong to the sales role and the owner.

## Server

Per `apps/server/CLAUDE.md`, one file per layer and per entity, all wired:

- Types in `src/types/`, Zod schemas in `src/validations/_domain/`, field lists and limits in `src/constants/_domain/`.
- Services (`cloud/services/_domain/`): every `Parse.Query`, with `select()` and a named `limit()`.
- Functions (`cloud/functions/_domain/<entity>.functions.ts`), each wrapped in `fromBO` and starting with `resolveWorkspace`: list, get, create, update, delete (archive for a client). Imported in `cloud/functions/index.ts`.
- Triggers (`cloud/triggers/_domain/`): quote number and total, status transitions, mission and client consistency, refusing to delete a client that still has quotes or missions. Imported in `cloud/triggers/index.ts`.
- Indexes declared in code with the other database indexes of `src/config/`, never by hand.
- Payments: the payment schedule constant, the quote `afterSave` that creates the three payments on acceptance, the `Payment` triggers (no edit of a `paid` payment, `paidAmount` upkeep) and the list and update functions (no delete function).
- Dashboard and global search registries: a quote count by status as the first Aldaron dashboard card; search over clients and quotes only if the existing registry can limit a result to a workspace (see [Open questions](#open-questions)).
- Server i18n keys in `fr`, `en` and `mg` for every thrown error.
- Class-level permissions: master key only, like the other back-office classes; the client never queries these classes directly.

## Back-office

- Types, validations (react-hook-form + Zod), services, one action file and one reducer file per entity, reducers registered in `src/redux/store.ts`.
- Pages and containers under `_domain/` (`quote/`, `client/`, `mission/`, singular), routes in `routes/protected/_domain/`.
- The sidebar entries are added in `useNavigationMenus.tsx` and shown **only while the active workspace is Aldaron**; the visibility rule belongs in the `WORKSPACES` registry (a list of menu entries per workspace) so it stays one edit per workspace, not an `if` in the hook.
- Each entity is added to the role rights table with `registerRightsEntities` from a file imported in `config/domain-registrations.ts`.
- A route typed by hand while in the portfolio workspace is refused (redirect to the dashboard), since the server would refuse it anyway.
- Two shortcuts follow [Who creates, and when](#who-creates-and-when): creating a client from the quote form, and a "Create the mission" button on an accepted quote. Each button is shown only to a user holding the `create` right of the target collection.
- Lists follow the existing list pattern (filters, pagination); the quote form shows the computed total live, the server remaining the source of truth.
- Translation keys in every locale (`fr`, `en`, `mg`), `pnpm check-i18n` must pass.

## Website

Nothing in `apps/web`, and nothing displayed in `apps/aldaron-web`: these collections are back-office only. The one change in `aldaron-web` is invisible: its quote request sends its target so the contact it creates belongs to Aldaron (see [Quote requests from the website](#quote-requests-from-the-website)). `apps/web` is checked and left unchanged.

## Files to touch

| App / lib | Change |
|---|---|
| `libs/shared-domain-constants` | `Client`, `Quote`, `Mission`, `Payment` in `DOMAIN_COLLECTIONS`; the 30 / 40 / 30 payment schedule, read by the server to create the payments and by the back-office to show them |
| `libs/shared-domain-types` | Statuses, phases and kinds enums (`MissionStatusEnum`, `MissionPhaseEnum`…), only if the back-office and the server both use them (they do: put them here, not twice) |
| `apps/server` | Types, validations, constants, services, functions, triggers, indexes, locales, dashboard card; `target` and `quote` on `Contact` (`createPublicContact`, contact list and detail functions) |
| `apps/bo` | Types, validations, services, redux, pages, containers, routes, menu, `WORKSPACES` registry, rights registration, locales; contact list following the workspace and the "Create the client and the quote" action |
| `apps/aldaron-web` | `createQuoteRequest` sends its target to `createPublicContact` |
| `docs/features/bo` | One French page per sidebar entry (quotes, clients, missions) and their entries in `docs/features/bo/README.md` |
| `docs/inventory/README.md` | The new Cloud Functions and triggers files |
| `docs/code/design/en/WORKSPACE_SWITCH.md` and its twin | Mark step 4 ✅ when the four collections are done |

## Improvements and what is missing

A review of this note found the points below. The first group is already written into the model above; the others are tracked here with when to do them. Status markers follow `implementation-completeness.md`.

### Written into the model

- ⏳ **Revision and amendment of a quote**: `version`, `parentQuote` (see [Quote](#quote)).
- ⏳ **Who does a mission**: `assignee`.
- ✅ **Client e-mail in lowercase**, so one person is one client.
- ⏳ **Computed fields closed**: `number`, `version`, `totalAmount`, `paidAmount`, `amount` and `percent` are computed on the server, and the validation of the create and update functions **refuses** them in input, so a faulty or malicious back-office client cannot impose them. Done for the quote (`number`, `version`, `totalAmount`, `paidAmount`); `amount` and `percent` come with the payments.

### To build with the first collection

- ✅ **Number without a gap.** A counter row (class `Counter`: `name` such as `quote-2026`, `value`, unique index on `name`) incremented atomically with Parse's `increment` in the same save, never read then written. Declared with the other indexes.
- ⏳ **Audit trail.** For money, `updatedAt` is not enough: who changed which status, when. An append-only collection of events (class of the entity, id, action, previous and new value, user, date), written by the triggers of quotes, payments and missions. First check whether the project already has a journal; this note did not verify it.
- ⏳ **Anonymize a client.** Archiving conflicts with the right to erasure of an individual client. An "anonymize" action (owner only) erases name, e-mail, phone, address, tax id and notes, keeps the id, the amounts and the dates, and sets the status `anonymized`; lists show a translated "anonymized client". The retention time of the accounting data is to confirm with the accountant, and the privacy policy of `aldaron-web` must mention how long clients and quotes are kept.
- ⏳ **Expire quotes automatically.** A daily job (`node-cron`, wired in `index.ts` and imported in `cloud/jobs/index.ts`) sets `expired` on a `sent` quote whose `validUntil` has passed. It is added to the jobs of `docs/inventory/README.md`.
- ⏳ **Pure functions in `utils/`**: the quote total, the 30 / 40 / 30 split with its rounding, and the allowed status changes of a quote, a payment and a mission. They handle money and are the part to test.

### In the lists and the dashboard

- ⏳ **Late payments.** No new status: a `due` payment whose `dueDate` has passed is shown "late" in the list and counted in a dashboard card.
- ⏳ **Deposit and start.** Setting a mission `inProgress` while the deposit is not `paid` shows a warning, not a block. Entering `testing` or `release` suggests setting the `dueDate` of the 40 % payment.
- ⏳ **Dashboard cards.** Amount accepted, already collected, left to collect, late, and quotes by status.
- ⏳ **CSV export** of the payments, for an accountant.

### Separate tasks

- ⏳ **PDF and sending of a quote.** The biggest functional gap: without them a quote is only a record. Its own note (Brevo template, storage of the PDF, inventory entries).
- ⏳ **A test runner for the server.** It has none, and the functions above deserve tests (the split and its rounding, the transitions). Set up as its own task, not inside this one.
- ⏳ **Old contacts.** A `Contact` created before the `target` field reads as `portfolio`; if Aldaron requests already exist, a one-off job moves them, tracked in `docs/code/todo/`.

### Later, no urgency

- ⏳ Several contact persons for a company client.
- ⏳ A proof file on a payment.
- ⏳ Back-office notifications (quote accepted, payment late).
- ⏳ Discounts or negative lines: to decide before the shape of `lines` is final.

## Open questions

- **Order of the collections.** The workspace note builds quotes first. A quote needs a client, so building the client first avoids a quote without a real `client` pointer. Recommended: clients, then quotes, then missions, then payments (which need an accepted quote). If quotes must come first, the quote carries a typed client name and email for a while, and a one-off job moves them to a `Client` row later.
- **Quote numbering format** (`AL-2026-001`, or a plain sequence): a business rule to confirm. It must be gapless per year, so the counter is incremented on the server in the same save, never computed in the browser.
- **Document for the client.** Is a PDF or an e-mail of the quote expected? Out of scope here; if yes, it is a separate task (Brevo template, Cloudinary storage) with its own inventory entries. Recommended: yes, as the next note (see [Improvements and what is missing](#improvements-and-what-is-missing)).
- **Tax and currency.** One tax rate per quote and one currency per quote are assumed. Several rates per line, or a default currency in the settings, need an answer before the `lines` shape is final.
- **Search and dashboard.** The global search registry may not filter by workspace today: check it before registering clients and quotes, otherwise they would show to a portfolio-only user.
- **Roles of the team.** The table in [Who creates, and when](#who-creates-and-when) is a proposal: how many people work in Aldaron, and does one person do both sales and delivery? One role holding everything is enough if so.
- **Mission lifecycle.** Three points to settle: an `onHold` status (not planned, no concrete case today), reopening a `done` mission (only the owner, if at all), and warning someone when a mission is cancelled. The phases are proposed as optional; making the list depend on a mission type is left aside.
- **Quote requests of the website.** Option B of [Quote requests from the website](#quote-requests-from-the-website) is recommended and assumed in the work order; to confirm before building it.
- **Contacts and newsletter** remain the open question of the workspace note. The `target` field on `Contact` settles it for quote requests only: the newsletter is not touched here.

## Order of work

1. ✅ Shared constants and enums, `Client` on the server (service, functions, trigger, indexes, i18n).
2. ✅ `Client` in the back-office (pages, route, menu entry through the registry, rights), and its French feature page.
3. ✅ `Quote` on the server (number, total, transitions), then in the back-office, and its French feature page. The optional acceptance proof file (a PDF or an image joined when the quote is accepted) followed in its own ticket.
   ⏳ Then the quote requests: `target` and `quote` on `Contact`, the target sent by `aldaron-web`, the contact list following the workspace and the "Create the client and the quote" action.
4. ⏳ `Mission` on the server, then in the back-office, and its French feature page.
5. ⏳ `Payment`: the schedule constant, the creation on acceptance, the triggers, then the back-office (payments of a quote, mark as paid), and its French feature page.
6. ⏳ Dashboard card, inventory, and marking step 4 ✅ in the workspace note.
