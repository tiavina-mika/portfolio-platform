import {
  IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Stack, Theme, Tooltip,
} from '@mui/material';
import { useState, MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { FaCheck } from 'react-icons/fa';
import { FiGlobe, FiMoon, FiSun } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';

import { locales } from '@/config/i18n';
import { changeSettings } from '@/redux/actions/_core/app.action';
import {
  changeThemeSlice, getSettingsLocaleSelector, getSettingsThemeSelector,
} from '@/redux/reducers/_core/settings.reducer';
import { Locale } from '@/types/_core/setting.type';
import { renderLocaleLabel } from '@/utils/_core/settings.utils';

const classes = {
  root: (theme: Theme) => ({
    position: 'fixed' as const,
    top: 12,
    right: 12,
    zIndex: theme.zIndex.appBar,
    [theme.breakpoints.up('md')]: {
      top: 24,
      right: 24,
    },
  }),
};

const PublicSettingsControls = () => {
  const {
    t,
  } = useTranslation();
  const dispatch = useDispatch();
  const locale = useSelector(getSettingsLocaleSelector);
  const theme = useSelector(getSettingsThemeSelector);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleOpenLocaleMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseLocaleMenu = () => {
    setAnchorEl(null);
  };

  const handleLocaleChange = async (newLocale: Locale) => {
    handleCloseLocaleMenu();
    await dispatch(changeSettings({ locale: newLocale }));
  };

  const handleToggleTheme = () => {
    dispatch(changeThemeSlice(theme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <Stack css={classes.root} direction="row" spacing={0.5}>
      <Tooltip title={t('languages')}>
        <IconButton onClick={handleOpenLocaleMenu} size="small">
          <FiGlobe />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} onClose={handleCloseLocaleMenu} open={Boolean(anchorEl)}>
        {locales.map((localeOption: string) => (
          <MenuItem
            key={localeOption}
            onClick={() => handleLocaleChange(localeOption as Locale)}
            selected={localeOption === locale}
          >
            {localeOption === locale && (
              <ListItemIcon>
                <FaCheck size={14} />
              </ListItemIcon>
            )}
            <ListItemText inset={localeOption !== locale}>
              {renderLocaleLabel(localeOption as Locale)}
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>
      <Tooltip title={theme === 'dark' ? t('light') : t('dark')}>
        <IconButton onClick={handleToggleTheme} size="small">
          {theme === 'dark' ? <FiSun /> : <FiMoon />}
        </IconButton>
      </Tooltip>
    </Stack>
  );
};

export default PublicSettingsControls;
