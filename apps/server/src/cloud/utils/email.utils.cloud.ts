
import type { Locale } from '@/types/app.type';
import type { ICreateEmailContactResponse, ICreateEmailResponse, ISendEmail } from '@/types/email.type';

import { generateEmailTemplate } from '@/config/emails';
import { DEFAULT_LANGUAGE, translate } from '@/config/i18next';
import { createContactEmail, sendEmail } from '@/services/email.service';
import { ADMIN_EMAIL_SENDER, APP_NAME } from '@/utils/constants';
import {
  cutHtmlString, getArticleClientUrl, getTranslatedField, getUnsubscribeNewsletterClientUrl,
} from '@/utils/util';

import { getUserFullName } from './user.utils.cloud';

const isEmailSentResponse = (data: ICreateEmailResponse): boolean =>
  !!(data?.body.messageId || data?.body.messageIds);

const renderCode = (code: string, locale: Locale) => {
  return `
    <p style="
      background-color: #f2f2f2; 
      padding: 16px;
      margin-top: 48px; 
      margin-bottom: 24px;
      font-size: 28px; 
      font-weight: 700; 
      text-align: center; 
      letter-spacing: 0.4em
    ">
      ${code}
    </p>
    <p style="font-size: 12px;">
      ${translate('email.codeDuration', locale)}
    </p>
  `;
};

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
  user: Parse.User,
  code: string,
  locale: Locale = DEFAULT_LANGUAGE
): Promise<boolean> => {
  const params = {
    subject: translate('email.finishRegistrationSubject', locale),
    to: [{ email: user.get('email'), firstName: user.get('firstName'), lastName: user.get('lastName') }],
    htmlContent: generateEmailTemplate({
      locale,
      content: `
          <p>${translate('email.hi', locale)} <b>${getUserFullName(user)}</b>!</p>
          <p style="margin-bottom: 32px;">${translate('email.thanksForRegistering', locale)} ${APP_NAME}</p>
          <p>${translate('email.finishRegistration', locale)}</p>
          ${renderCode(code, locale)}
          <p style="margin-top:36px;">
            ${translate('email.ifAnyProblem', locale)}
            <a href="mailto:${ADMIN_EMAIL_SENDER}">${ADMIN_EMAIL_SENDER}</a>
          </p>
      `,
    }),
  };

  const data = await sendEmail(params as ISendEmail);

  return isEmailSentResponse(data);
};

// reset password
type SendEmailResetPasswordParams = {
  user: Parse.User;
  code: string;
  locale: Locale;
};
export const sendEmailResetPassword = async ({
  user,
  code,
  locale = DEFAULT_LANGUAGE,
}: SendEmailResetPasswordParams): Promise<boolean> => {
  const title = translate('email.resetPassword', locale);

  const params = {
    subject: title,
    to: [{ email: user.get('email'), firstName: user.get('firstName'), lastName: user.get('lastName') }],
    htmlContent: generateEmailTemplate({
      locale,
      title,
      content: `
          <p>${translate('email.hi', locale)} <b>${getUserFullName(user)}</b>!</p>
          <p>${translate('email.requestYourPassword', locale)}</p>
          <p>${translate('email.enterCode', locale)}</p>
          ${renderCode(code, locale)}
      `,
    }),
  };

  const data = await sendEmail(params);

  return isEmailSentResponse(data);
};

export const sendEmailToUser = async (
  user: Parse.User,
  values: { subject: string; message: string }
): Promise<boolean> => {
  const params = {
    subject: values.subject,
    to: [{ email: user.get('email'), firstName: user.get('firstName'), lastName: user.get('lastName') }],
    htmlContent: generateEmailTemplate({
      content: values.message,
    }),
  };

  const data = await sendEmail(params as ISendEmail);

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
  locale = DEFAULT_LANGUAGE
): Promise<boolean> => {
  const translated = article.get('translated');
  const title = getTranslatedField(translated, locale, 'title');
  const unsubscribeLink = getUnsubscribeNewsletterClientUrl(email, locale);
  const content = cutHtmlString(getTranslatedField(translated, locale, 'content'));

  const params = {
    subject: title,
    to: [{ email }],
    htmlContent: generateEmailTemplate({
      locale,
      title,
      content,
      buttonUrl: getArticleClientUrl(translated, locale),
      buttonText: translate('article.readTheArticle', locale),
      footer: `
        ${translate('clickHereIfYouWantTo', locale)}
        <a href="${unsubscribeLink}" alt="">
          ${translate('unsubscribe', locale)}
        </a>
        ${translate('fromOurNewsletter', locale)}
      `,
      cardStyle: 'max-width: 100%',
    }),
  };

  const data = await sendEmail(params as ISendEmail);

  return isEmailSentResponse(data);
};
