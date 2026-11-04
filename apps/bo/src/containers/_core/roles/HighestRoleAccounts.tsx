import {
  Alert, AlertTitle, Box, Button, Chip, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Typography,
} from '@mui/material';
import { alpha, type Theme } from '@mui/material/styles';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Avatar from '@/components/Avatar';
import EmptyData from '@/components/EmptyData';
import { HIGHEST_ROLE_MIN_OWNERS, HIGHEST_ROLE_STALE_LOGIN_DAYS } from '@/constants/_core/user.constants';
import { IHighestRoleAccount } from '@/types/_core/role.type';
import { IUser } from '@/types/_core/user.type';
import { displayDate } from '@/utils/_core/date.utils';
import {
  getHighestRoleAccountIssues, sortHighestRoleAccountsToCheckFirst,
} from '@/utils/_core/role.utils';

const OWNER_ROLE = 'OWNER';
const SUPER_ADMIN_ROLE = 'SUPER_ADMIN';
const SKELETON_ROWS = 3;

const sx = {
  header: {
    display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, py: 1.75,
  },
  titleRow: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.25 },
  spacer: { flex: 1 },
  tableHeadCell: { color: 'text.secondary', fontWeight: 600 },
  table: { minWidth: 640 },
  account: { display: 'flex', alignItems: 'flex-start', gap: 1.5 },
  accountName: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 },
  roles: { display: 'flex', flexWrap: 'wrap', gap: 0.75 },
  banner: { mb: 2 },
  skeletonRow: {
    display: 'flex', alignItems: 'center', gap: 2, py: 1.75, borderTop: 1, borderColor: 'divider',
  },
  skeletonLines: { flex: 1.3, display: 'flex', flexDirection: 'column', gap: 1 },
  // a row to check is tinted only while the list is sorted by it, so the tint and the order say the same
  row: (isTinted: boolean) => (theme: Theme) => (isTinted
    ? { backgroundColor: alpha(theme.palette.warning.main, 0.06) }
    : {}),
} as const;

type Props = {
  accounts: IHighestRoleAccount[];
  loading?: boolean;
  // left out for an account that may not give OWNER: the banner then only states the requirement
  onInviteOwner?: () => void;
};

const getFullName = ({ firstName, lastName, email }: IHighestRoleAccount): string => (
  [firstName, lastName].filter(Boolean).join(' ') || email || ''
);

/**
 * Who holds the highest powers, for the owners' periodic review: an account without its second
 * factor, one nobody has ever signed in with, or one idle for months is what the review looks for.
 * Those come first, and the server's two-owner requirement is stated while fewer than two exist.
 * Read only.
 */
const HighestRoleAccounts = ({ accounts, loading = false, onInviteOwner }: Props) => {
  const { t } = useTranslation(['user']);
  const [isSortedByIssues, setIsSortedByIssues] = useState<boolean>(true);

  const ownersCount = accounts.filter(account => account.roles.includes(OWNER_ROLE)).length;
  const superAdminsCount = accounts.filter(account => account.roles.includes(SUPER_ADMIN_ROLE)).length;
  const accountsToCheckCount = accounts
    .filter(account => getHighestRoleAccountIssues(account).length > 0).length;
  const rows = isSortedByIssues && accountsToCheckCount > 0
    ? sortHighestRoleAccountsToCheckFirst(accounts)
    : accounts;
  const hasMissingOwners = ownersCount < HIGHEST_ROLE_MIN_OWNERS;
  const bannerKey = ownersCount === 0 ? 'noOwner' : 'oneOwner';

  const handleToggleSort = () => setIsSortedByIssues(prev => !prev);

  const renderBody = () => {
    if (loading) {
      return (
        <Box aria-busy="true" aria-label={t('user:role.highestAccounts.title')} role="status">
          {Array.from({ length: SKELETON_ROWS }, (_, index) => (
            <Box key={index} sx={sx.skeletonRow}>
              <Skeleton height={36} variant="circular" width={36} />
              <Box sx={sx.skeletonLines}>
                <Skeleton height={12} width="55%" />
                <Skeleton height={12} width="40%" />
              </Box>
              <Skeleton height={12} sx={{ flex: 1, maxWidth: 110 }} />
            </Box>
          ))}
        </Box>
      );
    }

    if (accounts.length === 0) {
      return (
        <EmptyData
          description={t('user:role.highestAccounts.emptyDescription')}
          title={t('user:role.highestAccounts.empty')}
        />
      );
    }

    return (
      <TableContainer>
        <Table size="small" sx={sx.table}>
          <TableHead>
            <TableRow>
              <TableCell sx={sx.tableHeadCell}>{t('user:role.highestAccounts.account')}</TableCell>
              <TableCell sx={sx.tableHeadCell}>{t('user:role.roles')}</TableCell>
              <TableCell sx={sx.tableHeadCell}>{t('user:role.highestAccounts.mfa')}</TableCell>
              <TableCell sx={sx.tableHeadCell}>{t('user:role.highestAccounts.lastLogin')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((account) => {
              const issues = getHighestRoleAccountIssues(account);
              const hasIssues = issues.length > 0;

              return (
                <TableRow key={account.id} sx={sx.row(hasIssues && isSortedByIssues)}>
                  <TableCell>
                    <Box sx={sx.account}>
                      <Avatar
                        isNameShown
                        size={36}
                        user={{
                          firstName: account.firstName, lastName: account.lastName, email: account.email,
                        } as IUser}
                      />
                      <Box sx={{ minWidth: 0 }}>
                        <Box sx={sx.accountName}>
                          <Typography component="span" variant="body2">{getFullName(account)}</Typography>
                          {hasIssues && (
                            <Chip
                              color="warning"
                              label={t('user:role.highestAccounts.toCheck')}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                        {account.firstName && (
                          <Typography color="text.secondary" component="div" variant="caption">
                            {account.email}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={sx.roles}>
                      {account.roles.map(roleName => (
                        <Chip
                          color={roleName === OWNER_ROLE ? 'success' : 'info'}
                          key={roleName}
                          label={roleName}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={account.isMfaEnabled ? 'success' : 'error'}
                      size="small"
                      variant="outlined"
                      label={account.isMfaEnabled
                        ? t('user:role.highestAccounts.mfaOn')
                        : t('user:role.highestAccounts.mfaOff')}
                    />
                  </TableCell>
                  <TableCell>
                    {account.lastLoginAt
                      ? (
                        <>
                          <Typography component="span" sx={{ whiteSpace: 'nowrap' }} variant="body2">
                            {displayDate(account.lastLoginAt)}
                          </Typography>
                          {issues.includes('stale') && (
                            <Typography color="warning.dark" component="div" variant="caption">
                              {t('user:role.highestAccounts.staleLastLogin', {
                                days: HIGHEST_ROLE_STALE_LOGIN_DAYS,
                              })}
                            </Typography>
                          )}
                        </>
                      )
                      : (
                        <Typography
                          color="text.secondary"
                          component="span"
                          sx={{ fontStyle: 'italic' }}
                          variant="body2"
                        >
                          {t('user:role.highestAccounts.neverLoggedIn')}
                        </Typography>
                      )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box>
      <Box sx={sx.header}>
        <Box sx={{ minWidth: 0 }}>
          <Box sx={sx.titleRow}>
            <Typography component="h2" variant="h6">{t('user:role.highestAccounts.title')}</Typography>
            {!loading && accountsToCheckCount > 0 && (
              <Chip
                color="warning"
                label={t('user:role.highestAccounts.toCheckCount', { count: accountsToCheckCount })}
                size="small"
                variant="outlined"
              />
            )}
            {!loading && accounts.length > 0 && accountsToCheckCount === 0 && (
              <Chip
                color="success"
                label={t('user:role.highestAccounts.noneToCheck')}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
          {!loading && accounts.length > 0 && (
            <Typography color="text.secondary" variant="body2">
              {t('user:role.highestAccounts.holders', { owners: ownersCount, superAdmins: superAdminsCount })}
            </Typography>
          )}
        </Box>
        <Box sx={sx.spacer} />
        {!loading && accountsToCheckCount > 0 && (
          <Button
            aria-pressed={isSortedByIssues}
            color="inherit"
            onClick={handleToggleSort}
            size="small"
            variant="outlined"
          >
            {t('user:role.highestAccounts.sortToCheckFirst')}
          </Button>
        )}
      </Box>
      {!loading && hasMissingOwners && (
        <Alert
          severity={ownersCount === 0 ? 'error' : 'warning'}
          sx={sx.banner}
          action={onInviteOwner && (
            <Button
              color="inherit"
              onClick={onInviteOwner}
              size="small"
              variant="outlined"
            >
              {t(`user:role.highestAccounts.${bannerKey}.action`)}
            </Button>
          )}
        >
          <AlertTitle>{t(`user:role.highestAccounts.${bannerKey}.title`)}</AlertTitle>
          {t(`user:role.highestAccounts.${bannerKey}.description`, { count: HIGHEST_ROLE_MIN_OWNERS })}
        </Alert>
      )}
      {renderBody()}
    </Box>
  );
};

export default HighestRoleAccounts;
