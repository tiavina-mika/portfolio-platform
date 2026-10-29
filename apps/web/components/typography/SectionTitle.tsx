import { ReactNode } from 'react';

import { cn } from '@/utils/app.utils';

import { primaryFont } from '../fonts';
import Title from './Title';

type Props = {
  className?: string;
  children: ReactNode;
  gutterBottom?: boolean;
};

const SectionTitle = ({ children, className, gutterBottom = true }: Props) => {
  return (
    <div
      className={cn(
        { 'mb-6 lg:mb-[40px]': gutterBottom },
        className,
        'lg:max-w-4xl'
      )}
    >
      <Title
        level={2}
        className={cn(
          `
            !text-2xl font-bold
            md:!text-4xl
            lg:!text-6xl
            xl:!text-8xl
          `,
          primaryFont
        )}
      >
        {children}
      </Title>
    </div>
  );
};

export default SectionTitle;
