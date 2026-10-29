import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import type { Theme } from '@mui/material/styles';

import {
  STATISTICS_RAIL_GAP, STATISTICS_RAIL_ITEM_MIN_HEIGHT, STATISTICS_RAIL_ITEM_PADDING_X,
  STATISTICS_RAIL_PADDING, STATISTICS_RAIL_TITLE_PADDING_BOTTOM, STATISTICS_RAIL_TITLE_PADDING_TOP,
  STATISTICS_RAIL_TITLE_PADDING_X, STATISTICS_STICKY_OFFSET, STATISTICS_TAB_HEIGHT,
  STATISTICS_TAB_PADDING_X, STATISTICS_TABS_GAP, STATISTICS_TABS_SCROLL_PADDING,
} from '@/constants/_core/ui/chart.constants';
import {
  FONT_SIZE_BODY, RADIUS, RADIUS_LG, TOOLBAR_HEIGHT,
} from '@/constants/_core/ui/ui.constants';
import { IStatisticsNavItem, StatisticsViewEnum } from '@/types/_core/statistics.type';
import { getAccentTextColor } from '@/utils/_core/theme/styles.utils';
import { getDesignTokens, getTintedBackground } from '@/utils/_core/theme/tokens.utils';

const getFocusRing = (theme: Theme) => ({
  '&.Mui-focusVisible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 1 },
});

const classes = {
  // pinned under the app bar, so the other views stay one click away however far the charts scroll
  rail: (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      position: 'sticky' as const,
      top: TOOLBAR_HEIGHT + STATISTICS_STICKY_OFFSET,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: STATISTICS_RAIL_GAP,
      padding: STATISTICS_RAIL_PADDING,
      backgroundColor: tokens.surface,
      border: `1px solid ${tokens.border}`,
      borderRadius: RADIUS_LG,
      boxShadow: tokens.shadow,
    };
  },
  railTitle: (theme: Theme) => ({
    padding: `${STATISTICS_RAIL_TITLE_PADDING_TOP}px ${STATISTICS_RAIL_TITLE_PADDING_X}px ${
      STATISTICS_RAIL_TITLE_PADDING_BOTTOM}px`,
    color: getDesignTokens(theme).textMuted,
  }),
  railItem: (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      justifyContent: 'flex-start',
      minHeight: STATISTICS_RAIL_ITEM_MIN_HEIGHT,
      padding: `0 ${STATISTICS_RAIL_ITEM_PADDING_X}px`,
      borderRadius: RADIUS,
      textAlign: 'left' as const,
      fontSize: FONT_SIZE_BODY,
      fontWeight: theme.typography.fontWeightMedium,
      color: tokens.textSecondary,
      '&:hover': { color: tokens.text, backgroundColor: tokens.tabHover },
      '&[aria-current="page"]': {
        color: getAccentTextColor(theme),
        fontWeight: theme.typography.fontWeightBold,
        backgroundColor: getTintedBackground(theme, theme.palette.primary.main),
      },
      ...getFocusRing(theme),
    };
  },
  // the row scrolls rather than wraps: two rows of tabs read as two levels of navigation
  tabs: {
    display: 'flex',
    gap: STATISTICS_TABS_GAP,
    overflowX: 'auto' as const,
    paddingBottom: STATISTICS_TABS_SCROLL_PADDING,
  },
  tab: (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      flexShrink: 0,
      height: STATISTICS_TAB_HEIGHT,
      padding: `0 ${STATISTICS_TAB_PADDING_X}px`,
      borderRadius: RADIUS,
      fontSize: FONT_SIZE_BODY,
      fontWeight: theme.typography.fontWeightMedium,
      whiteSpace: 'nowrap' as const,
      color: tokens.textSecondary,
      backgroundColor: tokens.surface,
      border: `1px solid ${tokens.border}`,
      '&[aria-current="page"]': {
        color: theme.palette.primary.contrastText,
        backgroundColor: theme.palette.primary.main,
        borderColor: theme.palette.primary.main,
      },
      ...getFocusRing(theme),
    };
  },
};

type Props = {
  items: IStatisticsNavItem[];
  value: StatisticsViewEnum;
  onChange: (view: StatisticsViewEnum) => void;
  // a rail beside the content on a wide screen, a row of tabs above it on a narrower one
  variant: 'rail' | 'tabs';
};

/**
 * The views of the statistics section. They live on the page rather than as children of the
 * sidebar entry: six views nested under one entry pushed the rest of the sidebar down, and switching
 * view is something done while reading the charts, not a trip back to the main menu.
 */
const StatisticsNav = ({
  items, value, onChange, variant,
}: Props) => {
  const { t } = useTranslation();

  const handleClick = (view: StatisticsViewEnum) => (): void => {
    if (view === value) return;

    onChange(view);
  };

  if (variant === 'tabs') {
    return (
      <nav aria-label={t('common:statistics')} css={classes.tabs}>
        {items.map((item) => (
          <ButtonBase
            aria-current={item.view === value ? 'page' : undefined}
            css={classes.tab}
            key={item.view}
            onClick={handleClick(item.view)}
          >
            {item.label}
          </ButtonBase>
        ))}
      </nav>
    );
  }

  return (
    <nav aria-label={t('common:statistics')} css={classes.rail}>
      <Typography component="p" css={classes.railTitle} variant="overline">
        {t('common:sidebar.analytics')}
      </Typography>
      {items.map((item) => (
        <ButtonBase
          aria-current={item.view === value ? 'page' : undefined}
          css={classes.railItem}
          key={item.view}
          onClick={handleClick(item.view)}
        >
          {item.label}
        </ButtonBase>
      ))}
    </nav>
  );
};

export default StatisticsNav;
