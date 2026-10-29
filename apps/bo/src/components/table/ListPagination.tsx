import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import type { SelectChangeEvent } from '@mui/material/Select';
import type { Theme } from '@mui/material/styles';

import { PAGINATION } from '@/constants/_core/app.constants';
import {
  LIST_CARD_PADDING_X, LIST_PAGER_PADDING_Y, LIST_TOOLBAR_GAP, LIST_TOOLBAR_GROUP_GAP,
} from '@/constants/_core/ui/list.constants';
import { FONT_SIZE_META } from '@/constants/_core/ui/ui.constants';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

const classes = {
  pager: (theme: Theme) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap' as const,
    gap: LIST_TOOLBAR_GROUP_GAP,
    padding: `${LIST_PAGER_PADDING_Y}px ${LIST_CARD_PADDING_X}px`,
    borderTop: `1px solid ${getDesignTokens(theme).borderLight}`,
    /*
     * on a phone the two ends of the band are stacked and centred: read on one line they would each
     * be given half a screen, which is not enough for the sentence on the left nor for a page row
     * whose slots have to stay wide enough to land a thumb on
     */
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column' as const,
      justifyContent: 'center',
    },
  }),
  info: (theme: Theme) => ({
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: LIST_TOOLBAR_GAP,
    [theme.breakpoints.down('sm')]: { justifyContent: 'center' },
  }),
  /*
   * how many rows a page holds is a preference of someone settling into a long list on a wide
   * screen; on a phone it only takes the row away from where the reader currently is in that list
   */
  rowsPerPage: (theme: Theme) => ({
    display: 'flex',
    alignItems: 'center',
    gap: LIST_TOOLBAR_GAP,
    [theme.breakpoints.down('sm')]: { display: 'none' },
  }),
  /*
   * the page-size picker is read as part of the sentence next to it, not as a field: it drops the
   * outline and the row height of a control and keeps only the caption size and the chevron that
   * says it opens
   */
  select: {
    fontSize: FONT_SIZE_META,
    // the field row height and ground belong to a form control, not to a word in a sentence
    minHeight: 'auto',
    backgroundColor: 'transparent',
    // the right inset MUI reserves for the chevron is kept — only the left one goes
    '& .MuiSelect-select': { padding: 0, minHeight: 'auto' },
    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
  },
};

type Props = {
  // total number of rows the current filters match, not the number rendered on this page
  count: number;
  // zero-based, the way the list keeps it — MUI's own pager is one-based and converts on the edge
  page: number;
  rowsPerPage: number;
  onChangePage: (event: unknown, page: number) => void;
  onChangeRowsPerPage: (rowsPerPage: number) => void;
};

/**
 * Last band of the list card: where the reader currently is in the result set on the left, how to
 * move through it on the right.
 */
const ListPagination = ({
  count, page, rowsPerPage, onChangePage, onChangeRowsPerPage,
}: Props) => {
  const {
    t,
  } = useTranslation();

  const pageCount = Math.max(1, Math.ceil(count / rowsPerPage));
  const from = count === 0
    ? 0
    : (page * rowsPerPage) + 1;
  const to = Math.min(count, (page + 1) * rowsPerPage);

  const handlePageChange = (event: ChangeEvent<unknown>, nextPage: number): void => {
    onChangePage(event, nextPage - 1);
  };

  const handleRowsPerPageChange = (event: SelectChangeEvent<number>): void => {
    onChangeRowsPerPage(Number(event.target.value));
  };

  const getItemAriaLabel = (type: string, itemPage: number | null): string => {
    if (type === 'previous') return t('previousPage');
    if (type === 'next') return t('nextPage');

    return t('goToPage', { page: itemPage });
  };

  return (
    <Box css={classes.pager}>
      <div css={classes.info}>
        <Box css={classes.rowsPerPage}>
          <Typography component="span" variant="caption">{t('rowsPerPage')}</Typography>
          {/* the caption beside it is plain text, not a label element: the box names itself */}
          <Select<number>
            aria-label={t('rowsPerPage')}
            css={classes.select}
            onChange={handleRowsPerPageChange}
            value={rowsPerPage}
          >
            {(PAGINATION.rowsPerPageOptions ?? []).map((option: number) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
        </Box>
        <Typography component="span" variant="caption">
          {t('paginationInfo', { from, to, count })}
        </Typography>
      </div>
      <Pagination
        count={pageCount}
        getItemAriaLabel={getItemAriaLabel}
        onChange={handlePageChange}
        page={page + 1}
      />
    </Box>
  );
};

export default ListPagination;
