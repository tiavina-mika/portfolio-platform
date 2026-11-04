import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import { TABLE_CELL_LINE_GAP } from '@/constants/_core/ui/list.constants';
import { ICategory } from '@/types/_core/category.type';

const classes = {
  root: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-end',
    gap: `${TABLE_CELL_LINE_GAP}px`,
    whiteSpace: 'nowrap' as const,
  },
};

type Props = {
  category: ICategory;
};

/**
 * How much content the category files, and how much of that is live on the website. The second
 * line only shows when the two figures differ — an entirely published shelf has nothing to act on,
 * and the point of the line is to single out the ones that do.
 *
 * A binned category reports zero here rather than what it used to hold: trashing it unfiles every
 * article and page from it, so zero is what it files now.
 */
const CategoryItemsCell = ({ category }: Props) => {
  const { t } = useTranslation(['cms']);

  const itemsCount = category.itemsCount ?? 0;
  const publishedItemsCount = category.publishedItemsCount ?? 0;

  return (
    <Box css={classes.root}>
      <Typography variant="subtitle1">{itemsCount}</Typography>
      {publishedItemsCount !== itemsCount && (
        <Typography variant="body2">
          {t('cms:category.publishedItemsCount', { count: publishedItemsCount })}
        </Typography>
      )}
    </Box>
  );
};

export default CategoryItemsCell;
