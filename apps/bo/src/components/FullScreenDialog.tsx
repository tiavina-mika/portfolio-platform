
import { Box } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Slide from '@mui/material/Slide';
import Toolbar from '@mui/material/Toolbar';
import { type TransitionProps } from '@mui/material/transitions';
import Typography from '@mui/material/Typography';
import {
  forwardRef, ReactElement, ReactNode, Ref,
} from 'react';
import { FiX } from 'react-icons/fi';

const Transition = forwardRef((props: TransitionProps & {
  children: ReactElement;
}, ref: Ref<unknown>) => <Slide direction="up" ref={ref} {...props} />);

type Props = {
  title?: string;
  children: ReactNode;
  open?: boolean;
  toggle?: () => void;
  primaryButtonText?: string;
  onPrimaryButtonAction?: () => void;
  formId?: string;
};
const FullScreenDialog = ({
  title,
  open,
  toggle,
  children,
  onPrimaryButtonAction,
  primaryButtonText = 'Save',
  formId,
}: Props) => {
  const handlePrimaryButtonAction = () => {
    if (onPrimaryButtonAction) onPrimaryButtonAction();
    if (!toggle) return;
    toggle();
  };

  return (
    <Dialog
      fullScreen
      onClose={toggle}
      open={!!open}
      slots={{ transition: Transition }}
    >
      <AppBar color="transparent" sx={{ position: 'relative' }}>
        <Toolbar>
          <IconButton
            aria-label="close"
            color="inherit"
            edge="start"
            onClick={toggle}
          >
            <FiX />
          </IconButton>
          <Typography component="div" sx={{ ml: 2, flex: 1 }} variant="h6">
            {title}
          </Typography>
          {onPrimaryButtonAction && (
            <Button color="primary" onClick={handlePrimaryButtonAction} variant="contained">
              {primaryButtonText}
            </Button>
          )}
          {formId && (
            <Button
              color="primary"
              form={formId}
              type="submit"
              variant="contained"
            >
              {primaryButtonText}
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Box sx={{ px: 6, py: 4 }}>
        {children}
      </Box>
    </Dialog>
  );
};

export default FullScreenDialog;
