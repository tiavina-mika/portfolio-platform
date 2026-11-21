import { BreadcrumbsSegment } from '@/components/Breadcrumbs';
import { siteConfig } from '@/config/site';
import { Locale } from '@/i18n/config';
import { IArticle } from '@/types/article.type';
import { getAbsoluteUrl } from '@/utils/app.utils';
import { IMAGES } from '@/utils/constants';
import { getTranslatedField } from '@/utils/translation.utils';

export const getOrganizationJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteConfig.name,
  url: siteConfig.url,
  logo: `${siteConfig.url}${IMAGES.logo}`,
  email: siteConfig.email,
  sameAs: Object.values(siteConfig.social),
});

export const getWebSiteJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: siteConfig.name,
  url: siteConfig.url,
});

type ArticleJsonLdParams = {
  article: IArticle;
  locale: Locale;
  url: string;
  image: string;
};

export const getArticleJsonLd = ({
  article, locale, url, image,
}: ArticleJsonLdParams) => {
  const translated = article.translated;
  const title = getTranslatedField(translated, locale, 'title');
  const description = getTranslatedField(translated, locale, 'description');

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    image,
    datePublished: new Date(article.createdAt || '').toISOString(),
    dateModified: new Date(article.updatedAt || '').toISOString(),
    author: {
      '@type': 'Person',
      name: siteConfig.name,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}${IMAGES.logo}`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };
};

/**
 * @param segments breadcrumb segments (already includes "Home" as the first entry)
 * @param locale current locale, used to build the locale-prefixed absolute URL of each segment
 */
export const getBreadcrumbListJsonLd = (segments: BreadcrumbsSegment[], locale?: Locale) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: segments.map((segment, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: segment.name,
    item: getAbsoluteUrl(locale ? `/${locale}${segment.link}` : segment.link),
  })),
});
