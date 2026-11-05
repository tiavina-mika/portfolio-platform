import { isEmpty, isNil, omitBy } from 'lodash';

import env from '@/env';
import { Locale } from '@/i18n/config';
import { OgCard, OgCardLayoutEnum } from '@/types/og.type';

import {
  APP_NAME,
  OG_CARD_LABEL_MAX_LENGTH,
  OG_CARD_SUBTITLE_MAX_LENGTH,
  OG_CARD_TITLE_MAX_LENGTH,
  OG_IMAGE_SIZE,
} from './constants';
import { createQueryString } from './next.utils';

/**
 * cuts a text that would not fit on the card, on a word boundary when one is close enough, and
 * marks the cut with an ellipsis
 * @param text text to print on the card
 * @param maxLength longest text kept whole, ellipsis included
 */
export const clampOgText = (text: string | undefined, maxLength: number): string | undefined => {
  const value = text?.trim();

  if (!value) return undefined;
  if (value.length <= maxLength) return value;

  const cut = value.slice(0, maxLength - 1);
  const lastSpace = cut.lastIndexOf(' ');
  // a word boundary more than 20 characters back would leave a visibly short line: cut mid-word
  const end = lastSpace > maxLength - 20 ? lastSpace : cut.length;

  return `${cut.slice(0, end).replace(/[\s,.;:–—-]+$/, '')}…`;
};

/**
 * the card exactly as it is printed: every text cut to what fits
 * @param card what the page wants the card to say
 */
export const normalizeOgCard = (card: OgCard): OgCard => ({
  layout: card.layout,
  chip: clampOgText(card.chip, OG_CARD_LABEL_MAX_LENGTH),
  title: clampOgText(card.title, OG_CARD_TITLE_MAX_LENGTH),
  subtitle: clampOgText(card.subtitle, OG_CARD_SUBTITLE_MAX_LENGTH),
});

/**
 * what a screen reader says of the card (`og:image:alt`): what is written on it
 * @param card what the page wants the card to say
 */
export const getOgCardAlt = (card: OgCard): string => {
  const { title, subtitle } = normalizeOgCard(card);

  return [title, subtitle].filter(Boolean).join('. ');
};

/**
 * reads a card back from the query string of the OG image route. Anything missing or unknown falls
 * back to the centered layout with no text, which still renders the brand card.
 * @param searchParams query string of the request
 */
export const parseOgCardSearchParams = (searchParams: URLSearchParams): OgCard => {
  const layout = searchParams.get('layout') as OgCardLayoutEnum;

  return normalizeOgCard({
    layout: Object.values(OgCardLayoutEnum).includes(layout) ? layout : OgCardLayoutEnum.CENTERED,
    chip: searchParams.get('chip') || undefined,
    title: searchParams.get('title') || undefined,
    subtitle: searchParams.get('subtitle') || undefined,
  });
};

/**
 * dynamically generate the OG image url
 * call the OG image API to generate the image
 * @see /app/api/og/route.tsx
 * ex: http://localhost:9001/api/og?layout=centered&chip=Contact&title=Contact
 * @param card what the card says, already translated
 */
export const generateOGImageUrl = (card: OgCard): string => {
  const {
    layout, chip, title, subtitle,
  } = normalizeOgCard(card);
  const params = omitBy(
    { layout, chip, title, subtitle },
    (value) => isNil(value) || value === ''
  );

  return `${env.APP_URL}/api/og${isEmpty(params) ? '' : `?${createQueryString(params)}`}`;
};

/**
 * what a link preview (Facebook, WhatsApp, LinkedIn, X…) shows for a page: the generated share
 * card, carrying the texts of the page's own language — so one route serves every language.
 * @param card what the card says, already translated
 * @param title translated title of the page, for the X card
 * @param description translated description of the page, for the X card
 * @returns the `images` of the Open Graph block and the whole `twitter` block
 */
export const getSocialImages = (card: OgCard, title?: string, description?: string) => {
  const url = generateOGImageUrl(card);
  const alt = getOgCardAlt(card);

  return {
    openGraphImages: [{ url, alt, ...OG_IMAGE_SIZE }],
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description,
      images: [{ url, alt }],
    },
  };
};

type SocialMetadataParams = {
  card: OgCard;
  title: string;
  description?: string;
  /** absolute URL of the page in its own language */
  url: string;
  locale: Locale;
};

/**
 * the whole Open Graph and X blocks of a fixed page of the site. A page that sets `openGraph`
 * replaces the layout's one entirely, so every field is given again here.
 */
export const getSocialMetadata = ({
  card, title, description, url, locale,
}: SocialMetadataParams) => {
  const { openGraphImages, twitter } = getSocialImages(card, title, description);

  return {
    openGraph: {
      type: 'website' as const,
      siteName: APP_NAME,
      locale,
      url,
      title,
      description,
      images: openGraphImages,
    },
    twitter,
  };
};
