import { Router } from 'express';

import { multerConfig } from '@/config/config';
import { uploadFiles } from '@/controllers/files.controller';
import protectionMiddleware from '@/middlewares/protection.middleware';
import { MAX_FILES_UPLOAD } from '@/utils/constants';

const router = Router();

router.route('/')
  .post(
    // protect the api
    protectionMiddleware({}),
    // files is the name of the field in the form
    multerConfig.array('files', MAX_FILES_UPLOAD),
    uploadFiles
  );

export default router;
