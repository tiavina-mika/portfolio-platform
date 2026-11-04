
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import { CssBaseline, PaletteMode, ThemeProvider } from '@mui/material';
import { ReactNode, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { getSettingsThemeColorSelector, getSettingsThemeSelector } from '@/redux/reducers/_core/settings.reducer';
import { getTheme } from '@/utils/_core/theme/theme.utils';

import { GlobalStyles } from './GlobalStyles';


type Props = {
  children: ReactNode;
};
const MuiThemeProvider = ({
  children,
}: Props) => {
  const theme: PaletteMode = useSelector(getSettingsThemeSelector);
  const themeColor = useSelector(getSettingsThemeColorSelector);
  // building a theme is costly, and the provider re-renders with whatever re-renders the app root
  const currentTheme = useMemo(() => getTheme(theme, themeColor), [theme, themeColor]);

  return (
    <ThemeProvider theme={currentTheme}>
      <EmotionThemeProvider theme={currentTheme}>
        <CssBaseline />
        <GlobalStyles theme={currentTheme} />
        {children}
      </EmotionThemeProvider>
    </ThemeProvider>
  );
};

export default MuiThemeProvider;
