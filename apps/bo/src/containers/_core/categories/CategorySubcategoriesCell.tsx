import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import { TABLE_CELL_LINE_GAP } from '@/constants/_core/ui/list.constants';
import { ICategory } from '@/types/_core/category.type';

const classes = {
  root: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${TABLE_CELL_LINE_GAP}px`,
    whiteSpace: 'nowrap' as const,
  },
};

type Props = {
  category: ICategory;
};

/**
 * How the category branches, and how much of that branch is switched on. The second line only
 * shows when the two figures differ: a category whose subcategories are all active has nothing to
 * act on, and repeating the same number under itself in every row would bury the ones that do.
 */
const CategorySubcategoriesCell = ({ category }: Props) => {
  const { t } = useTranslation(['cms']);

  const subcategoriesCount = category.subcategoriesCount ?? 0;
  const activeSubcategoriesCount = category.activeSubcategoriesCount ?? 0;

  if (subcategoriesCount === 0) {
    return <Typography variant="body2">{t('cms:category.noSubcategory')}</Typography>;
  }

  return (
    <Box css={classes.root}>
      <Typography variant="subtitle1">
        {t('cms:category.subcategoriesCount', { count: subcategoriesCount })}
      </Typography>
      {activeSubcategoriesCount !== subcategoriesCount && (
        <Typography variant="body2">
          {t('cms:category.activeSubcategoriesCount', { count: activeSubcategoriesCount })}
        </Typography>
      )}
    </Box>
  );
};

export default CategorySubcategoriesCell;
