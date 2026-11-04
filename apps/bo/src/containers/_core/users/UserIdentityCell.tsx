import Box from '@mui/material/Box';
import MuiLink from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { FiMail, FiPhone } from 'react-icons/fi';

import type { Theme } from '@mui/material/styles';

import Avatar from '@/components/Avatar';
import Link from '@/components/Link';
import {
  IDENTITY_CONTACT_GAP, IDENTITY_CONTACT_ICON_GAP, IDENTITY_CONTACT_ICON_SIZE,
  IDENTITY_CONTACT_OFFSET_X, IDENTITY_CONTACT_OFFSET_Y, IDENTITY_CONTACT_PADDING_X,
  IDENTITY_CONTACT_PADDING_Y, IDENTITY_TEXT_GAP,
} from '@/constants/_core/ui/entity.constants';
import {
  TABLE_CELL_AVATAR_FONT_SIZE, TABLE_CELL_AVATAR_FONT_WEIGHT, TABLE_CELL_AVATAR_GAP,
  TABLE_CELL_AVATAR_SIZE,
} from '@/constants/_core/ui/list.constants';
import { FONT_SIZE_BODY, RADIUS } from '@/constants/_core/ui/ui.constants';
import { IUser } from '@/types/_core/user.type';
import { PATH_NAMES } from '@/utils/_core/pathnames';
import { getRowTitleLinkStyles } from '@/utils/_core/theme/styles.utils';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';
import { getFullPhoneNumber, getUserFullName } from '@/utils/_core/user.utils';

const classes = {
  /*
   * only the name opens the person's file — the face beside it and the score under it are facts
   * about them, not a second way in — so the cell itself keeps the arrow and lets the one anchor
   * inside it be what turns the pointer into a hand
   */
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: `${TABLE_CELL_AVATAR_GAP}px`,
    minWidth: 0,
    cursor: 'default',
  },
  avatar: {
    fontSize: TABLE_CELL_AVATAR_FONT_SIZE,
    fontWeight: TABLE_CELL_AVATAR_FONT_WEIGHT,
  },
  identity: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${IDENTITY_TEXT_GAP}px`,
    minWidth: 0,
  },
  contact: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${IDENTITY_CONTACT_GAP}px`,
  },
  contactRow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: `${IDENTITY_CONTACT_ICON_GAP}px`,
    whiteSpace: 'nowrap' as const,
  },
  /*
   * the address is the second way to reach someone, so it is written in the tone of the rest of the
   * card and only takes the link tint under the pointer — the number above it stays the one line
   * that reads as an action from the moment the card opens
   */
  mailLink: (theme: Theme) => ({
    color: theme.palette.text.secondary,
    fontWeight: theme.typography.fontWeightRegular,
  }),
};

/*
 * the card is a surface of the page rather than the dark slab MUI gives a text tooltip: it holds
 * two links the reader is meant to travel into, and a tooltip that dark could not carry them
 */
const contactTooltipStyles = (theme: Theme) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  // a text tooltip is set at MUI's own caption size; this one carries body copy the reader acts on
  fontSize: FONT_SIZE_BODY,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: `${RADIUS}px`,
  boxShadow: getDesignTokens(theme).shadowPopover,
  padding: `${IDENTITY_CONTACT_PADDING_Y}px ${IDENTITY_CONTACT_PADDING_X}px`,
  maxWidth: 'none',
});

type Props = {
  user: IUser | undefined;
};

/**
 * A person inside a table row: their face, their name. The phone and the email stay behind a hover: an operator scanning the list is
 * looking for a person, and only reaches for the way to contact them on the one row they have
 * stopped at, so printing both under every name turns the column into the widest thing on screen
 * for a detail almost every row does not need.
 */
const UserIdentityCell = ({
  user,
}: Props) => {
  if (!user) return null;

  const phone = getFullPhoneNumber(user.phone);

  return (
    <Tooltip
      placement="bottom-start"
      slotProps={{
        popper: {
          popperOptions: {
            modifiers: [{
              name: 'offset',
              options: { offset: [IDENTITY_CONTACT_OFFSET_X, IDENTITY_CONTACT_OFFSET_Y] },
            }],
          },
        },
        tooltip: { sx: contactTooltipStyles },
      }}
      title={(
        <Box css={classes.contact}>
          {phone && (
            <MuiLink css={classes.contactRow} href={`tel:${phone.replace(/\s/g, '')}`}>
              <FiPhone size={IDENTITY_CONTACT_ICON_SIZE} />
              {phone}
            </MuiLink>
          )}
          {user.email && (
            <MuiLink css={[classes.contactRow, classes.mailLink]} href={`mailto:${user.email}`}>
              <FiMail size={IDENTITY_CONTACT_ICON_SIZE} />
              {user.email}
            </MuiLink>
          )}
        </Box>
      )}
    >
      <Box css={classes.root} tabIndex={0}>
        <Avatar
          isNameShown
          size={TABLE_CELL_AVATAR_SIZE}
          sx={classes.avatar}
          user={user}
        />
        <Box css={classes.identity}>
          {/* reached through another object's pointer, a user carries `objectId` and no `id` */}
          <Link
            params={{ id: user.id ?? user.objectId }}
            preload={false}
            sx={getRowTitleLinkStyles}
            to={PATH_NAMES.users + '/$id'}
          >
            <Typography noWrap variant="subtitle1">{getUserFullName(user)}</Typography>
          </Link>
        </Box>
      </Box>
    </Tooltip>
  );
};

export default UserIdentityCell;
