import Typography from '@mui/material/Typography';

import StatusDot from '@/components/StatusDot';
import { IArticle } from '@/types/_core/article.type';
import { getArticleStatus, getArticleStatusColor, getTranslatedArticleStatusLabel } from '@/utils/_core/cms.utils';

type Props = {
  article: IArticle;
};

/**
 * Whether the article is on the website, in the same tinted-dot language every other list uses for
 * a state. A filled chip repeated down a column turns the list into a wall of color with no row
 * standing out from the others, which is the one thing a status column is there for.
 */
const ArticleStatusCell = ({ article }: Props) => {
  const status = getArticleStatus(article);

  return (
    <Typography component="span" variant="subtitle1">
      <StatusDot color={getArticleStatusColor(status)} label={getTranslatedArticleStatusLabel(status)} />
    </Typography>
  );
};

export default ArticleStatusCell;
