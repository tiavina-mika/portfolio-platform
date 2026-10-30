/**
 * This component is a wrapper around the List component that adds default selection options.
 * If you are not using the extended selection options, you can use the List component directly.
 */
import { useTranslation } from 'react-i18next';

import { useToggle } from '@/hooks/_core/useToggle';
import { IListSelectionAction, IQueriesInput } from '@/types/_core/app.type';
import { isCurrentTab } from '@/utils/_core/app.utils';

import Dialog from '../Dialog';
import List, { ListProps } from './List';

type Props<IDataTable, IQuery> = {
  onDeleteSelected?: (ids: string[]) => void;
  onMarkAsSeenSelected?: (ids: string[], value: boolean) => void;
  /*
   * what the two read/unread entries are called, when "seen" here does not mean what it means
   * everywhere else. The notifications list is the one such case: its bulk action writes the
   * recipient's own read state on their phone, not the back-office queue flag, and under the
   * generic label an admin sorting their queue was rewriting what a user had read.
   */
  markAsSeenLabels?: { seen: string; unseen: string };
  /*
   * switches the ticked rows on or off in one go — omit for the lists whose rows carry no such
   * state, and the two buttons are not drawn at all
   */
  onSetActiveSelected?: (ids: string[], value: boolean) => void;
  canDelete?: boolean;
  enableMultipleSelect?: boolean;
  /*
   * actions the list's own domain adds to the band, drawn before the generic ones. They act on the
   * rows rather than on the queue — retrying the sends a provider refused across a whole selection
   * — which is why they lead: the band reads from what is specific to this list to what every list
   * offers, and ends on the destructive one.
   */
  extraSelectionActions?: IListSelectionAction[];
} & Omit<ListProps<IDataTable, IQuery>, 'selectionOptions'>;

const ListWithSelection = <
  IDataTable extends Record<string, any>,
  // add = to make it optional
  IQuery extends IQueriesInput['filters'] = IQueriesInput['filters']
>({
  onDeleteSelected,
  onMarkAsSeenSelected,
  markAsSeenLabels,
  onSetActiveSelected,
  canDelete,
  canUpdate,
  enableMultipleSelect = true,
  extraSelectionActions = [],
  ...rest
}: Props<IDataTable, IQuery>) => {
  const { t } = useTranslation();
  const {
    open,
    toggle,
  } = useToggle();

  const handleDeleteSelected = (selectedIds: string[], resetSelectedIds: () => void) => () => {
    onDeleteSelected?.(selectedIds);
    resetSelectedIds();
  };

  /*
   * marking rows read is two actions rather than one control holding a value: the band lists what
   * can be done to the selection, and a dropdown standing in it reads as a filter over the list
   * instead. The notification tab holds nothing but unread rows, so only one of the two applies
   * there — offering "mark as unread" on it would be an action that undoes what the tab is for.
   */
  const seenActions: IListSelectionAction[] = [
    {
      label: markAsSeenLabels?.seen ?? t('markAsSeen'),
      onClick: (ids: string[]) => onMarkAsSeenSelected?.(ids, true),
      display: !!onMarkAsSeenSelected,
    },
    {
      label: markAsSeenLabels?.unseen ?? t('markAsUnseen'),
      onClick: (ids: string[]) => onMarkAsSeenSelected?.(ids, false),
      display: !!onMarkAsSeenSelected && !isCurrentTab(rest.defaultFilters?.tab, 'news'),
    },
  ];

  /*
   * switching rows on and off is two actions rather than one control holding a value, for the same
   * reason as the read/unread pair above: the band lists what can be done to the selection, and a
   * dropdown standing in it reads as a filter over the list instead.
   */
  const activeActions: IListSelectionAction[] = [
    {
      label: t('activate'),
      onClick: (ids: string[]) => onSetActiveSelected?.(ids, true),
      display: !!onSetActiveSelected && !!canUpdate,
    },
    {
      label: t('deactivate'),
      onClick: (ids: string[]) => onSetActiveSelected?.(ids, false),
      display: !!onSetActiveSelected && !!canUpdate,
    },
  ];

  return (
    <List<IDataTable>
      canUpdate={canUpdate}
      selectionOptions={enableMultipleSelect
        ? [
          ...extraSelectionActions,
          ...seenActions,
          ...activeActions,
          {
            label: t('delete'),
            onClick: toggle,
            destructive: true,
            display: !!canDelete && !!onDeleteSelected,
            /*
             * renderActionComponent below already makes the selection band skip its auto-reset —
             * the Dialog owns the reset once confirmed
             */
            renderActionComponent: (selectedIds: string[], resetSelectedIds: () => void) => (
              <Dialog
                buttonColor="error"
                description={t('sureToDeleteSelected', { count: selectedIds.length })}
                maxWidth="xs"
                onPrimaryButtonAction={handleDeleteSelected(selectedIds, resetSelectedIds)}
                open={open}
                title={t('delete')}
                toggle={toggle}
              />
            ),
          },
        ]
        : []}
      {...rest}
    />
  );
};

export default ListWithSelection;
