import { useNavigate } from '@tanstack/react-router';
import { type ReactNode, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import ActionsMenu from '@/components/ActionsMenu';
import Head from '@/components/Head';
import PageHeader from '@/components/layouts/PageHeader';
import DatesCell from '@/components/table/DatesCell';
import ListWithSelection from '@/components/table/ListWithSelection';
import UserCell from '@/components/UserCell';
import i18n from '@/config/i18n';
import { recycleBinTabOptions } from '@/constants/_core/app.constants';
import SearchPages from '@/containers/_core/pages/pageForms/SearchPages';
import { useProtect } from '@/hooks/_core/useProtect';
import { destroyObjects } from '@/redux/actions/_core/app.action';
import {
  deletePageSection,
  goToPageSection, loadPageSections, togglePageSectionsByIds,
} from '@/redux/actions/_core/pageSection.action';
import { deletePageSectionsSlice, getPageSectionCountSelector, getPageSectionsSelector } from '@/redux/reducers/_core/page.reducer';
import { getSettingsLocaleSelector } from '@/redux/reducers/_core/settings.reducer';
import { pageSectionsRoute } from '@/routes/protected/_core/pageSection.routes';
import {
  IQueriesInput, IRenderSearchProps, ITableHeadCell, ITabAndCategorySearchParams,
} from '@/types/_core/app.type';
import { IPageSection } from '@/types/_core/page.type';
import { isCurrentTab } from '@/utils/_core/app.utils';
import { getTranslatedField } from '@/utils/_core/settings.utils';

interface IData {
  title: string;
  description: string;
  user: string;
  dates: ReactNode;
  actions: ReactNode;
}

const headCells: ITableHeadCell<keyof IData>[] = [
  {
    id: 'title',
    label: i18n.t('cms:title'),
    align: 'left',
  },
  {
    id: 'description',
    label: i18n.t('common:description'),
  },
  {
    id: 'user',
    label: i18n.t('cms:author'),
    align: 'right',
  },
  {
    id: 'dates',
    label: `${i18n.t('common:createdAt')} / ${i18n.t('common:updatedAt')}`,
    align: 'right',
    sortFields: [
      { id: 'createdAt', label: i18n.t('common:createdAt') },
      { id: 'updatedAt', label: i18n.t('common:updatedAt') },
    ],
  },
  {
    id: 'actions',
    label: 'Actions',
    align: 'right',
  },
];

const collection = 'Page';

const PageSections = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const sections: any = useSelector(getPageSectionsSelector);
  const locale = useSelector(getSettingsLocaleSelector);

  const count = useSelector(getPageSectionCountSelector);
  const searchParams: ITabAndCategorySearchParams = pageSectionsRoute.useSearch();

  const {
    canDelete,
    canPreview,
    canEdit,
    canDestroy,
  } = useProtect(collection);

  const isRecycleBin = canDestroy && isCurrentTab(searchParams?.tab);

  const {
    t,
  } = useTranslation(['cms']);

  // destroy objects (in recycle bin)
  const handleDestroy = useCallback(
    (id: string | string[]): void => {
      const options = { collection: 'PageSection', messageLabel: t('cms.sections'), updateListCallback: deletePageSectionsSlice };
      const ids = Array.isArray(id) ? id : [id];

      dispatch(destroyObjects(ids, options));
    },
    [dispatch, t]
  );

  // delete a row
  const handleDelete = useCallback(
    (section: IPageSection): void => {
      dispatch(deletePageSection(section.id));
    },
    [dispatch]
  );

  // go to preview page
  const handlePreview = useCallback(
    (id: string): void => {
      navigate(goToPageSection(id));
    },
    [navigate]
  );

  // delete selected rows
  const handleDeleteSelected = (ids: string[]) => {
    if (isRecycleBin) {
      handleDestroy(ids);
      return;
    }
    dispatch(togglePageSectionsByIds(ids, 'deleted', true));
  };

  const handleUpdateData = (queries: IQueriesInput) => {
    // the on tab change is not used here, we use it in on page enter with search params
    dispatch(loadPageSections(queries));
  };

  // table data
  const dataTable = useMemo((): IData[] => {
    const isRecycleBin = canDestroy && isCurrentTab(searchParams?.tab);

    const sectionsData = sections.map((section: IPageSection) => {
      const title = getTranslatedField(section.translated, locale, 'title');
      const description = getTranslatedField(section.translated, locale, 'description');

      // default data
      const data: Record<string, any> = {
        id: section.id, // required even if not displayed
        description,
        title,

        user: <UserCell user={section.user} />,
        dates: <DatesCell createdAt={section.createdAt} updatedAt={section.updatedAt} />,
        actions: isRecycleBin
          ? (
            <ActionsMenu
              label={description}
              onDestroy={() => handleDestroy(section.id)}
              onPreview={() => handlePreview(section.id)}
              type="row"
            />
          )
          : (
            <ActionsMenu
              label={description}
              type="row"
              onDelete={canDelete
                ? () => handleDelete(section)
                : undefined}
              onPreview={canPreview
                ? () => handlePreview(section.id)
                : undefined}
            />
          ),
      };

      return data as IData;
    });

    return sectionsData;
  }, [
    sections,
    handleDelete,
    handlePreview,
    handleDestroy,
    locale,
    canDelete,
    canPreview,
    canDestroy,
    searchParams?.tab,
  ]);

  return (
    <>
      <Head title={t('cms:blocks')} />
      <PageHeader title={t('cms:blocks')} />
      <ListWithSelection<IData>
        canDelete={canDelete}
        canDestroy={canDestroy}
        canUpdate={canEdit}
        count={count}
        defaultFilters={searchParams}
        headCells={headCells}
        items={dataTable}
        onDeleteSelected={handleDeleteSelected}
        onUpdateData={handleUpdateData}
        renderFilter={(prop: IRenderSearchProps) => <SearchPages {...prop} />}
        tabs={recycleBinTabOptions}
      />
    </>
  );
};

export default PageSections;
