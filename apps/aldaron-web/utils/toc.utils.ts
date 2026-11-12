import { ITableOfContentsItem } from '@/types/app.type';
import { TABLE_OF_CONTENTS_ID_PREFIX } from '@/utils/constants';
import { slugify } from '@/utils/utils';

// the rich text editor writes a section title as an h2 (the h1 is the title of the page)
const HEADING_REGEX = /<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/gi;

const HTML_ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': '\'',
  '&nbsp;': ' ',
};

const getHeadingText = (headingHtml: string): string =>
  headingHtml
    .replace(/<[^>]*>/g, '')
    .replace(/&(?:amp|lt|gt|quot|#39|nbsp);/g, (entity) => HTML_ENTITIES[entity])
    .trim();

/**
 * Gives an id to every section title (h2) of a rich text and lists them, so a table of contents can
 * link to them. Works on the HTML string, so it runs on the server and the text is rendered once.
 * @example addHeadingIds('<h2>My strengths</h2><p>…</p>')
 * // { html: '<h2 id="toc-my-strengths">My strengths</h2><p>…</p>', items: [{ id: 'toc-my-strengths', label: 'My strengths' }] }
 */
export const addHeadingIds = (html: string): { html: string; items: ITableOfContentsItem[] } => {
  const items: ITableOfContentsItem[] = [];
  const usedIds = new Set<string>();

  const htmlWithIds = html.replace(HEADING_REGEX, (
    heading: string,
    attributes: string | undefined,
    inner: string
  ) => {
    const label = getHeadingText(inner);

    // an empty heading is not worth a link
    if (!label) return heading;

    // two headings with the same text must not share an id
    const baseId = `${TABLE_OF_CONTENTS_ID_PREFIX}${slugify(label) || items.length + 1}`;
    let id = baseId;
    let suffix = 2;

    while (usedIds.has(id)) {
      id = `${baseId}-${suffix}`;
      suffix += 1;
    }

    usedIds.add(id);
    items.push({ id, label });

    return `<h2${attributes ?? ''} id="${id}">${inner}</h2>`;
  });

  return { html: htmlWithIds, items };
};
