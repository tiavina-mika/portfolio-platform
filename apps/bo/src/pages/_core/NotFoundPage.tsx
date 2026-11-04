import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import ErrorFallbackCard from '@/components/ErrorFallbackCard';
import { PATH_NAMES } from '@/utils/_core/pathnames';

// mounted as the root's not-found component, so it renders outside the dashboard shell
const NotFoundPage = () => {
  const {
    t,
  } = useTranslation();
  const navigate = useNavigate();

  const goToHome = () => navigate({ to: PATH_NAMES.home });

  return (
    <ErrorFallbackCard
      actionLabel={t('returnToHome')}
      code="404"
      message={t('pageNotFound')}
      onAction={goToHome}
    />
  );
};

export default NotFoundPage;
