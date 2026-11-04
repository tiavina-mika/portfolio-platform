import {
  Box,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import {
  ChangeEvent, MouseEvent, useRef, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { BsFiletypeJson } from 'react-icons/bs';
import { FiDownload, FiUpload } from 'react-icons/fi';
import { MdClose } from 'react-icons/md';
import { z } from 'zod';

import { triggerDownload } from '@/utils/_core/download.utils';
import { parseDBJsonToJson } from '@/utils/_core/parse.utils';
import { generateZodEmptyTemplate } from '@/utils/_core/zodSchema.utils';

export interface IJsonUploadButtonProps<T extends z.ZodTypeAny> {
  /** Zod schema to validate the JSON content */
  schema: T;
  /** Callback called when the JSON is valid */
  onSuccess?: (data: z.infer<T>) => void;
  /** Icon size */
  size?: number;
  /** Additional classes / sx */
  sx?: object;
  fieldsToIgnore?: string[];
  onTransformDataBeforeValidate?: (data: any) => any | Promise<any>;
  /**
   * Schema describing the database JSON shape (not the form shape) used to build the
   * downloadable template. Defaults to `schema` — only correct when there is no
   * `onTransformDataBeforeValidate` (i.e. `schema` already matches the database shape).
   */
  templateSchema?: z.ZodTypeAny;
  downloadFilename?: string;
  type?: 'menu' | 'direct-upload';
}

const JsonUploadButton = <T extends z.ZodTypeAny>({
  schema,
  onSuccess,
  onTransformDataBeforeValidate,
  size = 22,
  fieldsToIgnore = [],
  sx = {},
  templateSchema,
  downloadFilename,
}: IJsonUploadButtonProps<T>) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(menuAnchorEl);

  const { t } = useTranslation('common');
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  const handleOpenMenu = (event: MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };

  const handleUploadJsonMenuItemClick = () => {
    handleCloseMenu();
    fileInputRef.current?.click();
  };

  const handleDownloadTemplateMenuItemClick = () => {
    handleCloseMenu();

    const template = generateZodEmptyTemplate(templateSchema ?? schema);
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });

    triggerDownload(blob, downloadFilename ?? 'template.json');
  };

  const resetInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    setFileName(null);
    resetInput();
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // 1. Check if the file is a JSON
    const isJson =
      file.type === 'application/json' ||
      file.name.toLowerCase().endsWith('.json');

    if (!isJson) {
      enqueueSnackbar(t('jsonUpload.fileTypeNotAllowed'), { variant: 'error' });
      setFileName(null);
      resetInput();
      return;
    }

    setIsLoading(true);

    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        let json = JSON.parse(content);

        // 2. Remove ignored fields
        if (fieldsToIgnore.length > 0) {
          json = parseDBJsonToJson(json, fieldsToIgnore);
        }

        if (onTransformDataBeforeValidate) {
          json = await onTransformDataBeforeValidate(json);
        }

        // 3. Validation Zod
        const result = schema.safeParse(json);

        if (!result.success) {
          const messages = result.error.issues
            .map(
              (issue) =>
                `• ${issue.path.join('.') || 'root'}: ${issue.message}`
            )
            .join('\n');

          enqueueSnackbar(
            <Box component="span" sx={{ whiteSpace: 'pre-line' }}>
              {`${t('jsonUpload.invalidJson')}\n${messages}`}
            </Box>,
            { variant: 'error' }
          );
          setFileName(null);
          resetInput();
          return;
        }

        // 4. Success
        setFileName(file.name);
        onSuccess?.(result.data);
      } catch {
        enqueueSnackbar(t('jsonUpload.invalidJson'), { variant: 'error' });
        setFileName(null);
        resetInput();
      } finally {
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      enqueueSnackbar(t('jsonUpload.readError'), { variant: 'error' });
      setFileName(null);
      resetInput();
      setIsLoading(false);
    };

    reader.readAsText(file);
  };

  return (
    <Box sx={{ ...sx }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {/* Menu trigger */}
        <Tooltip title={isLoading ? t('jsonUpload.uploading') : t('jsonUpload.menuLabel')}>
          <IconButton
            aria-controls={isMenuOpen ? 'json-upload-menu' : undefined}
            aria-expanded={isMenuOpen ? true : undefined}
            aria-haspopup="true"
            aria-label={t('jsonUpload.menuLabel')}
            disabled={isLoading}
            id="json-upload-menu-button"
            onClick={handleOpenMenu}
            sx={{
              width: 48,
              height: 48,
              color: 'grey.600',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'primary.50',
                color: 'primary.main',
              },
              '&.Mui-disabled': {
                opacity: 0.5,
              },
            }}
          >
            {isLoading ? (
              <CircularProgress size={size} />
            ) : (
              <BsFiletypeJson size={size} />
            )}
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={menuAnchorEl}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          id="json-upload-menu"
          onClose={handleCloseMenu}
          open={isMenuOpen}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          slotProps={{
            list: { 'aria-labelledby': 'json-upload-menu-button' },
            paper: { sx: { maxWidth: 320 } },
          }}
        >
          <MenuItem onClick={handleUploadJsonMenuItemClick}>
            <ListItemIcon>
              <FiUpload size={18} />
            </ListItemIcon>
            <ListItemText
              primary={t('jsonUpload.uploadJsonFile')}
              secondary={t('jsonUpload.uploadJsonFileDescription')}
              slotProps={{ secondary: { sx: { whiteSpace: 'normal' } } }}
            />
          </MenuItem>
          <MenuItem onClick={handleDownloadTemplateMenuItemClick}>
            <ListItemIcon>
              <FiDownload size={18} />
            </ListItemIcon>
            <ListItemText
              primary={t('jsonUpload.downloadJsonTemplate')}
              secondary={t('jsonUpload.downloadJsonTemplateDescription')}
              slotProps={{ secondary: { sx: { whiteSpace: 'normal' } } }}
            />
          </MenuItem>
        </Menu>

        {/* File name / helper */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {fileName ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BsFiletypeJson color={theme.palette.success.main} size={18} />
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {fileName}
              </Typography>
              <IconButton
                onClick={handleRemove}
                size="small"
                sx={{ color: 'grey.500', '&:hover': { color: 'error.main' } }}
              >
                <MdClose size={18} />
              </IconButton>
            </Box>
          ) : null}
        </Box>
      </Box>

      {/* Hidden input */}
      <input
        accept=".json,application/json"
        onChange={handleChange}
        ref={fileInputRef}
        style={{ display: 'none' }}
        type="file"
      />
    </Box>
  );
};

export default JsonUploadButton;
