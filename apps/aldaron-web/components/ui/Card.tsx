
import Image, { ImageProps } from 'next/image';
import { LinkProps } from 'next/link';
import {
  type ComponentProps, type ReactNode,
} from 'react';

import { cn } from '@/utils/app.utils';
import { CARD_IMAGE_SIZES } from '@/utils/constants';

import Text, { TextProps } from '../typography/Text';
import TextLink from '../typography/TextLink';
import Title, { TitleProps } from '../typography/Title';

type WithChildrenProps = { children: ReactNode };
type CardVariant = 'default' | 'muted' | 'inverted' | 'elevated';

interface ICardProps extends ComponentProps<'div'> {
  /**
   * `inverted` is for the offer put forward: one per section
   * @default default
   */
  variant?: CardVariant;
  /**
   * The whole card is a click zone: its border darkens on hover
   * @default false
   */
  isInteractive?: boolean;
  as?: 'div' | 'section' | 'article';
}

// a card stands out through its border, not a shadow
const CARD_VARIANT_CLASSES: Record<CardVariant, string> = {
  default: 'border-border bg-card text-card-foreground',
  muted: 'border-transparent bg-muted',
  inverted: 'border-transparent bg-primary text-primary-foreground',
  elevated: 'border-transparent bg-card text-card-foreground shadow-md',
};

const Card = ({
  className,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  as: Component = 'div',
  variant = 'default',
  isInteractive = false,
  ...props
}: ICardProps) => {
  return (
    <Component
      data-slot="card"
      data-variant={variant}
      className={cn(
        'flex min-w-0 flex-1 flex-col gap-3 self-stretch rounded-lg border',
        CARD_VARIANT_CLASSES[variant],
        isInteractive && `
          transition-[border-color,box-shadow] duration-120 ease-out
          hover:border-border-hover hover:shadow-sm
        `,
        className
      )}
      {...props}
    />
  );
};

const SPACING_CLASSES = 'p-4 lg:p-6';

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

/**
 * The mono label above the title of a card
 */
const CardEyebrow = ({ className, ...props }: ComponentProps<'div'>) => (
  <div
    data-slot="card-eyebrow"
    className={cn(
      `
        label-mono text-muted-foreground
        in-data-[variant=inverted]:text-primary-foreground/72
      `,
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
    className={cn(SPACING_CLASSES, 'flex items-center pt-0!', className)}
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
          className="hover:text-brand-text hover:underline"
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
      `
        text-muted-foreground
        in-data-[variant=inverted]:text-primary-foreground/72
      `,
      size === 'sm'
        ? 'text-sm'
        : `
          text-base
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
    className={cn('text-base! font-semibold text-muted-foreground', className)}
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

type CardComponentImageProps =ImageProps & IWithLinkProps & CardImageProps;
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
        /*
         * a `fill` image needs `sizes` or Next serves the largest variant; cards are at most
         * half the viewport on desktop and full width on mobile. A caller can override it.
         */
        sizes={CARD_IMAGE_SIZES}
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
  CardEyebrow,
  CardImage,
  CardSubtitle,
};
