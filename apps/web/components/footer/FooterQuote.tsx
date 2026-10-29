import { getCachedApp } from '@/app/[locale]/page';
import { Locale } from '@/i18n/config';
import { IAppTranslated } from '@/types/app.type';

import Text from '../typography/Text';

type Props = {
  locale: Locale;
};

const FooterQuote = async ({ locale }: Props) => {
  const app = await getCachedApp();

  if (!app) return null;
  if (!app.has('translated')) return null;
  const translated: IAppTranslated = app.get('translated') || {};

  return (

    <Text className={`
      w-full leading-7
      max-md:text-base
    `}
    >
      {translated[locale].quote}
    </Text>
  );
};

export default FooterQuote;
