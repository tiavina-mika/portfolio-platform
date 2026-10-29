import { catchError, responseBody } from '@shared/utils';
import axios from 'axios';


import type { AxiosRequestConfig } from 'axios';

import { getServerUrl } from '@/utils/_core/utils';

/*
 * =================
 * ? The issue: why use a factory instead of a static instance?
 * getServerUrl think that window.LOCAL is undefined because this file get executed
 * before the index.tsx file which initialize all the global variables
 * ? It is maybe an issue with Linux
 * so we need someone to test this with windows (or mac)
 * =================
 */

/*
 * ======
 * the axios instance factory function
 * ======
 */
const createInstance = () =>
  // eslint-disable-next-line import/no-named-as-default-member
  axios.create({ baseURL: getServerUrl() });

/**
 * set api bearer token header
 * @param {boolean} hasFile
 * // session token of the current user
 * @returns
 */
export const protectRequest = (sessionToken: string, hasFile = false): AxiosRequestConfig => {
  return {
    headers: {
      'X-portfolio-key': import.meta.env.VITE_APP_ACCESS_TAG ?? '',
      'X-Parse-Session-Token': sessionToken,
      'Content-Type': hasFile
        ? 'multipart/form-data'
        : 'application/json',
    },
  };
};

export const http = {
  get: <O>(url: string, config?: AxiosRequestConfig): Promise<O> =>
    createInstance().get<O>(url, config).then(responseBody).catch(catchError),
  post: <I, O>(url: string, body: I, config?: AxiosRequestConfig): Promise<O> =>
    createInstance().post<O>(url, body, config).then(responseBody).catch(catchError),
  put: <I, O>(url: string, body: I, config?: AxiosRequestConfig): Promise<O> =>
    createInstance().put<O>(url, body, config).then(responseBody).catch(catchError),
  delete: <O>(url: string, config?: AxiosRequestConfig): Promise<O> =>
    createInstance().delete<O>(url, config).then(responseBody).catch(catchError),
};
