import { ReactNode } from 'react';

import Title from '@/components/typography/Title';
import { cn } from '@/utils/app.utils';

type Props = {
  title: string;
  children: ReactNode;
  className?: string;
  rootClassName?: string;
  titleLevel?: 3 | 5;
};
const ProjectSection = ({
  title,
  children,
  className,
  rootClassName,
  titleLevel = 3,
}: Props) => {
  return (
    <div
      className={cn(
        `
          flex flex-col
          md:gap-3
        `,
        titleLevel === 3 ? 'md:gap-4' : 'md:gap-1',
        rootClassName
      )}
    >
      <div
        className={cn(
          'flex flex-col',
          titleLevel === 3 ? 'md:gap-6' : 'md:gap-4'
        )}
      >
        <Title level={titleLevel}>{title}</Title>
        <div className={`
          divider
          max-md:hidden
        `}
        />
      </div>
      <div className={className}>{children}</div>
    </div>
  );
};

export default ProjectSection;
