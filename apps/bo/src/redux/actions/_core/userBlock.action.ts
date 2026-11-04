import {
  failUserBlockSlice, loadUserBlockSlice, startUserBlockSlice,
} from '@/redux/reducers/_core/userBlock.reducer';
import { AppDispatch } from '@/redux/store';
import { IUserBlockResult } from '@/types/_core/userBlock.type';

/**
 * Reads one block of the user detail page. Deliberately not wrapped in `actionWithLoader`: a block
 * that fails states it inside itself, with its own way to be read again, while the page and every
 * other block stay on screen — a global loader and an error toast would say the whole page failed.
 * @param key the block's name, the one its state is kept under
 * @param userId the account the block is read for
 * @param fetch what reads the block's rows for that account
 */
export const loadUserBlock = <TItem, TExtra = undefined>(
  key: string,
  userId: string,
  fetch: (userId: string) => Promise<IUserBlockResult<TItem, TExtra>>
): any => {
  return async (dispatch: AppDispatch): Promise<void> => {
    dispatch(startUserBlockSlice({ key, userId }));

    try {
      const result = await fetch(userId);

      dispatch(loadUserBlockSlice({
        key, userId, items: result.items, count: result.count, extra: result.extra,
      }));
    } catch (error) {
      // the block itself says it failed and offers to read it again; the console keeps the cause
      console.error(`[user block] ${key}`, error);
      dispatch(failUserBlockSlice({ key, userId }));
    }
  };
};
