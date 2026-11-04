import type { Locale } from '@/types/app.type';

import { translate } from '@/config/i18n';

export const renderInvitationContent = (
  inviterName: string,
  locale: Locale,
  roleLabel?: string
): string => `
  <p style="margin:0 0 16px;">${translate('email.hi', locale)}</p>
  <p style="margin:0;">${roleLabel
    ? translate('email.invitationMessageWithRole', locale, { inviterName, role: roleLabel })
    : translate('email.invitationMessage', locale, { inviterName })}</p>
`;
