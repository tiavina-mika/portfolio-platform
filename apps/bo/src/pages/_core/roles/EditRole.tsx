import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import ActionsMenu from '@/components/ActionsMenu';
import Head from '@/components/Head';
import Layout from '@/components/layouts/Layout';
import RoleForm from '@/containers/_core/roles/RoleForm';
import { useProtect } from '@/hooks/_core/useProtect';
import { goToRoles, updateRole } from '@/redux/actions/_core/role.action';
import { getRoleRoleSelector, getRoleRolesSelector } from '@/redux/reducers/_core/role.reducer';
import { getSettingsLocaleSelector } from '@/redux/reducers/_core/settings.reducer';
import { IRoleInput } from '@/types/_core/role.type';
import { getRoleLabel } from '@/utils/_core/role.utils';

const EditRole = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const role = useSelector(getRoleRoleSelector);
  const roles = useSelector(getRoleRolesSelector);
  const locale = useSelector(getSettingsLocaleSelector);
  const {
    t,
  } = useTranslation(['common', 'user']);
  const {
    canFind, canEdit,
  } = useProtect('Role');

  if (!role) return null;

  // the translated label is what the admin knows the role by; the technical name stays in the form
  const roleLabel = getRoleLabel(role, locale);

  const handleGoToList = () => {
    if (!canFind) return;
    navigate(goToRoles());
  };

  const handleSubmitRole = async (values: IRoleInput) => {
    const error = await dispatch(updateRole(role.name, values));

    if (error) return;
    navigate(goToRoles());
  };

  return (
    <Layout
      actions={<ActionsMenu goToList={handleGoToList} />}
      isCard={false}
      title={t('user:role.editRole', { role: roleLabel })}
    >
      <Head title={t('user:role.editRole', { role: roleLabel })} />
      <RoleForm
        isReadOnly={!canEdit}
        onSubmit={handleSubmitRole}
        roles={roles}
        selectedRole={role}
      />
    </Layout>
  );
};

export default EditRole;
