import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';

import { TABLE_CELL_LINE_GAP } from '@/constants/_core/ui/list.constants';
import { ICategory, ICategoryTranslatedFields } from '@/types/_core/category.type';
import { Locale } from '@/types/_core/setting.type';
import { getTranslatedField } from '@/utils/_core/settings.utils';

const classes = {
  root: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: `${TABLE_CELL_LINE_GAP}px`,
  },
};

type Props = {
  categories: ICategory[] | undefined;
  locale: Locale;
};

/**
 * Which shelves the page sits on. One chip per category rather than one chip holding them joined:
 * a page carries a handful at most, and a single run-on chip cannot be read for the one category
 * the eye is scanning the column for.
 */
const PageCategoriesCell = ({
  categories, locale,
}: Props) => {
  if (!categories?.length) return null;

  return (
    <Box css={classes.root}>
      {categories.map((category: ICategory) => (
        <Chip
          // a category included in another object is plain JSON: it carries `objectId`, never `id`
          key={category.objectId}
          label={getTranslatedField<ICategoryTranslatedFields>(category.translated, locale, 'name')}
          size="small"
        />
      ))}
    </Box>
  );
};

export default PageCategoriesCell;
