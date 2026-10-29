
import { Tab, Tabs, type Theme } from '@mui/material';
import {
  type SyntheticEvent, useLayoutEffect, useRef, useState,
} from 'react';


import { ISelectOption } from '@/types/app.type';
import { Locale } from '@/types/setting.type';
import { localeOptions } from '@/utils/settings.utils';

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
  tabs: (theme: Theme) => ({
    backgroundColor: theme.palette.background.paper,
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      width: '100%',
    },
  }),
  tab: (hasError: boolean) => (theme: Theme) => ({
    textTransform: 'initial' as const,
    letterSpacing: 1.2,
    // if there is any error for each tab
    color: hasError
      ? theme.palette.error.main
      : 'inherit',
    '& .MuiTypography-root': { fontSize: 16 },
    [theme.breakpoints.down('sm')]: { flex: 1 },
  }),
};

type Props = {
  onTabChange: (value: Locale) => void;
  tab: Locale;
  errors?: string[];
  className?: string;
  fixedOnScroll?: boolean;
};

const TranslationTabs = ({
  onTabChange, tab, errors, className, fixedOnScroll = false,
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

  return (
    <div css={classes.tabsContainer(isFixed)} ref={divToFixedRef}>
      <Tabs
        aria-label="language selection tabs"
        className={className}
        css={classes.tabs}
        onChange={handleTabChange}
        value={tab}
      >
        {localeOptions.map((localeOption: ISelectOption, index: number) => (
          <Tab
            css={classes.tab(!!errors?.includes(localeOption.value))}
            key={index}
            label={<LocaleTab label={localeOption.label} locale={localeOption.value} />}
            value={localeOption.value}
          />
        ))}
      </Tabs>
    </div>
  );
};

export default TranslationTabs;
