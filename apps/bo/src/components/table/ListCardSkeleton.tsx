import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';

import type { Theme } from '@mui/material/styles';

import {
  LIST_CARDS_GAP, LIST_CARD_FOOT_PADDING_Y, LIST_CARD_HEAD_PADDING_Y, LIST_CARD_ITEM_PADDING_X,
  LIST_CARD_ROW_GAP, ROW_ACTIONS_BUTTON_SIZE,
} from '@/constants/_core/ui/list.constants';
import {
  CHECKBOX_SIZE, SKELETON_CARD_COUNT, SKELETON_LINE_HEIGHT, SKELETON_PRIMARY_LINE_WIDTH,
  SKELETON_SUB_LINE_WIDTH,
} from '@/constants/_core/ui/ui.constants';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

// one key/value line per row the real card states, so the grid does not reflow when data lands
const SKELETON_CARD_LINE_COUNT = 4;

const classes = {
  head: (theme: Theme) => ({
    padding: `${LIST_CARD_HEAD_PADDING_Y}px ${LIST_CARD_ITEM_PADDING_X}px`,
    borderBottom: `1px solid ${getDesignTokens(theme).borderLight}`,
  }),
  body: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: LIST_CARD_ROW_GAP,
    padding: `${LIST_CARD_HEAD_PADDING_Y}px ${LIST_CARD_ITEM_PADDING_X}px`,
  },
  line: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: LIST_CARDS_GAP,
  },
  foot: (theme: Theme) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: LIST_CARDS_GAP,
    marginTop: 'auto',
    padding: `${LIST_CARD_FOOT_PADDING_Y}px ${LIST_CARD_ITEM_PADDING_X}px`,
    borderTop: `1px solid ${getDesignTokens(theme).borderLight}`,
    backgroundColor: getDesignTokens(theme).surfaceSecondary,
  }),
  actions: { display: 'flex', gap: LIST_CARD_ROW_GAP },
};

const ListCardSkeleton = () => {
  return (
    <>
      {Array.from({ length: SKELETON_CARD_COUNT }).map((_, index) => (
        <Card key={index} sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div css={classes.head}>
            <Skeleton
              height={SKELETON_LINE_HEIGHT}
              variant="rounded"
              width={SKELETON_PRIMARY_LINE_WIDTH}
            />
          </div>
          <div css={classes.body}>
            {Array.from({ length: SKELETON_CARD_LINE_COUNT }).map((_line, lineIndex) => (
              <div css={classes.line} key={lineIndex}>
                <Skeleton
                  height={SKELETON_LINE_HEIGHT}
                  variant="rounded"
                  width={SKELETON_SUB_LINE_WIDTH}
                />
                <Skeleton
                  height={SKELETON_LINE_HEIGHT}
                  variant="rounded"
                  width={SKELETON_SUB_LINE_WIDTH}
                />
              </div>
            ))}
          </div>
          <div css={classes.foot}>
            <Skeleton height={CHECKBOX_SIZE} variant="rounded" width={CHECKBOX_SIZE} />
            <div css={classes.actions}>
              <Skeleton
                height={ROW_ACTIONS_BUTTON_SIZE}
                variant="rounded"
                width={ROW_ACTIONS_BUTTON_SIZE}
              />
              <Skeleton
                height={ROW_ACTIONS_BUTTON_SIZE}
                variant="rounded"
                width={ROW_ACTIONS_BUTTON_SIZE}
              />
            </div>
          </div>
        </Card>
      ))}
    </>
  );
};

export default ListCardSkeleton;
