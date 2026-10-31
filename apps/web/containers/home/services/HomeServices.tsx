import { useTranslations } from 'next-intl';

import CardsBlock from '@/components/layouts/CardsBlock';

const SERVICES = [
  {
    key: '1',
    image: '/icons/plant-growth.svg',
    imageForDarkMode: '/icons/plant-growth-light.svg',
  },
  {
    key: '2',
    image: '/icons/smartphone.svg',
    imageForDarkMode: '/icons/smartphone-light.svg',
  },
  {
    key: '3',
    image: '/icons/lightbulb.svg',
    imageForDarkMode: '/icons/lightbulb-light.svg',
  },
  {
    key: '4',
    image: '/icons/page-web.svg',
    imageForDarkMode: '/icons/page-web-light.svg',
  },
];

/**
 * What I can do for a client, as a grid of cards. Static: the texts come from the translations
 */
const HomeServices = () => {
  const t = useTranslations('HomeServices');

  return (
    <CardsBlock
      cardClassName="md:!pb-6"
      cardsClassName="lg:grid-cols-2 2xl:grid-cols-2"
      imageClassName="object-contain"
      imageContainerClassName="rounded-none w-[30px] h-[30px] md:w-[50px] md:h-[50px]"
      title={t('title')}
      items={SERVICES.map(({ key, ...images }) => ({
        ...images,
        title: t(`items.${key}.title`),
        description: t(`items.${key}.description`),
      }))}
    />
  );
};

export default HomeServices;
