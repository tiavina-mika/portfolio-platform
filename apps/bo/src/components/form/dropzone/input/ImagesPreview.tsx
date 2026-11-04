import {
  alpha, Box, IconButton, Theme, Typography,
} from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiPlus, FiX } from 'react-icons/fi';

import Dialog from '@/components/Dialog';
import {
  DROPZONE_THUMBNAIL_REMOVE_SIZE, DROPZONE_THUMBNAIL_SIZE, DROPZONE_THUMBNAILS_GAP,
} from '@/constants/_core/ui/entity.constants';
import { FONT_SIZE_OVERLINE, RADIUS } from '@/constants/_core/ui/ui.constants';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

const sx = {
  thumbnail: {
    position: 'relative',
    width: DROPZONE_THUMBNAIL_SIZE,
    height: DROPZONE_THUMBNAIL_SIZE,
    borderRadius: `${RADIUS}px`,
    overflow: 'hidden',
    cursor: 'pointer',
    border: (theme: Theme) => `1px solid ${getDesignTokens(theme).border}`,
  },
  image: {
    width: '100%',
    height: '100%',
    // fill the square rather than letterbox it — a grid of mixed ratios has to stay aligned
    objectFit: 'cover' as const,
    display: 'block',
  },
  /*
   * the remove control sits on the image itself, so it carries its own dark disc: a transparent
   * icon disappears against a light photo and a light one against a dark photo
   */
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: DROPZONE_THUMBNAIL_REMOVE_SIZE,
    height: DROPZONE_THUMBNAIL_REMOVE_SIZE,
    padding: 0,
    // icon buttons are squared off app-wide; this one is a disc floating on the image it removes
    borderRadius: '50%',
    color: 'common.white',
    bgcolor: (theme: Theme) => alpha(getDesignTokens(theme).text, 0.8),
    '&:hover': { bgcolor: (theme: Theme) => getDesignTokens(theme).text },
  },
  addTile: {
    width: DROPZONE_THUMBNAIL_SIZE,
    height: DROPZONE_THUMBNAIL_SIZE,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    borderRadius: `${RADIUS}px`,
    cursor: 'pointer',
    color: 'text.secondary',
    border: (theme: Theme) => `1px dashed ${getDesignTokens(theme).borderInput}`,
    '&:hover': { borderColor: 'primary.main' },
  },
};

const ADD_ICON_SIZE = 18;
const REMOVE_ICON_SIZE = 11;

type Props = {
  files: File[];
  onRemoveFile: (file: File) => void;
  onAdd: () => void;
};

/*
 * The picked images are the drop area's own content once there is at least one: they replace the
 * empty prompt inside the dashed frame instead of stacking a second block under it, and the frame
 * keeps a tile of its own for adding more.
 */
const ImagesPreview = ({
  files, onRemoveFile, onAdd,
}: Props) => {
  const {
    t,
  } = useTranslation();

  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const handleRemoveFile = (file: File) => (event: any) => {
    event.stopPropagation();
    onRemoveFile(file);
  };

  const handleAdd = (event: any) => {
    event.stopPropagation();
    onAdd();
  };

  const clearSelectImage = () => setSelectedImage(null);

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: `${DROPZONE_THUMBNAILS_GAP}px` }}>
      {files.map((file: File, index: number) => (
        <Box key={file.name + index} onClick={() => setSelectedImage(file)} sx={sx.thumbnail}>
          <Box
            alt={file.name}
            component="img"
            src={URL.createObjectURL(file)}
            sx={sx.image}
          />
          <IconButton aria-label={t('delete')} onClick={handleRemoveFile(file)} sx={sx.removeButton}>
            <FiX size={REMOVE_ICON_SIZE} strokeWidth={2.5} />
          </IconButton>
        </Box>
      ))}

      <Box onClick={handleAdd} sx={sx.addTile}>
        <FiPlus size={ADD_ICON_SIZE} strokeWidth={1.5} />
        <Typography sx={{ fontSize: FONT_SIZE_OVERLINE }}>{t('add')}</Typography>
      </Box>

      <Dialog
        open={!!selectedImage}
        secondaryButtonText={t('close')}
        title={selectedImage?.name}
        toggle={clearSelectImage}
      >
        {selectedImage
          ? (
            <img alt={selectedImage.name} src={URL.createObjectURL(selectedImage)} style={{ width: '100%' }} />
          )
          : null}
      </Dialog>
    </Box>
  );
};

export default ImagesPreview;
