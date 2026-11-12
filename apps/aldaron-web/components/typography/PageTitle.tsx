import { ReactNode } from 'react';

import Title from '@/components/typography/Title';
import { cn } from '@/utils/app.utils';

type Props = {
  children?: ReactNode;
  className?: string;
};
const PageTitle = ({ children, className }: Props) => {
  return (
    <Title
      level={1}
      className={cn(
        `
          mb-2! text-h2!
          md:text-h1!
          lg:mb-5! lg:text-display!
          2xl:text-display-xl!
        `,
        // if there are children, e.g: p, span, etc
        `
          *:text-h2!
          md:*:text-h1!
          lg:*:mb-5! lg:*:text-display!
          2xl:*:text-display-xl!
        `,
        className
      )}
    >
      {children}
    </Title>
  );
};

export default PageTitle;
