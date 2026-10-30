import { ReactNode } from 'react';

import { cn } from '@/utils/app.utils';

type Props = {
  className?: string;
  children?: ReactNode;
};

/**
 * The grid shared by the project cards and their loading skeleton, so nothing jumps when the cards
 * replace the skeleton
 */
const ProjectList = ({ className, children }: Props) => {
  return (
    <ul
      className={cn(
        `
          flex flex-1 list-none flex-col gap-24
          md:grid md:grid-cols-2 md:gap-x-12
          lg:grid-cols-3 lg:gap-x-6 lg:gap-y-16
          xl:gap-x-8 xl:gap-y-18
          2xl:grid-cols-4 2xl:gap-y-24
        `,
        className
      )}
    >
      {children}
    </ul>
  );
};

export default ProjectList;
