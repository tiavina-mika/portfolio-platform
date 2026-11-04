
/**
 * this API is called directly from the client browser url
 * it's passed data from the client side as query params
 * ex: /download/cv.pdf?publicId=xxxx
 */
import { Router } from 'express';

import { downloadCV } from '@/controllers/_core/app.controller';
import { validateApiInput } from '@/middlewares/validation.middleware';
import { downloadFileInputSchema } from '@/validations/_core/util.validations';

const router = Router();

router.route('/cv.pdf').get(validateApiInput({ querySchema: downloadFileInputSchema }), downloadCV);

export default router;
