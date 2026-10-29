import { cn } from '@/utils/app.utils';

import Section from './Section';
import SectionTitle from '../typography/SectionTitle';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardImage,
  CardTitle,
} from '../ui/Card';

type Props = {
  className?: string;
  cardClassName?: string;
  cardsClassName?: string;
  title: string;
  titleClassName?: string;
  imageClassName?: string;
  imageContainerClassName?: string;
  items: any[];
};

const CardsBlock = ({
  items,
  title,
  className,
  imageClassName,
  titleClassName,
  cardClassName,
  cardsClassName,
  imageContainerClassName,
}: Props) => {
  return (
    <Section
      className={cn(className, 'flex flex-col')}
      rootClassName="mt-2 mb-10 lg-5 md:mb-20 lg:mb-24"
    >
      <SectionTitle>{title}</SectionTitle>
      <div
        className={cn(
          `
            flex flex-col gap-8
            md:grid md:grid-cols-2 md:flex-row md:gap-12
            lg:grid-cols-3 lg:gap-8
            xl:gap-10
            2xl:grid-cols-4
          `,
          cardsClassName
        )}
      >
        {items.map((item, index) => (
          <Card className={cardClassName} key={index}>
            <CardHeader>
              <CardImage
                alt={item.title}
                className={imageClassName}
                src={item.image}
                containerClassName={cn(
                  'block',
                  { 'dark:hidden': !!item.imageDarkMode },
                  imageContainerClassName
                )}
              />
              {item.imageDarkMode && (
                <CardImage
                  alt={item.title}
                  className={imageClassName}
                  src={item.imageForDarkMode}
                  containerClassName={cn(
                    `
                      hidden
                      dark:block
                    `,
                    imageContainerClassName
                  )}
                />
              )}
            </CardHeader>
            <CardContent className="pt-2!">
              <CardTitle className={titleClassName} level={4}>
                {item.title}
              </CardTitle>
              <CardDescription size="md">{item.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
};

export default CardsBlock;
