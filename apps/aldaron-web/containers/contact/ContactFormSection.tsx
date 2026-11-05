import { useTranslations } from 'next-intl';
import { ReactNode } from 'react';

import Section from '@/components/layouts/Section';
import PageDescription from '@/components/typography/PageDescription';
import PageTitle from '@/components/typography/PageTitle';
import { Card, CardContent } from '@/components/ui/Card';

type Props = {
  /**
   * The form, shown in the card on the right (under the intro on a narrow screen)
   */
  children: ReactNode;
  /**
   * The social networks, under the intro on the left (under the form on a narrow screen)
   */
  socials?: ReactNode;
};

/**
 * The contact page: the title (the only h1 of the page) and the intro, then the social networks, on
 * the left; the form in a card on the right. Everything stacks below xl, the social networks coming last.
 */
const ContactFormSection = ({ children, socials }: Props) => {
  const t = useTranslations('Contact');

  return (
    <Section
      rootClassName="mt-4 md:mt-8 xl:mt-12"
      className={`
        mb-15 flex flex-col gap-10
        md:gap-16
        lg:mb-20 lg:gap-20
        xl:mb-30 xl:flex-row xl:gap-24
      `}
    >
      <div className="flex flex-1 flex-col gap-10">
        <div>
          <PageTitle className="2xl:text-10xl!">{t('contactMe')}</PageTitle>
          <PageDescription>{t('description')}</PageDescription>
        </div>
        <div className="max-xl:order-last">{socials}</div>
      </div>
      <div className="flex-1">
        <Card>
          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </Section>
  );
};

export default ContactFormSection;
