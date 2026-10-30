import {
  SENTRY_DROPPED_BREADCRUMB_CATEGORIES,
  SENTRY_DROPPED_URL_DATA_KEYS,
  SENTRY_ENVIRONMENTS,
  SENTRY_PERSONAL_DATA_PATTERNS,
  SENTRY_REDACTED_HEADERS,
  SENTRY_REDACTED_VALUE,
  SENTRY_URL_DATA_KEYS,
  SENTRY_URL_HEADERS,
} from '@shared/constants';

export type SentryEnvironment = (typeof SENTRY_ENVIRONMENTS)[number];

type SentryBreadcrumbLike = {
  category?: string;
  message?: string;
  data?: Record<string, unknown>;
};

type SentrySpanLike = {
  description?: string;
  data?: Record<string, unknown>;
};

// the part of a Sentry event that can hold personal data, so both SDKs' event types fit it
type SentryEventLike = {
  user?: { id?: string | number };
  breadcrumbs?: SentryBreadcrumbLike[];
  // the name of a transaction is the page or route it ran on
  transaction?: string;
  // the text of an error: it can quote an e-mail or a phone number back
  message?: string;
  exception?: { values?: { value?: string }[] };
  logentry?: { message?: string; formatted?: string; params?: unknown };
  spans?: SentrySpanLike[];
  request?: {
    url?: string;
    headers?: Record<string, string>;
    cookies?: unknown;
    data?: unknown;
    query_string?: unknown;
  };
};

/**
 * The Sentry environment named by a build variable, or `undefined` when this build must not report
 * (anything that is not preproduction or production).
 */
export const getSentryEnvironment = (value?: string): SentryEnvironment | undefined => {
  return SENTRY_ENVIRONMENTS.find((environment) => environment === value);
};

/**
 * An address without its query string and its fragment: a filter typed in a page (a phone number, an
 * e-mail) travels in the first, a route parameter in the second.
 */
export const stripUrlDetails = (url: string): string => url.split(/[?#]/)[0] ?? url;

/** A text with every e-mail and phone number replaced by the redacted marker. */
export const redactPersonalData = (text: string): string => SENTRY_PERSONAL_DATA_PATTERNS.reduce(
  (redacted, pattern) => redacted.replace(pattern, SENTRY_REDACTED_VALUE),
  text
);

/** Redacts every text found in a value, however deep (a nested object, an array of params). */
const redactDeep = (value: unknown): unknown => {
  if (typeof value === 'string') return redactPersonalData(value);
  if (Array.isArray(value)) return value.map(redactDeep);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, redactDeep(entry)]));
  }

  return value;
};

const URL_START =/^([a-z][a-z0-9+.-]*:)?[/][/]/i;

// what a relative address can start with: a path, a query string alone, a fragment alone
const RELATIVE_URL_STARTS = ['/', '?', '#', './', '../'];

// an absolute address ("https://…", "//host/…") or a relative one ("/users?…", "?q=1", "#top"), once
// the spaces around it are set aside
const looksLikeUrl = (value: string): boolean => {
  const trimmed = value.trim();

  return URL_START.test(trimmed) || RELATIVE_URL_STARTS.some((start) => trimmed.startsWith(start));
};

// a value is cleaned when its key is known to hold an address, and also when it looks like one under any
// other key: the first rule alone misses a new name, the second alone misses a relative address
const scrubUrlData = (data: Record<string, unknown>): Record<string, unknown> => Object.fromEntries(
  Object.entries(data)
    .filter(([key]) => !SENTRY_DROPPED_URL_DATA_KEYS.includes(key))
    .map(([key, value]) => {
      if (typeof value !== 'string') return [key, redactDeep(value)];

      const cleaned = SENTRY_URL_DATA_KEYS.includes(key) || looksLikeUrl(value) ? stripUrlDetails(value) : value;

      // any text can quote an e-mail or a phone number back, whatever its key
      return [key, redactPersonalData(cleaned)];
    })
);

/**
 * Cleans one breadcrumb: the console ones are dropped (`null`), the addresses of the others lose
 * their query string. Returns a new breadcrumb, the input is left untouched.
 */
export const scrubSentryBreadcrumb = <T extends SentryBreadcrumbLike>(breadcrumb: T): T | null => {
  if (breadcrumb.category && SENTRY_DROPPED_BREADCRUMB_CATEGORIES.includes(breadcrumb.category)) {
    return null;
  }

  return {
    ...breadcrumb,
    ...(breadcrumb.message && { message: redactPersonalData(breadcrumb.message) }),
    ...(breadcrumb.data && { data: scrubUrlData(breadcrumb.data) }),
  };
};

/**
 * Strips what must not leave the device or the browser: the user keeps only its `objectId`, the
 * secret headers are redacted, the request body, cookies and query string are dropped (a form
 * value can be a phone number or an e-mail), the message of an error loses the e-mails and phone numbers
 * it quotes, and the addresses of the request, the transaction, its
 * spans and the breadcrumbs lose their query string. Works on errors and on transactions. Returns a
 * new event, the input is left untouched.
 */
export const scrubSentryEvent = <T extends SentryEventLike>(event: T): T => {
  const scrubbed = { ...event };

  if (event.user) {
    scrubbed.user = event.user.id ? { id: event.user.id } : undefined;
  }

  if (event.request) {
    const kept = Object.fromEntries(
      Object.entries(event.request).filter(([field]) => !DROPPED_REQUEST_FIELDS.includes(field))
    );

    scrubbed.request = {
      ...kept,
      ...(event.request.headers && { headers: redactHeaders(event.request.headers) }),
      ...(event.request.url && { url: stripUrlDetails(event.request.url) }),
    };
  }

  if (event.transaction) {
    scrubbed.transaction = stripUrlDetails(event.transaction);
  }

  if (event.message) {
    scrubbed.message = redactPersonalData(event.message);
  }

  if (event.logentry) {
    scrubbed.logentry = {
      ...event.logentry,
      ...(event.logentry.message && { message: redactPersonalData(event.logentry.message) }),
      ...(event.logentry.formatted && { formatted: redactPersonalData(event.logentry.formatted) }),
      ...(event.logentry.params !== undefined && { params: redactDeep(event.logentry.params) }),
    };
  }

  if (event.exception?.values) {
    scrubbed.exception = {
      ...event.exception,
      values: event.exception.values.map((exception) => ({
        ...exception,
        ...(exception.value && { value: redactPersonalData(exception.value) }),
      })),
    };
  }

  if (event.breadcrumbs) {
    scrubbed.breadcrumbs = event.breadcrumbs.flatMap((breadcrumb) => {
      const cleaned = scrubSentryBreadcrumb(breadcrumb);

      return cleaned ? [cleaned] : [];
    });
  }

  if (event.spans) {
    scrubbed.spans = event.spans.map((span) => ({
      ...span,
      ...(span.description && { description: stripUrlDetails(span.description) }),
      ...(span.data && { data: scrubUrlData(span.data) }),
    }));
  }

  return scrubbed;
};

// can hold form values (a phone number, an e-mail) or a session
const DROPPED_REQUEST_FIELDS = ['cookies', 'data', 'query_string'];

const redactHeaders = (headers: Record<string, string>): Record<string, string> => {
  const redacted = new Set<string>(SENTRY_REDACTED_HEADERS);

  return Object.fromEntries(
    Object.entries(headers).map(([name, value]) => {
      const lowerName = name.toLowerCase();

      if (redacted.has(lowerName)) return [name, SENTRY_REDACTED_VALUE];
      // the previous page of the visitor: kept for the debugging, without its query string
      if (SENTRY_URL_HEADERS.includes(lowerName)) return [name, stripUrlDetails(value)];

      return [name, value];
    })
  );
};
