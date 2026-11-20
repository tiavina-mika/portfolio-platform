# Estimated quote — Entraid'ei

## Table of Contents

- [Summary](#summary)
- [Mobile screens](#mobile-screens)
- [Integrations and back-office](#integrations-and-back-office)
- [Options and exclusions](#options-and-exclusions)
- [Points to settle before sending the quote](#points-to-settle-before-sending-the-quote)

> Estimate priced with the grid of [the Aldaron vision](ALDARON_VISION.md). Screens are counted from the Entraid'ei project's screen list and functional specification; the detail of each screen and the list of points to clarify were not reread. The amounts are hypotheses to validate.

## Summary

Mobile app (Expo) plus a web moderation back-office.

| Item | Amount |
|---|---|
| Mobile foundation (Expo, Supabase, authentication, navigation, internationalization, light and dark theme, push, going live, store publishing) | 270 € |
| Mobile screens (about 125, see below) | 2,483 € |
| Third-party integrations | 970 € |
| Moderation back-office (13 screens) | 278 € |
| **Total** | **4,001 €** |

Proposed invoicing: 1,600 € at signature, 1,200 € at pre-production, 1,201 € at go-live.

## Mobile screens

Each screen is billed 16 € as a base, plus the grid extras (camera, service, map, filters or workflow). The screen-by-screen detail of the welcome, sign-up, sponsorship, photo and messages modules is in [the lot](ENTRAIDEI_LOT_5000.md); the other modules are priced with the same grid. A screen counts once, whatever the number of its states. The ×1.5 business complexity multiplier is applied to sponsorship, ads and contact requests.

| Module | Screens | Amount |
|---|---|---|
| Welcome and login | 7 | 127 € |
| Sign-up with passport | 6 | 104 € |
| Sign-up with form | 10 | 181 € |
| Sponsorship (×1.5) | 10 | 272 € |
| Photo, scarf, member card | 5 | 83 € |
| Explore and filters | 11 | 221 € |
| Ad publishing and management (×1.5) | 8 | 240 € |
| Messages and requests (requests ×1.5) | 9 | 204 € |
| Notifications | 1 | 21 € |
| Profile, badges, CV | 15 | 291 € |
| Settings and help | 11 | 171 € |
| Legal pages | 6 | 101 € |
| Directory, favorites, filters | 21 | 387 € |
| States and moderation | 5 | 80 € |
| **Total** | **125** | **2,483 €** |

## Integrations and back-office

| Item | Amount | Note |
|---|---|---|
| Passport scan and verification | 200 € | A single implementation (sign-up). Assumes authenticity can be checked; it is not known whether the EEIF has a member database or an API |
| Real-time messaging (Stream) | 500 € | |
| Google and Apple sign-in | 210 € | 90 € + 120 € |
| City geocoding and radius search | 60 € | Address autocomplete, one implementation |
| **Total integrations** | **970 €** | |
| Moderation back-office: 13 screens | 278 € | 7 at 26 € (reports, sanctions, member sheet, sponsorship help, lost access, GDPR export) and 6 at 16 € (reference lists, FAQ, legal versions, minimum version) |

The back-office needs 13 specific screens: reports, sanctions, sponsorship help requests, lost access, reference lists, FAQ, legal versions, minimum version, GDPR export.

## Options and exclusions

- **Hebrew**: +15 % of the cost of the translated screens (right-to-left, non-Latin script), about 370 €.
- **Audio calls**: out of scope in the project documents. For reference, about 630 € (about 6 screens at 133 € and a 500 € integration, at the real-time messaging price).
- **Mockups**: 0 €, the mockup already exists.
- **Payment**: Entraid'ei has none. If it had one, it would be 500 € more for the first payment, then 80 € per additional payment.
- **Recurring costs** (hosting, services): paid by the client. The project estimate gives about 85 $/month at launch; above 1,000 active users, messaging raises it to about 500 $/month.
- **Maintenance after the 30 days**: monthly plan of 150 to 400 €.

## Points to settle before sending the quote

1. **Neither the full foundation nor the minimum package.** Entraid'ei is a mobile app alone, with no website and no complex back-office. It runs on its own technical base (Expo, Supabase), and the mobile foundation covers authentication and going live. The moderation back-office is priced screen by screen.
2. **Part of it may already be done.** The project tracking shows the Expo app, the design system, internationalization and the language-choice screen already in place. If they are already paid for, remove the mobile foundation (270 €) and the language screen (16 €).
3. **The passport scan is the biggest risk.** Without a member database to query, the 200 € price no longer holds.
4. **Store accounts**: Apple offers a possible exemption for a non-profit (99 $/year otherwise); Google costs 25 $ once.

Daily-rate check: at about 3 months of work (66 working days), 4,001 € is about 61 € per day, below the reference rate of 114 € per day. This quote alone therefore does not cover the real work: with audio calls and Hebrew, the value rises to 5,006 € and the 5,000 € flat fee (see [all the mobile app for 5,000 €](ENTRAIDEI_FULL_5000.md)) is the chosen reference. This is a rough calculation, to confirm with a real time measurement.
