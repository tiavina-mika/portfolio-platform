import { Outlet, createRoute } from '@tanstack/react-router';
import { z } from 'zod';

import CMSFormLayout from '@/containers/cms/CMSFormLayout';
import CreatePageSection from '@/pages/pages/sections/CreatePageSection';
import EditPageSection from '@/pages/pages/sections/EditPageSection';
import PageSection from '@/pages/pages/sections/PageSection';
import PageSections from '@/pages/pages/sections/PageSections';
import {
  onPageSectionEnter, onPageSectionsEnter, onCreatePageSectionEnter,
  onEditPageSectionEnter, onPageSectionsLeave,
} from '@/redux/actions/pageSection.action';
import { onEnter } from '@/redux/actions/util.action';
import { IIdParams } from '@/types/app.type';
import { PATH_NAMES } from '@/utils/pathnames';
import { tabRouteSearchParams } from '@/validations/app.validations';

import { privateLayout } from './private.routes';

export const pageSectionsLayout = createRoute({
  getParentRoute: () => privateLayout,
  component: () => <Outlet />,
  path: PATH_NAMES.pageSections,
});

export const pageSectionsRoute = createRoute({
  validateSearch: search => tabRouteSearchParams.parse(search),
  getParentRoute: () => pageSectionsLayout,
  beforeLoad: onEnter(onPageSectionsEnter),
  onLeave: onEnter(onPageSectionsLeave),
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
