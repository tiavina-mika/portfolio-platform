import { Router } from 'express';

import { migratePagesCategoryToCategories } from '@/controllers/migration.controller';

const router = Router();

router.route('/pages/category-to-categories')
  .get(
    migratePagesCategoryToCategories
  );

export default router;
