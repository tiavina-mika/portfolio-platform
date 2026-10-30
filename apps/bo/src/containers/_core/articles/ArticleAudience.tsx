import { LinearProgress, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { capitalize } from 'string-ts';

import { CARD_STAT_TEXT_GAP } from '@/constants/_core/ui/page.constants';
import { AUDIENCE_METER_HEIGHT, AUDIENCE_METER_RADIUS } from '@/constants/_core/ui/ui.constants';
import { IArticle } from '@/types/_core/article.type';
import { getArticleViewsGoal, getArticleViewsGoalPercent } from '@/utils/_core/cms.utils';

const classes = {
  meter: {
    height: AUDIENCE_METER_HEIGHT,
    borderRadius: AUDIENCE_METER_RADIUS,
  },
};

type Props = {
  article: IArticle;
};

/**
 * what an article did once published: how much it was shared, how much it was read, and how far
 * that reading is along the goal it was given. The three are one block rather than three figures
 * side by side — a share count only means something next to the audience that produced it.
 */
const ArticleAudience = ({ article }: Props) => {
  const {
    t,
  } = useTranslation(['cms']);

  const views = article.views || 0;
  const totalMediaShare = article.totalMediaShare || 0;
  const goalPercent = getArticleViewsGoalPercent(article);
  const shares = article.shares || {};
  const socialNetworks = Object.keys(shares);

  return (
    <Stack spacing={2}>
      <Stack css={{ gap: CARD_STAT_TEXT_GAP }}>
        <Typography component="p" variant="h4">
          {t('cms:sharesCount', {
            count: totalMediaShare,
            value: totalMediaShare.toLocaleString(),
          })}
        </Typography>
        <Typography variant="caption">
          {t('cms:viewsCount', { count: views, value: views.toLocaleString() })}
          {' · '}
          {t('cms:percentOfViewsGoal', { percent: goalPercent })}
        </Typography>
      </Stack>
      {/*
        * the bar can only fill, so an article that doubled its goal shows the same full bar as one
        * that just reached it — the percentage above is what carries "by how much"
        */}
      <Stack css={{ gap: CARD_STAT_TEXT_GAP }}>
        <LinearProgress
          css={classes.meter}
          value={Math.min(goalPercent, 100)}
          variant="determinate"
          color={goalPercent >= 100
            ? 'success'
            : 'primary'}
        />
        <Typography variant="caption">
          {t('cms:viewsGoal')}: {getArticleViewsGoal(article).toLocaleString()}
        </Typography>
      </Stack>
      {/* which networks the shares came from — empty until the article is shared at least once */}
      {socialNetworks.length > 0
        ? (
          <Stack spacing={1}>
            {socialNetworks.map((social: string) => (
              <Stack
                direction="row"
                key={social}
                spacing={2}
                sx={{ justifyContent: 'space-between' }}
              >
                <Typography variant="body2">{capitalize(social)}</Typography>
                <Typography variant="body2">{(shares[social] || 0).toLocaleString()}</Typography>
              </Stack>
            ))}
          </Stack>
        )
        : <Typography variant="body2">{t('cms:noShare')}</Typography>}
    </Stack>
  );
};

export default ArticleAudience;
