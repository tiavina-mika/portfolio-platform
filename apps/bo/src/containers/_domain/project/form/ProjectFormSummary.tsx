import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import CmsFormSummary from '@/containers/_core/cms/form/CmsFormSummary';
import { ProjectStatusEnum } from '@/types/_domain/project.type';
import { getProjectTypeLabel, getTranslatedProjectStatusLabel } from '@/utils/_domain/project.utils';

/**
 * What the classification and settings sections of the project form add up to, restated as a few
 * facts: whether the project is visible, the kinds of project it is and the technologies it uses.
 */
const ProjectFormSummary = () => {
  const { t } = useTranslation(['common', 'project']);
  const { control } = useFormContext();

  const [isActive, types, technologies] = useWatch({
    control,
    name: ['active', 'types', 'technologies'],
  }) as [boolean | undefined, string[] | undefined, string[] | undefined];

  const status = isActive
    ? ProjectStatusEnum.PUBLISHED
    : ProjectStatusEnum.DRAFT;

  return (
    <CmsFormSummary
      rows={[
        {
          label: t('common:status'),
          value: getTranslatedProjectStatusLabel(status),
        },
        {
          label: t('project:project.projectTypes'),
          value: (types ?? []).map(getProjectTypeLabel).join(', ') || t('common:none'),
        },
        {
          label: t('project:project.technologies'),
          value: (technologies ?? []).join(', ') || t('common:none'),
        },
      ]}
    />
  );
};

export default ProjectFormSummary;
