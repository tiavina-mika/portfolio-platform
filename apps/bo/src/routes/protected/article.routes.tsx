import { Outlet, createRoute } from '@tanstack/react-router';
import { z } from 'zod';

import CMSFormLayout from '@/containers/cms/CMSFormLayout';
import CreateArticle from '@/pages/articles/CreateArticle';
import EditArticle from '@/pages/articles/EditArticle';
import {
  onArticleEnter,
  onArticlesEnter,
  onArticlesLeave,
  onCreateArticleEnter,
  onCreateOrEditArticleLeave,
  onEditArticleEnter,
} from '@/redux/actions/article.action';
import { onEnter } from '@/redux/actions/util.action';
import { IIdParams } from '@/types/app.type';
import { PATH_NAMES } from '@/utils/pathnames';
import { tabAndCategoryRouteSearchParams } from '@/validations/app.validations';

import { privateLayout } from './private.routes';
import Article from '../../pages/articles/Article';
import Articles from '../../pages/articles/Articles';


export const articlesLayout = createRoute({
  getParentRoute: () => privateLayout,
  component: () => <Outlet />,
  path: PATH_NAMES.articles,
});

export const articlesRoute = createRoute({
  validateSearch: search => tabAndCategoryRouteSearchParams.parse(search),
  getParentRoute: () => articlesLayout,
  beforeLoad: onEnter(onArticlesEnter),
  onLeave: onEnter(onArticlesLeave),
  component: Articles,
  path: '/',
});

export const articleFormLayout = createRoute({
  id: 'article',
  getParentRoute: () => articlesLayout,
  component: CMSFormLayout,
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
  onLeave: onEnter(onCreateOrEditArticleLeave),
  getParentRoute: () => articleFormLayout,
  component: EditArticle,
});

export const createArticleRoute = createRoute({
  path: PATH_NAMES.create,
  beforeLoad: onEnter(onCreateArticleEnter),
  onLeave: onEnter(onCreateOrEditArticleLeave),
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
