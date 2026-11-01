import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';

import type { Theme } from '@mui/material/styles';

import {
  INBOX_AVATAR_FONT_SIZE, INBOX_AVATAR_SIZE, INBOX_ITEM_GAP, INBOX_ITEM_HEAD_GAP,
  INBOX_ITEM_PADDING, INBOX_ITEM_RAIL_WIDTH,
} from '@/constants/_core/ui/inbox.constants';
import { FONT_SIZE_META } from '@/constants/_core/ui/ui.constants';
import { IContact } from '@/types/_core/contact.type';
import { getContactInitials, getContactName } from '@/utils/_core/contact.utils';
import { fromNow } from '@/utils/_core/date.utils';
import { getDesignTokens, getTintedBackground } from '@/utils/_core/theme/tokens.utils';

const classes = {
  item: (theme: Theme, isSelected: boolean) => {
    const tokens = getDesignTokens(theme);
    const railColor = isSelected ? theme.palette.primary.main : 'transparent';

    return {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'flex-start',
      gap: `${INBOX_ITEM_GAP}px`,
      width: '100%',
      padding: `${INBOX_ITEM_PADDING}px`,
      textAlign: 'left' as const,
      borderBottom: `1px solid ${tokens.borderLight}`,
      // drawn on every row so the list does not shift sideways when another message is picked
      borderLeft: `${INBOX_ITEM_RAIL_WIDTH}px solid ${railColor}`,
      backgroundColor: isSelected
        ? getTintedBackground(theme, theme.palette.primary.main)
        : 'transparent',
      '&:hover': { backgroundColor: isSelected ? undefined : tokens.tabHover },
    };
  },
  head: {
    display: 'flex',
    alignItems: 'center',
    gap: `${INBOX_ITEM_HEAD_GAP}px`,
    width: '100%',
  },
  avatar: (theme: Theme) => ({
    width: INBOX_AVATAR_SIZE,
    height: INBOX_AVATAR_SIZE,
    fontSize: INBOX_AVATAR_FONT_SIZE,
    fontWeight: theme.typography.fontWeightMedium,
    backgroundColor: theme.palette.primary.main,
  }),
  excerpt: {
    display: 'block',
    width: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
};

type Props = {
  contact: IContact;
  isSelected: boolean;
  onSelect: (id: string) => void;
};

/**
 * One message in the list: who wrote, when and the start of what they said. A message nobody has
 * opened yet states its sender in the strong weight, like an unread mail.
 */
const ContactInboxItem = ({ contact, isSelected, onSelect }: Props) => (
  <ButtonBase
    css={(theme: Theme) => classes.item(theme, isSelected)}
    onClick={() => onSelect(contact.id)}
  >
    <Box css={classes.head}>
      <Avatar css={classes.avatar}>{getContactInitials(contact)}</Avatar>
      <Typography
        noWrap
        sx={{ fontWeight: contact.seen ? 500 : 700, minWidth: 0 }}
        variant="body1"
      >
        {getContactName(contact)}
      </Typography>
      <Typography
        sx={{ marginLeft: 'auto', whiteSpace: 'nowrap', fontSize: FONT_SIZE_META }}
        variant="caption"
      >
        {fromNow(contact.createdAt)}
      </Typography>
    </Box>
    <Typography css={classes.excerpt} variant="body2">
      {contact.message}
    </Typography>
  </ButtonBase>
);

export default ContactInboxItem;
