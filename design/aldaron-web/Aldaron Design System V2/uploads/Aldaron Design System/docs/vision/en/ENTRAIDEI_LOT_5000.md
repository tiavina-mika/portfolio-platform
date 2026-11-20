# Entraid'ei — first lot (mobile only, design provided)

## Table of Contents

- [Calculation basis](#calculation-basis)
- [Lot content](#lot-content)
- [Screen detail](#screen-detail)
- [Counting rule and mockup match](#counting-rule-and-mockup-match)
- [Assumptions and risks](#assumptions-and-risks)

> First step of the [full quote](ENTRAIDEI_QUOTE.md): 52 screens, mobile app only, priced screen by screen. Same grid as [the Aldaron vision](ALDARON_VISION.md). For the whole scope at 5,000 €, see [all the mobile app for 5,000 €](ENTRAIDEI_FULL_5000.md). Screens are counted from the project's screen list; the amounts are hypotheses to validate.

## Calculation basis

The lot is priced screen by screen with the grid, then compared with the floor. The full project fits in 5,000 €: this lot is its first step, not a reduced version cut to fit a budget.

| Step | Calculation | Result |
|---|---|---|
| Mobile foundation (Expo, authentication, navigation, push, store publishing) | | 270 € |
| Screens kept | 52 screens, 16 € base grid with extras, ×1.5 on sponsorship and contact requests | 1,058 € |
| **Lot price** | 270 + 1,058 | **1,328 €** |
| Share of the full flat fee | 1,328 / 5,006 | 27 % of the scope's value |

What is at 0 € in this lot:
- **The web foundation** (public site, CMS, back-office): no web part, moderation is done by hand in the database dashboard.
- **Mockups**: the design is provided by the client (the mockup already exists). It must rely on the existing design system: a mockup that ignores it forces new components to be built, and the complexity multiplier then applies.
- **Third-party integrations**: none in this lot.

Floor check: the quote floor is the number of working days × 114 €. With Claude at about 10 screens per day, the lot is about 14 days of work (52 screens = 5.2 days; mobile foundation, review and stores are assumptions), so a floor of about 1,600 €: at 1,328 €, the lot clears the 1,000 € minimum but stays below this floor (about 95 € per day). Sold alone, it would be raised to about 1,600 €; it is therefore sold as the first step of the full flat fee.

## Lot content

| Module | Screens | Amount |
|---|---|---|
| Welcome and login (code by email or SMS, no Google or Apple) | 7 | 127 € |
| Sign-up with form | 10 | 181 € |
| Sponsorship (×1.5) | 10 | 272 € |
| Photo, scarf, member card | 5 | 83 € |
| Messages and contact requests (×1.5), with report and block | 9 | 204 € |
| Notifications | 1 | 21 € |
| Settings (preferences, account deletion) | 2 | 37 € |
| Legal pages (terms, privacy, charter, legal notice, my data) | 5 | 85 € |
| States (offline, error, mandatory update) | 3 | 48 € |
| **Total screens** | **52** | **1,058 €** |

At the end of the lot, an alumnus can sign up, be sponsored by three members, get access, write to their sponsors and sponsored members (who accept or refuse the request), be notified, and delete their account. Writing to any other member goes through the ads or the directory, in the following lots.

## Screen detail

Base price of 16 €. The extras are those of the grid: service (+5 €, sending an email, SMS or notification), camera or file upload (+3 €), map or geolocation (+8 €), multi-step workflow (+5 €). Sponsorship and contact requests carry the ×1.5.

### Welcome and login (127 €)

| Screen | Extra | Price |
|---|---|---|
| Language choice | | 16 € |
| Welcome | | 16 € |
| Login (email or phone) | service | 21 € |
| Confirmation code | service | 21 € |
| No more access to my email or phone | | 16 € |
| No more access · new contact details | service | 21 € |
| No more access · request sent | | 16 € |

### Sign-up with form (181 €)

| Screen | Extra | Price |
|---|---|---|
| Contact details | | 16 € |
| Email already used | | 16 € |
| Verification by email or SMS | service | 21 € |
| Link with the EEIF (6 tabs) | workflow | 21 € |
| Local group | | 16 € |
| City, country, district | map | 24 € |
| Languages spoken | | 16 € |
| Situation, sectors, CV | file upload | 19 € |
| Commitment (charter) | | 16 € |
| Notification permission | | 16 € |

### Sponsorship (272 €)

| Screen | Base and extra | Price (×1.5) |
|---|---|---|
| Find a sponsor, contacts access | 16 € + service | 32 € |
| Can't find anyone? | 16 € + service | 32 € |
| Help request sent | 16 € | 24 € |
| Waiting for validation | 16 € + workflow | 32 € |
| Find another sponsor | 16 € | 24 € |
| Sponsorship request received (sponsor side) | 16 € + service | 32 € |
| Link with the person | 16 € | 24 € |
| Sponsorship confirmed (1st, 2nd, 3rd sponsor) | 16 € | 24 € |
| Send a welcome message | 16 € | 24 € |
| Access unlocked, welcome to the app | 16 € | 24 € |

### Photo, scarf, member card (83 €)

| Screen | Extra | Price |
|---|---|---|
| Profile photo | camera | 19 € |
| Preview and crop | | 16 € |
| Scarf | | 16 € |
| Badges (introduction) | | 16 € |
| Card ready | | 16 € |

### Messages and contact requests (204 €)

| Screen | Base and extra | Price |
|---|---|---|
| Messages (list) | 16 € + workflow | 21 € |
| Request received | 16 € + service, ×1.5 | 32 € |
| Refuse a request | 16 €, ×1.5 | 24 € |
| My sent requests | 16 €, ×1.5 | 24 € |
| Conversation | 16 € + service | 21 € |
| Report | 16 € + service | 21 € |
| Block | 16 € | 16 € |
| Say thanks | 16 € + workflow | 21 € |
| Contact a member (from sponsorship) | 16 €, ×1.5 | 24 € |

### Notifications, settings, legal, states (191 €)

| Screen | Extra | Price |
|---|---|---|
| Notifications (list) | workflow | 21 € |
| Settings | | 16 € |
| Delete my account (reasons, confirmation, end) | service | 21 € |
| Terms of use | | 16 € |
| Privacy policy | | 16 € |
| Community charter | | 16 € |
| Legal notice | | 16 € |
| My data and permissions | service | 21 € |
| Offline | | 16 € |
| General error | | 16 € |
| Mandatory update | | 16 € |

## Counting rule and mockup match

The mockup has 210 screens. The lot bills 52. The gap comes from the grid rule: **the price is per distinct view, its states and variants are included**. A dialog (menu, confirmation) or a system permission is not a screen. A screen reused in several places (the code entry) is counted once.

| Module | Billed screens | Mockup screens covered | What the difference contains |
|---|---|---|---|
| Welcome and login | 7 | 13 | Wrong code, expired code, code received by SMS, signing in, Face ID |
| Sign-up with form | 10 | 16 | The 6 tabs of step 3 (one screen), email already used, code, languages |
| Sponsorship | 10 | 20 | The 3 states of the request counter, notifications and the lock screen, the 3 sponsor ranks |
| Photo, scarf, member card | 5 | 10 | Camera and photo permissions, selfie, gallery, preview |
| Messages and requests | 9 | 12 | "⋯" menu, "no message" state, refused request, request kept for later |
| Notifications | 1 | 4 | List after "Later", lock screen |
| Settings | 2 | 3 | Deletion confirmation and end screen merged |
| Legal pages | 5 | 5 | |
| States | 3 | 3 | |
| **Total** | **52** | **86** | |

Of the mockup's 210 screens, 86 are covered by this lot, 7 are the calls (out of scope) and 117 come in the following lots.

## Assumptions and risks

1. **Messaging limited to sponsors and sponsored members.** A contact request normally starts from an ad or from the directory, which are in later lots. In this lot, one can write to their sponsors and sponsored members, from the sponsorship screens. Writing to any member comes with the ads or the directory. The conversation is built on the database's real-time feature, not on the project's third-party service (Stream, 500 € of integration on top): this takes more work than the screen price covers (read receipts, offline, notifications), but avoids the service's monthly cost above 1,000 active users.
2. **No passport sign-up.** Every new member goes through sponsorship. The EEIF team answers help requests ("Can't find anyone?") by email and validates accounts by hand.
3. **Manual moderation.** Without a back-office, reports arrive by email or in the database; warnings and suspensions are done by hand. The matching screens come in a later lot.
4. **Design provided.** If the design does not follow the existing design system, or changes after the screens are delivered, the complexity multiplier applies and changes are billed by amendment.
5. **3-month deadline.** 52 screens in 66 working days is doable with Claude-assisted development; the time basis is detailed in [all the mobile app for 5,000 €](ENTRAIDEI_FULL_5000.md#calculation-basis). Store review times (Apple 1 to 3 days, sometimes more) and opening an Apple organization account (D-U-N-S number, several weeks) must be started at signature.
6. **Content to be supplied by the client**: texts of the charter, terms and privacy policy, legal notice, missing scarf colors.
