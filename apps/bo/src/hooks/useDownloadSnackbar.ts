import { type SnackbarKey, useSnackbar } from 'notistack';
import { useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';

import { getAppDownloadAlertsSelector } from '@/redux/reducers/app.reducer';
import { ISeverity } from '@/types/app.type';

type Output = {
  downloadSnackbar: (message: string, variant: ISeverity | undefined) => void;
};

/**
 * display snackbar for download alerts
 * vertically stack multiple Snackbars without having to handle their open and close states
 * @returns
 */
export const useDownloadSnackbar = (): Output => {
  const downloadAlerts = useSelector(getAppDownloadAlertsSelector);
  const {
    enqueueSnackbar,
  } = useSnackbar();

  const downloadSnackbar = useCallback(
    (message: string, variant: ISeverity | undefined, key?: string): SnackbarKey => {
      const options: Record<string, any> = {
        anchorOrigin: {
          vertical: 'bottom',
          horizontal: 'left',
        },
        preventDuplicate: true,
      };

      if (variant) {
        options.variant = variant;
      }

      if (key) {
        options.key = key;
      }

      const newKey = enqueueSnackbar(message, options);

      return newKey;
    }, [enqueueSnackbar]);

  useEffect(() => {
    for (const alert of downloadAlerts) {
      downloadSnackbar(alert.message, alert.type, alert.id);
    }
  }, [downloadAlerts, downloadSnackbar]);

  return { downloadSnackbar };
};
