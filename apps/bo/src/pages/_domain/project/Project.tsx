import { PROJECT_SINGLE_IMAGE_FIELDS } from '@shared/validations';
import { useNavigate } from '@tanstack/react-router';
import { TextEditorReadOnly } from 'mui-tiptap-editor';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FaCheck, FaCheckDouble, FaGithub, FaYoutube,
} from 'react-icons/fa';
import {
  FiClock, FiCodesandbox, FiEdit3, FiFileText, FiGlobe, FiImage, FiLink, FiSearch, FiTag, FiToggleRight,
} from 'react-icons/fi';
import { RiNpmjsFill } from 'react-icons/ri';
import { useSelector, useDispatch } from 'react-redux';

import ActionsMenu from '@/components/ActionsMenu';
import BooleanIcons from '@/components/BooleanIcons';
import TranslationTabs from '@/components/form/translated/TranslationTabs';
import Head from '@/components/Head';
import Items from '@/components/Items';
import ItemsStatus from '@/components/ItemsStatus';
import Layout from '@/components/layouts/Layout';
import PreviewSections from '@/components/layouts/PreviewSections';
import {
  CMS_HISTORY_AUTHOR_FIELDS, defaultUserEventFields, USER_EVENT_COLORS,
} from '@/constants/_core/app.constants';
import { CMS_JSON_DOWNLOAD_IGNORED_FIELDS } from '@/constants/_core/cms.constants';
import PreviewImages from '@/containers/_core/cms/PreviewImages';
import PublishedChip from '@/containers/_core/cms/PublishedChip';
import History from '@/containers/_core/History';
import ProjectLink from '@/containers/_domain/project/ProjectLink';
import { useTranslatedValuesByTab } from '@/hooks/_core/useTranslatedValuesByTab';
import {
  deleteProject, goToAddProject, goToEditProject, goToProjects, goToProjectsOnWebsite,
  toggleProjectActive,
} from '@/redux/actions/_domain/project.action';
import { getProjectProjectSelector } from '@/redux/reducers/_domain/project.reducer';
import { IPreviewSection, ISelectOption } from '@/types/_core/app.type';
import { IProject, IProjectTranslatedFields, IProjectUrl } from '@/types/_domain/project.type';
import { displayDate, getParseDateValue } from '@/utils/_core/date.utils';
import { downloadObjectAsJson } from '@/utils/_core/download.utils';
import { getProjectTypeLabel } from '@/utils/_domain/project.utils';

const fieldsToTranslate = [
  'name', 'title', 'content', 'societyDescription', 'metaTitle', 'metaDescription', 'slug', 'tags',
  'description',
];

type ProjectLinksField = 'links' | 'repositories' | 'npm' | 'codesandbox';

const getDateRange = (project: IProject): string => [project.dateStart, project.dateEnd]
  .filter(Boolean)
  .map((date) => displayDate(getParseDateValue(date)))
  .join(' → ');

const Project = () => {
  const { t } = useTranslation(['common', 'user', 'cms', 'project']);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const project = useSelector(getProjectProjectSelector);

  // get translated fields depending on the selected language (tabs)
  const {
    translatedFields, onTabChange, tab,
  } = useTranslatedValuesByTab<IProjectTranslatedFields>(project?.translated, fieldsToTranslate);

  if (!project) return null;

  const infosItems: ISelectOption[] = [
    {
      label: t('common:name'),
      value: translatedFields.name,
    },
    {
      label: t('cms:title'),
      value: translatedFields.title,
    },
    {
      label: t('common:description'),
      value: translatedFields.description,
    },
    {
      label: t('common:createdAt'),
      value: displayDate(project.createdAt, false, true),
    },
    {
      label: t('common:updatedAt'),
      value: displayDate(project.updatedAt, false, true),
    },
    {
      label: t('common:date'),
      value: getDateRange(project),
    },
    {
      label: t('common:deletedAt'),
      value: displayDate(project.deletedAt),
      hide: !project.deletedAt,
    },
  ];

  const classificationItems: ISelectOption[] = [
    {
      label: t('project:project.projectTypes'),
      value: (project.types ?? []).map(getProjectTypeLabel).join(', '),
    },
    {
      label: t('common:platforms'),
      value: (project.platforms ?? []).join(', '),
    },
    {
      label: t('project:project.technologies'),
      value: (project.technologies ?? []).join(', '),
    },
  ];

  const seoItems: ISelectOption[] = [
    {
      label: `Slug (${t('common:uniqueUrl', { theEntity: t('project:project.theProject') })})`,
      value: translatedFields.slug
        ? goToProjectsOnWebsite(project.translated, tab)
        : '',
    },
    {
      label: 'Tags',
      value: translatedFields.tags,
    },
    {
      label: t('common:metaTitle'),
      value: translatedFields.metaTitle,
    },
    {
      label: t('common:metaDescription'),
      value: translatedFields.metaDescription,
    },
  ];

  const statusItems: ISelectOption<ReactNode>[] = [
    {
      label: t('common:active'),
      value: <BooleanIcons value={project.active} />,
    },
  ];

  const linksFields: { label: string; field: ProjectLinksField; icon: ReactNode }[] = [
    { label: t('project:project.links'), field: 'links', icon: <FiLink /> },
    { label: t('project:project.repositories'), field: 'repositories', icon: <FaGithub /> },
    { label: 'npm', field: 'npm', icon: <RiNpmjsFill size={20} /> },
    { label: 'Codesandbox', field: 'codesandbox', icon: <FiCodesandbox /> },
  ];

  const linksItems: ISelectOption<ReactNode>[] = [
    {
      label: t('project:project.society'),
      value: project.society,
    },
    {
      label: t('project:project.website'),
      value: project.website && <ProjectLink icon={<FiGlobe />} url={project.website} />,
    },
    {
      label: 'Youtube',
      value: project.youtube && <ProjectLink icon={<FaYoutube />} url={project.youtube} />,
    },
    ...linksFields.map(({ label, field, icon }) => ({
      label,
      value: !!project[field]?.length && (
        <div>
          {(project[field] ?? []).map((link: IProjectUrl, index: number) => (
            <ProjectLink icon={icon} key={link.url + index} url={link.url} />
          ))}
        </div>
      ),
    })),
  ];

  const handleGoToList = () => {
    navigate(goToProjects());
  };

  const handleEdit = () => {
    navigate(goToEditProject(project.id));
  };

  const handleDelete = async () => {
    await dispatch(deleteProject(project.id));
    navigate(goToProjects());
  };

  const handleCreate = () => {
    navigate(goToAddProject());
  };

  const handleDownloadJson = () => {
    downloadObjectAsJson(project, CMS_JSON_DOWNLOAD_IGNORED_FIELDS, `project-${project.id}`);
  };

  const togglePublish = () => {
    dispatch(toggleProjectActive(project, !project.active));
  };

  const menus = [
    {
      onClick: togglePublish,
      display: true,
      label: project.active
        ? t('cms:noToPublish')
        : t('cms:publish'),
      icon: project.active
        ? <FaCheck />
        : <FaCheckDouble />,
    },
  ];

  const sections: IPreviewSection[] = [
    {
      id: 'details',
      label: t('common:details'),
      icon: <FiFileText />,
      content: <Items items={infosItems} />,
    },
    {
      id: 'classification',
      label: t('project:project.form.classification'),
      icon: <FiTag />,
      content: <Items items={classificationItems} />,
    },
    {
      id: 'links',
      label: t('project:project.links'),
      icon: <FiLink />,
      content: <Items items={linksItems} />,
    },
    {
      id: 'seo',
      label: t('cms:seo'),
      icon: <FiSearch />,
      helperText: t('cms:seoDescription'),
      content: <Items items={seoItems} />,
    },
    {
      id: 'content',
      label: t('project:project.contentOfTheProject'),
      icon: <FiEdit3 />,
      content: <TextEditorReadOnly value={translatedFields.content} />,
    },
    {
      id: 'society',
      label: t('project:project.societyDescription'),
      icon: <FiEdit3 />,
      content: <TextEditorReadOnly value={translatedFields.societyDescription} />,
    },
    {
      id: 'images',
      label: t('common:images'),
      icon: <FiImage />,
      content: <PreviewImages<IProject> fields={PROJECT_SINGLE_IMAGE_FIELDS} page={project} />,
    },
    {
      id: 'status',
      label: t('common:status'),
      icon: <FiToggleRight />,
      content: <ItemsStatus entity={project} items={statusItems} />,
    },
    {
      id: 'history',
      label: t('common:history'),
      icon: <FiClock />,
      content: (
        <History<IProject>
          authorFields={CMS_HISTORY_AUTHOR_FIELDS}
          colors={USER_EVENT_COLORS}
          fields={defaultUserEventFields}
          parseObj={project}
          translationKey="project:eventsHistory"
        />
      ),
    },
  ];

  return (
    <Layout
      isCard={false}
      pretitle={t('project:project.project')}
      actions={(
        <ActionsMenu
          goToList={handleGoToList}
          label={translatedFields.name}
          menus={menus}
          onCreate={handleCreate}
          onDelete={handleDelete}
          onDownloadJson={handleDownloadJson}
          onEdit={handleEdit}
          type="preview"
          websiteUrl={goToProjectsOnWebsite(project.translated, tab)}
        />
      )}
      title={(
        <>
          <span>{translatedFields.name}</span>
          <PublishedChip published={project.active} />
        </>
      )}
    >
      <Head title={translatedFields.name} />
      <PreviewSections
        header={<TranslationTabs onTabChange={onTabChange} tab={tab} />}
        sections={sections}
      />
    </Layout>
  );
};

export default Project;
