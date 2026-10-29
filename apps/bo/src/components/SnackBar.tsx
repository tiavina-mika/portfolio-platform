
import MuiAlert, { type AlertColor, type AlertProps } from '@mui/material/Alert';
import MUISnackbar, { type SnackbarCloseReason } from '@mui/material/Snackbar';
import { forwardRef, SyntheticEvent } from 'react';

const Alert = forwardRef<HTMLDivElement, AlertProps>((props, ref) => (
  <MuiAlert
    elevation={6}
    ref={ref}
    variant="filled"
    {...props}
  />
));

type Props = {
  open?: boolean;
  toggle: () => void;
  message: string;
  severity: AlertColor;
  duration?: number;
};

const SnackBar = ({
  open, toggle, message, duration = 6000, severity = 'success',
}: Props) => {
  const handleClose = (_?: SyntheticEvent | Event | null, reason?: SnackbarCloseReason) => {
    // eslint-disable-next-line @cspell/spellchecker
    if (reason === 'clickaway') {
      return;
    }

    toggle();
  };

  return (
    <MUISnackbar autoHideDuration={duration} onClose={handleClose} open={open}>
      <Alert
        onClose={handleClose}
        severity={severity}
        sx={{
          width: '100%',
          '& .MuiAlert-message, & .MuiAlert-icon, & .MuiButtonBase-root': { color: '#fff' },
        }}
      >
        {message}
      </Alert>
    </MUISnackbar>
  );
};

export default SnackBar;
