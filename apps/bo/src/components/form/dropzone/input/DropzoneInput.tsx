
import {
  Box, FormHelperText, styled, Typography, useTheme,
} from '@mui/material';
import uniqBy from 'lodash/uniqBy';
import { useCallback, useEffect, useState } from 'react';
import { type DropzoneOptions, type FileRejection, useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { FiRefreshCcw, FiUpload } from 'react-icons/fi';

import {
  DROPZONE_EMPTY_HEIGHT, DROPZONE_ICON_SIZE, DROPZONE_PADDING, DROPZONE_PROMPT_GAP,
  DROPZONE_THUMBNAILS_PADDING,
} from '@/constants/_core/ui/entity.constants';
import { FONT_SIZE_META, INPUT_FONT_SIZE, RADIUS } from '@/constants/_core/ui/ui.constants';
import { convertFileSizeToBytes } from '@/utils/_core/file.utils';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

import FilesPreview from './FilesPreview';
import ImagesPreview from './ImagesPreview';
import InputActionButton from './InputActionButton';

// -------------- styled dropzone -------------- //
type StyleDropzoneProps = {
  error: boolean;
  hasFiles: boolean;
};
/*
 * the drop area has two drawings rather than one. Empty, it is a field like the ones around it — a
 * solid outline on the card surface — but standing on a block of its own instead of on the input
 * row, so the prompt is centred in it rather than pinned against an edge. Once it holds files it
 * turns into the frame around them: a dashed edge on the recessed ground, sized by the thumbnail
 * grid, so what the field is made of is the picked images and not the empty space under them.
 */
const StyledDropzone = styled('div', {
  shouldForwardProp: prop => prop !== 'error' && prop !== 'hasFiles',
})<StyleDropzoneProps>(({
  theme, error, hasFiles,
}) => {
  const tokens = getDesignTokens(theme);

  return {
    border: `1px ${hasFiles
      ? 'dashed'
      : 'solid'} ${error
      ? theme.palette.error.main
      : tokens.borderInput}`,

    borderRadius: RADIUS,
    padding: hasFiles
      ? DROPZONE_THUMBNAILS_PADDING
      : DROPZONE_PADDING,
    backgroundColor: hasFiles
      ? tokens.surfaceSecondary
      : tokens.surface,
    ...(!hasFiles && {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: DROPZONE_EMPTY_HEIGHT,
    }),
    transition: theme.transitions.create(['border-color'], { duration: 150 }),
    '&:hover': { borderColor: theme.palette.primary.main },
  };
});

const sx = {
  prompt: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: `${DROPZONE_PROMPT_GAP}px`,
    textAlign: 'center',
    cursor: 'pointer',
  },
};

export type CustomDropzoneInputProps = {
  onChange: (...event: any[]) => void;
  onBlur?: () => void;
  /**
   * The current value of the dropzone input.
   * This may be a single file or an array of files depending on the `multiple` prop.
   */
  value?: File[] | File | null;
  onError?: (error: any) => void;
  /**
   * If true, duplicate files (based on file name) will be ignored when adding new files.
   * @default true
   */
  noDuplicateFiles?: boolean;
  inputLabel?: string;
  error: string;
  /**
   * If true, the dropzone will show a reset button to reset to the initial files.
   * Mostly for updating forms.
   * @default false
   */
  shouldReset?: boolean;
  helperText?: string;
} & DropzoneOptions;

const DropzoneInput = ({
  onChange,
  onBlur,
  value,
  onError,
  inputLabel,
  error,
  shouldReset,
  helperText,
  noDuplicateFiles = true,
  ...rest
}: CustomDropzoneInputProps) => {
  const {
    t,
  } = useTranslation();
  const [files, setFiles] = useState<File[]>([]);
  const [initialFiles, setInitialFiles] = useState<File[]>([]);
  const [shouldInitialize, setShouldInitialize] = useState<boolean>(false);

  const [imagesOrVideosPreview, setImagesOrVideosPreview] = useState<File[]>([]);
  const [otherFilesPreview, setOtherFilesPreview] = useState<File[]>([]);

  const theme = useTheme();

  // load file from form initial values
  useEffect(() => {
    if (!value) return;

    // values
    if (Array.isArray(value)) {
      setFiles(value);
    } else {
      setFiles([value]);
    }

    // previews
    const filesArray: File[] = Array.isArray(value) ? value : [value];
    const images = [];
    const others = [];

    for (const file of filesArray) {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        images.push(file);
      } else {
        others.push(file);
      }
    }

    setImagesOrVideosPreview(images);
    setOtherFilesPreview(others);
  }, [value]);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      setShouldInitialize(true);

      if (!shouldInitialize) {
        setInitialFiles(files);
      }
      const allFiles = [...files, ...acceptedFiles];

      if ((rest.maxFiles && rest.maxFiles === 1) || !rest.multiple) {
        if (acceptedFiles.length > 0) {
          const lastFile = acceptedFiles[acceptedFiles.length - 1];

          onChange(lastFile);
          setFiles([lastFile]);
        }
      }
      else {
        // remove duplicated files
        const uniqFiles = noDuplicateFiles
          ? uniqBy(allFiles, 'name')
          : allFiles;

        onChange(uniqFiles);
      }

      setImagesOrVideosPreview((prev: File[]): File[] => {
        return [
          ...prev,
          ...acceptedFiles
            .filter((file: File) => file.type.startsWith('image/') || file.type.startsWith('video/')),
        ];
      });

      setOtherFilesPreview((prev: File[]): File[] => {
        return [
          ...prev,
          ...acceptedFiles
            .filter((file: File) => !file.type.startsWith('image/') && !file.type.startsWith('video/')),
        ];
      });

      // error handling
      if (fileRejections.length) {
        const errors = fileRejections[0].errors;

        if (errors.length) {
          const defaultError = errors[0];
          let errorMessage = '';

          switch (defaultError?.code) {
            case 'too-many-files':
              errorMessage = rest.maxFiles
                ? t('form.error.maxFilesAllowed', {
                  count: rest.maxFiles,
                  file: rest.maxFiles > 1
                    ? t('files')
                    : t('file'),
                })
                : t('form.error.tooManyFiles');
              break;
            case 'file-invalid-type':
              errorMessage = t('form.error.thisFileTypeNotAllowed');
              break;
            case 'file-too-large':
              {
                // get the max size from the error message
                const messagesArr = defaultError.message.split(' ');
                const maxSize = messagesArr.find((text: string) => Number(text));

                errorMessage = t('form.error.fileSizeLessThan', {
                  size: convertFileSizeToBytes(maxSize
                    ? +maxSize
                    : 0, 'mb'),
                });
              }

              break;
            default:
              errorMessage = t('errors.errorOccurred');
          }

          if (errorMessage && onError) {
            onError(errorMessage);
          }
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onChange, files, onError, noDuplicateFiles, rest.maxFiles, shouldInitialize, t]
  );

  const hasImagePreviews = imagesOrVideosPreview.length > 0;

  const {
    getRootProps, getInputProps, isDragActive, isDragReject, open,
  } = useDropzone({
    onDrop,
    /*
     * once thumbnails fill the frame, clicking it must not reopen the picker — the tiles are
     * clickable in their own right (preview, remove) and the frame keeps only its drop behavior
     */
    noClick: hasImagePreviews,
    ...rest,
  });

  const removeFile = (file: File) => {
    // copy initial files for reset
    setShouldInitialize(true);
    if (!shouldInitialize) {
      setInitialFiles(files);
    }

    const remainingFiles: File[] = files.filter((currentFile: File) => currentFile.name !== file.name);

    onChange(remainingFiles);
  };

  const removeAll = () => {
    // copy initial files for reset
    setShouldInitialize(true);
    if (!shouldInitialize) {
      setInitialFiles(files);
    }

    // remove all files
    onChange([]);
  };

  // initialize files
  const onReset = () => {
    if (rest.multiple) {
      onChange(initialFiles);
    } else {
      onChange(initialFiles[0] || null);
    }
    onError?.('');
  };

  return (
    <div>
      <StyledDropzone {...getRootProps()} error={isDragReject || !!error} hasFiles={hasImagePreviews}>
        <input {...getInputProps()} />
        {isDragActive && (
          <Box sx={sx.prompt}>
            <Typography sx={{ fontSize: INPUT_FONT_SIZE, fontWeight: 500 }}>
              {t('dropFileHere')} ...
            </Typography>
          </Box>
        )}

        {/* ----- picked images fill the frame once there is at least one ----- */}
        {!isDragActive && hasImagePreviews && (
          <ImagesPreview files={imagesOrVideosPreview} onAdd={open} onRemoveFile={removeFile} />
        )}

        {/* ----- empty prompt ----- */}
        {!isDragActive && !hasImagePreviews && (
          <Box sx={sx.prompt}>
            <Box sx={{ display: 'flex', color: 'text.secondary' }}>
              <FiUpload size={DROPZONE_ICON_SIZE} strokeWidth={1.5} />
            </Box>
            <Typography sx={{ fontSize: INPUT_FONT_SIZE }}>
              {inputLabel}
            </Typography>
            <Typography
              sx={[{
                fontSize: FONT_SIZE_META,
              }, error ? {
                color: theme.palette.error.main,
              } : {
                color: getDesignTokens(theme).textSecondary,
              }]}
            >
              {t('orDragAnDropFile')}
            </Typography>
          </Box>
        )}
      </StyledDropzone>
      {helperText && !error && <FormHelperText>{helperText}</FormHelperText>}
      {error && <FormHelperText error>{error}</FormHelperText>}
      {/* ----- non-image files keep their own list under the frame ----- */}
      {otherFilesPreview.length > 0 && (
        <FilesPreview files={otherFilesPreview} onRemoveAll={removeAll} onRemoveFile={removeFile} />
      )}
      {shouldReset && (
        <InputActionButton
          color={theme.palette.primary.main}
          icon={<FiRefreshCcw size={18} />}
          onClick={onReset}
          text={t('reset')}
        />
      )}
    </div>
  );
};

export default DropzoneInput;
