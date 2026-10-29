
import {
  Box, FormHelperText, Stack, styled, Typography, useTheme,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import { uniqBy } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { type DropzoneOptions, type FileRejection, useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { FaFileUpload } from 'react-icons/fa';
import { FiRefreshCcw } from 'react-icons/fi';

import { convertFileSizeToBytes } from '@/utils/file.utils';

import FilesPreview from './FilesPreview';
import ImagesPreview from './ImagesPreview';
import InputActionButton from './InputActionButton';

// -------------- styled dropzone -------------- //
type StyleDropzoneProps = {
  error: boolean;
};
const StyledDropzone = styled('div', { shouldForwardProp: prop => prop !== 'error' })<StyleDropzoneProps>(({
  theme, error,
}) => ({
  border: '1px solid ' + (error
    ? theme.palette.error.main
    : grey[300]),

  borderRadius: 6,
  height: 266,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: theme.palette.background.default,

  ...theme.applyStyles('light', {
    background: 'none',
  }),
}));

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
    [onChange, files, onError, noDuplicateFiles, rest.maxFiles, shouldInitialize, t]
  );

  const {
    getRootProps, getInputProps, isDragActive, isDragReject,
  } = useDropzone({
    onDrop,
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
    (
      <div>
        <StyledDropzone {...getRootProps()} className="flexColumn" error={isDragReject || !!error}>
          <input {...getInputProps({ onChange, onBlur })} />
          {isDragActive
            ? (
              <Typography>{t('dropFileHere')} ...</Typography>
            ) : (
          // input labels
              (
                <Stack alignItems="center" direction="column" spacing={2}>
                  <FaFileUpload color={grey[600]} size={32} />
                  <Box alignItems="center" display="flex" flexDirection="column">
                    <Typography>{inputLabel}</Typography>
                    <Typography
                      variant="body2"
                      sx={[error ? {
                        color: theme.palette.error.main,
                      } : {
                        color: grey[600],
                      }]}
                    >
                      {t('orDragAnDropFile')}
                    </Typography>
                  </Box>
                </Stack>
              )
            )}
        </StyledDropzone>
        {helperText && !error && <FormHelperText>{helperText}</FormHelperText>}
        {error && <FormHelperText error>{error}</FormHelperText>}
        {/* ----- image previews ----- */}
        {imagesOrVideosPreview.length > 0 && (
          <ImagesPreview files={imagesOrVideosPreview} onRemoveAll={removeAll} onRemoveFile={removeFile} />
        )}
        {otherFilesPreview.length > 0 && (
          <FilesPreview files={otherFilesPreview} onRemoveAll={removeAll} onRemoveFile={removeFile} />
        )}
        {shouldReset && (
          <InputActionButton
            color={theme.palette.primary.main}
            icon={<FiRefreshCcw size={18} />}
            text={t('reset')}
            onClick={onReset}
          />
        )}
      </div>
    )
  );
};

export default DropzoneInput;
