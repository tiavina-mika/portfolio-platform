import type { Locale } from '@/types/app.type';
import type { EmailRecipient, ICreateEmailContactResponse, ICreateEmailResponse } from '@/types/email.type';
import type { ChannelSendResult, NotificationChannelRecipient } from '@/types/notification.type';

import { DEFAULT_LANGUAGE, translate } from '@/config/i18n';
import { APP_NAME } from '@/constants/_core/constants';
import { generateEmailTemplate } from '@/emails';
import { renderContactChangeContent } from '@/emails/templates/contact-change.template';
import { renderInvitationContent } from '@/emails/templates/invitation.template';
import { renderNewsletterArticleFooter } from '@/emails/templates/newsletter-article.template';
import { renderResetPasswordContent } from '@/emails/templates/reset-password.template';
import { renderStepUpVerificationContent } from '@/emails/templates/step-up-verification.template';
import { renderVerificationContent } from '@/emails/templates/verification.template';
import { createContactEmail, sendEmail, sendEmailWithResult } from '@/services/email.service';
import { NotificationChannelStatusEnum } from '@/types/notification.type';
import { getChannelRecipientFromResult } from '@/utils/_core/notification.utils';
import { formatFullName, getAdminEmailSender } from '@/utils/_core/user.utils';
import {
  cutHtmlString, getArticleClientUrl, getServerUrl, getTranslatedField, getUnsubscribeNewsletterClientUrl,
} from '@/utils/_core/utils';

import { toEmailRecipient } from './user.utils.cloud';
import { isEmailEnabledForRecipient } from '../../services/_core/notification.service.cloud';

export const isEmailSentResponse = (data: ICreateEmailResponse): boolean =>
  !!(data?.messageId || data?.messageIds);

/**
 * lets callers (currently only the BO "test emails" tool) override the sender for one send —
 * undefined falls through to sendEmail()'s own ADMIN_EMAIL_SENDER default, so every existing
 * production call site keeps sending from the same address it always has
 */
const buildSender = (senderEmail?: string): { email: string; name: string } | undefined =>
  senderEmail ? { email: senderEmail, name: APP_NAME } : undefined;

/**
 * create contact in Brevo
 * see: https://app.brevo.com/contact/list/id/2
 * @param user
 * @returns
 */
type UserObject = { email: string; firstName?: string; lastName: string };
export const createContactToCloud = async (
  user: Parse.User | UserObject,
  id?: string
): Promise<ICreateEmailContactResponse> => {
  const params = {
    email: (user as Parse.User).get ? (user as Parse.User).get('email') : (user as UserObject).email,
    attributes: {
      firstName: (user as Parse.User).get ? (user as Parse.User).get('firstName') : (user as UserObject).firstName,
      lastName: (user as Parse.User).get ? (user as Parse.User).get('lastName') : (user as UserObject).lastName,
    },
  };

  const data = await createContactEmail(params, id);

  return data;
};


export const sendEmailVerification = async (
  recipient: EmailRecipient,
  code: string,
  locale: Locale = DEFAULT_LANGUAGE,
  senderEmail?: string
): Promise<boolean> => {
  const params = {
    subject: translate('email.finishRegistrationSubject', locale),
    to: [{ email: recipient.email, firstName: recipient.firstName, lastName: recipient.lastName }],
    sender: buildSender(senderEmail),
    htmlContent: generateEmailTemplate({
      locale,
      title: translate('email.finishRegistrationSubject', locale),
      content: renderVerificationContent(
        formatFullName(recipient.firstName, recipient.lastName) || recipient.email,
        code,
        locale,
        getAdminEmailSender() ?? ''
      ),
    }),
  };

  const data = await sendEmail(params);

  return isEmailSentResponse(data);
};

// reset password
type SendEmailResetPasswordParams = {
  recipient: EmailRecipient;
  code: string;
  locale: Locale;
  sender?: string;
};
export const sendEmailResetPassword = async ({
  recipient,
  code,
  locale = DEFAULT_LANGUAGE,
  sender,
}: SendEmailResetPasswordParams): Promise<boolean> => {
  const title = translate('email.resetPassword', locale);

  const params = {
    subject: title,
    to: [{ email: recipient.email, firstName: recipient.firstName, lastName: recipient.lastName }],
    sender: buildSender(sender),
    htmlContent: generateEmailTemplate({
      locale,
      title,
      content: renderResetPasswordContent(
        formatFullName(recipient.firstName, recipient.lastName),
        code,
        locale
      ),
    }),
  };

  const data = await sendEmail(params);

  return isEmailSentResponse(data);
};

/**
 * Sends a step-up re-verification code — used to confirm the caller's identity right before a
 * sensitive action (e.g. account deletion), separate from `sendEmailVerification` which is
 * hardcoded to signup wording.
 */
export const sendStepUpVerificationEmail = async (
  recipient: EmailRecipient,
  code: string,
  locale: Locale = DEFAULT_LANGUAGE
): Promise<boolean> => {
  const params = {
    subject: translate('email.stepUpVerificationSubject', locale),
    to: [{ email: recipient.email, firstName: recipient.firstName, lastName: recipient.lastName }],
    htmlContent: generateEmailTemplate({
      locale,
      title: translate('email.stepUpVerificationSubject', locale),
      content: renderStepUpVerificationContent(
        formatFullName(recipient.firstName, recipient.lastName) || recipient.email,
        code,
        locale
      ),
    }),
  };

  const data = await sendEmail(params);

  return isEmailSentResponse(data);
};

/**
 * Sends the code confirming a new login email, to that new address — receiving it there is the
 * proof the member owns it before it replaces the current one.
 */
export const sendContactChangeVerificationEmail = async (
  recipient: EmailRecipient,
  code: string,
  locale: Locale = DEFAULT_LANGUAGE
): Promise<boolean> => {
  const params = {
    subject: translate('email.confirmNewEmailSubject', locale),
    to: [{ email: recipient.email, firstName: recipient.firstName, lastName: recipient.lastName }],
    htmlContent: generateEmailTemplate({
      locale,
      title: translate('email.confirmNewEmailSubject', locale),
      content: renderContactChangeContent(
        formatFullName(recipient.firstName, recipient.lastName) || recipient.email,
        code,
        locale
      ),
    }),
  };

  const data = await sendEmail(params);

  return isEmailSentResponse(data);
};

// BO admin invitation
type SendInvitationEmailParams = {
  email: string;
  inviterName: string;
  token: string;
  locale: Locale;
  sender?: string;
  roleLabel?: string;
};
export const sendInvitationEmail = async ({
  email,
  inviterName,
  token,
  locale = DEFAULT_LANGUAGE,
  sender,
  roleLabel,
}: SendInvitationEmailParams): Promise<boolean> => {
  const title = translate('email.invitationSubject', locale);

  const params = {
    subject: title,
    to: [{ email }],
    sender: buildSender(sender),
    htmlContent: generateEmailTemplate({
      locale,
      title,
      content: renderInvitationContent(inviterName, locale, roleLabel),
      buttonUrl: `${getServerUrl()}/invite?token=${token}`,
      buttonText: translate('email.acceptInvitation', locale),
    }),
  };

  const data = await sendEmail(params);

  return isEmailSentResponse(data);
};

/*
 * `locale` is the recipient's language, used for the template around the message (greeting,
 * footer): without it the frame stayed French around an English or Malagasy body
 */
type EmailContent = {
  subject: string;
  message: string;
  sender?: string;
  locale?: Locale;
  /** shown above the message in the frame; a notification repeats its subject there */
  title?: string;
  /** a highlighted line for alerts that only the team receives */
  alert?: string;
  buttonUrl?: string;
  buttonText?: string;
};

/** What a notification e-mail is built from — the subject doubles as the title unless told otherwise */
export type NotificationEmail = Pick<EmailContent, 'subject' | 'message' | 'title' | 'alert' | 'buttonUrl' | 'buttonText'>;

/**
 * Sends an e-mail to one recipient and says why it did not go out when it did not — Brevo's own code
 * and wording, which a notification keeps on the recipient it failed for.
 */
export const sendEmailToRecipientWithResult = async (
  recipient: EmailRecipient,
  values: EmailContent
): Promise<ChannelSendResult> => {
  /*
   * a member who signed up by phone has no address: Brevo used to be called with an empty one, which
   * wasted a request and was logged — and counted — as a refusal
   */
  if (!recipient.email?.trim()) {
    return { isSent: false, skippedStatus: NotificationChannelStatusEnum.EMAIL_NO_ADDRESS };
  }

  const params = {
    subject: values.subject,
    to: [{ email: recipient.email, firstName: recipient.firstName, lastName: recipient.lastName }],
    sender: buildSender(values.sender),
    htmlContent: generateEmailTemplate({
      ...(values.locale && { locale: values.locale }),
      title: values.title,
      alert: values.alert,
      content: values.message,
      buttonUrl: values.buttonUrl,
      buttonText: values.buttonText,
    }),
  };

  const { data, errorCode, errorMessage } = await sendEmailWithResult(params);

  return { isSent: isEmailSentResponse(data), errorCode, errorMessage };
};

export const sendEmailToRecipient = async (
  recipient: EmailRecipient,
  values: EmailContent
): Promise<boolean> => (await sendEmailToRecipientWithResult(recipient, values)).isSent;

export const sendEmailToUserWithResult = async (
  user: Parse.User,
  values: Omit<EmailContent, 'sender'>
): Promise<ChannelSendResult> => sendEmailToRecipientWithResult(toEmailRecipient(user), {
  ...values,
  locale: values.locale ?? user.get('locale'),
});

export const sendEmailToUser = async (
  user: Parse.User,
  values: Omit<EmailContent, 'sender'>
): Promise<boolean> => (await sendEmailToUserWithResult(user, values)).isSent;

/**
 * Sends a notification's email to each of its recipients and reports every one of them
 * individually, since the same send can reach one and fail on the next — an aggregated result
 * would let a notification claim a whole audience was reached because one of them was.
 * A recipient who turned this notification type off is reported as such and never written to,
 * and the body is built per recipient so each one is written in their own locale.
 * A recipient with no address on file (signed up by phone) is reported `no_email`: Brevo used to be
 * called with an empty address, and the refusal was counted — and offered for resend — as a failure.
 */
export const sendNotificationEmailToUsers = async (
  recipients: Parse.User[],
  notificationType: string,
  buildEmail: (locale: Locale) => NotificationEmail,
  // decides whether this send is a sanction or a security alert, which ignores the preferences
  notificationStatus?: string
): Promise<NotificationChannelRecipient[]> => {
  return Promise.all(
    recipients.map(async (recipient) => {
      if (!(await isEmailEnabledForRecipient(recipient, notificationType, notificationStatus))) {
        return { toId: recipient.id, status: NotificationChannelStatusEnum.EMAIL_DISABLED_BY_USER };
      }

      if (!recipient.get('email')) {
        return { toId: recipient.id, status: NotificationChannelStatusEnum.EMAIL_NO_ADDRESS };
      }

      const locale = (recipient.get('locale') ?? DEFAULT_LANGUAGE) as Locale;
      const email = buildEmail(locale);
      const result = await sendEmailToUserWithResult(recipient, {
        ...email,
        title: email.title ?? email.subject,
        locale,
      });

      return getChannelRecipientFromResult(recipient.id, result);
    })
  );
};

/**
 * Sends an operational e-mail to a group of staff accounts — an SOS alert, a reporting threshold —
 * each one written in the language that account chose.
 *
 * The body used to be built once, from the locale of whoever triggered the event: a member raising
 * an SOS in Malagasy mailed every support agent in Malagasy, and a French-speaking agent read an
 * urgent alert in a language they may not have. It is not a notification either — no preference
 * gates it and nothing is recorded on a notification row — which is why it does not go through
 * `sendNotificationEmailToUsers`: staff cannot opt out of the alerts their job is to answer.
 *
 * Every send is awaited but none can fail the group: one bad address must not keep the other agents
 * from being alerted, so a refusal is reported back rather than thrown.
 * @returns the recipients the provider refused, so the caller can log who was not reached
 */
export const sendEmailToStaffInTheirOwnLocale = async (
  recipients: Parse.User[],
  buildEmail: (locale: Locale) => NotificationEmail
): Promise<{ recipient: Parse.User; error: unknown }[]> => {
  const results = await Promise.allSettled(recipients.map((recipient) => {
    const locale = (recipient.get('locale') ?? DEFAULT_LANGUAGE) as Locale;

    const email = buildEmail(locale);

    return sendEmailToUser(recipient, { ...email, title: email.title ?? email.subject, locale });
  }));

  return results.flatMap((result, index) => (
    result.status === 'rejected'
      ? [{ recipient: recipients[index]!, error: result.reason }]
      : []
  ));
};

export const sendNewsletterUnsubscribeConfirmationEmail = async (
  email: string,
  locale: Locale = DEFAULT_LANGUAGE
): Promise<boolean> => {
  const params = {
    subject: translate('email.newsletterUnsubscribeConfirmationSubject', locale),
    to: [{ email }],
    htmlContent: generateEmailTemplate({
      locale,
      content: translate('email.newsletterUnsubscribeConfirmationMessage', locale),
    }),
  };

  const data = await sendEmail(params);

  return isEmailSentResponse(data);
};

/**
 * send translated article to newsletter emails
 * @param email
 * @param article
 * @param locale
 * @returns
 */
export const sendArticleToNewsletterEmails = async (
  email: string,
  article: Parse.Object,
  locale = DEFAULT_LANGUAGE,
  senderEmail?: string
): Promise<boolean> => {
  const translated = article.get('translated');
  const title = getTranslatedField(translated, locale, 'title');
  const unsubscribeLink = getUnsubscribeNewsletterClientUrl(email, locale);
  const content = cutHtmlString(getTranslatedField(translated, locale, 'content'));

  const params = {
    subject: title,
    to: [{ email }],
    sender: buildSender(senderEmail),
    htmlContent: generateEmailTemplate({
      locale,
      title,
      content,
      buttonUrl: getArticleClientUrl(translated, locale),
      buttonText: translate('article.readTheArticle', locale),
      footer: renderNewsletterArticleFooter(unsubscribeLink, locale),
      cardStyle: 'max-width: 100%',
    }),
  };

  const data = await sendEmail(params);

  return isEmailSentResponse(data);
};
