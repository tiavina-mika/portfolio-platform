import { ReactNode } from 'react';

import { cn } from '@/utils/app.utils';

import Section from './Section';
import Text from '../typography/Text';
import Title from '../typography/Title';

type Props = {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  rootClassName?: string;
};
const Block = ({
  children,
  className,
  title,
  description,
  rootClassName,
}: Props) => {
  return (
    <Section
      className={cn(
        `
          flex flex-col gap-2 self-stretch
          md:items-center md:justify-center md:gap-8
        `,
        rootClassName
      )}
    >
      <Title
        level={2}
        className={`
          text-2xl! font-extrabold
          md:text-center md:text-6xl!
          xl:text-10xl/34!
        `}
      >
        {title}
      </Title>
      {description && (
        <div className="mb-2">
          <Text className="md:text-center" size="xl">
            {description}
          </Text>
        </div>
      )}
      <div className={cn('self-stretch', className)}>{children}</div>
    </Section>
  );
};

export default Block;
