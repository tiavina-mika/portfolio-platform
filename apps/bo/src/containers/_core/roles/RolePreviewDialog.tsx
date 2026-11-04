import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, type Theme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { FiCheck, FiMinus } from 'react-icons/fi';

import Dialog from '@/components/Dialog';
import { RIGHTS_DISPLAY_ORDER, getRightsEntities } from '@/constants/_core/user.constants';
import RoleAuditActionChip from '@/containers/_core/roles/RoleAuditActionChip';
import { IRightsItem, IRole } from '@/types/_core/role.type';
import { IRoleAuditLog } from '@/types/_core/roleAuditLog.type';
import { displayDate } from '@/utils/_core/date.utils';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

const RIGHT_ICON_SIZE = 16;

const sx = {
  tableHeadCell: { color: 'text.secondary', fontWeight: 600 },
  rightCell: { textAlign: 'center' as const, width: 84 },
  overline: (theme: Theme) => ({
    color: getDesignTokens(theme).textMuted,
    fontWeight: 600,
    letterSpacing: 0.3,
    textTransform: 'uppercase' as const,
  }),
};

type Props = {
  role: IRole | null;
  roleLabel: string;
  auditLogs: IRoleAuditLog[];
  loading: boolean;
  onClose: () => void;
};

const hasAnyRight = (item: IRightsItem): boolean => RIGHTS_DISPLAY_ORDER.some((key) => item.rights[key]);

/**
 * What a role gives, read only: the resources it can act on and how, then the trail of what
 * happened to it — so an admin can check a role before attributing it or deleting it.
 */
const RolePreviewDialog = ({
  role, roleLabel, auditLogs, loading, onClose,
}: Props) => {
  const { t } = useTranslation(['common', 'user']);

  const entityLabels = new Map(getRightsEntities().map((entity) => [entity.className, entity.label]));
  const grantedRights = (role?.rights ?? []).filter(hasAnyRight);

  return (
    <Dialog
      withCloseButton
      maxWidth="md"
      open={!!role}
      secondaryButtonText={t('common:close')}
      toggle={onClose}
      title={(
        <Box component="span" sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography component="span" sx={sx.overline} variant="caption">
            {t('user:role.previewTitle')}
          </Typography>
          <span>{roleLabel}</span>
          <Typography color="text.secondary" component="span" variant="body2">
            {role?.name} · {t('user:role.usersCount', { count: role?.count || 0 })}
          </Typography>
        </Box>
      )}
    >
      {/* ---------- resource rights, read only */}
      <Typography component="h3" sx={{ ...sx.overline, mb: 1 }} variant="caption">
        {t('user:role.resourceRights')}
      </Typography>
      {grantedRights.length === 0
        ? <Typography color="text.secondary" variant="body2">{t('user:role.noRightsGranted')}</Typography>
        : (
          // a region that scrolls has to take the keyboard focus, or its lower rows are out of reach
          <TableContainer
            aria-label={t('user:role.resourceRights')}
            role="region"
            tabIndex={0}
            sx={{
              border: 1, borderColor: 'divider', borderRadius: 1, maxHeight: 360,
            }}
          >
            <Table stickyHeader aria-label={t('user:role.resourceRights')} size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={sx.tableHeadCell}>{t('user:role.resource')}</TableCell>
                  {RIGHTS_DISPLAY_ORDER.map((key) => (
                    <TableCell key={key} sx={{ ...sx.tableHeadCell, ...sx.rightCell }}>
                      {t(`user:role.rightsType.${key}`)}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {grantedRights.map((item) => (
                  <TableRow key={item.className}>
                    <TableCell>{entityLabels.get(item.className) ?? item.className}</TableCell>
                    {RIGHTS_DISPLAY_ORDER.map((key) => (
                      <TableCell key={key} sx={sx.rightCell}>
                        {item.rights[key]
                          ? (
                            <Box component="span" sx={{ color: 'primary.dark', display: 'inline-flex' }}>
                              <FiCheck aria-label={t('common:yes')} role="img" size={RIGHT_ICON_SIZE} />
                            </Box>
                          )
                          : (
                            <Box component="span" sx={{ color: 'text.disabled', display: 'inline-flex' }}>
                              <FiMinus aria-label={t('common:no')} role="img" size={RIGHT_ICON_SIZE} />
                            </Box>
                          )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

      {/* ---------- audit log of this role */}
      <Typography component="h3" sx={{ ...sx.overline, mt: 2.5, mb: 1 }} variant="caption">
        {t('user:role.roleHistory')}
      </Typography>
      {!loading && auditLogs.length === 0 && (
        <Typography color="text.secondary" variant="body2">{t('user:role.auditLog.empty')}</Typography>
      )}
      {auditLogs.map((auditLog) => (
        <Box
          key={auditLog.id}
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1.25,
            py: 1,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <RoleAuditActionChip action={auditLog.action} />
          <Typography color="text.secondary" sx={{ flex: 1 }} variant="body2">
            {auditLog.performedByName ?? auditLog.performedBy ?? t('user:role.auditLog.system')}
          </Typography>
          <Typography color="text.secondary" sx={{ whiteSpace: 'nowrap' }} variant="body2">
            {displayDate(auditLog.timestamp, true, true)}
          </Typography>
        </Box>
      ))}
    </Dialog>
  );
};

export default RolePreviewDialog;
