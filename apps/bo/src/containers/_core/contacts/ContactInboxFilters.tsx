import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import { RefObject, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdFilterList } from 'react-icons/md';

import type { Theme } from '@mui/material/styles';

import ToolbarIconButton from '@/components/ToolbarIconButton';
import {
  CONTACT_INBOX_PERIOD_OPTIONS, TICKET_PRIORITY_OPTIONS, TICKET_SOURCE_OPTIONS, TICKET_SUBJECT_OPTIONS,
} from '@/constants/_core/ticket.constants';
import {
  INBOX_FILTERS_ACTIONS_GAP, INBOX_FILTERS_FOOTER_GAP, INBOX_FILTERS_GROUP_GAP,
  INBOX_FILTERS_LABEL_GAP, INBOX_FILTERS_OFFSET_Y, INBOX_FILTERS_OPTIONS_GAP, INBOX_FILTERS_PADDING,
} from '@/constants/_core/ui/inbox.constants';
import { TOOLBAR_ICON_BUTTON_GLYPH_SIZE } from '@/constants/_core/ui/ui.constants';
import ContactInboxChip from '@/containers/_core/contacts/ContactInboxChip';
import { useAllowedCountryOptions } from '@/hooks/_core/useAllowedCountryOptions';
import { ISelectOption } from '@/types/_core/app.type';
import { IContactInboxFilters } from '@/types/_core/contact.type';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

const classes = {
  paper: (width?: number) => ({
    width,
    marginTop: `${INBOX_FILTERS_OFFSET_Y}px`,
    padding: `${INBOX_FILTERS_PADDING}px`,
  }),
  groups: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${INBOX_FILTERS_GROUP_GAP}px`,
  },
  group: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${INBOX_FILTERS_LABEL_GAP}px`,
  },
  options: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: `${INBOX_FILTERS_OPTIONS_GAP}px`,
  },
  footer: (theme: Theme) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: `${INBOX_FILTERS_FOOTER_GAP}px`,
    marginTop: `${INBOX_FILTERS_GROUP_GAP}px`,
    paddingTop: `${INBOX_FILTERS_FOOTER_GAP}px`,
    borderTop: `1px solid ${getDesignTokens(theme).borderLight}`,
  }),
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: `${INBOX_FILTERS_ACTIONS_GAP}px`,
  },
};

type FilterKey = keyof IContactInboxFilters;

type FilterGroup = {
  key: FilterKey;
  label: string;
  options: ISelectOption<IContactInboxFilters[FilterKey]>[];
};

type Props = {
  filters: IContactInboxFilters;
  // how many tickets the current choices leave, stated at the foot of the panel
  count: number;
  // the band the panel hangs under — it takes that band's width, not the button's
  anchorRef: RefObject<HTMLElement | null>;
  onChange: (filters: IContactInboxFilters) => void;
  onReset: () => void;
};

/**
 * The filters of the inbox queue behind one button beside its search: when a ticket came in, how
 * urgent it is, and where it was written from. Each group opens on "all", and a pick narrows the
 * queue at once — the panel only has to be put away, never submitted.
 */
const ContactInboxFilters = ({
  filters, count, anchorRef, onChange, onReset,
}: Props) => {
  const { t } = useTranslation(['common', 'user']);
  const countryOptions = useAllowedCountryOptions();
  const [isOpen, setIsOpen] = useState(false);
  const anchorEl = anchorRef.current;

  const groups: FilterGroup[] = [
    { key: 'addedWithinDays', label: t('user:contacts.addedAt'), options: CONTACT_INBOX_PERIOD_OPTIONS },
    // the most urgent first: it is the value an agent narrows the queue to
    { key: 'priority', label: t('user:contacts.priority'), options: [...TICKET_PRIORITY_OPTIONS].reverse() },
    { key: 'source', label: t('user:contacts.source'), options: TICKET_SOURCE_OPTIONS },
    // only requests written in the app carry one: picking a subject leaves website and SOS tickets out
    { key: 'subject', label: t('user:contacts.subject'), options: TICKET_SUBJECT_OPTIONS },
    // a ticket filed before the country was recorded has none, so picking one leaves it out
    { key: 'country', label: t('common:country'), options: countryOptions },
  ];

  const activeCount = groups.filter((group: FilterGroup) => filters[group.key] !== undefined).length;

  const handlePick = (key: FilterKey, value: IContactInboxFilters[FilterKey]) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <>
      <ToolbarIconButton
        active={activeCount > 0 || isOpen}
        badge={activeCount || undefined}
        icon={<MdFilterList size={TOOLBAR_ICON_BUTTON_GLYPH_SIZE} />}
        isMenuOpen={isOpen}
        label={t('common:filters')}
        onClick={() => setIsOpen(!isOpen)}
      />
      <Popover
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        onClose={() => setIsOpen(false)}
        open={isOpen && !!anchorEl}
        slotProps={{ paper: { sx: classes.paper(anchorEl?.clientWidth) } }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Box css={classes.groups}>
          {groups.map((group: FilterGroup) => (
            <Box css={classes.group} key={group.key}>
              <Typography variant="body2">{group.label}</Typography>
              <Box css={classes.options}>
                <ContactInboxChip
                  isOutlined
                  isActive={filters[group.key] === undefined}
                  onClick={() => handlePick(group.key, undefined)}
                >
                  {t('common:all')}
                </ContactInboxChip>
                {group.options.map((option: ISelectOption<IContactInboxFilters[FilterKey]>) => (
                  <ContactInboxChip
                    isOutlined
                    isActive={filters[group.key] === option.value}
                    key={String(option.value)}
                    onClick={() => handlePick(group.key, option.value)}
                  >
                    {option.label}
                  </ContactInboxChip>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
        <Box css={classes.footer}>
          <Typography variant="caption">
            {t('user:contacts.matchingTickets', { count })}
          </Typography>
          <Box css={classes.actions}>
            <Button
              disabled={!activeCount}
              onClick={onReset}
              size="small"
              variant="text"
            >
              {t('common:reset')}
            </Button>
            <Button onClick={() => setIsOpen(false)} size="small" variant="contained">
              {t('common:apply')}
            </Button>
          </Box>
        </Box>
      </Popover>
    </>
  );
};

export default ContactInboxFilters;
