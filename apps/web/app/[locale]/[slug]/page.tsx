
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { cache } from 'react';
import { titleCase } from 'string-ts';

import PageHeader from '@/components/layouts/PageHeader';
import Section from '@/components/layouts/Section';
import ReadOnlyTextCodeEditor from '@/containers/articles/ReadOnlyTextCodeEditor';
import PageBlocks from '@/containers/pages/PageBlocks';
import { Locale } from '@/i18n/config';
import { getPage } from '@/server/queries/page.queries';
import { IPage } from '@/types/cms.type';
import { getTranslatedField } from '@/utils/translation.utils';

const getCachedPage = cache(async (slug: string, locale: Locale) => {
  const page = (await getPage(slug, locale)) as IPage | undefined;

  return page;
});

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
  const slug = params.slug;
  const locale = params.locale as Locale;
  const page = await getCachedPage(slug, locale);

  if (!page) return {};

  const translated = page?.get('translated');
  const description =
    getTranslatedField(translated, locale, 'metaDescription') ||
    getTranslatedField(translated, locale, 'description');

  return {
    title: titleCase(getTranslatedField(translated, locale, 'name')),
    description,
  };
};

/*
 * ----------------------------- //
 * ------------ page ----------- //
 * ----------------------------- //
 */
const PagePage = async (props: Props) => {
  const params = await props.params;

  const slug = params.slug;
  const locale = params.locale as Locale;

  setRequestLocale(locale);

  const page = await getCachedPage(slug, locale);

  if (!page) {
    notFound();
  }

  const translated = page.get('translated');

  return (
    <Section
      className="flex-col"
      rootClassName="md:mt-8 xl:mt-12 mb-8 md:mb-10 lg:md-16"
      size="lg"
    >
      {/* header */}
      <PageHeader
        fullWidth
        direction="col"
        image={page.get('bannerImage')?.url || ''}
        mainClassName="mb-[30px] md:mb-[50px] 2xl:mb-0"
        title={getTranslatedField(translated, locale, 'title')}
        titleClassName="2xl:!text-10xl"
        className={`
          mb-0 pb-0
          lg:mb-6
          xl:mb-0
        `}
        description={(
          <ReadOnlyTextCodeEditor
            content={getTranslatedField(translated, locale, 'description')}
          />
        )}
      />
      {/* content */}
      <ReadOnlyTextCodeEditor
        content={getTranslatedField(translated, locale, 'content')}
      />
      {/* blocks */}
      {page.has('blocks') && (page.get('blocks') || []).length > 0 && (
        <div className={`
          mt-6 flex flex-col
          md:mt-14
          lg:mt-24
        `}
        >
          <PageBlocks
            blocks={page.get('blocks') || [] as any}
            locale={locale}
            title={getTranslatedField(translated, locale, 'blocksTitle')}
            description={getTranslatedField(
              translated,
              locale,
              'blocksDescription'
            )}
          />
        </div>
      )}
    </Section>
  );
};

export default PagePage;
