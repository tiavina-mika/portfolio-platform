import { headers } from 'next/headers';

/**
 * the route pathname is not accessible in the server component
 * so we pass it in the headers to the client
 * the headers are set in the middleware
 * using response.headers.set("x-current-path", request.nextUrl.pathname);
 * e.g. /fr/articles/my-article
 * @returns
 */
export const getSSRCurrentPathname = async (): Promise<string> => {
  const header = await headers();

  return header.get('x-current-path') || '/';
};
