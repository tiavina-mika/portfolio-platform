import { DOMAIN_COLLECTIONS } from '@shared/domain-constants';
import { ClientKindEnum, ClientStatusEnum } from '@shared/domain-types';

import type { StatusTone } from '@/utils/_core/theme/styles.utils';

import i18n from '@/config/i18n';
import { IListTabValue, ISelectOption } from '@/types/_core/app.type';

export const CLIENT_COLLECTION = DOMAIN_COLLECTIONS.client;

// the list scoped on a status; the generic "All" tab before them lists every client
export const CLIENT_TAB_OPTIONS: IListTabValue[] = [
  {
    label: i18n.t('project:client.statuses.active'),
    tab: i18n.t('route:clientTabs.active'),
    key: 'status',
    value: ClientStatusEnum.ACTIVE,
  },
  {
    label: i18n.t('project:client.statuses.archived'),
    tab: i18n.t('route:clientTabs.archived'),
    key: 'status',
    value: ClientStatusEnum.ARCHIVED,
  },
];

export const CLIENT_KIND_OPTIONS: ISelectOption<ClientKindEnum>[] = [
  { label: i18n.t('project:client.kinds.company'), value: ClientKindEnum.COMPANY },
  { label: i18n.t('project:client.kinds.individual'), value: ClientKindEnum.INDIVIDUAL },
];

// what the form sends: the server refuses any other field (status, dates, id) in the same call
export const CLIENT_INPUT_FIELDS = ['name', 'kind', 'email', 'phone', 'address', 'taxId', 'notes'];

// the lines of a postal address, in the order they are written on an envelope
export const CLIENT_ADDRESS_FIELDS = ['line1', 'line2', 'postalCode', 'city', 'country'] as const;

export const CLIENT_FORM_ID = 'client-form';

// how many active clients a client picker (the quote form's) proposes for what is typed
export const CLIENT_PICKER_OPTIONS_LIMIT = 20;

// the tint of each status in the list, in the dot language every other list uses for a state
export const CLIENT_STATUS_TONES: Record<ClientStatusEnum, StatusTone> = {
  [ClientStatusEnum.ACTIVE]: 'success',
  [ClientStatusEnum.ARCHIVED]: 'default',
  [ClientStatusEnum.ANONYMIZED]: 'default',
};
