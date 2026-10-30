import type { Locale } from '@/types/app.type';

import { translate } from '@/config/i18n';
import { generateEmailTemplate } from '@/emails';
import { sendEmail } from '@/services/email.service';
import { getClientUrl } from '@/utils/_core/utils';

/**
 * The website page that confirms a newsletter sign-up. The token is random and only its hash is
 * stored, so only the link this server e-mailed to the address can confirm it — proof that the
 * person confirming actually reads that mailbox.
 */
const getNewsletterConfirmationUrl = (token: string, locale: Locale): string => {
  const confirmSegment = translate('routes.confirmNewsletter', locale);

  return `${getClientUrl()}/${locale}/newsletter/${confirmSegment}/${token}`;
};

/**
 * First half of the newsletter double opt-in: asks the owner of the address to confirm they want it.
 * @returns whether the email was accepted by the provider
 */
export const sendNewsletterConfirmationEmail = async (
  email: string,
  token: string,
  locale: Locale
): Promise<boolean> => {
  const data = await sendEmail({
    subject: translate('email.newsletterConfirmationSubject', locale),
    to: [{ email }],
    htmlContent: generateEmailTemplate({
      locale,
      title: translate('email.newsletterConfirmationSubject', locale),
      content: `<p style="margin:0;">${translate('email.newsletterConfirmationMessage', locale)}</p>`,
      buttonUrl: getNewsletterConfirmationUrl(token, locale),
      buttonText: translate('email.newsletterConfirmationButton', locale),
    }),
  });

  return Boolean(data?.messageId || data?.messageIds);
};
