import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import type { Theme } from '@mui/material/styles';

import ActionsMenu from '@/components/ActionsMenu';
import EmptyData from '@/components/EmptyData';
import {
  INBOX_AVATAR_FONT_SIZE, INBOX_AVATAR_SIZE, INBOX_ITEM_HEAD_GAP, INBOX_THREAD_PADDING_X,
  INBOX_THREAD_PADDING_Y,
} from '@/constants/_core/ui/inbox.constants';
import ContactDetailsCard from '@/containers/_core/contacts/ContactDetailsCard';
import { IContact } from '@/types/_core/contact.type';
import { getContactInitials, getContactName } from '@/utils/_core/contact.utils';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

const classes = {
  card: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    overflow: 'hidden',
  },
  head: (theme: Theme) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: `${INBOX_ITEM_HEAD_GAP}px`,
    padding: `${INBOX_THREAD_PADDING_X}px`,
    borderBottom: `1px solid ${getDesignTokens(theme).borderLight}`,
  }),
  identity: {
    display: 'flex',
    alignItems: 'center',
    gap: `${INBOX_ITEM_HEAD_GAP}px`,
    minWidth: 0,
  },
  avatar: (theme: Theme) => ({
    width: INBOX_AVATAR_SIZE,
    height: INBOX_AVATAR_SIZE,
    fontSize: INBOX_AVATAR_FONT_SIZE,
    fontWeight: theme.typography.fontWeightMedium,
    backgroundColor: theme.palette.primary.main,
  }),
  // the only band of the card that scrolls: the header above stays put
  body: {
    flex: 1,
    overflowY: 'auto' as const,
    display: 'flex',
    flexDirection: 'column' as const,
  },
  message: {
    flex: 1,
    padding: `${INBOX_THREAD_PADDING_Y}px ${INBOX_THREAD_PADDING_X}px`,
    whiteSpace: 'pre-wrap' as const,
    overflowWrap: 'anywhere' as const,
  },
};

type Props = {
  contact: IContact | null;
  canDelete: boolean;
  canDestroy: boolean;
  onDelete: () => void;
  onDestroy: () => void;
};

/** The message being read: who it is from, what it says and the facts that came with it. */
const ContactDetail = ({
  contact, canDelete, canDestroy, onDelete, onDestroy,
}: Props) => {
  const { t } = useTranslation(['common', 'user']);

  if (!contact) {
    return (
      <Card css={classes.card}>
        <EmptyData
          description={t('user:contacts.selectContactDescription')}
          sx={{ margin: 'auto' }}
          title={t('user:contacts.selectContact')}
        />
      </Card>
    );
  }

  const isDeleted = !!contact.deleted;

  return (
    <Card css={classes.card}>
      <Box css={classes.head}>
        <Box css={classes.identity}>
          <Avatar css={classes.avatar}>{getContactInitials(contact)}</Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography noWrap variant="h5">{getContactName(contact)}</Typography>
            <Typography noWrap component="div" variant="caption">
              {contact.email ?? contact.phone}
            </Typography>
          </Box>
        </Box>
        {/* binning the message, or destroying one already in the bin, folds into the overflow menu */}
        {(canDelete || canDestroy) && (
          <ActionsMenu
            label={contact.email ?? contact.phone ?? ''}
            onDelete={canDelete && !isDeleted ? onDelete : undefined}
            onDestroy={canDestroy && isDeleted ? onDestroy : undefined}
            type="icon"
          />
        )}
      </Box>
      <Box css={classes.body}>
        <Typography css={classes.message} variant="body1">{contact.message}</Typography>
        <ContactDetailsCard contact={contact} />
      </Box>
    </Card>
  );
};

export default ContactDetail;
