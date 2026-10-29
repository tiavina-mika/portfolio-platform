import { Router } from 'express';

import { multerConfig } from '@/config/config';
import { MAX_FILES_UPLOAD } from '@/constants/_core/constants';
import { uploadFiles } from '@/controllers/_core/files.controller';
import protectionMiddleware from '@/middlewares/protection.middleware';
import { fileUploadRateLimiter } from '@/middlewares/rateLimit.middleware';

const router = Router();

router.route('/')
  .post(
    // limit upload abuse / storage cost
    fileUploadRateLimiter,
    // protect the api
    protectionMiddleware({}),
    // files is the name of the field in the form
    multerConfig.array('files', MAX_FILES_UPLOAD),
    uploadFiles
  );

export default router;
