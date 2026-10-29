/**
 * The environments that report to Sentry. Anything else (local development, Storybook, a build with
 * no environment) sends nothing, so the quota is never spent on noise.
 */
export const SENTRY_ENVIRONMENTS = ['preProduction', 'production'] as const;

// preproduction is noisy and shares the plan quota, so only a fifth of its errors are kept
export const SENTRY_ERROR_SAMPLE_RATE = {
  preProduction: 0.2,
  production: 1,
} as const;

// performance traces have their own, small quota: off in preproduction, a tenth in production
export const SENTRY_TRACES_SAMPLE_RATE = {
  preProduction: 0,
  production: 0.1,
} as const;

// headers that carry a secret or a session: they never leave the device or the browser
export const SENTRY_REDACTED_HEADERS = [
  'authorization',
  'cookie',
  'x-portfolio-key',
  'x-parse-application-id',
  'x-parse-rest-api-key',
  'x-parse-session-token',
] as const;

export const SENTRY_REDACTED_VALUE = '[redacted]';

// the trail of what ran before an error: a console message can hold anything a developer printed
// (a phone number, an e-mail), so those breadcrumbs are dropped rather than redacted
export const SENTRY_DROPPED_BREADCRUMB_CATEGORIES: string[] = ['console'];

// breadcrumb and span fields that hold an address, whatever the value looks like: the SDKs name the
// address of a request or of a navigation differently from one version to the next
export const SENTRY_URL_DATA_KEYS: string[] = [
  'url',
  'from',
  'to',
  'http.url',
  'url.full',
  'http.target',
  'url.path',
];

// the query string and the fragment of a request, when the SDK reports them apart from its address
// (the span attributes of the SDKs follow either the Sentry or the OpenTelemetry names)
export const SENTRY_DROPPED_URL_DATA_KEYS: string[] = [
  'http.query',
  'http.fragment',
  'url.query',
  'url.fragment',
];

// the header that carries the previous page of the visitor, query string included
export const SENTRY_URL_HEADERS: string[] = ['referer', 'referrer'];

// what an error message can quote back from a form or a server answer: an e-mail, a phone number. Spotted
// by shape since the text is free: a run of 8 or more digits, spaces, dots and dashes counts as a phone
export const SENTRY_PERSONAL_DATA_PATTERNS: RegExp[] = [
  /[^\s@]+@[^\s@]+\.[^\s@]+/g,
  /\+?\d[\d\s.-]{6,}\d/g,
];
