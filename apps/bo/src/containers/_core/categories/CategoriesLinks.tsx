import Breadcrumbs from '@mui/material/Breadcrumbs';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { FiChevronRight } from 'react-icons/fi';

import { goToCategory } from '@/redux/actions/_core/category.action';
import { ICategory, ICategoryTranslatedFields } from '@/types/_core/category.type';
import { Locale } from '@/types/_core/setting.type';
import { getTranslatedField } from '@/utils/_core/settings.utils';

type Props = {
  categories: ICategory[];
  locale: Locale;
};

const getCategoryName = (category: ICategory, locale: Locale): string =>
  getTranslatedField<ICategoryTranslatedFields>(category.translated, locale, 'name');

// root -> ... -> category, following `parentCategory` (max depth 3 levels, see ICategory)
const getCategoryChain = (category: ICategory): ICategory[] => {
  const chain: ICategory[] = [];
  let current: ICategory | undefined = category;

  while (current) {
    chain.unshift(current);
    current = current.parentCategory;
  }

  return chain;
};

const CategoriesLinks = ({ locale, categories = [] }: Props) => {
  const { t } = useTranslation();

  return (
    <Stack spacing={0.5}>
      {categories.map((category: ICategory) => (
        <Breadcrumbs
          aria-label={t('breadcrumb')}
          key={category.objectId}
          separator={<FiChevronRight size={12} />}
        >
          {getCategoryChain(category).map((ancestor) => (
            <Link key={ancestor.objectId} {...goToCategory(ancestor.objectId)}>
              {getCategoryName(ancestor, locale)}
              {ancestor.objectId === category.objectId && ` (${category.itemCount || 0})`}
            </Link>
          ))}
        </Breadcrumbs>
      ))}
    </Stack>
  );
};

export default CategoriesLinks;
