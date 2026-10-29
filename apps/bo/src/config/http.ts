import axios from 'axios';

import type { AxiosRequestConfig, AxiosResponse } from 'axios';

import { getServerUrl } from '@/utils/utils';

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
      'X-portfolio-key': import.meta.env.VITE_REST_API_KEY ?? '',
      'X-Parse-Session-Token': sessionToken,
      'Content-Type': hasFile
        ? 'multipart/form-data'
        : 'application/json',
    },
  };
};

// get the data field response directly
const responseBody = <O>(response: AxiosResponse<O>) => response.data;

const catchError = (error: any) => {
  if (error.response) {
    /*
     * The request was made and the server responded with a status code
     * that falls out of the range of 2xx
     */
    const {
      data,
    } = error.response;

    // @see server/src/middlewares/validation.middleware.ts for the structure of the error response
    if (data.details?.length) {
      const {
        message,
      } = data.details[0];

      throw new Error(message);
    }
    else {
      throw new Error(data);
    }
  }
  else if (error.request) {
  // The request was made but no response was received
    throw new Error(error.request);
  }
  else {
  // Something happened in setting up the request that triggered an Error
    throw error;
  }
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
