import {
  darken, Tab, Tabs, type Theme,
} from '@mui/material';
import {
  ReactNode, SyntheticEvent, useLayoutEffect, useRef, useState,
} from 'react';

import {
  TRANSLATION_TAB_HEIGHT, TRANSLATION_TAB_INK_DARKEN, TRANSLATION_TAB_LABEL_GAP,
  TRANSLATION_TAB_PADDING_X, TRANSLATION_TAB_PANEL_PADDING, TRANSLATION_TAB_SELECTED_SHADOW,
  TRANSLATION_TAB_TABLET_HEIGHT, TRANSLATION_TABS_GAP, TRANSLATION_TABS_PADDING,
} from '@/constants/_core/ui/entity.constants';
import {
  BUTTON_TOUCH_HEIGHT, FONT_SIZE_META, RADIUS, RADIUS_LG, RADIUS_SM,
} from '@/constants/_core/ui/ui.constants';
import { ISelectOption } from '@/types/_core/app.type';
import { Locale, TranslationState } from '@/types/_core/setting.type';
import { localeOptions } from '@/utils/_core/settings.utils';
import { getMissingTranslationColor } from '@/utils/_core/theme/styles.utils';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

import LocaleTab from './LocaleTab';

const classes = {
  tabsContainer: (fixed: boolean) => (theme: Theme) => {
    if (fixed) {
      return {
        position: 'fixed' as const,
        top: 0,
        zIndex: 10000,
        [theme.breakpoints.down('sm')]: {
          right: 0,
          left: 0,
        },
      };
    }

    return { position: 'relative' as const };
  },
  /*
   * a translated field is one field shown in several languages, so when the strip is handed the
   * fields it switches, both belong to the same bordered block: the strip heads it, the panel under
   * it holds the field
   */
  block: (theme: Theme) => ({
    border: `1px solid ${getDesignTokens(theme).border}`,
    borderRadius: RADIUS_LG,
    overflow: 'hidden',
  }),
  head: (theme: Theme) => ({
    padding: TRANSLATION_TAB_PANEL_PADDING,
    paddingBottom: 0,
    [theme.breakpoints.down('sm')]: { padding: TRANSLATION_TAB_PANEL_PADDING / 2 },
  }),
  /*
   * a recessed track with the open slot raised back onto the surface: the strip switches the
   * language of one field, so it reads as a segmented control rather than as an underlined level of
   * navigation — the theme's rail and indicator both go
   */
  tabs: (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      minHeight: 'auto',
      display: 'inline-flex',
      padding: TRANSLATION_TABS_PADDING,
      borderRadius: `${RADIUS}px`,
      backgroundColor: tokens.surfaceSecondary,
      border: `1px solid ${tokens.border}`,
      boxShadow: 'none',
      '& .MuiTabs-indicator': { display: 'none' },
      '& .MuiTabs-list': { gap: TRANSLATION_TABS_GAP },
      // on a phone the track takes the width and its slots share it
      [theme.breakpoints.down('sm')]: { display: 'flex', width: '100%' },
    };
  },
  tab: (hasError: boolean, isMissing: boolean) => (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      minHeight: TRANSLATION_TAB_HEIGHT,
      height: TRANSLATION_TAB_HEIGHT,
      padding: `0 ${TRANSLATION_TAB_PADDING_X}px`,
      gap: `${TRANSLATION_TAB_LABEL_GAP}px`,
      fontSize: FONT_SIZE_META,
      fontWeight: theme.typography.fontWeightMedium,
      borderRadius: `${RADIUS_SM}px`,
      color: tokens.textSecondary,
      transition: theme.transitions.create(['background-color', 'color', 'box-shadow'], {
        duration: theme.transitions.duration.shortest,
      }),
      '&:hover': { color: tokens.text },
      '&.Mui-selected': {
        color: theme.palette.mode === 'dark'
          ? theme.palette.primary.main
          : darken(theme.palette.primary.main, TRANSLATION_TAB_INK_DARKEN),
        backgroundColor: tokens.surface,
        boxShadow: TRANSLATION_TAB_SELECTED_SHADOW,
        fontWeight: theme.typography.fontWeightMedium,
      },
      // a missing translation keeps its amber on every slot but the open one
      ...(isMissing && { color: getMissingTranslationColor(theme) }),
      ...(hasError && {
        // an error keeps its tone even on the open tab: it is the more urgent of the states
        '&, &.Mui-selected': { color: theme.palette.error.main },
      }),
      [theme.breakpoints.down('md')]: {
        minHeight: TRANSLATION_TAB_TABLET_HEIGHT,
        height: TRANSLATION_TAB_TABLET_HEIGHT,
      },
      [theme.breakpoints.down('sm')]: {
        flex: 1,
        minHeight: BUTTON_TOUCH_HEIGHT,
        height: BUTTON_TOUCH_HEIGHT,
      },
    };
  },
  panel: { padding: TRANSLATION_TAB_PANEL_PADDING },
};

const getTranslationState = (locale: string, missingLocales?: string[]): TranslationState | undefined => {
  if (!missingLocales) return;
  if (missingLocales.includes(locale)) return 'missing';
  return 'translated';
};

type Props = {
  onTabChange: (value: Locale) => void;
  tab: Locale;
  errors?: string[];
  /*
   * locales whose translation is still empty. Left out when the caller has no values to judge by —
   * the slots then carry no translated/missing dot at all rather than claiming every one is done
   */
  missingLocales?: string[];
  className?: string;
  fixedOnScroll?: boolean;
  /*
   * the fields the strip switches. Passed in, they become the panel of the block; left out, the
   * strip is rendered on its own and the caller keeps owning what it stands above
   */
  children?: ReactNode;
};

const TranslationTabs = ({
  onTabChange, tab, errors, missingLocales, className, children, fixedOnScroll = false,
}: Props) => {
  const divToFixedRef = useRef(null);
  const [isFixed, setIsFixed] = useState<boolean>(false);

  // fix the tabs on top when scrolling
  useLayoutEffect(() => {
    if (!fixedOnScroll) return;
    if (!divToFixedRef.current) return;
    const current = divToFixedRef.current as HTMLDivElement;
    const divAnimate = current.getBoundingClientRect().top;
    const onScroll = () => {
      if (divAnimate < window.scrollY) {
        setIsFixed(true);
      }
      else {
        setIsFixed(false);
      }
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [fixedOnScroll]);

  const handleTabChange = (_: SyntheticEvent, value: Locale) => {
    onTabChange(value);
  };

  const tabs = (
    <Tabs
      aria-label="language selection tabs"
      css={classes.tabs}
      onChange={handleTabChange}
      value={tab}
    >
      {localeOptions.map((localeOption: ISelectOption) => {
        const isMissing = !!missingLocales?.includes(localeOption.value);

        return (
          <Tab
            disableRipple
            aria-label={localeOption.label}
            css={classes.tab(!!errors?.includes(localeOption.value), isMissing)}
            key={localeOption.value}
            value={localeOption.value}
            label={(
              <LocaleTab
                label={localeOption.label}
                locale={localeOption.value}
                state={getTranslationState(localeOption.value, missingLocales)}
              />
            )}
          />
        );
      })}
    </Tabs>
  );

  if (!children) {
    return (
      <div className={className} css={classes.tabsContainer(isFixed)} ref={divToFixedRef}>
        {tabs}
      </div>
    );
  }

  return (
    <div className={className} css={[classes.tabsContainer(isFixed), classes.block]} ref={divToFixedRef}>
      <div css={classes.head}>{tabs}</div>
      <div css={classes.panel}>{children}</div>
    </div>
  );
};

export default TranslationTabs;
