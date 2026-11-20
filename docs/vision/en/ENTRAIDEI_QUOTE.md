# Feasibility estimate — Entraid'ei

## Table of Contents

- [Summary](#summary)
- [Mobile screens](#mobile-screens)
- [Integrations and back-office](#integrations-and-back-office)
- [Exclusions](#exclusions)
- [Points to settle before sending the quote](#points-to-settle-before-sending-the-quote)

> Internal estimate, never shown to the client: it gives the number of days of the scoping described in [the Aldaron vision](ALDARON_VISION.md). The client sees only a price (about 5,000 €), computed from the announced number of days (44 days at the internal value of 114 €); this document does not price screens, it measures time. Screens are counted from the Entraid'ei project's screen list and functional specification; the detail of each screen and the list of points to clarify were not reread. The days are the value of the previous screen grid divided by 114 €; they include review and testing. To validate with real timing.

## Summary

Mobile app (Expo) plus moderation web back-office.

| Item | Days |
|---|---|
| Mobile foundation (Expo, Supabase, authentication, navigation, internationalization, light and dark theme, push, going live, store publishing) | 2.4 |
| Mobile screens (about 125, see below) | 21.8 |
| Third-party integrations | 8.5 |
| Moderation back-office (13 screens) | 6.4 |
| **Total** | **39.1** |

| Days announced | Calculation | Price | Share used by the estimate (39.1 days) |
|---|---|---|---|
| 44 | 39.1 ÷ 0.9, rounded up to the next day | 44 × 114 € = 5,016 €, quoted 5,000 € (above the 2,500 € minimum) | 89 % |

Payment: in three installments tied to progress, 40 % at signature, 30 % at the first lot, 30 % at going live (see [all the mobile app for 5,000 €](ENTRAIDEI_FULL_5000.md)).

## Mobile screens

A screen counts as one, whatever the number of its states. The screen-by-screen detail of the welcome, sign-up, sponsorship, photo and messages modules is in [the lot](ENTRAIDEI_LOT_5000.md); the other modules are estimated with the same benchmarks. The ×1.5 business complexity is applied to sponsorship, ads and contact requests.

| Module | Screens | Days |
|---|---|---|
| Welcome and login | 7 | 1.1 |
| Passport sign-up | 6 | 0.9 |
| Form sign-up | 10 | 1.6 |
| Sponsorship (×1.5) | 10 | 2.4 |
| Photo, scarf, member card | 5 | 0.7 |
| Explore and filters | 11 | 1.9 |
| Publishing and managing ads (×1.5) | 8 | 2.1 |
| Messages and requests (requests ×1.5) | 9 | 1.8 |
| Notifications | 1 | 0.2 |
| Profile, badges, CV | 15 | 2.6 |
| Settings and help | 11 | 1.5 |
| Legal pages | 6 | 0.9 |
| Directory, favorites, filters | 21 | 3.4 |
| States and moderation | 5 | 0.7 |
| **Total** | **125** | **21.8** |

## Integrations and back-office

| Item | Days | Comment |
|---|---|---|
| Passport scan and verification | 1.8 | A single implementation (sign-up). Assumes authenticity can be checked; it is not known whether the EEIF has a member database or an API: this is the integration to try for 2 days before committing |
| Real-time messaging (Stream) | 4.4 | |
| Google and Apple sign-in | 1.8 | |
| City geocoding and radius search | 0.5 | Address autocomplete, one implementation |
| **Total integrations** | **8.5** | |
| Moderation back-office: 13 screens | 6.4 | 7 complex screens (reports, sanctions, member record, sponsorship help, lost access, GDPR export) and 6 simple screens (reference lists, FAQ, legal versions, minimum version) |

## Exclusions

- **Languages**: French and English only.
- **Mockups**: no time, the mockup already exists.
- **Payment**: Entraid'ei has none. If there were one, it would be about 4 to 5 more days.
- **Recurring costs** (hosting, services): paid by the client. The project estimate gives about $85/month at launch; above 1,000 active users, messaging brings this to about $500/month.
- **Maintenance after the 30 days**: monthly fee of 150 to 400 €.

## Points to settle before sending the quote

1. **One price, not a screen-by-screen quote.** Entraid'ei is a standalone mobile app, with no website or complex back-office. It relies on its own technical base (Expo, Supabase), and the client sees one price, computed from the 44 internal days: about 5,000 €.
2. **The project fits in the 44 announced days, with little margin.** About 39 days of work are needed for 44 announced, so about 5 days of margin; the detail is in [all the mobile app for 5,000 €](ENTRAIDEI_FULL_5000.md#calculation-basis).
3. **Part of it may already be done.** The project tracking shows the Expo app, the design system, internationalization and the language-choice screen already in place. If they are already paid for, remove the mobile foundation (2.4 days): the project drops to about 36.7 days and the margin grows.
4. **The passport scan is the biggest risk.** Without a member database to query, it no longer holds: a short time-boxed trial (internally 2 days), then the client decides to continue, with the price adjusted if needed, or drop it (sponsorship then remains the only sign-up path).
5. **Store accounts**: Apple offers a possible exemption for a non-profit (99 $/year otherwise); Google costs 25 $ once.

Internal value check: 5,000 € for about 44 days is about 114 € per day, exactly the reference value, since that value comes from this calculation. This check therefore does not say the price is profitable, only that it is consistent with the vision. Rough calculation, to confirm with real timing.
