import ButtonBase from '@mui/material/ButtonBase';
import { alpha } from '@mui/material/styles';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import omit from 'lodash/omit';
import { useTranslation } from 'react-i18next';

import type { Theme } from '@mui/material/styles';

import {
  COMPARE_BUTTON_GAP, COMPARE_BUTTON_ICON_HEIGHT, COMPARE_BUTTON_ICON_WIDTH, COMPARE_BUTTON_PADDING_X,
  COMPARE_BUTTON_SELECTED_BORDER_OPACITY, COMPARE_BUTTON_SELECTED_OPACITY,
} from '@/constants/_core/ui/chart.constants';
import { BUTTON_TOUCH_HEIGHT, FONT_SIZE_META, RADIUS } from '@/constants/_core/ui/ui.constants';
import { getAccentTextColor } from '@/utils/_core/theme/styles.utils';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

const classes = {
  button: (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      display: 'inline-flex',
      alignItems: 'center',
      gap: COMPARE_BUTTON_GAP,
      height: BUTTON_TOUCH_HEIGHT,
      padding: `0 ${COMPARE_BUTTON_PADDING_X}px`,
      fontSize: FONT_SIZE_META,
      fontWeight: theme.typography.fontWeightMedium,
      color: tokens.textSecondary,
      backgroundColor: tokens.surface,
      border: `1px solid ${tokens.border}`,
      borderRadius: RADIUS,
      whiteSpace: 'nowrap' as const,
      transition: theme.transitions.create(['background-color', 'border-color', 'color'], {
        duration: theme.transitions.duration.shortest,
      }),
      '&:hover': {
        borderColor: alpha(theme.palette.primary.main, COMPARE_BUTTON_SELECTED_BORDER_OPACITY),
      },
      '&[aria-pressed="true"]': {
        color: getAccentTextColor(theme),
        backgroundColor: alpha(theme.palette.primary.main, COMPARE_BUTTON_SELECTED_OPACITY),
        borderColor: alpha(theme.palette.primary.main, COMPARE_BUTTON_SELECTED_BORDER_OPACITY),
      },
      '&.Mui-focusVisible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 1 },
    };
  },
};

type Props = {
  isComparing?: boolean;
};

/**
 * Switches the previous period on or off behind every trend line of the view. The choice lives in
 * the address (`?isComparing=true`) beside the period, so a reload or a shared link shows the same
 * charts, and it is dropped from the address when off rather than kept as `false`.
 */
const PeriodCompareToggle = ({ isComparing = false }: Props) => {
  const { t } = useTranslation(['statistics']);
  const navigate = useNavigate();
  const router = useRouterState();

  const handleToggle = (): void => {
    const search = omit(router.location.search as Record<string, unknown>, 'isComparing');

    navigate({
      to: router.location.pathname,
      search: isComparing ? search : { ...search, isComparing: true },
    });
  };

  return (
    <ButtonBase aria-pressed={isComparing} css={classes.button} onClick={handleToggle}>
      <svg
        aria-hidden
        fill="none"
        height={COMPARE_BUTTON_ICON_HEIGHT}
        viewBox={`0 0 ${COMPARE_BUTTON_ICON_WIDTH} ${COMPARE_BUTTON_ICON_HEIGHT}`}
        width={COMPARE_BUTTON_ICON_WIDTH}
      >
        <path
          d={`M0 ${COMPARE_BUTTON_ICON_HEIGHT / 2}h${COMPARE_BUTTON_ICON_WIDTH}`}
          stroke="currentColor"
          strokeDasharray="3 3"
          strokeWidth="2"
        />
      </svg>
      {t('statistics:compareWithPreviousPeriod')}
    </ButtonBase>
  );
};

export default PeriodCompareToggle;
