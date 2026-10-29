import {
  Stack, Tooltip, Typography, useTheme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { FiLock } from 'react-icons/fi';

import { DEFAULT_LOCALE } from '@/utils/constants';

type Props = {
  label: string;
  locale: string;
};

const LocaleTab = ({
  label, locale,
}: Props) => {
  const theme = useTheme();
  const {
    t,
  } = useTranslation();

  return (
    <Stack alignItems="center" direction="row" spacing={0.3}>
      <Typography>{label}</Typography>
      {locale === DEFAULT_LOCALE && (
        <Tooltip title={t('default')}>
          <div className="flexColumn">
            <FiLock color={theme.palette.info.main} size={16} />
          </div>
        </Tooltip>
      )}
    </Stack>
  );
};

export default LocaleTab;
