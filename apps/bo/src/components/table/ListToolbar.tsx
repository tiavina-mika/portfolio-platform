import Box from '@mui/material/Box';
import { ReactNode } from 'react';

import type { Theme } from '@mui/material/styles';

import {
  LIST_CARD_PADDING_X, LIST_TOOLBAR_GAP, LIST_TOOLBAR_GROUP_GAP, LIST_TOOLBAR_PADDING_Y,
} from '@/constants/_core/ui/list.constants';
import { RESPONSIVE_BREAKPOINT } from '@/constants/_core/ui/ui.constants';
import { getListToolbarControlStyles } from '@/utils/_core/theme/styles.utils';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

type Props = {
  // what narrows the list: search fields, advanced filter trigger, active filter chips
  children?: ReactNode;
  // what acts on the list as a whole: sort, saved views, reset, export, rendering mode
  actions?: ReactNode;
  /*
   * how many rows the current filters leave, stated at the point where the reader stops narrowing
   * the list and starts acting on it — the pager below only counts the page in front of them
   */
  total?: ReactNode;
};

/**
 * First band of the list card. The two groups it holds are read from opposite ends — what the list
 * is currently showing on the left, what can be done to it on the right — so they sit on one row
 * and only wrap onto a second one when the viewport can no longer hold both.
 */
const ListToolbar = ({
  children, actions, total,
}: Props) => {
  return (
    <Box css={(theme: Theme) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap' as const,
      gap: LIST_TOOLBAR_GROUP_GAP,
      padding: `${LIST_TOOLBAR_PADDING_Y}px ${LIST_CARD_PADDING_X}px`,
      borderBottom: `1px solid ${getDesignTokens(theme).borderLight}`,
      ...getListToolbarControlStyles(theme),
    })}
    >
      <div
        css={(theme: Theme) => ({
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap' as const,
          gap: LIST_TOOLBAR_GAP,
          flex: 1,
          // without it a long chip row would push the actions group off the card instead of wrapping
          minWidth: 0,

          /*
           * from a tablet down the group takes the whole row, and each control in it takes a row of
           * its own: a search box narrow enough to sit beside the filter trigger holds about three
           * words, and the trigger left over beside it is below a thumb's target. It is also the
           * width the filter panel opens at from this breakpoint down, so the trigger and the band
           * it unfolds line up instead of the trigger sitting in the middle of the row above it.
           */
          [theme.breakpoints.down(RESPONSIVE_BREAKPOINT)]: {
            flex: '1 1 100%',
            // a list with nothing to narrow it by would otherwise hold an empty row open
            '&:empty': { display: 'none' },
            '& .SearchInput-root': { flex: '1 1 100%', width: '100%' },
            '& .ListFiltersTrigger-root': { width: '100%' },
          },
        })}
      >
        {children}
      </div>
      {(total || actions) && (
        <div css={(theme: Theme) => ({
          display: 'flex',
          alignItems: 'center',
          gap: LIST_TOOLBAR_GROUP_GAP,

          /*
           * on that same row the count and the actions are pushed to opposite ends rather than
           * trailing each other, so the actions stay under the thumb on the side they are on when
           * the toolbar is one row wide
           */
          [theme.breakpoints.down(RESPONSIVE_BREAKPOINT)]: {
            width: '100%',
            justifyContent: 'space-between',
          },
        })}
        >
          {total}
          {actions && (
            <div css={{ display: 'flex', alignItems: 'center', gap: LIST_TOOLBAR_GAP }}>
              {actions}
            </div>
          )}
        </div>
      )}
    </Box>
  );
};

export default ListToolbar;
