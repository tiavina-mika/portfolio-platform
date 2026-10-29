import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import RightsTableField from '@/components/form/fields/RightsTableField';
import SelectField from '@/components/form/fields/SelectField';
import TextField from '@/components/form/fields/TextField';
import Form from '@/components/form/Form';
import i18n from '@/config/i18n';
import { ENTITIES_WITH_RIGHTS_OPTIONS, defaultRights } from '@/constants/user.constants';
import { ISelectOption } from '@/types/app.type';
import {
  IRightsItem, IRoleInput, IRole, UIRole, UIRoleEnum,
} from '@/types/role.type';
import { roleSchema } from '@/validations/role.validations';

const getInitialValues = (selectedRole: IRole | null | undefined) => {
  if (selectedRole) {
    const rightsWithLabel = [];

    for (const rightOption of ENTITIES_WITH_RIGHTS_OPTIONS) {
      const savedRight = selectedRole.get('rights')?.find(
        (right: IRightsItem): boolean => right.className === rightOption.className
      );

      // rights from database
      if (savedRight) {
        // add label
        const savedRightWithLabel = { ...savedRight, label: rightOption.label };

        rightsWithLabel.push(savedRightWithLabel);
        // collection not linked to a role / rights yet
      }
      else {
        // add label
        const notSavedRight = { ...rightOption, rights: defaultRights, label: rightOption.label };

        rightsWithLabel.push(notSavedRight);
      }
    }

    return {
      name: selectedRole.get('name'),
      children: selectedRole.get('children') || [],
      rights: rightsWithLabel,
      ui: selectedRole.get('ui') || [],
    };
  }

  return {
    name: '',
    children: [],
    rights: ENTITIES_WITH_RIGHTS_OPTIONS.map((className: Omit<IRightsItem, 'rights'>) => ({
      ...className,
      rights: defaultRights,
    })),
  };
};

// note that the value should be the same as the "right" in the menu list in SideBar.tsx
const uiOptions: ISelectOption<UIRole>[] = [
  { value: UIRoleEnum.MISCELLANEOUS, label: i18n.t('common:misc.miscellaneous') },
  { value: UIRoleEnum.TESTS, label: i18n.t('common:misc.tests') },
];

type Props = {
  formId: string;
  selectedRole?: IRole | null;
  roles: IRole[];
  onSubmit: (values: IRoleInput) => void;
};

const RoleForm = ({
  formId, selectedRole, onSubmit, roles,
}: Props) => {
  const {
    t,
  } = useTranslation(['common', 'user']);

  const form = useForm<IRoleInput>({
    resolver: zodResolver(roleSchema),
    defaultValues: getInitialValues(selectedRole) as any,
  });

  const {
    handleSubmit,
  } = form;

  const onSubmitHandler: SubmitHandler<IRoleInput> = (values) => {
    onSubmit(values);
  };

  const hierarchyOptions = roles
    .filter((role: IRole) => form.getValues().name !== role.get('name')) // exclude the current role
    .map((role: IRole) => ({ value: role.get('name'), label: role.get('name') }));

  return (
    <Form form={form} formId={formId} onSubmit={handleSubmit(onSubmitHandler)}>
      <TextField
        fullWidth
        required
        disabled={!!selectedRole}
        helperText={'ex: Manager. ' + t('user:role.onceCreate')}
        label={t('common:name')}
        name="name"
        type="text"
        variant="standard"
      />
      <SelectField
        isMulti
        fullWidth={false}
        helperText={t('user:role.roleHierarchyExplanation')}
        label={t('user:role.roleHierarchy')}
        name="children"
        options={hierarchyOptions}
      />
      <SelectField
        isMulti
        fullWidth={false}
        helperText={t('user:role.uiDescription')}
        label={t('user:role.menu')}
        name="ui"
        options={uiOptions}
      />
      {/* table of resource rights */}
      <RightsTableField
        description={t('user:role.resourceRightsDescription')}
        label={t('user:role.resourceRights')}
        name="rights"
      />
    </Form>
  );
};

export default RoleForm;
