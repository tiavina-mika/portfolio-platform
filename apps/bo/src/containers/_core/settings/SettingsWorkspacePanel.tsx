import {
  Box, Typography, useTheme, type Theme,
} from '@mui/material';
import { TargetEnum } from '@shared/types';
import { useTranslation } from 'react-i18next';

import {
  SETTINGS_CONTROLS_GAP, SETTINGS_SIDEBAR_CARD_GAP, SETTINGS_SIDEBAR_CARD_PADDING,
  SETTINGS_WORKSPACE_CARD_MIN_WIDTH, SETTINGS_WORKSPACE_LOGO_HEIGHT,
} from '@/constants/_core/ui/entity.constants';
import { RADIUS } from '@/constants/_core/ui/ui.constants';
import { WORKSPACES } from '@/constants/_core/workspace.constants';
import { useWorkspace } from '@/hooks/_core/useWorkspace';
import { getDesignTokens, getSoftTintedBackground } from '@/utils/_core/theme/tokens.utils';

import SettingsPanel from './SettingsPanel';
import SettingsRow from './SettingsRow';

const classes = {
  controls: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: `${SETTINGS_CONTROLS_GAP}px`,
  },
  // a workspace is picked from its own logo, so the card stands on the same surface the logo is drawn for
  card: (isSelected: boolean) => (theme: Theme) => ({
    font: 'inherit',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: `${SETTINGS_SIDEBAR_CARD_GAP}px`,
    minWidth: SETTINGS_WORKSPACE_CARD_MIN_WIDTH,
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
  logo: { height: SETTINGS_WORKSPACE_LOGO_HEIGHT, maxWidth: '100%' },
};

/**
 * The workspace the back-office works in, picked from the logo of each one. It is a preference of
 * the person signed in, applied the moment it is picked — there is nothing to save. Only the
 * workspaces their roles open are offered, and the page does not draw this panel at all for
 * somebody who has no choice to make.
 */
const SettingsWorkspacePanel = () => {
  const {
    t,
  } = useTranslation();
  const theme = useTheme();
  const {
    workspace, workspaces, setWorkspace,
  } = useWorkspace();

  return (
    <SettingsPanel>
      <SettingsRow fitControl description={t('workspaceDescription')} label={t('workspace')}>
        <div css={classes.controls}>
          {workspaces.map((value: TargetEnum) => {
            const config = WORKSPACES[value];

            return (
              <Box
                aria-pressed={workspace === value}
                component="button"
                css={classes.card(workspace === value)}
                key={value}
                onClick={() => setWorkspace(value)}
                type="button"
              >
                {/* the name is written under the logo, so the logo alone would say it twice */}
                <Box
                  alt=""
                  component="img"
                  css={classes.logo}
                  // the default logo is drawn for a light surface: the dark theme takes the light-ink one
                  src={theme.palette.mode === 'dark' ? config.logo.white : config.logo.default}
                />
                <Typography variant="subtitle1">{t(config.labelKey)}</Typography>
              </Box>
            );
          })}
        </div>
      </SettingsRow>
    </SettingsPanel>
  );
};

export default SettingsWorkspacePanel;
