import { ReactNode } from 'react';

type Props = {
  /**
   * The sections that load their own data (and carry their own loading and error states) are slots,
   * so the route streams them while the stories pass them ready-made
   */
  hero: ReactNode;
  services: ReactNode;
  projects: ReactNode;
  contact: ReactNode;
  articles: ReactNode;
  newsletter: ReactNode;
};

/**
 * The home page layout: the order of the sections. Each section owns its band and its loading / error
 * states, so the page only sets the order
 */
const HomePage = ({
  hero, services, projects, contact, articles, newsletter,
}: Props) => (
  <div className={`
    flex flex-col self-stretch
    md:items-center
  `}
  >
    {hero}
    {services}
    {projects}
    {contact}
    {articles}
    {newsletter}
  </div>
);

export default HomePage;
