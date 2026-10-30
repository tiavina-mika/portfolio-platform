/**
 * Classes a signed-in client can actually be pushed events for over LiveQuery, shared so the BO
 * client and the server never drift apart on it.
 *
 * Parse Server checks the class-level permissions against an ACL group built as
 * `['*', <userId>]` only — neither `ParseLiveQueryServer._handleSubscribe` nor its per-event
 * `_matchesCLP` resolves the session's roles into it, unlike the REST path. Two consequences, and
 * a class has to clear both to belong here:
 *
 * 1. A class whose `find` is granted purely through `role:<Name>` entries is refused at subscribe
 *    time for every caller, however privileged, and the server logs "Permission denied for action
 *    find on class <Name>" on each attempt. So the grant must be public or `requiresAuthentication`.
 * 2. A class declaring owner pointer permissions (`readUserFields`) passes the subscribe check but
 *    then has every event filtered down to the user the pointer names — a back-office admin who is
 *    neither the payer of a payment nor the passenger of a booking receives nothing, silently. So
 *    the class must carry no read pointer permissions either.
 *
 * Everything else (Contact, Report, Payment, Request, and every BO-only class) is read through
 * master-key Cloud Functions instead, and its counts are refreshed by polling rather than by a
 * push — a subscription there is either an error in the log or a connection that never fires.
 *
 * Keep in sync with the CLP rules in `apps/server/src/constants/_core/security.constants.ts`
 * (`PUBLIC_READ_CLASSES`, `AUTHENTICATED_READABLE_CLASSES`, `OWNER_POINTER_FIELDS`): a class that
 * gains read pointer permissions, or loses its role-free read grant, comes out of here in the same
 * task.
 *
 * Two classes were removed for exactly those reasons:
 * - `Vehicle` gained `readUserFields: ['owner']`, so rule 2 applies — a back-office reader is
 *   handed a subscription that then filters every event away.
 * - `_User` clears both rules, but clearing them is the problem: any signed-in mobile account
 *   could subscribe to every change on every account on the platform. A stream of that shape is
 *   not something a class-level permission can narrow, so the badge is polled instead.
 */
export const LIVE_QUERY_SUBSCRIBABLE_CLASSES: string[] = [
  'Ride',
];
