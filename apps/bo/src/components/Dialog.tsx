
import {
  AppBar, Box, CircularProgress, IconButton, Stack, type Theme, Toolbar, Typography,
} from '@mui/material';
import Button from '@mui/material/Button';
import MUIDialog, { type DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { MouseEventHandler, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { FiX } from 'react-icons/fi';

const classes = {
  dialog: (theme: Theme) => ({
    '& .MuiDialog-root': { padding: theme.spacing(1.5) },
    '& .MuiPaper-root': {
      paddingBottom: 0,
      paddingTop: 0,
    },
    '& .MuiDialogActions-root': { padding: theme.spacing(1) },
  }),
  fullScreenButton: {
    backgroundColor: '#fff',
    '&:hover': { backgroundColor: '#f5f5f5' },
  },
};

type Props = {
  title: string | ReactNode;
  description?: string | ReactNode;
  open?: boolean;
  toggle?: () => void;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryButtonAction?: () => void;
  formId?: string;
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLDivElement>;
  loading?: boolean;
  withCloseButton?: boolean;
  withCancelButton?: boolean;
  buttonColor?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
} & DialogProps;

const Dialog = ({
  title,
  description,
  open,
  toggle,
  onPrimaryButtonAction,
  primaryButtonText,
  secondaryButtonText,
  formId,
  maxWidth,
  onClick,
  loading,
  children,
  withCloseButton = false,
  withCancelButton = true,
  buttonColor = 'primary',
  ...dialogProps
}: Props) => {
  const {
    t,
  } = useTranslation();

  const handlePrimaryButtonAction = () => {
    if (onPrimaryButtonAction) onPrimaryButtonAction();
    if (!toggle) return;
    toggle();
  };

  const closeIcon = (
    <IconButton
      aria-label="close"
      color="inherit"
      edge="start"
      onClick={toggle}
      sx={{ position: 'absolute', right: 0, top: 0 }}
    >
      <FiX />
    </IconButton>
  );

  return (
    <MUIDialog
      {...dialogProps}
      aria-describedby="alert-dialog-description"
      aria-labelledby="alert-dialog-title"
      css={classes.dialog}
      maxWidth={maxWidth}
      onClick={onClick}
      onClose={toggle}
      open={!!open}
    >
      {/*  ------------- full screen ------------- */}
      {dialogProps.fullScreen
        ? (
          <AppBar sx={{ position: 'relative' }}>
            <Toolbar>
              <Box sx={{ ml: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography component="div" variant="h6">
                  {title}
                </Typography>
                {description && <Typography variant="body2">{description}</Typography>}
              </Box>
              <Stack direction="row" spacing={2}>
                {withCancelButton && (
                  <Button css={classes.fullScreenButton} onClick={toggle}>
                    {secondaryButtonText ?? t('cancel')}
                  </Button>
                )}
                {/* submit */}
                <Button
                  color="primary"
                  css={classes.fullScreenButton}
                  form={formId}
                  type="submit"
                  variant="outlined"
                >
                  {primaryButtonText ?? t('save')}
                </Button>
              </Stack>
            </Toolbar>
          </AppBar>
        ) : (
          <DialogTitle className="flexRow spaceBetween center" id="alert-dialog-title">
            {typeof title === 'string' ? <span>{title}</span> : title}
            {withCloseButton && closeIcon}
          </DialogTitle>
        )}
      <DialogContent css={{ paddingTop: '4px !important' }}>
        {/* description */}
        {description && !dialogProps.fullScreen && (
          <DialogContentText id="alert-dialog-description">{description}</DialogContentText>
        )}

        {/* main content */}
        {children}
      </DialogContent>
      {/*  ------------- normal screen ------------- */}
      {!dialogProps.fullScreen && (
        <DialogActions>
          {/* cancel button */}
          {withCancelButton && (
            <Button color="inherit" onClick={toggle} sx={{ textTransform: 'capitalize', fontWeight: 500 }}>
              {secondaryButtonText ?? t('cancel')}
            </Button>
          )}

          {/* confirm button */}
          {onPrimaryButtonAction && (
            <Button
              color={buttonColor}
              onClick={handlePrimaryButtonAction}
              sx={{ textTransform: 'capitalize' }}
              variant="contained"
            >
              {loading
                ? <CircularProgress size={20} />
                : primaryButtonText ?? t('confirm')}
            </Button>
          )}

          {/* form button */}
          {formId && (
            <Button
              color={buttonColor}
              form={formId}
              sx={{ textTransform: 'capitalize' }}
              type="submit"
              variant="contained"
            >
              {primaryButtonText ?? t('save')}
            </Button>
          )}
        </DialogActions>
      )}
    </MUIDialog>
  );
};

export default Dialog;
