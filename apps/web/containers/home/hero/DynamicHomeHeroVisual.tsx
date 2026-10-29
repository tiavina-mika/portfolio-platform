import { getCachedApp } from '@/app/[locale]/page';
import AnimatedPageHeaderImage from '@/components/layouts/AnimatedPageHeaderImage';
import { getImageByBreakpoint } from '@/server/responsive.server';


type Props = {
  // if the image should be displayed in mobile
  theme?: 'light' | 'dark';
};

const DynamicMainImage = async ({ theme }: Props) => {
  const field = theme === 'dark' ? 'imageForDarkMode' : 'image';
  const app = await getCachedApp();

  if (!app) return null;
  if (!app.has(field)) return null;

  const responsiveImage = await getImageByBreakpoint(app.get(field)!);

  return (
    <AnimatedPageHeaderImage
      displayInMobile
      image={responsiveImage}
      theme={theme}
    />
  );
};

export default DynamicMainImage;
