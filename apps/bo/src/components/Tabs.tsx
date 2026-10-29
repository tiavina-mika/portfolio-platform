import { type Theme } from '@emotion/react';
import { Box, Tab, Tabs as MUITabs } from '@mui/material';
import { SyntheticEvent, useEffect, useRef } from 'react';

import {
  FILTER_COUNT_BADGE_FONT_SIZE, FILTER_COUNT_BADGE_PADDING_X, FILTER_COUNT_BADGE_RADIUS,
} from '@/constants/_core/ui/list.constants';
import {
  PANEL_TAB_FONT_SIZE, PANEL_TAB_HEIGHT, PANEL_TAB_LABEL_GAP, PANEL_TAB_PADDING_X, PANEL_TABS_GAP,
} from '@/constants/_core/ui/page.constants';
import {
  BUTTON_TOUCH_HEIGHT, PILL_TABS_PADDING, RADIUS, RADIUS_SM, SPACING,
} from '@/constants/_core/ui/ui.constants';
import { ITabOption } from '@/types/_core/app.type';
import { getAccentTextColor } from '@/utils/_core/theme/styles.utils';
import { getDesignTokens, getTintedBackground } from '@/utils/_core/theme/tokens.utils';

/*
 * The strip that swaps what a panel shows in its body. It stands on the surface it belongs to
 * rather than inside a track of its own: the open slot is raised onto that same ground by its
 * shadow, so a dialog holding it does not gain a second bordered block inside its own edges. An
 * underlined strip would read as navigation, which is exactly what this is not — nothing moves,
 * the same subject is being looked at from another side.
 */
const classes = {
  tabs: (theme: Theme) => ({
    minHeight: 'auto',
    // the raised slot is what marks the open tab — MUI's own indicator rail goes
    '& .MuiTabs-indicator': { display: 'none' },
    '& .MuiTabs-list': { gap: PANEL_TABS_GAP },
    [theme.breakpoints.down('sm')]: { maxWidth: `calc(100vw - ${SPACING * 2}px)` },
  }),
  /*
   * standing on the page rather than inside a card, the strip needs a ground of its own: the open
   * slot is raised onto the card surface, and with nothing recessed behind it there is nothing for
   * it to be raised out of. The track is what the settings and list strips already draw, sized to
   * this strip's own slot rather than to theirs.
   */
  track: (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      display: 'inline-flex',
      alignSelf: 'flex-start',
      maxWidth: '100%',
      padding: PILL_TABS_PADDING,
      borderRadius: `${RADIUS}px`,
      backgroundColor: tokens.surfaceSecondary,
      border: `1px solid ${tokens.border}`,
      // on touch the strip takes the width and its slots share it, so each is a 44px target
      [theme.breakpoints.down('sm')]: { display: 'flex', width: '100%' },
    };
  },
  tab: (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      minHeight: PANEL_TAB_HEIGHT,
      height: PANEL_TAB_HEIGHT,
      padding: `0 ${PANEL_TAB_PADDING_X}px`,
      /*
       * a tab stacks its label into a column by default, which would drop the count onto a second
       * line under the name it belongs to — it reads as part of the label, on the same line
       */
      flexDirection: 'row' as const,
      gap: `${PANEL_TAB_LABEL_GAP}px`,
      fontSize: PANEL_TAB_FONT_SIZE,
      borderRadius: `${RADIUS_SM}px`,
      color: tokens.textMuted,
      transition: theme.transitions.create(['background-color', 'color', 'box-shadow'], {
        duration: theme.transitions.duration.shortest,
      }),
      '&:hover': { color: tokens.text, backgroundColor: tokens.tabHover },
      '&.Mui-selected': {
        color: tokens.text,
        backgroundColor: tokens.surface,
        boxShadow: tokens.shadow,
        fontWeight: theme.typography.fontWeightBold,
      },
      // on touch each slot grows to the minimum target every other control in the app takes
      [theme.breakpoints.down('sm')]: {
        minHeight: BUTTON_TOUCH_HEIGHT,
        height: BUTTON_TOUCH_HEIGHT,
      },
    };
  },
  /*
   * how many items the panel behind the tab holds, as a small tinted pill after the label: it
   * belongs to the word it follows the way "Filtres 3" does, and turns primary on the open slot so
   * the figure the reader is looking at is told apart from the one they could switch to
   */
  count: (isSelected: boolean) => (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      padding: `0 ${FILTER_COUNT_BADGE_PADDING_X}px`,
      borderRadius: FILTER_COUNT_BADGE_RADIUS,
      fontSize: FILTER_COUNT_BADGE_FONT_SIZE,
      fontWeight: theme.typography.fontWeightBold,
      color: isSelected
        ? getAccentTextColor(theme)
        : tokens.textMuted,
      backgroundColor: isSelected
        ? getTintedBackground(theme, theme.palette.primary.main)
        : tokens.surfaceSecondary,
    };
  },
};

type Props = {
  onTabChange: (tab: any) => void;
  tab: any;
  options: ITabOption[];
  /*
   * draws the strip inside a recessed track. A strip standing on the page — over the summary of a
   * detail page — needs it; one sitting inside a card or a dialog does not, that body is already
   * the ground the open slot is raised onto.
   */
  track?: boolean;
  className?: string;
  tabsClassName?: string;
};

const Tabs = ({
  options, tab, onTabChange, className, tabsClassName, track = false,
}: Props) => {
  const currentTabRef = useRef(null);

  useEffect(() => {
    if (!currentTabRef.current) return;
    // the selected tab should always be into the view
    (currentTabRef.current as any)?.scrollIntoView({ behavior: 'auto', block: 'end' });
  }, []);

  const handleTabChange = (_: SyntheticEvent, value: any) => {
    onTabChange(value);
    currentTabRef.current = null;
  };

  const renderLabel = (option: ITabOption) => {
    if (option.count === undefined && !option.adornment) return option.label;

    return (
      <>
        {option.label}
        {option.count !== undefined && (
          <Box component="span" css={classes.count(option.value === tab)}>{option.count}</Box>
        )}
        {option.adornment}
      </>
    );
  };

  return (
    <div className={className}>
      <MUITabs
        aria-label="panel tabs"
        className={tabsClassName}
        onChange={handleTabChange}
        scrollButtons="auto"
        value={tab}
        variant="scrollable"
        css={[classes.tabs, track
          ? classes.track
          : null]}
      >
        {options.map((option: ITabOption, index: number) => (
          <Tab
            disableRipple
            css={classes.tab}
            key={index}
            label={renderLabel(option)}
            value={option.value}
            ref={option.value === tab
              ? currentTabRef
              : null}
          />
        ))}
      </MUITabs>
    </div>
  );
};

export default Tabs;
