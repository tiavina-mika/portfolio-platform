/**
 * Since this is a dynamic component
 * We will not be able to provide a story for this component
 * To test the footer component, you can use the story for the FooterContainer component
 */
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { Locale } from '@/i18n/config';
import { ROUTES } from '@/i18n/routes';
import { ISelectOption } from '@/types/app.type';
import { CONTACTS } from '@/utils/constants';

import DynamicFooterLinks from './DynamicFooterLinks';
import FooterContainer from './FooterContainer';
import FooterQuote from './FooterQuote';
import Skeleton from './FooterSkeleton';
import { Skeleton as UISkeleton } from '../ui/Skeleton';

type Props = {
  locale: Locale;
};

const Footer = async ({ locale }: Props) => {
  const t = await getTranslations({ locale, namespace: 'Footer' });

  const links: ISelectOption[] = [
    { label: t('contactMe'), value: ROUTES.contact },
    { label: t('myProjects'), value: ROUTES.projects.root },
    { label: t('siteMap'), value: ROUTES.sitemap },
  ];

  return (
    <FooterContainer
      contacts={CONTACTS}
      links={links}
      dynamicLinks={(
        // the static links show at once, the CMS ones stream in (and silently stay out on an error)
        <ErrorBoundary fallback={null}>
          <Suspense fallback={<Skeleton />}>
            <DynamicFooterLinks locale={locale} />
          </Suspense>
        </ErrorBoundary>
      )}
      quote={(
        <ErrorBoundary fallback={null}>
          <Suspense
            fallback={(
              <UISkeleton
                aria-hidden="true"
                className={`
                  h-7 w-4/5
                  max-md:h-[18px]
                `}
              />
            )}
          >
            <FooterQuote locale={locale} />
          </Suspense>
        </ErrorBoundary>
      )}
    />
  );
};

export default Footer;
