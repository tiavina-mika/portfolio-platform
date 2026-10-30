import { Outlet, createRoute } from '@tanstack/react-router';
import { lazy } from 'react';
import { z } from 'zod';

import {
  onPageSectionEnter, onPageSectionsEnter, onCreatePageSectionEnter,
  onEditPageSectionEnter,
} from '@/redux/actions/_core/pageSection.action';
import { onEnter } from '@/redux/actions/_core/util.action';
import { privateLayout } from '@/routes/protected/_core/privateLayout.routes';
import { IIdParams } from '@/types/_core/app.type';
import { PATH_NAMES } from '@/utils/_core/pathnames';
import { tabRouteSearchParams } from '@/validations/_core/app.validations';


const CMSFormLayout = lazy(() => import('@/containers/_core/cms/CMSFormLayout'));
const CreatePageSection = lazy(() => import('@/pages/_core/pages/sections/CreatePageSection'));
const EditPageSection = lazy(() => import('@/pages/_core/pages/sections/EditPageSection'));
const PageSection = lazy(() => import('@/pages/_core/pages/sections/PageSection'));
const PageSections = lazy(() => import('@/pages/_core/pages/sections/PageSections'));

export const pageSectionsLayout = createRoute({
  getParentRoute: () => privateLayout,
  component: () => <Outlet />,
  path: PATH_NAMES.pageSections,
  staticData: { breadcrumb: { labelKey: 'cms:blocks' } },
});

export const pageSectionsRoute = createRoute({
  validateSearch: search => tabRouteSearchParams.parse(search),
  getParentRoute: () => pageSectionsLayout,
  beforeLoad: onEnter(onPageSectionsEnter),
  component: PageSections,
  path: '/',
});

export const pageSectionFormLayout = createRoute({
  id: 'page-section',
  getParentRoute: () => pageSectionsLayout,
  component: CMSFormLayout,
});

type PageSectionParams = IIdParams & { pageId?: string };

export const pageSectionRoute = createRoute({
  parseParams: (params: PageSectionParams) => ({
    id: z.string().parse(params.id),
  }),
  beforeLoad: onEnter(onPageSectionEnter),
  getParentRoute: () => pageSectionsLayout,
  component: PageSection,
  path: '$id',
});

export const editPageSectionRoute = createRoute({
  parseParams: (params: any) => ({
    id: z.string().parse(params.id),
    pageId: z.string().optional().parse(params.pageId),
  }),
  path: `$pageId/${PATH_NAMES.edit}/$id`,
  beforeLoad: onEnter(onEditPageSectionEnter),
  getParentRoute: () => pageSectionFormLayout,
  component: EditPageSection,
});

export const createPageSectionRoute = createRoute({
  parseParams: (params: any) => ({
    pageId: z.string().optional().parse(params.pageId),
  }),
  path: `$pageId/${PATH_NAMES.create}`,
  beforeLoad: onEnter(onCreatePageSectionEnter),
  getParentRoute: () => pageSectionFormLayout,
  component: CreatePageSection,
});

const pageSectionRoutes = [
  pageSectionsRoute,
  pageSectionRoute,
  pageSectionFormLayout.addChildren([
    createPageSectionRoute,
    editPageSectionRoute,
  ]),
];

export default pageSectionRoutes;
