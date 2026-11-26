import type { Locale } from '@/types/app.type';
import type { TargetEnum } from '@shared/types';

import { translate } from '@/config/i18n';
import { getAdminEmailSender } from '@/utils/_core/user.utils';
import { getAppName } from '@/utils/_core/utils';

import { renderCode } from './shared/render-code.template';

export const renderVerificationContent = (
  fullName: string,
  code: string,
  locale: Locale,
  workspace?: TargetEnum
): string => {
  const adminEmail = getAdminEmailSender(workspace) ?? '';

  return `
  <p style="margin:0 0 16px;">${translate('email.hi', locale)} <b>${fullName}</b> !</p>
  <p style="margin:0 0 16px;">${translate('email.thanksForRegistering', locale)} ${getAppName(workspace)}</p>
  <p style="margin:0 0 16px;">${translate('email.finishRegistration', locale)}</p>
  ${renderCode(code, locale)}
  <p style="margin:12px 0 0;">
    ${translate('email.ifAnyProblem', locale)}
    <a href="mailto:${adminEmail}">${adminEmail}</a>
  </p>
`;
};
