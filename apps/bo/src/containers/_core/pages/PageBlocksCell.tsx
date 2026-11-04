import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import { TABLE_CELL_LINE_GAP } from '@/constants/_core/ui/list.constants';
import { IPage } from '@/types/_core/page.type';
import { getPageTranslationsCount } from '@/utils/_core/cms.utils';

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
  page: IPage;
};

/**
 * What the page is made of: the blocks its sections add up to, and how many languages that content
 * exists in. The two travel together because they answer the same question — a page with plenty of
 * blocks in a single language is as unfinished, for a trilingual site, as one with none at all.
 */
const PageBlocksCell = ({ page }: Props) => {
  const { t } = useTranslation(['cms']);

  const translationsCount = getPageTranslationsCount(page);

  return (
    <Box css={classes.root}>
      <Typography variant="subtitle1">{page.blocksCount ?? 0}</Typography>
      <Typography variant="body2">
        {t('cms:languagesCount', { count: translationsCount })}
      </Typography>
    </Box>
  );
};

export default PageBlocksCell;
