import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

import type { Theme } from '@mui/material/styles';

import {
  COMPACT_PAGER_BUTTON_SIZE, COMPACT_PAGER_GAP, COMPACT_PAGER_HEIGHT, COMPACT_PAGER_ICON_SIZE,
  COMPACT_PAGER_PADDING_X,
} from '@/constants/_core/ui/list.constants';
import { getOutlinedIconButtonStyles } from '@/utils/_core/theme/styles.utils';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

const classes = {
  root: (theme: Theme) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: `${COMPACT_PAGER_GAP}px`,
    minHeight: COMPACT_PAGER_HEIGHT,
    padding: `0 ${COMPACT_PAGER_PADDING_X}px`,
    flexShrink: 0,
    borderTop: `1px solid ${getDesignTokens(theme).borderLight}`,
  }),
  button: (theme: Theme) => ({
    ...getOutlinedIconButtonStyles(theme, COMPACT_PAGER_BUTTON_SIZE),
    '&.Mui-disabled': {
      color: getDesignTokens(theme).textDisabled,
      backgroundColor: 'transparent',
    },
  }),
  range: { minWidth: 0 },
};

type Props = {
  // zero-based, like the skip it is turned into
  page: number;
  pageSize: number;
  count: number;
  onPageChange: (page: number) => void;
};

/**
 * A pager for a list standing in a narrow column: the previous and next arrows at the two ends and
 * the range shown between them. It has no page numbers — there is no room for them in a side
 * column, and such a list is turned one page at a time.
 */
const CompactPagination = ({
  page, pageSize, count, onPageChange,
}: Props) => {
  const { t } = useTranslation('common');

  const first = (page * pageSize) + 1;
  const last = Math.min((page + 1) * pageSize, count);
  const isFirstPage = page === 0;
  const isLastPage = last >= count;

  return (
    <Box css={classes.root}>
      <IconButton
        aria-label={t('previousPage')}
        css={classes.button}
        disabled={isFirstPage}
        onClick={() => onPageChange(page - 1)}
      >
        <FiChevronLeft size={COMPACT_PAGER_ICON_SIZE} />
      </IconButton>
      <Typography noWrap css={classes.range} variant="caption">
        {t('rangeOfTotal', { first, last, total: count })}
      </Typography>
      <IconButton
        aria-label={t('nextPage')}
        css={classes.button}
        disabled={isLastPage}
        onClick={() => onPageChange(page + 1)}
      >
        <FiChevronRight size={COMPACT_PAGER_ICON_SIZE} />
      </IconButton>
    </Box>
  );
};

export default CompactPagination;
