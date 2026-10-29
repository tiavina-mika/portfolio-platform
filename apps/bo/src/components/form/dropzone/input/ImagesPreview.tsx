import {
  Box, Card, CardActions, CardMedia, IconButton, Stack, styled, useTheme,
} from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiTrash2 } from 'react-icons/fi';

import Dialog from '@/components/Dialog';

import InputActionButton from './InputActionButton';

const StyledImagePreview = styled('img')({ width: '100%' });

const sx = {
  cardActions: {
    position: 'absolute',
    right: 2,
    bottom: 2,
  },
  deleteButton: {
    bgcolor: '#fff',
    '&:hover': {
      bgcolor: '#fff',
      opacity: 0.8,
    },
  },
};

type Props = {
  files: File[];
  onRemoveFile: (file: File) => void;
  onRemoveAll: () => void;
};

const ImagesPreview = ({
  files, onRemoveFile, onRemoveAll,
}: Props) => {
  const theme = useTheme();
  const {
    t,
  } = useTranslation();

  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const handleRemoveFile = (file: File) => (event: any) => {
    event.stopPropagation();
    onRemoveFile(file);
  };

  const onSelectImage = (file: File) => setSelectedImage(file);
  const clearSelectImage = () => setSelectedImage(null);

  return (
    <Box sx={{ pt: 2 }}>
      <Stack direction="row" spacing={3}>
        {/* ----- file previews ----- */}
        {Array.isArray(files) &&
          files.map((file, index) => (
            <Card
              elevation={1}
              key={index}
              onClick={() => onSelectImage(file)}
              sx={{
                maxWidth: 200,
                position: 'relative',
                p: 1,
                cursor: 'pointer',
                border: '1px solid ' + ((file as any).path
                  ? 'transparent'
                  : theme.palette.info.main),
              }}
            >
              {/* ----- image ----- */}
              <CardMedia
                component="img"
                image={URL.createObjectURL(file)}
                sx={{ minHeight: 200 }}
                title={file.name}
              />
              <span>{(file as any).path}</span>

              {/* ----- buttons ----- */}
              <CardActions sx={sx.cardActions}>
                <IconButton aria-label="delete-image" onClick={handleRemoveFile(file)} sx={sx.deleteButton}>
                  <FiTrash2 color={theme.palette.error.main} size={22} />
                </IconButton>
              </CardActions>
            </Card>
          ))}
      </Stack>

      {/* ----- remove all button ----- */}
      {files.length > 1 && (
        <InputActionButton
          color={theme.palette.error.main}
          icon={<FiTrash2 size={18} />}
          onClick={onRemoveAll}
          text={t('removeAll')}
        />
      )}

      <Dialog
        open={!!selectedImage}
        secondaryButtonText={t('close')}
        title={selectedImage?.name}
        toggle={clearSelectImage}
      >
        {selectedImage
          ? (
            <StyledImagePreview alt={selectedImage?.name ?? ''} src={URL.createObjectURL(selectedImage)} />
          )
          : null}
      </Dialog>
    </Box>
  );
};

export default ImagesPreview;
