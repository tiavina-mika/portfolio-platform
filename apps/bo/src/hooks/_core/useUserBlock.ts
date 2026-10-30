import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { loadUserBlock } from '@/redux/actions/_core/userBlock.action';
import { getUserBlockSelector } from '@/redux/reducers/_core/userBlock.reducer';
import { PreviewSectionStatus } from '@/types/_core/app.type';
import { IUserBlockState, IUserBlockResult } from '@/types/_core/userBlock.type';

type Output<TItem, TExtra> = IUserBlockState<TItem, TExtra> & {
  // what the block's card states about itself: nothing once its rows are in
  status: PreviewSectionStatus | undefined;
  retry: () => void;
};

/**
 * One block of the user detail page that reads rows of its own: it is read as soon as the account
 * is known — not when the block is opened, since its figure stands in the summary before that —
 * and it can be read again on its own after a failure. A block already read (or being read) for
 * this account is not read again each time the page draws it.
 * @param key the block's name, the one its state is kept under
 * @param userId the account the page is about; nothing is read until it is known
 * @param fetch what reads the block's rows for that account — a module-level function, so it is
 *   the same one on every render
 * @param enabled false for a block the account cannot have (a deleted account's sessions)
 */
export const useUserBlock = <TItem, TExtra = undefined>(
  key: string,
  userId: string | undefined,
  fetch: (userId: string) => Promise<IUserBlockResult<TItem, TExtra>>,
  enabled = true
): Output<TItem, TExtra> => {
  const dispatch = useDispatch();
  const block = useSelector(getUserBlockSelector<TItem, TExtra>(key));
  const isReadForUser = !!userId && block.userId === userId;

  useEffect(() => {
    if (!userId || !enabled || isReadForUser) return;
    dispatch(loadUserBlock(key, userId, fetch));
  }, [dispatch, key, userId, enabled, fetch, isReadForUser]);

  const retry = () => {
    if (!userId) return;
    dispatch(loadUserBlock(key, userId, fetch));
  };

  const getStatus = (): PreviewSectionStatus | undefined => {
    if (block.error) return 'error';
    // rows already on screen stay readable while they are read again
    if (block.loading && block.items.length === 0) return 'loading';

    return undefined;
  };

  return {
    ...block,
    status: getStatus(),
    retry,
  };
};
