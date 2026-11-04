import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import RowMeter from '@/components/table/RowMeter';
import { ROW_METER_GAP, ROW_METER_WIDTH } from '@/constants/_core/ui/list.constants';
import { IArticle } from '@/types/_core/article.type';
import { getArticleViewsGoal, getArticleViewsGoalPercent } from '@/utils/_core/cms.utils';

const classes = {
  root: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${ROW_METER_GAP}px`,
    width: ROW_METER_WIDTH,
  },
};

type Props = {
  article: IArticle;
};

/**
 * What the article was read: the count, the goal it was given, and the same ratio drawn under
 * them. The raw view count alone never says whether a piece did well — 800 views is a success for
 * a niche topic and a failure for a campaign — so the goal travels with it in every row.
 */
const ArticleAudienceCell = ({ article }: Props) => {
  const theme = useTheme();
  const { t } = useTranslation(['cms']);

  const views = article.views || 0;
  const goal = getArticleViewsGoal(article);
  const goalPercent = getArticleViewsGoalPercent(article);

  // an article past its goal is the row an editor is looking for — it is the only one tinted
  const toneColor = goalPercent >= 100
    ? theme.palette.success.main
    : theme.palette.primary.main;

  return (
    <Box css={classes.root}>
      <Typography noWrap variant="body2">
        <Typography component="span" variant="subtitle1">{views.toLocaleString()}</Typography>
        {` / ${goal.toLocaleString()} · `}
        <Typography component="span" sx={{ color: toneColor }} variant="body2">
          {t('cms:percentOfViewsGoal', { percent: goalPercent })}
        </Typography>
      </Typography>
      <RowMeter color={toneColor} ratio={goalPercent / 100} />
    </Box>
  );
};

export default ArticleAudienceCell;
