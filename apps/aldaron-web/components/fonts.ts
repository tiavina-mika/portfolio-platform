/**
 * The three families of the design system: Bricolage Grotesque for the titles, Instrument Sans for the
 * text, JetBrains Mono for the labels, figures and code. Each one is exposed as a CSS variable, read by
 * the Tailwind theme of `app/globals.css`.
 */
import { Bricolage_Grotesque, Instrument_Sans, JetBrains_Mono } from 'next/font/google';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-bricolage',
  display: 'swap',
});

const instrument = Instrument_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-instrument',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const fontsVariables = [bricolage.variable, instrument.variable, jetbrains.variable].join(' ');
