import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import SeoPreview from '@/components/SeoPreview';
import { SHARE_CARD_PREVIEW_DELAY_MS } from '@/constants/_core/cms.constants';
import { useDebouncedValue } from '@/hooks/_core/useDebouncedValue';
import { getWebsiteUrl, slugify } from '@/utils/_core/utils';

type Props = {
  locale: string;
  tab: string;
  /** field name holding the fallback title used when metaTitle is empty, ex: `${locale}:title` */
  titleFieldName: string;
  /** field holding the fallback description used when metaDescription is empty — a category has none */
  descriptionFieldName?: string;
  /** base path of the public url, ex: '/blog/' for articles, '/' for CMS pages */
  basePath: string;
  /**
   * how the website lays out the share card: `left` for an article (its title alone), `centered`
   * for a page or a category (title and description)
   */
  shareCardLayout: 'centered' | 'left';
  /** what stands in for the title while neither the meta title nor the title is filled, ex: "Article title" */
  titlePlaceholder?: string;
};

/**
 * The SEO preview of a content form, its share card included. The card is the very image the
 * website generates for link previews (its `/api/og` route), so the editor sees what a shared link
 * will show. It omits the chip, which the website fills from the content's category once saved.
 */
const CmsSeoPreview = ({
  locale, tab, titleFieldName, descriptionFieldName, basePath, shareCardLayout, titlePlaceholder = '',
}: Props) => {
  const {
    t,
  } = useTranslation('cms');
  const {
    control,
  } = useFormContext();

  const [slug, metaTitle, title, metaDescription, description] = useWatch({
    control,
    name: [
      `${locale}:slug`,
      `${locale}:metaTitle`,
      titleFieldName,
      `${locale}:metaDescription`,
      descriptionFieldName || '',
    ],
  });

  const shareCardQuery = new URLSearchParams({
    layout: shareCardLayout,
    // an article card carries the article title, not the meta title written for search engines
    title: (shareCardLayout === 'left' ? title : metaTitle || title) || titlePlaceholder,
    ...(shareCardLayout === 'centered' && (metaDescription || description)
      ? { subtitle: metaDescription || description }
      : {}),
  }).toString();
  const debouncedShareCardQuery = useDebouncedValue(shareCardQuery, SHARE_CARD_PREVIEW_DELAY_MS);

  // only render the preview for the currently selected translation tab
  if (locale !== tab) return null;

  // the title field is also the one the server builds a missing slug from, so the address follows it
  const url = `${getWebsiteUrl()}/${locale}${basePath}${slug || slugify(title || '')}`;

  return (
    <SeoPreview
      description={metaDescription || description || t('cms:seoPreview.descriptionFallback')}
      imageUrl={`${getWebsiteUrl()}/api/og?${debouncedShareCardQuery}`}
      title={metaTitle || title || titlePlaceholder}
      url={url}
    />
  );
};

export default CmsSeoPreview;
