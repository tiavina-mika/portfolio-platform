import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { PROJECT_FORM_SECTIONS, PROJECT_WEBSITE_BASE_PATH } from '@/constants/_domain/project.constants';
import CmsSeoPreview from '@/containers/_core/cms/CmsSeoPreview';
import CmsFormRenderedPreview from '@/containers/_core/cms/form/CmsFormRenderedPreview';
import CmsFormSeoSection from '@/containers/_core/cms/form/CmsFormSeoSection';
import CmsFormWorkbench from '@/containers/_core/cms/form/CmsFormWorkbench';
import { getSettingsLocaleSelector } from '@/redux/reducers/_core/settings.reducer';
import { CmsFormSectionEnum } from '@/types/_core/cms.type';
import { IContentVersion } from '@/types/_core/contentVersion.type';
import { Locale } from '@/types/_core/setting.type';
import { IProject, IProjectInput } from '@/types/_domain/project.type';
import { getProjectEditionInitialValues } from '@/utils/_domain/project.utils';
import { projectSchema } from '@/validations/_domain/project.validations';

import ProjectFormClassificationSection from './ProjectFormClassificationSection';
import ProjectFormContentSection from './ProjectFormContentSection';
import ProjectFormImagesSection from './ProjectFormImagesSection';
import ProjectFormSettingsSection from './ProjectFormSettingsSection';
import ProjectFormSummary from './ProjectFormSummary';

const PROJECT_FORM_ID = 'project-form-id';

const initialValues = {
  active: true,
  types: [],
  technologies: [],
};

type Props = {
  onSubmit: (values: IProjectInput) => void;
  project?: IProject | null;
  loading?: boolean;
  /** past versions of the content, shown in the preview column second tab */
  versions?: IContentVersion[];
  canRestoreVersion?: boolean;
  onRestoreVersion?: (versionId: string) => void;
};

/**
 * The project form, laid out as the CMS workbench the article and page forms use: the summary rail
 * naming its sections, the section being filled, and what it produces drawn next to it. The French
 * name, title, description and content, the main picture, at least one type and one technology are
 * required.
 */
const ProjectForm = ({
  onSubmit, project, loading, versions, canRestoreVersion, onRestoreVersion,
}: Props) => {
  const { t } = useTranslation(['common', 'cms', 'project']);
  const locale = useSelector(getSettingsLocaleSelector);

  const [isInitializing, setIsInitializing] = useState(true);

  const form = useForm<IProjectInput>({
    mode: 'onBlur',
    defaultValues: initialValues,
    resolver: zodResolver(projectSchema),
  });

  const { reset } = form;

  // initialize the form values from the project being edited
  useEffect(() => {
    // guards against a stale response landing after a newer `project` has already been selected
    let isCancelled = false;

    const init = async () => {
      setIsInitializing(true);
      const editionInitialValues = project
        ? await getProjectEditionInitialValues(project)
        : initialValues;

      if (isCancelled) return;
      reset({ ...editionInitialValues });
      setIsInitializing(false);
    };

    init();

    return () => {
      isCancelled = true;
    };
  }, [project, reset, locale]);

  const renderSection = (section: CmsFormSectionEnum, tab: Locale) => {
    switch (section) {
      case CmsFormSectionEnum.SEO:
        return (
          <CmsFormSeoSection
            basePath={PROJECT_WEBSITE_BASE_PATH}
            locale={tab}
            slugSourceField="name"
            theEntity={t('project:project.theProject')}
          />
        );
      case CmsFormSectionEnum.IMAGES:
        return <ProjectFormImagesSection isEdition={!!project} />;
      case CmsFormSectionEnum.CATEGORY:
        return <ProjectFormClassificationSection />;
      case CmsFormSectionEnum.SETTINGS:
        return <ProjectFormSettingsSection />;
      default:
        /*
         * keyed by locale so switching language remounts the rich text editor: TipTap keeps its
         * document in its own state, and only a remount makes it pick up the other translation
         */
        return <ProjectFormContentSection key={tab} locale={tab} />;
    }
  };

  const renderPreview = (section: CmsFormSectionEnum, tab: Locale) => {
    if (section === CmsFormSectionEnum.SEO) {
      return (
        <CmsSeoPreview
          basePath={PROJECT_WEBSITE_BASE_PATH}
          descriptionFieldName={tab + ':description'}
          locale={tab}
          shareCardLayout="left"
          tab={tab}
          titleFieldName={tab + ':title'}
          titlePlaceholder={t('project:project.untitledProject')}
        />
      );
    }

    // the classification and the settings describe the record rather than the text
    if (section === CmsFormSectionEnum.CATEGORY || section === CmsFormSectionEnum.SETTINGS) {
      return <ProjectFormSummary />;
    }

    // content and images end up on the same public project, so they share one rendering of it
    return (
      <CmsFormRenderedPreview
        bannerFieldName="image"
        locale={tab}
        titleFields={['title', 'name']}
        untitledLabel={t('project:project.untitledProject')}
      />
    );
  };

  return (
    <CmsFormWorkbench
      canRestoreVersion={canRestoreVersion}
      config={PROJECT_FORM_SECTIONS}
      form={form}
      formId={PROJECT_FORM_ID}
      initializing={isInitializing}
      loading={loading}
      loadingLabel={t('project:project.loadingProject')}
      onRestoreVersion={onRestoreVersion}
      onSubmit={onSubmit}
      renderPreview={renderPreview}
      renderSection={renderSection}
      savedAt={project?.updatedAt}
      versions={versions}
    />
  );
};

export default ProjectForm;
