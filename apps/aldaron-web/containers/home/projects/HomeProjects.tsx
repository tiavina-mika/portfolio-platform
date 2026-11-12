import { useTranslations } from 'next-intl';

import NonPaginatedProjects from '@/containers/project/NonPaginatedProjects';
import { Locale } from '@/i18n/config';

type Props = {
  locale: Locale;
};

/**
 * The latest projects of the home page, under a short introduction: skeleton cards while they load, a
 * banner with a retry (or an offline notice) if they fail, nothing when none is published yet
 */
const HomeProjects = ({ locale }: Props) => {
  const t = useTranslations('HomeProjects');

  return (
    <NonPaginatedProjects
      description={t('description')}
      listClassName="max-md:pt-12"
      locale={locale}
      className={`
        mt-2 mb-20
        lg:mb-24
      `}
    />
  );
};

export default HomeProjects;
