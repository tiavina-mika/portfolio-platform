import type { Locale } from '@/types/app.type';

import { translate } from '@/config/i18n';
import { SLACK_ALERT_LOCALE } from '@/constants/_core/slack.constants';
import { postSlackAlert } from '@/services/slack.service';
import { buildSlackAlertText } from '@/utils/_core/slack.utils';

import { type NotificationEmail, sendEmailToStaffInTheirOwnLocale } from './email.utils.cloud';

export type StaffSlackAlert = {
  icon: string;
  /**
   * one line under the title. Never a phone number, an address or a full name: every staff member
   * reads the channel, whereas the e-mail only reaches the roles the alert is meant for
   */
  details?: string;
  /** the back-office page the alert is handled from */
  url?: string;
};

const buildBackOfficeLink = (url: string): { url: string; label: string } => ({
  url,
  label: translate('slack.openInBackOffice', SLACK_ALERT_LOCALE),
});

/**
 * Warns the staff of something a person has to look at: an e-mail to each recipient in their own
 * language, and one message in the Slack alert channel, titled with the subject the e-mail has in
 * the workspace's language. Both leave together.
 *
 * Slack never fails the alert: without a channel it is skipped, and a refusal is only logged — the
 * e-mail is still the channel of record.
 * @returns the e-mails that could not be sent, for the caller to log
 */
export const alertStaff = async (
  recipients: Parse.User[],
  buildEmail: (locale: Locale) => NotificationEmail,
  slack: StaffSlackAlert
): Promise<{ recipient: Parse.User; error: unknown }[]> => {
  const [failures] = await Promise.all([
    sendEmailToStaffInTheirOwnLocale(recipients, buildEmail),
    postSlackAlert(buildSlackAlertText({
      icon: slack.icon,
      title: buildEmail(SLACK_ALERT_LOCALE).subject,
      details: slack.details,
      link: slack.url ? buildBackOfficeLink(slack.url) : undefined,
    })),
  ]);

  return failures;
};
