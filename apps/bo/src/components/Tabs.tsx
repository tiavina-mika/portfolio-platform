
import { cx } from '@emotion/css';
import { type Theme } from '@emotion/react';
import { Tab, Tabs as MUITabs } from '@mui/material';
import { type SyntheticEvent, useEffect, useRef } from 'react';


import { ISelectOption } from '@/types/app.type';
import { SPACING } from '@/utils/constants';

const classes = {
  tabsContainer: (theme: Theme) => ({
    height: 'calc(72px - 12px)',
    backgroundColor: '#fff',
    borderBottom: '1px solid ' + theme.palette.grey[100],
  }),
  tabsContent: (theme: Theme) => ({ [theme.breakpoints.down('sm')]: { maxWidth: `calc(100vw - ${SPACING * 2}px)` } }),
};

type Props = {
  onTabChange: (tab: any) => void;
  tab: any;
  options: ISelectOption[];
  className?: string;
  tabsClassName?: string;
};
const Tabs = ({
  options, tab, onTabChange, className, tabsClassName,
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

  return (
    <div className={cx('stretchSelf', className)} css={classes.tabsContainer}>
      <div css={classes.tabsContent}>
        <MUITabs
          aria-label="scrollable-setting-tabs"
          className={tabsClassName}
          onChange={handleTabChange}
          scrollButtons="auto"
          slotProps={{ indicator: { sx: { display: 'none' } } }}
          value={tab}
          variant="scrollable"
        >
          {options.map((option: ISelectOption, index: number) => (
            <Tab
              className="flex1"
              key={index}
              label={option.label}
              value={option.value}
              ref={option.value === tab
                ? currentTabRef
                : null}
            />
          ))}
        </MUITabs>
      </div>
    </div>
  );
};

export default Tabs;
