import { Outlet, createRoute } from '@tanstack/react-router';
import { lazy } from 'react';
import { z } from 'zod';

import {
  onPageEnter, onPagesEnter, onCreatePageEnter, onEditPageEnter, onCreateOrEditPageLeave,
} from '@/redux/actions/_core/page.action';
import { onEnter, onLeave } from '@/redux/actions/_core/util.action';
import { privateLayout } from '@/routes/protected/_core/privateLayout.routes';
import { IIdParams } from '@/types/_core/app.type';
import { PATH_NAMES } from '@/utils/_core/pathnames';
import { tabAndCategoryRouteSearchParams } from '@/validations/_core/app.validations';


const CmsFormWideLayout = lazy(() => import('@/containers/_core/cms/CmsFormWideLayout'));
const CreatePage = lazy(() => import('@/pages/_core/pages/CreatePage'));
const EditPage = lazy(() => import('@/pages/_core/pages/EditPage'));
const Page = lazy(() => import('@/pages/_core/pages/Page'));
const Pages = lazy(() => import('@/pages/_core/pages/Pages'));

export const pagesLayout = createRoute({
  getParentRoute: () => privateLayout,
  component: () => <Outlet />,
  path: PATH_NAMES.pages,
  staticData: { breadcrumb: { labelKey: 'cms:pages' } },
});

export const pagesRoute = createRoute({
  validateSearch: search => tabAndCategoryRouteSearchParams.parse(search),
  getParentRoute: () => pagesLayout,
  beforeLoad: onEnter(onPagesEnter),
  component: Pages,
  path: '/',
});

export const pageFormLayout = createRoute({
  id: 'page',
  getParentRoute: () => pagesLayout,
  component: CmsFormWideLayout,
});

export const pageRoute = createRoute({
  parseParams: (params: IIdParams) => ({ id: z.string().parse(params.id) }),
  beforeLoad: onEnter(onPageEnter),
  getParentRoute: () => pagesLayout,
  component: Page,
  path: '$id',
});

export const editPageRoute = createRoute({
  parseParams: (params: any) => ({ id: z.string().parse(params.id) }),
  path: `$id/${PATH_NAMES.edit}`,
  beforeLoad: onEnter(onEditPageEnter),
  onLeave: onLeave(onCreateOrEditPageLeave),
  getParentRoute: () => pageFormLayout,
  component: EditPage,
});

export const createPageRoute = createRoute({
  path: PATH_NAMES.create,
  beforeLoad: onEnter(onCreatePageEnter),
  getParentRoute: () => pageFormLayout,
  component: CreatePage,
});

const pageRoutes = [
  pagesRoute,
  pageRoute,
  pageFormLayout.addChildren([
    createPageRoute,
    editPageRoute,
  ]),
];

export default pageRoutes;
