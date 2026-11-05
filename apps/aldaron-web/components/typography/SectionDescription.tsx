import { ReactNode } from 'react';

import { cn } from '@/utils/app.utils';

import { primaryFont } from '../fonts';
import Title from './Title';

type Props = {
  className?: string;
  children: ReactNode;
};

const SectionDescription = ({ children, className }: Props) => {
  return (
    <div className={cn(`
      mb-6
      lg:mb-[70px] lg:max-w-1/2
      2xl:max-w-2/5
    `, className)}
    >
      <Title
        level={4}
        className={cn(`
          text-muted-foreground!
          md:text-xl!
          dark:text-muted-foreground!
        `, primaryFont)}
      >
        {children}
      </Title>
    </div>
  );
};

export default SectionDescription;
