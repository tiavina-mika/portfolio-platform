import { type Theme } from '@emotion/react';
import { Paper } from '@mui/material';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { useBreakpoint } from '@/hooks/useBreakpoint';

const classes = {
  card: (theme: Theme) => ({
    [theme.breakpoints.between('sm', 'lg')]: { boxShadow: 'none' },
    padding: 16,
  }),
};
const NotFoundPage = () => {
  const {
    t,
  } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useBreakpoint();

  const goToHome = () => navigate({ to: '/' } as any);

  return (
    <Paper
      css={{ minHeight: '100vh' }}
      className={isMobile
        ? ''
        : 'flexCenter'}
    >
      <Card className="flexCenter" css={classes.card}>
        <CardContent className="flexCenter">
          <Typography
            gutterBottom
            className="grey300"
            css={{ fontWeight: 500 }}
            variant={isMobile
              ? 'h4'
              : 'h2'}
          >
            404
          </Typography>
          <Typography className="grey600" css={{ fontSize: 24, fontWeight: 'bold' }} variant="body2">
            {t('pageNotFound')}
          </Typography>
        </CardContent>
        <CardActions>
          <Button onClick={goToHome} variant="contained">{t('returnToHome')}</Button>
        </CardActions>
      </Card>
    </Paper>
  );
};

export default NotFoundPage;
