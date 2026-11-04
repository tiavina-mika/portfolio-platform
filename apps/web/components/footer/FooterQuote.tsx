import { Locale } from '@/i18n/config';
import { getApp } from '@/server/queries/app.queries';

import Text from '../typography/Text';

type Props = {
  locale: Locale;
};

/**
 * The quote of the App object, in the language of the page (nothing when there is none)
 */
const FooterQuote = async ({ locale }: Props) => {
  const app = await getApp();
  const quote = app?.translated?.[locale]?.quote;

  if (!quote) return null;

  return (
    <Text className={`
      w-full leading-7
      max-md:text-base
    `}
    >
      {quote}
    </Text>
  );
};

export default FooterQuote;
