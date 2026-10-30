import { Typography } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import TiptapParser from 'tiptap-parser';

import type { Theme } from '@mui/material/styles';

import ImageFrame from '@/components/ImageFrame';
import {
  FONT_FAMILY_MONO, FORM_WORKBENCH_PREVIEW_BLOCK_GAP, FORM_WORKBENCH_PREVIEW_OVERLINE_LETTER_SPACING,
  IMAGE_PLACEHOLDER_BANNER_RATIO, RADIUS,
  RENDERED_PAGE_BANNER_HEIGHT, RENDERED_PAGE_CONTENT_FONT_SIZE,
  RENDERED_PAGE_CONTENT_LINE_HEIGHT, RENDERED_PAGE_DESCRIPTION_FONT_SIZE,
  RENDERED_PAGE_DESCRIPTION_GAP, RENDERED_PAGE_DESCRIPTION_LINE_HEIGHT, RENDERED_PAGE_HEADING_FONT_SIZE,
  RENDERED_PAGE_IMAGE_CAPTION_FONT_SIZE, RENDERED_PAGE_IMAGE_CAPTION_GAP,
  RENDERED_PAGE_IMAGE_GAP, RENDERED_PAGE_IMAGE_HEIGHT, RENDERED_PAGE_IMAGES_COLUMNS,
  RENDERED_PAGE_IMAGES_GAP, RENDERED_PAGE_LIST_INDENT, RENDERED_PAGE_PADDING, RENDERED_PAGE_PARAGRAPH_GAP,
  RENDERED_PAGE_RULE_MARGIN_Y, RENDERED_PAGE_SUBHEADING_FONT_SIZE, RENDERED_PAGE_TITLE_FONT_SIZE,
  RENDERED_PAGE_TITLE_LINE_HEIGHT,
} from '@/constants/_core/ui.constants';
import { IFileCloud } from '@/types/_core/file.type';
import { Locale } from '@/types/_core/setting.type';
import { getFilePreviewUrl } from '@/utils/_core/file.utils';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

const classes = {
  root: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${FORM_WORKBENCH_PREVIEW_BLOCK_GAP}px`,
  },
  overline: (theme: Theme) => ({
    letterSpacing: FORM_WORKBENCH_PREVIEW_OVERLINE_LETTER_SPACING,
    color: getDesignTokens(theme).textMuted,
  }),
  // the page drawn inside a frame of its own, so it reads as a rendering and not as more form
  frame: (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      border: `1px solid ${tokens.border}`,
      borderRadius: RADIUS,
      overflow: 'hidden',
      backgroundColor: tokens.surface,
    };
  },
  body: { padding: RENDERED_PAGE_PADDING },
  title: (theme: Theme) => ({
    fontSize: RENDERED_PAGE_TITLE_FONT_SIZE,
    fontWeight: theme.typography.fontWeightBold,
    lineHeight: RENDERED_PAGE_TITLE_LINE_HEIGHT,
    color: getDesignTokens(theme).text,
    textWrap: 'pretty' as const,
  }),
  description: (theme: Theme) => ({
    marginTop: `${RENDERED_PAGE_DESCRIPTION_GAP}px`,
    fontSize: RENDERED_PAGE_DESCRIPTION_FONT_SIZE,
    lineHeight: RENDERED_PAGE_DESCRIPTION_LINE_HEIGHT,
    color: getDesignTokens(theme).textSecondary,
    textWrap: 'pretty' as const,
  }),
  rule: (theme: Theme) => ({
    height: 1,
    margin: `${RENDERED_PAGE_RULE_MARGIN_Y}px 0`,
    backgroundColor: getDesignTokens(theme).borderLight,
  }),
  /*
   * the body as the site will set it: its paragraphs are spaced by a margin rather than by a gap,
   * because what is laid out here is the editor's own HTML and not a column this file owns
   */
  content: (theme: Theme) => ({
    fontSize: RENDERED_PAGE_CONTENT_FONT_SIZE,
    lineHeight: RENDERED_PAGE_CONTENT_LINE_HEIGHT,
    color: getDesignTokens(theme).text,
    /*
     * whatever the editor wrote is set in the drawing's own size: a heading or a list keeps its
     * shape, but never jumps back to the browser's default scale in the middle of a 380px column
     */
    '& p, & ul, & ol, & h1, & h2, & h3, & h4, & h5, & h6': {
      margin: `0 0 ${RENDERED_PAGE_PARAGRAPH_GAP}px`,
    },
    '& > * > :last-child, & > :last-child': { marginBottom: 0 },
    '& h1, & h2': { fontSize: RENDERED_PAGE_HEADING_FONT_SIZE, fontWeight: theme.typography.fontWeightBold },
    '& h3, & h4, & h5, & h6': {
      fontSize: RENDERED_PAGE_SUBHEADING_FONT_SIZE,
      fontWeight: theme.typography.fontWeightBold,
    },
    '& ul, & ol': { paddingLeft: RENDERED_PAGE_LIST_INDENT },
    '& a': { color: theme.palette.primary.dark },
    '& img': { maxWidth: '100%', height: 'auto', borderRadius: RADIUS },
  }),
  emptyContent: (theme: Theme) => ({
    fontSize: RENDERED_PAGE_CONTENT_FONT_SIZE,
    lineHeight: RENDERED_PAGE_CONTENT_LINE_HEIGHT,
    color: getDesignTokens(theme).textMuted,
  }),
  images: {
    marginTop: `${RENDERED_PAGE_IMAGES_GAP}px`,
    display: 'grid',
    gridTemplateColumns: `repeat(${RENDERED_PAGE_IMAGES_COLUMNS}, minmax(0, 1fr))`,
    gap: `${RENDERED_PAGE_IMAGE_GAP}px`,
  },
  image: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${RENDERED_PAGE_IMAGE_CAPTION_GAP}px`,
  },
  // a file name and its pixel size are read character by character, so they take the mono stack
  imageName: (theme: Theme) => ({
    fontFamily: FONT_FAMILY_MONO,
    fontSize: RENDERED_PAGE_IMAGE_CAPTION_FONT_SIZE,
    color: getDesignTokens(theme).textSecondary,
    overflowWrap: 'anywhere' as const,
  }),
  imageSize: (theme: Theme) => ({
    fontFamily: FONT_FAMILY_MONO,
    fontSize: RENDERED_PAGE_IMAGE_CAPTION_FONT_SIZE,
    color: getDesignTokens(theme).textMuted,
  }),
};

/** the name a picture is filed under, whether it is still a browser file or already stored */
const getFileName = (file: IFileCloud | File): string => (
  file instanceof File
    ? file.name
    : file.publicId.split('/').pop() ?? file.publicId
);

/** its pixel size, which only a stored file carries — a freshly picked one has not been measured yet */
const getFileSize = (file: IFileCloud | File): string => (
  !(file instanceof File) && file.width && file.height
    ? `${file.width} × ${file.height}`
    : ''
);

type Props = {
  /** the language tab currently open — the preview shows the version being written, not the default one */
  locale: Locale;
  /** the single picture the site heads the record with, ex: `bannerImage` for a page, `image` for an article */
  bannerFieldName: string;
  /*
   * the translated fields the heading is read from, without their locale prefix and in order of
   * preference — the first one holding a value wins
   */
  titleFields: string[];
  /** what the heading reads while none of those fields holds a value */
  untitledLabel: string;
};

/**
 * The record as the website will render it, drawn from the fields being filled: the banner, the
 * heading, the sentence under it, the body written in the editor and the pictures of the gallery.
 *
 * It stands next to the content and the images sections because those two produce one page — what
 * an editor is really asking while writing either of them is what the visitor will end up seeing.
 */
const CmsFormRenderedPreview = ({
  locale, bannerFieldName, titleFields, untitledLabel,
}: Props) => {
  const {
    t,
  } = useTranslation('cms');
  const {
    control,
  } = useFormContext();

  const [description, content, bannerImage, images, ...titles] = useWatch({
    control,
    name: [
      `${locale}:description`,
      `${locale}:content`,
      bannerFieldName,
      'images',
      ...titleFields.map((field) => `${locale}:${field}`),
    ],
  });

  const imageFiles = (images ?? []) as (IFileCloud | File)[];

  return (
    <div css={classes.root}>
      <Typography css={classes.overline} variant="overline">{t('cms:cmsForm.renderedOnSite')}</Typography>
      <div css={classes.frame}>
        <ImageFrame
          height={RENDERED_PAGE_BANNER_HEIGHT}
          placeholder={`${bannerFieldName} · ${IMAGE_PLACEHOLDER_BANNER_RATIO}`}
          src={getFilePreviewUrl(bannerImage as IFileCloud | File)}
        />
        <div css={classes.body}>
          <div css={classes.title}>
            {(titles as string[]).find(Boolean) || untitledLabel}
          </div>
          <div css={classes.description}>
            {(description as string) || t('cms:cmsForm.noDescriptionYet')}
          </div>
          <div css={classes.rule} />
          {content
            ? (
              <div css={classes.content}>
                {/* the editor's own output, parsed into elements rather than injected as raw HTML */}
                <TiptapParser content={content as string} />
              </div>
            )
            : <div css={classes.emptyContent}>{t('cms:cmsForm.emptyContentPreview')}</div>}
          {!!imageFiles.length && (
            <div css={classes.images}>
              {imageFiles.map((file, index) => (
                <div css={classes.image} key={index}>
                  <ImageFrame
                    bordered
                    height={RENDERED_PAGE_IMAGE_HEIGHT}
                    placeholder={getFileName(file)}
                    src={getFilePreviewUrl(file)}
                  />
                  <div css={classes.imageName}>{getFileName(file)}</div>
                  <div css={classes.imageSize}>{getFileSize(file)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CmsFormRenderedPreview;
