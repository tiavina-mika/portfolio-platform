
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { cache, Suspense } from 'react';

import Socials from '@/components/footer/Socials';
import Block from '@/components/layouts/Block';
import CardsBlock from '@/components/layouts/CardsBlock';
import PageHeader from '@/components/layouts/PageHeader';
import Section from '@/components/layouts/Section';
import { getParseServer } from '@/config/parse-server.config';
import DownloadCV from '@/containers/app/DownloadCV';
import HomeDescriptionSkeleton from '@/containers/app/HomeDescriptionSkeleton';
import HomeHeaderTexts from '@/containers/app/HomeHeaderTexts';
import ArticlesSkeleton from '@/containers/articles/ArticlesSkeleton';
import NonPaginatedArticles from '@/containers/articles/NonPaginatedArticles';
import ContactForm from '@/containers/contact/ContactForm';
import DynamicMainImage from '@/containers/home/DynamicMainImage';
import Newsletter from '@/containers/newsletter/NewsLetter';
import NonPaginatedProjects from '@/containers/projects/NonPaginatedProjects';
import ProjectsSkeleton from '@/containers/projects/ProjectsSkeleton';
import { Locale } from '@/i18n/config';
import { IApp } from '@/types/app.type';
import { APP_NAME, collections } from '@/utils/constants';

/*
 * ------------------------------------------- //
 * ------------- cached requests ------------- //
 * ------------------------------------------- //
 */
/**
 * get pages and cache them so that this can be duplicated
 * even if used in another components
 * NOTE: this request is also called in homepage layout and DownloadCV, Footer components
 * NOTE: it's a react feature, not a next.js feature, so it should be used and imported in a react component
 */
export const getCachedApp = cache(
  async (): Promise<IApp | undefined> => {
    const Parse = getParseServer();
    const app = await new Parse.Query(collections.App)
      .ascending('createdAt')
      .first();

    return app;
  }
);

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

const HomePage = async (props: Props) => {
  const params = await props.params;

  const locale = params.locale as Locale;

  setRequestLocale(locale);
  const t = await getTranslations('App');
  const tService = await getTranslations('Services');
  const tProject = await getTranslations('Project');

  const services = [
    {
      image: '/icons/plant-growth.svg',
      imageForDarkMode: '/icons/plant-growth-light.svg',
      title: tService('1.title'),
      description: tService('1.description'),
    },
    {
      image: '/icons/smartphone.svg',
      imageForDarkMode: '/icons/smartphone-light.svg',
      title: tService('2.title'),
      description: tService('2.description'),
    },
    {
      image: '/icons/lightbulb.svg',
      imageForDarkMode: '/icons/lightbulb-light.svg',
      title: tService('3.title'),
      description: tService('3.description'),
    },
    {
      image: '/icons/page-web.svg',
      imageForDarkMode: '/icons/page-web-light.svg',
      title: tService('4.title'),
      description: tService('4.description'),
    },
  ];

  return (
    <div className={`
      flex flex-col self-stretch
      md:items-center
    `}
    >
      {/* -------------------------------- */}
      {/* ------------ header ------------ */}
      {/* -------------------------------- */}
      <PageHeader
        mainClassName="mb-[30px] md:mb-[50px] md:mt-20 flex flex-row"
        titleClassName="2xl:text-10xl!"
        description={(
          <Suspense fallback={<HomeDescriptionSkeleton />}>
            <HomeHeaderTexts locale={locale} />
          </Suspense>
        )}
        image={(
          <Suspense fallback={null}>
            <DynamicMainImage theme="light" />
          </Suspense>
        )}
        // eslint-disable-next-line @stylistic/jsx-sort-props
        imageDarkMode={(
          <Suspense fallback={null}>
            <DynamicMainImage theme="dark" />
          </Suspense>
        )}
        title={APP_NAME}
        /*
         * description={t.markup('description', {
         *   b: (chunks) => `<b>${chunks}</b>`
         * })}
         */
        // eslint-disable-next-line @stylistic/jsx-sort-props
        className={`
          md:pb-8
          xl:pb-10
          2xl:pb-10
        `}
      >
        {/* CV button */}
        <Suspense fallback={null}>
          <div>
            <DownloadCV className={`
              rounded-md bg-default px-4 py-3 text-base font-medium text-white
              md:text-lg
              lg:px-8 lg:py-4
              dark:bg-secondary! dark:text-neutral-900!
            `}
            />
          </div>
        </Suspense>
      </PageHeader>

      {/* -------------------------------- */}
      {/* ---------- services ------------ */}
      {/* -------------------------------- */}
      <CardsBlock
        cardClassName="md:!pb-6"
        cardsClassName="lg:grid-cols-2"
        imageClassName="object-contain"
        imageContainerClassName="rounded-none w-[30px] h-[30px] md:w-[50px] md:h-[50px]"
        items={services}
        title={t('whyMe')}
      />

      {/* -------------------------------- */}
      {/* ---------- projects ------------ */}
      {/* -------------------------------- */}
      <Suspense
        fallback={(
          <Section rootClassName="mb-18">
            <ProjectsSkeleton />
          </Section>
        )}
      >
        <NonPaginatedProjects
          description={tProject('description')}
          listContainerClassName="max-md:mt-12"
          locale={locale}
        />
      </Suspense>
      {/* -------------------------------- */}
      {/* ----------- contact ------------ */}
      {/* -------------------------------- */}
      <Block
        description={t('doNotHesitateToContactMe')}
        rootClassName="md:!w-[700px]"
        title={t('letsTalkTogether')}
        className={`
          flex flex-col items-start justify-center
          md:items-center
        `}
      >
        <div className={`
          space-y-6
          xs:max-md:self-stretch
          md:w-[500px] md:space-y-10
        `}
        >
          <ContactForm />
          <Socials />
        </div>
      </Block>
      {/* -------------------------------- */}
      {/* ----------- articles ----------- */}
      {/* -------------------------------- */}
      <Suspense
        fallback={(
          <Section className={`
            mt-8
            lg:mt-24
          `}
          >
            <ArticlesSkeleton />
          </Section>
        )}
      >
        <NonPaginatedArticles locale={locale} />
      </Suspense>
      {/* -------------------------------- */}
      {/* ---------- newsletter ---------- */}
      {/* -------------------------------- */}
      <Newsletter locale={locale} />

      {/* <HomeAdvantages sections={advantages} />
      <HomeFeatures sections={features} /> */}
    </div>
  );
};

export default HomePage;
