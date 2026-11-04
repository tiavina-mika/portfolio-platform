// the first role is the highest level, the order is important
export const HIGHEST_LEVEL_ROLES = ['OWNER', 'SUPER_ADMIN'];
// MANAGER stays DEFAULT_ROLES[0] for backward compatibility — new default roles are appended after it
export const DEFAULT_ROLES = ['MANAGER', 'SUPPORT_VIEWER', 'TEAM_LEAD'];

/*
 * bounds for a role's custom back-office inactivity timeout — an unbounded field would let an
 * administrator type 0 (everyone logged out instantly) or 99999 (protection effectively
 * disabled), so both the form and the cloud function clamp to this range.
 *
 * Stored in minutes, but the role form asks for hours: all three values are multiples of 15 so
 * they land on whole quarter-hours (0.25 h to 8 h, in 0.25 h steps) once converted. The 15 min
 * floor is also the shortest inactivity timeout any of the standards we follow asks for.
 */
export const ROLE_SESSION_TIMEOUT_MIN_MINUTES = 15;
export const ROLE_SESSION_TIMEOUT_MAX_MINUTES = 480;
export const ROLE_SESSION_TIMEOUT_STEP_MINUTES = 15;
