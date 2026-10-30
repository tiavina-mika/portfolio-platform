import type { NextFunction, Request, Response } from 'express';

import { MAX_IMAGE_SIZE } from '@shared/constants';
import { MulterError } from 'multer';

import { MAX_FILES_UPLOAD } from '@/constants/_core/constants';
import { HttpException } from '@/types/app.type';
import { logger } from '@/utils/_core/logger';

const errorMiddleware = (error: HttpException, req: Request, res: Response, next: NextFunction): any => {
  try {
    /*
     * Multer rejects an oversized or over-long upload by throwing rather than by answering, and
     * its error carries no status — reported as a bare 500, the client could only show "something
     * went wrong" for a file the user can perfectly well shrink and send again.
     */
    const isUploadTooLarge = error instanceof MulterError;
    const status: number = isUploadTooLarge ? 413 : (error.status || 500);
    const message: string = isUploadTooLarge
      ? `Upload rejected: each file must stay under ${MAX_IMAGE_SIZE} MB ` +
        `and a request may carry at most ${MAX_FILES_UPLOAD} files.`
      : (error.message || 'Something went wrong');

    logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`);
    res.status(status).json({ message });
  }
  catch (error) {
    next(error);
  }
};

export default errorMiddleware;
