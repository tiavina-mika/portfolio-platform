import {
  AppBar, Box, Dialog as MUIDialog, type DialogProps, IconButton, Theme, Toolbar,
  Typography,
} from '@mui/material';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { MouseEventHandler, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { AlertCloseIcon, AlertErrorIcon } from '@/components/icons/AlertIcons';
import {
  DIALOG_CLOSE_BUTTON_SIZE, DIALOG_CLOSE_ICON_SIZE, DIALOG_FULLSCREEN_TOOLBAR_HEIGHT,
  DIALOG_PADDING, DIALOG_SEVERITY_ICON_SIZE, DIALOG_SUB_HEADER_PADDING_TOP, FONT_SIZE_CARD_TITLE,
} from '@/constants/_core/ui/ui.constants';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

const classes = {
  closeButton: (theme: Theme) => ({
    width: DIALOG_CLOSE_BUTTON_SIZE,
    height: DIALOG_CLOSE_BUTTON_SIZE,
    color: getDesignTokens(theme).textSecondary,
    '&.Mui-disabled': { color: getDesignTokens(theme).textDisabled },
  }),
  // the destructive glyph leads the sentence, so it stays pinned to the first line of the copy
  severityIcon: (theme: Theme) => ({
    display: 'flex',
    flexShrink: 0,
    marginTop: 1,
    color: theme.palette.error.main,
  }),
  severityDescription: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
  } as const,
  /*
   * the full-screen header is a neutral toolbar sitting on the dialog surface, not a colored app
   * bar — the close cross on its left edge is what dismisses the dialog
   */
  fullScreenAppBar: (theme: Theme) => ({
    backgroundColor: getDesignTokens(theme).surface,
    borderBottom: `1px solid ${getDesignTokens(theme).border}`,
  }),
  fullScreenToolbar: {
    minHeight: DIALOG_FULLSCREEN_TOOLBAR_HEIGHT,
    height: DIALOG_FULLSCREEN_TOOLBAR_HEIGHT,
    gap: 12,
    paddingInline: 16,
  },
  fullScreenTitle: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  } as const,
  // the toolbar title reads at the same weight and size as the compact header's title
  fullScreenTitleText: (theme: Theme) => ({
    fontSize: FONT_SIZE_CARD_TITLE,
    fontWeight: theme.typography.fontWeightBold,
  }),
  /*
   * a strip pinned between the header and the part that scrolls: a tab bar swapping what the body
   * shows has to stay in reach however far that body has been scrolled, exactly as the footer does
   * — and it hangs off the header's own edge, so it takes no border of its own
   */
  subHeader: { padding: `${DIALOG_SUB_HEADER_PADDING_TOP}px ${DIALOG_PADDING}px 0` },
  /*
   * a footer the caller draws itself stacks rather than lines up on the right: what replaces the
   * default row is a decision block — a warning the reader has to read before the actions under it
   * — and its buttons share the width, since none of them is the expected way out
   */
  customActions: {
    flexDirection: 'column' as const,
    alignItems: 'stretch' as const,
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
  onResetAction?: () => void;
  resetButtonText?: string;
  formId?: string;
  children?: ReactNode;
  /*
   * the footer, when the default row of cancel/confirm buttons is not what the dialog closes on —
   * a screen ruling on something offers the rulings themselves, and there is no "confirm" among
   * them. It owns its own layout: the slot only stacks what it is given.
   */
  actions?: ReactNode;
  /*
   * a strip standing under the header and above what scrolls — the tabs of a dialog whose body has
   * more than one side to it. Left out by every dialog that shows a single panel.
   */
  subHeader?: ReactNode;
  onClick?: MouseEventHandler<HTMLDivElement>;
  loading?: boolean;
  /* the cross is what dismisses the dialog, so it only shows when there is something to close it with */
  withCloseButton?: boolean;
  withCancelButton?: boolean;
  /*
   * refuses the confirmation while what the dialog holds is not something to confirm — a dialog
   * that asks for a value has to be able to say the value is not one yet
   */
  primaryButtonDisabled?: boolean;
  buttonColor?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  /*
   * the native title attribute is dropped from what a caller may pass: this dialog's own title is a
   * block of several lines, and intersected with the DOM attribute of the same name it would have
   * to be a string — which is why every caller passing a node used to cast it away
   */
} & Omit<DialogProps, 'title'>;

const Dialog = ({
  title,
  description,
  open,
  toggle,
  onPrimaryButtonAction,
  primaryButtonText,
  secondaryButtonText,
  onResetAction,
  resetButtonText,
  formId,
  maxWidth,
  onClick,
  loading,
  children,
  actions,
  subHeader,
  withCloseButton = true,
  withCancelButton = true,
  primaryButtonDisabled = false,
  buttonColor = 'primary',
  ...dialogProps
}: Props) => {
  const {
    t,
  } = useTranslation();

  /*
   * a destructive confirmation announces itself with an error glyph next to the copy — the red
   * primary button alone is easy to miss once the user is already scanning the sentence
   */
  const isDestructive = buttonColor === 'error';

  const handlePrimaryButtonAction = () => {
    if (onPrimaryButtonAction) onPrimaryButtonAction();
    if (!toggle) return;
    toggle();
  };

  const closeIcon = (
    <IconButton
      aria-label="close"
      css={classes.closeButton}
      disabled={loading}
      onClick={toggle}
    >
      <AlertCloseIcon size={DIALOG_CLOSE_ICON_SIZE} />
    </IconButton>
  );

  return (
    <MUIDialog
      {...dialogProps}
      aria-describedby="alert-dialog-description"
      aria-labelledby="alert-dialog-title"
      maxWidth={maxWidth}
      onClick={onClick}
      onClose={toggle}
      open={!!open}
    >
      {/*  ------------- full screen ------------- */}
      {dialogProps.fullScreen
        ? (
          <AppBar
            color="transparent"
            css={classes.fullScreenAppBar}
            elevation={0}
            position="relative"
          >
            <Toolbar disableGutters css={classes.fullScreenToolbar}>
              {closeIcon}
              <Box css={classes.fullScreenTitle}>
                <Typography component="div" css={classes.fullScreenTitleText}>
                  {title}
                </Typography>
                {description && <Typography variant="body2">{description}</Typography>}
              </Box>
              {/* submit */}
              <Button
                color={buttonColor}
                form={formId}
                loading={loading}
                onClick={formId ? undefined : handlePrimaryButtonAction}
                type={formId ? 'submit' : 'button'}
                variant="contained"
              >
                {primaryButtonText ?? t('save')}
              </Button>
            </Toolbar>
          </AppBar>
        ) : (
          <DialogTitle id="alert-dialog-title">
            {typeof title === 'string' ? <span>{title}</span> : title}
            {withCloseButton && toggle && closeIcon}
          </DialogTitle>
        )}
      {!dialogProps.fullScreen && subHeader && <Box css={classes.subHeader}>{subHeader}</Box>}
      <DialogContent>
        {/* description */}
        {description && !dialogProps.fullScreen && (
          <Box css={isDestructive ? classes.severityDescription : undefined}>
            {isDestructive && (
              <Box component="span" css={classes.severityIcon}>
                <AlertErrorIcon size={DIALOG_SEVERITY_ICON_SIZE} />
              </Box>
            )}
            <DialogContentText id="alert-dialog-description">{description}</DialogContentText>
          </Box>
        )}

        {/* main content */}
        {children}
      </DialogContent>
      {/*  ------------- normal screen ------------- */}
      {!dialogProps.fullScreen && actions && (
        <DialogActions css={classes.customActions}>{actions}</DialogActions>
      )}
      {/*
        * a dialog that offers no confirmation, no reset and no way out of its own draws no footer
        * at all: an empty action bar is still a padded band under the body, and reads as a row
        * whose buttons failed to render rather than as a panel that simply has none
        */}
      {!dialogProps.fullScreen && !actions &&
        (onResetAction || withCancelButton || onPrimaryButtonAction) && (
        <DialogActions>
          {/* reset button */}
          {onResetAction && (
            <Button
              color="inherit"
              disabled={loading}
              onClick={onResetAction}
              sx={{ mr: 'auto' }}
            >
              {resetButtonText ?? t('reset')}
            </Button>
          )}

          {/* cancel button */}
          {withCancelButton && (
            <Button color="inherit" disabled={loading} onClick={toggle}>
              {secondaryButtonText ?? t('cancel')}
            </Button>
          )}

          {/* confirm button */}
          {onPrimaryButtonAction && (
            <Button
              color={buttonColor}
              disabled={primaryButtonDisabled}
              loading={loading}
              onClick={handlePrimaryButtonAction}
              variant="contained"
            >
              {primaryButtonText ?? t('confirm')}
            </Button>
          )}

          {/* form button */}
          {formId && (
            <Button
              color={buttonColor}
              disabled={primaryButtonDisabled}
              form={formId}
              loading={loading}
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
