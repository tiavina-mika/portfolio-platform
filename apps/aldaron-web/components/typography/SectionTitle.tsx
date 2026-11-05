import { ReactNode } from 'react';

import { cn } from '@/utils/app.utils';

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
        className={`
          text-h2!
          lg:text-h1!
          xl:text-display!
        `}
      >
        {children}
      </Title>
    </div>
  );
};

export default SectionTitle;
