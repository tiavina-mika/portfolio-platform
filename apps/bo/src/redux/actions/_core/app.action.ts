import { type Action } from '@reduxjs/toolkit';

import i18n, { locales } from '@/config/i18n';
import { APP_NAME, appTranslatedFieldsObj } from '@/constants/_core/app.constants';
import { WEBSITE_SETTINGS_SECTIONS } from '@/constants/_core/settings.constants';
import { actionWithLoader, onEnterActionWithLoader } from '@/redux/actions/_core/util.action';
import {
  loadAppSlice, setMessageSlice, setNotificationsSlice,
  getAppNotificationsSelector,
} from '@/redux/reducers/_core/app.reducer';
import { getSettingsLocaleSelector, setLocaleSlice } from '@/redux/reducers/_core/settings.reducer';
import { AppDispatch, RootState } from '@/redux/store';
import {
  dateRangeQuery, destroyObjectsByIds, fetchApp, fetchAppSingleton, fetchNotificationCount,
  filtersDatesQuery, markAllEntitiesSeenInCloud, markEntityAsSeen, saveApp, toggleEntitiesSeenByIds,
} from '@/services/_core/app.service';
import { fetchCurrentUserSessionToken } from '@/services/_core/auth.service';
import { IAppInput, IAppMainImagesInput, ISettingsInput } from '@/types/_core/app.type';
import { Locale, SettingsSection } from '@/types/_core/setting.type';
import { applySeenToItems } from '@/utils/_core/app.utils';
import { uploadFilesAPI } from '@/utils/_core/file.utils';
import { PATH_NAMES } from '@/utils/_core/pathnames';
import { slugify } from '@/utils/_core/utils';
import { appCodec } from '@/validations/_core/app.validations';


export { dateRangeQuery, filtersDatesQuery };

type NotificationCountOptions = {
  status?: string;
  key?: string;
  /*
   * reads the count itself, for a badge whose subset the generic count cannot express — it only
   * filters on `status` (ex: the open driver no-show reports, counted by their own Cloud Function)
   */
  fetchCount?: () => Promise<number>;
};

const storeNotificationCount = async (
  dispatch: AppDispatch,
  className: string,
  options?: NotificationCountOptions
): Promise<void> => {
  const count = options?.fetchCount
    ? await options.fetchCount()
    : await fetchNotificationCount(className, options?.status);

  dispatch(setNotificationsSlice({ [options?.key ?? className]: count }));
};

/**
 * loads the "new items" count of a collection (seen = false), or a `status`-filtered subset of it
 * stored under a distinct `key` instead of `className` (ex: failed payments — see
 * PAYMENT_FAILED_NOTIFICATION_KEY), in the background — no global loader, and a failure is dropped
 * rather than surfaced. Every caller is a load the reader never asked for (the first load once the
 * shell is up, a LiveQuery push, coming back to the tab, the polling fallback), so flashing the full-page loader over whatever they are
 * doing, or interrupting them with an error banner, would both be wrong.
 */
export const refreshNotification = (
  className: string,
  options?: NotificationCountOptions
): any => {
  return async (dispatch: AppDispatch): Promise<void> => {
    try {
      await storeNotificationCount(dispatch, className, options);
    }
    catch { /* empty */ }
  };
};

/**
 * mark an entity as seen without refetching it
 * used when entering its preview page ("$id" route) — runs silently in the background,
 * so it is not wrapped with actionWithLoader (would flicker the global loader after the
 * page's own loading already ended)
 *
 * Dispatched on every opening, not only the first: the server keeps `seenAt` on whoever opened the
 * row first and records this visit under `lastSeenAt`/`seenCount` instead. The badge is only
 * stepped down when the row was still unseen — reopening a row already handled takes nothing off
 * a queue it already left.
 *
 * @param collection class name (ex: 'Vehicle') — also the sidebar notification key
 * @param id entity id
 * @param hasBeenSeen whether the entity had already been opened before this visit
 * @returns
 */
export const markAsSeen = (collection: string, id: string, hasBeenSeen = false): any => {
  return async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const state = getState?.()!;
    const notification = getAppNotificationsSelector(state);
    const count = notification?.[collection] ?? 0;

    await markEntityAsSeen(collection, id);

    if (hasBeenSeen) return;

    // update notification count
    dispatch(setNotificationsSlice({ [collection]: Math.max(count - 1, 0) })); // from sidebar
  };
};

type ToggleMultiMarkAsSeenInput<I> = {
  // collection name in which we want to mark the items as seen
  collection: string;
  // the list currently on screen, rebuilt around the toggled rows and handed back to `callback`
  items: I[];
  // value to set to the seen field (default: true)
  value?: boolean;
  // selected items ids to update
  ids: string[];
  /*
   * whether the list being toggled is the "Nouveautés" tab — a row marked seen leaves that tab
   * and stays everywhere else (see `applySeenToItems`)
   */
  isUnseenTab?: boolean;
  // thunk callback to update the store after the database update
  callback?: (items: I[]) => Action;
};

/**
 * The "mark as seen"/"mark as unseen" bulk action behind every list's selection band.
 *
 * The rows to rebuild are passed in rather than read out of the store by name: the previous
 * version guessed the slice from the collection name lowercased and suffixed with an `s`
 * (`Ride` gives `state.ride.rides`), which silently froze the list for any collection not shaped
 * that way — no error, just a list that stopped updating until the next fetch.
 *
 * The badge count comes back from the server rather than being adjusted locally: two admins
 * working the same queue would each subtract their own rows from a figure the other had moved.
 */
export const toggleMultiMarkAsSeen = <I extends { id?: string }>({
  collection,
  items,
  callback,
  value = true,
  ids = [],
  isUnseenTab = false,
}: ToggleMultiMarkAsSeenInput<I>): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const { toggledIds, count } = await toggleEntitiesSeenByIds(collection, ids, value);

    // update notification count — from sidebar
    dispatch(setNotificationsSlice({ [collection]: count }));

    if (!callback) return;

    // update the list in the store
    dispatch(callback(applySeenToItems<I>(items, toggledIds, value, isUnseenTab)));
  });
};

/**
 * Flips `seen` on a single entity from its detail page.
 *
 * The counterpart of the automatic marking that happens on entering that page: a row opened by
 * mistake was seen for the whole team with no way back from the page itself — only the user
 * detail page offered one. `callback` writes the entity back into its own slice so the page
 * reflects the change without a refetch.
 */
export const toggleEntitySeen = <E extends { id: string }>(
  collection: string,
  entity: E,
  value: boolean,
  callback?: (entity: E) => Action
): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const { count } = await toggleEntitiesSeenByIds(collection, [entity.id], value);

    dispatch(setNotificationsSlice({ [collection]: count }));

    if (!callback) return;

    dispatch(callback({ ...entity, seen: value }));
  });
};

type MarkAllAsSeenInput<I> = {
  collection: string;
  // the list currently on screen — every row of it is seen once the pass is through
  items: I[];
  // whether that list is the "Nouveautés" tab, which nothing seen belongs to any more
  isUnseenTab?: boolean;
  callback?: (items: I[]) => Action;
};

/**
 * Empties a collection's queue in one action, the way a notification centre's "mark all as read"
 * does — the alternative was ticking rows fifty at a time.
 *
 * The server caps how many rows a single pass clears, so the message names what was actually
 * cleared and the badge is set from the count the server recomputed rather than assumed to be
 * zero. The rows on screen are updated from the same helper the bulk toggle uses, so the list
 * reflects the pass without a second round trip.
 */
export const markAllAsSeen = <I extends { id?: string }>({
  collection,
  items,
  isUnseenTab = false,
  callback,
}: MarkAllAsSeenInput<I>): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const { markedCount, count } = await markAllEntitiesSeenInCloud(collection);

    dispatch(setNotificationsSlice({ [collection]: count }));
    dispatch(setMessageSlice(i18n.t('common:infoMessages.markedAllAsSeen', { count: markedCount })));

    if (!callback) return;

    const ids = items.map((item: I): string => item.id!);

    dispatch(callback(applySeenToItems<I>(items, ids, true, isUnseenTab)));
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
    const count = await destroyObjectsByIds(ids, collection);

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
 * create or update app
 * NOTE: the App collection has only one object
 * so we can add it (for first time) or update it
 * @param values
 * @returns
 */
export const createOrUpdateApp = (values: Partial<IAppInput> & Partial<IAppMainImagesInput>): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const state = getState?.()!;
    const locale = getSettingsLocaleSelector(state);
    const sessionToken = await fetchCurrentUserSessionToken();
    const app = await fetchApp();

    if (!app) return;

    const newValues: Record<string, unknown> = { ...values };

    /*
     * the details form submits one key per locale/field pair (`fr:title`), but the App carries them
     * as a single `translated` column — without this the whole payload is dropped by the property
     * filter in `saveApp` and the save silently does nothing
     */
    const hasTranslatedValues = locales.some((formLocale: string) => (
      appTranslatedFieldsObj.some(field => `${formLocale}:${field.name}` in values)
    ));

    if (hasTranslatedValues) {
      newValues.translated = appCodec.decode(values);
    }

    if (sessionToken) {
      for (const key of ['image', 'imageForDarkMode'] as const) {
        const file = values[key];


        if (!file) continue;
        const slugifiedName = slugify(APP_NAME);
        const name = key === 'image'
          ? slugifiedName
          : slugifiedName + '-dark';

        const responses = await uploadFilesAPI({
          folder: 'app',
          sessionToken,
          files: [file],
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
    const savedApp = await saveApp(app, newValues);

    dispatch(loadAppSlice(savedApp));
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
    // only the website sections read the App singleton — the back-office ones are local preferences
    const section = route?.search?.section as SettingsSection | undefined;

    if (!section || !WEBSITE_SETTINGS_SECTIONS.includes(section)) return;

    const app = await fetchAppSingleton();

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
export const goToSettings = (): any => ({ to: PATH_NAMES.settings });
export const goToNotFound = (): any => ({ to: PATH_NAMES.notFound });
export const goToHome = (): any => ({ to: '/' });
