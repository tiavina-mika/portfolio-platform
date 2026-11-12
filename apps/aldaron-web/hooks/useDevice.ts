// hooks/useDeviceType.js
import debounce from 'lodash/debounce';
import { useState, useEffect } from 'react';

import { ResponsiveScreens } from '@/types/app.type';

const RESIZE_DEBOUNCE_MS = 100;

export const useDeviceType = (): ResponsiveScreens => {
  const [isDevices, setDeviceType] = useState<ResponsiveScreens>({
    isMobile: true,
    isTablet: false,
    isMobileAndTablet: false,
    isDesktop: false,
  });

  useEffect(() => {
    // Handler to call on window resize
    const handleResize = debounce(() => {
      const width = window.innerWidth;

      if (width <= 768) {
        setDeviceType({
          isMobile: true,
          isTablet: false,
          isMobileAndTablet: true,
          isDesktop: false,
        });
      }
      else if (width <= 1024) {
        setDeviceType({
          isMobile: false,
          isTablet: true,
          isMobileAndTablet: true,
          isDesktop: false,
        });
      }
      else {
        setDeviceType({
          isMobile: false,
          isTablet: false,
          isMobileAndTablet: false,
          isDesktop: true,
        });
      }
    }, RESIZE_DEBOUNCE_MS);

    // Set initial device type
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Remove event listener on cleanup
    return () => {
      handleResize.cancel();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return isDevices;
};
