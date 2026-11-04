import type { AxiosResponse } from 'axios';

// get the data field response directly
// only `data` is read, so the response generics axios adds between releases don't break the signature
export const responseBody = <O>(response: Pick<AxiosResponse<O>, 'data'>) => response.data;

export const catchError = (error: any) => {
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
