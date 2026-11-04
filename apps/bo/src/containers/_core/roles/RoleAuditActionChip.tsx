import { Chip, type Theme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

import { RoleAuditAction } from '@/types/_core/roleAuditLog.type';

type Tone = 'success' | 'info' | 'error';

// what an entry did to the role or to its holders: it opened something, closed it, or changed it
const ACTION_TONES: Record<RoleAuditAction, Tone> = {
  role_created: 'success',
  role_assigned: 'success',
  role_updated: 'info',
  role_rights_updated: 'info',
  role_removed: 'error',
  role_deleted: 'error',
};

const TONE_BACKGROUND_OPACITY = 0.1;
const TONE_BORDER_OPACITY = 0.25;

type Props = {
  action: RoleAuditAction;
};

const RoleAuditActionChip = ({ action }: Props) => {
  const { t } = useTranslation('user');
  const tone = ACTION_TONES[action] ?? 'info';

  return (
    <Chip
      label={t(`role.auditLog.actions.${action}`)}
      size="small"
      sx={(theme: Theme) => ({
        color: theme.palette[tone].main,
        backgroundColor: alpha(theme.palette[tone].main, TONE_BACKGROUND_OPACITY),
        border: `1px solid ${alpha(theme.palette[tone].main, TONE_BORDER_OPACITY)}`,
        fontWeight: 500,
      })}
    />
  );
};

export default RoleAuditActionChip;
