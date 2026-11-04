import type { Locale } from '@/types/app.type';

import { translate } from '@/config/i18n';

export const renderNewsletterArticleFooter = (unsubscribeLink: string, locale: Locale): string => `
  ${translate('clickHereIfYouWantTo', locale)}
  <a href="${unsubscribeLink}" style="text-decoration:underline;">
    ${translate('unsubscribe', locale)}
  </a>
  ${translate('fromOurNewsletter', locale)}
`;
