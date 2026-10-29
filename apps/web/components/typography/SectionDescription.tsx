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
      lg:mb-[70px] lg:max-w-1/2 2xl:max-w-2/5
    `, className)}
    >
      <Title className={cn('md:!text-xl', primaryFont)} level={4}>
        {children}
      </Title>
    </div>
  );
};

export default SectionDescription;
