import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { useTranslation } from 'react-i18next';
import { FiRefreshCw } from 'react-icons/fi';

import {
  DASHBOARD_ERROR_GAP, DASHBOARD_ERROR_PADDING_X, DASHBOARD_ERROR_PADDING_Y,
} from '@/constants/_core/ui/chart.constants';
import { PAGE_HEAD_ACTION_ICON_SIZE } from '@/constants/_core/ui/page.constants';

const classes = {
  content: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: `${DASHBOARD_ERROR_GAP}px`,
    padding: `${DASHBOARD_ERROR_PADDING_Y}px ${DASHBOARD_ERROR_PADDING_X}px`,
    '&:last-child': { paddingBottom: `${DASHBOARD_ERROR_PADDING_Y}px` },
  },
  alert: { alignSelf: 'stretch' },
};

type Props = {
  onRetry: () => void;
};

/**
 * What the dashboard shows in place of its bands when its figures could not be read. The previous
 * figures are not kept on screen: a stale count on an alert card would be read as the backlog.
 */
const DashboardErrorCard = ({ onRetry }: Props) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardContent sx={classes.content}>
        <Alert css={classes.alert} severity="error">{t('dashboard:loadError')}</Alert>
        <Button
          onClick={onRetry}
          startIcon={<FiRefreshCw size={PAGE_HEAD_ACTION_ICON_SIZE} />}
          variant="outlined"
        >
          {t('common:refresh')}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DashboardErrorCard;
