import { Dayjs } from 'dayjs';

import { ISelectOption } from './app.type';

export type DateType = string | number | Date | Dayjs | null | undefined;

// in database, it's a date type, but Parse Server extract the date with this type
export interface IParseServerDate {
  __type: string;
  iso: Date;
}

export interface IOnRouteEnterInput {
  params?: any;
  searchParams?: any;
  location?: any;
}

export type PlatformType = 'ios' | 'android' | 'macos' | 'windows' | 'web' | 'native' | 'bo';

export interface ICreatableSelectOption extends Partial<ISelectOption> {
  inputValue?: any;
  disabled?: boolean;
}

export interface IJobStatusAttributes {
  objectId: string;
  status: string;
  startDate: string;
  name: string;
  message?: string;
  endDate: string;
  success: number;
  error: number;
  count: number;
}

export interface IJobStatus extends Parse.User<IJobStatusAttributes> {}
