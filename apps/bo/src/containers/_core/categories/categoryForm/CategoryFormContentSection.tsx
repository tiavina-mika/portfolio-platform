import { useTranslation } from 'react-i18next';

import type { Theme } from '@mui/material/styles';

import CardFormBlock from '@/components/form/CardFormBlock';
import TextField from '@/components/form/fields/TextField';
import { locales } from '@/config/i18n';
import { DEFAULT_LOCALE } from '@/constants/_core/app.constants';
import { Locale } from '@/types/_core/setting.type';

const classes = {
  // every language stays mounted so a refused field of a hidden tab keeps its error
  field: (isVisible: boolean) => (theme: Theme) => ({
    display: isVisible
      ? 'flex'
      : 'none',
    flexDirection: 'column' as const,
    gap: theme.spacing(2),
  }),
};

type Props = {
  /** the language tab picked in the header — only its name is shown */
  tab: Locale;
};

/**
 * What the category is called, in the language picked in the header. The name is only required in
 * the default language — the others fall back to it on the site — and it is what the slug is built
 * from while the slug is left empty.
 */
const CategoryFormContentSection = ({ tab }: Props) => {
  const {
    t,
  } = useTranslation(['common', 'cms']);

  return (
    <CardFormBlock title={t('cms:content')}>
      {locales.map((locale: string) => (
        <div css={classes.field(locale === tab)} key={locale}>
          <TextField
            fixedLabel
            fullWidth
            helperText={t('cms:category.slugFromNameHelper')}
            label={t('common:name')}
            name={locale + ':name'}
            placeholder={t('cms:category.theCategoryName')}
            required={locale === DEFAULT_LOCALE}
            type="text"
            variant="outlined"
          />
        </div>
      ))}
    </CardFormBlock>
  );
};

export default CategoryFormContentSection;
