import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import ChoiceChipsField from '@/components/form/fields/ChoiceChipsField';
import Form from '@/components/form/Form';
import { getAppErrorSelector } from '@/redux/reducers/_core/app.reducer';
import {
  getRoleRolesDelegationLoadingSelector, getRoleRolesDelegationSelector, getRoleRolesSelector,
} from '@/redux/reducers/_core/role.reducer';
import { getSettingsLocaleSelector } from '@/redux/reducers/_core/settings.reducer';
import { IChoiceChipOption } from '@/types/_core/app.type';
import { RolesForUserInput, IRole } from '@/types/_core/role.type';
import { getRoleLabel } from '@/utils/_core/role.utils';
import { rolesForUserSchema } from '@/validations/_core/role.validations';

type Props = {
  onSubmit: (values: RolesForUserInput) => void;
  userRoles?: IRole[];
  formId: string;
};

/**
 * The posts one can add to an account. Every post is listed, including the ones the signed-in account
 * may not hand out (a highest role, a post granting more than their own): those stay in view but
 * cannot be picked, with the reason under them, so nobody wonders where a post went or learns of the
 * refusal only once the server has turned it down.
 */
const RoleForUserForm = ({
  onSubmit, userRoles, formId,
}: Props) => {
  const { t } = useTranslation(['user']);
  // all roles to select
  const roles = useSelector(getRoleRolesSelector);
  const undelegableRoleNames = useSelector(getRoleRolesDelegationSelector)?.undelegableRoleNames;
  const isDelegationLoading = useSelector(getRoleRolesDelegationLoadingSelector);
  const locale = useSelector(getSettingsLocaleSelector);
  const appError = useSelector(getAppErrorSelector);

  const form = useForm<RolesForUserInput>({
    resolver: zodResolver(rolesForUserSchema),
    defaultValues: { roles: [] },
  });

  const options = useMemo((): IChoiceChipOption[] => {
    const heldRoleNames = (userRoles ?? []).map((userRole: IRole) => userRole.name);

    return roles
      // roles other than the current user roles
      .filter((role: IRole): boolean => !heldRoleNames.includes(role.name))
      .map((role: IRole): IChoiceChipOption => {
        const isUndelegable = !!undelegableRoleNames?.includes(role.name);

        return {
          value: role.name,
          label: getRoleLabel(role, locale),
          disabled: isUndelegable,
          hint: isUndelegable
            ? t('user:role.roleWiderThanYoursHint')
            : undefined,
        };
      });
  }, [userRoles, roles, undelegableRoleNames, locale, t]);

  return (
    <Form
      error={appError}
      form={form}
      formId={formId}
      onSubmit={onSubmit}
    >
      <ChoiceChipsField
        isStacked
        multiple
        loading={isDelegationLoading}
        name="roles"
        options={options}
      />
    </Form>
  );
};

export default RoleForUserForm;
