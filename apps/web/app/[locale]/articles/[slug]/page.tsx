
import dayjs from 'dayjs';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { cache, Fragment, Suspense } from 'react';
import { capitalize, titleCase } from 'string-ts';

import type { IError, IFileCloud } from '@/types/app.type';
import type { IArticle } from '@/types/article.type';
import type { ICategory, ICategoryTranslated } from '@/types/cms.type';

import Avatar from '@/components/Avatar';
import Section from '@/components/layouts/Section';
import Text from '@/components/typography/Text';
import TextLink from '@/components/typography/TextLink';
import Title from '@/components/typography/Title';
import {
  Card,
  CardDescription,
  CardImage,
  CardSubtitle,
} from '@/components/ui/Card';
import Articles from '@/containers/articles/Articles';
import ArticlesSkeleton from '@/containers/articles/ArticlesSkeleton';
import ReadOnlyTextCodeEditor from '@/containers/articles/ReadOnlyTextCodeEditor';
import Share from '@/containers/common/Share';
import Newsletter from '@/containers/newsletter/NewsLetter';
import { defaultLocale, Locale } from '@/i18n/config';
import { ROUTES } from '@/i18n/routes';
import {
  getArticle,
  getRelatedArticles,
} from '@/server/queries/article.queries';
import { getAbsoluteUrl } from '@/utils/app.utils';
import { goToItemsByCategory } from '@/utils/cms.utils';
import { createQueryString, generateOGImageUrl } from '@/utils/next.utils';
import { getSSRCurrentPathname } from '@/utils/server.utils';
import { getTranslatedField } from '@/utils/translation.utils';
import { getUserFullName } from '@/utils/user.utils';
import { slugify } from '@/utils/utils';

import { getCachedApp } from '../../page';

const getCachedArticle = cache(
  async (slug: string, locale: Locale): Promise<IArticle | null> => {
    const article = await getArticle(slug, locale);

    // no article or an error
    if (!article || (article as IError)?.error) return null;

    return article as IArticle;
  }
);

/*
 * ----------------------------- //
 * -------- metadata ----------- //
 * ----------------------------- //
 */
type Props = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export const generateMetadata = async (props: Props): Promise<Metadata> => {
  const params = await props.params;
  const locale = params.locale as Locale;
  const article = await getCachedArticle(params.slug, locale);

  // it may return an error instead of a parse object, so we need to check if it has an id
  if (!article) return {};
  const app = await getCachedApp();

  const translated = article?.get('translated');

  const title =
    getTranslatedField(translated, locale, 'metaTitle') ||
    getTranslatedField(translated, locale, 'title');
  const description =
    getTranslatedField(translated, locale, 'metaDescription') ||
    getTranslatedField(translated, locale, 'description');
  const tags = getTranslatedField(translated, locale, 'tags') || '';

  const currentPathname = await getSSRCurrentPathname();
  const url = getAbsoluteUrl(currentPathname);

  const ogImage = generateOGImageUrl({
    title,
    image: app?.get('image')?.url || '',
  });

  return {
    title: titleCase(title),
    description,
    keywords: tags.split(',').map((tag: string) => tag.trim()),
    // comment this part if using generated og image (see ./opengraph-image.tsx)
    openGraph: {
      title: titleCase(title),
      description,
      type: 'article',
      url,
      locale: locale || defaultLocale,
      images: [
        {
          url: ogImage, // Dynamic og route
          width: 800,
          height: 600,
        },
        {
          url: ogImage, // Dynamic og route
          width: 1200,
          height: 630,
        },
      ],
    },
  };
};

/*
 * ----------------------------- //
 * ------------ page ----------- //
 * ----------------------------- //
 */
const ArticlePage = async (props: Props) => {
  const params = await props.params;

  const slug = params.slug;
  const locale = params.locale as Locale;

  setRequestLocale(locale);
  const t = await getTranslations('Article');

  const article = await getCachedArticle(slug, locale);

  // it may return an error instead of a parse object, so we need to check if it has an id
  if (!article) {
    notFound();
    return;
  }

  const pathname = await getSSRCurrentPathname();
  const currentPathname = getAbsoluteUrl(pathname);

  const author = article.get('user');
  const translated = article.get('translated');
  const title = getTranslatedField(translated, locale, 'title');
  const tags = getTranslatedField(translated, locale, 'tags');
  const tagsArr = tags?.split(',') || [];
  const categories = article.get('categories') || [];

  const relatedArticles = await getRelatedArticles(article);

  return (
    <>
      <Section className="flex flex-col" size="md">
        <Card className="self-stretch" withShadow={false}>
          {/* ---------- category ---------- */}
          {categories.map((category: ICategory, index: number) => (
            <CardSubtitle key={category.id + index}>
              <TextLink
                underline={false}
                className={`
                  font-light
                  max-md:text-sm!
                `}
                href={goToItemsByCategory<ICategoryTranslated>(
                  category.get('translated'),
                  locale,
                  'articles'
                )}
              >
                {getTranslatedField(category.get('translated'), locale, 'name')}
              </TextLink>
              {categories.length - 1 !== index && (
                <Text className={`
                  mr-2 font-light
                  max-md:text-sm!
                `}
                >, </Text>
              )}
            </CardSubtitle>
          ))}
          <Title>{title}</Title>

          <CardDescription>
            {getTranslatedField(translated, locale, 'description')}
          </CardDescription>
          {article.has('image') && (
            <CardImage
              alt={title}
              containerClassName="mt-6 sm:h-[300px] md:h-[400px] lg:h-[543px]"
              src={article.get('image')?.url!}
            />
          )}

        </Card>
        {/* -------- author -------- */}

        <div className={`
          mt-8 mb-6 flex flex-row items-center justify-between self-stretch border-b border-b-dark-300 pb-3
          md:pb-4
          lg:mt-12
        `}
        >
          {author && (
            <div className={`
              flex flex-1 flex-row items-center gap-2
              md:gap-3
            `}
            >
              <Avatar user={author} />
              <TextLink
                // @TODO make this dynamic
                href="/"
                underline={false}
                className={`
                  font-medium
                  max-md:text-sm!
                `}
              >
                {getUserFullName(author)}
              </TextLink>
            </div>
          )}
          {/* ----- updated at ----- */}
          <div>
            <Text className={`
              font-light
              max-md:text-sm!
            `}
            >
              {dayjs(article.get('updatedAt')).format('DD MMM YYYY')}
            </Text>
          </div>
        </div>
        <ReadOnlyTextCodeEditor
          content={getTranslatedField(translated, locale, 'content')}
        />
        {/* images */}
        {article.has('images') && (
          <div className={`
            mt-16 flex flex-col gap-8
            md:grid md:grid-cols-2
            lg:mt-20
            xl:mt-24
          `}
          >
            {(article.get('images') || []).map((image: IFileCloud, index: number) => (
              <CardImage
                alt={title}
                containerClassName="!h-[400px]"
                key={image.url + index}
                src={image.url}
              />
            ))}
          </div>
        )}
        {/* share on social media */}
        <Share currentPathname={currentPathname} parseObj={article} />
        {/* ----------- tags ----------- */}
        {tags && (
          <div className={`
            mt-8 flex flex-col gap-3
            md:mt-16
            lg:mt-20
          `}
          >
            <div className="h-[5px] w-6 bg-black" />
            {/* bottom */}
            <div className={`
              flex flex-row gap-2
              md:gap-5
            `}
            >
              <Text className={`
                font-medium
                max-sm:text-sm
              `}
              >Tags:</Text>
              <div className="flex flex-row items-center">
                {tagsArr.map((tag: string, index: number) => (
                  <Fragment key={tag + index}>
                    <TextLink
                      href={`${ROUTES.articles.root}?${createQueryString({ tag: slugify(tag) })}`}
                      className={`
                        font-light
                        max-md:text-sm!
                      `}
                    >
                      {capitalize(tag)}
                    </TextLink>
                    {tagsArr.length - 1 !== index && (
                      <Text className={`
                        mr-2 font-light
                        max-md:text-sm!
                      `}
                      >
                        ,{' '}
                      </Text>
                    )}
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* ----------- related articles ----------- */}
      {relatedArticles && (relatedArticles as IArticle[]).length > 0 && (
        <Section
          rootClassName="mt-8 md:mt-20"
          size="lg"
          className={`
            flex flex-col gap-5
            md:gap-10
          `}
        >
          <div>
            <Title level={4}>{t('relatedArticles')}</Title>
            <div className={`
              divider mt-2
              md:mt-4
            `}
            />
          </div>
          <Suspense fallback={<ArticlesSkeleton />}>
            <Articles
              articles={(relatedArticles as IArticle[]) || []}
              locale={locale}
            />
          </Suspense>
        </Section>
      )}
      <Newsletter locale={locale} />
    </>
  );
};

export default ArticlePage;
