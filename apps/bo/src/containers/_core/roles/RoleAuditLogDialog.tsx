import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import CompactPagination from '@/components/CompactPagination';
import Dialog from '@/components/Dialog';
import EmptyData from '@/components/EmptyData';
import { PAGINATION } from '@/constants/_core/app.constants';
import RoleAuditActionChip from '@/containers/_core/roles/RoleAuditActionChip';
import { IRoleAuditLog } from '@/types/_core/roleAuditLog.type';
import { displayDate } from '@/utils/_core/date.utils';

const sx = {
  tableHead: { bgcolor: 'action.hover' },
  tableHeadCell: { color: 'text.secondary', fontWeight: 600 },
};

type Props = {
  open: boolean;
  toggle: () => void;
  auditLogs: IRoleAuditLog[];
  count: number;
  page: number;
  onPageChange: (page: number) => void;
};

const RoleAuditLogDialog = ({
  open, toggle, auditLogs, count, page, onPageChange,
}: Props) => {
  const { t } = useTranslation(['common', 'user']);

  return (
    <Dialog
      withCloseButton
      maxWidth="md"
      open={open}
      secondaryButtonText={t('common:close')}
      title={t('user:role.auditLog.title')}
      toggle={toggle}
    >
      {auditLogs.length === 0
        ? <EmptyData title={t('user:role.auditLog.empty')} />
        : (
          <TableContainer>
            <Table aria-label={t('user:role.auditLog.title')} size="small">
              <TableHead sx={sx.tableHead}>
                <TableRow>
                  <TableCell sx={sx.tableHeadCell}>{t('user:role.auditLog.date')}</TableCell>
                  <TableCell sx={sx.tableHeadCell}>{t('user:role.auditLog.action')}</TableCell>
                  <TableCell sx={sx.tableHeadCell}>{t('user:role.auditLog.role')}</TableCell>
                  <TableCell sx={sx.tableHeadCell}>{t('user:role.auditLog.performedBy')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {auditLogs.map((auditLog) => (
                  <TableRow key={auditLog.id} sx={{ '& > *': { borderBottom: 'unset' } }}>
                    <TableCell>{displayDate(auditLog.timestamp, true, true)}</TableCell>
                    <TableCell>
                      <RoleAuditActionChip action={auditLog.action} />
                    </TableCell>
                    <TableCell>{auditLog.roleName}</TableCell>
                    <TableCell>
                      {auditLog.performedByName ?? auditLog.performedBy ?? t('user:role.auditLog.system')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <CompactPagination
              count={count}
              onPageChange={onPageChange}
              page={page}
              pageSize={PAGINATION.rowsPerPage}
            />
          </TableContainer>
        )}
    </Dialog>
  );
};

export default RoleAuditLogDialog;
