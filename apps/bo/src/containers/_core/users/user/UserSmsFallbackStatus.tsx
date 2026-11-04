import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

type Props = {
  // false when the member turned the fallback SMS off in their app
  isEnabled: boolean;
};

/**
 * Whether the member accepts the fallback SMS, stated above their notifications so that support can
 * answer "why did I get no text?" — a text that was never sent because the member switched it off
 * looks, in the table below, exactly like one that was never tried. Read-only on purpose: the
 * setting is the member's own, and only they change it, from their app.
 */
const UserSmsFallbackStatus = ({ isEnabled }: Props) => {
  const { t } = useTranslation(['user']);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Typography component="span" variant="subtitle2">
          {t('user:detail.smsFallback.label')}
        </Typography>
        <Chip
          color={isEnabled ? 'success' : 'default'}
          label={isEnabled ? t('user:detail.smsFallback.enabled') : t('user:detail.smsFallback.disabled')}
          size="small"
        />
      </Box>
      <Typography sx={{ color: 'text.secondary' }} variant="body2">
        {isEnabled ? t('user:detail.smsFallback.enabledHint') : t('user:detail.smsFallback.disabledHint')}
      </Typography>
    </Box>
  );
};

export default UserSmsFallbackStatus;
