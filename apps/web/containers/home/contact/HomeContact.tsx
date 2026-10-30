import { useTranslations } from 'next-intl';

import Socials from '@/components/footer/Socials';
import Block from '@/components/layouts/Block';
import ContactForm from '@/containers/contact/ContactForm';
import { Locale } from '@/i18n/config';

type Props = {
  locale: Locale;
};

/**
 * The contact block of the home page: the pitch, the contact form and the social networks
 */
const HomeContact = ({ locale }: Props) => {
  const t = useTranslations('HomeContact');

  return (
    <Block
      description={t('description')}
      rootClassName="md:!w-[700px]"
      title={t('title')}
      className={`
        flex flex-col items-start justify-center
        md:items-center
      `}
    >
      <div className={`
        flex flex-col gap-6
        xs:max-md:self-stretch
        md:w-[500px] md:gap-10
      `}
      >
        <ContactForm locale={locale} />
        <Socials />
      </div>
    </Block>
  );
};

export default HomeContact;
