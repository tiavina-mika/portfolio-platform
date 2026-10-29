import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import SelectField from '@/components/form/fields/SelectField';
import TextField from '@/components/form/fields/TextField';
import Form from '@/components/form/Form';
import { HIGHEST_LEVEL_ROLES } from '@/constants/_core/user.constants';
import { getAppErrorSelector, getAppLoadingSelector } from '@/redux/reducers/_core/app.reducer';
import { getRoleCurrentUserIsAdminSelector, getRoleRolesSelector } from '@/redux/reducers/_core/role.reducer';
import { getSettingsLocaleSelector } from '@/redux/reducers/_core/settings.reducer';
import { ISelectOption } from '@/types/_core/app.type';
import { ISendInvitationInput } from '@/types/_core/invitation.type';
import { IRole } from '@/types/_core/role.type';
import { getRoleLabel } from '@/utils/_core/role.utils';
import { sendInvitationSchema } from '@/validations/_core/invitation.validations';

type Props = {
  onSubmit: (values: ISendInvitationInput) => void;
  formId: string;
};

const InviteUserForm = ({ onSubmit, formId }: Props) => {
  const { t } = useTranslation(['user']);
  const loading = useSelector(getAppLoadingSelector);
  const error = useSelector(getAppErrorSelector);
  const roles = useSelector(getRoleRolesSelector);
  // only an OWNER/SUPER_ADMIN can invite someone with the OWNER/SUPER_ADMIN role
  const isCurrentUserAdmin = useSelector(getRoleCurrentUserIsAdminSelector);
  const locale = useSelector(getSettingsLocaleSelector);

  const form = useForm<ISendInvitationInput>({ resolver: zodResolver(sendInvitationSchema) });

  const options = useMemo(() => {
    const assignableRoles = isCurrentUserAdmin
      ? roles
      : roles.filter((role: IRole) => !HIGHEST_LEVEL_ROLES.includes(role.name));

    return assignableRoles.map((role: IRole): ISelectOption => ({
      value: role.name,
      label: getRoleLabel(role, locale),
    }));
  }, [roles, isCurrentUserAdmin, locale]);

  return (
    <Form
      error={error}
      form={form}
      formId={formId}
      loading={loading}
      onSubmit={onSubmit}
    >
      <TextField
        fullWidth
        name="email"
        placeholder={t('user:email')}
        type="email"
      />
      <SelectField
        isMulti
        // the roles are read when the dialog opens: the select says so rather than offering nothing
        isLoading={loading && roles.length === 0}
        name="roles"
        options={options}
        placeholder={t('user:invitation.selectRoles')}
      />
    </Form>
  );
};

export default InviteUserForm;
