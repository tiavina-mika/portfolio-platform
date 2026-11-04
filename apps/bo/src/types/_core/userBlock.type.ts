/**
 * What one block of the user detail page read: its rows, how many there are in all (the block only
 * shows the latest few), and whatever figure it reads alongside them (a split by role, a pending
 * count) that the rows on screen cannot be summed into.
 */
export interface IUserBlockResult<TItem, TExtra = undefined> {
  items: TItem[];
  count: number;
  extra?: TExtra;
}

export interface IUserBlockState<TItem = unknown, TExtra = unknown> extends IUserBlockResult<TItem, TExtra> {
  loading: boolean;
  error: boolean;
  /*
   * the account the rows were asked for: a block already asked for that account is not read again
   * when the page draws it once more, only when the reader asks for it
   */
  userId?: string;
}

export interface IUserBlocksState {
  blocks: Record<string, IUserBlockState>;
}
