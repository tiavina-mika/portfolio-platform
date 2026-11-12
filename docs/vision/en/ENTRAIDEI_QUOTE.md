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
| Mobile foundation (Expo, Supabase, authentication, navigation, internationalization, light and dark theme, push, going live, store publishing) | 1,000 € |
| Mobile screens (about 125, see below) | 9,320 € |
| Third-party integrations | 3,600 € |
| Moderation back-office (13 screens) | 730 € |
| **Total** | **14,650 €** |

Proposed invoicing: 5,860 € at signature, 4,395 € at pre-production, 4,395 € at go-live.

## Mobile screens

Each screen is billed 60 € as a base, plus the grid extras (camera, service, map, filters or workflow). A screen counts once, whatever the number of its states. The ×1.5 business complexity multiplier is applied to sponsorship, ads and contact requests.

| Module | Screens | Amount |
|---|---|---|
| Welcome and login | 7 | 480 € |
| Sign-up with passport | 6 | 390 € |
| Sign-up with form | 10 | 680 € |
| Sponsorship (×1.5) | 10 | 1,020 € |
| Photo, scarf, member card | 5 | 310 € |
| Explore and filters | 11 | 830 € |
| Ad publishing and management (×1.5) | 8 | 900 € |
| Messages and requests (requests ×1.5) | 9 | 770 € |
| Notifications | 1 | 80 € |
| Profile, badges, CV | 15 | 1,090 € |
| Settings and help | 11 | 640 € |
| Legal pages | 6 | 380 € |
| Directory, favorites, filters | 21 | 1,450 € |
| States and moderation | 5 | 300 € |
| **Total** | **125** | **9,320 €** |

## Integrations and back-office

| Item | Amount | Note |
|---|---|---|
| Passport scan and verification | 1,200 € | Assumes authenticity can be checked; it is not known whether the EEIF has a member database or an API |
| Real-time messaging (Stream) | 1,200 € | |
| Google and Apple sign-in | 800 € | 2 × 400 € |
| City geocoding and radius search | 400 € | |
| **Total integrations** | **3,600 €** | |
| Moderation back-office: 13 screens | 730 € | 7 at 70 € (reports, sanctions, member sheet, sponsorship help, lost access, GDPR export) and 6 at 40 € (reference lists, FAQ, legal versions, minimum version) |

The back-office needs 13 specific screens: reports, sanctions, sponsorship help requests, lost access, reference lists, FAQ, legal versions, minimum version, GDPR export.

## Options and exclusions

- **Hebrew**: +15 % of the cost of the translated screens (right-to-left, non-Latin script), about 1,400 €.
- **Audio calls**: out of scope in the project documents. For reference, about 1,700 € (about 6 screens and a 1,200 € integration).
- **Mockups**: 0 €, the mockup already exists.
- **Payment**: Entraid'ei has none. If it had one, it would be 60 € more per payment integration.
- **Recurring costs** (hosting, services): paid by the client. The project estimate gives about 85 $/month at launch; above 1,000 active users, messaging raises it to about 500 $/month.
- **Maintenance after the 30 days**: monthly plan of 150 to 400 €.

## Points to settle before sending the quote

1. **Neither the full foundation nor the minimum package.** Entraid'ei is a mobile app alone, with no website and no complex back-office. It runs on its own technical base (Expo, Supabase), and the mobile foundation covers authentication and going live. The moderation back-office is priced screen by screen.
2. **Part of it may already be done.** The project tracking shows the Expo app, the design system, internationalization and the language-choice screen already in place. If they are already paid for, remove the mobile foundation (1,000 €) and the language screen (60 €).
3. **The passport scan is the biggest risk.** Without a member database to query, the 1,200 € price no longer holds.
4. **Store accounts**: Apple offers a possible exemption for a non-profit (99 $/year otherwise); Google costs 25 $ once.

Daily-rate check: at about 3 months of work (66 working days), 14,650 € is about 222 € per day, above the reference rate of 114 € per day. This is a rough calculation, to confirm with a real time measurement.
