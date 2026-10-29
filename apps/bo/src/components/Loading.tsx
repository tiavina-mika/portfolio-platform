import { LinearProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';

type Props = {
  loading: boolean;
};
const Loading = ({
  loading,
}: Props) => {
  const { t } = useTranslation();

  return loading
    ? (
      <LinearProgress
        aria-label={t('loading')}
        color="primary"
        sx={{
          position: 'fixed', top: 0, width: '100%', height: 6, zIndex: 2000,
        }}
      />
    )
    : null;
};

export default Loading;
