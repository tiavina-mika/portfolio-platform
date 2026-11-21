/**
 * The two families of the design system: Familjen Grotesk for the titles and the text, IBM Plex Mono for
 * the labels, figures and code. Each one is exposed as a CSS variable, read by the Tailwind theme of
 * `app/globals.css`.
 */
import { Familjen_Grotesk, IBM_Plex_Mono } from 'next/font/google';

const familjen = Familjen_Grotesk({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-familjen',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-mono',
  display: 'swap',
});

export const fontsVariables = [familjen.variable, plexMono.variable].join(' ');
