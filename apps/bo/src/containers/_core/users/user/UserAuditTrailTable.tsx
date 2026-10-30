import { Stack, Typography } from '@mui/material';
import { UserAuditTrailInitiatorEnum, type IUserAuditTrailEntry } from '@shared/types';
import { useTranslation } from 'react-i18next';

import SectionFooter from '@/components/SectionFooter';
import StatusDot, { StatusDotColor } from '@/components/StatusDot';
import CompactTable, { CompactTableColumn } from '@/components/table/CompactTable';
import { displayDate } from '@/utils/_core/date.utils';

type Props = {
  entries: IUserAuditTrailEntry[];
  // the audit log page — only offered where it can be read for this account (a deleted one)
  onViewAll?: () => void;
};

const INITIATOR_COLORS: Record<`${UserAuditTrailInitiatorEnum}`, StatusDotColor> = {
  admin: 'info',
  system: 'default',
  user: 'success',
};


/**
 * What was done to the account and by whom, newest first — sign-outs, support sessions, posts,
 * bans and suspensions, the deletion — whether an administrator, the platform itself or the
 * member started it. It is what answers "who suspended this account, and why?".
 */
const UserAuditTrailTable = ({ entries, onViewAll }: Props) => {
  const { t, i18n } = useTranslation(['user']);

  const renderDetails = (entry: IUserAuditTrailEntry): string => {
    /*
     * a moderation row starts with the reason code it was taken for, then the free text typed with
     * it: the code is read as its label, a ban reason or a suspension reason alike
     */
    const [firstSegment, ...rest] = (entry.details ?? '').split(' — ');
    const reasonKey = [`user:bans.reasons.${firstSegment}`, `user:detail.auditTrail.reasons.${firstSegment}`]
      .find((key) => i18n.exists(key));
    const details = reasonKey
      ? [t(reasonKey), ...rest.map((text) => `« ${text} »`)].join(' · ')
      : entry.details;

    return [
      entry.banType && t(`user:bans.types.${entry.banType}`),
      details,
      entry.until && t('user:detail.auditTrail.until', { date: displayDate(entry.until) }),
    ].filter(Boolean).join(' · ');
  };

  const columns: CompactTableColumn<IUserAuditTrailEntry & { id: string }>[] = [
    {
      id: 'action',
      label: t('user:detail.auditTrail.action'),
      render: (entry) => (
        <Stack>
          <span>{t(`user:detail.auditTrail.actions.${entry.action}`)}</span>
          {!!renderDetails(entry) && (
            <Typography color="textSecondary" variant="caption">{renderDetails(entry)}</Typography>
          )}
        </Stack>
      ),
    },
    {
      id: 'initiatedBy',
      label: t('user:detail.auditTrail.initiatedBy'),
      render: (entry) => (
        <Stack>
          <StatusDot
            color={INITIATOR_COLORS[entry.initiator]}
            label={t(`user:detail.auditTrail.initiators.${entry.initiator}`)}
          />
          {entry.performedBy && (
            <Typography color="textSecondary" variant="caption">{entry.performedBy.name}</Typography>
          )}
        </Stack>
      ),
    },
    {
      id: 'date',
      label: t('user:detail.auditTrail.date'),
      nowrap: true,
      render: (entry) => displayDate(entry.createdAt),
    },
  ];

  return (
    <Stack>
      <CompactTable columns={columns} emptyTitle={t('user:detail.auditTrail.empty')} rows={entries} />
      {onViewAll && <SectionFooter actionLabel={t('user:detail.menu.viewAudit')} onAction={onViewAll} />}
    </Stack>
  );
};

export default UserAuditTrailTable;
