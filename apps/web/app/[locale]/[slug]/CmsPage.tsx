import { BreadcrumbsSegment } from '@/components/Breadcrumbs';
import Section from '@/components/layouts/Section';
import { CardImage } from '@/components/ui/Card';
import ReadOnlyTextCodeEditor from '@/containers/articles/ReadOnlyTextCodeEditor';
import PageBlocks from '@/containers/pages/PageBlocks';
import PageHeader from '@/containers/pages/PageHeader';
import { Locale } from '@/i18n/config';
import { IFileCloud } from '@/types/app.type';
import { IPage, IPageSection } from '@/types/cms.type';
import { getTranslatedField } from '@/utils/translation.utils';

type Props = {
  page: IPage;
  sections: IPageSection[];
  breadcrumbs: BreadcrumbsSegment[];
  locale: Locale;
};

/**
 * A page written in the back-office: header (banner, title, description), text, pictures, then its
 * sections of blocks
 */
const CmsPage = ({
  page, sections, breadcrumbs, locale,
}: Props) => {
  const translated = page.translated;
  const title = getTranslatedField(translated, locale, 'title');
  const description = getTranslatedField(translated, locale, 'description');
  const content = getTranslatedField(translated, locale, 'content');

  return (
    <div className={`
      flex flex-col gap-6 self-stretch pb-10
      md:pb-16
    `}
    >
      <PageHeader
        bannerUrl={page.bannerImage?.url}
        breadcrumbs={breadcrumbs}
        description={description ? <ReadOnlyTextCodeEditor content={description} /> : undefined}
        locale={locale}
        title={title}
      />
      {/* content */}
      {!!content && (
        <Section className="flex-col" size="lg">
          <ReadOnlyTextCodeEditor content={content} />
        </Section>
      )}
      {/* images */}
      {!!page.images?.length && (
        <Section size="lg">
          <ul className={`
            grid w-full list-none grid-cols-1 gap-8
            md:grid-cols-2
          `}
          >
            {page.images.map((image: IFileCloud, index: number) => (
              <li key={image.url + index}>
                <CardImage alt={title} containerClassName="h-[400px]!" src={image.url} />
              </li>
            ))}
          </ul>
        </Section>
      )}
      {/* sections */}
      {sections.map((section) => (
        <PageBlocks
          blocks={section.blocks || []}
          description={getTranslatedField(section.translated, locale, 'description')}
          key={section.id}
          locale={locale}
          title={getTranslatedField(section.translated, locale, 'title')}
        />
      ))}
    </div>
  );
};

export default CmsPage;
