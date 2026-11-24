# Debt — Serve the back-office on an Aldaron domain

> Review: [261124-feat-serve-back-office-on-aldaron-domain.md](../261124-feat-serve-back-office-on-aldaron-domain.md)
> Branch: `feat/serve-back-office-on-aldaron-domain` · Created 2026-11-24 at 08:32 · Author: `tiavinamika@gmail.com`
> Overall status: ⏳ to do

## Table of contents

- [Summary](#summary)
- [1. Mixed roles get the portfolio link](#1-mixed-roles-get-the-portfolio-link)

## Summary

| # | Severity | Type | Risk | Status |
|---|---|---|---|---|
| 1 | 🟡 Low | Bug | Roles opening both workspaces get the portfolio link | ⏳ to do |

## 1. Mixed roles get the portfolio link

- **Severity**: 🟡 Low · **Type**: Bug · **Status**: ⏳ to do
- **Concerned**: `apps/server/src/cloud/services/_core/userRole.service.cloud.ts` (`getLandingWorkspace`)

**What can happen** — A person invited with roles that open both workspaces, or with a role inheriting one, is sent to the portfolio address.

**Why** — The rule picks the Aldaron address only when no role opens the portfolio, and reads the granted roles without their parents.

**How to check** — Invite with one portfolio role and one Aldaron role; the link is the portfolio's.

**How to fix**

1. **(recommended)** Leave it and decide the product rule (who should land where) before changing it.
   *Why*: the account still gets exactly the workspaces its roles open; only the first address differs, and no rule exists yet.
2. Prefer the Aldaron address whenever Aldaron is opened — would send portfolio staff holding one Aldaron role to the wrong domain.
