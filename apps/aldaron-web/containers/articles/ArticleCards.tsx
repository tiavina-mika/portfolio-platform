import RevealListItem from '@/components/animation/RevealListItem';
import EmptyNotice from '@/components/EmptyNotice';
import StatusBanner from '@/components/StatusBanner';
import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

import ArticleCard, { ArticleCardData } from './ArticleCard';

export type ArticleCardsStatus = 'ready' | 'loading' | 'error' | 'offline';

export type ArticleCardsLabels = {
  /**
   * Name of the loading area, read once by screen readers
   */
  loading: string;
  error: string;
  offline: string;
  /**
   * The notice shown when no article is published
   */
  empty: string;
  retry: string;
};

type Props = {
  /**
   * `ready` shows the cards (or the empty notice without any), `loading` skeleton cards, `error` a
   * banner with a retry button, `offline` a notice (the articles come back on reconnection)
   */
  status: ArticleCardsStatus;
  articles?: ArticleCardData[];
  labels: ArticleCardsLabels;
  /**
   * Retry of the `error` banner
   */
  onRetry?: () => void;
  /**
   * `false` keeps the cards still: no cascade when they enter the screen, no zoom on hover
   * @default true
   */
  animated?: boolean;
};

const SKELETON_COUNT = 3;

const GRID_CLASSES = `
  grid list-none grid-cols-1 gap-x-6 gap-y-12
  md:grid-cols-2 md:gap-x-8
  lg:grid-cols-3 lg:gap-x-12
  xl:gap-y-16
`;

/**
 * A grid of article cards, or the state that takes its place: skeleton cards while they load, a
 * banner with a retry (or an offline notice) if they fail, a notice when none is published yet.
 * Shared by the home page and the blog, which each bring their own texts.
 */
const ArticleCards = ({
  status, articles = [], labels, onRetry, animated = true,
}: Props) => {
  switch (status) {
    case 'loading':
      return (
        <div aria-label={labels.loading} role="status">
          <ul aria-hidden className={GRID_CLASSES}>
            {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
              <li className="flex min-w-0" key={index}>
                <Card withShadow={false}>
                  <Skeleton className={`
                    h-[25vh] w-full rounded-lg
                    md:h-[230px]
                  `}
                  />
                  <CardContent className="gap-2 p-0!">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-6" />
                    <Skeleton className="h-16" />
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      );
    case 'error':
      return (
        <StatusBanner onRetry={onRetry} retryLabel={labels.retry} variant="error">
          {labels.error}
        </StatusBanner>
      );
    case 'offline':
      return <StatusBanner variant="offline">{labels.offline}</StatusBanner>;
    default:
      break;
  }

  if (!articles.length) return <EmptyNotice>{labels.empty}</EmptyNotice>;

  return (
    <ul className={GRID_CLASSES}>
      {articles.map((article, index) => (
        <RevealListItem
          animated={animated}
          className="flex min-w-0"
          index={index}
          key={article.id}
        >
          <ArticleCard {...article} animated={animated} />
        </RevealListItem>
      ))}
    </ul>
  );
};

export default ArticleCards;
