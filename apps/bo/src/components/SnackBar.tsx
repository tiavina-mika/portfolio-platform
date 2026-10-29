
import MuiAlert, { type AlertColor, type AlertProps } from '@mui/material/Alert';
import MUISnackbar from '@mui/material/Snackbar';
import { forwardRef, SyntheticEvent } from 'react';

const Alert = forwardRef<HTMLDivElement, AlertProps>((props, ref) => (
  <MuiAlert
    ref={ref}
    elevation={6}
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
  const handleClose = (_?: SyntheticEvent | Event, reason?: string) => {
    // eslint-disable-next-line @cspell/spellchecker
    if (reason === 'clickaway') {
      return;
    }

    toggle();
  };

  return (
    <MUISnackbar autoHideDuration={duration} open={open} onClose={handleClose}>
      <Alert
        severity={severity}
        sx={{
          width: '100%',
          '& .MuiAlert-message, & .MuiAlert-icon, & .MuiButtonBase-root': { color: '#fff' },
        }}
        onClose={handleClose}
      >
        {message}
      </Alert>
    </MUISnackbar>
  );
};

export default SnackBar;
