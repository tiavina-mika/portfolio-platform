/**
 * The documentation sites, one per section, each behind its own password:
 *   POST /docs/<section>/login   the password form
 *   GET  /docs/<section>/...     the static VitePress build, once signed in
 */
import path from 'node:path';

import express, { Router } from 'express';

import { DOCS_SECTIONS } from '@/constants/_core/docs.constants';
import { loginToDocs } from '@/controllers/_core/docs.controller';
import { requireDocsAccess } from '@/middlewares/docsAccess.middleware';
import { docsLoginRateLimiter } from '@/middlewares/rateLimit.middleware';

const createDocsRouter = (buildRoot: string): Router => {
  const router = Router();

  DOCS_SECTIONS.forEach((section) => {
    const sectionRouter = Router();

    sectionRouter.use((_req, res, next) => {
      // the docs are internal: keep them out of search engines and out of shared caches
      res.set({
        'X-Robots-Tag': 'noindex, nofollow',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'no-referrer',
      });
      next();
    });

    sectionRouter.post('/login', docsLoginRateLimiter, express.urlencoded({ extended: false }), loginToDocs(section));
    sectionRouter.use(requireDocsAccess(section));
    sectionRouter.use(express.static(path.join(buildRoot, section), {
      extensions: ['html'],
      setHeaders: (res) => {
        res.set('Cache-Control', 'private, no-cache');
      },
    }));

    router.use(`/${section}`, sectionRouter);
  });

  return router;
};

export default createDocsRouter;
