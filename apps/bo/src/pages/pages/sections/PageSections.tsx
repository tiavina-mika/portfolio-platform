import { useNavigate } from '@tanstack/react-router';
import { type ReactNode, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import ActionsMenu from '@/components/ActionsMenu';
import Head from '@/components/Head';
import ListWithSelection from '@/components/table/ListWithSelection';
import UserCell from '@/components/UserCell';
import i18n from '@/config/i18n';
import { recycleBinTabOptions } from '@/constants/app.constants';
import SearchPages from '@/containers/pages/pageForms/SearchPages';
import { useProtect } from '@/hooks/useProtect';
import { destroyObjects } from '@/redux/actions/app.action';
import {
  deletePageSection,
  goToPageSection, loadPageSections, togglePageSectionsByIds,
} from '@/redux/actions/pageSection.action';
import { deletePageSectionsSlice, getPageSectionCountSelector, getPageSectionsSelector } from '@/redux/reducers/page.reducer';
import { getSettingsLocaleSelector } from '@/redux/reducers/settings.reducer';
import { pageSectionsRoute } from '@/routes/protected/pageSection.routes';
import { IQueriesInput, IRenderSearchProps, ITableHeadCell } from '@/types/app.type';
import { IPage as IPageSection, IPageTranslatedFields } from '@/types/page.type';
import { isCurrentTab } from '@/utils/app.utils';
import { displayDate } from '@/utils/date.utils';
import { getTranslatedField } from '@/utils/settings.utils';

interface IData {
  title: string;
  description: string;
  user: string;
  createdAt: string;
  updatedAt: string;
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
    id: 'createdAt',
    label: i18n.t('common:createdAt'),
    align: 'right',
  },
  {
    id: 'updatedAt',
    label: i18n.t('common:updatedAt'),
    align: 'right',
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
  const searchParams = pageSectionsRoute.useSearch();

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
      const title = getTranslatedField<IPageTranslatedFields>(section.get('translated'), locale, 'title');
      const description = getTranslatedField<IPageTranslatedFields>(section.get('translated'), locale, 'description');

      // default data
      const data: Record<string, any> = {
        id: section.id, // required even if not displayed
        description,
        title,

        user: <UserCell user={section.get('user')} />,
        createdAt: displayDate(section.createdAt, false, true),
        updatedAt: displayDate(section.updatedAt, false, true),
        actions: isRecycleBin
          ? (
            <ActionsMenu
              label={description}
              type="icon"
              onDestroy={() => handleDestroy(section.id)}
              onPreview={() => handlePreview(section.id)}
            />
          )
          : (
            <ActionsMenu
              label={description}
              type="icon"
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
    canEdit,
    canDestroy,
    searchParams?.tab,
  ]);

  return (
    <>
      <Head title="Pages" />
      <ListWithSelection<IData>
        canDelete={canDelete}
        canDestroy={canDestroy}
        canUpdate={canEdit}
        count={count}
        defaultFilters={searchParams}
        headCells={headCells}
        items={dataTable}
        renderFilter={(prop: IRenderSearchProps) => <SearchPages {...prop} />}
        tabs={recycleBinTabOptions}
        onDeleteSelected={handleDeleteSelected}
        onUpdateData={handleUpdateData}
      />
    </>
  );
};

export default PageSections;
