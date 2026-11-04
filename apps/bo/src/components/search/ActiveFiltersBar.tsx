import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import type { Theme } from '@mui/material/styles';

import {
  LIST_CARD_PADDING_X, LIST_CHIPBAR_GAP, LIST_CHIPBAR_PADDING_Y,
} from '@/constants/_core/ui/list.constants';
import { RESPONSIVE_BREAKPOINT } from '@/constants/_core/ui/ui.constants';
import { IActiveFilterChip } from '@/utils/_core/filter.utils';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

/*
 * the band naming what is currently narrowing the list, between the filter panel and the rows. It
 * exists because the panel it comes from is folded away most of the time: without it, a list
 * showing three rows out of two thousand gives no clue as to why. Each chip undoes one filter, so
 * the reader widens the list from the list itself rather than from the panel.
 */
const classes = {
  bar: (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap' as const,
      gap: LIST_CHIPBAR_GAP,
      padding: `${LIST_CHIPBAR_PADDING_Y}px ${LIST_CARD_PADDING_X}px`,
      backgroundColor: tokens.surfaceSecondary,
      borderBottom: `1px solid ${tokens.borderLight}`,
      /*
       * once the card is too narrow to hold the strip, the chips stay on one line and it scrolls:
       * wrapping them would grow a band that sits above the rows by a line every few filters, and
       * push the list itself off a phone screen
       */
      [theme.breakpoints.down(RESPONSIVE_BREAKPOINT)]: {
        flexWrap: 'nowrap' as const,
        overflowX: 'auto' as const,
      },
    };
  },
  /*
   * the strip is read as "what is narrowing this list", which the chips already say — the caption
   * naming them is the first thing to go when the row has to be scrolled rather than scanned
   */
  label: (theme: Theme) => ({
    [theme.breakpoints.down(RESPONSIVE_BREAKPOINT)]: { display: 'none' },
  }),
  chips: (theme: Theme) => ({
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: LIST_CHIPBAR_GAP,
    // a chip states one whole filter — compressing it to fit the row would truncate that sentence
    [theme.breakpoints.down(RESPONSIVE_BREAKPOINT)]: {
      flexWrap: 'nowrap' as const,
      '& .MuiChip-root': { flexShrink: 0 },
    },
  }),
  /*
   * pushed to the far end: it undoes the whole strip, not the chip it would otherwise sit next to.
   * It keeps its width when the row scrolls — it is the way out of the strip, not one of its items.
   */
  reset: { marginLeft: 'auto', flexShrink: 0 },
};

type Props = {
  chips: IActiveFilterChip[];
  onRemove: (name: string) => void;
  onReset: () => void;
};

const ActiveFiltersBar = ({
  chips, onRemove, onReset,
}: Props) => {
  const {
    t,
  } = useTranslation();

  if (!chips.length) return null;

  return (
    <Box css={classes.bar}>
      <Typography css={classes.label} variant="overline">{t('activeFilters')}</Typography>
      <Box css={classes.chips}>
        {chips.map((chip) => (
          <Chip
            color="primary"
            key={chip.name}
            label={`${chip.label}: ${chip.value}`}
            onDelete={() => onRemove(chip.name)}
          />
        ))}
      </Box>
      <Button
        css={classes.reset}
        onClick={onReset}
        size="small"
        variant="text"
      >
        {t('reset')}
      </Button>
    </Box>
  );
};

export default ActiveFiltersBar;
