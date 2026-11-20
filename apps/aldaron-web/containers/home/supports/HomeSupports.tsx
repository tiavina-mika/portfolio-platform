import { useTranslations } from 'next-intl';

import PageSection from '@/components/layouts/PageSection';
import SectionIntro from '@/components/layouts/SectionIntro';
import {
  Card, CardContent, CardDescription, CardEyebrow, CardHeader, CardTitle,
} from '@/components/ui/Card';
import Price from '@/containers/currency/Price';
import { HOME_SUPPORT_KEYS } from '@/utils/home.constants';

const TITLE_ID = 'home-supports-title';

/**
 * What Aldaron builds: one card per support (static site, web app, mobile app, back office) with its
 * price per screen, then the minimum order
 */
const HomeSupports = () => {
  const t = useTranslations('Home.supports');

  return (
    <PageSection aria-labelledby={TITLE_ID} id="supports">
      <SectionIntro
        description={t('description')}
        eyebrow={t('eyebrow')}
        title={t('title')}
        titleId={TITLE_ID}
      />
      <ul
        className={'m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(240px,1fr))] items-stretch gap-4 p-0'}
      >
        {HOME_SUPPORT_KEYS.map(key => (
          <li className="flex" key={key}>
            <Card as="article">
              <CardHeader>
                <div>
                  <CardEyebrow>{t(`items.${key}.eyebrow`)}</CardEyebrow>
                  <CardTitle gutterBottom={false} level={3}>{t(`items.${key}.title`)}</CardTitle>
                  <CardDescription>{t(`items.${key}.description`)}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <b
                  className={'font-display text-2xl leading-[1.2] font-bold tracking-[-0.02em] tabular-nums'}
                >
                  <Price text={t(`items.${key}.price`)} />
                </b>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
      <p className="m-0 font-mono text-sm leading-normal font-medium text-muted-foreground">
        <Price text={t('minimumNote')} />
      </p>
    </PageSection>
  );
};

export default HomeSupports;
