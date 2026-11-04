import type { Locale } from '@/types/app.type';

import { translate } from '@/config/i18n';
import { APP_NAME } from '@/constants/_core/constants';

import { renderCode } from './shared/render-code.template';

export const renderVerificationContent = (
  fullName: string,
  code: string,
  locale: Locale,
  adminEmail: string
): string => `
  <p style="margin:0 0 16px;">${translate('email.hi', locale)} <b>${fullName}</b> !</p>
  <p style="margin:0 0 16px;">${translate('email.thanksForRegistering', locale)} ${APP_NAME}</p>
  <p style="margin:0 0 16px;">${translate('email.finishRegistration', locale)}</p>
  ${renderCode(code, locale)}
  <p style="margin:12px 0 0;">
    ${translate('email.ifAnyProblem', locale)}
    <a href="mailto:${adminEmail}">${adminEmail}</a>
  </p>
`;
