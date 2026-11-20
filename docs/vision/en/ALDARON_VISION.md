# Aldaron — company vision

## Table of Contents

- [The idea in one sentence](#the-idea-in-one-sentence)
- [Positioning](#positioning)
- [Price and minimum](#price-and-minimum)
- [What is already there on day one](#what-is-already-there-on-day-one)
- [How a project runs](#how-a-project-runs)
- [What is billed on top](#what-is-billed-on-top)
- [Sizing the need internally](#sizing-the-need-internally)
- [Quoting from the client's brief](#quoting-from-the-clients-brief)
- [Examples](#examples)
- [The Site offer (web only)](#the-site-offer-web-only)
- [The template is the main asset](#the-template-is-the-main-asset)
- [Economic check](#economic-check)
- [Risks and weak points](#risks-and-weak-points)
- [Open questions](#open-questions)
- [Prompt for Claude Design](#prompt-for-claude-design)
- [Prompt for the pricing simulator](#prompt-for-the-pricing-simulator)
- [Prompt for the Site offer](#prompt-for-the-site-offer)
- [Next steps](#next-steps)

> Exploration document, new full version: Aldaron no longer sells screens, integrations or a foundation, but **a finished product at a price announced before signature**. The client brings an idea, specs or a mockup and receives a price: they never see days or months. **Internally**, Aldaron estimates the work in days (114 € per day) and never quotes less than **one month of dedicated work, 2,500 €**. There is no monthly subscription, no CMS and no public website in this startup offer; a separate **Site offer** (portfolio, brochure site, from 600 €, catalogue price) covers web only. The figures are **hypotheses to calibrate**, not commitments: the [Economic check](#economic-check) section says how to validate them. The content of the starting base is taken from what `1lalana-platform` contains today and must be rechecked when the template is extracted.

## The idea in one sentence

Aldaron is a development company that delivers startups a product (web, mobile, or both) **at a price announced before signature**, from the idea, the specs or the mockup the startup brings: from 2,500 € for a first usable version, about 5,000 € for a complete MVP. The project starts from a proven base (login, back-office, deployment) instead of a blank page, and the startup decides what Aldaron builds. Days are an internal unit: Aldaron uses them to compute the price, the client never sees them. For those who only want a website (a portfolio, a shop's brochure site), Aldaron offers a separate **Site offer** at a catalogue price, from 600 € (see [The Site offer (web only)](#the-site-offer-web-only)).

> Reading assumption: the name "Aldaron", the NIF and the STAT already exist (the company is already registered). If the name is actually taken by a third party, that must be settled before anything else (see [Open questions](#open-questions)).

## Positioning

| Question | Proposed answer |
|---|---|
| Target | **Product offer**: startups only (pre-seed to series A). **Site offer**: freelancers, creatives and small businesses who only want a website. In both cases: no agencies, no large accounts |
| Two offers | **Product** (startups, from 2,500 €, firm price after scoping) and **Site** (portfolio, brochure site, from 600 €, catalogue price, no scoping). A web-only need never goes through the 2,500 € minimum: see [The Site offer (web only)](#the-site-offer-web-only) |
| Promise | A real MVP at a price known before signature, without the startup reinventing login and back-office |
| What sets us apart | One price from the brief (idea, specs or mockup), starting at 2,500 €. No screen grid, no extras, no "integration" or "payment" line, no talk of days or months |
| What we do not do | Custom or negotiated brochure sites (they go through the Site offer, from the catalogue), redesigns without a product, work without a price agreed beforehand |
| Selling point | Budget known at signature, a ready base from day one, and the startup changes its priorities freely inside the agreed list (we swap, we do not add) |

We sell **a product at a fixed price**, estimated from what the startup brings. The client is not buying time and does not ask how long it takes: they judge the price and the result. Never a price per screen or per integration, and never a daily rate displayed.

## Price and minimum

The client brings an idea, specs or a mockup (see [Quoting from the client's brief](#quoting-from-the-clients-brief)). Aldaron answers with **one price**, written in euros, with no number of days, months or hourly rate.

- **Minimum price: 2,500 €.** It is the value of one month of dedicated work (about 22 working days at 114 €), computed internally. Even a need of a few screens is quoted at least 2,500 €: below that, the free scoping, the start and the gap before the next assignment cost more than the work.
- **Above the minimum**, the price follows the internal estimate in days (see [Sizing the need internally](#sizing-the-need-internally)): announced days × 114 €, rounded to the nearest 100 €. The client only sees the result, for example 5,000 €.
- **The price is fixed at signature** for the initial list of needs. If the work takes fewer days than estimated, the gain is Aldaron's; if it takes more, the overrun is Aldaron's too. The client is not billed for the difference.
- **The time is dedicated** internally: during the project, Aldaron works on that project only.
- Web, mobile, languages, mockups, payment, maps, messaging: all of it is development time, so included in the price. Nothing is priced separately.
- **More needs than the initial list** is a new quote, priced the same way, agreed before starting. Within the list, the startup can **swap** one need for another.

Sample projects, in euros, are in the [Examples](#examples) section.

## What is already there on day one

This is not a quote line: it is the reason the price pays for the startup's product rather than its foundations. Based on what `1lalana-platform` already contains (the generic `_core` part), to be confirmed at extraction:

| Block | Content |
|---|---|
| Authentication | Login, account creation, forgotten password, email invitations, two-factor authentication (MFA), step-up verification for sensitive actions |
| Basic back-office | Dashboard, profile, settings, notifications, audit log |
| Email and SMS | Transactional email and SMS sending configured (provider of the client's choice), translated message templates |
| Interface | English and French, light / dark theme, client branding applied (logo, colors) |
| Mobile | If the product is mobile: configured Expo app, navigation, push notifications, distributed test build |
| Going live | Pre-production and production environments, deployment, domain name configured |

There is **no CMS and no public website** in this base. A brochure site, articles or a newsletter are, if the startup wants them, development time like everything else, so part of the price. Web only, without a product, falls under the Site offer, which starts from another base, `portfolio-platform` (see [The Site offer (web only)](#the-site-offer-web-only)).

## How a project runs

1. **Brief and scoping** (short, free). The startup brings an idea, specs or a mockup. Aldaron estimates it internally in days (see [Sizing the need internally](#sizing-the-need-internally)) and answers with a price, or with "this is over your budget, this has to come out".
2. **Contract**: the price, the initial list of needs, the start date, the agreed delivery date and the payment schedule. It is not a frozen scope: it is the starting point.
3. **List ordered by the startup**. Aldaron builds in the chosen order, with a demo every week. The startup can reorder or replace one need with another at any time: we **swap**, we do not add. If it wants more, that is a new quote.
4. **Unknown integration** (a service with unclear documentation, a check nobody knows how to do): a short, time-boxed trial (internally 2 days at most), then the startup decides to continue, with the price adjusted if the integration is bigger than planned, or to drop it. The risk is visible and chosen, not hidden in the price.
5. **End of the project**: going live, handover of the code and accounts, then 30 days of bug fixing and half a day of training.
6. **If the startup does not respond**: Aldaron cannot move forward and the delivery date slips by the same time. A pause of one week at most is possible; beyond that, the project resumes according to Aldaron's availability.

Payment, in installments tied to the progress and never to a number of days: **40 % at signature, 30 % at the mid-project demo, 30 % at going live**, before the handover of the code and accounts (to confirm in the contract). If the startup stops midway, the installments already paid stay with Aldaron and the code produced up to the last paid installment is handed over: Aldaron's exposure is limited to the work between two installments. When the web interface is rich, the mid-project installment is replaced by one installment per delivered lot, agreed at scoping (to confirm in the contract): an overrun then stays limited to the lot in progress.

## What is billed on top

Everything that is not development time, re-invoiced **at cost**:

- the Apple (99 $ per year) and Google (25 $ once) developer accounts, which the client creates and owns; Aldaron publishes on them as a team member, never under its own account;
- hosting and third-party services (email and SMS provider, maps, payment, messaging, etc.), paid directly by the startup;
- maintenance and managed hosting after the 30-day warranty: a monthly fee of 150 to 400 €, which funds the security updates.

Store review times (Apple 1 to 3 days, sometimes more; Google a few hours to a few days) are not under our control: plan for them. An Apple organization account requires a D-U-N-S number, which can take weeks: start it at signature.

## Sizing the need internally

The screen grid of the previous version is not a price: it is the **internal benchmark sheet** used to estimate the work of a brief, in days. The client never sees it. Benchmarks to calibrate on the pilot, in working days:

| Item | Internal benchmark |
|---|---|
| Standard mobile or web screen (list, detail, form) | about 0.1 day |
| Screen with camera, map, filters, workflow | about 0.15 to 0.3 day |
| Back-office screen | about 0.35 to 0.6 day |
| Maps, Google or Apple sign-in, address autocomplete | about 0.5 to 1 day each |
| Document scan and verification | about 2 days |
| Real-time messaging, payment | about 4 to 5 days each |
| High business complexity | the screen estimate is multiplied by 1.5 to 2.5 |

The pace of about 10 screens per day with Claude measures production, not delivery: review, fidelity to the mockup, device testing and fixes come on top. To validate on the pilot, from the first prompt to the reviewed and tested screen.

**Rich web interface.** A web screen with tables, filters, dashboards, roles or an editor is estimated as a back-office screen (0.35 to 0.6 day), not as a standard screen, and by module (dashboard, user management, editor) rather than screen by screen. The mobile app keeps only the field uses and heavy management stays on the web, so the complexity is not paid twice. A rich web interface is the main source of overruns, so three rules apply: scoping is longer before the firm price, the work is delivered by lots (see [How a project runs](#how-a-project-runs)), and the simulator shows a wider range and hands over to a manual quote sooner (see [Prompt for the pricing simulator](#prompt-for-the-pricing-simulator)).

Internal price rule:

1. **Estimate** in days with the benchmark sheet.
2. **Announced days** = the estimate divided by 0.9, rounded up to the next day. This keeps a 10 % margin for review, testing and surprises.
3. **Price** = announced days × 114 €, rounded to the nearest 100 €.
4. **Floor**: never below 2,500 € (one month, about 22 days × 114 €). A need estimated at 5 days is quoted 2,500 €.

## Quoting from the client's brief

The client brings **an idea, specs or a mockup** and receives a price. The more precise the brief, the more precise the price:

| What the client brings | How Aldaron estimates | Precision of the answer |
|---|---|---|
| A mockup (Figma, images) | Counts the screens with the counting rule, then applies the benchmarks | Firm price after a short scoping |
| Specs (a document, a list of features) | Turns the specs into screens and integrations, checks the doubtful points with the client | Firm price after scoping, possibly a range first |
| An idea only | Scoping call to turn it into a list of needs | Indicative range first, firm price once the list is written |

| Shown to the visitor | Stays internal |
|---|---|
| A price in euros, "from 2,500 €" | The days, the 114 € daily rate, the benchmark sheet (screens, back-office, integrations, complexity) |
| Reference projects, with their price | The margin rule: announced days = estimate divided by 0.9, and the rounding |
| The rules: fixed price, swapping one need for another, installments | Recalibration after every project |
| A free scoping step as the entry point | The reason for the floor (one month of dedicated work) |

Never displayed: days, months or durations, the daily rate, a price per screen, a price per integration, the benchmark sheet.

- **Recalibration.** After every project, compare estimated days with actual days, by type of screen and integration, then correct the benchmark sheet. This tracking, more than the starting figures, is what makes the price reliable, since an overrun is Aldaron's.
- **Answer to "fixed price or time?".** A fixed price for the agreed list of needs, and the startup steers the content through swaps. The client is not buying time: the days only exist in Aldaron's estimate.
- **Who gives the price.** A firm quote is given by hand, after scoping. A simulator on the website only gives an **indicative range** from a few answers, never a number of days (see [Prompt for the pricing simulator](#prompt-for-the-pricing-simulator)). Its euro values come from the internal benchmarks: until several projects are timed, it shows wide ranges, because a wrong estimate is costly.

## Examples

| Case | Price shown | Internal days (never shown) |
|---|---|---|
| A few standard screens on the existing base (for example 5) | **2,500 €** (the minimum) | about 1 day, brought up to the floor |
| Login, going live and a first usable version of a SaaS | about **2,500 €** | about 22 days |
| Entraid'ei: mobile app of over 100 screens, moderation back-office, passport scan, real-time messaging, Google and Apple | about **5,000 €** | about 44 days |
| Mobile app with a complex back-office | about **7,500 €** | about 66 days |
| Web and mobile product with payment | about **7,500 €** | about 66 days |

The Entraid'ei case illustrates the calculation. With the benchmarks above, the scope represents about 39 days of work; with the 10 % margin, that makes 44 announced days, so 5,016 €, quoted about 5,000 €. If the startup wants to spend less, it removes a need; if it wants more, it is a new quote. The client sees only "5,000 €".

## The Site offer (web only)

A second offer, **separate** from the startup offer, for someone who only wants a website: a portfolio, the brochure site of a shop or of a small business. It does not start from the `1lalana-platform` base but from `portfolio-platform` (public site, articles, a space to edit the content, three languages, light and dark theme). The work is mostly applying the brand and loading the content, which allows a low price.

| | Portfolio | Showcase |
|---|---|---|
| For | A person presenting their work (designer, developer, photographer, consultant) | A shop or small business that wants to be found and show its photos, address and opening hours |
| Price shown | **600 €** | **1,200 €** |
| Pages | Up to 5: home, projects, articles, about, contact | Up to 8: home, presentation, products or services, gallery, practical info (address, hours, map), news, contact |
| Languages | 2 among French, English, Malagasy | Up to 3: French, English, Malagasy |
| Editing by the client | Space to add and edit projects, articles and texts | Same, plus a newsletter sign-up |
| Rounds of corrections before going live | 1 | 2 |

**Included in both**: light and dark theme, phone-friendly layout, basic search-engine optimization (titles, descriptions, sitemap), contact form, domain name configured, going live, 30 days of bug fixing.

Rules:

- **Catalogue price, shown and fixed.** No quote, no free scoping: the client picks a plan and fills in a short form, Aldaron answers in writing with the confirmation and the go-live date. The 2,500 € minimum of the product offer does not apply here: the work is standardized, with no scoping and no custom start.
- **The client provides their texts and photos before the start.** Without content, going live waits and the date slips.
- **Corrections are grouped** in a single message per round. An extra round, or any request outside the plan, is a new quote.
- **Payment in two installments**: 50 % on order, 50 % at going live. The amount is too small for three installments.
- **Outside the Site offer**: online selling and payment, accounts for visitors, booking, custom features. That becomes a project of the product offer, at the 2,500 € minimum, accepted case by case: the product offer targets startups.
- **The domain name** is in the client's name, and they pay for it directly (about 15 € per year).
- **Maintenance and hosting**: a monthly fee of 30 € (hypothesis, to calibrate on the real hosting cost per site): hosting managed by Aldaron, security updates, backups, a little help with the content. The client receives their code and an export of their content on request.
- A visitor who only looks for a website never lands on the product offer's simulator: they are directed to these two plans (see [Prompt for the pricing simulator](#prompt-for-the-pricing-simulator)).

Internal calculation, never shown to the client:

| Plan | Internal estimate | Announced days (estimate ÷ 0.9) | Value at 114 € | Catalogue price |
|---|---|---|---|---|
| Portfolio | about 4.5 days | 5 | 570 € | **600 €** |
| Showcase | about 9 days | 10 | 1,140 € | **1,200 €** |

The catalogue price is rounded **up** to the next hundred, instead of to the nearest, because it is not recomputed for each quote. These estimates assume the content is provided and the adaptation of `portfolio-platform` (brand, languages, deployment) is tooled: to be timed on the first site, like the product offer's pilot.

## The template is the main asset

All of Aldaron's margin rests on the time the template saves. Three findings about `1lalana-platform`:

- **Strength**: the `_core` (generic back-office) / `_domain` (the project's business logic) separation already exists, on the server and back-office sides, with the rule "`_core` never imports `_domain`". It is exactly the boundary a template needs.
- **Point of attention**: `_core` also contains carpooling-specific elements (payments, reviews, reports, payment numbers…) and the current CMS. What is truly generic must be settled, and the CMS taken out of the starting base.
- **Work to do**: the current template is a product, not a model. A "business-free" version with a generator (new project = one command) must be extracted, otherwise every start will cost days of manual cleanup taken from the client's days.

Underlying question: how does a fix or an improvement to the template reach projects already delivered? Without an answer (versioned modules, or merging upstream branches), every project becomes a drifting copy and maintenance explodes.

## Economic check

1. **The internal 114 € per day value is not proof of profitability**: it comes from Entraid'ei, 5,000 € for about 44 days of actual work (so 2,500 € for 22 days). It must be compared with Aldaron's real daily cost (Claude, tools, hosting, charges, taxes): if it exceeds 114 €, the prices are too low. The client never sees this value: it only sets the prices.
2. **The revenue ceiling is visible.** At 114 € per internal day, one person working on one project at a time and working every working day (about 22 per month) reaches at most about 30,000 € per year. With 25 to 35 % non-billable time (pre-sales, meetings, support), that is about 20,000 to 22,000 € per year. The 2,500 € minimum puts a floor under each project, but the client pays a price, not days: a project finished faster than estimated raises the real daily revenue, a slower one lowers it. To check against living costs and the company's charges.
3. **Claude's speed gain goes to Aldaron**, as margin, for as long as the price is fixed. The overrun risk is Aldaron's too: the real pace must be measured on the pilot. If the real pace is far above the benchmarks, the internal estimates (and so the prices of new quotes) can come down to stay competitive.
4. **Time a pilot project**: adapting the base (branding, deployment, configuration), then the real pace of screens, integrations and back-office screens, to recalibrate the internal benchmarks.
5. **Internal floor.** A price is never lowered below the estimate divided by 0.9, nor below 2,500 €, to make a lower offer: a need comes out instead. An unplanned overrun is absorbed by Aldaron.
6. **The Site offer earns mostly through maintenance.** 600 € and 1,200 € pay for 5 and 10 internal days, with no margin for an overrun: a site that needs more rounds of corrections than planned, or that waits for its content, loses its gain. The monthly fee (about 30 € per site) is what makes the revenue last, provided the real hosting cost per site stays well below it. To measure on the first site, before publishing the prices.

## Risks and weak points

| Risk | Why it is a problem | Lead |
|---|---|---|
| Startups with fragile cash | Unpaid invoices, projects abandoned midway | Installments tied to progress (40 % at signature, 30 % mid-project, 30 % at going live): Aldaron's exposure is limited to the work between two installments |
| The startup expects a "finished" MVP | It pays a price but compares with a complete product; the disappointment comes at the end | Scoping before signature, initial list written in the contract, weekly demo |
| Scope creep | Every meeting adds "a bit more" and the price is fixed, so the overrun is Aldaron's | Swap rule: we replace, we do not add; more needs = a new quote |
| Rich web interface priced like a simple one | Tables, filters, dashboards and roles cost 3 to 6 times a standard screen, and the overrun is Aldaron's | Estimate by module with the back-office benchmark, longer scoping, delivery by lots, a dedicated simulator question (see [Sizing the need internally](#sizing-the-need-internally)) |
| Integration risk carried by Aldaron | An integration that takes three times longer eats the margin of a fixed price | Time-boxed trial with a decision, price adjusted if the integration is bigger, internal benchmarks kept up to date |
| Haggling over the price | The price is the only thing the client sees, so the discussion is about the price | The price comes from the benchmark sheet, not from a negotiation: to pay less, a need comes out, the 10 % margin is not trimmed |
| Many small projects | Free scoping, starts and gaps between assignments cost more than on a long project | The 2,500 € minimum and a short free scoping call for the product offer; for the Site offer, a closed catalogue with no free scoping |
| Revenue ceiling | One project at a time, about 20,000 to 22,000 € per year (see [Economic check](#economic-check)) | Decide whether it is enough, otherwise raise the internal value of a day (so the prices) or add occasional help |
| Dependence on the tool | Prices assume about 10 screens per day with Claude; by hand the same work takes several times longer, and the overrun is Aldaron's | Measure on the pilot, price revision clause for new quotes if the tool changes price or availability |
| Indicative simulator mistaken for a quote | The visitor holds Aldaron to a range | Wide ranges, a "firm quote after scoping" mention, no firm price without a brief |
| A single developer | Holidays, illness, bottleneck on sales and code | Limit to one project at a time, document, plan occasional help |
| Heavy stack for a small client | Parse Server, MongoDB and an Nx monorepo require operations | Hosting managed by Aldaron in the monthly maintenance fee, or a lighter option |
| The Site offer dilutes the startup message | A startup visitor sees "from 600 €" and expects the same price for a product | Two clearly separated offers on the page, the Site offer shown as a catalogue, never as an entry to the product offer |
| Support for small clients | A 600 € portfolio that needs three rounds of corrections or waits for its texts costs more than its price | Closed catalogue, content provided before the start, limited rounds of corrections, everything else is a new quote |
| Hosting of the Site offer | A Parse Server, MongoDB and Next.js stack per site at 30 € per month may cost more than it earns | One server shared between several sites, cost per site measured before publishing the fee |
| Intellectual property | The client believes they own the template | Contract: the template stays with Aldaron, the client receives a perpetual licence on their project |
| Market dependence | Prices in euros, team possibly in another economic context | Fix the contract in euros, check the tax framework and exchange |
| Liability for data | Authentication and user data engage the company in case of a leak | Capped liability clauses, insurance, documented backups |

## Open questions

Each question is followed by a recommendation. Those touching law, tax or the brand are a starting point to be validated by an accountant or lawyer, not legal advice.

- Is the name "Aldaron" free internationally (trademark, domain, social media)? The local registration (NIF, STAT) does not protect the brand elsewhere.
  - **Recommendation:** before any communication, check the trademark databases (Madagascar, European Union, WIPO global database), the domain and the social accounts. Reserve the domain and accounts right away, then file the trademark in the European Union if nothing blocks it, since the target is European.
- What is the billing country, and how to handle VAT, contract and payment in euros with European clients?
  - **Recommendation:** invoice from the registered company, in euros, with a template contract in French and English. Have an accountant validate the VAT treatment and the way euros are collected before the first quote.
- Does the client receive the full source code? Under what licence, and does the template stay visible?
  - **Recommendation:** yes for their project's code, delivered in their own repository at the end of the project, with a perpetual licence to use and modify. The core of the template remains Aldaron's property, which can reuse it for other clients; the contract says so explicitly.
- What happens if the startup stops before the end, or stops responding?
  - **Recommendation:** the installments already paid stay with Aldaron and the code produced up to the last paid installment is handed over; a pause of one week at most is possible, beyond that the project resumes according to Aldaron's availability. Both rules are written into the contract.
- What warranty length and support level?
  - **Recommendation:** 30 days of bug fixing after the end, with a response within 2 working days. A request that changes the planned behavior is not a bug: it is a new quote. After the 30 days, the maintenance fee sets shorter response times for emergencies.
- Who hosts: the client on their account, or Aldaron?
  - **Recommendation:** the accounts (hosting, domain, store accounts) belong to the client, who can thus leave with their product. Aldaron administers them under the monthly maintenance fee, and offers managed hosting as an option for startups without technical skills.
- Is mobile still Expo?
  - **Recommendation:** yes, Expo, as in the template. A single technical choice keeps the starting base reusable from one project to the next.
- Which first pilot client, and on what terms (reduced price in exchange for a testimonial)?
  - **Recommendation:** start with an internal project or someone close to time the base, then a first client from your network. Offer a moderate discount in exchange for a testimonial, a publishable case study and the right to show the product, with a project at the 2,500 € minimum, all written into the contract.
- What prices and what market for the Site offer?
  - **Recommendation:** start from 600 € (Portfolio) and 1,200 € (Showcase), which pay for about 5 and 10 internal days at 114 €, and confirm them by timing the first site. If the target market is local (Madagascar), check purchasing power before publishing the prices, and keep the monthly maintenance as the regular source of revenue. Never go below the estimate divided by 0.9: remove an option (a language, a page) rather than lowering the price.

## Prompt for Claude Design

To paste into Claude Design to produce Aldaron's design system first, before any page. The brackets are to be filled in or left to the tool's proposal. The prompt is written in French, the language of the founders' working material.

````text
Tu es directeur artistique et designer de système de design. Tu conçois l'identité
visuelle et le système de design de « Aldaron », une société de développement qui
livre des produits web et mobile à des startups.

## Contexte
- Cible : fondateurs et équipes de startups (pré-seed à série A), en Europe.
- Promesse de la marque : un MVP à un prix annoncé avant la signature (à partir de
  2 500 €), calculé à partir de l'idée, du cahier des charges ou de la maquette du
  client, et avec connexion et back-office déjà en place dès le premier jour. Le client
  ne voit jamais de jours ni de mois.
- Seconde offre, séparée : l'offre Site (portfolio, site vitrine d'une boutique), deux
  formules à prix de catalogue, à partir de 600 €, pour des indépendants et de petits
  commerces. L'identité reste sérieuse pour les startups et accueillante pour ces
  clients non techniques.
- Ton : fiable, rapide, moderne, sans jargon ; sérieux sans être froid.
- Langues du site : français et anglais.
- Références ou mots-clés d'ambiance : [à compléter, sinon propose-les].

## Stack imposée (le design doit s'y implémenter sans friction)
- Next.js (App Router), Tailwind CSS et shadcn/ui.
- Les couleurs sont des variables CSS (format shadcn : --background, --foreground,
  --primary, --secondary, --muted, --accent, --destructive, --border, --input,
  --ring, --chart-1 à --chart-5) avec une valeur claire et une valeur sombre
  (classe .dark), exposées comme utilitaires Tailwind. Aucune couleur écrite en dur
  dans les composants.
- Polices chargées avec next/font.
- Icônes : une bibliothèque cohérente avec shadcn/ui (Lucide par défaut) ; si tu en
  proposes des sur mesure, donne la grille, l'épaisseur de trait et les règles.

## Étape 1 — uniquement le système de design (ne conçois aucune page)
Commence par proposer 3 directions visuelles distinctes (une phrase, une palette
et une paire de polices chacune), puis attends mon choix. Ensuite, produis :

1. Logo : symbole + logotype, versions horizontale et empilée, fond clair, fond
   sombre et monochrome, taille minimale, zone de protection, usages interdits.
   Livré en SVG.
2. Favicons et icônes d'application : favicon.svg, favicon.ico, apple-touch-icon
   (180 px), icônes PWA 192 et 512 px dont une version « maskable », image de
   partage (Open Graph, 1200 x 630). Liste des fichiers et du code Next.js
   (metadata, manifest) pour les brancher.
3. Couleurs : palette de marque, couleurs sémantiques (succès, avertissement,
   erreur, information), neutres ; tous les jetons en clair et en sombre, avec un
   contraste conforme WCAG AA vérifié pour chaque paire texte / fond.
4. Typographie : police de titres et de texte (libres de droit), échelle de tailles,
   graisses, hauteurs de ligne, règles d'usage ; extrait next/font prêt à coller.
5. Fondations : rayons, espacements, ombres, bordures, états (survol, focus
   visible, désactivé), mouvements.
6. Composants de base shadcn/ui habillés avec ces jetons : Button, Input, Select,
   Checkbox, Switch, Card, Dialog, Dropdown, Table, Form, Badge, Alert, Tabs, Toast.
   Montre chaque état (normal, survol, focus, désactivé, erreur) en clair et en
   sombre.

## Livrables
- globals.css avec toutes les variables (clair et sombre) et la configuration
  Tailwind correspondante, prêts à coller.
- Une page « design system » qui présente logo, couleurs, typographie, icônes et
  composants.
- Les fichiers du logo et des icônes, nommés et rangés par dossier.
- Un court guide d'usage (une page) : quand utiliser quelle couleur, quel composant.

## Règles
- Accessibilité d'abord : contraste AA, focus visible, cibles tactiles d'au moins
  44 px.
- Pas de dégradés ni d'effets décoratifs qui ne se traduisent pas en CSS simple.
- Reste compatible avec les composants shadcn/ui existants : change les jetons,
  pas la structure.

## Étape 2 — après ma validation seulement
Pages du site : accueil, offre et prix (à partir de 2 500 €, exemples de projets avec
leur prix, simulateur de prix, section « Offre Site » avec ses deux formules à prix de
catalogue), réalisations, à propos, contact. Je te donnerai le contenu à ce moment-là.
````

## Prompt for the pricing simulator

To paste into Claude Design to build the indicative price simulator of the pricing page. It never shows days, months or a daily rate: only a range in euros, starting at 2,500 € for a product. A web-only need is not priced here: it leads to the plans of the Site offer (see [Prompt for the Site offer](#prompt-for-the-site-offer)). The euro values of the `PRICING` object are starting hypotheses, to be calibrated on the reference examples and then on the timed projects. The prompt is written in French, the language of the founders' working material.

````text
Tu es designer produit et développeur front-end. Tu conçois le simulateur de prix de
« Aldaron », une société de développement qui livre des produits web et mobile à des
startups. Le simulateur remplace l'ancien simulateur « par durée » de la page Pricing
(design/aldaron-web/Pricing.html).

## Principe à respecter partout
- Le client apporte une idée, un cahier des charges ou une maquette, et reçoit UN PRIX.
- Le client ne voit JAMAIS : un nombre de jours, de semaines ou de mois, une durée, un
  tarif journalier, un prix par écran, un prix par intégration, ni le détail du calcul.
  Pas un seul de ces mots dans l'interface, les libellés, les infobulles, les messages
  d'erreur ou le texte alternatif. Deux exceptions seulement, qui ne décrivent pas la
  durée du projet : la garantie « 30 jours de correction de bugs » et la maintenance
  facultative « par mois ».
- Prix minimum du simulateur : 2 500 € (offre produit). Aucun résultat en dessous, même
  pour un tout petit besoin de produit.
- Le simulateur ne chiffre JAMAIS un site seul (portfolio, site vitrine) : ce besoin relève
  de l'offre Site, à prix de catalogue. Aucun « à partir de 2 500 € » n'apparaît pour lui.
- Le simulateur donne une FOURCHETTE INDICATIVE en euros, jamais un devis ferme. Le devis
  ferme vient après un cadrage gratuit.
- Cible : fondateurs de startups, souvent non techniques. Ton clair, sans jargon.

## Le parcours (une seule page, une question d'orientation puis 5 étapes courtes, résultat visible en direct)
0. « Que voulez-vous ? » : un produit (application, SaaS, plateforme) / un site (portfolio,
   site vitrine d'une boutique ou d'une activité). Choix unique, avant toute autre
   question. Si « un site » : le simulateur s'arrête, n'affiche ni fourchette ni « à partir
   de 2 500 € », et présente à la place les deux formules de l'offre Site (Portfolio 600 €,
   Vitrine 1 200 €, contenu résumé en 3 puces chacune) avec un bouton « Choisir cette
   formule » qui mène à la section Offre Site de la page.
1. « Qu'apportez-vous ? » : une idée / un cahier des charges / une maquette (choix unique).
   Cela règle la largeur de la fourchette et le texte de précision (voir Résultat).
2. « Pour quel support ? » : web / mobile / web et mobile.
   Si le support comprend le web, ajoute la question « Votre interface web est-elle simple
   ou riche ? » : simple (pages, listes, formulaires) / riche (tableaux, filtres, tableaux
   de bord, rôles, éditeur). Choix unique, « simple » par défaut.
3. « Quelle taille ? » : nombre d'écrans approximatif (curseur de 5 à 250, avec champ
   numérique synchronisé), avec l'aide « une vue distincte compte pour un écran ; ses
   états et variantes sont inclus ». Pour « une idée », propose aussi 4 repères en mots
   (quelques écrans / un produit simple / un produit complet / un grand produit) qui
   règlent le curseur.
4. « Et le back-office ? » : aucun / simple / avancé (rôles, modération, exports).
5. « Des fonctions particulières ? » (cases à cocher) : connexion Google ou Apple,
   cartes et recherche d'adresse, scan de document d'identité, messagerie en temps réel,
   paiement en ligne. Puis la complexité métier : standard / quelques parcours complexes
   / très orienté métier.
Ajoute 4 exemples en un clic qui préremplissent le formulaire : « Première version d'un
SaaS », « Application mobile de plus de 100 écrans », « Application mobile avec
back-office complexe », « Produit web et mobile avec paiement ».

## Le calcul (en euros uniquement, dans un seul bloc de constantes en tête du script)
Écris un objet PRICING modifiable facilement, sans aucun mot « jour » ni « mois » :
- plancher : 2 500
- socle et mise en production : 300
- par écran (mobile ou web simple) : 22
- par écran web riche : 55 (hypothèse à calibrer) ; pour « web et mobile » avec un web
  riche, le tarif par écran est la moyenne des deux (38,5)
- support « web et mobile » : les écrans comptent ×1,7
- back-office : aucun 0 / simple 400 / avancé 1 600
- fonctions : Google ou Apple 230 ; cartes et adresse 65 ; scan de document 230 ;
  messagerie temps réel 500 ; paiement 500 (première intégration comprise, puis 22 par
  intégration supplémentaire)
- complexité métier : standard +0 % / quelques parcours complexes +10 % / très métier
  +30 %, appliquée aux écrans seulement
Formule : total = socle + écrans × tarif × support × (1 + complexité) + back-office +
fonctions ; prix = max(2 500, total arrondi à la centaine la plus proche).
Largeur de la fourchette selon la précision : maquette +15 %, cahier des charges +30 %,
idée +60 % (borne haute arrondie à la centaine). Si l'interface web est « riche », la
fourchette s'élargit de 15 points (maquette +30 %, cahier des charges +45 %, idée +75 %).
CALIBRAGE OBLIGATOIRE : les 4 exemples (interface web « simple ») doivent tomber à ±5 % des prix de référence
(≈ 2 500 €, ≈ 5 000 €, ≈ 7 500 €, ≈ 7 500 €). Ajuste les valeurs de PRICING (tu peux les
bouger de ±15 %) jusqu'à y arriver, puis affiche-moi le résultat calculé de chaque exemple.

## Le résultat (panneau fixe à droite sur ordinateur, barre en bas sur mobile)
- Le prix en grand : « À partir de 2 500 € » quand on est au plancher, sinon
  « Entre X € et Y € » (séparateur de milliers adapté à la langue, espace insécable).
- Une ligne de précision : « Estimation à ±15 % » (maquette), « ±30 % » (cahier des
  charges), « Première estimation, à affiner ensemble » (idée).
- Ce qui est compris, en 4 puces, sans prix : connexion et back-office de base déjà en
  place, mise en production, remise du code et des comptes, 30 jours de correction de bugs.
- Ce qui n'est pas compris : hébergement et services tiers, comptes des stores, payés
  directement par la startup ; maintenance optionnelle de 150 à 400 € par mois.
- Une note : « Prix fixe à la signature, payé en 3 échéances : 40 % à la signature, 30 %
  à la démonstration de mi-parcours, 30 % à la mise en ligne. »
- Le bouton principal « Demander un devis ferme (cadrage gratuit) » : ouvre un formulaire
  de contact (nom, e-mail, message) avec le récapitulatif des réponses prérempli ; le
  récapitulatif ne contient pas la fourchette de prix. Bouton secondaire « Copier mon
  récapitulatif ».
- Si le total calculé dépasse 15 000 € (10 000 € quand l'interface web est « riche ») :
  n'affiche pas de fourchette, affiche « Projet d'envergure : parlons-en » et le bouton
  de devis.
- Si l'interface web est « riche » : ajoute à la note de paiement « Livraison par lots,
  chaque lot étant payé à sa livraison ; les lots sont convenus lors du cadrage. »
- Si le support est « web », avec 8 écrans ou moins, aucun back-office et aucune fonction
  particulière : affiche sous le résultat un encart « Vous voulez seulement un site ? Voir
  l'offre Site », avec un lien vers la section Offre Site et sans aucun prix dans l'encart.

## Contraintes techniques et de design
- Page HTML autonome, interactive (survol, focus, clic, états réels), sans framework
  imposé ; CSS lisible et organisé en sections commentées (variables, base, composants,
  états, responsive) ; JavaScript dans la même page.
- Couleurs uniquement via des variables CSS (jetons du design system Aldaron) avec une
  valeur claire et une valeur sombre ; aucune couleur écrite en dur.
- Langues : français et anglais, avec un sélecteur ; tous les textes dans un objet de
  traduction, aucun texte écrit en dur dans le HTML. Dans les deux langues, aucun mot
  de durée du projet (durée, jour, semaine, mois / duration, day, week, month), sauf les
  deux exceptions ci-dessus.
- Panneau de réglages dans la page elle-même : thème clair / sombre, langue,
  point de rupture (mobile, tablette, ordinateur, grand écran), et les valeurs de PRICING
  modifiables en direct pour tester le calibrage.
- Accessibilité : chaque champ a un libellé visible ; groupes de choix en fieldset avec
  legend ; le prix est dans une zone aria-live polie ; navigation complète au clavier,
  focus visible ; contraste AA ; cibles tactiles d'au moins 44 px ; le curseur a un champ
  numérique équivalent.
- État vide (avant toute réponse) : affiche la question d'orientation seule, sans prix.
  Après « un produit », affiche « À partir de 2 500 € » et invite à répondre.
- Pas de dégradés ni d'effets décoratifs qui ne se traduisent pas en CSS simple.

## Hors simulateur, à corriger dans la même page
Remplace les cartes « 2 semaines / 1 mois / 2 mois / 3 mois » et la phrase « Un MVP en
2 mois. 5 000 € » par : un prix de départ (« À partir de 2 500 € »), les 4 exemples de
projets avec leur prix seul, et les règles (prix fixe, échange d'un besoin contre un autre,
paiement en 3 échéances, cadrage gratuit).
Ajoute une section « Offre Site » distincte, sous l'offre produit (voir le prompt de
l'offre Site), un lien « Site » dans la navigation et, sous le titre de la page, la ligne
« Vous voulez seulement un site ? Voir l'offre Site ».
````

## Prompt for the Site offer

To paste into Claude Design to build the "Site offer" section of the offer and price page. It is a catalogue of two fixed-price plans, with no simulator, no range and no free scoping: the product offer's simulator sends web-only needs to it. The prices of the `SITE_PRICING` object are starting hypotheses, to be confirmed by timing the first site. The prompt is written in French, the language of the founders' working material.

````text
Tu es designer produit et développeur front-end. Tu conçois la section « Offre Site » de la
page Offre et prix d'« Aldaron » (design/aldaron-web/Pricing.html), à côté de l'offre
produit pour les startups, sans modifier cette dernière.

## Contexte
- Aldaron a deux offres séparées. L'offre produit (startups, à partir de 2 500 €) a déjà
  sa section et son simulateur : ne les touche pas. L'offre Site s'adresse à quelqu'un qui
  veut seulement un site : un portfolio, le site vitrine d'une boutique ou d'une petite
  activité.
- C'est un catalogue : deux formules à prix fixe et affiché, sans simulateur, sans
  fourchette, sans cadrage gratuit. Le mot « devis » n'apparaît pas dans cette section, et
  « à partir de 2 500 € » n'y apparaît nulle part.
- Cible : indépendants, créatifs, commerçants, artisans, souvent non techniques. Ton
  chaleureux, direct, sans jargon : jamais « back-office » ni « CMS », mais « votre espace
  pour modifier le site ».
- Le client ne voit JAMAIS : un nombre de jours, de semaines ou de mois pour la
  construction, un tarif journalier, ni le détail du calcul. Deux exceptions seulement :
  la garantie « 30 jours de correction de bugs » et le forfait de maintenance « par mois ».
  La date de mise en ligne est confirmée par écrit après la commande, jamais promise sur
  la page.

## Contenu
Titre : « Un site, à prix fixe. » Sous-titre : « Le prix est affiché, il n'y a rien de
caché, et vous modifiez vous-même vos textes et vos photos. »

Deux cartes côte à côte (empilées sur mobile), même structure, chacune avec un bouton
« Choisir cette formule » qui présélectionne la formule dans le formulaire plus bas :
1. Portfolio · 600 € · « Pour une personne qui présente son travail : designer,
   développeur, photographe, consultant. »
   - Jusqu'à 5 pages : accueil, projets, articles, à propos, contact
   - 2 langues au choix : français, anglais, malgache
   - Votre espace pour ajouter et modifier vos projets, vos articles et vos textes
   - 1 tour de corrections avant la mise en ligne
2. Vitrine · 1 200 € · « Pour une boutique ou une petite activité qui veut être trouvée
   et montrer ses photos, son adresse et ses horaires. »
   - Jusqu'à 8 pages : accueil, présentation, produits ou services, galerie, infos
     pratiques (adresse, horaires, carte), actualités, contact
   - Jusqu'à 3 langues : français, anglais, malgache
   - Votre espace pour modifier le site, plus l'inscription à une lettre d'information
   - 2 tours de corrections avant la mise en ligne

Sous les cartes, un bloc « Compris dans les deux » : thème clair et sombre, affichage adapté
au téléphone, référencement de base (titres, descriptions, plan du site), formulaire de
contact, nom de domaine configuré, mise en ligne, 30 jours de correction de bugs.

Puis quatre blocs courts :
- « Ce que nous attendons de vous » : vos textes et vos photos avant le démarrage ; sans
  eux, la mise en ligne attend.
- « Ce qui n'est pas dans l'offre Site » : vente en ligne et paiement, comptes pour vos
  visiteurs, réservation, fonctions sur mesure. Phrase : « Vous avez un projet plus large ?
  Écrivez-nous, nous en parlons. » (lien vers le contact, aucun prix)
- « Après la mise en ligne » : hébergement et maintenance en option, 30 € par mois :
  mises à jour de sécurité, sauvegardes, petite aide pour vos contenus. Le nom de domaine
  est à votre nom (environ 15 € par an, payés par vous).
- « Paiement » : 50 % à la commande, 50 % à la mise en ligne.

Quatre étapes, en frise : 1. Vous choisissez une formule et remplissez le formulaire.
2. Vous nous envoyez vos textes et vos photos. 3. Nous construisons le site et vous le
montrons. 4. Mise en ligne, puis corrections.

## Le formulaire de commande (sous les étapes)
Champs : nom, e-mail, formule (choix unique Portfolio / Vitrine), « À quoi servira votre
site ? » (1 à 2 phrases), langues souhaitées (cases : français, anglais, malgache), nom de
domaine souhaité (facultatif). Bouton « Commander mon site ». À l'envoi : ouvre un e-mail à
contact@aldaron.eu, sujet « Commande Site Aldaron », avec les réponses (même mécanique que
le formulaire de cadrage existant). Note : « Pas de rendez-vous à prévoir : nous répondons
par écrit, avec la confirmation et la date de mise en ligne. »

## Liens avec le reste de la page
- Navigation : ajoute le lien « Site » vers cette section.
- Sous le titre de la page : la ligne « Vous voulez seulement un site ? Voir l'offre Site. »
- Les prix sont dans un objet SITE_PRICING en tête du script (portfolio 600, vitrine 1 200,
  maintenance 30), modifiable en direct depuis le panneau de réglages.

## Contraintes techniques et de design
- Ajoute la section à la page HTML existante, interactive (survol, focus, clic, états
  réels) ; CSS lisible et organisé en sections commentées (variables, base, composants,
  états, responsive) ; JavaScript dans la même page.
- Couleurs uniquement via les variables CSS (jetons du design system Aldaron) avec une
  valeur claire et une valeur sombre ; aucune couleur écrite en dur.
- Langues : français et anglais ; tous les textes dans l'objet de traduction existant,
  aucun texte écrit en dur dans le HTML. Dans les deux langues, aucun mot de durée du
  projet (durée, jour, semaine, mois / duration, day, week, month), sauf les deux
  exceptions ci-dessus.
- Panneau de réglages dans la page elle-même : thème clair / sombre, langue, point de
  rupture (mobile, tablette, ordinateur, grand écran), et les trois valeurs de
  SITE_PRICING.
- Accessibilité : libellé visible pour chaque champ ; groupes de choix en fieldset avec
  legend ; les deux formules dans une liste sémantique ; prix lu correctement par un
  lecteur d'écran (« 600 euros ») ; navigation complète au clavier, focus visible ;
  contraste AA ; cibles tactiles d'au moins 44 px.
- Pas de dégradés ni d'effets décoratifs qui ne se traduisent pas en CSS simple.
````

## Next steps

1. Choose a pilot project (real or internal) to time the starting base and the internal benchmarks.
2. Extract `1lalana-platform` as a business-free, CMS-free template with a project generator.
3. Write the internal estimation sheet (benchmarks in days) and the exact list of the starting base.
4. Draft the template contract: price, initial list of needs, start and delivery dates, payment installments (40 / 30 / 30), pause, ownership, warranty.
5. Prepare the offer and price page ("from 2,500 €", examples with their price only), the indicative simulator, and a scoping template for the first meetings.
6. Validate the name (trademark and domain) before any communication.
7. Time a first site (portfolio or showcase) on `portfolio-platform` to confirm the Site offer's prices, the hosting cost per site and the monthly fee, then publish the Site offer section.
