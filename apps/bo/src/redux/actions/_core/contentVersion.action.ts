import i18n from '@/config/i18n';
import { PAGINATION } from '@/constants/_core/app.constants';
import { getArticle } from '@/redux/actions/_core/article.action';
import { getPage } from '@/redux/actions/_core/page.action';
import { actionWithLoader } from '@/redux/actions/_core/util.action';
import { setMessageSlice } from '@/redux/reducers/_core/app.reducer';
import { loadArticleSlice } from '@/redux/reducers/_core/article.reducer';
import {
  loadContentVersionsSlice, setContentVersionsCountSlice,
} from '@/redux/reducers/_core/contentVersion.reducer';
import { loadPageSlice } from '@/redux/reducers/_core/page.reducer';
import { AppDispatch } from '@/redux/store';
import { restoreArticleSnapshot } from '@/services/_core/article.service';
import { fetchContentVersions, fetchContentVersionSnapshot } from '@/services/_core/contentVersion.service';
import { restorePageSnapshot } from '@/services/_core/page.service';
import { ContentVersionEntityType } from '@/types/_core/contentVersion.type';

/**
 * loads the version history of an Article/Page, which the server snapshots in the
 * afterSave trigger whenever a save actually changes content — see
 * apps/server/src/cloud/services/_core/contentVersion.service.cloud.ts
 */
export const loadContentVersions = (entityType: ContentVersionEntityType, entityId: string): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const result = await fetchContentVersions(entityType, entityId, PAGINATION.rowsPerPage, 0);

    dispatch(loadContentVersionsSlice(result.results));
    dispatch(setContentVersionsCountSlice(result.count));
  },
  // rights
  {
    collection: entityType,
    action: 'get',
  });
};

/**
 * restores an Article/Page to a previous version's content — fetches the (otherwise
 * inaccessible from the client) snapshot via a Cloud Function, then applies it through the
 * normal, CLP-protected client-side save flow, exactly like a regular edit. The save itself
 * then triggers a new snapshot of the state being replaced, so a restore is itself not doable.
 */
export const restoreContentVersion = (
  entityType: ContentVersionEntityType,
  entityId: string,
  versionId: string
): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const snapshot = await fetchContentVersionSnapshot(entityType, entityId, versionId);

    if (entityType === 'Article') {
      const existingArticle = await getArticle(entityId);

      if (!existingArticle) return;

      const savedArticle = await restoreArticleSnapshot(existingArticle, snapshot);

      dispatch(loadArticleSlice(savedArticle));
    } else {
      const existingPage = await getPage(entityId);

      if (!existingPage) return;

      const savedPage = await restorePageSnapshot(existingPage, snapshot);

      dispatch(loadPageSlice(savedPage));
    }

    dispatch(setMessageSlice(i18n.t('cms:contentVersion.messages.versionRestored')));
    await dispatch(loadContentVersions(entityType, entityId));
  },
  // rights
  {
    collection: entityType,
    action: 'update',
    hasNoRightErrorMessage: i18n.t('common:errors.hasNoRightToUpdate', { value: i18n.t('cms:contentVersion.thisContent') }),
  });
};
