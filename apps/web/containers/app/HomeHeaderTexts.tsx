import { getCachedApp } from '@/app/[locale]/page';
import { Locale } from '@/i18n/config';
import { getTranslatedField } from '@/utils/translation.utils';

import ReadOnlyTextCodeEditor from '../articles/ReadOnlyTextCodeEditor';

type Props = {
  locale: Locale;
};

const HomeHeaderTexts = async ({ locale }: Props) => {
  const app = await getCachedApp();

  if (!app) return null;
  if (!app.has('translated')) return null;
  const translated = app.get('translated');

  return (
    <ReadOnlyTextCodeEditor
      content={getTranslatedField(translated, locale, 'description')}
    />
  );
};

export default HomeHeaderTexts;
