import { IconButton, Tooltip } from '@mui/material';
import {
  type ReactNode, useCallback, useMemo, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { FiSend } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';

import ActionsMenu from '@/components/ActionsMenu';
import BooleanIcons from '@/components/BooleanIcons';
import ButtonActions from '@/components/ButtonActions';
import Head from '@/components/Head';
import ListWithSelection from '@/components/table/ListWithSelection';
import i18n from '@/config/i18n';
import { defaultTabOptions } from '@/constants/app.constants';
import SearchContacts from '@/containers/contacts/SearchContacts';
import { useProtect } from '@/hooks/useProtect';
import { destroyObjects, toggleMultiMarkAsSeen } from '@/redux/actions/app.action';
import {
  deleteContact, loadContacts, setContactAsReplied, toggleContactsByIds,
} from '@/redux/actions/contact.action';
import {
  getContactCountSelector, getContactContactsSelector, deleteContactsSlice,
  loadContactsSlice,
} from '@/redux/reducers/contact.reducer';
import { contactsRoute } from '@/routes/protected/contact.routes';
import { IQueriesInput, IRenderSearchProps, ITableHeadCell } from '@/types/app.type';
import {
  IContact,
} from '@/types/contact.type';
import { isCurrentTab } from '@/utils/app.utils';
import { COLLECTIONS } from '@/utils/constants';
import { displayDate } from '@/utils/date.utils';
import { getUserFullName } from '@/utils/user.utils';
import { cutText } from '@/utils/utils';

import ContactPreviewDialog from './ContactPreviewDialog';


interface IData {
  name: string;
  email: string;
  message: string;
  replied: string;
  createdAt: string;
  actions: ReactNode;
}

const headCells: ITableHeadCell<keyof IData>[] = [
  {
    id: 'name',
    label: i18n.t('cms:name'),
  },
  {
    id: 'email',
    label: i18n.t('user:email'),
    align: 'right',
  },
  {
    id: 'message',
    label: i18n.t('user:contacts.message'),
    align: 'left',
  },
  {
    id: 'replied',
    label: i18n.t('user:contacts.replied'),
    align: 'center',
  },
  {
    id: 'createdAt',
    label: i18n.t('user:contacts.sentDate'),
    align: 'right',
  },
  {
    id: 'actions',
    label: 'Actions',
    align: 'right',
  },
];

const collection = 'Contact';

const Contacts = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation(['user']);
  const contacts = useSelector(getContactContactsSelector);

  const [selectedContact, setSelectedContact] = useState<IContact | null>(null);

  const searchParams = contactsRoute.useSearch();

  const count = useSelector(getContactCountSelector);

  const {
    canDelete,
    canDestroy,
  } = useProtect(collection);
  const isRecycleBin = canDestroy && isCurrentTab(searchParams?.tab);

  const handleRowClick = useCallback((id: string) => {
    const newSelectedContact = contacts.find((contact: IContact) => contact.id === id);

    if (!newSelectedContact) return;
    setSelectedContact(newSelectedContact);
  }, [contacts]);

  // destroy objects (in recycle bin)
  const handleDestroy = useCallback(
    (id: string | string[]): void => {
      const options = { collection, messageLabel: t('user:contacts.contacts'), updateListCallback: deleteContactsSlice };

      const ids = Array.isArray(id) ? id : [id];

      dispatch(destroyObjects(ids, options));
    },
    [dispatch, t]
  );

  // delete a row
  const handleDelete = useCallback(
    (article: IContact): void => {
      dispatch(deleteContact(article.id));
    },
    [dispatch]
  );

  // delete selected rows
  const handleDeleteSelected = (ids: string[]) => {
    if (isRecycleBin) {
      handleDestroy(ids);
      return;
    }
    dispatch(toggleContactsByIds(ids, 'deleted', true));
  };

  const handleSelectedAsSeen = (ids: string[], value: boolean) => {
    dispatch(toggleMultiMarkAsSeen<IContact>({
      collection: COLLECTIONS.contact,
      value,
      ids,
      callback: loadContactsSlice,
    }));
  };

  // table data
  const dataTable = useMemo((): IData[] => {
    const isRecycleBin = canDestroy && isCurrentTab(searchParams?.tab);

    const contactsData = contacts.map((contact: IContact) => {
      // default data
      const data: Record<string, any> = {
        id: contact.id, // required even if not displayed
        name: contact.has('user') ? getUserFullName(contact.get('user')) : contact.get('name'),
        email: contact.get('email'),
        message: cutText(contact.get('message'), 100),
        replied: <BooleanIcons value={contact.get('replied')} />,
        createdAt: displayDate(contact.createdAt, true, true),
        actions: isRecycleBin
          ? (
            <ActionsMenu
              label={t('user:contacts.thisMessageOf', { name: contact.get('name') })}
              onDestroy={() => handleDestroy(contact.id)}
              type="icon"
            />
          )
          : (
            <ButtonActions
              value={contact.get('email')}
              onDelete={canDelete
                ? () => handleDelete(contact)
                : undefined}
            >
              <Tooltip title={t('user:contacts.reply')}>
                <IconButton aria-label="reply" onClick={() => handleRowClick(contact.id)}>
                  <FiSend size={20} />
                </IconButton>
              </Tooltip>
            </ButtonActions>
          ),
      };

      return data as IData;
    });

    return contactsData;
  }, [
    contacts,
    handleDelete,
    t,
    handleDestroy,
    handleRowClick,
    canDelete,
    canDestroy,
    searchParams?.tab,
  ]);

  const handleUpdateData = (queries: IQueriesInput) => {
    // the on tab change is not used here, we use it in on page enter with search params
    dispatch(loadContacts(queries));
  };

  const handleClosePreviewDialog = () => setSelectedContact(null);

  const handleIsReplied = () => {
    if (!selectedContact) return;

    dispatch(setContactAsReplied(selectedContact));
  };

  return (
    <>
      <Head title="Contacts" />
      <ListWithSelection<IData>
        canDelete={canDelete}
        canDestroy={canDestroy}
        canUpdate={canDelete}
        count={count}
        defaultFilters={searchParams}
        enableMultipleSelect={!canDestroy}
        headCells={headCells}
        items={dataTable}
        onDeleteSelected={handleDeleteSelected}
        onMarkAsSeenSelected={handleSelectedAsSeen}
        onRowClick={handleRowClick}
        onUpdateData={handleUpdateData}
        renderFilter={(prop: IRenderSearchProps) => <SearchContacts {...prop} />}
        tabs={defaultTabOptions}
      />
      <ContactPreviewDialog
        onChangeIsMessageReplied={handleIsReplied}
        onClose={handleClosePreviewDialog}
        selectedContact={selectedContact}
      />
    </>
  );
};

export default Contacts;
