import { Box, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import Dialog from '@/components/Dialog';
import { IRole } from '@/types/_core/role.type';

type Props = {
  role: IRole | null;
  roleLabel: string;
  onConfirm: (role: IRole) => void;
  onClose: () => void;
};

/*
 * A role held by accounts is only deleted once its code has been typed back: it takes the rights
 * of every one of them away at once, which a stray click on a row must not be able to do.
 */
const RoleDeleteDialog = ({
  role, roleLabel, onConfirm, onClose,
}: Props) => {
  const { t } = useTranslation(['common', 'user']);
  const [confirmation, setConfirmation] = useState<string>('');

  const userCount = role?.count || 0;
  const hasUsers = userCount > 0;
  const isConfirmed = !hasUsers || confirmation.trim() === role?.name;

  const handleConfirm = () => {
    if (role) onConfirm(role);
  };

  return (
    <Dialog
      buttonColor="error"
      maxWidth="xs"
      onPrimaryButtonAction={handleConfirm}
      open={!!role}
      primaryButtonDisabled={!isConfirmed}
      primaryButtonText={t('common:delete')}
      title={t('user:role.deleteTitle', { name: roleLabel })}
      toggle={onClose}
      description={hasUsers
        ? t('user:role.sureToDeleteRoleWithUsers', { name: roleLabel, count: userCount, userCount })
        : t('user:role.sureToDeleteRole', { name: roleLabel })}
    >
      <Box
        component="ul"
        sx={{
          m: 0, mt: 1.5, pl: 2.5, display: 'flex', flexDirection: 'column', gap: 0.75,
        }}
      >
        {hasUsers
          ? (
            <>
              <li>{t('user:role.deleteLoseRights', { count: userCount })}</li>
              <li>{t('user:role.deleteAccountsKept')}</li>
            </>
          )
          : <li>{t('user:role.deleteRoleDisappears')}</li>}
        <li>{t('user:role.deleteLogged')}</li>
        <li>{t('user:role.deleteIrreversible')}</li>
      </Box>
      {hasUsers && role && (
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <Typography component="label" htmlFor="role-delete-confirmation" variant="body2">
            <Trans
              components={{ strong: <strong /> }}
              i18nKey="user:role.typeToConfirm"
              values={{ value: role.name }}
            />
          </Typography>
          <TextField
            fullWidth
            id="role-delete-confirmation"
            onChange={(event) => setConfirmation(event.target.value)}
            value={confirmation}
          />
        </Box>
      )}
    </Dialog>
  );
};

export default RoleDeleteDialog;
