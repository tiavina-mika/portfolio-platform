import { Box, Typography } from '@mui/material';
import { alpha, type Theme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

import {
  BUTTON_TOUCH_HEIGHT, RADIUS, RADIUS_LG, ROLE_FORM_NAV_WIDTH,
} from '@/constants/_core/ui/ui.constants';
import {
  FORM_WORKBENCH_ACTIVE_BORDER_OPACITY, FORM_WORKBENCH_BREAKPOINT,
} from '@/constants/_core/ui.constants';
import { useBreakpoint } from '@/hooks/_core/useBreakpoint';
import { getDesignTokens, getTintedBackground } from '@/utils/_core/theme/tokens.utils';

const DOT_SIZE = 8;

const classes = {
  column: (theme: Theme) => ({
    position: 'sticky' as const,
    top: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: theme.spacing(0.5),
    width: ROLE_FORM_NAV_WIDTH,
    padding: theme.spacing(1),
    backgroundColor: getDesignTokens(theme).surface,
    border: `1px solid ${getDesignTokens(theme).border}`,
    borderRadius: RADIUS_LG,
    boxShadow: getDesignTokens(theme).shadow,
  }),
  // under the breakpoint the summary is a row of pills above the section, scrolling rather than wrapping
  row: (theme: Theme) => ({
    display: 'flex',
    gap: theme.spacing(1),
    overflowX: 'auto' as const,
  }),
  item: (isActive: boolean) => (theme: Theme) => ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(1.5),
    width: '100%',
    padding: theme.spacing(1.5),
    font: 'inherit',
    textAlign: 'left' as const,
    color: theme.palette.text.primary,
    cursor: 'pointer',
    borderRadius: RADIUS,
    border: `1px solid ${isActive
      ? alpha(theme.palette.primary.main, FORM_WORKBENCH_ACTIVE_BORDER_OPACITY)
      : 'transparent'}`,
    backgroundColor: isActive
      ? getTintedBackground(theme, theme.palette.primary.main)
      : 'transparent',
    '&:hover': { backgroundColor: isActive ? undefined : getDesignTokens(theme).surfaceSecondary },
  }),
  pill: (isActive: boolean) => (theme: Theme) => ({
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
    gap: theme.spacing(1),
    minHeight: BUTTON_TOUCH_HEIGHT,
    padding: theme.spacing(0, 1.75),
    font: 'inherit',
    fontWeight: theme.typography.fontWeightMedium,
    whiteSpace: 'nowrap' as const,
    color: theme.palette.text.primary,
    cursor: 'pointer',
    borderRadius: BUTTON_TOUCH_HEIGHT / 2,
    border: `1px solid ${isActive
      ? alpha(theme.palette.primary.main, FORM_WORKBENCH_ACTIVE_BORDER_OPACITY)
      : 'transparent'}`,
    backgroundColor: isActive
      ? getTintedBackground(theme, theme.palette.primary.main)
      : 'transparent',
  }),
  dot: (hasErrors: boolean, isActive: boolean) => (theme: Theme) => {
    let color: string = getDesignTokens(theme).textDisabled;

    if (hasErrors) color = theme.palette.error.main;
    else if (isActive) color = theme.palette.primary.main;

    return {
      flex: 'none',
      width: DOT_SIZE,
      height: DOT_SIZE,
      marginTop: theme.spacing(0.75),
      borderRadius: '50%',
      backgroundColor: color,
    };
  },
  text: { display: 'flex', flexDirection: 'column' as const, gap: 0.25, minWidth: 0 },
};

export type RoleFormNavItem<TKey extends string> = {
  key: TKey;
  title: string;
  /** what the section holds right now, read without opening it */
  summary: string;
  /** how many of its fields the schema refuses */
  errorCount: number;
};

type Props<TKey extends string> = {
  items: RoleFormNavItem<TKey>[];
  activeKey: TKey;
  onChange: (key: TKey) => void;
};

/**
 * The summary of the role form: its sections, what each one holds, and which of them still has a
 * field the schema refuses. Only the chosen section is drawn beside it.
 */
const RoleFormNav = <TKey extends string>({ items, activeKey, onChange }: Props<TKey>) => {
  const { t } = useTranslation('user');
  const isSmallScreen = useBreakpoint(FORM_WORKBENCH_BREAKPOINT);

  return (
    <Box
      aria-label={t('role.sections')}
      component="nav"
      css={isSmallScreen
        ? classes.row
        : classes.column}
    >
      {items.map((item) => {
        const isActive = item.key === activeKey;
        const hasErrors = item.errorCount > 0;
        const summary = hasErrors
          ? t('role.fieldsToFix', { count: item.errorCount })
          : item.summary;

        return (
          <button
            key={item.key}
            onClick={() => onChange(item.key)}
            type="button"
            aria-current={isActive
              ? 'true'
              : undefined}
            css={isSmallScreen
              ? classes.pill(isActive)
              : classes.item(isActive)}
          >
            <span css={classes.dot(hasErrors, isActive)} />
            {isSmallScreen
              ? <span>{item.title}</span>
              : (
                <span css={classes.text}>
                  <Typography color={hasErrors ? 'error' : undefined} component="span" variant="subtitle2">
                    {item.title}
                  </Typography>
                  <Typography
                    color={hasErrors ? 'error' : 'text.secondary'}
                    component="span"
                    variant="caption"
                  >
                    {summary}
                  </Typography>
                </span>
              )}
          </button>
        );
      })}
    </Box>
  );
};

export default RoleFormNav;
