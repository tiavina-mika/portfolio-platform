import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import { TABLE_CELL_LINE_GAP } from '@/constants/_core/ui/list.constants';
import { IPage } from '@/types/_core/page.type';

const classes = {
  root: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${TABLE_CELL_LINE_GAP}px`,
    whiteSpace: 'nowrap' as const,
  },
};

type Props = {
  page: IPage;
};

/**
 * How much of the page is actually built, and how much of that is live. The second line only shows
 * when the two figures differ: a page whose sections are all published has nothing to act on, and
 * repeating the same number under itself in every row would bury the ones that do.
 */
const PageSectionsCell = ({ page }: Props) => {
  const { t } = useTranslation(['cms']);

  const sectionsCount = page.sectionsCount ?? 0;
  const publishedSectionsCount = page.publishedSectionsCount ?? 0;

  if (sectionsCount === 0) {
    return <Typography variant="body2">{t('cms:noSection')}</Typography>;
  }

  return (
    <Box css={classes.root}>
      <Typography variant="subtitle1">{t('cms:sectionsCount', { count: sectionsCount })}</Typography>
      {publishedSectionsCount !== sectionsCount && (
        <Typography variant="body2">
          {t('cms:publishedSectionsCount', { count: publishedSectionsCount })}
        </Typography>
      )}
    </Box>
  );
};

export default PageSectionsCell;
