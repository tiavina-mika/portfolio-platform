import { getCachedPagesForUrls } from '@/app/[locale]/layout';
import { Locale } from '@/i18n/config';
import { ISelectOption } from '@/types/app.type';
import { PagesForUrlsOutput } from '@/types/cms.type';

import FooterLink from './FooterLink';

type Props = {
  locale: Locale;
};

/**
 * The footer links of the CMS pages
 */
const DynamicFooterLinks = async ({ locale }: Props) => {
  const pages: PagesForUrlsOutput = await getCachedPagesForUrls(locale);

  return (
    <>
      {pages.footers.map((page: ISelectOption) => (
        <FooterLink href={page.value} key={page.value}>
          {page.label}
        </FooterLink>
      ))}
    </>
  );
};

export default DynamicFooterLinks;
