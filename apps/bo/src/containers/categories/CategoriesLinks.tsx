import { Link } from '@tanstack/react-router';

import { ICategory, ICategoryTranslatedFields } from '@/types/category.type';
import { Locale } from '@/types/setting.type';
import { getTranslatedField } from '@/utils/settings.utils';

type Props = {
  categories: ICategory[];
  locale: Locale;
  to: string;
};
const CategoriesLinks = ({ locale, to, categories = [] }: Props) => {
  return (
    <div>
      {categories.map((category: ICategory) => (
        <Link
          key={category.id}
          search={{ category: category.id }}
          to={to}
        >
          {getTranslatedField<ICategoryTranslatedFields>(
            category.get('translated'),
            locale,
            'name'
          )}
        </Link>
      ))}
    </div>
  );
};

export default CategoriesLinks;
