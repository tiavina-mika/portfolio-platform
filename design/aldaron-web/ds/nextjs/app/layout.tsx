import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from 'next-themes';
import { bricolage, instrument, jetbrains } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://aldaron.example'), // à remplacer par le vrai domaine
  title: { default: 'Aldaron', template: '%s · Aldaron' },
  description: 'Votre MVP, back-office compris, dès le premier jour.',
  icons: {
    icon: [{ url: '/favicon.ico', sizes: '48x48' }, { url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  manifest: '/manifest.webmanifest',
  openGraph: { type: 'website', siteName: 'Aldaron', images: [{ url: '/og-image.png', width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image', images: ['/og-image.png'] },
};
export const viewport: Viewport = {
  themeColor: [{ media: '(prefers-color-scheme: light)', color: '#F6F3EE' }, { media: '(prefers-color-scheme: dark)', color: '#121311' }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${bricolage.variable} ${instrument.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <body><ThemeProvider attribute="class" defaultTheme="light" enableSystem>{children}</ThemeProvider></body>
    </html>
  );
}
