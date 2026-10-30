import { SHARED_CLASS_ALIASES } from '@shared/constants';
import { DOMAIN_COLLECTIONS } from '@shared/domain-constants';

import { collections } from '@/constants/_core/constants';

/**
 * classes that must always be governed by another class's rights instead of having their own
 * entry in the role rights UI — kept in sync with the BO client via `SHARED_CLASS_ALIASES`
 * @example PageSection is part of a Page and must follow the exact same rights as Page
 */
export const CLP_CLASS_ALIASES: Record<string, string> = SHARED_CLASS_ALIASES;

/**
 * Public-facing content classes (CGU/legal pages, blog articles, categories) that users must
 * always be able to preview, even when unauthenticated. `get`/`find` are forced public for
 * these classes regardless of role configuration — only create/update/delete still follow
 * role-based rights.
 */
export const PUBLIC_READ_CLASSES: string[] = [
  collections.Page,
  collections.PageSection,
  collections.Article,
  collections.Category,
  // portfolio: the public website lists and reads the projects with no session at all
  DOMAIN_COLLECTIONS.project,
  /*
   * site-level branding/content edited from the BO (logo, description, quote) — the public
   * website reads it on every page render with no session at all, so it cannot be gated
   */
  collections.App,
];

/**
 * Classes whose CLP and schema are rebuilt on every start even when no role references them and
 * they carry no owner pointer permission.
 *
 * `Contact` and `Newsletter` used to earn that through a public `create` grant, which is exactly
 * what was removed: a class-level `create: { '*': true }` is granted to every caller holding the
 * app id — which ships in the mobile and back-office bundles — not just to the website, so the
 * reCAPTCHA check on the website's own server sat upstream of a write anyone could make without
 * it. Both now go through `createPublicContact` / `subscribeToNewsletter`, which verify the token
 * server-side before writing with the master key.
 *
 * They stay listed here for two reasons that outlive that grant: an existing database still holds
 * the old permissive CLP until a rebuild overwrites it, and a brand-new one needs their columns
 * pre-created from `EXTRA_SCHEMA_FIELDS` before the website ever writes to them.
 */
export const ALWAYS_REBUILT_CLASSES: string[] = [
  collections.Contact,
  collections.Newsletter,
];

/**
 * CLP operations granted unconditionally to the highest-level roles, mirroring the
 * BO client-side bypass (`canAccessTo` treats `HIGHEST_LEVEL_ROLES` as having access to
 * everything regardless of their `rights` array). Without this, a fresh role with no
 * `rights` entry for a class (e.g. the initial `OWNER` role) would pass the BO route guard
 * but get denied by Parse Server on any raw client query against that class.
 */
export const FULL_ACCESS_OPERATIONS = ['find', 'get', 'create', 'update', 'delete'];

/**
 * Classes that any signed-in user is intentionally allowed to `find`/`get`, beyond whatever
 * role rights are configured — browsing ride offers or viewing another user's public profile.
 * Every other class stays gated to role rights and/or owner pointer permissions (see
 * `OWNER_POINTER_FIELDS`) — never to a blanket "any authenticated user" grant.
 *
 * `Vehicle` is deliberately NOT here. It carries registration plates and the owner's insurance
 * and registration papers; a blanket read let any account list every plate on the platform with
 * its owner. Vehicles a user does not own are now reached only through `getVehicleById` /
 * `getUserVehicles`, which mask the plate's serial and never return the documents; the owner
 * reads their own rows through the `owner` pointer permission below.
 */
export const AUTHENTICATED_READABLE_CLASSES: string[] = [
  collections.User,
  collections.Ride,
];

/**
 * Owner pointer permissions (Parse Server's `readUserFields`/`writeUserFields` CLP): grants
 * direct read/write to the user(s) pointed to by these fields on each object, enforced by
 * Parse Server/MongoDB itself — not just by the `.equalTo(...)` filter used in the client or
 * service query. This is what keeps e.g. a Notification readable only by its recipient even
 * if a client calls the REST API directly with a valid session token and no filter at all
 * — the service-level filter is a convenience, the CLP is the actual guard.
 *
 * `fieldTypes`: pointer permissions accept a `Pointer<_User>` field OR an `Array` field (Parse
 * only checks, at runtime, that array items are `_User` pointers) — defaults to `Pointer` below,
 * override per-field when the column is actually an array of recipients (e.g. `Notification.to`,
 * see `INotificationValues.to: Parse.User[]`). Declaring the wrong kind throws a schema-mismatch
 * error against an existing column, so this must match the real field type.
 *
 * `authenticatedCreate`: pointer permissions never cover `create` (there is no existing object
 * to check the pointer against yet), so classes a normal signed-in user must be able to create
 * directly (Rating, Request, Ride, Vehicle) need this explicit flag — the owning trigger
 * (`beforeSave`/`setRequestDefaultValuesBeforeSave`) is what actually locks the created object
 * down, this flag only lets the request through Parse Server's CLP check.
 *
 * Ride/Vehicle are listed here (write-only, no `read`) even though they are already world-
 * readable to signed-in users via `AUTHENTICATED_READABLE_CLASSES`: without an entry, the moment
 * any BO role gets a rights entry on them (the read-only support role ships with find/get on
 * every class), the CLP rebuild would restrict `create`/`update`/`delete` to BO roles only and a
 * driver could no longer publish or edit their own ride from the mobile app. The `write` pointer
 * field is what lets the owner — and only the owner — update/delete their own row; every
 * server-side write goes through the master key, so it is unaffected by the restriction.
 */
export const OWNER_POINTER_FIELDS: Record<string, {
  read?: string[];
  write?: string[];
  fieldTypes?: Record<string, 'Pointer' | 'Array'>;
  authenticatedCreate?: boolean;
}> = {
  /*
   * read-only for recipients: the only write the app needs (marking a notification seen) goes
   * through the `setNotificationReceiverSeen` Cloud Function. A `write` grant here let a recipient
   * rewrite `message`/`to` on a row they received and have the afterSave push that free text,
   * branded Portfolio, to any user.
   */
  [collections.Notification]: { read: ['to'], fieldTypes: { to: 'Array' } },
  [collections.Payment]: { read: ['payer', 'receiver'] },
  [collections.Rating]: { read: ['from', 'to'], write: ['from'], authenticatedCreate: true },
  [collections.Request]: {
    /*
     * `write` is the passenger alone: the driver never saves a booking from the app — every move
     * they make (cancelling, declaring an absence, replying to a report) is a Cloud Function
     * saving with the master key. A `write` grant on `driver` let them rewrite the passenger's
     * `comment` or hide the booking from the passenger's list.
     */
    read: ['passenger', 'driver'], write: ['passenger'], authenticatedCreate: true,
  },
  [collections.Ride]: { write: ['driver'], authenticatedCreate: true },
  [collections.UserSession]: { read: ['user'] },
  /*
   * `read` is load-bearing here, unlike on Ride: since Vehicle left
   * `AUTHENTICATED_READABLE_CLASSES`, the pointer permission is the only thing letting a driver
   * query their own vehicles from the app at all.
   */
  [collections.Vehicle]: { read: ['owner'], write: ['owner'], authenticatedCreate: true },
};

/**
 * `_User` is the one class an end user must both create while unauthenticated (sign-up) and
 * update as themselves, and it cannot use the pointer permissions above — those need a
 * `Pointer<_User>` column on the class, and a user row has no pointer to itself. Ownership is
 * already enforced object by object by the ACL Parse writes at sign-up (only that user, plus
 * the master key, can write their own row), so the CLP only has to stay open enough not to
 * block it: public `create`, authenticated `update`/`delete`. Without this, a BO role holding
 * rights on `_User` would trigger a rebuild that locks sign-up and profile edits to BO roles.
 *
 * `addField` follows `update` here (authenticated, not public). Parse waives `addField` entirely
 * for any class declaring `writeUserFields` — which is already the case for Ride/Vehicle/Request/
 * Rating — so an authenticated owner can add columns to those four today; `_User`
 * gets no such waiver (it has no self-pointer column) and would instead reject every profile
 * field added after this CLP first ran. Granting it explicitly puts `_User` at the same level as
 * the classes around it rather than making it the one place where adding a field breaks. The
 * columns written *during* sign-up still need `EXTRA_SCHEMA_FIELDS` below: at that point the
 * caller has no session yet, so even the authenticated grant does not apply.
 */
export const SELF_MANAGED_CLASSES: string[] = [collections.User];

/**
 * Classes with no UI-configurable role rights at all — every access goes through a Cloud
 * Function using the master key (never a raw client SDK call), so they must always be locked
 * to `HIGHEST_LEVEL_ROLES` only, with no public/authenticated grant. Unlike
 * `OWNER_POINTER_FIELDS`/`CLP_CLASS_ALIASES` entries, `buildCLPForClass` already produces this
 * locked-down shape for any class absent from `PUBLIC_READ_CLASSES`/`AUTHENTICATED_READABLE_CLASSES`
 * with no matching role rights — this list only forces the rebuild to run for classes that would
 * otherwise never be picked up by `rebuildAllCLP` (since no role ever references them).
 */
export const ALWAYS_LOCKED_CLASSES: string[] = [
  collections.Invitation,
  collections.RoleAuditLog,
  // written only by the admin session functions, with the master key
  collections.SessionAuditLog,
  /*
   * TicketMessage is only ever read/written through Cloud Functions (sendTicketMessage,
   * getTicketMessages) using the master key — its access is governed by `Contact`'s role
   * rights inside those functions (`fromBO(..., ['update'], collections.Contact)`), never by
   * its own CLP. No BO role is ever granted rights on TicketMessage directly.
   */
  collections.TicketMessage,
  /*
   * RideShare holds the tokens of the public ride links: read and written only by the ride-share
   * Cloud Functions with the master key, never by a client directly.
   */
  collections.RideShare,
  /*
   * SosAlert records who raised an SOS, where and what became of the SMS: written by the
   * triggerSos Cloud Function and read by the ticket context, both with the master key only.
   */
  collections.SosAlert,
  /*
   * UserModerationLog records bans, lifts and suspensions: written by the moderation services and
   * read by the back-office audit trail function, both with the master key only.
   */
  collections.UserModerationLog,
  /*
   * PushReceipt holds Expo push tickets next to the device token they were sent to, and
   * NotificationResend logs who re-sent what to whom: both are written by the push service and
   * the resend Cloud Functions with the master key, and no role is ever granted rights on them —
   * without this entry they kept Parse's default public CLP and the push tokens were listable by
   * anyone holding the app id.
   */
  collections.PushReceipt,
  collections.NotificationResend,
  /*
   * ImpersonationSession stores the `sessionToken` of the session handed to the admin: written by
   * the impersonation Cloud Functions and read by the audit trail, both with the master key only.
   * Without this entry no role references it, so `rebuildAllCLP` never rebuilt it and it kept
   * Parse's default public CLP — the tokens were listable by anyone holding the app id.
   */
  collections.ImpersonationSession,
  /*
   * Audit and moderation trails (account changes, MFA events, penalties), the content version
   * history and the id counters: all read and written by Cloud Functions, jobs and triggers with
   * the master key, and no client ever queries them. They were only protected when a role happened
   * to cite them (the default support role does) — a database without that role left them with
   * Parse's default public CLP. Role rights granted on them (the BO audit screens) still apply:
   * this list only forces the rebuild and the locked default.
   */
  collections.UserAuditLog,
  collections.MfaAuditLog,
  collections.PenaltyLog,
  collections.ContentVersion,
  collections.Counter,
  /*
   * Reports are filed through the `createReport` Cloud Function (master key, rate-limited) and
   * handled from the BO through role rights; the app never saves one directly.
   */
  collections.Report,
];

/**
 * Fields pre-created in the schema (master key, at CLP rebuild time) so the column
 * already has the correct type before any client-side `.save()` touches it — mainly relevant for
 * `ALWAYS_LOCKED_CLASSES`/owner-pointer-only classes, where no role is ever granted `addField`
 * (see `buildCLPForClass`'s `grantAddField`, mirrored from `create`/`update` role rights).
 * For a class already governed by role-based rights (e.g. `Page`), a BO role with `create`/
 * `update` now gets `addField` automatically, so entries here are optional belt-and-suspenders
 * documentation of the expected field types rather than a strict requirement — Parse would
 * otherwise infer the type from whatever value is written first.
 *
 * Required, not optional, for the classes written with no session at all — the two
 * `ALWAYS_REBUILT_CLASSES` and the sign-up half of `_User`. Parse only waives `addField` for
 * classes declaring `writeUserFields`, which none of the three can, and an anonymous caller
 * matches no CLP grant, so the first save carrying an undeclared column fails with "Permission
 * denied". On an existing database the columns are already in the schema and this list changes
 * nothing; on a brand-new one, `rebuildCLPForClass` creates `Contact`/`Newsletter` empty before
 * the public website ever posts to them, which is what makes the declaration load-bearing.
 * Adding a field to the contact form, the newsletter form or the sign-up payload means adding
 * it here in the same task.
 *
 * The fields set by the classes' own `beforeSave` triggers count too: the trigger runs inside
 * the client's save, so the columns it introduces go through the same `addField` check.
 */
export const EXTRA_SCHEMA_FIELDS: Record<
  string,
  Record<string, 'Object' | 'Date' | 'Array' | 'String' | 'Boolean' | 'Pointer'>
> = {
  [collections.Page]: {
    translated: 'Object',
    bannerImage: 'Object',
    previewImage: 'Object',
    images: 'Array',
    categories: 'Array',
    linkLocations: 'Array',
    editorFiles: 'Array',
    active: 'Boolean',
    code: 'String',
  },
  // public contact form: the visitor's fields, then everything the ticket beforeSave adds
  [collections.Contact]: {
    email: 'String',
    name: 'String',
    message: 'String',
    phone: 'String',
    acceptNewsLetter: 'Boolean',
    deleted: 'Boolean',
    seen: 'Boolean',
    replied: 'Boolean',
    status: 'String',
    priority: 'String',
    lastMessageAt: 'Date',
    unreadByAdmin: 'Boolean',
    unreadByUser: 'Boolean',
    locale: 'String',
    user: 'Pointer',
  },
  // public newsletter form, same split: submitted fields then trigger-set ones
  [collections.Newsletter]: {
    email: 'String',
    language: 'String',
    deleted: 'Boolean',
    active: 'Boolean',
    seen: 'Boolean',
    user: 'Pointer',
  },
  /*
   * sign-up only — the one moment a `_User` write carries no session (see SELF_MANAGED_CLASSES).
   * Everything a signed-in user edits afterwards (address, birthday, image, payment phones…) is
   * covered by the authenticated `addField` grant instead and must NOT be listed here.
   */
  [collections.User]: {
    firstName: 'String',
    lastName: 'String',
    phone: 'Object',
    registerStep: 'String',
    platform: 'String',
    consentVersion: 'String',
    deleted: 'Boolean',
    seen: 'Boolean',
    requestStats: 'Object',
    rideStats: 'Object',
    hasPublishedRide: 'Boolean',
    platforms: 'Array',
    acceptedTermsAt: 'Date',
  },
};
