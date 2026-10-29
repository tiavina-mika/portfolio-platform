import {
  alpha, Box, Button, Card, Theme, Typography,
} from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { FiLock, FiLogOut, FiMail } from 'react-icons/fi';
import { useSelector } from 'react-redux';

import Avatar from '@/components/Avatar';
import Logo from '@/components/Logo';
import { ADMIN_CONTACT_EMAIL, APP_NAME } from '@/constants/_core/app.constants';
import {
  UNAUTHORIZED_ACCOUNT_AVATAR_SIZE, UNAUTHORIZED_ACCOUNT_GAP, UNAUTHORIZED_ACCOUNT_PADDING_X,
  UNAUTHORIZED_ACCOUNT_PADDING_Y, UNAUTHORIZED_ACTION_ICON_SIZE, UNAUTHORIZED_ACTIONS_GAP,
  UNAUTHORIZED_CARD_GAP, UNAUTHORIZED_CARD_PADDING_MOBILE, UNAUTHORIZED_CARD_PADDING_X,
  UNAUTHORIZED_CARD_PADDING_Y, UNAUTHORIZED_CARD_WIDTH, UNAUTHORIZED_ICON_BADGE_BORDER_OPACITY,
  UNAUTHORIZED_ICON_BADGE_SIZE, UNAUTHORIZED_ICON_SIZE, UNAUTHORIZED_ICON_STROKE_WIDTH,
  UNAUTHORIZED_LOGO_HEIGHT, UNAUTHORIZED_PAGE_GAP, UNAUTHORIZED_PAGE_PADDING,
  UNAUTHORIZED_PAGE_PADDING_MOBILE, UNAUTHORIZED_TEXT_GAP,
} from '@/constants/_core/ui/page.constants';
import { RADIUS } from '@/constants/_core/ui/ui.constants';
import { getAppCurrentUserSelector } from '@/redux/reducers/_core/app.reducer';
import { IUser } from '@/types/_core/user.type';
import { PATH_NAMES } from '@/utils/_core/pathnames';
import { getDesignTokens, getTintedBackground } from '@/utils/_core/theme/tokens.utils';
import { getUserFullName } from '@/utils/_core/user.utils';

const classes = {
  root: (theme: Theme) => ({
    minHeight: '100vh',
    gap: UNAUTHORIZED_PAGE_GAP,
    padding: UNAUTHORIZED_PAGE_PADDING,
    backgroundColor: theme.palette.background.default,
    [theme.breakpoints.down('md')]: { padding: UNAUTHORIZED_PAGE_PADDING_MOBILE },
  }),
  card: (theme: Theme) => ({
    width: UNAUTHORIZED_CARD_WIDTH,
    maxWidth: '100%',
    gap: UNAUTHORIZED_CARD_GAP,
    padding: `${UNAUTHORIZED_CARD_PADDING_Y}px ${UNAUTHORIZED_CARD_PADDING_X}px`,
    textAlign: 'center' as const,
    [theme.breakpoints.down('sm')]: { padding: UNAUTHORIZED_CARD_PADDING_MOBILE },
  }),
  /*
   * the disc is the only thing on the page carrying the severity of the sentence under it, so it
   * takes the warning tone rather than the neutral glyph an empty state would use
   */
  iconBadge: (theme: Theme) => ({
    width: UNAUTHORIZED_ICON_BADGE_SIZE,
    height: UNAUTHORIZED_ICON_BADGE_SIZE,
    borderRadius: '50%',
    color: theme.palette.warning.dark,
    backgroundColor: getTintedBackground(theme, theme.palette.warning.main),
    border: `1px solid ${alpha(theme.palette.warning.main, UNAUTHORIZED_ICON_BADGE_BORDER_OPACITY)}`,
  }),
  account: (theme: Theme) => ({
    gap: UNAUTHORIZED_ACCOUNT_GAP,
    padding: `${UNAUTHORIZED_ACCOUNT_PADDING_Y}px ${UNAUTHORIZED_ACCOUNT_PADDING_X}px`,
    textAlign: 'left' as const,
    borderRadius: RADIUS,
    backgroundColor: getDesignTokens(theme).surfaceSecondary,
    border: `1px solid ${getDesignTokens(theme).borderLight}`,
    maxWidth: '100%',
  }),
  actions: (theme: Theme) => ({
    gap: UNAUTHORIZED_ACTIONS_GAP,
    /*
     * on a phone the two actions stack and the column reverses: the way out of the page is the
     * only one of the two the reader can act on without leaving the back-office, so it leads
     */
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column-reverse' as const,
      alignItems: 'stretch',
      alignSelf: 'stretch',
    },
  }),
};

/*
 * shown when the session is perfectly valid but the account carries no role, so the dashboard has
 * nothing it may display. Logging the admin out here would blame the session for what is an
 * authorization problem — and hide a badly assigned role behind a "please log in again" loop.
 * Deliberately mounted outside the private layout: its guard is what redirects here, so the page
 * builds its own chrome (brand mark, card, copyright line) rather than the dashboard shell's.
 */
const UnauthorizedPage = () => {
  const {
    t,
  } = useTranslation(['common', 'user']);
  const navigate = useNavigate();
  const currentUser = useSelector(getAppCurrentUserSelector) as IUser | null;

  const handleLogout = () => navigate({ to: PATH_NAMES.logout });

  return (
    <div className="flexColumn center justifyCenter" css={classes.root}>
      <Logo height={UNAUTHORIZED_LOGO_HEIGHT} />
      <Card className="flexColumn center" css={classes.card}>
        <Box className="flexCenter" css={classes.iconBadge}>
          <FiLock size={UNAUTHORIZED_ICON_SIZE} strokeWidth={UNAUTHORIZED_ICON_STROKE_WIDTH} />
        </Box>
        <Box className="flexColumn stretch stretchSelf" sx={{ gap: `${UNAUTHORIZED_TEXT_GAP}px` }}>
          <Typography sx={{ textWrap: 'pretty' }} variant="h2">
            {t('common:errors.noRoleAssigned')}
          </Typography>
          <Typography sx={{ textWrap: 'pretty' }} variant="body2">
            {t('common:errors.rolesAssignedByAdministrator')}
          </Typography>
        </Box>
        {currentUser && (
          <Box className="flexRow center" css={classes.account}>
            <Avatar
              size={UNAUTHORIZED_ACCOUNT_AVATAR_SIZE}
              sx={{ flexShrink: 0 }}
              user={currentUser}
            />
            <Box className="flexColumn" sx={{ minWidth: 0 }}>
              <Typography noWrap component="div" variant="subtitle1">
                {getUserFullName(currentUser)}
              </Typography>
              <Typography
                noWrap
                component="div"
                sx={{ color: 'text.disabled' }}
                variant="caption"
              >
                {currentUser.email}
              </Typography>
            </Box>
          </Box>
        )}
        <Box className="flexRow" css={classes.actions}>
          <Button
            href={`mailto:${ADMIN_CONTACT_EMAIL}`}
            size="large"
            startIcon={<FiMail size={UNAUTHORIZED_ACTION_ICON_SIZE} />}
            variant="outlined"
          >
            {t('common:contactAdministrator')}
          </Button>
          <Button
            onClick={handleLogout}
            size="large"
            startIcon={<FiLogOut size={UNAUTHORIZED_ACTION_ICON_SIZE} />}
            variant="contained"
          >
            {t('user:logout')}
          </Button>
        </Box>
      </Card>
      <Typography sx={{ color: 'text.disabled' }} variant="caption">
        © {new Date().getFullYear()} {APP_NAME}
      </Typography>
    </div>
  );
};

export default UnauthorizedPage;
