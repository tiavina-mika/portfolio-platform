import {
  Box, PaletteMode, Tooltip, Typography, type Theme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { FaCheck } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';

import { SIDEBAR_STYLE_OPTIONS, themeColorOptions } from '@/constants/_core/theme.constants';
import {
  SETTINGS_CONTROLS_GAP, SETTINGS_SIDEBAR_CARD_GAP, SETTINGS_SIDEBAR_CARD_MIN_WIDTH,
  SETTINGS_SIDEBAR_CARD_PADDING, SETTINGS_SIDEBAR_PREVIEW_BAR_HEIGHT,
  SETTINGS_SIDEBAR_PREVIEW_BAR_RADIUS, SETTINGS_SIDEBAR_PREVIEW_BAR_SHORT_WIDTH,
  SETTINGS_SIDEBAR_PREVIEW_BAR_WIDTH, SETTINGS_SIDEBAR_PREVIEW_GAP, SETTINGS_SIDEBAR_PREVIEW_HEIGHT,
  SETTINGS_SIDEBAR_PREVIEW_PADDING_X, SETTINGS_SIDEBAR_PREVIEW_PADDING_Y,
  SETTINGS_SWATCH_BORDER_WIDTH, SETTINGS_SWATCH_DOT_SIZE, SETTINGS_SWATCH_ICON_SIZE,
  SETTINGS_SWATCH_SIZE,
} from '@/constants/_core/ui/entity.constants';
import {
  BUTTON_HEIGHT, BUTTON_PADDING_X, RADIUS, RADIUS_SM,
} from '@/constants/_core/ui/ui.constants';
import {
  changeSidebarStyleSlice, changeThemeColorSlice, changeThemeSlice,
  getSettingsSidebarStyleSelector, getSettingsThemeColorSelector, getSettingsThemeSelector,
} from '@/redux/reducers/_core/settings.reducer';
import { IThemeColors, SidebarStyle } from '@/types/_core/setting.type';
import { getDesignTokens, getSidebarTokens, getSoftTintedBackground } from '@/utils/_core/theme/tokens.utils';

import SettingsPanel from './SettingsPanel';
import SettingsRow from './SettingsRow';

const THEME_MODE_OPTIONS: PaletteMode[] = ['light', 'dark'];

const SIDEBAR_STYLE_LABEL_KEYS: Record<SidebarStyle, string> = {
  dark: 'sidebarStyleDark',
  black: 'sidebarStyleBlack',
  light: 'sidebarStyleLight',
  brand: 'sidebarStyleBrand',
};

// the swatch's tick is drawn on the tone itself, which is picked to carry white whatever the hue is
const SWATCH_CHECK_COLOR = '#ffffff';

const classes = {
  controls: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: `${SETTINGS_CONTROLS_GAP}px`,
  },
  // the two modes are one choice stated as two slots, so they stand on the app's own button row
  modeButton: (isSelected: boolean) => (theme: Theme) => ({
    font: 'inherit',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: BUTTON_HEIGHT,
    padding: `0 ${BUTTON_PADDING_X}px`,
    fontSize: theme.typography.button.fontSize,
    color: theme.palette.text.primary,
    border: '1px solid',
    borderRadius: `${RADIUS}px`,
    cursor: 'pointer',
    transition: theme.transitions.create(['background-color', 'border-color']),
    ...(isSelected
      ? {
        fontWeight: theme.typography.fontWeightBold,
        borderColor: theme.palette.primary.main,
        backgroundColor: getSoftTintedBackground(theme, theme.palette.primary.main),
      }
      : {
        fontWeight: theme.typography.fontWeightRegular,
        borderColor: getDesignTokens(theme).border,
        backgroundColor: 'transparent',
        '&:hover': { backgroundColor: getDesignTokens(theme).surfaceSecondary },
      }),
  }),
  /*
   * a colour is picked from the tone itself rather than from its name, so the swatch *is* the tone
   * and the ring standing off it is what says which one is on — the picked swatch grows a halo
   * instead of a thicker edge, which would shift every other swatch on the row
   */
  swatch: (isSelected: boolean, color: string) => (theme: Theme) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: SETTINGS_SWATCH_SIZE,
    height: SETTINGS_SWATCH_SIZE,
    padding: 0,
    background: 'transparent',
    border: `${SETTINGS_SWATCH_BORDER_WIDTH}px solid ${isSelected
      ? color
      : 'transparent'}`,
    borderRadius: '50%',
    cursor: 'pointer',
    transition: theme.transitions.create(['border-color', 'transform']),
    '&:hover': { transform: 'scale(1.08)' },
  }),
  swatchDot: (color: string) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: SETTINGS_SWATCH_DOT_SIZE,
    height: SETTINGS_SWATCH_DOT_SIZE,
    borderRadius: '50%',
    backgroundColor: color,
  }),
  /*
   * a sidebar style is picked from a drawing of the menu rather than from a colour chip: each card
   * holds a miniature of the nav — the ground it would take and two bars standing for its items —
   * so the choice is made on what the menu will look like instead of on the name of a shade
   */
  sidebarCard: (isSelected: boolean) => (theme: Theme) => ({
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: `${SETTINGS_SIDEBAR_CARD_GAP}px`,
    minWidth: SETTINGS_SIDEBAR_CARD_MIN_WIDTH,
    padding: SETTINGS_SIDEBAR_CARD_PADDING,
    border: '1px solid',
    borderRadius: `${RADIUS}px`,
    cursor: 'pointer',
    transition: theme.transitions.create(['background-color', 'border-color']),
    ...(isSelected
      ? {
        borderColor: theme.palette.primary.main,
        backgroundColor: getSoftTintedBackground(theme, theme.palette.primary.main),
      }
      : {
        borderColor: getDesignTokens(theme).border,
        backgroundColor: theme.palette.background.paper,
        '&:hover': { backgroundColor: getDesignTokens(theme).surfaceSecondary },
      }),
  }),
  sidebarPreview: (background: string) => (theme: Theme) => ({
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'flex-end',
    gap: `${SETTINGS_SIDEBAR_PREVIEW_GAP}px`,
    width: '100%',
    height: SETTINGS_SIDEBAR_PREVIEW_HEIGHT,
    padding: `${SETTINGS_SIDEBAR_PREVIEW_PADDING_Y}px ${SETTINGS_SIDEBAR_PREVIEW_PADDING_X}px`,
    borderRadius: `${RADIUS_SM}px`,
    border: `1px solid ${getDesignTokens(theme).border}`,
    backgroundColor: background,
  }),
  sidebarPreviewBar: (color: string, isShort: boolean) => ({
    height: SETTINGS_SIDEBAR_PREVIEW_BAR_HEIGHT,
    width: isShort
      ? SETTINGS_SIDEBAR_PREVIEW_BAR_SHORT_WIDTH
      : SETTINGS_SIDEBAR_PREVIEW_BAR_WIDTH,
    borderRadius: SETTINGS_SIDEBAR_PREVIEW_BAR_RADIUS,
    backgroundColor: color,
  }),
};

/**
 * How the back-office looks for the person signed in: light or dark, the accent every control is
 * tinted from, and the ground the sidebar takes. Each choice applies the moment it is picked.
 */
const SettingsAppearancePanel = () => {
  const {
    t,
  } = useTranslation();
  const dispatch = useDispatch();
  const theme = useSelector(getSettingsThemeSelector);
  const themeColor = useSelector(getSettingsThemeColorSelector);
  const sidebarStyle = useSelector(getSettingsSidebarStyleSelector);

  const handleChangeTheme = (mode: PaletteMode) => dispatch(changeThemeSlice(mode));
  const handleChangeThemeColor = (color: string) => dispatch(changeThemeColorSlice(color));
  const handleChangeSidebarStyle = (style: SidebarStyle) => dispatch(changeSidebarStyleSlice(style));

  return (
    <SettingsPanel>
      {/* light / dark */}
      <SettingsRow fitControl description={t('appearanceDescription')} label={t('themeMode')}>
        <div css={classes.controls}>
          {THEME_MODE_OPTIONS.map((mode: PaletteMode) => (
            <Box
              aria-pressed={theme === mode}
              component="button"
              css={classes.modeButton(theme === mode)}
              key={mode}
              onClick={() => handleChangeTheme(mode)}
              type="button"
            >
              {mode === 'light'
                ? t('light')
                : t('dark')}
            </Box>
          ))}
        </div>
      </SettingsRow>

      {/* the accent every control in the interface is tinted from */}
      <SettingsRow fitControl label={t('themeColors')}>
        <div css={classes.controls}>
          {themeColorOptions.map((colorOption: IThemeColors) => {
            const isSelected = colorOption.name === themeColor;
            const color = (colorOption.colors as any).main;

            return (
              <Tooltip key={colorOption.name} title={t('colors.' + colorOption.name)}>
                <Box
                  aria-label={t('colors.' + colorOption.name)}
                  aria-pressed={isSelected}
                  component="button"
                  css={classes.swatch(isSelected, color)}
                  onClick={() => handleChangeThemeColor(colorOption.name)}
                  type="button"
                >
                  <span css={classes.swatchDot(color)}>
                    {isSelected && <FaCheck color={SWATCH_CHECK_COLOR} size={SETTINGS_SWATCH_ICON_SIZE} />}
                  </span>
                </Box>
              </Tooltip>
            );
          })}
        </div>
      </SettingsRow>

      {/* the ground the sidebar takes */}
      <SettingsRow
        alignTop
        fitControl
        label={t('sidebarStyle')}
        description={theme === 'dark' && sidebarStyle === 'light'
          ? t('sidebarStyleLightFallbackHint')
          : undefined}
      >
        <div css={classes.controls}>
          {SIDEBAR_STYLE_OPTIONS.map((style: SidebarStyle) => {
            // the miniature is drawn from the very tokens the sidebar itself renders with
            const sidebarTokens = getSidebarTokens(theme, style, themeColor);

            return (
              <Box
                aria-pressed={sidebarStyle === style}
                component="button"
                css={classes.sidebarCard(sidebarStyle === style)}
                key={style}
                onClick={() => handleChangeSidebarStyle(style)}
                type="button"
              >
                <span css={classes.sidebarPreview(sidebarTokens.bg)}>
                  <span css={classes.sidebarPreviewBar(sidebarTokens.text, false)} />
                  <span css={classes.sidebarPreviewBar(sidebarTokens.text, true)} />
                </span>
                <Typography variant="subtitle1">{t(SIDEBAR_STYLE_LABEL_KEYS[style])}</Typography>
              </Box>
            );
          })}
        </div>
      </SettingsRow>
    </SettingsPanel>
  );
};

export default SettingsAppearancePanel;
