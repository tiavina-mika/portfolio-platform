import {
  alpha, Box, Chip, Theme, Typography,
} from '@mui/material';
import { PAGE_IMAGES_FIELDS, PAGE_SINGLE_IMAGE_FIELDS } from '@shared/validations';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiZoomIn } from 'react-icons/fi';
import { capitalize } from 'string-ts';

import IconPopover from '@/components/IconPopover';
import ImageLightbox from '@/components/ImageLightbox';
import {
  PREVIEW_EDITOR_FILE_GAP, PREVIEW_EDITOR_FILE_HEIGHT, PREVIEW_EDITOR_FILE_WIDTH,
  PREVIEW_EDITOR_FILE_ZOOM_DISC_SIZE, PREVIEW_IMAGE_GAP, PREVIEW_IMAGE_GROUP_GAP,
  PREVIEW_IMAGE_HEIGHT, PREVIEW_IMAGE_LABEL_GAP, PREVIEW_IMAGE_MIN_WIDTH, PREVIEW_IMAGE_VEIL_COLOR,
  PREVIEW_IMAGE_VEIL_OPACITY, PREVIEW_IMAGE_WIDTH, PREVIEW_IMAGE_ZOOM_DISC_SIZE,
  PREVIEW_IMAGE_ZOOM_ICON_RATIO, PREVIEW_SECTION_TITLE_GAP, PREVIEW_THUMBNAIL_HEIGHT,
  PREVIEW_THUMBNAIL_WIDTH, PREVIEW_THUMBNAIL_ZOOM_DISC_SIZE, PREVIEW_THUMBNAILS_GAP,
} from '@/constants/_core/ui/page.constants';
import { FONT_SIZE_META, RADIUS } from '@/constants/_core/ui/ui.constants';
import { ILightboxImage } from '@/types/_core/app.type';
import { IFileCloud, ITranslatedFileCloud } from '@/types/_core/file.type';
import { getFileNameFromUrl } from '@/utils/_core/file.utils';
import { getObjectField } from '@/utils/_core/parse.utils';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

const classes = {
  block: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${PREVIEW_IMAGE_GROUP_GAP}px`,
  },
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${PREVIEW_IMAGE_LABEL_GAP}px`,
  },
  /*
   * the name of the group is a label above its pictures, not a heading of the block: the block
   * already carries the one title of the section it fills
   */
  groupLabel: (theme: Theme) => ({
    display: 'flex',
    alignItems: 'center',
    gap: `${PREVIEW_SECTION_TITLE_GAP}px`,
    fontSize: FONT_SIZE_META,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.text.primary,
  }),
  /*
   * the named illustrations stand side by side while the card is wide enough for two of them to
   * be compared, and take the width one after the other below that
   */
  singleImages: {
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fit, minmax(${PREVIEW_IMAGE_MIN_WIDTH}px, 1fr))`,
    gap: `${PREVIEW_IMAGE_GAP}px`,
  },
  thumbnails: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: `${PREVIEW_THUMBNAILS_GAP}px`,
  },
  editorFile: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: `${PREVIEW_EDITOR_FILE_GAP}px`,
  },
  /*
   * a frame with nothing in it is still drawn, at the size the picture would have taken: an
   * illustration the record does not carry is a fact about the record, and a line of text where a
   * frame stands in the column next to it says it far less clearly than an empty frame does
   */
  emptyFrame: (theme: Theme) => ({
    width: { xs: '100%', sm: PREVIEW_IMAGE_WIDTH },
    height: PREVIEW_IMAGE_HEIGHT,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: `0 ${PREVIEW_IMAGE_LABEL_GAP * 2}px`,
    fontSize: FONT_SIZE_META,
    color: getDesignTokens(theme).textMuted,
    border: `1px dashed ${getDesignTokens(theme).border}`,
    borderRadius: `${RADIUS}px`,
  }),
} as const;

/*
 * every picture in the block is the same frame at one of three sizes: a fixed box the image is
 * cropped into, which the magnifier takes over while the pointer is on it. The frames are what
 * says a picture is here and which one it is — the veil and the disc are what say that clicking
 * is how it gets read.
 */
const frameStyles = (theme: Theme) => ({
  position: 'relative',
  border: `1px solid ${getDesignTokens(theme).border}`,
  borderRadius: `${RADIUS}px`,
  overflow: 'hidden',
  cursor: 'zoom-in',
  padding: 0,
  background: 'none',
  '&:hover': { borderColor: theme.palette.primary.main },
  '&:hover .PreviewImages-zoom': { display: 'flex' },
});

const veilStyles = {
  display: 'none',
  position: 'absolute',
  inset: 0,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: alpha(PREVIEW_IMAGE_VEIL_COLOR, PREVIEW_IMAGE_VEIL_OPACITY),
} as const;

const discStyles = (theme: Theme, size: number) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: size,
  height: size,
  borderRadius: '50%',
  backgroundColor: theme.palette.common.white,
  color: getDesignTokens(theme).text,
});

const imageStyles = {
  width: '100%',
  height: '100%',
  // cropped rather than letterboxed: a row of mixed ratios has to keep one edge in common
  objectFit: 'cover',
  display: 'block',
} as const;

type FrameProps = {
  file: IFileCloud;
  label: string;
  discSize: number;
  width: Record<string, string | number> | number;
  height: number;
  onOpen: () => void;
};

const ImageFrame = ({
  file, label, discSize, width, height, onOpen,
}: FrameProps) => (
  <Box
    aria-label={label}
    component="button"
    onClick={onOpen}
    sx={(theme: Theme) => ({ ...frameStyles(theme), width, height })}
    type="button"
  >
    <Box
      alt={label}
      component="img"
      src={file.url}
      sx={imageStyles}
    />
    <Box className="PreviewImages-zoom" sx={veilStyles}>
      <Box sx={(theme: Theme) => discStyles(theme, discSize)}>
        <FiZoomIn size={discSize * PREVIEW_IMAGE_ZOOM_ICON_RATIO} />
      </Box>
    </Box>
  </Box>
);

/**
 * the one line naming a picture while the viewer holds it: its pixel size when the upload recorded
 * one, and otherwise the name it was stored under — either way something read character by
 * character, which is why it is set on the mono face
 */
const getImageMeta = (file: IFileCloud): string => (
  file.width && file.height
    ? `${file.width}×${file.height}`
    : getFileNameFromUrl(file.url)
);

const toLightboxImage = (file: IFileCloud, title: string): ILightboxImage => ({
  url: file.url,
  title,
  meta: getImageMeta(file),
  fileName: getFileNameFromUrl(file.url),
});

type Props<T extends Record<string, any>> = {
  page: T;
  fields?: string[];
  /*
   * the pictures the content editor pulled in, listed under the record's own images: they belong
   * to the text rather than to the record, and are kept here only so an editor can see what the
   * content is still holding
   */
  editorFiles?: ITranslatedFileCloud[];
};

/**
 * Every picture a piece of content carries, grouped by the part each one plays: the illustrations
 * filling a named field, the gallery under them, then whatever the editor pulled into the text.
 *
 * It is the body of a section of a detail page, so it draws no block of its own — the section it
 * is dropped into is what gives it its title and its surface. None of the frames is large enough
 * to read a picture at, on purpose: they are an index of what the record holds, and any of them
 * opens the viewer where the picture is actually looked at.
 */
const PreviewImages = <T extends Record<string, any>>({
  page, fields = PAGE_SINGLE_IMAGE_FIELDS, editorFiles,
}: Props<T>) => {
  const {
    t,
  } = useTranslation();

  const [openedIndex, setOpenedIndex] = useState<number | null>(null);

  const singleImages = fields.map((field: string) => ({
    field,
    label: capitalize(t('cms:' + field)),
    file: getObjectField<IFileCloud>(page, field),
  }));
  const otherImages = PAGE_IMAGES_FIELDS
    .flatMap((field: string) => getObjectField<IFileCloud[]>(page, field) ?? []);
  const files = editorFiles ?? [];

  /*
   * the frames are read as one set once the viewer is open, in the order the block draws them —
   * so the arrows walk the whole block rather than stopping at the end of the group that was
   * clicked. Only the illustrations the record actually carries take a place in it.
   */
  const presentSingleImages = singleImages.filter((image) => !!image.file);
  const otherImagesOffset = presentSingleImages.length;
  const editorFilesOffset = otherImagesOffset + otherImages.length;

  const lightboxImages: ILightboxImage[] = [
    ...presentSingleImages.map((image) => toLightboxImage(image.file!, image.label)),
    ...otherImages.map((image) => toLightboxImage(image, t('common:otherImages'))),
    ...files.map((file) => toLightboxImage(
      file,
      `${t('cms:editorFiles')} · ${file.locale.toUpperCase()}`
    )),
  ];

  const closeLightbox = () => setOpenedIndex(null);

  return (
    <Box sx={classes.block}>
      <Box sx={classes.singleImages}>
        {singleImages.map(({
          field, label, file,
        }) => (
          <Box key={field} sx={classes.group}>
            <Typography component="div" sx={classes.groupLabel}>{label}</Typography>
            {file
              ? (
                <ImageFrame
                  discSize={PREVIEW_IMAGE_ZOOM_DISC_SIZE}
                  file={file}
                  height={PREVIEW_IMAGE_HEIGHT}
                  label={label}
                  width={{ xs: '100%', sm: PREVIEW_IMAGE_WIDTH }}
                  onOpen={() => setOpenedIndex(
                    presentSingleImages.findIndex((image) => image.field === field)
                  )}
                />
              )
              : (
                <Box sx={classes.emptyFrame}>
                  {t('common:errors.noField', { field: t('common:' + field) })}
                </Box>
              )}
          </Box>
        ))}
      </Box>

      <Box sx={classes.group}>
        <Typography component="div" sx={classes.groupLabel}>{t('common:otherImages')}</Typography>
        {otherImages.length
          ? (
            <Box sx={classes.thumbnails}>
              {otherImages.map((image: IFileCloud, index: number) => (
                <ImageFrame
                  discSize={PREVIEW_THUMBNAIL_ZOOM_DISC_SIZE}
                  file={image}
                  height={PREVIEW_THUMBNAIL_HEIGHT}
                  key={image.url + index}
                  label={t('common:otherImages')}
                  onOpen={() => setOpenedIndex(otherImagesOffset + index)}
                  width={{
                    xs: `calc(50% - ${PREVIEW_THUMBNAILS_GAP / 2}px)`,
                    sm: PREVIEW_THUMBNAIL_WIDTH,
                  }}
                />
              ))}
            </Box>
          )
          : (
            <Typography variant="body2">{t('common:errors.noOtherImages')}</Typography>
          )}
      </Box>

      {!!files.length && (
        <Box sx={classes.group}>
          <Typography component="div" sx={classes.groupLabel}>
            {t('cms:editorFiles')}
            <IconPopover message={t('cms:editorFilesHelper')} />
          </Typography>
          <Box sx={classes.thumbnails}>
            {files.map((file: ITranslatedFileCloud, index: number) => (
              <Box key={file.url + index} sx={classes.editorFile}>
                <ImageFrame
                  discSize={PREVIEW_EDITOR_FILE_ZOOM_DISC_SIZE}
                  file={file}
                  height={PREVIEW_EDITOR_FILE_HEIGHT}
                  label={t('cms:editorFiles')}
                  onOpen={() => setOpenedIndex(editorFilesOffset + index)}
                  width={PREVIEW_EDITOR_FILE_WIDTH}
                />
                <Chip label={file.locale.toUpperCase()} size="small" variant="outlined" />
              </Box>
            ))}
          </Box>
        </Box>
      )}

      <ImageLightbox
        images={lightboxImages}
        index={openedIndex}
        onChangeIndex={setOpenedIndex}
        onClose={closeLightbox}
      />
    </Box>
  );
};

export default PreviewImages;
