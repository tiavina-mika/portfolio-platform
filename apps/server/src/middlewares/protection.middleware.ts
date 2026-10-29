import type { NextFunction, Request, Response } from 'express';

import { getUserForSessionToken } from '@/cloud/services/auth.service.cloud';
import { HttpException } from '@/types/app.type';
import { logger } from '@/utils/logger';

type Input = {
  withKey?: boolean;
  withAuth?: boolean;
};
const protectionMiddleware = (
  { withKey = true, withAuth = true }: Input
): (req: Request, res: Response, next: NextFunction) => Promise<any> => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // should have a header key
      if (withKey) {
        const apiKey = req.get('X-portfolio-key');

        // if the key exists, go to next
        if (!apiKey) {
          next(new HttpException(400, 'Missing "X-portfolio-key" params'));
        }
        else if (apiKey && apiKey !== process.env.REST_API_KEY) {
          next(new HttpException(400, 'Invalid "X-portfolio-key"'));
        }
      }

      // should have a header session token
      if (withAuth) {
        const parseSession = req.get('X-Parse-Session-Token') || req.query.sessionToken;

        if (!parseSession) {
          next(new HttpException(400, 'Missing session params'));
        }
        const user = await getUserForSessionToken(parseSession as string);

        // if user exists, go to next
        if (!user) {
          next(new HttpException(400, 'User not found'));
        }
      }

      next();
    }
    catch (error) {
      logger.error(`[middlewares/protectionMiddleware] error: ${(error as Error).message}`);
      return res.status(400).json({ error: 400, message: 'Bad request' });
    }
  };
};

export default protectionMiddleware;
