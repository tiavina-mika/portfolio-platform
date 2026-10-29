/**
 * font configuration
 * NOTE: when modifying this file, make sure to:
 * - update the font files in the public/fonts folder
 * - update the copied config in .storybook/preview.tsx
 */
import localFont from 'next/font/local';

const basier = localFont({
  variable: '--font-primary',
  src: [
    {
      path: '../public/fonts/BasierCircle/BasierCircle-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/BasierCircle/BasierCircle-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../public/fonts/BasierCircle/BasierCircle-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/BasierCircle/BasierCircle-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
});

const calibre = localFont({
  src: '../public/fonts/Calibre/Calibre-Bold.otf',
  variable: '--font-secondary',
  weight: '600',
});

export const primaryFont = basier.variable;
export const secondaryFont = calibre.variable;

export const primaryFontStyle = basier.style;
export const secondaryFontStyle = calibre.style;

export const fontsVariables = [primaryFont, secondaryFont].join(' ');
