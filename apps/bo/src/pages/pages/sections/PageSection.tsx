import {
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useNavigate } from '@tanstack/react-router';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { FaCheck, FaCheckDouble } from 'react-icons/fa';
import { FiEdit2, FiEye } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';

import ActionsMenu from '@/components/ActionsMenu';
import BooleanIcons from '@/components/BooleanIcons';
import TranslationTabs from '@/components/form/translated/TranslationTabs';
import Head from '@/components/Head';
import Items from '@/components/Items';
import ItemsStatus from '@/components/ItemsStatus';
import Layout from '@/components/layouts/Layout';
import { useTranslatedValuesByTab } from '@/hooks/useTranslatedValuesByTab';
import { goToPage } from '@/redux/actions/page.action';
import {
  deletePageSection,
  goToEditPageSection,
  goToPageSections,
} from '@/redux/actions/pageSection.action';
import { toggleUsersNotification } from '@/redux/actions/user.action';
import { getPageSectionSelector } from '@/redux/reducers/page.reducer';
import { ISelectOption } from '@/types/app.type';
import { PREVIEW_PAGE_GRID } from '@/utils/constants';
import { displayDate } from '@/utils/date.utils';
import { getTranslatedField } from '@/utils/settings.utils';

import SectionBlocksPreview from '../blocks/SectionBlocksPreview';

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
  } = useTranslatedValuesByTab(section?.get('translated'), ['title', 'description']);

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
      value: displayDate(section.get('deletedAt')),
      hide: !section.has('deletedAt'),
    },
  ];

  const statusItems: ISelectOption<ReactNode>[] = [
    {
      label: t('common:active'),
      value: <BooleanIcons value={section.get('active')} />,
    },
  ];

  const handleGoToList = () => {
    navigate(goToPageSections());
  };

  const handleDelete = async () => {
    await dispatch(deletePageSection(section.id));
    navigate(goToPageSections());
  };

  // for notification
  const togglePublish = () => {
    dispatch(toggleUsersNotification([section.id], !section.get('active')));
  };

  const goToEdit = (pageId: string, sectionId: string) => {
    navigate(goToEditPageSection(pageId, sectionId));
  };

  const menus = [
    {
      onClick: togglePublish,
      display: true,
      label: section.get('active')
        ? t('cms:noToPublish')
        : t('cms:publish'),
      icon: section.get('active')
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
          label={translatedFields.title}
          menus={menus}
          onDelete={handleDelete}
        />
      )}
      title={(
        <>
          <span>{t('cms:section')}</span>
          <span css={{ marginRight: 10, marginLeft: 10 }}>-</span>
          <span>{translatedFields.title}</span>
        </>
      )}
    >
      <Head title={translatedFields.title} />
      <Grid container spacing={PREVIEW_PAGE_GRID.spacing}>
        {/* left */}
        <Grid
          size={PREVIEW_PAGE_GRID.left}
        >
          <Stack spacing={3}>
            {/* ------- tabs for translation ------- */}
            <TranslationTabs
              fixedOnScroll
              tab={tab}
              onTabChange={onTabChange}
            />
            {/* pages linked to this section */}
            <Layout cardTitle={t('cms:pages')}>
              {section.get('pages')?.map((page: any, index: number) => (
                <Stack key={index + page.id} spacing={1}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography>
                      {getTranslatedField(page.get('translated'), tab, 'title')}
                      &nbsp;
                      ({getTranslatedField(page.get('translated'), tab, 'name')})
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      {/* view page preview */}
                      <Tooltip title={t('cms:goToPage')}>
                        <IconButton onClick={() => navigate(goToPage(page.id))}>
                          <FiEye size={20} />
                        </IconButton>
                      </Tooltip>
                      {/* edition */}
                      <Tooltip title={t('cms:editSectionForPage', {
                        title: getTranslatedField(section.get('translated'), tab, 'title'),
                        pageTitle: getTranslatedField(page.get('translated'), tab, 'title') + ' (' + getTranslatedField(page.get('translated'), tab, 'name') + ')',
                      })}
                      >
                        <IconButton onClick={() => goToEdit(page.id, section.id)}>
                          <FiEdit2 size={18} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </Stack>
              ))}
            </Layout>
            {/* main infos bloc */}
            <Layout cardTitle={t('common:details')}>
              <Items items={infosItems} />
            </Layout>
            {/* blocks */}
            <SectionBlocksPreview
              blocks={section.get('blocks') || []}
              locale={tab}
            />
          </Stack>
        </Grid>
        {/* right */}
        <Grid
          size={PREVIEW_PAGE_GRID.right}
        >
          <Stack spacing={3}>
            <Layout cardTitle="Status">
              <ItemsStatus entity={section} items={statusItems} />
            </Layout>
          </Stack>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default PageSection;
