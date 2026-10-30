import { useTranslation } from 'react-i18next';

import DateRangeField from '@/components/form/fields/DateRangeField';
import SelectField from '@/components/form/fields/SelectField';
import TextField from '@/components/form/fields/TextField';
import ToggleButtonsField from '@/components/form/inputs/ToggleButtonsField';
import AdvancedSearchForm from '@/components/search/AdvancedSearchForm';
import { activeOptions } from '@/constants/_core/cms.constants';
import { ProjectFiltersInput } from '@/types/_domain/project.type';
import { sortedProjectTypesOptions, sortedTechnologiesOptions } from '@/utils/_domain/project.utils';
import { projectFilterSchema } from '@/validations/_domain/project.validations';

type Props = {
  onSubmit: (values: ProjectFiltersInput) => void;
};

const ProjectAdvancedFilterForm = ({ onSubmit }: Props) => {
  const { t } = useTranslation(['cms', 'common', 'user', 'project']);

  return (
    <AdvancedSearchForm<ProjectFiltersInput>
      onSubmit={onSubmit}
      schema={projectFilterSchema}
      fields={[
        {
          label: t('cms:title'),
          name: 'title',
          component: <TextField fullWidth name="title" placeholder={t('cms:title')} />,
        },
        {
          label: t('project:project.projectTypes'),
          name: 'types',
          component: (
            <SelectField
              isClearable
              isMulti
              label={t('project:project.projectTypes')}
              name="types"
              options={sortedProjectTypesOptions}
            />
          ),
        },
        {
          label: t('project:project.technologies'),
          name: 'technologies',
          component: (
            <SelectField
              isClearable
              isMulti
              label={t('project:project.technologies')}
              name="technologies"
              options={sortedTechnologiesOptions}
            />
          ),
        },
        {
          label: 'Tags',
          name: 'tags',
          component: (
            <TextField fullWidth name="tags" placeholder={t('common:infoMessages.separateTagsWithComma')} />
          ),
        },
        {
          label: t('common:status'),
          name: 'active',
          component: <ToggleButtonsField isMulti name="active" options={activeOptions} />,
        },
        {
          label: t('common:createdAt'),
          name: 'createdAt',
          component: <DateRangeField endDefaultsToToday name="createdAt" />,
        },
        {
          label: t('common:updatedAt'),
          name: 'updatedAt',
          component: <DateRangeField name="updatedAt" />,
        },
      ]}
    />
  );
};

export default ProjectAdvancedFilterForm;
