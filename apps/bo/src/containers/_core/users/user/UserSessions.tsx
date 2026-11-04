import {
  Alert, Box, Button, Chip, Table, TableBody, TableCell, TableHead, TableRow, Typography,
} from '@mui/material';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { FiLogOut } from 'react-icons/fi';

import type { Theme } from '@mui/material/styles';

import EmptyData from '@/components/EmptyData';
import ListCardsView from '@/components/table/ListCardsView';
import TableSkeletonRows from '@/components/table/TableSkeletonRows';
import {
  USER_SESSION_DEVICE_LINE_GAP, USER_SESSION_ERROR_GAP, USER_SESSION_FOOTER_GAP,
  USER_SESSION_FOOTER_PADDING_TOP,
} from '@/constants/_core/ui/entity.constants';
import { ITableHeadCell } from '@/types/_core/app.type';
import { IUserActiveSession, SessionSignInMethod } from '@/types/_core/userSession.type';
import { displayDate } from '@/utils/_core/date.utils';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

// the columns the table draws, in order: the card view on a phone reads the same list
const SESSION_COLUMN_COUNT = 4;

// a code sent by SMS is the one sign-in a stolen SIM is enough for, so it stands out from the rest
const SIGN_IN_METHOD_COLORS: Record<SessionSignInMethod, 'default' | 'info' | 'warning'> = {
  password: 'default',
  sms: 'info',
  support: 'warning',
};

const classes = {
  device: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: USER_SESSION_DEVICE_LINE_GAP,
    minWidth: 0,
  },
  footer: (theme: Theme) => ({
    display: 'flex',
    flexWrap: 'wrap' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: USER_SESSION_FOOTER_GAP,
    paddingTop: USER_SESSION_FOOTER_PADDING_TOP,
    borderTop: `1px solid ${getDesignTokens(theme).borderLight}`,
  }),
  errorBody: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    gap: USER_SESSION_ERROR_GAP,
  },
};

/*
 * a session as the card view on a phone reads it: the first field titles the card, the others are
 * listed under it in the order of the head cells, and `actions` closes the card
 */
type SessionCard = {
  id: string;
  device: string;
  signInMethod: ReactNode;
  signedInAt: string;
  meta: string;
  actions?: ReactNode;
};

type Props = {
  sessions: IUserActiveSession[];
  loading: boolean;
  hasError: boolean;
  // closing a session takes the right to edit the account, reading them only the right to open it
  canRevoke: boolean;
  // false once the account is already banned: there is nothing left to suspend
  canSuspend: boolean;
  onRetry: () => void;
  onRevoke: (sessionId: string) => void;
  onRevokeAll: () => void;
  onSuspend: () => void;
};

/**
 * The devices a user is signed in on, as support sees them on the user file — for a stolen phone
 * or SIM: each one can be signed out, or all of them at once. A table from the tablet up, a list of
 * cards on a phone, where four columns and a button no longer fit a row.
 *
 * Only what the platform records is shown: the device, how the session was opened and when the
 * device last signed in. No IP address nor location is stored with a session.
 */
const UserSessions = ({
  sessions, loading, hasError, canRevoke, canSuspend, onRetry, onRevoke, onRevokeAll, onSuspend,
}: Props) => {
  const { t } = useTranslation(['common', 'user']);

  // a session no device ever registered is still a way into the account: it is named for what it is
  const getDeviceName = (session: IUserActiveSession): string => (
    session.deviceName ?? t('user:sessions.unknownDevice')
  );

  const getDeviceMeta = (session: IUserActiveSession): string => {
    if (!session.platform) return t('user:sessions.noDeviceRegistered');

    return [
      t(`user:sessions.platforms.${session.platform}`),
      session.appVersion && t('user:sessions.appVersion', { version: session.appVersion }),
    ].filter(Boolean).join(' · ');
  };

  const renderSignInMethod = (session: IUserActiveSession) => (
    <Chip
      color={SIGN_IN_METHOD_COLORS[session.signInMethod]}
      label={t(`user:sessions.signInMethods.${session.signInMethod}`)}
      size="small"
    />
  );

  const renderRevokeButton = (session: IUserActiveSession) => (
    <Button
      color="error"
      onClick={() => onRevoke(session.id)}
      size="small"
      variant="outlined"
    >
      {t('user:sessions.signOut')}
    </Button>
  );

  const headCells: ITableHeadCell<keyof SessionCard>[] = [
    { id: 'device', label: t('user:sessions.device') },
    { id: 'signInMethod', label: t('user:sessions.signInMethod') },
    { id: 'signedInAt', label: t('user:sessions.lastSignIn') },
    { id: 'meta', label: t('user:sessions.system') },
  ];

  if (loading && sessions.length === 0) {
    return (
      <Box sx={{ overflowX: 'auto' }}>
        <Table>
          <TableBody>
            <TableSkeletonRows columnCount={SESSION_COLUMN_COUNT} />
          </TableBody>
        </Table>
      </Box>
    );
  }

  if (hasError) {
    return (
      <Alert severity="error">
        <Box css={classes.errorBody}>
          <span>{t('user:sessions.loadError')}</span>
          <Button
            color="inherit"
            onClick={onRetry}
            size="small"
            variant="outlined"
          >
            {t('user:sessions.retry')}
          </Button>
        </Box>
      </Alert>
    );
  }

  if (sessions.length === 0) {
    return (
      <EmptyData
        description={t('user:sessions.emptyDescription')}
        title={t('user:sessions.emptyTitle')}
        action={canSuspend
          ? { label: t('user:sessions.suspension.suspendAccount'), onClick: onSuspend }
          : undefined}
      />
    );
  }

  const cards = sessions.map((session): SessionCard => ({
    id: session.id,
    device: getDeviceName(session),
    signInMethod: renderSignInMethod(session),
    signedInAt: displayDate(session.signedInAt),
    meta: getDeviceMeta(session),
    ...(canRevoke ? { actions: renderRevokeButton(session) } : {}),
  }));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${USER_SESSION_FOOTER_GAP}px` }}>
      {/* ------------- tablet and up ------------- */}
      <Box sx={{ display: { xs: 'none', sm: 'block' }, overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              {headCells.slice(0, 3).map((headCell) => (
                <TableCell key={headCell.id}>{headCell.label}</TableCell>
              ))}
              {canRevoke && <TableCell />}
            </TableRow>
          </TableHead>
          <TableBody>
            {sessions.map((session) => (
              <TableRow key={session.id}>
                <TableCell>
                  <Box css={classes.device}>
                    <Typography component="span" sx={{ fontWeight: 'fontWeightMedium' }} variant="body2">
                      {getDeviceName(session)}
                    </Typography>
                    <Typography color="textSecondary" component="span" variant="caption">
                      {getDeviceMeta(session)}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{renderSignInMethod(session)}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap', color: 'text.secondary' }}>
                  {displayDate(session.signedInAt)}
                </TableCell>
                {canRevoke && <TableCell align="right">{renderRevokeButton(session)}</TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      {/* ------------- phone ------------- */}
      <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
        <ListCardsView
          disableRowClickEvent
          canMultipleSelect={false}
          headCells={headCells}
          isItemSelected={() => false}
          items={cards}
          loading={false}
          onCheckedRow={() => undefined}
          onRowClick={() => undefined}
          onSelectAll={() => undefined}
          selectedIds={[]}
          stopCheckboxPropagation={() => undefined}
        />
      </Box>

      <Box css={classes.footer}>
        <Typography color="textSecondary" variant="caption">
          {t('user:sessions.auditNote')}
        </Typography>
        {canRevoke && (
          <Button
            color="error"
            onClick={onRevokeAll}
            size="small"
            startIcon={<FiLogOut />}
            variant="outlined"
          >
            {t('user:sessions.signOutAll')}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default UserSessions;
