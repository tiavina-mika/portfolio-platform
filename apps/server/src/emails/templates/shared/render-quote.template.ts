import { EMAIL_COLORS } from '@/emails/theme';

const { light } = EMAIL_COLORS;

/** What the person wrote, quoted back under a small caps label — `htmlBody` must already be escaped */
export const renderQuote = (label: string, htmlBody: string): string => `
  <div class="em-quote" style="margin:20px 0;padding:14px 16px;border-radius:12px;
    background-color:${light.quoteBg};color:${light.muted};
    font:400 14px/1.55 Onest, Arial, Helvetica, sans-serif;">
    <div style="margin:0 0 6px;font:500 11px/1.4 'Courier New', Courier, monospace;letter-spacing:.06em;
      text-transform:uppercase;">${label}</div>
    ${htmlBody}
  </div>
`;
