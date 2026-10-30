import type { Locale } from '@/types/app.type';

/**
 * Language of every Slack message. The staff workspace is read in French, whoever an alert is
 * about — unlike the e-mail of the same alert, which follows the locale of each recipient.
 */
export const SLACK_ALERT_LOCALE: Locale = 'fr';

/** One icon per kind of alert, so the channel can be scanned at a glance. */
export const SLACK_ALERT_ICONS = {
  urgent: '🚨',
  payment: '💸',
  document: '📄',
  report: '⚠️',
  sms: '📵',
  security: '🔐',
  ticket: '💬',
  job: '⚙️',
  summary: '☀️',
  newUsers: '👤',
} as const;

/*
 * Slack answers a webhook in well under a second: past this, the alert is given up rather than
 * holding the action that raised it (an SOS, a ticket being filed)
 */
export const SLACK_TIMEOUT_MS = 5_000;
