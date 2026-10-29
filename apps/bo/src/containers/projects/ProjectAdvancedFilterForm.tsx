import { useTranslation } from 'react-i18next';


import DateRangePickerField from '@/components/form/fields/DateRangePickerField';
import SelectField from '@/components/form/fields/SelectField';
import TextField from '@/components/form/fields/TextField';
import ToggleButtonsField from '@/components/form/inputs/ToggleButtonsField';
import AdvancedSearchForm from '@/components/search/AdvancedSearchForm';
import { activeOptions } from '@/constants/cms.constants';
import { ProjectFiltersInput } from '@/types/project.type';
import { sortedProjectTypesOptions, sortedTechnologiesOptions } from '@/utils/project.utils';
import { projectFilterSchema } from '@/validations/project.validation';

type Props = {
  onSubmit: (values: ProjectFiltersInput) => void;
};

const ProjectAdvancedFilterForm = ({
  onSubmit,
}: Props) => {
  const {
    t,
  } = useTranslation();

  return (
    <AdvancedSearchForm<ProjectFiltersInput>
      onSubmit={onSubmit}
      schema={projectFilterSchema}
      fields={[
        {
          label: t('common:name'),
          name: 'name',
          checked: false,
          component: <TextField fullWidth name="name" placeholder={t('common:name')} />,
        },
        {
          label: t('cms:title'),
          name: 'title',
          checked: false,
          component: <TextField fullWidth name="title" placeholder={t('cms:title')} />,
        },
        {
          label: t('project.projectTypes'),
          name: 'projectTypes',
          checked: false,
          component: (
            <SelectField
              fullWidth
              isMulti
              name="types"
              options={sortedProjectTypesOptions}
              variant="outlined"
            />
          ),
        },
        {
          label: t('project.technologies'),
          name: 'technologies',
          checked: false,
          component: (
            <SelectField
              fullWidth
              isMulti
              name="technologies"
              options={sortedTechnologiesOptions}
              variant="outlined"
            />
          ),
        },
        {
          label: t('common:active'),
          name: 'active',
          checked: false,
          component: (
            <ToggleButtonsField isMulti name="active" options={activeOptions} />
          ),
        },
        {
          label: t('common:createdAt'),
          name: 'createdAt',
          checked: false,
          component: <DateRangePickerField fullWidth name="createdAt" />,
        },
        {
          label: t('common:updatedAt'),
          name: 'updatedAt',
          checked: false,
          component: <DateRangePickerField fullWidth name="updatedAt" />,
        },
      ]}
    />
  );
};

export default ProjectAdvancedFilterForm;
