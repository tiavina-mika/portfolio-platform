import type { Locale } from '@/types/app.type';

import { translate } from '@/config/i18n';
import { EMAIL_COLORS } from '@/emails/theme';

const { light } = EMAIL_COLORS;

/**
 * The verification code, spaced out by CSS only: the digits stay one contiguous string, so a long
 * press selects the whole code and a screen reader reads it as one number.
 */
export const renderCode = (code: string, locale: Locale): string => `
  <div class="em-code" style="margin:24px 0 10px;padding:20px 16px 20px calc(16px + .32em);
    background-color:${light.codeBg};border-radius:16px;text-align:center;
    font:700 34px/1 'Courier New', Courier, monospace;letter-spacing:.32em;color:${light.text};">${code}</div>
  <p class="em-muted" style="margin:0 0 16px;font:400 14px/1.5 Onest, Arial, Helvetica, sans-serif;
    color:${light.muted};">${translate('email.codeDuration', locale)}</p>
`;
