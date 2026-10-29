'use server';

import { headers } from 'next/headers';
import { UAParser } from 'ua-parser-js';

import { IResponsiveBreakpoints, IUploadedFile } from '@/types/app.type';

type Output = {
  isMobile: boolean;
  isTablet: boolean;
  isMobileAndTablet: boolean;
  isDesktop: boolean;
};

/**
 * Note: this not work on testing it a desktop browser
 * since it always return desktop
 * it work on real operating system (ex: android, ios, mac, etc...)
 * @returns
 */
export const getIsResponsiveScreens = async (): Promise<Output> => {
  if (typeof process === 'undefined') {
    throw new Error(
      '[Server method] you are importing a server-only module outside of server'
    );
  }

  const { get } = await headers();
  const ua = get('user-agent');

  const device = new UAParser(ua || '').getDevice();

  const isMobile = device.type === 'mobile';
  const isTablet = device.type === 'tablet';
  const isMobileAndTablet = isMobile || isTablet;

  // for desktop: @see: https://github.com/faisalman/ua-parser-js/issues/182
  const isDesktop =
    device.type === undefined ||
    !['wearable', 'mobile', 'tablet'].includes(device.type);

  /**
   * Possible device type:
   * console, mobile, tablet, smarttv, wearable, embedded
   */
  return {
    isMobile,
    isTablet,
    isMobileAndTablet,
    isDesktop,
  };
};

/**
 * get the image by the screen size from list of images breakpoints
 * e.g: for mobile, take the smallest image
 * the breakpoints parameter is saved in the database
 * it's generated and saved when the image is uploaded
 * @param breakpoints
 * @returns
 */
export const getImageByBreakpoint = async (
  file: IUploadedFile
): Promise<string> => {
  const breakpoints: IResponsiveBreakpoints[][] = file.responsiveBreakpoints || [];
  // get the screen size (mobile, tablet, desktop)
  const screens = await getIsResponsiveScreens();
  // 1st level
  const firstBreakpoint = breakpoints?.[0] || [];
  // sort by width, from small to large
  const sortedBreakpoints = firstBreakpoint.sort(
    (a: IResponsiveBreakpoints, b: IResponsiveBreakpoints) => a.width - b.width
  );

  // take the first image if it's mobile (smallest screen)
  if (screens.isMobile && sortedBreakpoints.length >= 1)
    return sortedBreakpoints[0].url;
  // take the second image if it's tablet (medium screen)
  if (screens.isTablet && sortedBreakpoints.length >= 2)
    return sortedBreakpoints[1].url;
  // take the third image if it's desktop (largest screen)
  if (sortedBreakpoints.length >= 3) return sortedBreakpoints[2].url;

  if (sortedBreakpoints.length === 0) return file.url;
  // if there is only one image, it's the resized image
  if (sortedBreakpoints.length === 1) return sortedBreakpoints[0].url;
  // mobile by default
  return file.url;
};
