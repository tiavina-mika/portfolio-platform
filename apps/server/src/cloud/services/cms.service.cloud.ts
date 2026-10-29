
import { USE_MASTER_KEY } from '@/utils/constants';

import { PageSection } from '../triggers/page.triggers';
import { getArticleTranslatedDefaultValues, getPageTranslatedDefaultValues } from '../utils/cms.utils.cloud';
import { isFieldChanged } from '../utils/parse.utils.cloud';

/**
 * function called in beforeSave trigger
 * it's used for article and page objects
 * @param request
 * @returns
 */
export const beforeSave = (request: Parse.Cloud.BeforeSaveRequest): void => {
  const item = request.object;
  const prevItem = request.original;
  const user = request.user;

  const dirtyKeys = item.dirtyKeys();

  request.context.dirtyKeys = dirtyKeys;

  // without user //
  if (item.existed() && isFieldChanged(item, prevItem, 'shares')) {
    item.increment('totalMediaShare', 1);
  }

  if (!user) return;
  // --------- creation and update --------- //
  const slugFunction = item.className === 'Page' ? getPageTranslatedDefaultValues : getArticleTranslatedDefaultValues;

  item.set('translated', slugFunction(item.get('translated')));

  // ----------- creation ----------- //
  if (!item.existed() || !prevItem) {
    item.set('deleted', false);
    item.set('user', user);
    return;
  }

  // updatedBy should be different from deletedBy
  if (isFieldChanged(item, prevItem, 'deleted')) {
    item.set('deletedCategories', item.get('categories') || []);
    item.unset('categories');
    return;
  }

  // ----------- update ----------- //
  item.set('updatedBy', user);
};

/**
 * Remove page from sections after the page is deleted
 * Or destroy the section if there is no page left in the section
 * It's called in afterDelete trigger of Page
 * @param page
 * @returns array of destroyed section ids
 */
export const removePageInSectionAfterPageDeleted = async (
  page: Parse.Object
): Promise<string[]> => {
  const unsavedSections: Parse.Object[] = [];

  await new Parse.Query(PageSection)
    .equalTo('pages', page)
    .each((section) => {
      const filtered = (section.get('pages') || []).filter((p: Parse.Object) => p.id !== page.id);

      section.set('pages', filtered);
      unsavedSections.push(section);
    });

  const updatedSections = await Parse.Object.saveAll(unsavedSections, USE_MASTER_KEY);
  const destroyedSectionsIds: string[] = [];

  for (const section of updatedSections) {
    if ((section.get('pages') || []).length === 0) {
      await section.destroy(USE_MASTER_KEY);
      destroyedSectionsIds.push(section.id);
    }
  }

  return destroyedSectionsIds;
};
