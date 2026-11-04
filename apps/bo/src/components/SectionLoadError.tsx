import { Box, Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { FiRefreshCw } from 'react-icons/fi';

import { PREVIEW_SECTION_ERROR_GAP } from '@/constants/_core/ui/page.constants';

type Props = {
  onRetry?: () => void;
  message?: string;
};

/**
 * What a block states when its own rows could not be read: the rest of the page is still there, so
 * this is a sentence inside the block rather than an error page, and the way out of it reads that
 * one block again instead of the whole page.
 */
const SectionLoadError = ({ onRetry, message }: Props) => {
  const { t } = useTranslation();

  return (
    <Box
      role="alert"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: `${PREVIEW_SECTION_ERROR_GAP}px`,
      }}
    >
      <Typography color="textSecondary" variant="body2">
        {message ?? t('previewSection.loadError')}
      </Typography>
      {onRetry && (
        <Button
          onClick={onRetry}
          size="small"
          startIcon={<FiRefreshCw />}
          variant="outlined"
        >
          {t('refresh')}
        </Button>
      )}
    </Box>
  );
};

export default SectionLoadError;
