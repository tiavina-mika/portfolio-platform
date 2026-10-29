import { type Action } from '@reduxjs/toolkit';
import dayjs from 'dayjs';
import Parse from 'parse';

import i18n from '@/config/i18n';
import { actionWithLoader, onEnterActionWithLoader } from '@/redux/actions/util.action';
import {
  getAppAppSelector, loadAppSlice, setInfoMessageSlice, setMessageSlice, setNotificationsSlice,
} from '@/redux/reducers/app.reducer';
import { getSettingsLocaleSelector, setLocaleSlice } from '@/redux/reducers/settings.reducer';
import { AppDispatch, RootState } from '@/redux/store';
import { IAppInput, IAppMainImagesInput, ISettingsInput } from '@/types/app.type';
import { Locale, SettingsTabEnum } from '@/types/setting.type';
import { DateType } from '@/types/util.type';
import { APP_NAME } from '@/utils/constants';
import { downloadFile, uploadFilesAPI } from '@/utils/file.utils';
import { setValues } from '@/utils/parse.utils';
import { PATH_NAMES } from '@/utils/pathnames';
import { getUserFullName } from '@/utils/user.utils';
import { slugify } from '@/utils/utils';
import { appCodec } from '@/validations/app.validations';

import { getAppNotificationsSelector } from '../reducers/app.reducer';

const APP_PROPERTIES = new Set(['translated', 'image', 'imageForDarkMode']);

const collection = 'App';
const App = Parse.Object.extend(collection);

/*
 * ----------------------------------------------------- //
 * ------------------- Parse queries ------------------- //
 * ----------------------------------------------------- //
 */
export const dateRangeQuery = (query: Parse.Query, field: string, range: (DateType | null)[]): void => {
  if (!Array.isArray(range)) return;
  const start = range[0];
  const end = range[1];

  // greater or equal than start date
  if (start && !end) {
    query
      .greaterThanOrEqualTo(field, dayjs(start).startOf('day').toDate())
      .lessThanOrEqualTo(field, dayjs(start).endOf('day').toDate());
  }
  // lesser or equal than end date
  if (end && !start) {
    query
      .greaterThanOrEqualTo(field, dayjs(end).startOf('day').toDate())
      .lessThanOrEqualTo(field, dayjs(end).endOf('day').toDate());
  }
  // between 2 dates
  if (start && end) {
    query
      .greaterThanOrEqualTo(field, dayjs(start).startOf('day').toDate())
      .lessThanOrEqualTo(field, dayjs(end).endOf('day').toDate());
  }
};

/**
 * query multiple date fields
 * @param query
 * @param search
 */
export const filtersDatesQuery = (
  query: Parse.Query,
  search: Record<string, string | (DateType | null)[]>,
  otherDateFields = []
) => {
  ['createdAt', 'updatedAt', ...otherDateFields].forEach((field) => {
    if (search[field]) {
      dateRangeQuery(query, field, search[field] as (DateType | null)[]);
    }
  });
};

const getApp = async (): Promise<Parse.Object | undefined> => {
  let app = await new Parse.Query(App)
    .ascending('createdAt')
    .first();

  if (!app) {
    app = new App();
  }

  return app;
};

/**
 * load notifications count for each collection
 * seen = false
 * @returns
 */
export const setNotification = (className: string): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void | undefined> => {
    const count = await Parse.Cloud.run('getObjectsCount', { className });

    dispatch(setNotificationsSlice({ [className]: count }));
  });
};

/**
 * mark an entity as seen
 * used mainly when entering a page with the entity id
 * @param parseObj
 * @returns
 */
export const markAsSeen = (parseObj: Parse.Object, notify: string): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const state = getState?.()!;
    const notification = getAppNotificationsSelector(state);
    const count = notification?.[notify] ?? 0;

    parseObj.set('seen', true);
    await parseObj.save();

    // update notification count
    dispatch(setNotificationsSlice({ [notify]: count - 1 })); // from sidebar
  });
};

type ToggleMultiMarkAsSeenInput<I> = {
  // collection name in which we want to mark the items as seen
  collection: string;
  // value to set to the seen field (default: true)
  value?: boolean;
  // selected items ids to update
  ids: string[];
  // thunk callback to update the store after the database update
  callback?: (items: I[]) => Action;
};
export const toggleMultiMarkAsSeen = <I extends Parse.Object>({
  collection,
  callback,
  value = true,
  ids = [],
}: ToggleMultiMarkAsSeenInput<I>): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const state = getState?.()!;
    const notification = getAppNotificationsSelector(state);
    const storeField = collection.toLowerCase() as keyof RootState;
    /*
     * get the previous items from the store (ex: state.article.articles)
     * NOTE the collection name should be the same as the store field name (but in lowercase)
     */
    const prevItems = (state[storeField] as any)[`${storeField}s`] || [];
    let items = [...prevItems];

    // get the count of the selected items in the notification
    let count = notification?.[collection] ?? 0;

    await new Parse.Query(collection)
      .containedIn('objectId', ids)
      .each(async (parseObj) => {
        parseObj.set('seen', value);
        await parseObj.save();

        // if in notification (seen = true) => remove it from the list
        if (value) {
          items = items.filter((item: I) => item.id !== parseObj.id);
          count--;
        }
        // if not in notification (seen = false) => update the list (ex: in "All" tab)
        else {
          // update the store for each item updated to avoid re-fetching the data
          const storeParseObjIndex = items.findIndex((item: I) => item.id === parseObj.id);

          if (storeParseObjIndex !== -1) {
            const storeParseObj = items[storeParseObjIndex];

            // no save in the database, just update the store
            storeParseObj.set('seen', value);

            items[storeParseObjIndex] = storeParseObj;
          }
          count++;
        }
      });

    // update notification count
    dispatch(setNotificationsSlice({
      [collection]: count > 0 ? count : 0,
    })); // from sidebar

    if (!callback) return;

    // update the list in the store
    dispatch(callback(items));
  });
};

/**
 * change browser and stored language
 * @param locale fr, ...
 * @returns
 */
export const changeLocale = (locale: Locale): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    await i18n.changeLanguage(locale);
    // update language in store
    dispatch(setLocaleSlice(locale));
  });
};

/**
 * add new contact to the database
 * @param values form values
 * @returns
 */
export const changeSettings = (values: ISettingsInput): any => {
  return actionWithLoader((dispatch: AppDispatch): any => {
  // update i18n default language
    dispatch(setMessageSlice(i18n.t('common:infoMessages.successfullySaveSettings')));
    dispatch(changeLocale(values.locale as Locale));
  });
};


interface IDestroyObjectOptions {
  // class name of the object (collection), ex: 'Article'
  collection: string;
  // message label to display in the notification (ex: 'articles')
  messageLabel: string;
  // callback to remove the deleted objects from the list after deletion
  updateListCallback?: (ids: string[]) => Action;
}
export const destroyObjects = (
  ids: string[],
  options: IDestroyObjectOptions
): any => {
  const {
    collection, messageLabel, updateListCallback,
  } = options;

  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    // --------- request --------- //
    const count = await Parse.Cloud.run('destroyObjects', { ids, collection });

    // --------- update store --------- //
    dispatch(setMessageSlice(i18n.t('common:infoMessages.destroyedSuccessfullyWithCount', {
      number: `${count}/${ids.length}`,
      entity: messageLabel,
    })));

    // remove the deleted objects from the UI list
    if (!updateListCallback) return;
    dispatch(updateListCallback(ids));
  },
  // rights
  {
    collection,
    action: 'destroy',
  });
};

/**
 * mark an entity as seen
 * used mainly when entering a page with the entity id
 * @param parseObj
 * @returns
 */
export const uploadCV = (file: File): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const state = getState?.()!;
    const locale = getSettingsLocaleSelector(state);
    const currentUser = await Parse.User.currentAsync();

    if (!currentUser) return;

    const responses = await uploadFilesAPI({
      folder: 'app',
      sessionToken: currentUser.getSessionToken(),
      files: [file],
      locale,
      config: {
        use_filename: false,
        public_id: slugify(`CV ${getUserFullName(currentUser)}`),
      },
    });

    const app = await getApp();

    if (!app) return;
    app.set('cv', responses[0]);

    await app.save();

    dispatch(loadAppSlice(app));
    dispatch(setMessageSlice(i18n.t('common:app.successfullyUploadedCV')));
  });
};

export const downloadCV = (): any => {
  return async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const state = getState?.()!;
    const app = getAppAppSelector(state);

    if (!app) return;
    if (!app.has('cv')) return;

    dispatch(setInfoMessageSlice(i18n.t('common:app.downloadingCV')));
    await downloadFile({ pathName: 'cv.pdf', data: { publicId: app.get('cv')?.publicId } });
  };
};

/**
 * create or update app
 * NOTE: the App collection has only one object
 * so we can add it (for first time) or update it
 * @param values
 * @returns
 */
export const createOrUpdateApp = (values: IAppInput | IAppMainImagesInput): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const state = getState?.()!;
    const locale = getSettingsLocaleSelector(state);
    const currentUser = await Parse.User.currentAsync();
    const app = await getApp();

    if (!app) return;

    const newValues: Record<string, any> = {
      ...values,
      translated: appCodec.decode(values),
    };

    if (currentUser) {
      for (const key of ['image', 'imageForDarkMode']) {
        const file = newValues[key];


        if (!file) continue;
        const slugifiedName = slugify(APP_NAME);
        const name = key === 'image'
          ? slugifiedName
          : slugifiedName + '-dark';

        const responses = await uploadFilesAPI({
          folder: 'app',
          sessionToken: currentUser.getSessionToken(),
          files: [file] as File[],
          locale,
          saveExtraFields: true,
          config: {
            use_filename: false,
            public_id: name,
            responsive_breakpoints: [
              {
                create_derived: false,
                min_width: 600,
                max_width: 800,
                max_images: 3,
              },
            ],
          },
          validation: {
            maxFileSize: 6,
            acceptedFileTypes: ['png', 'jpg', 'jpeg', 'webp'],
          },
        });

        if (responses?.[0]) {
          [newValues[key]] = responses;
        }
      }
    }
    setValues(app, newValues, APP_PROPERTIES);
    await app.save();

    dispatch(loadAppSlice(app));
    dispatch(setMessageSlice(i18n.t('common:app.successfullySaved')));
  });
};

/*
 * ---------------------------------------- //
 * ------------- on page load ------------- //
 * ---------------------------------------- //
 */
/**
 * load categories data from database before the page is loaded (in route)
 * then load it to the store
 * @param route
 * @returns
 */
export const onSettingsEnter = (route: any): any => {
  return onEnterActionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    if (route?.search) {
      if (route.search.tab === SettingsTabEnum.BO || !route.search.tab) return;
    }

    const app = await new Parse.Query(App).ascending('createdAt').first();

    if (!app) return;
    dispatch(loadAppSlice(app));
  });
};

/*
 * --------------------------------------- //
 * ------------- redirection ------------- //
 * --------------------------------------- //
 */
export const goToMisc = (): any => ({ to: PATH_NAMES.miscellaneous });
export const goToJobs = (): any => ({ to: PATH_NAMES.jobs });
export const goToTests = (): any => ({ to: PATH_NAMES.tests });
export const goToSettings = (): any => ({ to: PATH_NAMES.settings });
export const goToNotFound = (): any => ({ to: PATH_NAMES.notFound });
export const goToHome = (): any => ({ to: '/' });
