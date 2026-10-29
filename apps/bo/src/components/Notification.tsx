import MuiAlert, { type AlertColor, type AlertProps } from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import {
  type SyntheticEvent, forwardRef, useEffect, useState,
} from 'react';

const Alert = forwardRef<HTMLDivElement, AlertProps>((props, ref) => (
  <MuiAlert
    ref={ref}
    elevation={6}
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


  const handleClose = (_?: SyntheticEvent | Event, reason?: string) => {
    // eslint-disable-next-line @cspell/spellchecker
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  return (
    <Snackbar autoHideDuration={3000} open={open} onClose={handleClose}>
      <Alert severity={severity} sx={{ width: '100%' }} onClose={handleClose}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Notification;
