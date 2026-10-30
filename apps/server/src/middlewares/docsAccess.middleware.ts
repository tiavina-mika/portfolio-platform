import type { RequestHandler } from 'express';

import type { DocsSection } from '@/types/docs.type';

import {
  getDocsCookieName, getDocsPassword, getSafeDocsRedirectPath, isDocsSessionTokenValid, parseCookies,
} from '@/utils/_core/docs-access.utils';
import { getDocsLoginLocale, renderDocsLoginPage } from '@/utils/_core/docs-login-page.utils';

/**
 * Lets a request through to the docs of a section only with a valid session cookie. A page request
 * without one gets the password form; anything else (an asset, a search index) gets a bare 401.
 * A section with no password configured is closed, never open.
 */
export const requireDocsAccess = (section: DocsSection): RequestHandler => (req, res, next) => {
  const password = getDocsPassword(section);

  if (!password) {
    res.status(404).end();
    return;
  }

  const token = parseCookies(req.headers.cookie)[getDocsCookieName(section)];

  if (isDocsSessionTokenValid(token, section, password)) {
    next();
    return;
  }

  const isPageRequest = req.method === 'GET' && (req.headers.accept ?? '').includes('text/html');

  if (!isPageRequest) {
    res.status(401).end();
    return;
  }

  res.status(401).type('html').set('Cache-Control', 'no-store').send(renderDocsLoginPage({
    section,
    locale: getDocsLoginLocale(req),
    next: getSafeDocsRedirectPath(section, req.originalUrl),
    hasError: false,
  }));
};
