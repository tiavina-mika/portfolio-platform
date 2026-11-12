# Entraid'ei — everything for 5,000 € (design provided)

## Table of Contents

- [Calculation basis](#calculation-basis)
- [Price breakdown](#price-breakdown)
- [Content](#content)
- [Assumptions and risks](#assumptions-and-risks)

> The whole Entraid'ei project for 5,000 € over 3 months, design provided: the mockup's 210 screens (calls included), Hebrew, real-time messaging, passport scan, Google and Apple, and the moderation back-office. Same grid as [the Aldaron vision](ALDARON_VISION.md); the screen-by-screen detail is in the [full quote](ENTRAIDEI_QUOTE.md). The amounts are hypotheses to validate.

## Calculation basis

The scope is fixed (everything) and the price is a flat fee. The grid therefore does not give the price: it gives the **value** of the scope, and the flat fee is a discount on that value.

| Step | Calculation | Result |
|---|---|---|
| Mobile foundation | | 1,000 € |
| Mobile screens (about 125) | | 9,320 € |
| Integrations: passport 1,200 €, Google and Apple 800 €, geocoding 400 €, real-time messaging (Stream) 1,200 € | | 3,600 € |
| Audio calls (about 6 screens and a 1,200 € integration) | | 1,700 € |
| Hebrew (15 % of the cost of the translated screens) | 15 % of 9,320 € | 1,400 € |
| Moderation back-office (13 screens) | | 730 € |
| **Value of the scope at grid prices** | | **17,750 €** |
| Flat fee | | 5,000 € |
| Discount | 17,750 − 5,000 | 12,750 € (72 %) |
| Share of the fee per grid euro | 5,000 / 17,750 | 0.282 |

At zero in this fee: the web foundation (public site, CMS), the minimum package and mockups. A mobile app alone starts from the Entraid'ei technical base (Expo, Supabase): the mobile foundation already covers authentication and going live. The design is provided and must follow the existing design system, otherwise the complexity multiplier applies.

Floor check: the quote floor is the number of working days × 114 €, with a minimum of 1,000 €. On the time basis below (about 44 days), it is 5,016 €: the 5,000 € flat fee sits right at that level, which is logical since the 114 € rate comes from this calculation. There is therefore no safety margin on the price.

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
| Mobile foundation | 1,000 € | 282 € |
| Welcome and login (7 screens) | 480 € | 135 € |
| Sign-up with passport (6 screens) | 390 € | 110 € |
| Sign-up with form (10 screens) | 680 € | 192 € |
| Sponsorship (10 screens, ×1.5) | 1,020 € | 287 € |
| Photo, scarf, member card (5 screens) | 310 € | 87 € |
| Explore and filters (11 screens) | 830 € | 234 € |
| Ads (8 screens, ×1.5) | 900 € | 254 € |
| Messages and requests (9 screens) | 770 € | 217 € |
| Notifications (1 screen) | 80 € | 23 € |
| Profile, badges, CV (15 screens) | 1,090 € | 307 € |
| Settings and help (11 screens) | 640 € | 180 € |
| Legal pages (6 screens) | 380 € | 107 € |
| Directory, favorites, filters (21 screens) | 1,450 € | 408 € |
| States and moderation (5 screens) | 300 € | 84 € |
| Passport scan and verification | 1,200 € | 338 € |
| Google and Apple sign-in | 800 € | 225 € |
| City geocoding and radius search | 400 € | 113 € |
| Real-time messaging (Stream) | 1,200 € | 338 € |
| Audio calls | 1,700 € | 479 € |
| Hebrew | 1,400 € | 394 € |
| Moderation back-office (13 screens) | 730 € | 206 € |
| **Total** | **17,750 €** | **5,000 €** |

Proposed invoicing: 40 % at signature (2,000 €), 30 % at pre-production (1,500 €), 30 % at go-live (1,500 €).

## Content

The mockup's 210 screens, without exception: the 203 app screens and the 7 call screens, in French, English and Hebrew. States, variants and dialogs are included in the price of the view (one price per distinct view, so about 131 billed views).

The web back-office covers the 13 moderation screens: reports (list and sheet), sanctions, member sheet, sponsorship help requests, lost access, reference lists (local groups, sectors and categories, languages), FAQ, legal versions, minimum app version, GDPR export.

Entraid'ei has no payment. If it had one, it would be 60 € more per payment integration, outside the flat fee.

## Assumptions and risks

1. **The 10 screens per day figure measures output, not delivery.** It does not say how long review, fidelity to the mockup, testing on real devices and fixes take. Validate it by timing the first 10 screens, from the first prompt to a screen that is reviewed and tested, before signing.
2. **The fee only works thanks to Claude.** At the grid's pace (a screen is worth about half a day at 90 € per day), the whole scope would be about 197 days of work by hand. If the tool becomes unavailable or changes its pricing, the price is no longer sustainable.
3. **The cost of Claude** (subscription, tokens) must be deducted from the fee: it reduces the real gain.
4. **A 72 % discount is not a "moderate" discount.** The vision allows a moderate discount in exchange for a testimonial. Write it in the contract as a pilot discount: value 17,750 €, fee 5,000 €, with the counterpart (testimonial, case study, right to show the product).
5. **Every overrun is on you.** One redone screen, a design change or a late store review eats the margin. Freeze the scope in writing, with the list of screens and the counting rule.
6. **The passport scan depends on the EEIF.** Without a member database to query, its price no longer makes sense.
7. **High recurring costs for the client.** Third-party messaging goes from about 0 to about 400 $ per month above 1,000 active users, and audio calls add a per-minute cost. The client must know this before signing.
8. **Hebrew**: right-to-left affects every layout, and the texts must be supplied or reviewed by the client.
9. **Stores.** Review times (Apple 1 to 3 days, sometimes more) and opening an Apple organization account (D-U-N-S number, several weeks) must be started at signature.
