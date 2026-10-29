import { Outlet, createRoute } from '@tanstack/react-router';
import { z } from 'zod';

import CMSFormLayout from '@/containers/cms/CMSFormLayout';
import CreatePage from '@/pages/pages/CreatePage';
import EditPage from '@/pages/pages/EditPage';
import {
  onPageEnter, onPagesEnter, onCreatePageEnter, onEditPageEnter, onPagesLeave, onCreateOrEditPageLeave,
} from '@/redux/actions/page.action';
import { onEnter } from '@/redux/actions/util.action';
import { IIdParams } from '@/types/app.type';
import { PATH_NAMES } from '@/utils/pathnames';
import { tabAndCategoryRouteSearchParams } from '@/validations/app.validations';

import { privateLayout } from './private.routes';
import Page from '../../pages/pages/Page';
import Pages from '../../pages/pages/Pages';

export const pagesLayout = createRoute({
  getParentRoute: () => privateLayout,
  component: () => <Outlet />,
  path: PATH_NAMES.pages,
});

export const pagesRoute = createRoute({
  validateSearch: search => tabAndCategoryRouteSearchParams.parse(search),
  getParentRoute: () => pagesLayout,
  beforeLoad: onEnter(onPagesEnter),
  onLeave: onEnter(onPagesLeave),
  component: Pages,
  path: '/',
});

export const pageFormLayout = createRoute({
  id: 'page',
  getParentRoute: () => pagesLayout,
  component: CMSFormLayout,
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
  onLeave: onEnter(onCreateOrEditPageLeave),
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
