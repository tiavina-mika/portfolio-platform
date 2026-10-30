import type { Locale } from '@/types/app.type';

import { translate } from '@/config/i18n';

import { renderCode } from './shared/render-code.template';
import { renderNote } from './shared/render-note.template';

export const renderContactChangeContent = (
  fullName: string,
  code: string,
  locale: Locale
): string => `
  <p style="margin:0 0 16px;">${translate('email.hi', locale)} <b>${fullName}</b> !</p>
  <p style="margin:0 0 16px;">${translate('email.confirmNewEmail', locale)}</p>
  ${renderCode(code, locale)}
  ${renderNote(translate('email.confirmNewEmailIgnore', locale))}
`;
