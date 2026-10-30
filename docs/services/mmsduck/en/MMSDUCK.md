# MMSDuck (SMS)

## Table of Contents

- [What it is used for](#what-it-is-used-for)
- [Where the code is](#where-the-code-is)
- [Variables](#variables)
- [Setup](#setup)
- [Gotchas](#gotchas)

## What it is used for

MMSDuck is the SMS provider. It sends the phone verification and password reset codes, ticket and new-device notices, and the SMS fallback of notifications.

## Where the code is

- `apps/server/src/services/mmsduck.service.ts`: the provider client.
- `apps/server/src/services/sms.service.ts`: picks the provider of a number's country (`sendSms`, `sendSmsWithResult`) and warns the staff when the account runs out of credit.
- `apps/server/src/cloud/utils/_core/sms.utils.cloud.ts`: the message builders (`sendSmsVerification`, `sendSmsToUser`...).

## Variables

| Variable | App | Purpose |
|---|---|---|
| `MMSDUCK_API_KEY` | server | Provider key (secret). Required and non-empty in `preProduction` and `production`; optional elsewhere |
| `ANDROID_SMS_RETRIEVER_HASH` | server | Optional: hash appended to verification SMS so an Android app can read the code |

## Setup

1. Create an MMSDuck account and an API key, and add credit.
2. Set `MMSDUCK_API_KEY` on the host of each deployed environment.

## Gotchas

- In development and test no SMS is sent: the message is only logged.
- Every SMS costs credit. A country that no provider serves is refused before anything is sent.
- The server does not start in a deployed environment without the key.
