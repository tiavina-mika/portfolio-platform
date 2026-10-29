import type { Request, Response } from 'express';

import { logger } from '@/utils/logger';

/**
 *
 * @NOTE no more used, should be deleted
 * @param req
 * @param res
 * @param next
 */
export const migratePagesCategoryToCategories = (_: Request, res: Response): any => {
  try {
    return res.json({
      message: 'Migration done',
    });
  }

  catch (error) {
    logger.error(
      // eslint-disable-next-line @stylistic/max-len
      `[src/controllers/app.controllers.ts:migratePagesCategoryToCategories] error: ${(error as Error).message}`
    );
    return res.status(400).json({
      error: (error as Error).message,
    });
  }
};
