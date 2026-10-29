import TextLink from '@/components/typography/TextLink';
import Title from '@/components/typography/Title';

type Props<T extends Record<string, any>> = {
  title: string;
  items: T[];
  renderItemUrl: (item: T) => string;
  renderItemLinkText: (item: T) => string;
};

const SitemapGroup = <T extends Record<string, any>>({
  title,
  items,
  renderItemUrl,
  renderItemLinkText,
}: Props<T>) => {
  if (!items.length) return null;

  return (
    <div className={`
      flex flex-1 flex-col gap-3
      lg:gap-10
    `}
    >
      <div>

        <Title className="leading-6!" gutterBottom={false} level={3}>
          {title}
        </Title>
      </div>
      <div className={`
        flex flex-col gap-1
        md:gap-3
      `}
      >
        {items.map((item: T, index: number) => (
          <TextLink
            underline
            className="text-lg!"
            href={renderItemUrl(item)}
            key={item.id + index}
          >
            {renderItemLinkText(item)}
          </TextLink>
        ))}
      </div>
    </div>
  );
};

export default SitemapGroup;
