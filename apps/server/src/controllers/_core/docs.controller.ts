import type { RequestHandler } from 'express';

import type { DocsSection } from '@/types/docs.type';

import { DOCS_SESSION_DURATION_MS } from '@/constants/_core/docs.constants';
import {
  createDocsSessionToken, getDocsCookieName, getDocsPassword, getDocsSectionPath, getSafeDocsRedirectPath,
  isDocsPasswordValid,
} from '@/utils/_core/docs-access.utils';
import { getDocsLoginLocale, renderDocsLoginPage } from '@/utils/_core/docs-login-page.utils';

/**
 * Checks the password of a section and, if right, opens a session: a signed cookie scoped to that
 * section's address, so the password of `features` never opens `business`.
 */
export const loginToDocs = (section: DocsSection): RequestHandler => (req, res) => {
  const password = getDocsPassword(section);

  if (!password) {
    res.status(404).end();
    return;
  }

  const { password: candidate, next } = (req.body ?? {}) as { password?: unknown; next?: unknown };
  const redirectPath = getSafeDocsRedirectPath(section, next);

  if (!isDocsPasswordValid(candidate, password)) {
    res.status(401).type('html').set('Cache-Control', 'no-store').send(renderDocsLoginPage({
      section,
      locale: getDocsLoginLocale(req),
      next: redirectPath,
      hasError: true,
    }));
    return;
  }

  res.cookie(getDocsCookieName(section), createDocsSessionToken(section, password), {
    httpOnly: true,
    sameSite: 'lax',
    // behind the proxy `req.secure` reflects the original request (see `trust proxy` in index.ts)
    secure: req.secure,
    path: getDocsSectionPath(section),
    maxAge: DOCS_SESSION_DURATION_MS,
  });
  res.redirect(303, redirectPath);
};
