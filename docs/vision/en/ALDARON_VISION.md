# Aldaron — company vision

## Table of Contents

- [The idea in one sentence](#the-idea-in-one-sentence)
- [Positioning](#positioning)
- [The 2,000 € foundation](#the-2000--foundation)
  - [What is included](#what-is-included)
  - [What is not included](#what-is-not-included)
- [The minimum package at 1,000 €](#the-minimum-package-at-1000-)
- [Pricing levers](#pricing-levers)
- [The mobile app](#the-mobile-app)
  - [Mobile foundation content](#mobile-foundation-content)
  - [Mobile screen prices](#mobile-screen-prices)
  - [Store publishing](#store-publishing)
- [Sample quotes](#sample-quotes)
- [The template is the main asset](#the-template-is-the-main-asset)
- [Economic check](#economic-check)
- [Risks and weak points](#risks-and-weak-points)
- [Open questions](#open-questions)
- [Prompt for Claude Design](#prompt-for-claude-design)
- [Next steps](#next-steps)

> Exploration document. The figures are **hypotheses to calibrate**, not commitments: the [Economic check](#economic-check) section says how to validate them. The content of the foundation is taken from what `1lalana-platform` contains today and must be rechecked when the template is extracted.

## The idea in one sentence

Aldaron is a development company that delivers startups a web product (and a mobile app as an option) **with authentication, role management, a CMS and a back-office already in place on day one**, from 2,000 € for the full foundation and a floor price of 1,000 € for the basics alone, because every project starts from a proven template instead of a blank page.

> Reading assumption: the name "Aldaron", the NIF and the STAT already exist (the company is already registered). If the name is actually taken by a third party, that must be settled before anything else (see [Open questions](#open-questions)).

## Positioning

| Question | Proposed answer |
|---|---|
| Target | Startups only (pre-seed to series A). No agencies, no large accounts, no small shops |
| Promise | A real MVP, with its admin tools, delivered fast, without the startup reinventing login, roles and back-office |
| What sets us apart | The back-office, roles and CMS are not "phase 2": they are in the foundation price |
| What we do not do | Projects under 1,000 €, brochure sites alone, redesigns without a product, hourly work without a scope |
| Selling point | Predictable time and price: we start from a base already run in production and only bill what is specific |

The 1,000 € floor (the minimum package) is a filter as much as a price: it covers about 9 days of work at the reference rate of 114 € per day. Below that, the sales and support time exceeds what the project earns.

## The 2,000 € foundation

### What is included

Based on what `1lalana-platform` already contains (the generic `_core` part), to be confirmed at extraction:

| Block | Content |
|---|---|
| Authentication | Login, account creation, forgotten password, email invitations, two-factor authentication (MFA), step-up verification for sensitive actions |
| Roles and rights | Configurable roles, rights per screen and per action, management of employees / back-office users |
| CMS | Pages and sections, articles, categories, content version history |
| Public website | Next.js, multilingual (**English and French included**, site and back-office), basic SEO (sitemap, robots, manifest), contact form, newsletter, light / dark theme |
| Basic back-office | Dashboard, profile, settings, received contacts, notifications, audit log, simple statistics |
| Email and SMS | Transactional email and SMS sending included and configured (provider of the client's choice), translated message templates |
| Going live | Pre-production and production environments, deployment, domain name and transactional emails configured |
| Duration | From **one month** after signature, for the foundation alone. Every addition (screens, integrations, mobile) lengthens it, with mockups adding one to two weeks, and the timeline is stated in the quote |
| Frame | Client branding applied (logo, colors, texts), up to **5 custom public pages** (pages and content created in the CMS are unlimited and free) and **5 back-office screens** specific to the client, half a day of training, 30 days of bug fixing after delivery |

### What is not included

- The mobile app.
- Custom screens and pages beyond the foundation quantities (CMS-managed content is never billed).
- Any complex business logic (payment, booking, matching, workflows).
- Third-party integrations (payment, maps, CRM…); email and SMS are included in the foundation.
- Hosting and maintenance after the 30 days.
- Custom design from scratch: the foundation applies the client's brand to an existing design system.

## The minimum package at 1,000 €

The full foundation remains the reference offer. When a web project does not need the public website or a complex back-office, the full foundation is not sold: the minimum package is, which contains only the basics of a product where people sign in. A mobile app alone does not take the minimum package: it starts from the Entraid'ei technical base (Expo, Supabase), and the mobile foundation already covers authentication and going live (see [The mobile app](#the-mobile-app)).

| Block | Content |
|---|---|
| Authentication | Login, account creation, forgotten password, email invitations, two-factor authentication (MFA), step-up verification for sensitive actions |
| Going live | Pre-production and production environments, deployment, domain name configured |
| Duration | From **two weeks** after signature, for the package alone |
| Frame | Client branding applied (logo, colors, texts), half a day of training, 30 days of bug fixing after delivery |

The 1,000 € price corresponds to about 9 days of work at the reference rate of 114 € per day (see [Economic check](#economic-check)). Roles, CMS, public website, back-office and email / SMS are not included: each need is billed with the levers below. If a project needs several of them and the total approaches 2,000 €, the full foundation is the better deal.

## Pricing levers

The foundation covers the "skeleton". Every addition is billed along **eight levers**, from the simplest to the most variable:

| Lever | Unit | Starting range (to calibrate) |
|---|---|---|
| Custom public page | per page | from 40 € (specific coded layout, depending on its complexity). Pages and content created in the CMS are **free** and unlimited |
| Extra back-office screen | per screen | 40 € (standard list + form) to 70 € (filters, charts, workflow) |
| Business complexity | per feature | multiplier on the screens concerned: ×1 simple, ×1.5 medium, ×2.5 high |
| Third-party integration | per service | 400 € (simple service: maps, CRM…) to 1,200 € (complex service: document scan, real-time messaging…); payment: 60 € per payment integration |
| Custom email / SMS sending | per implementation | 30 € (e.g. an email or SMS sent on a notification) |
| Extra language (beyond the included English and French) | per language | **10 %** of the cost of the translated screens if the language uses the Latin alphabet, left to right (Spanish, German, Malagasy…) and the client supplies the texts; **15 %** if Aldaron translates or proofreads, or if the language needs adaptation (Arabic right-to-left, non-Latin script, long texts that break layouts) |
| Design and mockups | per screen, or flat fee | 50 % of the development price of the mocked-up screen (Figma mockups validated before coding); flat fee of 500 to 1,000 € for an identity and UI kit specific to the client |
| Mobile app | foundation + screens | mobile foundation 1,000 €, then screens from 60 € with stackable extras (see [The mobile app](#the-mobile-app)) |

Rules to settle up front to avoid arguments:

- **One screen = one view with a single purpose** (list, detail, form). A modal is not a screen; a complex tab is.
- Complexity is assessed **before** the quote, on a written grid, never during the project.
- External costs (Apple / Google developer accounts, hosting, third-party services) are re-billed or paid directly by the startup.
- Anything out of scope goes through a priced amendment.
- The language percentage applies to the cost of the custom screens and pages to translate, assessed before the quote. The rate (10 % or 15 %) is set from the "Extra language" lever grid.
- The foundation includes no design: it applies the client's brand to the existing design system. Mockups are an option, reserved for what matters (public pages, sign-up journey); the back-office stays on the design system as is.
- Two rounds of changes per mocked-up screen, then an amendment. Mockups are validated in writing before coding, and any change after validation is billed.
- A client may bring their own designer. A mockup that ignores the design system forces new components to be built: the complexity multiplier applies.

## The mobile app

### Mobile foundation content

| Block | Content |
|---|---|
| Project | Configured Expo app, client branding applied (logo, colors, light / dark theme, icon and splash screen), English and French |
| Authentication | Login, forgotten password, MFA, as on the web |
| Data and rights | With a web project: connection to the existing server, with the same roles and rights as the back-office. Mobile app alone: the Entraid'ei technical base (Supabase), without the minimum package |
| Navigation | Tabs and screen stack |
| Push notifications | The infrastructure (receiving, registering devices). Sending tied to a specific screen is the "service" extra in the grid below |
| Environments | Pre-production and production, test build delivered to the client (TestFlight and Google internal testing) |
| Publishing | Initial store publication (see [Store publishing](#store-publishing)) |
| Warranty | 30 days of bug fixing, like the web foundation |

Not included: business screens, custom services (SMS, email) other than basic push notifications, Apple and Google accounts and their fees, advanced offline mode, maintenance after the 30 days.

### Mobile screen prices

A base price and stackable extras.

| Item | Price |
|---|---|
| Base screen (list, detail, simple form) | 60 € |
| + Camera, file upload | + 10 € |
| + Service (SMS, email, push notification) | + 20 € |
| + Geolocation, map | + 30 € |
| + Filters, charts, multi-step workflow | + 20 € |
| + Payment | + 120 € |

Stacking examples: form with a push notification = 80 €; map and filters = 110 €; payment = 180 €; every extra except payment = 140 €. The payment extra is separate from the 60 € payment integration, which is a service configured once.

### Store publishing

The client creates and owns their Apple and Google developer accounts; Aldaron publishes on them as a team member. Aldaron never publishes under its own account: moving an app from one account to another is heavy, and control of reviews and statistics would be lost.

| Service | Price |
|---|---|
| Initial publication (iOS and Android), one submission per store and one resubmission after a rejection | included in the foundation |
| Extra resubmission after a rejection caused by a client request | 60 € each |
| Publishing an update (outside the maintenance plan) | 40 € per store |
| Creating the Apple or Google developer account on the client's behalf (D-U-N-S file, checks) | 100 € |
| Store listings translated beyond English and French | 10 % of the cost of the texts, as for languages |

- Account fees are re-billed at cost, with no margin: 99 $ per year for Apple, 25 $ once for Google.
- A single store (often Android for an MVP): the foundation drops by about 150 €.
- Updates are included in the monthly maintenance plan.
- Review times (Apple 1 to 3 days, sometimes more; Google a few hours to a few days) are out of our control: allow for them in the schedule.
- An Apple organization account needs a D-U-N-S number, which can take weeks: start it at signature.

## Sample quotes

| Case | Detail | Total |
|---|---|---|
| Floor: login only | Minimum package (login, account creation, forgotten password) | **1,000 €** |
| Minimal: a SaaS startup's site + back-office | Foundation + 2 custom public pages (80 €) | **2,080 €** |
| Web MVP with payment | Foundation + 3 standard screens (120 €) + 2 complex screens (140 €) + payment (60 €) | **2,320 €** |
| Web + mobile MVP | Foundation + 3 standard screens (120 €) + 2 complex (140 €) + payment (60 €) + mobile foundation (1,000 €) + 6 basic mobile screens (360 €) + 2 mobile screens with map and filters (2 × 110 € = 220 €) | **3,900 €** |
| Mobile app alone, no website or complex back-office | Mobile foundation on the Entraid'ei technical base (1,000 €) + mobile screens at grid prices | **from 1,000 €** |

Proposed invoicing: 40 % at signature, 30 % at pre-production delivery, 30 % at go-live.

After delivery: a monthly maintenance and hosting plan (for example 150 to 400 €), which funds security updates and smooths out the revenue.

## The template is the main asset

All of Aldaron's margin rests on the template. Three findings about `1lalana-platform`:

- **Strength**: the `_core` (generic back-office) / `_domain` (project business) split already exists, on the server and the back-office, with the rule "`_core` never imports `_domain`". It is exactly the boundary a template needs.
- **Watch point**: `_core` also holds carpooling-specific items (payments, ratings, reports, payout numbers…). What is truly generic must be decided before promising the foundation.
- **Work to do**: the current template is a product, not a model. A "business-free" version with a generator (new project = one command) has to be extracted from it, otherwise every start costs days of manual cleanup.

Underlying question: how does a fix or improvement to the template reach projects already delivered? Without an answer (versioned modules, or merging upstream branches), every project becomes a drifting copy and maintenance explodes.

## Economic check

The price only makes sense against real time. To measure before publishing a grid:

1. Time the adaptation of the template on a real pilot project: branding, deployment, configuration, training. Starting target: **under 15 working days** for the full foundation, and **under 9 days** for the minimum package.
2. The reference rate is **114 € per day**. It comes from a calculation on the Entraid'ei project: 5,000 € for about 44 days of actual work, built with Claude at about 10 screens per day. At that rate, the 1,000 € minimum package is about 9 days of work; the full 2,000 € foundation, if it fits in 15 days, earns about 133 € per day. That figure must be viable against real costs (Claude, tools, hosting, sales time, taxes).
3. Measure the real time of a standard screen, a complex screen, an integration, on 1lalana itself, and recalibrate the ranges above.
4. Account for non-billable time: pre-sales, meetings, post-delivery support. It often weighs 25 to 35 % of total time.
5. The pace of 10 screens per day measures output, not delivery: review, fidelity to the mockup, testing on devices and fixes come on top. Validate it on the pilot, from the first prompt to a screen that is reviewed and tested.

**Internal floor (never shown to the client).** The price stays a flat fee; the reference rate is only used to check that a quote earns at least the minimum. Quote floor = estimated working days × 114 €, with a minimum of 1,000 €. A quote whose total is below this floor is raised or declined.

| Project duration | Quote floor |
|---|---|
| 9 days (minimum package) | 1,000 € (the minimum) |
| 15 days | 1,710 € |
| 2 months (about 44 working days) | 5,016 € |
| 3 months (about 66 working days) | 7,524 € |

The rate is fixed, with no volume discount. It must be checked against Aldaron's real daily cost (Claude, tools, hosting, charges, taxes): if that cost is above 114 €, the floor is too low. At 114 €, a 60 € screen is worth about half a day, while the pace with Claude is about 10 screens per day: the margin on screens funds review, testing, sales and support.

## Risks and weak points

| Risk | Why it is a problem | Lead |
|---|---|---|
| Startups with fragile cash | Unpaid invoices, projects abandoned midway | 40 % deposit, payment milestones, code ownership transferred on final payment |
| Scope creep | The low starting price attracts "just a bit more" requests at every meeting | Written complexity grid, amendments, signed scope |
| Heavy stack for a small client | Parse Server, MongoDB and an Nx monorepo need operating | Hosting managed by Aldaron within the monthly plan, or a lighter option |
| Dependence on the tool | The prices assume about 10 screens per day with Claude; by hand, the same work takes several times longer | Measure the real pace on the pilot, plan a price-review clause if the tool changes its pricing or availability |
| A single developer | Leave, illness, bottleneck on both sales and code | Cap simultaneous projects, document, plan for occasional help |
| Intellectual property | The client believes they own the template | Contract: the template stays with Aldaron, the client gets a perpetual license on their project |
| Competition | No-code tools, low-price agencies, freelancers | Do not compete on price: compete on delivery time, back-office quality and follow-up |
| Market dependency | Prices in euros, the team may be in a different economic context | Set the contract in euros, check the tax framework and exchange rate |
| Data liability | Authentication and user data engage the company in case of a leak | Capped-liability clauses, insurance, documented backups |

## Open questions

Each question is followed by a recommendation. Those touching law, tax or the trademark are a starting point to have validated by an accountant or a lawyer, not legal advice.

- Is the name "Aldaron" free internationally (trademark, domain, social handles)? Local registration (NIF, STAT) does not protect the brand elsewhere.
  - **Recommendation:** before any communication, check the trademark databases (Madagascar, European Union, the WIPO global database), the domain and the social accounts. Reserve the domain and accounts right away, then file the trademark in the European Union if nothing blocks it, since the target is European.
- Which country do we invoice from, and how do VAT, contract and euro payment work with European clients?
  - **Recommendation:** invoice from the registered company, in euros, with a standard contract in French and English and a 40 % deposit. Have an accountant validate the VAT treatment and how euros are collected before the first quote.
- Does the client receive the full source code? Under which license, and does the template stay visible?
  - **Recommendation:** yes for the code of their project, delivered in their own repository on final payment, with a perpetual license to use and modify it. The core of the template remains Aldaron's property, which may reuse it for other clients; the contract says so explicitly.
- What warranty length and support level (response time) does the foundation include?
  - **Recommendation:** 30 days of bug fixing (already in the foundation), with a response within 2 working days. A request that changes the intended behavior is not a bug: it is an amendment. After the 30 days, the maintenance plan sets shorter response times for emergencies.
- Who hosts: the client on their account, or Aldaron?
  - **Recommendation:** the accounts (hosting, domain, store accounts) belong to the client, who can thus leave with their product. Aldaron administers them under the monthly maintenance plan, and offers managed hosting as an option for startups without technical skills.
- Is mobile always Expo, and is store publishing included?
  - **Recommendation:** yes, Expo, as in the template: it is the only way to hold a 1,000 € mobile foundation. Initial store publishing is included in that foundation (see [Store publishing](#store-publishing)); the Apple and Google developer account fees stay with the client.
- Is a second floor (for example 15,000 €) needed for projects with mobile?
  - **Recommendation:** no. Mobile is a pricing lever like the others, and a second floor would complicate the offer without protecting the margin, which the daily-rate floor already controls.
- Which first pilot client, and on what terms (reduced rate in exchange for a testimonial)?
  - **Recommendation:** start with an internal project or a close contact to time the foundation, then a first client from your network. Offer a moderate discount (without going below the daily-rate floor) in exchange for a testimonial, a publishable case study and the right to show the product, with a scope limited to the foundation plus at most two additions, all written in the contract.

## Prompt for Claude Design

To paste into Claude Design to produce Aldaron's design system first, before any page. The brackets are to be filled in or left to the tool's proposal.

````text
You are an art director and design-system designer. You are designing the visual
identity and design system of "Aldaron", a development company that delivers web
and mobile products to startups.

## Context
- Target: startup founders and teams (pre-seed to series A), in Europe.
- Brand promise: a complete MVP, with authentication, roles, CMS and back-office,
  delivered fast at a predictable price.
- Tone: reliable, fast, modern, jargon-free; serious without being cold.
- Site languages: French and English.
- References or mood keywords: [to be filled in, otherwise propose them].

## Required stack (the design must be implementable in it without friction)
- Next.js (App Router), Tailwind CSS and shadcn/ui.
- Colors are CSS variables (shadcn format: --background, --foreground, --primary,
  --secondary, --muted, --accent, --destructive, --border, --input, --ring,
  --chart-1 to --chart-5) with a light and a dark value (.dark class), exposed as
  Tailwind utilities. No hard-coded color in components.
- Fonts loaded with next/font.
- Icons: a library consistent with shadcn/ui (Lucide by default); if you propose
  custom ones, give the grid, the stroke width and the rules.

## Step 1 — design system only (do not design any page)
Start by proposing 3 distinct visual directions (one sentence, one palette and one
font pairing each), then wait for my choice. Then produce:

1. Logo: symbol + wordmark, horizontal and stacked versions, light background, dark
   background and monochrome, minimum size, clear space, forbidden uses. Delivered
   as SVG.
2. Favicons and app icons: favicon.svg, favicon.ico, apple-touch-icon (180 px),
   PWA icons 192 and 512 px including a "maskable" version, share image (Open
   Graph, 1200 x 630). List of files and the Next.js code (metadata, manifest) to
   wire them.
3. Colors: brand palette, semantic colors (success, warning, error, info),
   neutrals; every token in light and dark, with WCAG AA contrast checked for each
   text / background pair.
4. Typography: heading and body fonts (freely licensed), size scale, weights, line
   heights, usage rules; next/font snippet ready to paste.
5. Foundations: radii, spacing, shadows, borders, states (hover, visible focus,
   disabled), motion.
6. Base shadcn/ui components dressed with these tokens: Button, Input, Select,
   Checkbox, Switch, Card, Dialog, Dropdown, Table, Form, Badge, Alert, Tabs,
   Toast. Show each state (normal, hover, focus, disabled, error) in light and dark.

## Deliverables
- globals.css with all the variables (light and dark) and the matching Tailwind
  configuration, ready to paste.
- A "design system" page presenting logo, colors, typography, icons and components.
- The logo and icon files, named and sorted by folder.
- A short usage guide (one page): when to use which color, which component.

## Rules
- Accessibility first: AA contrast, visible focus, touch targets of at least 44 px.
- No gradients or decorative effects that do not translate into simple CSS.
- Stay compatible with existing shadcn/ui components: change the tokens, not the
  structure.

## Step 2 — only after my validation
Site pages: home, offer and pricing (the 2,000 € foundation, the 1,000 € minimum package and the options),
projects, about, contact. I will give you the content at that point.
````

## Next steps

1. Pick a pilot project (real or internal) to time the foundation.
2. Extract `1lalana-platform` into a business-free template with a project generator.
3. Write the complexity grid and the exact list of the foundation.
4. Draft the standard contract: scope, milestones, ownership, warranty, amendments.
5. Prepare a presentation page and a standard quote for the first meetings.
6. Validate the name (trademark and domain) before any communication.
