import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import { useTranslation } from 'react-i18next';

import type { Theme } from '@mui/material/styles';

import { TICKET_SOURCE_LABEL_KEYS } from '@/constants/_core/ticket.constants';
import {
  INBOX_SOURCE_CHIP_GAP, INBOX_SOURCE_CHIP_HEIGHT, INBOX_SOURCE_ICON_SIZE,
} from '@/constants/_core/ui/inbox.constants';
import { IContact } from '@/types/_core/contact.type';
import { TicketSource, TicketSourceEnum } from '@/types/_core/ticket-message.type';
import { getDesignTokens, getTintedBackground } from '@/utils/_core/theme/tokens.utils';
import { getTicketSource } from '@/utils/_core/ticket.utils';

import TicketSourceIcon from './TicketSourceIcon';

const classes = {
  /*
   * the app tone is the primary one and the website tone is the neutral one, deliberately: a
   * ticket from the app can be answered into a real thread, a ticket from the site cannot — the
   * quieter chip is the one that costs the agent something
   */
  chip: (theme: Theme, source: TicketSource) => {
    const tokens = getDesignTokens(theme);
    // an SOS is the one ticket that must stand out of the queue: the alarm tone, nothing quieter
    const toneColor = source === TicketSourceEnum.SOS ? theme.palette.error.main : theme.palette.primary.main;

    return {
      height: INBOX_SOURCE_CHIP_HEIGHT,
      flexShrink: 0,
      '& .MuiChip-icon': { marginRight: 0, marginLeft: 0 },
      '& .MuiChip-label': {
        display: 'flex',
        alignItems: 'center',
        gap: `${INBOX_SOURCE_CHIP_GAP}px`,
      },
      ...(source !== TicketSourceEnum.WEB
        ? {
          color: toneColor,
          backgroundColor: getTintedBackground(theme, toneColor),
          border: `1px solid ${toneColor}`,
        }
        : {
          color: tokens.textSecondary,
          backgroundColor: tokens.surfaceSecondary,
          border: `1px solid ${tokens.border}`,
        }),
    };
  },
};

type Props = {
  contact: IContact;
};

/**
 * Where the ticket comes from — the public website form, the app, or an SOS raised during a ride. It is not decoration:
 * it is the first thing that tells an agent whether the person on the other side will ever see a
 * thread, which decides how the answer has to be written.
 */
const TicketSourceChip = ({ contact }: Props) => {
  const { t } = useTranslation(['user']);
  const source = getTicketSource(contact);
  const keys = TICKET_SOURCE_LABEL_KEYS[source];

  return (
    <Tooltip title={t(keys.hint)}>
      <Chip
        css={(theme: Theme) => classes.chip(theme, source)}
        icon={<TicketSourceIcon size={INBOX_SOURCE_ICON_SIZE} source={source} />}
        label={t(keys.label)}
        size="small"
      />
    </Tooltip>
  );
};

export default TicketSourceChip;
