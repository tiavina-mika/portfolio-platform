import { useSnackbar } from 'notistack';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import i18n from '@/config/i18n';
import {
  getAppCurrentUserSelector, removeDownloadAlertSlice, setDownloadAlerts, setErrorSlice,
} from '@/redux/reducers/app.reducer';
import { getSettingsLocaleSelector } from '@/redux/reducers/settings.reducer';
import { Locale } from '@/types/setting.type';
import { uploadFilesAPI } from '@/utils/file.utils';

type Props = {
  folder: string;
  action: any;
};
export const useUploadEditorImage = ({
  folder, action,
}: Props) => {
  const dispatch = useDispatch();
  const currentUser = useSelector(getAppCurrentUserSelector);
  const defaultLocale = useSelector(getSettingsLocaleSelector);
  const {
    closeSnackbar,
  } = useSnackbar();

  /**
   * this is directly called from the editor to upload an image
   * this will upload the image to cloudinary and save the file in the editorTempFiles
   * this will return the src and id of the uploaded image
   * and display it in the editor after the upload
   * @param locale
   * @returns function
   */
  const uploadEditorImage = (locale: Locale = defaultLocale) => async (file: File) => {
    const id = (file.lastModified + '' + file.size) || uuidv4();
    const label = `${i18n.t('uploading')} ${file.name} ...`;
    const message = locale
      ? `[${locale}] ${label}`
      : label;

    try {
      dispatch(setDownloadAlerts({ message, id }));

      // 1. upload the file to cloud (via API)
      const cloudFiles = await uploadFilesAPI({
        folder,
        sessionToken: currentUser.getSessionToken(),
        files: [file],
        locale,
      });

      const cloudFile = cloudFiles[0];

      /**
       *  2. save the temporary file to the store
       * NOTE: it will be save to the article after the form is submitted
       * then it will be deleted from the temp files store
       */
      if (action) {
        dispatch(action({ ...cloudFile, locale }));
      }

      // 3. the uploaded url will be displayed in the editor
      return {
        src: cloudFile.url,
        id: cloudFile.publicId,
      };
    }
    catch (error) {
      dispatch(setErrorSlice((error as Error).message));
    }
    finally {
      // clear the download alert
      closeSnackbar(id);
      dispatch(removeDownloadAlertSlice(id));
    }
  };

  return { uploadEditorImage };
};
