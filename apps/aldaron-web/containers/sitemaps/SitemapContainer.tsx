import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

const SitemapContainer = ({ children }: Props) => {
  return (
    <div className={`
      flex flex-col gap-5 self-stretch
      lg:grid lg:grid-cols-2 lg:gap-8
    `}
    >
      {children}
    </div>
  );
};

export default SitemapContainer;
