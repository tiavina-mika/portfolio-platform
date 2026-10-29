import i18n from '@/config/i18n';
import { ISelectOption } from '@/types/_core/app.type';

// what the server's driver wallet list understands — never typed free-hand in a filter
export const DRIVER_WALLET_STATUS_ACTIVE = 'active';
export const DRIVER_WALLET_STATUS_SUSPENDED = 'suspended';
export const DRIVER_WALLET_RATING_LOW = 'low';
export const DRIVER_WALLET_RATING_HIGH = 'high';

export const driverWalletStatusOptions: ISelectOption[] = [
  { label: i18n.t('finance:wallet.active'), value: DRIVER_WALLET_STATUS_ACTIVE },
  { label: i18n.t('finance:wallet.suspended'), value: DRIVER_WALLET_STATUS_SUSPENDED },
];

export const driverWalletRatingOptions: ISelectOption[] = [
  { label: i18n.t('finance:wallet.filter.ratingLow'), value: DRIVER_WALLET_RATING_LOW },
  { label: i18n.t('finance:wallet.filter.ratingHigh'), value: DRIVER_WALLET_RATING_HIGH },
];
