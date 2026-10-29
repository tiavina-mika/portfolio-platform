import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { TICKET_REPLY_SMS_MAX_LENGTH } from '@shared/constants';
import { MessageChannelEnum } from '@shared/types';
import { useTranslation } from 'react-i18next';
import { FiInfo } from 'react-icons/fi';

import type { Theme } from '@mui/material/styles';

import {
  INBOX_ONE_WAY_GAP, INBOX_ONE_WAY_ICON_SIZE, INBOX_ONE_WAY_PADDING_X, INBOX_ONE_WAY_PADDING_Y,
} from '@/constants/_core/ui/inbox.constants';
import { RADIUS } from '@/constants/_core/ui/ui.constants';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

const classes = {
  /*
   * a note on the card's own ground, not an alert: nothing has gone wrong. It keeps the neutral
   * tone precisely so it stays readable every time — a warning colour on something that is true of
   * every ticket from the public form would be dismissed after the second one
   */
  notice: (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      display: 'flex',
      alignItems: 'flex-start',
      gap: `${INBOX_ONE_WAY_GAP}px`,
      padding: `${INBOX_ONE_WAY_PADDING_Y}px ${INBOX_ONE_WAY_PADDING_X}px`,
      backgroundColor: tokens.surfaceSecondary,
      border: `1px solid ${tokens.border}`,
      borderRadius: `${RADIUS}px`,
      color: tokens.textMuted,
    };
  },
  icon: { flexShrink: 0, display: 'flex', marginTop: 2 },
};

type Props = {
  // how the reply reaches the requester: an email, or an SMS for one who left a phone number alone
  channel?: MessageChannelEnum;
};

/**
 * Says, right above the field the answer is typed into, that this answer leaves as an email nobody
 * can reply to. The agent has to know it *before* writing: an answer that ends with "tell us if
 * that works" is a reasonable thing to write into a thread and a cruel thing to email to someone
 * who has no way of telling us anything.
 * A requester who left a phone number and no email is answered by SMS instead, cut at a couple of
 * SMS segments — the notice says which, since what fits in a text differs from what fits in a mail.
 */
const ContactOneWayNotice = ({ channel = MessageChannelEnum.EMAIL }: Props) => {
  const { t } = useTranslation(['user']);

  return (
    <Box css={classes.notice}>
      <Box css={classes.icon}>
        <FiInfo size={INBOX_ONE_WAY_ICON_SIZE} />
      </Box>
      <Typography sx={{ textWrap: 'pretty' }} variant="body2">
        {channel === MessageChannelEnum.SMS
          ? t('user:contacts.oneWayTicketNoticeSms', { count: TICKET_REPLY_SMS_MAX_LENGTH })
          : t('user:contacts.oneWayTicketNotice')}
      </Typography>
    </Box>
  );
};

export default ContactOneWayNotice;
