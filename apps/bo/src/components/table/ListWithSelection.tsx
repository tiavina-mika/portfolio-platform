/**
 * This component is a wrapper around the List component that adds default selection options.
 * If you are not using the extended selection options, you can use the List component directly.
 */
import { useTheme } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaTrashAlt } from 'react-icons/fa';
import { FaListCheck } from 'react-icons/fa6';

import { useToggle } from '@/hooks/useToggle';
import { IQueriesInput } from '@/types/app.type';
import { isCurrentTab } from '@/utils/app.utils';
import { wait } from '@/utils/utils';

import Dialog from '../Dialog';
import List, { ListProps } from './List';
import SelectInput from '../form/inputs/SelectInput';


type SeenState = 'seen' | 'unseen' | null;

type Props<IDataTable, IQuery> = {
  onDeleteSelected?: (ids: string[]) => void;
  onMarkAsSeenSelected?: (ids: string[], value: boolean) => void;
  canDelete?: boolean;
  canUpdated?: boolean;
  enableMultipleSelect?: boolean;
} & ListProps<IDataTable, IQuery>;

const ListWithSelection = <
  IDataTable extends Record<string, any>,
  // add = to make it optional
  IQuery extends IQueriesInput['filters'] = IQueriesInput['filters']
>({
  onDeleteSelected,
  onMarkAsSeenSelected,
  canDelete,
  canUpdated,
  enableMultipleSelect = true,
  ...rest
}: Props<IDataTable, IQuery>) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const [selectedSeenOption, setSelectedSeenOption] = useState<SeenState>(null);
  const {
    open,
    toggle,
  } = useToggle();

  const handleMarkAsSeen = (ids: string[], callback: () => void) => async (value: SeenState) => {
    onMarkAsSeenSelected?.(ids, value === 'seen');
    setSelectedSeenOption(value);
    await wait(); // wait for the action to complete

    // clear the selections
    callback();
  };

  return (
    <List<IDataTable>
      selectionOptions={enableMultipleSelect
        ? [
          // no see or unseen option for the notification tab
          isCurrentTab(rest.defaultFilters?.tab, 'news')
            ? {
              onClick: (ids: string[]) => onMarkAsSeenSelected?.(ids, true),
              icon: <FaListCheck size={20} />,
              display: !!onMarkAsSeenSelected,
              label: t('markAsSeen'),
            }
            // can select seen or unseen on "all" tab
            : {
              display: !!onMarkAsSeenSelected,
              // display: canUpdated && !!onMarkAsSeenSelected,
              label: t('markAsSeen'),
              renderTriggerComponent: (selectedIds: string[], resetSelectedIds: () => void) => (
                <SelectInput<SeenState>
                  onChange={handleMarkAsSeen(selectedIds, resetSelectedIds)}
                  placeholder={t('markAsSeen')}
                  styles={{ control: { paddingTop: 0, paddingBottom: 0, fontSize: 14 } }}
                  value={selectedSeenOption}
                  width={150}
                  options={[
                    { label: t('seen'), value: 'seen' },
                    { label: t('unseen'), value: 'unseen' },
                  ]}
                />
              ),
            },
          {
            onClick: toggle,
            icon: (
              <FaTrashAlt
                size={20}
                color={
                  theme.palette.error.main
                }
              />
            ),
            display: !!canDelete && !!onDeleteSelected,
            label: t('delete'),
            renderActionComponent: (selectedIds: string[]) => (
              <Dialog
                description={t('sureToDeleteSelected', { count: selectedIds.length })}
                maxWidth="xs"
                onPrimaryButtonAction={() => onDeleteSelected?.(selectedIds)}
                open={open}
                title={t('delete')}
                toggle={toggle}
              />
            ),
          },
        ] : []}
      {...rest}
    />
  );
};

export default ListWithSelection;
