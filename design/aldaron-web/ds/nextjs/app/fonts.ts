import { Bricolage_Grotesque, Instrument_Sans, JetBrains_Mono } from 'next/font/google';

export const bricolage = Bricolage_Grotesque({ subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600', '700', '800'], variable: '--font-bricolage', display: 'swap' });
export const instrument = Instrument_Sans({ subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600', '700'], variable: '--font-instrument', display: 'swap' });
export const jetbrains = JetBrains_Mono({ subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600'], variable: '--font-jetbrains', display: 'swap' });
