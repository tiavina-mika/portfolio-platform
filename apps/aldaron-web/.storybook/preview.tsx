import React, { FC } from 'react';

import {
  INITIAL_VIEWPORTS,
  MINIMAL_VIEWPORTS,
} from 'storybook/viewport';
import type { Preview } from '@storybook/nextjs-vite';
import { NextIntlClientProvider } from 'next-intl';

import { defaultLocale, storybookLocalesOptions } from '../i18n/config';
import ThemeProvider from '../providers/ThemeProvider';
import { getTranslatedMessages } from '../utils/translation.utils';
import { customViewports } from '../utils/viewports.utils';
import localFont from 'next/font/local';
import '../app/globals.css';

// -------------------------------------------- //
// ------------ font configuration ------------ //
// -------------------------------------------- //
/**
 * we copied the font configuration from web/components/fonts.ts
 * and changed the path to the fonts folder, storybook doesn't have access to the public folder
 * @see https://stackoverflow.com/questions/77027792/storybook-question-local-fonts-not-loading-next-13-tailwind-storybook-7
 */

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

export const fontsVariables = [basier.variable, calibre.variable].join(' ');

// -------------------------------------------- //
// --------- storybook configuration ---------- //
// -------------------------------------------- //
const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    },
    nextjs: {
      appDirectory: true,
    },
    viewport: {
      options: {
        ...MINIMAL_VIEWPORTS,
        ...customViewports,
        ...INITIAL_VIEWPORTS,
      }
    },
  },

  // add fonts to the storybook preview (like in /app/[locale]/layout.tsx)
  decorators: [
    (Story: FC, context: any) => {
      return (
        <div className={`${fontsVariables} antialiased`}>
          <NextIntlClientProvider
            locale={context.globals.locale}
            messages={getTranslatedMessages(context.globals.locale)}
          >
            <ThemeProvider
              attribute="class"
              forcedTheme={context.globals.theme}
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {/* 👇 Decorators in Storybook also accept a function. Replace <Story/> with Story() to enable it  */}
              <Story />
            </ThemeProvider>
          </NextIntlClientProvider>
        </div>
      );
    },
  ],

  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        // The label to show for this toolbar item
        title: 'Theme',
        icon: 'circlehollow',
        // Array of plain string values or MenuItem shape (see below)
        items: ['light', 'dark', 'system'],
        // Change title based on selected value
        dynamicTitle: true,
      },
    },
    locale: {
      description: 'Global language for components',
      defaultValue: defaultLocale,
      toolbar: {
        // The label to show for this toolbar item
        title: 'Language',
        icon: 'globe',
        // Array of plain string values or MenuItem shape (see below)
        items: storybookLocalesOptions,
        // Change title based on selected value
        dynamicTitle: true,
      },
    },
  },

  initialGlobals: {
    viewport: {
      value: 'iphone14',
      isRotated: false
    }
  }
};

export default preview;
