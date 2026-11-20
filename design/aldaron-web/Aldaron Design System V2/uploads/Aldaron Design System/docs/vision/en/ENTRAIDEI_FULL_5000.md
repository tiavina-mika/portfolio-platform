# Entraid'ei — everything for 5,000 € (design provided)

## Table of Contents

- [Calculation basis](#calculation-basis)
- [Price breakdown](#price-breakdown)
- [Content](#content)
- [Assumptions and risks](#assumptions-and-risks)

> The whole Entraid'ei project for 5,000 € over 3 months, design provided: the mockup's 210 screens (calls included), Hebrew, real-time messaging, passport scan, Google and Apple, and the moderation back-office. Same grid as [the Aldaron vision](ALDARON_VISION.md); the screen-by-screen detail is in the [full quote](ENTRAIDEI_QUOTE.md). The amounts are hypotheses to validate.

## Calculation basis

The scope is fixed (everything) and the price is a flat fee: Entraid'ei was delivered for 5,000 €, and the mobile grid of [the Aldaron vision](ALDARON_VISION.md) is calibrated on this project. The grid gives the **value** of the scope (5,006 €), and the 5,000 € flat fee is the grid price (a 6 € discount, about 0 %).

| Step | Calculation | Result |
|---|---|---|
| Mobile foundation | | 270 € |
| Mobile screens (about 125) | | 2,483 € |
| Integrations: passport 200 €, Google 90 € and Apple 120 €, geocoding 60 €, real-time messaging (Stream) 500 € | | 970 € |
| Audio calls (about 6 screens at 133 € and a 500 € integration) | | 633 € |
| Hebrew (15 % of the cost of the translated screens) | 15 % of 2,483 € | 372 € |
| Moderation back-office (13 screens) | | 278 € |
| **Value of the scope at grid prices** | | **5,006 €** |
| Flat fee | | 5,000 € |
| Discount | 5,006 − 5,000 | 6 € (≈ 0 %) |
| Share of the fee per grid euro | 5,000 / 5,006 | 0.9988 |

At zero in this fee: the web foundation (public site, CMS), the minimum package and mockups. A mobile app alone starts from the Entraid'ei technical base (Expo, Supabase): the mobile foundation already covers authentication and going live. The design is provided and must follow the existing design system, otherwise the complexity multiplier applies.

Three clarifications on reading the grid:

- **Login and sign-up.** The mobile foundation covers the authentication logic (accounts, sessions, going live). The "Welcome and login" and sign-up screens are billed separately because they follow the mockup's layout: this is not double counting.
- **Hebrew basis.** The 15 % applies to the mobile screens only (2,483 €). The call screens (about 133 €) and the back-office, which is not translated, are outside this basis; the gap of about 20 € on the call screens is absorbed in the flat fee.
- **Integrations at first implementation.** Each service is counted once, setup included: passport 200 €, Google 90 € and Apple 120 €, address autocomplete 60 € (for city geocoding), real-time messaging 500 €. Audio calls are priced at the real-time messaging price (500 €), since the grid has no dedicated line for them.

Floor check: the quote floor is the number of working days × 114 €, with a minimum of 1,000 €. On the time basis below (about 44 days), it is 5,016 €: the 5,000 € flat fee sits right at that level, which is logical since the 114 € rate comes from this calculation. There is therefore no safety margin on the price. This 114 € per day rate is the actual working rate with Claude; it is not comparable to the 90 € per day of risk 2, which values the same scope done by hand.

**Time basis.** Development is done with Claude, at about 10 screens per day (figure supplied, to be measured).

| Item | Calculation | Days |
|---|---|---|
| Mobile screens, calls included (about 131) and back-office (13) | 144 / 10 | 14.5 |
| Mobile foundation and integrations (passport, Google and Apple, geocoding, real-time messaging, calls) | assumption | 14 |
| Hebrew (right-to-left) | assumption | 3 |
| Review, fixes, testing on devices | assumption, about 30 % of the rest | 10 |
| Stores (submission, resubmission) | assumption | 2 |
| **Total** | | **about 44** |

Over 44 days of actual work, 5,000 € is about **114 € per day**, and 22 days of margin remain out of the 66 of the deadline. The lines marked "assumption" do not come from a measurement: see [Assumptions and risks](#assumptions-and-risks).

## Price breakdown

The fee is split in proportion to the grid value. Useful for invoicing milestones.

| Item | Grid value | Share of the fee |
|---|---|---|
| Mobile foundation | 270 € | 270 € |
| Welcome and login (7 screens) | 127 € | 127 € |
| Sign-up with passport (6 screens) | 104 € | 104 € |
| Sign-up with form (10 screens) | 181 € | 181 € |
| Sponsorship (10 screens, ×1.5) | 272 € | 272 € |
| Photo, scarf, member card (5 screens) | 83 € | 83 € |
| Explore and filters (11 screens) | 221 € | 221 € |
| Ads (8 screens, ×1.5) | 240 € | 240 € |
| Messages and requests (9 screens) | 204 € | 204 € |
| Notifications (1 screen) | 21 € | 21 € |
| Profile, badges, CV (15 screens) | 291 € | 290 € |
| Settings and help (11 screens) | 171 € | 171 € |
| Legal pages (6 screens) | 101 € | 101 € |
| Directory, favorites, filters (21 screens) | 387 € | 386 € |
| States and moderation (5 screens) | 80 € | 80 € |
| Passport scan and verification | 200 € | 200 € |
| Google and Apple sign-in | 210 € | 210 € |
| City geocoding and radius search | 60 € | 60 € |
| Real-time messaging (Stream) | 500 € | 499 € |
| Audio calls | 633 € | 632 € |
| Hebrew | 372 € | 371 € |
| Moderation back-office (13 screens) | 278 € | 277 € |
| **Total** | **5,006 €** | **5,000 €** |

Proposed invoicing: 40 % at signature (2,000 €), 30 % at pre-production (1,500 €), 30 % at go-live (1,500 €).

## Content

The mockup's 210 screens, without exception: the 203 app screens and the 7 call screens, in French, English and Hebrew. States, variants and dialogs are included in the price of the view (one price per distinct view, so about 131 billed views).

The web back-office covers the 13 moderation screens: reports (list and sheet), sanctions, member sheet, sponsorship help requests, lost access, reference lists (local groups, sectors and categories, languages), FAQ, legal versions, minimum app version, GDPR export.

Entraid'ei has no payment. If it had one, it would be 500 € more for the first payment, then 80 € per additional payment, outside the flat fee.

## Assumptions and risks

1. **The 10 screens per day figure measures output, not delivery.** It does not say how long review, fidelity to the mockup, testing on real devices and fixes take. Validate it by timing the first 10 screens, from the first prompt to a screen that is reviewed and tested, before signing.
2. **The fee only works thanks to Claude.** The grid (16 € screen) assumes the pace of 10 screens per day with the tool. By hand, a screen is worth about half a day at 90 € per day: the whole scope would be about 160 days of work. If the tool becomes unavailable or changes its pricing, the price is no longer sustainable.
3. **The cost of Claude** (subscription, tokens) must be deducted from the fee: it reduces the real gain.
4. **The discount is negligible (about 0 %).** The value at grid prices is 5,006 € and the fee 5,000 €: the flat fee is the price of the grid, with no commercial discount to write in the contract.
5. **Every overrun is on you.** One redone screen, a design change or a late store review eats the margin. Freeze the scope in writing, with the list of screens and the counting rule.
6. **The passport scan depends on the EEIF.** Without a member database to query, its price no longer makes sense.
7. **High recurring costs for the client.** Third-party messaging goes from about 0 to about 400 $ per month above 1,000 active users, and audio calls add a per-minute cost. The client must know this before signing.
8. **Hebrew**: right-to-left affects every layout, and the texts must be supplied or reviewed by the client.
9. **Stores.** Review times (Apple 1 to 3 days, sometimes more) and opening an Apple organization account (D-U-N-S number, several weeks) must be started at signature.
