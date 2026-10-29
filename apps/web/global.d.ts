// Use type safe message keys with `next-intl`
type Messages = typeof import('./translations/en/app.json') &
  typeof import('./translations/en/article.json') &
  typeof import('./translations/en/common.json') &
  typeof import('./translations/en/form.json') &
  typeof import('./translations/en/zod.json');

declare interface IntlMessages extends Messages {}

declare module '*.css' {
  const content: unknown;
  export default content;
}

// Google Analytics function, defined by the Analytics component once the consent allows it
interface Window {
  gtag?: (...args: unknown[]) => void;
}
