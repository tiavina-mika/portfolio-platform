import { useTranslations } from 'next-intl';

import PageSection from '@/components/layouts/PageSection';
import SectionIntro from '@/components/layouts/SectionIntro';
import {
  Card, CardDescription, CardEyebrow, CardHeader, CardTitle,
} from '@/components/ui/Card';

const PRINCIPLES = ['1', '2', '3'];

/**
 * How Aldaron works, as numbered principles, one card each
 */
const AboutPrinciples = () => {
  const t = useTranslations('AboutPage.principles');

  return (
    <PageSection aria-labelledby="about-principles-title">
      <SectionIntro eyebrow={t('eyebrow')} title={t('title')} titleId="about-principles-title" />
      <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-4 p-0">
        {PRINCIPLES.map(key => (
          <li className="flex min-w-0" key={key}>
            <Card className="h-full">
              <CardHeader className="pb-(--card-pad)!">
                <div>
                  <CardEyebrow>{`0${key}`}</CardEyebrow>
                  <CardTitle gutterBottom={false} level={3}>{t(`items.${key}.title`)}</CardTitle>
                  <CardDescription>{t(`items.${key}.description`)}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </li>
        ))}
      </ul>
    </PageSection>
  );
};

export default AboutPrinciples;
