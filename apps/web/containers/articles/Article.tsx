
import TextLink from '@/components/typography/TextLink';
import {
  Card,
  CardContent,
  CardDescription,
  CardImage,
  CardSubtitle,
  CardTitle,
} from '@/components/ui/Card';
import { Locale } from '@/i18n/config';
import { getImageByBreakpoint } from '@/server/responsive.server';
import { IArticle, IArticleTranslated } from '@/types/article.type';
import { goToItemBySlug } from '@/utils/app.utils';
import { getTranslatedField } from '@/utils/translation.utils';

type Props = {
  article: IArticle;
  locale: Locale;
};

const Article = async ({ article, locale }: Props) => {
  const translated = article.get('translated');
  const title = getTranslatedField(translated, locale, 'title');
  const responsiveImage = article.has('previewImage')
    ? await getImageByBreakpoint(article.get('previewImage')!)
    : article.get('image')?.url;

  return (
    <TextLink
      href={goToItemBySlug<IArticleTranslated>(translated, locale, 'articles')}
      underline={false}
      useChildSpan={false}
      className={`
        group flex flex-col self-stretch
        first-line:flex
      `}
    >
      <Card withShadow={false}>
        {responsiveImage && (
          <CardImage
            alt={title}
            src={responsiveImage}
            className={`
              transition-all delay-150 ease-in-out
              group-hover:scale-105
            `}
          />
        )}
        <CardContent className="p-0!">
          {article.get('categories') &&
            article.get('categories').length > 0 && (
            <CardSubtitle>
              {getTranslatedField(
                article.get('categories')[0].get('translated'),
                locale,
                'name'
              )}
            </CardSubtitle>
          )}
          <CardTitle className="group-hover:text-info-light group-hover:underline">
            {title}
          </CardTitle>
          <CardDescription>
            {getTranslatedField(translated, locale, 'description')}
          </CardDescription>
        </CardContent>
      </Card>
    </TextLink>
  );
};

export default Article;
