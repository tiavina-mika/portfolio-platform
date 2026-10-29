import {
  Alert as MuiAlert, Box, Typography, useTheme, type AlertColor, type AlertProps, type SnackbarCloseReason,
} from '@mui/material';
import MUISnackbar from '@mui/material/Snackbar';
import { ComponentType, forwardRef, SyntheticEvent } from 'react';

import {
  AlertErrorIcon, AlertInfoIcon, AlertSuccessIcon, AlertWarningIcon, type AlertIconProps,
} from '@/components/icons/AlertIcons';
import {
  FONT_SIZE_BODY, FONT_SIZE_META, RADIUS_LG, SNACKBAR_ICON_BADGE_SIZE, SNACKBAR_ICON_STROKE_WIDTH,
  SNACKBAR_WIDTH,
} from '@/constants/_core/ui/ui.constants';
import { getSeverityToneColor } from '@/utils/_core/theme/styles.utils';
import { getDesignTokens, getTintedBackground } from '@/utils/_core/theme/tokens.utils';

const SEVERITY_ICONS: Record<AlertColor, ComponentType<AlertIconProps>> = {
  success: AlertSuccessIcon,
  info: AlertInfoIcon,
  warning: AlertWarningIcon,
  error: AlertErrorIcon,
};

/**
 * Round tinted disc holding the severity glyph. A toast is a neutral surface card, so unlike an
 * inline alert the color lives entirely in this badge instead of in the card's text and border.
 */
const ToastIcon = ({ severity }: { severity: AlertColor }) => {
  const theme = useTheme();
  const Icon = SEVERITY_ICONS[severity];

  return (
    <Box
      sx={{
        width: SNACKBAR_ICON_BADGE_SIZE,
        height: SNACKBAR_ICON_BADGE_SIZE,
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        color: getSeverityToneColor(theme, severity),
        backgroundColor: getTintedBackground(theme, theme.palette[severity].main),
      }}
    >
      <Icon strokeWidth={SNACKBAR_ICON_STROKE_WIDTH} />
    </Box>
  );
};

const Alert = forwardRef<HTMLDivElement, AlertProps>((props, ref) => (
  <MuiAlert
    ref={ref}
    variant="outlined"
    {...props}
  />
));

type Props = {
  open?: boolean;
  toggle: () => void;
  message: string;
  /** secondary line under the message — the context of the event (route, reason, entity) */
  description?: string;
  severity: AlertColor;
  duration?: number;
};

const SnackBar = ({
  open, toggle, message, description, duration = 6000, severity = 'success',
}: Props) => {
  const theme = useTheme();
  const tokens = getDesignTokens(theme);

  const handleClose = (_?: SyntheticEvent | Event | null, reason?: SnackbarCloseReason) => {
    if (reason === 'clickaway') {
      return;
    }

    toggle();
  };

  return (
    <MUISnackbar autoHideDuration={duration} onClose={handleClose} open={open}>
      <Alert
        icon={<ToastIcon severity={severity} />}
        onClose={handleClose}
        severity={severity}
        sx={{
          width: SNACKBAR_WIDTH,
          maxWidth: '100%',
          alignItems: 'center',
          padding: '12px 14px',
          borderRadius: `${RADIUS_LG}px`,
          /*
           * the outlined variant tints border and text with the severity color — a toast keeps the
           * neutral card chrome instead and lets the badge carry the status
           */
          color: 'text.primary',
          backgroundColor: 'background.paper',
          borderColor: tokens.border,
          boxShadow: tokens.shadowPopover,
          '& .MuiAlert-action .MuiIconButton-root': { color: tokens.textMuted },
        }}
      >
        <Typography sx={{ fontSize: FONT_SIZE_BODY, fontWeight: 600 }}>{message}</Typography>
        {description && (
          <Typography sx={{ fontSize: FONT_SIZE_META, color: tokens.textSecondary }}>
            {description}
          </Typography>
        )}
      </Alert>
    </MUISnackbar>
  );
};

export default SnackBar;
