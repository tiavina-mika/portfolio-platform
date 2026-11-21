# Debt — Aldaron website prototype

> Review: [261121-feat-aldaron-web-prototype.md](../261121-feat-aldaron-web-prototype.md)
> Branch: `feat/aldaron-web-prototype` · Created 2026-11-21 at 02:32 · Author: `tiavinamika@gmail.com`
> Overall status: ⏳ to do

## Table of contents

- [Summary](#summary)
- [1. Legal and privacy pages still hold placeholders](#1-legal-and-privacy-pages-still-hold-placeholders)
- [2. Sample projects are presented as delivered work](#2-sample-projects-are-presented-as-delivered-work)

## Summary

| # | Severity | Type | Risk | Status |
|---|---|---|---|---|
| 1 | 🔴 High | Hole | Legal notice and privacy policy published with `[à compléter]` placeholders — ⛔ blocks the release to production | ⏳ to do |
| 2 | 🟡 Low | Bug | Sample projects shown as delivered work | ⏳ product decision |

## 1. Legal and privacy pages still hold placeholders

- **Severity**: 🔴 High · **Type**: Hole · **Status**: ⏳ to do — ⛔ blocks the release to production (not the merge into `develop`)
- **Concerned**: `apps/aldaron-web/translations/{fr,en,mg}/legal.json`, `apps/aldaron-web/translations/{fr,en,mg}/privacy.json`, `docs/features/aldaron-web/legal/fr/`

**What can happen** — the site goes live. `/fr/mentions-legales` shows "Forme juridique et capital : [à compléter]", "NIF/STAT : [à compléter]", "Siège social", "Directeur de la publication", "Hébergeur" and a "Dernière mise à jour : [à compléter]". `/fr/confidentialite` shows no retention period, no recipients and no cookies section, while the contact form asks the visitor to consent to that very text. Both pages are in the sitemap, so they are indexed in this state.

**Why** — the texts were written as a skeleton: the facts only the company owner knows were left as placeholders. Not a code defect, but the code publishes them as they are. The cookies section is a real obligation, not filler: the site loads Google Analytics 4 and a consent banner when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set, so the text must name that tool and the `cookie_consent` cookie.

**How to check** — open both pages in each language and search for `[`.

**How to fix**

1. **(recommended)** Fill the texts with the real company information, then add a guard so it cannot happen again: a test (or a `check-i18n`-style script) that fails when a `translations/**/legal.json` or `privacy.json` value contains `[à compléter]`, `[to be completed]` or `[ampidirina]`.
   *Why*: the legal content is required for a public French/Malagasy business site and only the owner can supply it; the guard costs a few lines and stops a placeholder reaching production again.
2. Fill the texts by hand with no guard — faster, but the next new language or edit can reintroduce a placeholder unnoticed.
3. Mark both pages `noindex` and hide the footer links until filled — hides the problem without solving it, and the contact form still links to the privacy text.

## 2. Sample projects are presented as delivered work

- **Severity**: 🟡 Low · **Type**: Bug · **Status**: ⏳ product decision
- **Concerned**: `apps/aldaron-web/utils/project.constants.ts`, `utils/home.constants.ts`, `translations/*/projects.json`, `translations/*/home.json`, `docs/features/aldaron-web/projects/fr/PROJECTS.FR.md`

**What can happen** — the projects page and the home block show ten products ("Tsara Livraison", "Fanilo Santé"…) with delays and prices as delivered work, with a striped placeholder instead of a screenshot. A prospect or a consumer-protection check reads them as references that do not exist.

**Why** — the prototype is a design: the data is a placeholder kept in the code. The feature doc says "sample data"; the page does not.

**How to check** — open `/fr/projets`.

**How to fix**

1. **(recommended)** Before the site is public, replace the sample data with the real delivered projects (or remove the projects page and the home block until there are some), and keep one line on the page if some stay as illustrative examples: "Illustrative examples".
   *Why*: a reference list is a commercial claim; showing invented clients is the one thing that harms trust and can be a legal problem, and the real data costs only content.
2. Keep the samples and label them "Examples" on the page and the home block — honest and quick, but weak as a sales page.
3. Read the projects from the back-office (the `Project` collection the portfolio already has) — the long-term answer, but it needs a mapping between the two shapes and a decision on which projects are shown on this site.
