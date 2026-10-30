import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { Theme } from '@mui/material/styles';

import { META_DESCRIPTION_MAX_LENGTH, META_TITLE_MAX_LENGTH } from '@/constants/_core/cms.constants';
import {
  FORM_WORKBENCH_PREVIEW_GAP, FORM_WORKBENCH_PREVIEW_LABEL_GAP,
  GOOGLE_RESULT_LINK_COLOR, GOOGLE_RESULT_URL_COLOR,
  IMAGE_PLACEHOLDER_PREVIEW_RATIO, RADIUS,
  SEO_PREVIEW_DESCRIPTION_FONT_SIZE, SEO_PREVIEW_DESCRIPTION_LINE_HEIGHT,
  SEO_PREVIEW_TITLE_FONT_SIZE, SEO_PREVIEW_TITLE_GAP, SEO_PREVIEW_TITLE_LINE_HEIGHT,
  SEO_PREVIEW_URL_FONT_SIZE, SEO_PREVIEW_URL_GAP,
  SOCIAL_CARD_DESCRIPTION_FONT_SIZE, SOCIAL_CARD_DESCRIPTION_LINE_HEIGHT,
  SOCIAL_CARD_DOMAIN_FONT_SIZE, SOCIAL_CARD_DOMAIN_GAP, SOCIAL_CARD_DOMAIN_LETTER_SPACING,
  SOCIAL_CARD_IMAGE_HEIGHT, SOCIAL_CARD_PADDING_X, SOCIAL_CARD_PADDING_Y,
  SOCIAL_CARD_TITLE_FONT_SIZE, SOCIAL_CARD_TITLE_GAP,
} from '@/constants/_core/ui.constants';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';
import { cutText } from '@/utils/_core/utils';

import ImageFrame from './ImageFrame';

const classes = {
  root: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${FORM_WORKBENCH_PREVIEW_GAP}px`,
  },
  label: { display: 'block', marginBottom: `${FORM_WORKBENCH_PREVIEW_LABEL_GAP}px` },
  rule: (theme: Theme) => ({
    height: 1,
    backgroundColor: getDesignTokens(theme).borderLight,
  }),
  /*
   * the address of the result, in Google's own green. A long slug breaks inside the word rather
   * than widening the column the preview stands in
   */
  url: {
    fontSize: SEO_PREVIEW_URL_FONT_SIZE,
    color: GOOGLE_RESULT_URL_COLOR,
    marginBottom: `${SEO_PREVIEW_URL_GAP}px`,
    overflowWrap: 'anywhere' as const,
  },
  resultTitle: {
    fontSize: SEO_PREVIEW_TITLE_FONT_SIZE,
    lineHeight: SEO_PREVIEW_TITLE_LINE_HEIGHT,
    color: GOOGLE_RESULT_LINK_COLOR,
    marginBottom: `${SEO_PREVIEW_TITLE_GAP}px`,
  },
  resultDescription: (theme: Theme) => ({
    fontSize: SEO_PREVIEW_DESCRIPTION_FONT_SIZE,
    lineHeight: SEO_PREVIEW_DESCRIPTION_LINE_HEIGHT,
    color: getDesignTokens(theme).textSecondary,
    textWrap: 'pretty' as const,
  }),
  card: (theme: Theme) => ({
    border: `1px solid ${getDesignTokens(theme).border}`,
    borderRadius: RADIUS,
    overflow: 'hidden',
  }),
  cardBody: (theme: Theme) => ({
    padding: `${SOCIAL_CARD_PADDING_Y}px ${SOCIAL_CARD_PADDING_X}px`,
    borderTop: `1px solid ${getDesignTokens(theme).borderLight}`,
  }),
  cardDomain: (theme: Theme) => ({
    fontSize: SOCIAL_CARD_DOMAIN_FONT_SIZE,
    letterSpacing: SOCIAL_CARD_DOMAIN_LETTER_SPACING,
    textTransform: 'uppercase' as const,
    color: getDesignTokens(theme).textMuted,
    marginBottom: `${SOCIAL_CARD_DOMAIN_GAP}px`,
  }),
  cardTitle: (theme: Theme) => ({
    fontSize: SOCIAL_CARD_TITLE_FONT_SIZE,
    fontWeight: theme.typography.fontWeightMedium,
    color: getDesignTokens(theme).text,
    marginBottom: `${SOCIAL_CARD_TITLE_GAP}px`,
  }),
  cardDescription: (theme: Theme) => ({
    fontSize: SOCIAL_CARD_DESCRIPTION_FONT_SIZE,
    lineHeight: SOCIAL_CARD_DESCRIPTION_LINE_HEIGHT,
    color: getDesignTokens(theme).textSecondary,
    textWrap: 'pretty' as const,
  }),
};

type Props = {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  /** the field the share picture comes from, named on the empty frame, ex `previewImage` */
  imageFieldName?: string;
  className?: string;
};

/**
 * What the page will look like away from the back-office: the line Google prints for it, and the
 * card Facebook or LinkedIn builds when its address is shared.
 *
 * Both are drawn in the type and the tones of the sites they imitate rather than in the
 * back-office's own — a mock-up is only worth showing insofar as it looks like the thing it stands
 * in for. Both are cut where the meta fields themselves stop, so the preview never shows more of a
 * title than the page will actually carry.
 */
const SeoPreview = ({
  title, description, url, imageUrl, imageFieldName = 'previewImage', className,
}: Props) => {
  const {
    t,
  } = useTranslation('cms');

  // fall back to displaying the raw url when it's empty or not a valid absolute url yet
  const hostname = url?.startsWith('http')
    ? new URL(url).hostname
    : url;
  // Google prints the address without its scheme, and so does the mock-up of it
  const displayedUrl = url?.replace(/^https?:\/\//, '') ?? '';
  const displayedTitle = cutText(title || '', META_TITLE_MAX_LENGTH);
  const displayedDescription = cutText(description || '', META_DESCRIPTION_MAX_LENGTH);

  return (
    <div className={className} css={classes.root}>
      {/* ----------- google search result mockup ----------- */}
      <div>
        <Typography css={classes.label} variant="overline">
          {t('cms:seoPreview.googleResult')}
        </Typography>
        <div css={classes.url}>{displayedUrl}</div>
        <div css={classes.resultTitle}>{displayedTitle}</div>
        <div css={classes.resultDescription}>{displayedDescription}</div>
      </div>

      <div css={classes.rule} />

      {/* ----------- social share card mockup (facebook / linkedin style) ----------- */}
      <div>
        <Typography css={classes.label} variant="overline">
          {t('cms:seoPreview.socialShare')}
        </Typography>
        <div css={classes.card}>
          <ImageFrame
            height={SOCIAL_CARD_IMAGE_HEIGHT}
            placeholder={`${imageFieldName} · ${IMAGE_PLACEHOLDER_PREVIEW_RATIO}`}
            src={imageUrl}
          />
          <div css={classes.cardBody}>
            <div css={classes.cardDomain}>{hostname}</div>
            <div css={classes.cardTitle}>{displayedTitle}</div>
            <div css={classes.cardDescription}>{displayedDescription}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeoPreview;
