import type { Dayjs } from 'dayjs';

export type DateType = string | number | Date | Dayjs | null | undefined;

// in database, it's a date type, but Parse Server extract the date with this type
export type ParseServerDate = {
  __type: string;
  iso: Date;
};

// image returned by the upload api
export interface IImageHttpResponse {
  url: string;
  publicId: string;
}

export enum PlatformEnum {
  WEB = 'web',
  BO = 'bo',
  ANDROID = 'android',
  IOS = 'ios'
}

export interface IRights {
  create: boolean;
  find: boolean;
  get: boolean;
  update: boolean;
  delete: boolean;
}

export interface IRightsItem {
  label?: string;
  className: string;
  rights: IRights;
}

export type JobStatusData = {
  objectId: string;
  status: string;
  startDate: string;
  name: string;
  message?: string;
  endDate?: string;
};

export type ParseTriggerValidation = (request: Parse.Cloud.FunctionRequest) => any;
