import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import { TABLE_CELL_LINE_GAP } from '@/constants/_core/ui/list.constants';
import { ICategory } from '@/types/_core/category.type';
import {
  getCategoryEntityLabel, getCategoryLabelColor, getCategoryTranslationsCount,
} from '@/utils/_core/cms.utils';

const classes = {
  root: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    gap: `${TABLE_CELL_LINE_GAP}px`,
    whiteSpace: 'nowrap' as const,
  },
};

type Props = {
  category: ICategory;
};

/**
 * What the category files, and in how many languages it is named. The two travel together because
 * they answer the same question about the shelf itself rather than about its contents — a category
 * named in a single language is, on a trilingual site, only usable on a third of it, whatever it
 * holds.
 */
const CategoryEntityCell = ({ category }: Props) => {
  const { t } = useTranslation(['cms']);

  const translationsCount = getCategoryTranslationsCount(category);

  return (
    <Box css={classes.root}>
      <Chip
        color={getCategoryLabelColor(category.entity)}
        label={getCategoryEntityLabel(category.entity)}
        variant="outlined"
      />
      <Typography variant="body2">
        {t('cms:languagesCount', { count: translationsCount })}
      </Typography>
    </Box>
  );
};

export default CategoryEntityCell;
