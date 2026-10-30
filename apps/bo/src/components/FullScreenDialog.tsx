
import { Box, type Theme } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Slide from '@mui/material/Slide';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import {
  forwardRef, useId, type ComponentProps, type ReactNode, type Ref,
} from 'react';

import { AlertCloseIcon } from '@/components/icons/AlertIcons';
import {
  DIALOG_CLOSE_BUTTON_SIZE, DIALOG_CLOSE_ICON_SIZE, DIALOG_FULLSCREEN_TITLE_GAP,
  DIALOG_FULLSCREEN_TOOLBAR_HEIGHT,
  DIALOG_FULLSCREEN_TOOLBAR_PADDING_Y, FONT_SIZE_CARD_TITLE, FONT_SIZE_OVERLINE,
} from '@/constants/_core/ui.constants';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

// same neutral toolbar as the full-screen variant of Dialog: surface background, single hairline rule
const classes = {
  appBar: (theme: Theme) => ({
    flexShrink: 0,
    backgroundColor: getDesignTokens(theme).surface,
    borderBottom: `1px solid ${getDesignTokens(theme).border}`,
  }),
  // the height is a floor: a pretitle stacked over the title makes the band taller
  toolbar: {
    minHeight: DIALOG_FULLSCREEN_TOOLBAR_HEIGHT,
    gap: 12,
    paddingInline: 16,
    paddingBlock: DIALOG_FULLSCREEN_TOOLBAR_PADDING_Y,
  },
  heading: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: DIALOG_FULLSCREEN_TITLE_GAP,
  },
  pretitle: (theme: Theme) => ({
    fontSize: FONT_SIZE_OVERLINE,
    fontWeight: theme.typography.fontWeightBold,
    letterSpacing: '0.4px',
    textTransform: 'uppercase' as const,
    color: getDesignTokens(theme).textSecondary,
  }),
  closeButton: (theme: Theme) => ({
    width: DIALOG_CLOSE_BUTTON_SIZE,
    height: DIALOG_CLOSE_BUTTON_SIZE,
    color: getDesignTokens(theme).textSecondary,
  }),
  title: (theme: Theme) => ({
    fontSize: FONT_SIZE_CARD_TITLE,
    fontWeight: theme.typography.fontWeightBold,
  }),
  /*
   * the body is what scrolls, under a header and above a footer that both stay in place — a form
   * several screens tall must never scroll its own save action away
   */
  content: (disableGutters: boolean) => (theme: Theme) => ({
    flex: 1,
    minHeight: 0,
    overflowY: 'auto' as const,
    ...(!disableGutters && { padding: theme.spacing(4, 6) }),
  }),
  subheader: { flexShrink: 0 },
  footer: { flexShrink: 0 },
};

const Transition = forwardRef((props: ComponentProps<typeof Slide>, ref: Ref<unknown>) => (
  <Slide direction="up" ref={ref} {...props} />
));

type Props = {
  title?: string;
  /** the kind of record the dialog is about, in small capitals over the title, ex: "Category" */
  pretitle?: string;
  children: ReactNode;
  open?: boolean;
  toggle?: () => void;
  primaryButtonText?: string;
  onPrimaryButtonAction?: () => void;
  formId?: string;
  /** controls standing in the toolbar before the primary button, ex: the language tabs of a preview */
  actions?: ReactNode;
  /**
   * a bar pinned under the body, ex: the actions of a form once the header is too narrow to hold
   * them — it owns its own look, the dialog only keeps it out of the scroll
   */
  footer?: ReactNode;
  /**
   * a band pinned right under the header, ex: controls the header has no room left for on a phone —
   * like the footer it owns its own look and stays out of the scroll
   */
  subheader?: ReactNode;
  /** the body draws its own inset and background, ex: a form laid out on a recessed surface */
  disableGutters?: boolean;
};
const FullScreenDialog = ({
  title,
  pretitle,
  open,
  toggle,
  children,
  onPrimaryButtonAction,
  primaryButtonText = 'Save',
  formId,
  actions,
  footer,
  subheader,
  disableGutters = false,
}: Props) => {
  /*
   * the heading of this dialog is its own band, not a `DialogTitle`, so the name has to be wired by
   * hand: left alone, MUI points the dialog at the id it reserves for a `DialogTitle` that never
   * renders, and the panel opens without a name
   */
  const titleId = useId();

  const handlePrimaryButtonAction = () => {
    if (onPrimaryButtonAction) onPrimaryButtonAction();
    if (!toggle) return;
    toggle();
  };

  return (
    <Dialog
      fullScreen
      aria-labelledby={titleId}
      onClose={toggle}
      open={!!open}
      slots={{ transition: Transition }}
    >
      <AppBar
        color="transparent"
        css={classes.appBar}
        elevation={0}
        position="relative"
      >
        <Toolbar disableGutters css={classes.toolbar}>
          <IconButton
            aria-label="close"
            css={classes.closeButton}
            onClick={toggle}
          >
            <AlertCloseIcon size={DIALOG_CLOSE_ICON_SIZE} />
          </IconButton>
          <div css={classes.heading}>
            {pretitle && <Typography component="div" css={classes.pretitle}>{pretitle}</Typography>}
            <Typography
              noWrap
              component="div"
              css={classes.title}
              id={titleId}
            >
              {title}
            </Typography>
          </div>
          {actions}
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
      {subheader && <div css={classes.subheader}>{subheader}</div>}
      <Box css={classes.content(disableGutters)}>
        {children}
      </Box>
      {footer && <div css={classes.footer}>{footer}</div>}
    </Dialog>
  );
};

export default FullScreenDialog;
