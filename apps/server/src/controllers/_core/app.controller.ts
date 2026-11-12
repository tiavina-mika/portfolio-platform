import dayjs from 'dayjs';
import { type Request, type Response } from 'express';

import { generatePrivateDownloadUrl } from '@/api/_core/cloudinary.api';
import { USE_MASTER_KEY } from '@/constants/_core/constants';
import { logger } from '@/utils/_core/logger';


/**
 * update single file
 * if the user id is defined, the files will be stored in that user folder
 * @param req
 * @param res
 * @param next
 */
export const downloadCV = async (_req: Request, res: Response): Promise<void> => {
  try {
    const app = await new Parse.Query('App').ascending('createdAt').first(USE_MASTER_KEY);

    if (!app) {
      throw new Error('App not found');
    }

    /*
     * always serve the CV stored today, not the public id sent by the client: a page cached by the
     * browser or the website can still carry the id of a CV that has since been replaced
     */
    const publicId: string | undefined = app.get('cv')?.publicId;

    if (!publicId) {
      throw new Error('CV not found');
    }

    const tempPublicLink = generatePrivateDownloadUrl(publicId, 'pdf');

    const result = await fetch(tempPublicLink);

    if (!result.ok) {
      throw new Error(`CV download failed (${result.status})`);
    }

    const arrayBuffer = await result.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer); // Create a typed array for the ArrayBuffer

    // Convert ArrayBuffer to Buffer
    const buffer = Buffer.from(uint8Array);
    const split = publicId?.split('/') || [];
    const fileName = split[split.length - 1];
    const defaultFileName = (fileName || 'cv') + '-' + dayjs().format('YYYY');

    // Set headers to force download
    res.setHeader('Content-Disposition', `attachment; filename="${defaultFileName}.pdf"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', buffer.length);
    // Send the buffer as the response
    res.send(buffer);
  }
  catch (error) {
    logger.error(`[src/controllers/app.controllers.ts:downloadCV] error: ${(error as Error).message}`);
    res.status(400).json((error as Error).message);
  }
};
