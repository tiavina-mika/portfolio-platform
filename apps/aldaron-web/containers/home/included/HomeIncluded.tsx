import { useTranslations } from 'next-intl';

import PageSection from '@/components/layouts/PageSection';
import SectionIntro from '@/components/layouts/SectionIntro';
import {
  Card, CardContent, CardEyebrow, CardHeader, CardTitle,
} from '@/components/ui/Card';
import Price from '@/containers/currency/Price';
import { cn } from '@/utils/app.utils';
import { HOME_EXCLUDED_KEYS, HOME_INCLUDED_KEYS } from '@/utils/home.constants';

const TITLE_ID = 'home-included-title';

type ListProps = {
  /**
   * The mono sign before each line: `+` for what is included, `−` for what is not
   */
  sign: string;
  lines: string[];
  isMuted?: boolean;
};

const IncludedList = ({ sign, lines, isMuted = false }: ListProps) => (
  <ul className="m-0 grid list-none gap-3 p-0 text-base leading-[1.45]">
    {lines.map(line => (
      <li className="flex gap-2.5" key={line}>
        <span
          aria-hidden
          className={cn('font-mono text-[15px] leading-[1.45]', isMuted && 'text-muted-foreground')}
        >
          {sign}
        </span>
        <Price text={line} />
      </li>
    ))}
  </ul>
);

/**
 * What the price covers (on the inverted card, the offer put forward) and what stays at the client's
 * expense
 */
const HomeIncluded = () => {
  const t = useTranslations('Home.included');

  return (
    <PageSection aria-labelledby={TITLE_ID} id="included">
      <SectionIntro eyebrow={t('eyebrow')} title={t('title')} titleId={TITLE_ID} />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-stretch gap-4">
        <Card as="section" variant="inverted">
          <CardHeader>
            <div>
              <CardEyebrow>{t('yes.eyebrow')}</CardEyebrow>
              <CardTitle gutterBottom={false} level={3}>{t('yes.title')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <IncludedList
              lines={HOME_INCLUDED_KEYS.map(key => t(`yes.items.${key}`))}
              sign="+"
            />
          </CardContent>
        </Card>
        <Card as="section">
          <CardHeader>
            <div>
              <CardEyebrow>{t('no.eyebrow')}</CardEyebrow>
              <CardTitle gutterBottom={false} level={3}>{t('no.title')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <IncludedList
              isMuted
              lines={HOME_EXCLUDED_KEYS.map(key => t(`no.items.${key}`))}
              sign="−"
            />
          </CardContent>
        </Card>
      </div>
    </PageSection>
  );
};

export default HomeIncluded;
