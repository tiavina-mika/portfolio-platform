import { getCachedApp } from '@/app/[locale]/page';
import AnimatedPageHeaderImage from '@/components/layouts/AnimatedPageHeaderImage';
import { getImageByBreakpoint } from '@/server/responsive.server';

type Props = {
  theme?: 'light' | 'dark';
};

/**
 * The main image of the hero for a theme, from the app settings in the database, at the size of the
 * device. Without an image it renders nothing. Rendered inside a Suspense boundary: reading the
 * device makes it dynamic
 */
const DynamicHomeHeroVisual = async ({ theme }: Props) => {
  const app = await getCachedApp();
  const file = theme === 'dark' ? app?.imageForDarkMode : app?.image;

  if (!file) return null;

  const image = await getImageByBreakpoint(file);

  return <AnimatedPageHeaderImage displayInMobile image={image} theme={theme} />;
};

export default DynamicHomeHeroVisual;
