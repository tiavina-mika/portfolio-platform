# Entraid'ei — 5,000 € lot (mobile only, design provided)

## Table of Contents

- [Calculation basis](#calculation-basis)
- [Lot content](#lot-content)
- [Screen detail](#screen-detail)
- [Counting rule and mockup match](#counting-rule-and-mockup-match)
- [Assumptions and risks](#assumptions-and-risks)

> Variant of the [full quote](ENTRAIDEI_QUOTE.md) for a 5,000 € budget over 3 months, mobile app only. Same grid as [the Aldaron vision](ALDARON_VISION.md). For the whole scope at 5,000 €, see [all the mobile app for 5,000 €](ENTRAIDEI_FULL_5000.md). Screens are counted from the project's screen list; the amounts are hypotheses to validate.

## Calculation basis

The budget is set first, then the scope is cut to fit it. This is not a price given to a full scope.

| Step | Calculation | Result |
|---|---|---|
| Target budget | | 5,000 € |
| Mobile foundation (Expo, authentication, navigation, push, store publishing) | | 1,000 € |
| Left for screens | 5,000 − 1,000 | 4,000 € |
| Screens kept | 52 screens, 60 € base grid with extras, ×1.5 on sponsorship and contact requests | 3,980 € |
| **Lot price** | 1,000 + 3,980 | **4,980 €** |
| Margin | 5,000 − 4,980 | 20 € |

What is at 0 € in this lot:
- **The web foundation** (public site, CMS, back-office): no web part, moderation is done by hand in the database dashboard.
- **Mockups**: the design is provided by the client (the mockup already exists). It must rely on the existing design system: a mockup that ignores it forces new components to be built, and the complexity multiplier then applies.
- **Third-party integrations**: none in this lot.

Floor check: the quote floor is the number of working days × 114 €. With Claude at about 10 screens per day, the lot is about 14 days of work (52 screens = 5.2 days; mobile foundation, review and stores are assumptions), so a floor of about 1,600 €: at 4,980 €, the lot clears it by far (about 355 € per day).

## Lot content

| Module | Screens | Amount |
|---|---|---|
| Welcome and login (code by email or SMS, no Google or Apple) | 7 | 480 € |
| Sign-up with form | 10 | 680 € |
| Sponsorship (×1.5) | 10 | 1,020 € |
| Photo, scarf, member card | 5 | 310 € |
| Messages and contact requests (×1.5), with report and block | 9 | 770 € |
| Notifications | 1 | 80 € |
| Settings (preferences, account deletion) | 2 | 140 € |
| Legal pages (terms, privacy, charter, legal notice, my data) | 5 | 320 € |
| States (offline, error, mandatory update) | 3 | 180 € |
| **Total screens** | **52** | **3,980 €** |

At the end of the lot, an alumnus can sign up, be sponsored by three members, get access, write to their sponsors and sponsored members (who accept or refuse the request), be notified, and delete their account. Writing to any other member goes through the ads or the directory, in the following lots.

## Screen detail

Base price of 60 €. The extras are those of the grid: service (+20 €, sending an email, SMS or notification), camera or file upload (+10 €), map or geolocation (+30 €), multi-step workflow (+20 €). Sponsorship and contact requests carry the ×1.5.

### Welcome and login (480 €)

| Screen | Extra | Price |
|---|---|---|
| Language choice | | 60 € |
| Welcome | | 60 € |
| Login (email or phone) | service | 80 € |
| Confirmation code | service | 80 € |
| No more access to my email or phone | | 60 € |
| No more access · new contact details | service | 80 € |
| No more access · request sent | | 60 € |

### Sign-up with form (680 €)

| Screen | Extra | Price |
|---|---|---|
| Contact details | | 60 € |
| Email already used | | 60 € |
| Verification by email or SMS | service | 80 € |
| Link with the EEIF (6 tabs) | workflow | 80 € |
| Local group | | 60 € |
| City, country, district | map | 90 € |
| Languages spoken | | 60 € |
| Situation, sectors, CV | file upload | 70 € |
| Commitment (charter) | | 60 € |
| Notification permission | | 60 € |

### Sponsorship (1,020 €)

| Screen | Base and extra | Price (×1.5) |
|---|---|---|
| Find a sponsor, contacts access | 60 € + service | 120 € |
| Can't find anyone? | 60 € + service | 120 € |
| Help request sent | 60 € | 90 € |
| Waiting for validation | 60 € + workflow | 120 € |
| Find another sponsor | 60 € | 90 € |
| Sponsorship request received (sponsor side) | 60 € + service | 120 € |
| Link with the person | 60 € | 90 € |
| Sponsorship confirmed (1st, 2nd, 3rd sponsor) | 60 € | 90 € |
| Send a welcome message | 60 € | 90 € |
| Access unlocked, welcome to the app | 60 € | 90 € |

### Photo, scarf, member card (310 €)

| Screen | Extra | Price |
|---|---|---|
| Profile photo | camera | 70 € |
| Preview and crop | | 60 € |
| Scarf | | 60 € |
| Badges (introduction) | | 60 € |
| Card ready | | 60 € |

### Messages and contact requests (770 €)

| Screen | Base and extra | Price |
|---|---|---|
| Messages (list) | 60 € + workflow | 80 € |
| Request received | 60 € + service, ×1.5 | 120 € |
| Refuse a request | 60 €, ×1.5 | 90 € |
| My sent requests | 60 €, ×1.5 | 90 € |
| Conversation | 60 € + service | 80 € |
| Report | 60 € + service | 80 € |
| Block | 60 € | 60 € |
| Say thanks | 60 € + workflow | 80 € |
| Contact a member (from sponsorship) | 60 €, ×1.5 | 90 € |

### Notifications, settings, legal, states (720 €)

| Screen | Extra | Price |
|---|---|---|
| Notifications (list) | workflow | 80 € |
| Settings | | 60 € |
| Delete my account (reasons, confirmation, end) | service | 80 € |
| Terms of use | | 60 € |
| Privacy policy | | 60 € |
| Community charter | | 60 € |
| Legal notice | | 60 € |
| My data and permissions | service | 80 € |
| Offline | | 60 € |
| General error | | 60 € |
| Mandatory update | | 60 € |

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

1. **Messaging limited to sponsors and sponsored members.** A contact request normally starts from an ad or from the directory, which are in later lots. In this lot, one can write to their sponsors and sponsored members, from the sponsorship screens. Writing to any member comes with the ads or the directory. The conversation is built on the database's real-time feature, not on the project's third-party service (Stream, 1,200 € of integration on top): this takes more work than the screen price covers (read receipts, offline, notifications), but avoids the service's monthly cost above 1,000 active users.
2. **No passport sign-up.** Every new member goes through sponsorship. The EEIF team answers help requests ("Can't find anyone?") by email and validates accounts by hand.
3. **Manual moderation.** Without a back-office, reports arrive by email or in the database; warnings and suspensions are done by hand. The matching screens come in a later lot.
4. **Design provided.** If the design does not follow the existing design system, or changes after the screens are delivered, the complexity multiplier applies and changes are billed by amendment.
5. **3-month deadline.** 52 screens in 66 working days is doable with Claude-assisted development; the time basis is detailed in [all the mobile app for 5,000 €](ENTRAIDEI_FULL_5000.md#calculation-basis). Store review times (Apple 1 to 3 days, sometimes more) and opening an Apple organization account (D-U-N-S number, several weeks) must be started at signature.
6. **Content to be supplied by the client**: texts of the charter, terms and privacy policy, legal notice, missing scarf colors.
