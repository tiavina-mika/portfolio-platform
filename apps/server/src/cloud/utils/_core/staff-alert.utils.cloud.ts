import type { Locale } from '@/types/app.type';

import { translate } from '@/config/i18n';
import { SLACK_ALERT_ICONS, SLACK_ALERT_LOCALE } from '@/constants/_core/slack.constants';
import { TICKET_BO_PATH } from '@/constants/_core/ticket.constants';
import { postSlackAlert } from '@/services/slack.service';
import { TicketSourceEnum } from '@/types/ticket.type';
import { buildSlackAlertText } from '@/utils/_core/slack.utils';
import { getServerUrl } from '@/utils/_core/utils';

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

// a report opened from a ride carries its `report`; the other tickets say where they were written
const getNewTicketTitle = (ticket: Parse.Object): string => {
  const options = { reference: String(ticket.get('reference') ?? '') };

  if (ticket.get('report')) return translate('slack.newReportTicket', SLACK_ALERT_LOCALE, options);
  if (ticket.get('source') === TicketSourceEnum.APP) {
    return translate('slack.newTicketFromApp', SLACK_ALERT_LOCALE, options);
  }
  return translate('slack.newTicketFromWeb', SLACK_ALERT_LOCALE, options);
};

/**
 * Tells the Slack alert channel that a member wrote to support, so a new request is seen without
 * opening the back-office. Slack only: support works the queue from the back-office, there is no
 * e-mail to send. An SOS is left out — it raises its own, louder alert — and the message never
 * quotes what the member wrote.
 */
export const alertSlackOfNewTicket = async (ticket: Parse.Object): Promise<void> => {
  if (ticket.get('source') === TicketSourceEnum.SOS) return;

  await postSlackAlert(buildSlackAlertText({
    icon: ticket.get('report') ? SLACK_ALERT_ICONS.report : SLACK_ALERT_ICONS.ticket,
    title: getNewTicketTitle(ticket),
    link: buildBackOfficeLink(`${getServerUrl()}/${TICKET_BO_PATH}/${ticket.id}`),
  }));
};
