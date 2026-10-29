import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';

import SelectField from '@/components/form/fields/SelectField';
import Form from '@/components/form/Form';
import { getRoleRolesSelector } from '@/redux/reducers/role.reducer';
import { ISelectOption } from '@/types/app.type';
import { RolesForUserInput, IRole } from '@/types/role.type';
import { rolesForUserSchema } from '@/validations/role.validations';

type Props = {
  onSubmit: (values: RolesForUserInput) => void;
  userRoles?: IRole[];
  formId: string;
};

const RoleForUserForm = ({
  onSubmit, userRoles, formId,
}: Props) => {
  // all roles to select
  const roles = useSelector(getRoleRolesSelector);

  const form = useForm<RolesForUserInput>({ resolver: zodResolver(rolesForUserSchema) });

  const {
    handleSubmit,
  } = form;

  const onSubmitHandler: SubmitHandler<RolesForUserInput> = (values) => {
    onSubmit(values);
  };

  const options = useMemo(() => {
    if (userRoles) {
      return roles
        .filter((role: IRole): boolean => {
          const userRoleNames = userRoles.map((userRole: IRole) => userRole.get('name'));

          return !userRoleNames.includes(role.get('name'));
        }) // roles other than the current user roles
        .map((role: IRole): ISelectOption => ({ value: role.get('name'), label: role.get('name') }));
    }

    return roles.map((role: IRole): ISelectOption => ({ value: role.get('name'), label: role.get('name') }));
  }, [userRoles, roles]);

  return (
    <Form form={form} formId={formId} onSubmit={handleSubmit(onSubmitHandler)}>
      <SelectField isMulti name="roles" options={options} />
    </Form>
  );
};

export default RoleForUserForm;
