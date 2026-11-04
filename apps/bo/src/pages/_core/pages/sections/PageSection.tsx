import {
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { FaCheck, FaCheckDouble } from 'react-icons/fa';
import {
  FiClock, FiEdit2, FiEye, FiFile, FiFileText, FiLayers, FiToggleRight,
} from 'react-icons/fi';
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
import { ICON_BUTTON_ICON_SIZE } from '@/constants/_core/ui/ui.constants';
import PublishedChip from '@/containers/_core/cms/PublishedChip';
import History from '@/containers/_core/History';
import { useTranslatedValuesByTab } from '@/hooks/_core/useTranslatedValuesByTab';
import SectionBlocksPreview from '@/pages/_core/pages/blocks/SectionBlocksPreview';
import { goToPage } from '@/redux/actions/_core/page.action';
import {
  deletePageSection,
  goToEditPageSection,
  goToPageSections,
  togglePageSectionActive,
} from '@/redux/actions/_core/pageSection.action';
import { getPageSectionSelector } from '@/redux/reducers/_core/page.reducer';
import { IPreviewSection, ISelectOption } from '@/types/_core/app.type';
import { displayDate } from '@/utils/_core/date.utils';
import { getTranslatedField } from '@/utils/_core/settings.utils';


const PageSection = () => {
  const {
    t,
  } = useTranslation(['common', 'user', 'cms']);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const section = useSelector(getPageSectionSelector);

  const {
    translatedFields,
    onTabChange,
    tab,
  } = useTranslatedValuesByTab(section?.translated, ['title', 'description']);

  if (!section) return null;

  const infosItems: ISelectOption[] = [
    {
      label: t('cms:title'),
      value: translatedFields.title,
    },
    {
      label: t('cms:description'),
      value: translatedFields.description,
    },
    {
      label: t('common:createdAt'),
      value: displayDate(section.createdAt),
    },
    {
      label: t('common:updatedAt'),
      value: displayDate(section.updatedAt),
    },
    {
      label: t('common:deletedAt'),
      value: displayDate(section.deletedAt),
      hide: !(section.deletedAt !== undefined),
    },
  ];

  const statusItems: ISelectOption<ReactNode>[] = [
    {
      label: t('common:active'),
      value: <BooleanIcons value={section.active} />,
    },
  ];

  const handleGoToList = () => {
    navigate(goToPageSections());
  };

  const handleDelete = async () => {
    await dispatch(deletePageSection(section.id));
    navigate(goToPageSections());
  };

  const togglePublish = () => {
    dispatch(togglePageSectionActive(section.id, !section.active));
  };

  const goToEdit = (pageId: string, sectionId: string) => {
    navigate(goToEditPageSection(pageId, sectionId));
  };

  const menus = [
    {
      onClick: togglePublish,
      display: true,
      label: section.active
        ? t('cms:noToPublish')
        : t('cms:publish'),
      icon: section.active
        ? <FaCheck />
        : <FaCheckDouble />,
    },
  ];

  const previewSections: IPreviewSection[] = [
    {
      // the pages this section is dropped into
      id: 'pages',
      label: t('cms:pages'),
      icon: <FiFile />,
      content: section.pages?.map((page: any, index: number) => (
        <Stack key={index + page.id} spacing={1}>
          <Stack
            direction="row"
            sx={{
              justifyContent: 'space-between',
            }}
          >
            <Typography>
              {getTranslatedField(page.translated, tab, 'title')}
              &nbsp;
              ({getTranslatedField(page.translated, tab, 'name')})
            </Typography>
            <Stack direction="row" spacing={1}>
              {/* view page preview */}
              <Tooltip title={t('cms:goToPage')}>
                <IconButton onClick={() => navigate(goToPage(page.id))}>
                  <FiEye size={ICON_BUTTON_ICON_SIZE} />
                </IconButton>
              </Tooltip>
              {/* edition */}
              <Tooltip title={t('cms:editSectionForPage', {
                title: getTranslatedField(section.translated, tab, 'title'),
                pageTitle: getTranslatedField(page.translated, tab, 'title') + ' (' + getTranslatedField(page.translated, tab, 'name') + ')',
              })}
              >
                <IconButton onClick={() => goToEdit(page.id, section.id)}>
                  <FiEdit2 size={ICON_BUTTON_ICON_SIZE} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Stack>
      )),
    },
    {
      id: 'details',
      label: t('common:details'),
      icon: <FiFileText />,
      content: <Items items={infosItems} />,
    },
    {
      id: 'blocks',
      label: t('cms:blocks'),
      icon: <FiLayers />,
      helperText: t('cms:blocksHelper'),
      content: <SectionBlocksPreview blocks={section.blocks || []} locale={tab} />,
    },
    {
      id: 'status',
      label: t('common:status'),
      icon: <FiToggleRight />,
      content: <ItemsStatus entity={section} items={statusItems} />,
    },
    {
      id: 'history',
      label: t('common:history'),
      icon: <FiClock />,
      content: (
        <History
          authorFields={CMS_HISTORY_AUTHOR_FIELDS}
          colors={USER_EVENT_COLORS}
          fields={defaultUserEventFields}
          parseObj={section}
          translationKey="project:eventsHistory"
        />
      ),
    },
  ];

  return (
    <Layout
      isCard={false}
      pretitle={t('cms:section')}
      actions={(
        <ActionsMenu
          goToList={handleGoToList}
          label={translatedFields.title}
          menus={menus}
          onDelete={handleDelete}
          type="preview"
        />
      )}
      title={(
        <>
          <span>{translatedFields.title}</span>
          <PublishedChip published={section.active} />
        </>
      )}
    >
      <Head title={translatedFields.title} />
      <PreviewSections
        header={<TranslationTabs fixedOnScroll onTabChange={onTabChange} tab={tab} />}
        sections={previewSections}
      />
    </Layout>
  );
};

export default PageSection;
