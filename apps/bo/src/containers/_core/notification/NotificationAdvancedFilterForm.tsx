import { useTranslation } from 'react-i18next';

import CheckboxesField from '@/components/form/fields/CheckboxesField';
import DateRangeField from '@/components/form/fields/DateRangeField';
import SelectField from '@/components/form/fields/SelectField';
import TextField from '@/components/form/fields/TextField';
import AdvancedSearchForm from '@/components/search/AdvancedSearchForm';
import {
  notificationReadStateOptions, notificationSendTypeOptions, notificationSenderTypeOptions,
} from '@/constants/_core/notification.constants';
import { notificationTypeOptions } from '@/constants/_core/user.constants';
import { NotificationFiltersInput } from '@/types/_core/notification.type';
import { getNotificationStatusOptions } from '@/utils/_core/notification.utils';
import { notificationFilterSchema } from '@/validations/_core/user.validations';

type Props = {
  onSubmit: (values: NotificationFiltersInput) => void;
  /** how many active sends each category holds, stated next to its option */
  typeCounts?: Record<string, number>;
};

/**
 * What an operator narrows a screen of sends by.
 *
 * The panel is built around the two questions this list is opened for. "Did the right people get
 * told" is the category and the read rate; "did it reach them" is the send type, the recipient and
 * the sender. Everything else a row states — its delivery per channel, its message — is read on
 * the row itself rather than filtered on, because a screen of them is scanned, not searched.
 */
const NotificationAdvancedFilterForm = ({
  onSubmit, typeCounts,
}: Props) => {
  const { t } = useTranslation(['common', 'user']);

  /*
   * a category states how much there is under it, including when the current search has narrowed
   * it away to nothing — "there is nothing to find here" is an answer, where an option that simply
   * returns an empty list is a dead end
   */
  const categoryOptions = notificationTypeOptions.map((option) => ({
    ...option,
    label: typeCounts?.[option.value] === undefined
      ? option.label
      : `${option.label} (${typeCounts[option.value]})`,
  }));

  return (
    <AdvancedSearchForm<NotificationFiltersInput>
      onSubmit={onSubmit}
      schema={notificationFilterSchema}
      fields={[
        {
          label: t('user:notifications.category'),
          name: 'type',
          component: (
            <CheckboxesField<string>
              name="type"
              options={categoryOptions}
            />
          ),
        },
        {
          label: t('user:notifications.readRate'),
          name: 'readState',
          component: (
            <CheckboxesField<string>
              name="readState"
              options={notificationReadStateOptions}
            />
          ),
        },
        {
          label: t('user:notifications.sentBetween'),
          name: 'createdAt',
          component: <DateRangeField endDefaultsToToday name="createdAt" />,
        },
        {
          label: t('user:notifications.sendType'),
          name: 'sendType',
          /*
           * one choice, cleared back to "every send" rather than carrying an explicit "all"
           * option: the empty state of a filter already means it is not narrowing anything
           */
          component: (
            <SelectField
              fullWidth
              isClearable
              name="sendType"
              options={notificationSendTypeOptions}
            />
          ),
        },
        {
          label: t('user:notifications.recipient'),
          name: 'to',
          component: (
            <TextField
              fullWidth
              name="to"
              placeholder={t('user:notifications.receiverSearchPlaceholder')}
            />
          ),
        },
        {
          label: t('user:notifications.sender'),
          name: 'senderType',
          component: (
            <SelectField
              fullWidth
              isClearable
              name="senderType"
              options={notificationSenderTypeOptions}
            />
          ),
        },
        {
          label: t('user:notifications.senderName'),
          name: 'from',
          component: (
            <TextField
              fullWidth
              name="from"
              placeholder={t('user:notifications.senderSearchPlaceholder')}
            />
          ),
        },
        /*
         * kept alongside the design's own filters: the status is what the row's leading chip
         * states, and narrowing a month of sends to "ride cancelled" is how a report about one
         * kind of event is put together — the category above only gets as far as "a ride"
         */
        {
          label: t('user:notifications.status'),
          name: 'status',
          component: (
            <SelectField
              fullWidth
              isClearable
              isMulti
              name="status"
              options={getNotificationStatusOptions()}
            />
          ),
        },
      ]}
    />
  );
};

export default NotificationAdvancedFilterForm;
