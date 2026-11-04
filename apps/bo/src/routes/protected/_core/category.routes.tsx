import { Outlet, createRoute } from '@tanstack/react-router';
import { lazy } from 'react';
import { z } from 'zod';

import {
  onCategoryEnter, onCategoriesEnter, onCategoryLeave,
} from '@/redux/actions/_core/category.action';
import { onEnter, onLeave } from '@/redux/actions/_core/util.action';
import { privateLayout } from '@/routes/protected/_core/privateLayout.routes';
import { IIdParams } from '@/types/_core/app.type';
import { validateTabSearch } from '@/utils/_core/app.utils';
import { PATH_NAMES } from '@/utils/_core/pathnames';


const Categories = lazy(() => import('@/pages/_core/categories/Categories'));
const Category = lazy(() => import('@/pages/_core/categories/Category'));

export const categoriesLayout = createRoute({
  getParentRoute: () => privateLayout,
  component: () => <Outlet />,
  path: PATH_NAMES.categories,
  staticData: { breadcrumb: { labelKey: 'cms:category.categories' } },
});

export const categoriesRoute = createRoute({
  validateSearch: validateTabSearch,
  getParentRoute: () => categoriesLayout,
  beforeLoad: onEnter(onCategoriesEnter),
  component: Categories,
  path: '/',
});

export const categoryRoute = createRoute({
  parseParams: (params: IIdParams) => ({ id: z.string().parse(params.id) }),
  getParentRoute: () => categoriesLayout,
  beforeLoad: onEnter(onCategoryEnter),
  onLeave: onLeave(onCategoryLeave),
  component: Category,
  path: '$id',
});

const categoryRoutes = [categoriesRoute, categoryRoute];

export default categoryRoutes;
