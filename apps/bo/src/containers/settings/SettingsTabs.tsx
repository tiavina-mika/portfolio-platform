import { Tab, Tabs, type Theme } from '@mui/material';
import { type SyntheticEvent } from 'react';


import i18n from '@/config/i18n';
import { ISelectOption } from '@/types/app.type';
import { SettingsTab, SettingsTabEnum } from '@/types/setting.type';

const options = [
  { value: SettingsTabEnum.BO, label: i18n.t('app.backOffice') },
  { value: SettingsTabEnum.APP, label: 'App' },
  { value: SettingsTabEnum.WEBSITE, label: i18n.t('app.website') },
];

const classes = {
  tabs: (theme: Theme) => ({
    backgroundColor: theme.palette.background.paper,
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      width: '100%',
    },
  }),
  tab: (theme: Theme) => ({
    textTransform: 'initial' as const,
    letterSpacing: 1.2,
    '& .MuiTypography-root': { fontSize: 16 },
    [theme.breakpoints.down('sm')]: { flex: 1 },
  }),
};

type Props = {
  onTabChange: (value: SettingsTab) => void;
  tab: SettingsTab;
  className?: string;
};

const SettingsTabs = ({
  onTabChange, tab, className,
}: Props) => {
  const handleTabChange = (_: SyntheticEvent, value: SettingsTab) => {
    onTabChange(value);
  };

  return (
    <Tabs
      aria-label="settings tabs"
      className={className}
      css={classes.tabs}
      value={tab}
      onChange={handleTabChange}
    >
      {options.map((option: ISelectOption, index: number) => (
        <Tab
          key={index}
          label={option.label}
          value={option.value}
        />
      ))}
    </Tabs>
  );
};

export default SettingsTabs;
