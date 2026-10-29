import {
  Box, Button, Stack, Typography, useTheme,
} from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { FaCheckCircle } from 'react-icons/fa';
import { useSelector } from 'react-redux';

import { goToHome } from '@/redux/actions/app.action';
import { getAppAlertSelector } from '@/redux/reducers/app.reducer';

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
    <Box sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Box className="flexCenter">
          <FaCheckCircle color={theme.palette.success.main} size={40} />
          {alert.title && (
            <Typography color="success.main" sx={{ ml: 2, mt: 2 }} variant="h5">
              {alert.title}
            </Typography>
          )}
        </Box>
        <Box mt={3}>
          <Typography css={{ fontSize: 18, color: '#fff' }} textAlign="center">
            {alert.message}
          </Typography>
        </Box>
        <Button
          disableElevation
          sx={{ textTransform: 'capitalize' }}
          variant="contained"
          onClick={handleGoToHome}
        >
          {t('user:login')}
        </Button>
      </Stack>
    </Box>
  );
};

export default AccountSuccessMessage;
