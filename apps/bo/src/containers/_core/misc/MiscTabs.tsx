import { Tab, Tabs, type Theme } from '@mui/material';
import { SyntheticEvent } from 'react';

import { ISelectOption, MiscTab } from '@/types/_core/app.type';

const classes = {
  tabs: (theme: Theme) => ({
    backgroundColor: theme.palette.background.paper,
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      width: '100%',
    },
  }),
};

type Props = {
  onTabChange: (value: MiscTab) => void;
  tab: MiscTab;
  options: ISelectOption<MiscTab>[];
  className?: string;
};

const MiscTabs = ({
  options, tab, onTabChange, className,
}: Props) => {
  const handleTabChange = (_: SyntheticEvent, value: MiscTab) => {
    onTabChange(value);
  };

  return (
    <Tabs
      aria-label="misc tabs"
      className={className}
      css={classes.tabs}
      onChange={handleTabChange}
      value={tab}
    >
      {options.map((option: ISelectOption<MiscTab>, index: number) => (
        <Tab
          key={index}
          label={option.label}
          value={option.value}
        />
      ))}
    </Tabs>
  );
};

export default MiscTabs;
