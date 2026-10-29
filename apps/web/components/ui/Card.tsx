
import Image, { ImageProps } from 'next/image';
import { LinkProps } from 'next/link';
import {
  type ComponentProps, type ReactNode,
} from 'react';

import { cn } from '@/utils/app.utils';

import Text, { TextProps } from '../typography/Text';
import TextLink from '../typography/TextLink';
import Title, { TitleProps } from '../typography/Title';

type WithChildrenProps = { children: ReactNode };
interface ICardProps extends ComponentProps<'div'> {
  withShadow?: boolean;
  as?: 'div' | 'section' | 'article';
}

const Card = ({
  className,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/naming-convention
  as: Component = 'div',
  withShadow = true,
  ...props
}: ICardProps) => {
  return (
    <div
      data-slot="card"
      className={cn(
        'flex flex-1 flex-col gap-3 self-stretch',
        { 'lg:rounded-lg lg:border lg:bg-card lg:shadow': withShadow },
        // 'rounded-xl border bg-card text-card-foreground shadow',
        '',
        className
      )}
      {...props}
    />
  );
};

const SPACING_CLASSES = 'p-0 lg:p-7';

const CardHeader = ({ className, ...props }: ComponentProps<'div'>) => (
  <div
    data-slot="card-header"
    className={cn(
      'flex flex-col space-y-1.5 pb-0!',
      SPACING_CLASSES,
      className
    )}
    {...props}
  />
);

const CardContent = ({ className, ...props }: ComponentProps<'div'>) => (
  <div
    className={cn('flex flex-col gap-1', SPACING_CLASSES, className)}
    data-slot="card-content"
    {...props}
  />
);

const CardFooter = ({ className, ...props }: ComponentProps<'div'>) => (
  <div
    className={cn(SPACING_CLASSES, 'flex items-center !pt-0', className)}
    data-slot="card-footer"
    {...props}
  />
);

interface IWithLinkProps {
  href?: LinkProps['href'];
}

type CardTitleProps = TitleProps &
  WithChildrenProps &
  IWithLinkProps &
  ComponentProps<'div'>;

const CardTitle = ({
  className, children, href, ...props
}: CardTitleProps) => {
  const level = props.level || 6;

  if (href) {
    return (
      <TextLink useChildSpan href={href} underline={false}>
        <Title
          className="hover:text-info-light hover:underline"
          gutterBottom={false}
          level={level}
        >
          {children}
        </Title>
      </TextLink>
    );
  }

  return (
    <Title
      className={className}
      level={level}
      {...props}
    >
      {children}
    </Title>
  );
};

type CardDescriptionProps = WithChildrenProps &
  Omit<TextProps, 'as'> & {
    size?: 'sm' | 'md';
  };

const CardDescription = ({
  className, children, size = 'sm', ...props
}: CardDescriptionProps) => (
  <Text
    as="p"
    className={cn(
      size === 'sm'
        ? 'text-sm text-muted-foreground'
        : `
          text-base text-dark-400
          md:text-lg
        `,
      `
        max-md:leading-normal
        lg:mt-1
      `,
      className
    )}
    {...props}
  >
    {children}
  </Text>
);

type CardSubtitleProps =
  WithChildrenProps &
  Omit<TextProps, 'as'> &
  ComponentProps<'p'>;

const CardSubtitle = ({ className, children, ...props }: CardSubtitleProps) => (
  <Text
    as="p"
    className={cn('!text-base font-semibold text-muted-foreground', className)}
    data-slot="card-subtitle"
    {...props}
  >
    {children}
  </Text>
);

type CardImageProps = {
  containerClassName?: string;
  objectSize?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
};
const getObjectSizeClassName = (objectSize: CardImageProps['objectSize']) => {
  switch (objectSize) {
    case 'contain':
      return 'object-contain';
    case 'cover':
      return 'object-cover';
    case 'fill':
      return 'object-fill';
    case 'none':
      return 'object-none';
    case 'scale-down':
      return 'object-scale-down';
    default:
      return 'object-cover';
  }
};

type CardComponentImageProps = ImageProps & IWithLinkProps & CardImageProps;
const CardImage = ({
  className,
  children,
  href,
  containerClassName,
  objectSize = 'cover',
  ...props
}: CardComponentImageProps) => {
  const image = (
    <div
      className={cn(
        `
          relative h-[25vh] w-full overflow-hidden rounded-lg
          md:h-[250px]
        `,
        containerClassName
      )}
    >
      <Image
        fill
        className={cn(
          'object-center',
          getObjectSizeClassName(objectSize),
          className
        )}
        {...props}
        alt={props.alt || ''}
      />
    </div>
  );

  if (href) {
    return (
      <TextLink href={href} underline={false}>
        {image}
      </TextLink>
    );
  }

  return image;
};

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardImage,
  CardSubtitle,
};
