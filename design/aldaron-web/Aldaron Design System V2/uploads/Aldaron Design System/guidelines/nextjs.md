# Brancher le système dans Next.js

## Polices — `app/fonts.ts`
```ts
import { Familjen_Grotesk, IBM_Plex_Mono } from 'next/font/google';

export const familjen = Familjen_Grotesk({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-familjen',
  display: 'swap',
});
export const plexMono = IBM_Plex_Mono({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-mono',
  display: 'swap',
});
```

## Layout, metadata et thème — `app/layout.tsx`
```tsx
import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from 'next-themes';
import { familjen, plexMono } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://aldaron.example'),          // domaine à confirmer
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
    <html lang="fr" className={`${familjen.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <body><ThemeProvider attribute="class" defaultTheme="light" enableSystem>{children}</ThemeProvider></body>
    </html>
  );
}
```

## Manifest PWA — `app/manifest.ts`
```ts
import type { MetadataRoute } from 'next';
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Aldaron', short_name: 'Aldaron', start_url: '/', display: 'standalone',
    background_color: '#F6F3EE', theme_color: '#17181A',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
```

## Fichiers à copier dans `public/`
| Source | Destination |
|---|---|
| `assets/icons/favicon.ico` | `public/favicon.ico` (16, 32, 48 px) |
| `assets/icons/favicon.svg` | `public/favicon.svg` (s'inverse en mode sombre) |
| `assets/icons/apple-touch-icon.png` | `public/apple-touch-icon.png` (180) |
| `assets/icons/icon-192.png`, `icon-512.png`, `icon-512-maskable.png` | `public/` |
| `assets/brand/og-image.png` | `public/og-image.png` (1200 × 630) |
| `assets/logo/*.svg` | `public/brand/` |

## shadcn/ui
`components.json` : `"style": "new-york"`, `"baseColor": "stone"`, `"cssVariables": true`, puis remplacer `app/globals.css` par `export/nextjs/globals.css`. Les composants shadcn gardent leur structure ; seuls les jetons changent. Ajustements de classes recommandés pour coller aux composants de référence :

- **Button** : `h-11 px-[18px] text-[15px]` (md), `h-9 px-3 text-sm` (sm), `h-[52px] px-6 text-base` (lg) ; ajouter une variante `brand: "bg-brand text-brand-foreground hover:bg-brand/90"`.
- **Input / SelectTrigger** : `h-11 bg-card border-input focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20`.
- **Badge** : `rounded-full h-6 px-[9px] text-xs` ; variantes `success | warning | info` sur fonds `*-subtle`.
- **TableHead** : `font-mono text-xs uppercase tracking-wider text-muted-foreground bg-background`.
- **Icônes** : `lucide-react`, `strokeWidth={1.75}`, `size-4` (dense) / `size-5` (défaut).
