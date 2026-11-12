import { useTranslations } from 'next-intl';

import TableOfContents from '@/components/TableOfContents';
import ReadOnlyTextCodeEditor from '@/containers/articles/ReadOnlyTextCodeEditor';
import { addHeadingIds } from '@/utils/toc.utils';

type Props = {
  /**
   * the rich text, as HTML
   */
  content: string;
  /**
   * shows the table of contents of the section titles (h2) next to the text. It is set in the
   * back-office, and an absent value reads as off
   */
  hasTableOfContents?: boolean;
};

/**
 * A rich text, with a table of contents of its section titles when the back-office asks for one:
 * above the text on mobile and tablet, in a column that follows the reading on large screens.
 * Without any section title there is nothing to list, so the text is shown alone.
 */
const ContentWithTableOfContents = ({ content, hasTableOfContents = false }: Props) => {
  const t = useTranslations('Common');

  const { html, items } = hasTableOfContents ? addHeadingIds(content) : { html: content, items: [] };

  if (!items.length) return <ReadOnlyTextCodeEditor content={content} />;

  return (
    <div className={`
      flex w-full min-w-0 flex-col gap-6
      lg:flex-row lg:items-start lg:gap-12
    `}
    >
      <div className="lg:sticky lg:top-28 lg:shrink-0">
        <TableOfContents items={items} label={t('tableOfContents')} />
      </div>
      {/* the margin keeps a title clear of the sticky navigation bar once the link scrolls to it */}
      <div className={`
        min-w-0 flex-1
        [&_h2]:scroll-mt-28
      `}
      >
        <ReadOnlyTextCodeEditor content={html} />
      </div>
    </div>
  );
};

export default ContentWithTableOfContents;
