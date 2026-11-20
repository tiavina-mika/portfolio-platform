# Entraid'ei — everything for 5,000 € (design provided)

## Table of Contents

- [Calculation basis](#calculation-basis)
- [Payment](#payment)
- [Content](#content)
- [Assumptions and risks](#assumptions-and-risks)

> The Entraid'ei project for a fixed price of about 5,000 €, design provided: the mobile app, real-time messaging, passport scan, Google and Apple, and the moderation back-office. The client sees only the price. The days below are Aldaron's internal estimate, which sets the price at the internal value of 114 € per day (see [the Aldaron vision](ALDARON_VISION.md) and the [feasibility estimate](ENTRAIDEI_QUOTE.md)). The amounts are hypotheses to validate.

## Calculation basis

Internal calculation, never shown to the client. The estimate of the scope gives 39.1 days; with a 10 % margin for review, testing and surprises, that makes 44 announced days (39.1 ÷ 0.9, rounded up to the next day), so 5,016 € at 114 € per day, quoted **5,000 €** (rounded to the nearest 100 €, well above the 2,500 € minimum). The price is fixed: the margin days are not billed separately, they absorb surprises.

| Item | Days |
|---|---|
| Mobile foundation | 2.4 |
| Mobile screens (about 125) | 21.8 |
| Integrations: passport, Google and Apple, geocoding, real-time messaging | 8.5 |
| Moderation back-office (13 screens) | 6.4 |
| **Total** | **39.1** |
| Days announced (39.1 ÷ 0.9, rounded up to the next day) | 44 |

The estimate takes 89 % of the announced days: the about 5 days of margin are for review, testing and surprises.

Two reading notes:

- **Login and sign-up.** The mobile foundation covers the authentication logic (accounts, sessions, going live). The "Welcome and login" and sign-up screens are counted separately because they carry the mockup's layout: this is not a duplicate.
- **Integrations.** Each service is counted once, configuration included.

**Second estimate, bottom-up.** Development is done with Claude, at about 10 screens per day (figure provided, to be measured).

| Item | Calculation | Days |
|---|---|---|
| Mobile screens (about 125) and back-office (13) | 138 / 10 | 13.8 |
| Mobile foundation and integrations (passport, Google and Apple, geocoding, real-time messaging) | assumption | 12 |
| Review, fixes, device testing | assumption, about 30 % of the rest | 8 |
| Stores (submission, resubmission) | assumption | 2 |
| **Total** | | **about 36** |

Both estimates (36 and 39 days) fit in the 44 announced days, with a margin of 5 to 8 days. The lines marked "assumption" do not come from a measurement: see [Assumptions and risks](#assumptions-and-risks).

## Payment

The price of 5,000 € is paid in three installments tied to progress: **2,000 € at signature (40 %), 1,500 € at the delivery of the first lot (30 %), 1,500 € at going live (30 %)**, before the handover of the code and accounts. The first lot ([52 screens](ENTRAIDEI_LOT_5000.md), internally about 14 days of work) is the mid-project demo. If the startup stops midway, the installments already paid stay with Aldaron and the code produced up to the last paid installment is handed over.

## Content

The 203 screens of the app, in French and English. States, variants and dialogs are included in the view (a distinct view counts as one screen, so about 125 views).

The web back-office covers the 13 moderation screens: reports (list and record), sanctions, member record, sponsorship help requests, lost access, reference lists (local groups, sectors and categories, languages), FAQ, legal versions, minimum app version, GDPR export.

Entraid'ei has no payment. If there were one, it would be about 4 to 5 more days internally, so about 500 € more on the quote.

## Assumptions and risks

1. **The 10 screens per day figure measures production, not delivery.** It does not say how long review, fidelity to the mockup, testing on real devices and fixes take. To validate by timing the first 10 screens, from the first prompt to the reviewed and tested screen, before signing.
2. **The price only holds thanks to Claude.** The internal days assume about 10 screens per day with the tool. By hand, a screen takes about half a day: the 138 screens would represent about 69 days, and the whole scope about 100 days of work. If the tool is no longer available or changes price, the fixed price is no longer tenable and the loss is Aldaron's.
3. **The cost of Claude** (subscription, tokens) must be subtracted from the price: it reduces the real gain.
4. **The margin is thin.** About 5 days out of 44. The internal value of 114 € per day comes from this calculation (5,000 € for 44 days): it brings no safety on the price.
5. **An overrun is Aldaron's.** The price is fixed: a screen redone, a design change or a store review delay eats the margin, then forces removing a need or issuing a new quote for the addition. The initial list of needs is written into the contract, with the screen counting rule.
6. **The passport scan depends on the EEIF.** Without a member database to query, it no longer holds: a short time-boxed trial (internally 2 days), then the client decides.
7. **High recurring costs for the client.** The third-party messaging goes from about 0 to about $400 per month above 1,000 active users. The client must know before signing.
8. **Stores.** Review times (Apple 1 to 3 days, sometimes more) and opening an Apple organization account (D-U-N-S number, several weeks) must be started at signature.
