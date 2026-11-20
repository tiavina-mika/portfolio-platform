# Review — Aldaron website prototype

- **Branch**: `feat/aldaron-web-prototype`
- **Type**: New feature
- **Author**: tiavina-mika — `tiavinamika@gmail.com` *(GitHub: `tiavina-mika`)*
- **Created**: 2026-11-21 at 02:32
- **Apps touched**: Website (`apps/aldaron-web`) only — no server, no back-office, no shared lib

## Table of contents

- [In short](#in-short)
- [Database](#database)
- [Server](#server)
- [Back-office](#back-office)
- [Website](#website)
- [See the result locally](#see-the-result-locally)
- [Possible bugs, regressions and holes](#possible-bugs-regressions-and-holes)
- [What is left to do](#what-is-left-to-do)

## In short

The Aldaron website now follows the Aldaron prototype. A visitor can read the fixed-price offer, see the prices per screen, play with a price simulator, browse sample projects, learn who Aldaron is, and ask for a quote — in French, English and Malagasy. Every price is written in euros and can be shown in dollars or Malagasy ariary through a currency selector in the navigation bar. The pages that came from the portfolio website template (project detail pages, search, CV download, home articles) are gone from this site. One commit, 263 files, nearly all inside `apps/aldaron-web`; the rest is the French feature docs, the changeset and one line in the services list.

## Database

No database change. The quote request is stored as an ordinary `Contact`: the extra answers of the form (product, platforms, what the visitor brings, needs, simulator estimate, names of the chosen files) are written as lines of its `message`, cut to the 1,000 characters a `Contact` accepts. No class, field or index was added.

## Server

No server code changed. The site still calls the existing `createPublicContact` Cloud Function (reCAPTCHA checked there) and keeps its own per-visitor rate limit. New external service, listed in `docs/services/README.md`: two free currency-rate APIs (`open.er-api.com`, then the jsDelivr copy of `fawazahmed0/currency-api`), called **from the visitor's browser**, no key, no new environment variable.

## Back-office

No back-office change. The team receives the quote requests in the usual Contacts list, with the answers written in the message (in English, whatever the visitor's language).

## Website

- **Pages touched** (default locale `fr`): home `/fr`, offer and pricing `/fr/offre-et-prix`, price simulator `/fr/simulateur`, projects `/fr/projets`, about `/fr/a-propos`, contact `/fr/contact`, legal notice `/fr/mentions-legales`, privacy `/fr/confidentialite`. English and Malagasy use `/en/pricing`, `/en/simulator`, `/en/projects`, `/en/about`, `/en/contact`, `/en/legal-notice`, `/en/privacy` (and `/mg/…`, same paths).
- **Malagasy** is a new language of the site (`mg`), with all its translation files.
- **Navigation, footer, language, theme and currency**: a currency selector (euro by default; the choice is remembered in the browser; rates cached 12 hours; fixed fallback rates when both rate services are down).
- **Simulator**: an estimate that updates with every answer, a copyable summary, and a "request a quote" button that hands the summary to the contact form.
- **Contact**: a quote request form (name, e-mail, product, platforms, what the visitor brings, needs, optional files, consent). The old phone field is no longer asked.
- **Projects**: ten **sample** projects with filters and pagination; their detail pages no longer exist.
- **Removed from this site**: project detail pages and their sitemap, the home articles block, CV download, site search, the previous footer blocks.
- **Sitemap** now lists the eight static pages with their address in each language.
- Feature docs: [docs/features/aldaron-web/](../../../features/aldaron-web/README.md) (home, pricing, simulator, projects, about, contact, legal notice, privacy, navigation).
- **Fixed during this review**: the privacy page now says the currency choice and the rates are kept in the browser, and that the browser asks two free rate services directly (see the table below); and four ESLint errors (an unnecessary type assertion) in the layouts of about, legal, privacy and projects, which made `aldaron-web:lint:check` fail.

## See the result locally

```bash
pnpm nx run aldaron-web:dev   # the site, http://localhost:9013
pnpm nx run aldaron-web:sb    # Storybook, http://localhost:6017
```

Pages (port 9013):

- [Home](http://localhost:9013/fr) · [Pricing](http://localhost:9013/fr/offre-et-prix) · [Simulator](http://localhost:9013/fr/simulateur) · [Projects](http://localhost:9013/fr/projets)
- [About](http://localhost:9013/fr/a-propos) · [Contact](http://localhost:9013/fr/contact) · [Legal notice](http://localhost:9013/fr/mentions-legales) · [Privacy](http://localhost:9013/fr/confidentialite)
- Malagasy: [home](http://localhost:9013/mg) · [pricing](http://localhost:9013/mg/pricing)

Stories (port 6017) — 31 new story files; the ones that show something new:

- [Currency selector](http://localhost:6017/?path=/story/containers-currency-currencyselect--default) — the euro / dollar / ariary menu
- [Price](http://localhost:6017/?path=/story/containers-currency-price--default) — a price converted
- [Simulator](http://localhost:6017/?path=/story/containers-simulator-simulator--default) · [minimum order](http://localhost:6017/?path=/story/containers-simulator-simulator--minimum-order-of-the-web) · [request a quote](http://localhost:6017/?path=/story/containers-simulator-simulator--request-quote) · [copy summary](http://localhost:6017/?path=/story/containers-simulator-simulator--copy-summary)
- Contact form: [empty](http://localhost:6017/?path=/story/containers-contact-contactformcontent--empty) · [with errors](http://localhost:6017/?path=/story/containers-contact-contactformcontent--with-errors) · [with simulator estimate](http://localhost:6017/?path=/story/containers-contact-contactformcontent--with-simulator-estimate) · [sent](http://localhost:6017/?path=/story/containers-contact-contactformcontent--sent) · [failed](http://localhost:6017/?path=/story/containers-contact-contactformcontent--failed) · [offline](http://localhost:6017/?path=/story/containers-contact-contactformcontent--offline)
- [Legal document](http://localhost:6017/?path=/story/containers-legal-legaldocument--legal-document)
- [Footer](http://localhost:6017/?path=/story/components-footer--footer)

Checks run on this branch: `pnpm check-i18n`, `pnpm nx run aldaron-web:typecheck`, `pnpm nx run aldaron-web:lint:check` (after the four fixes above), `pnpm check-doc-twins --worktree`, `pnpm check-doc-links` and `pnpm lint:docs` all pass. **Not run**: the production build, `test-storybook` (the browser tests of the stories) and a manual pass in a browser. See the last risk below.

## Possible bugs, regressions and holes

| Severity | Type | What can happen | When | Follow-up |
|---|---|---|---|---|
| 🔴 High | Hole | The legal notice and the privacy policy publish placeholders (`[à compléter]`: legal form, tax IDs, head office, publication director, host, retention period, cookies, update date) in the three languages. They are indexed (in the sitemap) and a visitor consents to the privacy text when sending the form | As soon as the site is public | ⛔ blocks the release to production — needs the real company information, [debt #1](debt/261121-feat-debt-aldaron-web-prototype.md#1-legal-and-privacy-pages-still-hold-placeholders) |
| 🔴 High | Hole | The privacy page did not say that every visitor's browser calls two third-party rate services (they see the IP address) and keeps the currency choice and rates in its storage | Every first visit (the rates are fetched on load, even if the visitor never picks another currency) | ✅ fixed on the branch: two lines added to the "Storage in your browser" section in `fr`/`en`/`mg`, and the privacy feature doc updated |
| 🟡 Low | Bug | The contact form lets the visitor pick up to ten files, but they are never sent: only their names reach the team, and nothing on screen tells the visitor. The privacy text also lists "attachments" among the data received | Any visitor who attaches a file and trusts it arrived | ⏳ deferred — product decision, [debt #2](debt/261121-feat-debt-aldaron-web-prototype.md#2-attachments-are-offered-but-never-sent) |
| 🟡 Low | Regression | The build of `aldaron-web` is left out of the CI on purpose (it reads live content, which no runner can reach) and so are its story tests: only the typecheck covers it, and this branch rewrote most of the site. The commit itself mentions a production prerender failure that had to be fixed by hand, and the typecheck cannot catch that kind | Any later change breaking the production prerender is found only at deploy time | ⏳ deferred — [debt #3](debt/261121-feat-debt-aldaron-web-prototype.md#3-the-aldaron-web-build-and-tests-are-not-run-by-the-ci) |
| 🟡 Low | Bug | If both rate services are down, the prices are converted with fixed rates (`USD 1.08`, `MGA 4900`) and nothing says so; the stored rates are also read back without checking their shape | A visitor in dollars or ariary while the services are unreachable | ⏳ deferred — [debt #4](debt/261121-feat-debt-aldaron-web-prototype.md#4-silent-fallback-rates-and-unchecked-stored-rates) |
| 🟡 Low | Bug | The ten "delivered projects" (names, prices, delays) are sample data shown as real work, with a placeholder instead of screenshots | Any visitor reading the projects page or the home block | ⏳ deferred — content, [debt #5](debt/261121-feat-debt-aldaron-web-prototype.md#5-sample-projects-are-presented-as-delivered-work) |

Not a risk but worth knowing: the old project detail URLs and the project sitemap no longer exist, so any link to them now gives a 404. The site is not in the CI build, so it is probably not public yet; if it is, add redirects.

Debt file: [261121-feat-debt-aldaron-web-prototype.md](debt/261121-feat-debt-aldaron-web-prototype.md).

## What is left to do

- Fill in the legal and privacy texts (debt #1) before any production deploy.
- Decide what happens to the attachments (debt #2).
- Find a way to check the production prerender of `aldaron-web` outside the deploy (debt #3).
- Run the story tests and a manual pass in a browser: neither was done for this review.
- Real projects and screenshots instead of the sample ones (debt #5).
