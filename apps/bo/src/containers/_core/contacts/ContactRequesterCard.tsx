import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from '@tanstack/react-router';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { FiEye, FiX } from 'react-icons/fi';

import type { Theme } from '@mui/material/styles';

import { TICKET_SOURCE_LABEL_KEYS } from '@/constants/_core/ticket.constants';
import {
  INBOX_AVATAR_FONT_SIZE, INBOX_AVATAR_SIZE, INBOX_CONTEXT_ROW_GAP, INBOX_CONTEXT_ROW_PADDING_Y,
  INBOX_CONTEXT_TITLE_GAP, INBOX_ITEM_GAP, INBOX_ITEM_HEAD_GAP, INBOX_REQUESTER_POPOVER_PADDING_X,
  INBOX_REQUESTER_POPOVER_PADDING_Y,
} from '@/constants/_core/ui/inbox.constants';
import { SKELETON_ENTRY_HEIGHT, TOOLBAR_ICON_BUTTON_GLYPH_SIZE } from '@/constants/_core/ui/ui.constants';
import { IContact, ITicketRequesterContext } from '@/types/_core/contact.type';
import { displayDate } from '@/utils/_core/date.utils';
import { PATH_NAMES } from '@/utils/_core/pathnames';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';
import {
  getTicketRequesterInitials, getTicketRequesterName, getTicketSource,
} from '@/utils/_core/ticket.utils';

const classes = {
  head: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: `${INBOX_ITEM_HEAD_GAP}px`,
    padding: `${INBOX_REQUESTER_POPOVER_PADDING_Y}px ${INBOX_REQUESTER_POPOVER_PADDING_X}px 0`,
  },
  identity: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: `${INBOX_CONTEXT_ROW_GAP}px`,
    paddingTop: `${INBOX_ITEM_HEAD_GAP}px`,
    paddingBottom: `${INBOX_REQUESTER_POPOVER_PADDING_Y}px`,
    paddingInline: `${INBOX_REQUESTER_POPOVER_PADDING_X}px`,
  },
  avatar: (theme: Theme) => ({
    width: INBOX_AVATAR_SIZE,
    height: INBOX_AVATAR_SIZE,
    fontSize: INBOX_AVATAR_FONT_SIZE,
    fontWeight: theme.typography.fontWeightMedium,
    backgroundColor: theme.palette.primary.main,
  }),
  names: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    gap: `${INBOX_ITEM_GAP}px`,
    minWidth: 0,
    flex: 1,
  },
  rows: { padding: `0 ${INBOX_REQUESTER_POPOVER_PADDING_X}px` },
  /*
   * a fact is a row closed by a rule above it rather than a labelled block: the values line up
   * down the trailing edge, which is what makes five of them readable at a glance
   */
  row: (theme: Theme) => ({
    display: 'flex',
    justifyContent: 'space-between',
    gap: `${INBOX_CONTEXT_ROW_GAP}px`,
    padding: `${INBOX_CONTEXT_ROW_PADDING_Y}px 0`,
    borderTop: `1px solid ${getDesignTokens(theme).borderLight}`,
  }),
  footer: (theme: Theme) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    padding: `${INBOX_REQUESTER_POPOVER_PADDING_Y}px ${INBOX_REQUESTER_POPOVER_PADDING_X}px`,
    borderTop: `1px solid ${getDesignTokens(theme).borderLight}`,
  }),
  notice: {
    padding: `0 ${INBOX_REQUESTER_POPOVER_PADDING_X}px ${INBOX_CONTEXT_TITLE_GAP}px`,
  },
};

type Props = {
  contact: IContact;
  // null when the ticket carries no account — the ticket itself is then all there is to know
  requester: ITicketRequesterContext | null;
  loading: boolean;
  onClose: () => void;
};

/**
 * Who wrote the ticket, as the platform knows them: their name and address, whether their account
 * is verified, and the four figures that say whether this is a regular or a newcomer. Where the
 * ticket was written from is stated whether or not there is an account behind it — it is the one
 * fact about the requester that is always known.
 */
const ContactRequesterCard = ({
  contact, requester, loading, onClose,
}: Props) => {
  const { t } = useTranslation(['common', 'user']);

  const renderRow = (label: string, value: ReactNode) => (
    <Box css={classes.row} key={label}>
      <Typography variant="caption">{label}</Typography>
      <Typography sx={{ fontWeight: 500, textAlign: 'right' }} variant="body2">{value}</Typography>
    </Box>
  );

  return (
    <>
      <Box css={classes.head}>
        <Typography variant="overline">{t('user:contacts.requester')}</Typography>
        <IconButton aria-label={t('common:close')} onClick={onClose} size="small">
          <FiX size={TOOLBAR_ICON_BUTTON_GLYPH_SIZE} />
        </IconButton>
      </Box>
      <Box css={classes.identity}>
        <Avatar css={classes.avatar}>{getTicketRequesterInitials(contact)}</Avatar>
        <Box css={classes.names}>
          <Typography sx={{ fontWeight: 600 }} variant="body1">
            {getTicketRequesterName(contact)}
          </Typography>
          {/* the address and the number are both shown: a ticket can carry either, or both */}
          {[contact.email, contact.phone].filter(Boolean).map((contactDetail) => (
            <Typography
              noWrap
              key={contactDetail}
              sx={{ maxWidth: '100%' }}
              variant="caption"
            >
              {contactDetail}
            </Typography>
          ))}
          {!!requester && (
            <Chip
              color={requester.isVerified ? 'success' : 'warning'}
              size="small"
              label={requester.isVerified
                ? t('user:contacts.verifiedAccount')
                : t('user:contacts.unverifiedAccount')}
            />
          )}
        </Box>
      </Box>
      {loading && (
        <Box css={classes.notice}>
          <Skeleton height={SKELETON_ENTRY_HEIGHT} variant="rounded" />
        </Box>
      )}
      {!loading && !requester && (
        <Typography css={classes.notice} variant="body2">
          {t('user:contacts.requesterHasNoAccount')}
        </Typography>
      )}
      <Box css={classes.rows}>
        {renderRow(
          t('user:contacts.source'),
          t(TICKET_SOURCE_LABEL_KEYS[getTicketSource(contact)].long)
        )}
        {!!requester && (
          <>
            {renderRow(
              t('user:contacts.memberSince'),
              requester.memberSince ? displayDate(requester.memberSince) : '—'
            )}
            {renderRow(t('user:contacts.tripsCount'), requester.ridesCount)}
            {renderRow(
              t('user:contacts.averageRating'),
              requester.rating === null
                ? '—'
                : t('user:contacts.ratingValue', {
                  value: requester.rating,
                  count: requester.reviewsCount,
                })
            )}
            {renderRow(t('user:contacts.cancellationsCount'), requester.cancellationsCount)}
          </>
        )}
      </Box>
      {!!contact.user && (
        <Box css={classes.footer}>
          <Button
            component={RouterLink as any}
            params={{ id: contact.user.objectId }}
            size="small"
            startIcon={<FiEye size={TOOLBAR_ICON_BUTTON_GLYPH_SIZE} />}
            to={`${PATH_NAMES.users}/$id`}
            variant="outlined"
          >
            {t('user:contacts.viewAccount')}
          </Button>
        </Box>
      )}
    </>
  );
};

export default ContactRequesterCard;
