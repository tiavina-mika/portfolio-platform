import { Outlet, createRoute } from '@tanstack/react-router';
import { z } from 'zod';

import Categories from '@/pages/categories/Categories';
import Category from '@/pages/categories/Category';
import {
  onCategoryEnter, onCategoriesEnter, onCategoriesLeave, onCategoryLeave,
} from '@/redux/actions/category.action';
import { onEnter } from '@/redux/actions/util.action';
import { IIdParams } from '@/types/app.type';
import { validateTabSearch } from '@/utils/app.utils';
import { PATH_NAMES } from '@/utils/pathnames';

import { privateLayout } from './private.routes';

export const categoriesLayout = createRoute({
  getParentRoute: () => privateLayout,
  component: () => <Outlet />,
  path: PATH_NAMES.categories,
});

export const categoriesRoute = createRoute({
  validateSearch: validateTabSearch,
  getParentRoute: () => categoriesLayout,
  beforeLoad: onEnter(onCategoriesEnter),
  onLeave: onEnter(onCategoriesLeave),
  component: Categories,
  path: '/',
});

export const categoryRoute = createRoute({
  parseParams: (params: IIdParams) => ({ id: z.string().parse(params.id) }),
  getParentRoute: () => categoriesLayout,
  beforeLoad: onEnter(onCategoryEnter),
  onLeave: onEnter(onCategoryLeave),
  component: Category,
  path: '$id',
});

const categoryRoutes = [categoriesRoute, categoryRoute];

export default categoryRoutes;
