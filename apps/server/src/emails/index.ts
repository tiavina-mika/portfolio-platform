import type { Locale } from '@/types/app.type';

import { translate } from '@/config/i18n';
import { APP_NAME } from '@/constants/_core/constants';
import { getClientUrl, getLogoUrl } from '@/utils/_core/utils';

import { EMAIL_COLORS } from './theme';

const { light, dark } = EMAIL_COLORS;
const FONT_FAMILY = 'Onest, Arial, Helvetica, sans-serif';

/*
 * The inline styles carry the light theme, which is what every mail client renders. Clients that
 * understand `prefers-color-scheme` get the dark palette through the classes below, hence the
 * `!important`: it has to beat the inline value.
 */
const styles = `
  <style type="text/css">
    :root { color-scheme: light dark; supported-color-schemes: light dark; }
    body { margin: 0; padding: 0; }
    a { color: ${light.link}; }
    @media only screen and (max-width: 600px) {
      .em-page { padding: 24px 12px !important; }
      .em-card { padding: 20px !important; }
      .em-code { font-size: 28px !important; }
      .em-image { height: 160px !important; }
    }
    @media (prefers-color-scheme: dark) {
      .em-page { background-color: ${dark.bg} !important; }
      .em-card { background-color: ${dark.card} !important; border-color: ${dark.cardBorder} !important; }
      .em-text { color: ${dark.text} !important; }
      .em-muted { color: ${dark.muted} !important; }
      .em-link, .em-card a, .em-footer a { color: ${dark.link} !important; }
      .em-button { background-color: ${dark.button} !important; }
      .em-code { background-color: ${dark.codeBg} !important; color: ${dark.text} !important; }
      .em-quote { background-color: ${dark.quoteBg} !important; color: ${dark.muted} !important; }
      .em-warn { background-color: ${dark.warnBg} !important; }
      .em-dot { background-color: ${dark.dot} !important; }
      .em-dots { border-top-color: ${dark.dots} !important; }
      .em-logo { filter: brightness(0) invert(1); }
    }
  </style>
`;

type EmailTemplateProps = {
  title?: string;
  /** a highlighted line above the content, for an alert meant for the team rather than a member */
  alert?: string;
  content: string;
  buttonUrl?: string;
  buttonText?: string;
  /** small centered text under the card — the unsubscribe line of a newsletter */
  footer?: string;
  cardStyle?: string;
  locale?: Locale;
};

const renderAlert = (alert: string): string => `
  <div class="em-warn" style="margin:0 0 16px;padding:10px 14px;border-radius:12px;
    background-color:${light.warnBg};font:700 14px ${FONT_FAMILY};color:#12211a;">
    <span aria-hidden="true" style="display:inline-block;width:22px;height:22px;border-radius:50%;
      background-color:${light.alertBadge};color:#fff8f2;text-align:center;line-height:22px;font-weight:800;
      font-size:13px;margin-right:10px;">!</span>${alert}
  </div>
`;

const renderButton = (buttonUrl: string, buttonText?: string): string => `
  <tr>
    <td style="padding-top:28px;">
      <a class="em-button" href="${buttonUrl}" style="display:inline-block;background-color:${light.button};
        color:#12211a;font:700 16px/1 ${FONT_FAMILY};padding:16px 28px;border-radius:12px;
        text-decoration:none;min-height:48px;">${buttonText ?? ''}</a>
    </td>
  </tr>
`;

export const generateEmailTemplate = ({
  title,
  alert,
  content,
  buttonUrl,
  cardStyle,
  buttonText,
  footer,
  locale,
}: EmailTemplateProps): string => `
  ${styles}
  <div class="em-page" style="background-color:${light.bg};padding:32px 16px;font-family:${FONT_FAMILY};">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center"
      style="width:100%;max-width:568px;margin:0 auto;">
      <tr>
        <td style="padding-bottom:24px;">
          <a href="${getClientUrl()}" aria-label="${APP_NAME}">
            <img class="em-logo" alt="${APP_NAME}" src="${getLogoUrl()}" height="48"
              style="display:block;height:48px;width:auto;border:0;" />
          </a>
        </td>
      </tr>
      <tr>
        <td class="em-card" style="background-color:${light.card};border:1px solid ${light.cardBorder};
          border-radius:20px;padding:32px;${cardStyle ?? ''}">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="width:100%;">
            ${title ? `
            <tr>
              <td>
                <h1 class="em-text" style="margin:0 0 16px;font:800 26px/1.2 ${FONT_FAMILY};
                  letter-spacing:-.02em;color:${light.text};">${title}</h1>
              </td>
            </tr>` : ''}
            <tr>
              <td class="em-text" style="font:400 16px/1.6 ${FONT_FAMILY};color:${light.text};">
                ${alert ? renderAlert(alert) : ''}
                ${content}
              </td>
            </tr>
            ${buttonUrl ? renderButton(buttonUrl, buttonText) : ''}
          </table>
        </td>
      </tr>
      ${footer ? `
      <tr>
        <td class="em-muted em-footer" style="padding-top:20px;font:400 13px/1.5 ${FONT_FAMILY};
          color:${light.muted};text-align:center;">${footer}</td>
      </tr>` : ''}
      <tr>
        <td align="center" style="padding-top:28px;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="width:140px;">
            <tr>
              <td class="em-dot" style="width:8px;height:8px;border-radius:50%;background-color:${light.dot};
                font-size:0;line-height:0;">&nbsp;</td>
              <td class="em-dots" style="border-top:2px dotted ${light.dots};font-size:0;
                line-height:0;">&nbsp;</td>
              <td class="em-dot" style="width:8px;height:8px;border-radius:50%;background-color:${light.dot};
                font-size:0;line-height:0;">&nbsp;</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td class="em-footer" align="center" style="padding-top:16px;font:600 14px/1.5 ${FONT_FAMILY};
          text-align:center;">
          <a href="${getClientUrl()}/${locale ?? ''}/contact" style="display:inline-block;padding:12px 8px;
            color:${light.link};text-decoration:underline;">${translate('email.contact', locale)}</a>
          ·
          <a href="${getClientUrl()}" style="display:inline-block;padding:12px 8px;color:${light.link};
            text-decoration:underline;">${APP_NAME}</a>
        </td>
      </tr>
      <tr>
        <td class="em-muted" align="center" style="font:400 12px/1.5 ${FONT_FAMILY};color:${light.muted};
          text-align:center;">
          © ${new Date().getFullYear()}. ${APP_NAME} ${translate('email.allRightsReserved', locale)}
        </td>
      </tr>
    </table>
  </div>
`;
