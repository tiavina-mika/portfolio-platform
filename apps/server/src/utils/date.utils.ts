import dayjs from 'dayjs';

import type { DateType } from '@/types/utils.type';

export const dateToUnix = (date: DateType): number => {
  const unix = dayjs(date).valueOf();

  return unix;
};

export const unixToDate = (unix: number): DateType => {
  const day = dayjs(unix).toDate();

  return day;
};
