import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { TABLE_CELL_LINE_GAP } from '@/constants/_core/ui/list.constants';
import { ICategory, ICategoryTranslatedFields } from '@/types/_core/category.type';
import { Locale } from '@/types/_core/setting.type';
import { getTranslatedField } from '@/utils/_core/settings.utils';

const classes = {
  root: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${TABLE_CELL_LINE_GAP}px`,
    minWidth: 0,
  },
};

type Props = {
  category: ICategory;
  locale: Locale;
};

const getCategoryName = (category: ICategory, locale: Locale): string =>
  getTranslatedField<ICategoryTranslatedFields>(category.translated, locale, 'name');

// ancestors from root to immediate parent, e.g. [level1, level2] (max depth: 3 levels, see ICategory)
const getAncestorNames = (category: ICategory, locale: Locale): string[] => {
  const ancestorNames: string[] = [];
  let current = category.parentCategory;

  while (current) {
    ancestorNames.unshift(getCategoryName(current, locale));
    current = current.parentCategory;
  }

  return ancestorNames;
};

/**
 * Which category the row is: the name it is called by, and under it the two things that place it
 * beyond that name — the branch it hangs from and the technical code the apps look it up with.
 * Both fold into this cell rather than taking a column each: neither is ever scanned down a column
 * on its own, and every extra column costs width the names need.
 *
 * The ancestors are spelled out rather than drawn as an indent: the list is sorted on whichever
 * column the reader picked, so a child rarely sits under its own parent, and an indent with no
 * parent above it reads as a broken tree instead of as a path.
 */
const CategoryNameCell = ({ category, locale }: Props) => {
  const name = getCategoryName(category, locale);
  const ancestorNames = getAncestorNames(category, locale);

  const meta = [ancestorNames.join(' > '), category.code].filter(Boolean).join(' · ');

  return (
    <Box css={classes.root}>
      <Typography noWrap variant="subtitle1">{name}</Typography>
      {meta && <Typography noWrap variant="body2">{meta}</Typography>}
    </Box>
  );
};

export default CategoryNameCell;
