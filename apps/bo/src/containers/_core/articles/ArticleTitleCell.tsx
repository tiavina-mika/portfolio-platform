import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import { TABLE_CELL_LINE_GAP } from '@/constants/_core/ui/list.constants';
import { IArticle, IArticleTranslatedFields } from '@/types/_core/article.type';
import { Locale } from '@/types/_core/setting.type';
import { getArticleReadingTimeInMinutes, getTranslatedCategoriesName } from '@/utils/_core/cms.utils';
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
  article: IArticle;
  locale: Locale;
};

/**
 * What the article is: its title, and under it the two things that place it before it is opened —
 * the shelf it sits on and how long it takes to read. Both fold into the title cell rather than
 * taking a column each: neither is ever scanned down a column on its own, and a list is read down
 * its rows, so every extra column costs width the titles need.
 */
const ArticleTitleCell = ({
  article, locale,
}: Props) => {
  const { t } = useTranslation(['cms']);

  const title = getTranslatedField<IArticleTranslatedFields>(article.translated, locale, 'title');
  const categories = getTranslatedCategoriesName(article.categories, locale);
  const content = getTranslatedField<IArticleTranslatedFields>(article.translated, locale, 'content');
  const readingTime = getArticleReadingTimeInMinutes(content);

  const meta = [
    categories,
    // an article with no body yet has no reading time to state — it would read as "0 min read"
    readingTime > 0
      ? t('cms:readingTime', { count: readingTime })
      : '',
  ].filter(Boolean).join(' · ');

  return (
    <Box css={classes.root}>
      <Typography noWrap variant="subtitle1">{title}</Typography>
      {meta && <Typography noWrap variant="body2">{meta}</Typography>}
    </Box>
  );
};

export default ArticleTitleCell;
