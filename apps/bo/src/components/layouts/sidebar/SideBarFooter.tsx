import { Box, Typography } from '@mui/material';
import { useSelector } from 'react-redux';

import Avatar from '@/components/Avatar';
import { FONT_SIZE_META, FONT_SIZE_OVERLINE } from '@/constants/_core/ui/ui.constants';
import { getSettingsLocaleSelector } from '@/redux/reducers/_core/settings.reducer';
import { IRole } from '@/types/_core/role.type';
import { IUser } from '@/types/_core/user.type';
import { getRoleLabel } from '@/utils/_core/role.utils';
import { SidebarTokens } from '@/utils/_core/theme/tokens.utils';
import { getUserFullName } from '@/utils/_core/user.utils';

const AVATAR_SIZE = 32;
const RAIL_AVATAR_SIZE = 28;

const classes = {
  // mirrors the sidebar's footer block in the design reference (border-top + 10px padding)
  root: (tokens: SidebarTokens) => ({
    borderTop: `1px solid ${tokens.border}`,
    padding: 10,
    flexShrink: 0,
  }),
  row: (open: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: open ? 'flex-start' : 'center',
    gap: 10,
    padding: open ? 8 : 0,
    minWidth: 0,
  }),
  name: (tokens: SidebarTokens) => ({
    color: tokens.textActive,
    fontSize: FONT_SIZE_META,
    fontWeight: 500,
    lineHeight: 1.2,
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }),
  role: (tokens: SidebarTokens) => ({
    color: tokens.group,
    fontSize: FONT_SIZE_OVERLINE,
    lineHeight: 1.2,
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }),
};

type Props = {
  open: boolean;
  user: IUser;
  roles: IRole[];
  tokens: SidebarTokens;
};

const SideBarFooter = ({
  open, user, roles, tokens,
}: Props) => {
  const locale = useSelector(getSettingsLocaleSelector);
  const role = roles[0];
  const roleLabel = role ? getRoleLabel(role, locale) : '';

  return (
    <Box css={classes.root(tokens)}>
      <Box css={classes.row(open)}>
        <Avatar
          size={open ? AVATAR_SIZE : RAIL_AVATAR_SIZE}
          sx={{ fontSize: FONT_SIZE_OVERLINE, fontWeight: 600, flexShrink: 0 }}
          user={user}
        />
        {open && (
          <Box sx={{ minWidth: 0 }}>
            <Typography component="div" css={classes.name(tokens)}>
              {getUserFullName(user)}
            </Typography>
            {roleLabel && (
              <Typography component="div" css={classes.role(tokens)}>
                {roleLabel}
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SideBarFooter;
