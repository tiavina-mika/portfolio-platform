import {
  alpha, Box, Button, IconButton, Modal, Theme, Typography,
} from '@mui/material';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FiChevronLeft, FiChevronRight, FiDownload, FiX,
} from 'react-icons/fi';

import {
  LIGHTBOX_ACTION_ICON_SIZE, LIGHTBOX_ACTIONS_GAP, LIGHTBOX_CLOSE_ICON_SIZE,
  LIGHTBOX_CONTROL_BORDER_OPACITY, LIGHTBOX_CONTROL_HOVER_OPACITY, LIGHTBOX_CONTROL_OPACITY,
  LIGHTBOX_CONTROL_SIZE, LIGHTBOX_COUNTER_PADDING_BOTTOM, LIGHTBOX_FRAME_BORDER_OPACITY,
  LIGHTBOX_GROUND_COLOR, LIGHTBOX_GROUND_OPACITY, LIGHTBOX_HEADER_GAP, LIGHTBOX_HEADER_PADDING_Y,
  LIGHTBOX_ICON_SIZE, LIGHTBOX_IMAGE_MAX_HEIGHT, LIGHTBOX_MUTED_OPACITY, LIGHTBOX_PADDING_X,
  LIGHTBOX_STAGE_GAP, LIGHTBOX_STAGE_PADDING_BOTTOM,
} from '@/constants/_core/ui/page.constants';
import {
  FONT_FAMILY_MONO, FONT_SIZE_CARD_TITLE, FONT_SIZE_META, RADIUS, RADIUS_LG,
} from '@/constants/_core/ui/ui.constants';
import { ILightboxImage } from '@/types/_core/app.type';
import { downloadFileFromUrl } from '@/utils/_core/file.utils';

/*
 * every control of the viewer is the same pane of white glass: what stands behind it is a
 * photograph, so an outline and a tint taken from the interface's own palette would each
 * disappear over half the pictures they are asked to sit on
 */
const glass = (theme: Theme) => ({
  color: theme.palette.common.white,
  backgroundColor: alpha(theme.palette.common.white, LIGHTBOX_CONTROL_OPACITY),
  border: `1px solid ${alpha(theme.palette.common.white, LIGHTBOX_CONTROL_BORDER_OPACITY)}`,
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, LIGHTBOX_CONTROL_HOVER_OPACITY),
  },
});

const classes = {
  // the viewer takes the whole screen: the picture is what the reader opened it to actually see
  ground: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: alpha(LIGHTBOX_GROUND_COLOR, LIGHTBOX_GROUND_OPACITY),
    outline: 'none',
  },
  header: {
    flex: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: `${LIGHTBOX_HEADER_GAP}px`,
    padding: `${LIGHTBOX_HEADER_PADDING_Y}px ${LIGHTBOX_PADDING_X}px`,
  },
  title: (theme: Theme) => ({
    fontSize: FONT_SIZE_CARD_TITLE,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.common.white,
  }),
  // the pixel size is read digit by digit rather than as a word, so it goes on the mono face
  meta: (theme: Theme) => ({
    fontSize: FONT_SIZE_META,
    fontFamily: FONT_FAMILY_MONO,
    color: alpha(theme.palette.common.white, LIGHTBOX_MUTED_OPACITY),
  }),
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: `${LIGHTBOX_ACTIONS_GAP}px`,
  },
  downloadButton: (theme: Theme) => ({
    ...glass(theme),
    borderRadius: `${RADIUS}px`,
  }),
  closeButton: (theme: Theme) => ({
    ...glass(theme),
    width: LIGHTBOX_CONTROL_SIZE,
    height: LIGHTBOX_CONTROL_SIZE,
    borderRadius: `${RADIUS}px`,
  }),
  stage: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    alignItems: 'center',
    gap: `${LIGHTBOX_STAGE_GAP}px`,
    padding: `0 ${LIGHTBOX_PADDING_X}px ${LIGHTBOX_STAGE_PADDING_BOTTOM}px`,
  },
  // the two ways through the set are discs, unlike every other control here: they are a direction
  navButton: (theme: Theme) => ({
    ...glass(theme),
    flex: 'none',
    width: LIGHTBOX_CONTROL_SIZE,
    height: LIGHTBOX_CONTROL_SIZE,
    borderRadius: '50%',
  }),
  frame: (theme: Theme) => ({
    flex: 1,
    minWidth: 0,
    height: '100%',
    maxHeight: LIGHTBOX_IMAGE_MAX_HEIGHT,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: `${RADIUS_LG}px`,
    border: `1px solid ${alpha(theme.palette.common.white, LIGHTBOX_FRAME_BORDER_OPACITY)}`,
    overflow: 'hidden',
  }),
  /*
   * fitted rather than cropped, unlike the frames the viewer was opened from: this is where the
   * whole picture is finally looked at, so nothing of it may be cut off to fill the box
   */
  image: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    display: 'block',
  },
  counter: (theme: Theme) => ({
    flex: 'none',
    textAlign: 'center',
    fontSize: FONT_SIZE_META,
    color: alpha(theme.palette.common.white, LIGHTBOX_MUTED_OPACITY),
    padding: `${LIGHTBOX_STAGE_PADDING_BOTTOM}px ${LIGHTBOX_PADDING_X}px ` +
      `${LIGHTBOX_COUNTER_PADDING_BOTTOM}px`,
  }),
} as const;

type Props = {
  images: ILightboxImage[];
  // which picture is open — `null` keeps the viewer shut
  index: number | null;
  onClose: () => void;
  onChangeIndex: (index: number) => void;
};

/**
 * The picture viewer: one image on a dark ground, with the way through to the ones beside it.
 *
 * It exists because none of the frames it opens from is large enough to read a picture at — a
 * frame in a list can only say which picture this is. The set wraps around at both ends rather
 * than greying out an arrow: the reader is circling a handful of images, not paging through a
 * list that has a first and a last.
 */
const ImageLightbox = ({
  images, index, onClose, onChangeIndex,
}: Props) => {
  const {
    t,
  } = useTranslation();

  const isOpen = index !== null && !!images[index];
  const hasSeveral = images.length > 1;

  /*
   * the arrows are on the screen, so the keys next to them have to move the set too — a viewer
   * that only answers a click is one the reader has to aim at for every picture of the set
   */
  useEffect(() => {
    if (!isOpen || !hasSeveral) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        onChangeIndex(((index) - 1 + images.length) % images.length);
      }
      if (event.key === 'ArrowRight') {
        onChangeIndex(((index) + 1) % images.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasSeveral, index, images.length, onChangeIndex]);

  if (!isOpen) return null;

  const image = images[index];
  const currentIndex = index;

  const goToPrevious = () => onChangeIndex((currentIndex - 1 + images.length) % images.length);
  const goToNext = () => onChangeIndex((currentIndex + 1) % images.length);
  const handleDownload = () => downloadFileFromUrl(image.url, image.fileName);

  return (
    <Modal open onClose={onClose}>
      <Box sx={classes.ground}>
        <Box sx={classes.header}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={classes.title}>{image.title}</Typography>
            {image.meta && <Typography sx={classes.meta}>{image.meta}</Typography>}
          </Box>
          <Box sx={classes.actions}>
            <Button
              onClick={handleDownload}
              startIcon={<FiDownload size={LIGHTBOX_ACTION_ICON_SIZE} />}
              sx={classes.downloadButton}
            >
              {t('download')}
            </Button>
            <IconButton aria-label={t('close')} onClick={onClose} sx={classes.closeButton}>
              <FiX size={LIGHTBOX_CLOSE_ICON_SIZE} />
            </IconButton>
          </Box>
        </Box>

        <Box sx={classes.stage}>
          {hasSeveral && (
            <IconButton aria-label={t('previous')} onClick={goToPrevious} sx={classes.navButton}>
              <FiChevronLeft size={LIGHTBOX_ICON_SIZE} />
            </IconButton>
          )}
          <Box sx={classes.frame}>
            <Box
              alt={image.title}
              component="img"
              src={image.url}
              sx={classes.image}
            />
          </Box>
          {hasSeveral && (
            <IconButton aria-label={t('next')} onClick={goToNext} sx={classes.navButton}>
              <FiChevronRight size={LIGHTBOX_ICON_SIZE} />
            </IconButton>
          )}
        </Box>

        {hasSeveral && (
          <Typography sx={classes.counter}>
            {t('imageCountOfTotal', { current: currentIndex + 1, total: images.length })}
          </Typography>
        )}
      </Box>
    </Modal>
  );
};

export default ImageLightbox;
