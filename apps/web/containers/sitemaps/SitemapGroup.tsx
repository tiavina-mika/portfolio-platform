import TextLink from '@/components/typography/TextLink';
import Title from '@/components/typography/Title';

type Props<T extends Record<string, any>> = {
  title: string;
  items: T[];
  renderItemUrl: (item: T) => string;
  renderItemLinkText: (item: T) => string;
};

/**
 * One group of the sitemap (projects, pages, articles, categories): a title, then every link in a
 * list. A group without item renders nothing
 */
const SitemapGroup = <T extends Record<string, any>>({
  title,
  items,
  renderItemUrl,
  renderItemLinkText,
}: Props<T>) => {
  if (!items.length) return null;

  return (
    <section className={`
      flex flex-1 flex-col gap-3
      lg:gap-10
    `}
    >
      <Title className="leading-6!" gutterBottom={false} level={2}>
        {title}
      </Title>
      <ul className={`
        flex list-none flex-col gap-1
        md:gap-3
      `}
      >
        {items.map((item: T, index: number) => (
          <li key={item.id + index}>
            <TextLink underline className="text-lg!" href={renderItemUrl(item)}>
              {renderItemLinkText(item)}
            </TextLink>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default SitemapGroup;
