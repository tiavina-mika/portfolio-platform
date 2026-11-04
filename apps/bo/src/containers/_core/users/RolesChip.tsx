import { Box, Chip } from '@mui/material';
import { useSelector } from 'react-redux';

import { CHIP_ROW_GAP } from '@/constants/_core/ui/ui.constants';
import { HIGHEST_LEVEL_ROLES } from '@/constants/_core/user.constants';
import { getSettingsLocaleSelector } from '@/redux/reducers/_core/settings.reducer';
import { IRole } from '@/types/_core/role.type';
import { getRoleLabel } from '@/utils/_core/role.utils';

type Props = {
  roles: IRole[];
  onRemove?: (role: IRole) => void;
  gap?: number;
};

const RolesChip = ({
  roles, onRemove, gap = CHIP_ROW_GAP,
}: Props) => {
  const locale = useSelector(getSettingsLocaleSelector);

  if (!roles) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: `${gap}px` }}>
      {roles.map((role: IRole, index: number) => (
        <Chip
          key={index}
          label={getRoleLabel(role, locale)}
          /*
           * only the two roles that can change the platform itself are tinted — a solid color per
           * role turned the column into a legend nobody knows how to read, and hid the one
           * distinction that actually matters when granting access
           */
          color={HIGHEST_LEVEL_ROLES.includes(role.name)
            ? 'primary'
            : 'default'}
          onDelete={onRemove
            ? () => onRemove(role)
            : undefined}
        />
      ))}
    </Box>
  );
};

export default RolesChip;
