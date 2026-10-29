import MuiAlert, { type AlertColor, type AlertProps } from '@mui/material/Alert';
import Snackbar, { type SnackbarCloseReason } from '@mui/material/Snackbar';
import {
  type SyntheticEvent, forwardRef, useEffect, useState,
} from 'react';

const Alert = forwardRef<HTMLDivElement, AlertProps>((props, ref) => (
  <MuiAlert
    elevation={6}
    ref={ref}
    variant="filled"
    {...props}
  />
));

type Props = {
  message: string;
  show: boolean;
  severity?: AlertColor;
};
const Notification = ({
  message, show, severity = 'success',
}: Props) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(show);
  }, [show]);


  const handleClose = (_?: SyntheticEvent | Event | null, reason?: SnackbarCloseReason) => {
    // eslint-disable-next-line @cspell/spellchecker
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  return (
    <Snackbar autoHideDuration={3000} onClose={handleClose} open={open}>
      <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Notification;
