import type { Locale } from '@/types/app.type';

import { translate } from '@/config/i18n';

import { renderCode } from './shared/render-code.template';

export const renderResetPasswordContent = (
  fullName: string,
  code: string,
  locale: Locale
): string => `
  <p style="margin:0 0 16px;">${translate('email.hi', locale)} <b>${fullName}</b> !</p>
  <p style="margin:0 0 16px;">${translate('email.requestYourPassword', locale)}</p>
  <p style="margin:0 0 16px;">${translate('email.enterCode', locale)}</p>
  ${renderCode(code, locale)}
`;
