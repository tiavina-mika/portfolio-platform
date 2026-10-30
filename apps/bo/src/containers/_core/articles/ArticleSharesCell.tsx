import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import { TABLE_CELL_LINE_GAP } from '@/constants/_core/ui/list.constants';
import { IArticle } from '@/types/_core/article.type';

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
  article: IArticle;
};

/**
 * How far the article travelled off the site: the total shares, and under it how many networks
 * they came from. The spread is the part that decides what to do next — the same total from one
 * network is a channel that worked, from five it is a piece that carried on its own.
 */
const ArticleSharesCell = ({ article }: Props) => {
  const { t } = useTranslation(['cms']);

  const totalMediaShare = article.totalMediaShare || 0;
  const networksCount = Object.keys(article.shares || {}).length;

  return (
    <Box css={classes.root}>
      <Typography variant="subtitle1">{totalMediaShare.toLocaleString()}</Typography>
      <Typography variant="body2">
        {networksCount > 0
          ? t('cms:socialNetworksCount', { count: networksCount })
          : t('cms:noShare')}
      </Typography>
    </Box>
  );
};

export default ArticleSharesCell;
