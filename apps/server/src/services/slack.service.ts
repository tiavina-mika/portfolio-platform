import { create, type AxiosError, type AxiosInstance } from 'axios';

import { SLACK_TIMEOUT_MS } from '@/constants/_core/slack.constants';
import { logger } from '@/utils/_core/logger';

// ─── Singleton client ────────────────────────────────────────────────────────

let _client: AxiosInstance | null = null;

const getSlackClient = (): AxiosInstance => {
  if (!_client) {
    _client = create({ timeout: SLACK_TIMEOUT_MS });
  }
  return _client;
};

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Whether this environment has a Slack alert channel. Locally, in tests and in an environment with
 * no channel the variable is empty and every alert is skipped — so a caller with work of its own to
 * do before posting (counting the figures of a summary) can skip that work too.
 */
export const isSlackAlertEnabled = (): boolean => !!process.env.SLACK_ALERTS_WEBHOOK_URL;

/**
 * Posts a message to the staff alert channel through its incoming webhook
 * (`SLACK_ALERTS_WEBHOOK_URL`). Never throws: Slack is a second channel next to the e-mail, and an
 * outage on its side must neither fail nor hold the action that raised the alert.
 *
 * The webhook URL is never logged: anyone who has it can write to the channel.
 * @returns whether Slack accepted the message
 */
export const postSlackAlert = async (text: string): Promise<boolean> => {
  const webhookUrl = process.env.SLACK_ALERTS_WEBHOOK_URL;

  if (!webhookUrl) return false;

  try {
    // links stay links: an unfurled back-office page would only show the login screen
    await getSlackClient().post(webhookUrl, { text, unfurl_links: false, unfurl_media: false });
    return true;
  }
  catch (error: unknown) {
    logger.warn('Slack alert failed', {
      status: (error as AxiosError).response?.status,
      error: (error as Error).message,
    });
    return false;
  }
};
