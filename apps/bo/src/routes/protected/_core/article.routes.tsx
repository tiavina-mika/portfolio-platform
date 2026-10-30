import { Outlet, createRoute } from '@tanstack/react-router';
import { lazy } from 'react';
import { z } from 'zod';

import {
  onArticleEnter,
  onArticlesEnter,
  onCreateArticleEnter,
  onCreateOrEditArticleLeave,
  onEditArticleEnter,
} from '@/redux/actions/_core/article.action';
import { onEnter, onLeave } from '@/redux/actions/_core/util.action';
import { privateLayout } from '@/routes/protected/_core/privateLayout.routes';
import { IIdParams } from '@/types/_core/app.type';
import { PATH_NAMES } from '@/utils/_core/pathnames';
import { articlesRouteSearchParams } from '@/validations/_core/article.validations';


const CmsFormWideLayout = lazy(() => import('@/containers/_core/cms/CmsFormWideLayout'));
const Article = lazy(() => import('@/pages/_core/articles/Article'));
const Articles = lazy(() => import('@/pages/_core/articles/Articles'));
const CreateArticle = lazy(() => import('@/pages/_core/articles/CreateArticle'));
const EditArticle = lazy(() => import('@/pages/_core/articles/EditArticle'));


export const articlesLayout = createRoute({
  getParentRoute: () => privateLayout,
  component: () => <Outlet />,
  path: PATH_NAMES.articles,
  staticData: { breadcrumb: { labelKey: 'cms:articles' } },
});

export const articlesRoute = createRoute({
  validateSearch: search => articlesRouteSearchParams.parse(search),
  getParentRoute: () => articlesLayout,
  beforeLoad: onEnter(onArticlesEnter),
  component: Articles,
  path: '/',
});

export const articleFormLayout = createRoute({
  id: 'article',
  getParentRoute: () => articlesLayout,
  component: CmsFormWideLayout,
});

export const articleRoute = createRoute({
  parseParams: (params: IIdParams) => ({ id: z.string().parse(params.id) }),
  beforeLoad: onEnter(onArticleEnter),
  getParentRoute: () => articlesLayout,
  component: Article,
  path: '$id',
});

export const editArticleRoute = createRoute({
  parseParams: (params: any) => ({ id: z.string().parse(params.id) }),
  path: `$id/${PATH_NAMES.edit}`,
  beforeLoad: onEnter(onEditArticleEnter),
  onLeave: onLeave(onCreateOrEditArticleLeave),
  getParentRoute: () => articleFormLayout,
  component: EditArticle,
});

export const createArticleRoute = createRoute({
  path: PATH_NAMES.create,
  beforeLoad: onEnter(onCreateArticleEnter),
  onLeave: onLeave(onCreateOrEditArticleLeave),
  getParentRoute: () => articleFormLayout,
  component: CreateArticle,
});

const articleRoutes = [
  articlesRoute,
  articleRoute,
  articleFormLayout.addChildren([
    createArticleRoute,
    editArticleRoute,
  ]),
];

export default articleRoutes;
