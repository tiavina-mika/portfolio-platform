import {
  Button, Stack, Typography, useTheme,
} from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { FaCheckCircle } from 'react-icons/fa';
import { useSelector } from 'react-redux';

import {
  AUTH_SUCCESS_ICON_SIZE, AUTH_SUCCESS_TEXT_FONT_SIZE, AUTH_SUCCESS_TITLE_FONT_SIZE,
} from '@/constants/_core/ui/ui.constants';
import { goToHome } from '@/redux/actions/_core/app.action';
import { getAppAlertSelector } from '@/redux/reducers/_core/app.reducer';

const AccountSuccessMessage = () => {
  const alert = useSelector(getAppAlertSelector);

  const theme = useTheme();
  const {
    t,
  } = useTranslation(['user']);
  const navigate = useNavigate();

  // for react router error, go to home page instead, then it redirect to the login page
  const handleGoToHome = () => navigate(goToHome());

  return (
    <Stack spacing={3}>
      <Stack spacing={1.5} sx={{ alignItems: 'center' }}>
        <FaCheckCircle aria-hidden color={theme.palette.success.main} size={AUTH_SUCCESS_ICON_SIZE} />
        {alert.title && (
          <Typography
            align="center"
            sx={{ color: 'success.main', fontSize: AUTH_SUCCESS_TITLE_FONT_SIZE, fontWeight: 600 }}
          >
            {alert.title}
          </Typography>
        )}
      </Stack>
      <Typography
        align="center"
        sx={{ color: 'text.primary', fontSize: AUTH_SUCCESS_TEXT_FONT_SIZE, lineHeight: 1.5 }}
      >
        {alert.message}
      </Typography>
      <Button
        fullWidth
        onClick={handleGoToHome}
        size="large"
        variant="contained"
      >
        {t('user:login')}
      </Button>
    </Stack>
  );
};

export default AccountSuccessMessage;
