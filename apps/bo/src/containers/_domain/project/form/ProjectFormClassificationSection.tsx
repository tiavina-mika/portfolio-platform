import { Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

import CardFormBlock from '@/components/form/CardFormBlock';
import SelectField from '@/components/form/fields/SelectField';
import { PROJECT_PLATFORMS } from '@/constants/_domain/project.constants';
import { sortedProjectTypesOptions, sortedTechnologiesOptions } from '@/utils/_domain/project.utils';

const platformOptions = PROJECT_PLATFORMS.map((platform: string) => ({ value: platform, label: platform }));

/**
 * What kind of project it is: the types it belongs to, the platforms it runs on and the technologies
 * it was built with. They play the part the categories play for an article.
 */
const ProjectFormClassificationSection = () => {
  const { t } = useTranslation(['common', 'project']);

  return (
    <CardFormBlock title={t('project:project.form.classification')}>
      <Stack spacing={2}>
        <SelectField
          fullWidth
          isMulti
          required
          label={t('project:project.projectTypes')}
          name="types"
          options={sortedProjectTypesOptions}
          variant="outlined"
        />
        <SelectField
          fullWidth
          isMulti
          label={t('common:platforms')}
          name="platforms"
          options={platformOptions}
          variant="outlined"
        />
        <SelectField
          fullWidth
          isMulti
          required
          label={t('project:project.technologies')}
          name="technologies"
          options={sortedTechnologiesOptions}
          variant="outlined"
        />
      </Stack>
    </CardFormBlock>
  );
};

export default ProjectFormClassificationSection;
