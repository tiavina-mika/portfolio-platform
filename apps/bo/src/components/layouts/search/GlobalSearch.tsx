import {
  alpha, Box, ClickAwayListener, IconButton, InputBase, Paper, Popper, styled,
} from '@mui/material';
import debounce from 'lodash/debounce';
import {
  ChangeEvent, KeyboardEvent, useMemo, useRef, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { FiSearch, FiX } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';

import { AUTOCOMPLETE_SEARCH_DEBOUNCE_MS } from '@/constants/_core/app.constants';
import {
  APPBAR_COMPACT_BREAKPOINT, APPBAR_ICON_BUTTON_SIZE, GLOBAL_SEARCH_RESULTS_MIN_WIDTH,
  GLOBAL_SEARCH_WIDTH, INPUT_FONT_SIZE, RADIUS, RADIUS_LG,
} from '@/constants/_core/ui/ui.constants';
import { useBreakpoint } from '@/hooks/_core/useBreakpoint';
import { searchGlobally } from '@/redux/actions/_core/globalSearch.action';
import {
  clearGlobalSearchResultsSlice,
  getGlobalSearchLoadingSelector,
  getGlobalSearchResultsSelector,
} from '@/redux/reducers/_core/globalSearch.reducer';
import { AppDispatch } from '@/redux/store';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

import GlobalSearchResults from './GlobalSearchResults';

const GLOBAL_SEARCH_MIN_LENGTH = 2;

const StyledGlobalSearchInput = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  height: 32,
  padding: '0 12px',
  width: '100%',
  borderRadius: RADIUS,
  backgroundColor: theme.palette.background.default,
  border: `1px solid ${theme.palette.divider}`,
  transition: theme.transitions.create(['border-color', 'box-shadow'], { duration: 150 }),

  '&:focus-within': {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 3px ${theme.palette.primary.main}26`,
  },
}));

const GlobalSearch = () => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch<AppDispatch>();
  const results = useSelector(getGlobalSearchResultsSelector);
  const loading = useSelector(getGlobalSearchLoadingSelector);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const isCompact = useBreakpoint(APPBAR_COMPACT_BREAKPOINT);

  const debouncedSearch = useMemo(
    () => debounce((value: string) => dispatch(searchGlobally(value)), AUTOCOMPLETE_SEARCH_DEBOUNCE_MS),
    [dispatch]
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    setQuery(value);
    setOpen(value.trim().length >= GLOBAL_SEARCH_MIN_LENGTH);
    debouncedSearch(value);
  };

  const handleFocus = () => {
    if (query.trim().length >= GLOBAL_SEARCH_MIN_LENGTH) setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCloseMobileSearch = () => {
    setOpen(false);
    setIsMobileSearchOpen(false);
    setQuery('');
    dispatch(clearGlobalSearchResultsSlice());
  };

  const handleClickAway = () => {
    if (isCompact) handleCloseMobileSearch();
    else handleClose();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Escape') return;
    if (isCompact) handleCloseMobileSearch();
    else handleClose();
  };

  const handleSelect = () => {
    handleClose();
    setQuery('');
    dispatch(clearGlobalSearchResultsSlice());
    if (isCompact) setIsMobileSearchOpen(false);
  };

  if (isCompact && !isMobileSearchOpen) {
    return (
      <IconButton
        aria-label={t('search')}
        onClick={() => setIsMobileSearchOpen(true)}
        sx={{
          width: APPBAR_ICON_BUTTON_SIZE,
          height: APPBAR_ICON_BUTTON_SIZE,
          color: 'text.secondary',
          '&:hover': { color: 'text.primary' },
        }}
      >
        <FiSearch size={18} />
      </IconButton>
    );
  }

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box
        ref={anchorRef}
        sx={isCompact ? {
          position: 'absolute',
          inset: 0,
          zIndex: theme => theme.zIndex.modal + 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          backgroundColor: theme => alpha(theme.palette.background.paper, 0.98),
        } : { width: GLOBAL_SEARCH_WIDTH }}
      >
        <StyledGlobalSearchInput>
          <FiSearch />
          <InputBase
            fullWidth
            onChange={handleChange}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            placeholder={t('search')}
            sx={{ fontSize: INPUT_FONT_SIZE }}
            value={query}
          />
        </StyledGlobalSearchInput>

        {isCompact && (
          <IconButton
            aria-label={t('close')}
            onClick={handleCloseMobileSearch}
            sx={{
              width: APPBAR_ICON_BUTTON_SIZE,
              height: APPBAR_ICON_BUTTON_SIZE,
              color: 'text.secondary',
              flexShrink: 0,
            }}
          >
            <FiX size={18} />
          </IconButton>
        )}

        <Popper
          disablePortal
          anchorEl={anchorRef.current}
          open={open}
          placement="bottom-start"
          sx={{
            zIndex: theme => theme.zIndex.modal + 2,
            width: anchorRef.current?.clientWidth,
            // the field is narrower than a readable result row, so the panel is allowed to outgrow it
            minWidth: GLOBAL_SEARCH_RESULTS_MIN_WIDTH,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              mt: 1,
              maxHeight: 420,
              overflowY: 'auto',
              borderRadius: `${RADIUS_LG}px`,
              border: theme => `1px solid ${theme.palette.divider}`,
              boxShadow: theme => getDesignTokens(theme).shadowPopover,
            }}
          >
            <GlobalSearchResults
              loading={loading}
              onSelect={handleSelect}
              query={query}
              results={results}
            />
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
};

export default GlobalSearch;
