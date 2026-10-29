import { Locale } from '@/i18n/config';
import { IArticle } from '@/types/article.type';
import { cn } from '@/utils/app.utils';

import Article from './Article';

type Props = {
  articles: IArticle[];
  locale: Locale;
  itemsClassName?: string;
};

const Articles = ({ articles, locale, itemsClassName }: Props) => {
  return (
    <div className="flex-col gap-3">
      <div
        className={cn(
          `
            flex flex-col gap-x-6 gap-y-12
            md:grid md:grid-cols-2 md:gap-x-8
            lg:grid-cols-3 lg:gap-x-12
            xl:gap-y-16
          `,
          itemsClassName
        )}
      >
        {Array.isArray(articles) &&
          articles.map((article: IArticle, index: number) => (
            <Article
              article={article}
              key={article.id + index}
              locale={locale}
            />
          ))}
      </div>
    </div>
  );
};

export default Articles;
