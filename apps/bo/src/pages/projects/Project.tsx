import { Stack } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useNavigate } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { TextEditorReadOnly } from 'mui-tiptap-editor';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FaCheck, FaCheckDouble, FaGithub, FaYoutube,
} from 'react-icons/fa';
import { FiCodesandbox, FiGlobe, FiLink } from 'react-icons/fi';
import { RiNpmjsFill } from 'react-icons/ri';
import { useSelector, useDispatch } from 'react-redux';


import ActionsMenu from '@/components/ActionsMenu';
import BooleanIcons from '@/components/BooleanIcons';
import TranslationTabs from '@/components/form/translated/TranslationTabs';
import Head from '@/components/Head';
import Items from '@/components/Items';
import ItemsStatus from '@/components/ItemsStatus';
import Layout from '@/components/layouts/Layout';
import ListSeparatedByComma from '@/components/ListSeparatedByComma';
import PreviewImages from '@/containers/cms/PreviewImages';
import { useTranslatedValuesByTab } from '@/hooks/useTranslatedValuesByTab';
import { toggleActive } from '@/redux/actions/app.action';
import {
  deleteProject, goToAddProject, goToProjects, goToProjectsOnWebsite, goToEditProject,
} from '@/redux/actions/project.action';
import { getProjectProjectSelector, loadProjectSlice } from '@/redux/reducers/project.reducer';
import { ISelectOption } from '@/types/app.type';
import { IProject, IProjectTranslatedFields, IProjectUrl } from '@/types/project.type';
import { PREVIEW_PAGE_GRID } from '@/utils/constants';
import { displayDate } from '@/utils/date.utils';
import { PROJECT_SINGLE_IMAGE_FIELDS } from '@/validations/file.validation';

import ProjectLink from './ProjectLink';


const getDateRange = (project: IProject) => {
  const format = 'MMM YYYY';

  if (!project.get('dateStart') || !project.get('dateEnd')) return '';

  if (project.get('dateStart') && !project.get('dateEnd')) {
    return `${dayjs(project.get('dateStart')).format(format)} - present`;
  }

  const startDate = dayjs(project.get('dateStart')).format(format);
  const endDate = dayjs(project.get('dateEnd')).format(format);
  // eslint-disable-next-line @stylistic/padding-line-between-statements
  return `${startDate} - ${endDate}`;
};

const fieldsToTranslate = [
  'title',
  'name',
  'societyDescription',
  'content',
  'metaTitle',
  'metaDescription',
  'slug',
  'tags',
  'description',
];

const Project = () => {
  const {
    t,
  } = useTranslation(['common', 'user', 'cms']);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const project = useSelector(getProjectProjectSelector);

  // get translated fields depending on the selected language (tabs)
  const {
    translatedFields, onTabChange, tab,
  } = useTranslatedValuesByTab<IProjectTranslatedFields>(project?.get('translated'), fieldsToTranslate);

  if (!project) return null;

  const infosItems: ISelectOption[] = [
    {
      label: t('name'),
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
      label: t('date'),
      value: getDateRange(project),
    },
  ];

  const seoItems: ISelectOption[] = [
    {
      label: `Slug (${t('common:uniqueUrl', { theEntity: t('cms:category.theCategory') })})`,
      value: translatedFields.slug
        ? goToProjectsOnWebsite(project.get('translated'), tab)
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
      value: <BooleanIcons value={project.get('active')} />,
    },
  ];

  const otherItems: ISelectOption<string | ReactNode>[] = [
    {
      label: t('project.society'),
      value: project.get('society'),
    },
    {
      label: t('project.website'),
      value: project.has('website') && (
        <ProjectLink icon={<FiGlobe />} url={project.get('website')!} />
      ),

    },
    {
      label: 'Youtube',
      value: project.has('youtube') && (
        <ProjectLink icon={<FaYoutube />} url={project.get('youtube')!} />
      ),
    },
    ...[
      {
        label: t('project.links'),
        field: 'links',
        icon: <FiLink />,
      },
      {
        label: t('project.repositories'),
        field: 'repositories',
        icon: <FaGithub />,
      },
      {
        label: 'npm',
        field: 'npm',
        icon: <RiNpmjsFill size={20} />,
      },
      {
        label: 'Codesandbox',
        field: 'codesandbox',
        icon: <FiCodesandbox />,
      },
    ].map(({
      label, field, icon,
    }: any) => ({
      label,
      value: project.has(field) && (
        <Stack>
          {(project?.get(field) || []).map((link: IProjectUrl, index: number) => (
            <ProjectLink icon={icon} key={link.url + index} url={link.url} />
          ))}
        </Stack>
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

  const togglePublish = () => {
    dispatch(toggleActive({
      item: project, collection: 'Project', value: !project.get('active'), loadSlice: loadProjectSlice,
    }));
  };

  const menus = [
    {
      onClick: togglePublish,
      display: true,
      label: project.get('active')
        ? t('cms:noToPublish')
        : t('cms:publish'),
      icon: project.get('active')
        ? <FaCheck />
        : <FaCheckDouble />,
    },
  ];

  return (
    <Layout
      isCard={false}
      actions={(
        <ActionsMenu
          goToList={handleGoToList}
          label={translatedFields.name}
          menus={menus}
          onCreate={handleCreate}
          onDelete={handleDelete}
          onEdit={handleEdit}
          websiteUrl={goToProjectsOnWebsite(project.get('translated'), tab)}
        />
      )}
      title={(
        <>
          <span>{t('project.project')}</span>
          <span css={{ marginRight: 10, marginLeft: 10 }}>-</span>
          <span>{translatedFields.name}</span>
        </>
      )}
    >
      <Head title={translatedFields.name} />
      <Grid container spacing={PREVIEW_PAGE_GRID.spacing}>
        {/* left */}
        <Grid size={PREVIEW_PAGE_GRID.left}>
          <Stack spacing={3}>
            {/* ------- tabs for translation ------- */}
            <TranslationTabs
              onTabChange={onTabChange}
              tab={tab}
            />
            <Layout cardTitle={t('common:details')}>
              <Items items={infosItems} />
            </Layout>
            <Layout cardTitle={t('cms:seo')} helperText={t('cms:seoDescription')}>
              <Items items={seoItems} />
            </Layout>
            <Layout cardTitle={t('others')}>
              <Items items={otherItems} />
            </Layout>
            <Layout cardTitle={t('project.societyDescription')}>
              <TextEditorReadOnly value={translatedFields.societyDescription} />
            </Layout>
            <Layout cardTitle={t('project.projectDescription')}>
              <TextEditorReadOnly value={translatedFields.content} />
            </Layout>

            {/* images */}
            <PreviewImages<IProject> fields={PROJECT_SINGLE_IMAGE_FIELDS} page={project} />
          </Stack>
        </Grid>
        {/* right */}
        <Grid size={PREVIEW_PAGE_GRID.right}>
          <Stack spacing={3}>
            <Layout cardTitle="Status">
              <ItemsStatus entity={project} items={statusItems} />
            </Layout>
            {/* technologies */}
            <Layout cardTitle={t('project.technologies')}>
              <ListSeparatedByComma items={project.get('technologies') || []} />
            </Layout>
            {/* types */}
            <Layout cardTitle={t('project.projectTypes')}>
              <ListSeparatedByComma items={project.get('types') || []} />
            </Layout>
            {/* platforms */}
            <Layout cardTitle={t('platforms')}>
              <ListSeparatedByComma items={project.get('platforms') || []} />
            </Layout>
          </Stack>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default Project;
