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
import { fontsVariables } from '../components/fonts';
import '../app/globals.css';

// on the root element like in /app/[locale]/layout.tsx: a dialog or a menu is portaled out of the story
document.documentElement.classList.add(...fontsVariables.split(' '));

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

  decorators: [
    (Story: FC, context: any) => {
      return (
        <div className="font-sans">
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
