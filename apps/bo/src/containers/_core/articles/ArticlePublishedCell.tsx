import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import { TABLE_CELL_LINE_GAP } from '@/constants/_core/ui/list.constants';
import { DateType } from '@/types/_core/utils.type';
import { displayDate, fromNow } from '@/utils/_core/date.utils';

const classes = {
  root: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${TABLE_CELL_LINE_GAP}px`,
    whiteSpace: 'nowrap' as const,
  },
};

type Props = {
  publishedAt: DateType | undefined;
  updatedAt: DateType | undefined;
};

/**
 * When the article went out, and when it was last touched. The exact stamp is what an editor
 * quotes in a publishing plan; the relative line under it is what tells them, without any
 * arithmetic, whether the piece has been left alone since — the pair is what a content review is
 * actually run on.
 */
const ArticlePublishedCell = ({
  publishedAt, updatedAt,
}: Props) => {
  const { t } = useTranslation(['common']);

  if (!publishedAt) return null;

  return (
    <Box css={classes.root}>
      <Typography variant="body1">{displayDate(publishedAt, true, true)}</Typography>
      {updatedAt && (
        <Typography title={t('common:updatedAt')} variant="body2">{fromNow(updatedAt)}</Typography>
      )}
    </Box>
  );
};

export default ArticlePublishedCell;
