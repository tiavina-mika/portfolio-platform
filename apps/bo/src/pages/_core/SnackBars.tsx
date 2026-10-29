import { useSelector, useDispatch } from 'react-redux';

import SnackBar from '@/components/SnackBar';
import { useContactMessageAlert } from '@/hooks/_core/useContactMessageAlert';
import { useDownloadSnackbar } from '@/hooks/_core/useDownloadSnackbar';
import {
  clearErrorSlice,
  closeMessageSlice,
  getAppErrorSelector,
  getAppInfoMessageSelector,
  getAppMessageSelector,
} from '@/redux/reducers/_core/app.reducer';

const SnackBars = () => {
  const error = useSelector(getAppErrorSelector);
  const message = useSelector(getAppMessageSelector);
  const infoMessage = useSelector(getAppInfoMessageSelector);

  const dispatch = useDispatch();

  useDownloadSnackbar();
  useContactMessageAlert();

  // clear message or error
  const toggleSnackBar = () => {
    dispatch(clearErrorSlice());
    dispatch(closeMessageSlice());
  };

  return (
    <>
      <SnackBar
        message={error}
        open={!!error}
        severity="error"
        toggle={toggleSnackBar}
      />
      <SnackBar
        message={infoMessage}
        open={!!infoMessage}
        severity="info"
        toggle={toggleSnackBar}
      />
      <SnackBar
        message={message}
        open={!!message}
        severity="success"
        toggle={toggleSnackBar}
      />
    </>
  );
};

export default SnackBars;
