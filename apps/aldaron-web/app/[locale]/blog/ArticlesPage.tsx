import { ReactNode } from 'react';

type Props = {
  /**
   * The title, the category chips and the sort links
   */
  header: ReactNode;
  /**
   * The list of articles with its pagination. It loads its own data (and carries its own loading
   * and error states), so the route streams it while the stories pass it ready-made
   */
  articles: ReactNode;
};

/**
 * The blog page layout: the header above the list. Each part owns its full-width band, so the page
 * only sets the order
 */
const ArticlesPage = ({ header, articles }: Props) => (
  <div className="flex flex-col self-stretch">
    {header}
    {articles}
  </div>
);

export default ArticlesPage;
