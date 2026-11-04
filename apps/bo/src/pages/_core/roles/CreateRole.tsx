import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import ActionsMenu from '@/components/ActionsMenu';
import Head from '@/components/Head';
import Layout from '@/components/layouts/Layout';
import RoleForm from '@/containers/_core/roles/RoleForm';
import { useProtect } from '@/hooks/_core/useProtect';
import { createRole, goToRoles } from '@/redux/actions/_core/role.action';
import { getRoleRolesSelector } from '@/redux/reducers/_core/role.reducer';
import { IRoleInput } from '@/types/_core/role.type';

const CreateRole = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const roles = useSelector(getRoleRolesSelector);
  const {
    t,
  } = useTranslation(['common', 'user']);
  const {
    canFind,
  } = useProtect('Role');

  const handleGoToList = () => {
    if (!canFind) return;
    navigate(goToRoles());
  };

  const handleSubmitRole = async (values: IRoleInput) => {
    const error = await dispatch(createRole(values));

    if (error) return;
    navigate(goToRoles());
  };

  return (
    <Layout
      actions={<ActionsMenu goToList={handleGoToList} />}
      isCard={false}
      title={t('user:role.addRole')}
    >
      <Head title={t('user:role.addRole')} />
      <RoleForm onSubmit={handleSubmitRole} roles={roles} />
    </Layout>
  );
};

export default CreateRole;
