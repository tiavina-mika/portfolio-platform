import { TargetEnum } from '@shared/types';

import {
  collections, DEFAULT_ROLES, HIGHEST_LEVEL_ROLES, STAFF_UI_RIGHT,
} from '@/constants/_core/constants';
import { ALWAYS_LOCKED_CLASSES } from '@/constants/_core/security.constants';

export const DEFAULT_ROLE_TRANSLATED_LABELS: Record<string, Record<string, { label: string }>> = {
  [HIGHEST_LEVEL_ROLES[0]!]: {
    en: { label: 'Owner' },
    fr: { label: 'Propriétaire' },
    mg: { label: 'Tompony' },
  },
  [HIGHEST_LEVEL_ROLES[1]!]: {
    en: { label: 'Super Admin' },
    fr: { label: 'Super Administrateur' },
    mg: { label: 'Mpitantana Ambony' },
  },
  [DEFAULT_ROLES[0]!]: {
    en: { label: 'Manager' },
    fr: { label: 'Gestionnaire' },
    mg: { label: 'Mpitantana' },
  },
  [DEFAULT_ROLES[1]!]: {
    en: { label: 'Support (Read-only)' },
    fr: { label: 'Support (lecture seule)' },
    mg: { label: 'Fanampiana (famakiana ihany)' },
  },
  [DEFAULT_ROLES[2]!]: {
    en: { label: 'Team lead' },
    fr: { label: 'Responsable d’équipe' },
    mg: { label: 'Mpitarika ekipa' },
  },
  [DEFAULT_ROLES[3]!]: {
    en: { label: 'Aldaron team (Read-only)' },
    fr: { label: 'Équipe Aldaron (lecture seule)' },
    mg: { label: 'Ekipa Aldaron (famakiana ihany)' },
  },
  [DEFAULT_ROLES[4]!]: {
    en: { label: 'Aldaron team lead' },
    fr: { label: 'Responsable d’équipe Aldaron' },
    mg: { label: 'Mpitarika ekipa Aldaron' },
  },
  [DEFAULT_ROLES[5]!]: {
    en: { label: 'Aldaron administrator' },
    fr: { label: 'Administrateur Aldaron' },
    mg: { label: 'Mpitantana Aldaron' },
  },
};

/*
 * classes deliberately left out of SUPPORT_VIEWER's default rights — every class that is only
 * ever reached through a master-key Cloud Function (audit trails, invitations,
 * impersonation sessions…). Granting `find`/`get` on them
 * would turn their CLP into "readable by this role" and let a read-only, low-privilege role list
 * them with the raw SDK, which is the opposite of what a locked class promises
 */
const SUPPORT_VIEWER_EXCLUDED_CLASSES: string[] = [...ALWAYS_LOCKED_CLASSES];

/**
 * SUPPORT_VIEWER's default rights: find/get only, on every "rightable" class except the ones
 * above — a read-only role usable for support/observability out of the box, without an admin
 * having to hand-configure the rights grid before it is usable
 */
const SUPPORT_VIEWER_DEFAULT_RIGHTS = Object.values(collections)
  .filter((className) => !SUPPORT_VIEWER_EXCLUDED_CLASSES.includes(className))
  .map((className) => ({
    className,
    rights: {
      find: true, get: true, create: false, update: false, delete: false, destroy: false,
    },
  }));

/**
 * TEAM_LEAD's default rights: what SUPPORT_VIEWER reads, plus creating an account — the right an
 * invitation of a colleague is checked against. Every post it hands out must stay within these
 * rights (see `STAFF_UI_RIGHT`), so out of the box it can only staff read-only posts: an owner
 * widens it, and with it the posts it may give, from the role form
 */
const TEAM_LEAD_DEFAULT_RIGHTS = SUPPORT_VIEWER_DEFAULT_RIGHTS.map((entry) => (
  entry.className === collections.User
    ? { ...entry, rights: { ...entry.rights, create: true } }
    : entry
));

/**
 * AGENCY_ADMIN's default rights: every right on every "rightable" class — the owner of the agency workspace
 * runs it alone, so it gets all of it — except the always-locked ones, which no role ever holds.
 */
const AGENCY_ADMIN_DEFAULT_RIGHTS = SUPPORT_VIEWER_DEFAULT_RIGHTS.map((entry) => ({
  ...entry,
  rights: {
    find: true, get: true, create: true, update: true, delete: true, destroy: true,
  },
}));

export const DEFAULT_ROLE_RIGHTS: Record<string, typeof SUPPORT_VIEWER_DEFAULT_RIGHTS> = {
  [DEFAULT_ROLES[1]!]: SUPPORT_VIEWER_DEFAULT_RIGHTS,
  [DEFAULT_ROLES[2]!]: TEAM_LEAD_DEFAULT_RIGHTS,
  // the agency posts read and invite like the two above, but only in the agency workspace
  [DEFAULT_ROLES[3]!]: SUPPORT_VIEWER_DEFAULT_RIGHTS,
  [DEFAULT_ROLES[4]!]: TEAM_LEAD_DEFAULT_RIGHTS,
  [DEFAULT_ROLES[5]!]: AGENCY_ADMIN_DEFAULT_RIGHTS,
};

/**
 * The workspaces a default role opens. A default role with no entry opens the portfolio only, like any
 * role saved without the field.
 */
export const DEFAULT_ROLE_WORKSPACES: Record<string, TargetEnum[]> = {
  [DEFAULT_ROLES[3]!]: [TargetEnum.AGENCY],
  [DEFAULT_ROLES[4]!]: [TargetEnum.AGENCY],
  [DEFAULT_ROLES[5]!]: [TargetEnum.AGENCY],
};

/*
 * BO "ui" right strings, matched against apps/bo's UIRoleEnum by value (not a shared type — see
 * IMPERSONATION_UI_RIGHT for the same pattern) — grants TEAM_LEAD the staff management it exists for
 */
export const DEFAULT_ROLE_UI: Record<string, string[]> = {
  [DEFAULT_ROLES[1]!]: [],
  [DEFAULT_ROLES[2]!]: [STAFF_UI_RIGHT],
  [DEFAULT_ROLES[3]!]: [],
  [DEFAULT_ROLES[4]!]: [STAFF_UI_RIGHT],
  // the staff management only: impersonation, broadcast and the platform tabs stay with the owners
  [DEFAULT_ROLES[5]!]: [STAFF_UI_RIGHT],
};

/*
 * the owners a deployed environment must keep: the OWNER-only actions (resetting an administrator's
 * MFA, revoking a super-administrator) have nobody to fall back on when the only owner loses their
 * authenticator. The deployed environments refuse to boot with fewer addresses in `OWNERS_EMAILS`,
 * and the server warns at every start while fewer accounts hold the role (the second owner may
 * not have accepted the invitation yet, so the account count cannot stop the boot)
 */
export const MIN_OWNERS_COUNT = 2;

/*
 * how far up the role hierarchy a delegated post is followed: a member of a role inherits the CLP of
 * every role listing it as a child, so those are checked too. The tree is a handful of levels deep
 */
export const ROLE_ANCESTORS_MAX_DEPTH = 5;

/*
 * the parents read at once on one level of that walk, for every post checked together: a platform
 * holds far fewer posts, so a level hitting it could not be read in full and its posts are refused
 */
export const ROLE_ANCESTORS_LEVEL_MAX_COUNT = 200;

// bounds on what a role name / label / invitation can carry, enforced when a role is created
export const ROLE_NAME_MAX_LENGTH = 60;
export const ROLE_LABEL_MAX_LENGTH = 100;
export const ROLE_NAMES_MAX_COUNT = 20;
// the posts a dialog lists at once when it asks which of them the caller may not hand out
export const ROLE_NAMES_LISTED_MAX_COUNT = 200;
// technical code written in capitals and underscores, the format the back-office form produces
export const ROLE_NAME_PATTERN = /^[A-Z0-9_]+$/;
