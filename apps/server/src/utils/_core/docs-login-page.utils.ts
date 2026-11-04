import type { Request } from 'express';

import escape from 'lodash/escape.js';

import type { Locale } from '@/types/app.type';
import type { DocsSection } from '@/types/docs.type';

import { DEFAULT_LANGUAGE, locales, translate } from '@/config/i18n';

import { getDocsSectionPath } from './docs-access.utils';

type DocsLoginPageInput = {
  section: DocsSection;
  locale: Locale;
  // address the reader asked for, opened again once signed in
  next: string;
  hasError: boolean;
};

/**
 * The language of the form: the browser's first supported language, French otherwise. The i18next
 * request middleware is mounted after the docs, so `req.language` is not available here.
 */
export const getDocsLoginLocale = (req: Request): Locale => (
  (req.acceptsLanguages(locales) || DEFAULT_LANGUAGE) as Locale
);

/**
 * The only page the server renders itself for the docs: the password form. Plain HTML with an
 * inline style, no script, so it works under the strict content security policy and before any
 * docs asset can be loaded.
 */
export const renderDocsLoginPage = ({
  section, locale, next, hasError,
}: DocsLoginPageInput): string => {
  const title = translate(`docsAccess.sections.${section}`, locale);

  return `<!doctype html>
<html lang="${locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${escape(title)}</title>
<style>
  body { font-family: system-ui, sans-serif; display: grid; place-items: center; min-height: 100vh; margin: 0;
    background: Canvas; color: CanvasText; color-scheme: light dark; }
  form { display: grid; gap: 12px; width: min(360px, calc(100vw - 32px)); }
  h1 { font-size: 1.25rem; margin: 0; }
  input, button { font: inherit; padding: 10px 12px; }
  .error { color: #b3261e; margin: 0; }
</style>
</head>
<body>
<form method="post" action="${getDocsSectionPath(section)}/login">
  <h1>${escape(title)}</h1>
  <input type="hidden" name="next" value="${escape(next)}">
  <label for="password">${escape(translate('docsAccess.password', locale))}</label>
  <input id="password" name="password" type="password" autocomplete="current-password" required autofocus>
  ${hasError ? `<p class="error" role="alert">${escape(translate('docsAccess.wrongPassword', locale))}</p>` : ''}
  <button type="submit">${escape(translate('docsAccess.submit', locale))}</button>
</form>
</body>
</html>
`;
};
