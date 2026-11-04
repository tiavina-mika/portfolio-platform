import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import type { Theme } from '@mui/material/styles';

import CompactPagination from '@/components/CompactPagination';
import EmptyData from '@/components/EmptyData';
import SearchInput from '@/components/form/inputs/SearchInput';
import { CONTACT_PAGE_SIZE } from '@/constants/_core/contact.constants';
import {
  INBOX_ITEM_PADDING, INBOX_SCOPES_GAP, INBOX_SCOPES_PADDING_Y, INBOX_SEARCH_PADDING,
} from '@/constants/_core/ui/inbox.constants';
import { SKELETON_ENTRY_HEIGHT, SKELETON_ROW_COUNT } from '@/constants/_core/ui/ui.constants';
import ContactInboxChip from '@/containers/_core/contacts/ContactInboxChip';
import ContactInboxItem from '@/containers/_core/contacts/ContactInboxItem';
import { IContact } from '@/types/_core/contact.type';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

export type ContactInboxScope = {
  value: string;
  label: string;
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
  search: { padding: `${INBOX_SEARCH_PADDING}px` },
  scopes: {
    display: 'flex',
    alignItems: 'center',
    gap: `${INBOX_SCOPES_GAP}px`,
    padding: `${INBOX_SCOPES_PADDING_Y}px ${INBOX_SEARCH_PADDING}px`,
    overflowX: 'auto' as const,
  },
  rows: { flex: 1, overflowY: 'auto' as const },
};

type Props = {
  contacts: IContact[];
  scopes: ContactInboxScope[];
  activeScope: string;
  selectedId?: string;
  // how many messages the scope and the search leave, across every page
  count: number;
  // zero-based
  page: number;
  loading: boolean;
  onScopeChange: (scope: string) => void;
  onSearch: (value: string) => void;
  onSelect: (id: string) => void;
  onPageChange: (page: number) => void;
};

/**
 * The list the page is read from: what to search it by, which scope to look at, and one page of the
 * messages themselves.
 */
const ContactInboxQueue = ({
  contacts, scopes, activeScope, selectedId, count, page, loading,
  onScopeChange, onSearch, onSelect, onPageChange,
}: Props) => {
  const { t } = useTranslation(['common', 'user']);
  const rowsRef = useRef<HTMLDivElement>(null);

  // a new page is read from its first message, not from where the previous one was left scrolled
  const handlePageChange = (nextPage: number) => {
    rowsRef.current?.scrollTo({ top: 0 });
    onPageChange(nextPage);
  };

  return (
    <Card css={classes.card}>
      <Box css={[classes.band, classes.search]}>
        <SearchInput
          onChange={(_, value: string) => onSearch(value)}
          placeholder={t('user:contacts.search')}
          width="100%"
        />
      </Box>
      {scopes.length > 1 && (
        <Box css={[classes.band, classes.scopes]}>
          {scopes.map((scope: ContactInboxScope) => (
            <ContactInboxChip
              isActive={scope.value === activeScope}
              key={scope.value}
              onClick={() => onScopeChange(scope.value)}
            >
              {scope.label}
            </ContactInboxChip>
          ))}
        </Box>
      )}
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
          <EmptyData title={t('user:contacts.noContactMatchesSearch')} />
        )}
      </Box>
      {count > 0 && (
        <CompactPagination
          count={count}
          onPageChange={handlePageChange}
          page={page}
          pageSize={CONTACT_PAGE_SIZE}
        />
      )}
    </Card>
  );
};

export default ContactInboxQueue;
