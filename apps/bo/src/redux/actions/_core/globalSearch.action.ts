import {
  clearGlobalSearchResultsSlice,
  loadGlobalSearchResultsSlice,
  setGlobalSearchLoadingSlice,
} from '@/redux/reducers/_core/globalSearch.reducer';
import { AppDispatch } from '@/redux/store';
import { fetchGlobalSearchResults } from '@/services/_core/globalSearch.service';

const GLOBAL_SEARCH_MIN_LENGTH = 2;

/**
 * cross-entity search used by the AppBar's global search field
 * deliberately not wrapped in `actionWithLoader`/`onEnterActionWithLoader` (util.action.ts) —
 * those drive the app-wide loading spinner and error banner, which would be jarring on every
 * keystroke. Errors are swallowed into an empty result set instead of a global error message.
 */
export const searchGlobally = (text: string): any => {
  return async (dispatch: AppDispatch): Promise<void> => {
    const trimmed = text.trim();

    if (trimmed.length < GLOBAL_SEARCH_MIN_LENGTH) {
      dispatch(clearGlobalSearchResultsSlice());
      return;
    }

    dispatch(setGlobalSearchLoadingSlice(true));

    try {
      const results = await fetchGlobalSearchResults(trimmed);

      dispatch(loadGlobalSearchResultsSlice(results));
    }
    catch {
      dispatch(clearGlobalSearchResultsSlice());
    }
    finally {
      dispatch(setGlobalSearchLoadingSlice(false));
    }
  };
};
