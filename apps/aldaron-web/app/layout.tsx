import './globals.css';

import { ReactNode } from 'react';

// import initializeParseServer from '@/config/parse.config';

/*
 * This is the RootLayout component: A wrapper for the app.
 * Navigate to "app/[locale]/layout.tsx" for the main layout file.
 */

type RootLayoutProperties = { children: ReactNode };

const RootLayout = ({ children }: RootLayoutProperties) => {
  /*
   * initialize Parse in build time
   * for run time, it is already initialized in server.js
   */
  // initializeParseServer();
  return children;
};

/**
 *
 * 🛠️ Current "component" primarily passes its children through. However, its existence
 * resolves an issue in Next.js where link clicks that change the locale might
 * otherwise be disregarded.
 *
 * 📚 Reference:
 * - Next.js Documentation: Pages and Layouts:
 *   @see https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts
 *
 * 💡 Good to Know: `type` vs. `interface` in TypeScript
 *
 * - `type`: Preferred for simpler, local type definitions, or when union/intersection types are needed.
 * - `interface`: Ideal for declaration merging or when creating a type that will be extended.
 *
 * 📚 Reference:
 * - Understanding the difference between `type` and `interface`:
 *   @see https://levelup.gitconnected.com/typescript-what-is-the-difference-between-type-and-interface-9085b88ee531
 */

export default RootLayout;
