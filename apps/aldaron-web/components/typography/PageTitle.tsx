import { ReactNode } from 'react';

import { secondaryFont } from '@/components/fonts';
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
        secondaryFont,
        `
          mb-2! text-2xl! leading-[1em]!
          md:text-3xl!
          lg:mb-[20px]! lg:text-5xl!
          xl:text-5xl!
          2xl:text-6xl!
        `,
        // if there are children, e.g: p, span, etc
        `
          *:text-2xl! *:leading-[1.2em]!
          md:*:text-3xl!
          lg:*:mb-[20px]! lg:*:text-5xl!
          xl:*:text-5xl!
          2xl:*:text-6xl!
          [&_p]:leading-[1.2em]!
          [&_span]:leading-[1.4em]!
        `,
        className
      )}
    >
      {children}
    </Title>
  );
};

export default PageTitle;
