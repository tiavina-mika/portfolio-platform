import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import type { Theme } from '@mui/material/styles';

import CompactPagination from '@/components/CompactPagination';
import EmptyData from '@/components/EmptyData';
import SearchInput from '@/components/form/inputs/SearchInput';
import { CONTACT_INBOX_PAGE_SIZE } from '@/constants/_core/ticket.constants';
import {
  INBOX_ITEM_PADDING, INBOX_SCOPES_GAP, INBOX_SCOPES_PADDING_Y, INBOX_SEARCH_GAP,
  INBOX_SEARCH_PADDING,
} from '@/constants/_core/ui/inbox.constants';
import { SKELETON_ENTRY_HEIGHT, SKELETON_ROW_COUNT } from '@/constants/_core/ui/ui.constants';
import ContactInboxChip from '@/containers/_core/contacts/ContactInboxChip';
import ContactInboxFilters from '@/containers/_core/contacts/ContactInboxFilters';
import ContactInboxItem from '@/containers/_core/contacts/ContactInboxItem';
import { IContact, IContactInboxFilters } from '@/types/_core/contact.type';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

export type ContactInboxScope = {
  value: string;
  label: string;
  count?: number;
};

const classes = {
  card: {
    display: 'flex',
    flexDirection: 'column' as const,
    // the panel is as tall as the column it stands in, and scrolls its rows rather than the page
    height: '100%',
    overflow: 'hidden',
  },
  band: (theme: Theme) => ({
    borderBottom: `1px solid ${getDesignTokens(theme).borderLight}`,
  }),
  search: {
    display: 'flex',
    alignItems: 'center',
    gap: `${INBOX_SEARCH_GAP}px`,
    padding: `${INBOX_SEARCH_PADDING}px`,
  },
  /*
   * the scopes are chips on a rail rather than the recessed strip a list page uses: the strip
   * belongs above a card, and this one lives inside the panel it narrows, where a second raised
   * surface would read as a card within a card
   */
  scopes: {
    display: 'flex',
    alignItems: 'center',
    gap: `${INBOX_SCOPES_GAP}px`,
    padding: `${INBOX_SCOPES_PADDING_Y}px ${INBOX_SEARCH_PADDING}px`,
    overflowX: 'auto' as const,
  },
  count: (theme: Theme, isActive: boolean) => ({
    fontWeight: 600,
    color: isActive ? theme.palette.primary.main : getDesignTokens(theme).textMuted,
  }),
  rows: { flex: 1, overflowY: 'auto' as const },
  searchField: { flex: 1, minWidth: 0 },
};

type Props = {
  contacts: IContact[];
  scopes: ContactInboxScope[];
  activeScope: string;
  selectedId?: string;
  filters: IContactInboxFilters;
  // how many tickets the scope, the search and the filters leave, across every page
  count: number;
  // zero-based
  page: number;
  loading: boolean;
  onScopeChange: (scope: string) => void;
  onSearch: (value: string) => void;
  onFiltersChange: (filters: IContactInboxFilters) => void;
  onResetFilters: () => void;
  onSelect: (id: string) => void;
  onPageChange: (page: number) => void;
};

/**
 * The queue the inbox is read from: what to search and filter it by, which slice of it to look at,
 * and one page of the tickets themselves. The pager under the rows turns the page in place, so the
 * column never grows past the screen however long the queue is.
 */
const ContactInboxQueue = ({
  contacts, scopes, activeScope, selectedId, filters, count, page, loading,
  onScopeChange, onSearch, onFiltersChange, onResetFilters, onSelect, onPageChange,
}: Props) => {
  const { t } = useTranslation(['common', 'user']);
  const searchBandRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<HTMLDivElement>(null);

  // a new page is read from its first ticket, not from where the previous one was left scrolled
  const handlePageChange = (nextPage: number) => {
    rowsRef.current?.scrollTo({ top: 0 });
    onPageChange(nextPage);
  };

  return (
    <Card css={classes.card}>
      <Box css={[classes.band, classes.search]} ref={searchBandRef}>
        <Box css={classes.searchField}>
          <SearchInput
            onChange={(_, value: string) => onSearch(value)}
            placeholder={t('user:contacts.search')}
            width="100%"
          />
        </Box>
        <ContactInboxFilters
          anchorRef={searchBandRef}
          count={count}
          filters={filters}
          onChange={onFiltersChange}
          onReset={onResetFilters}
        />
      </Box>
      <Box css={[classes.band, classes.scopes]}>
        {scopes.map((scope: ContactInboxScope) => {
          const isActive = scope.value === activeScope;

          return (
            <ContactInboxChip
              isActive={isActive}
              key={scope.value}
              onClick={() => onScopeChange(scope.value)}
            >
              {scope.label}
              {scope.count !== undefined && (
                <Box component="span" css={(theme: Theme) => classes.count(theme, isActive)}>
                  {scope.count}
                </Box>
              )}
            </ContactInboxChip>
          );
        })}
      </Box>
      <Box css={classes.rows} ref={rowsRef}>
        {loading && contacts.length === 0
          ? Array.from({ length: SKELETON_ROW_COUNT }).map((_, index: number) => (
            <Skeleton
              height={SKELETON_ENTRY_HEIGHT}
              key={index}
              sx={{ margin: `${INBOX_ITEM_PADDING}px` }}
              variant="rounded"
            />
          ))
          : contacts.map((contact: IContact) => (
            <ContactInboxItem
              contact={contact}
              isSelected={contact.id === selectedId}
              key={contact.id}
              onSelect={onSelect}
            />
          ))}
        {!loading && contacts.length === 0 && (
          <EmptyData title={t('user:contacts.noTicketMatchesSearch')} />
        )}
      </Box>
      {count > 0 && (
        <CompactPagination
          count={count}
          onPageChange={handlePageChange}
          page={page}
          pageSize={CONTACT_INBOX_PAGE_SIZE}
        />
      )}
    </Card>
  );
};

export default ContactInboxQueue;
