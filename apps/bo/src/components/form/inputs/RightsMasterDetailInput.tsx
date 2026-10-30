import {
  Box, Checkbox, Chip, ToggleButton, ToggleButtonGroup, Tooltip, Typography,
} from '@mui/material';
import { alpha, useTheme, type Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Fragment, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  RADIUS, RIGHTS_ACTIVE_BAR_WIDTH, RIGHTS_LIST_MAX_HEIGHT, RIGHTS_LIST_WIDTH, RIGHTS_ROW_MIN_HEIGHT,
} from '@/constants/_core/ui/ui.constants';
import {
  getRightsEntityGroup, RIGHTS_DISPLAY_ORDER, RIGHTS_GROUPS, RIGHTS_PRESETS,
} from '@/constants/_core/user.constants';
import { IRights, IRightsItem, IRole } from '@/types/_core/role.type';
import { canAccessTo } from '@/utils/_core/role.utils';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

type Props = {
  value: IRightsItem[];
  onChange: (options: IRightsItem[]) => void;
  currentUserRoles: IRole[];
  /** the filter typed by the admin, held by the form so its card header can own the search box */
  search: string;
};

type PresetKey = keyof typeof RIGHTS_PRESETS;

const PRESET_KEYS = Object.keys(RIGHTS_PRESETS) as PresetKey[];
const RIGHTS_WITH_HELPER: (keyof IRights)[] = ['delete', 'destroy'];

const getCountChipColor = (checkedCount: number, total: number): 'default' | 'success' | 'warning' => {
  if (checkedCount === 0) return 'default';
  if (checkedCount === total) return 'success';
  return 'warning';
};

const classes = {
  root: (theme: Theme) => ({
    display: 'grid',
    gridTemplateColumns: `${RIGHTS_LIST_WIDTH}px minmax(0, 1fr)`,
    border: `1px solid ${getDesignTokens(theme).border}`,
    borderRadius: `${RADIUS}px`,
    overflow: 'hidden',
    [theme.breakpoints.down('md')]: { gridTemplateColumns: 'minmax(0, 1fr)' },
  }),
  list: (theme: Theme) => ({
    maxHeight: RIGHTS_LIST_MAX_HEIGHT,
    overflowY: 'auto' as const,
    borderRight: `1px solid ${getDesignTokens(theme).border}`,
    backgroundColor: getDesignTokens(theme).surfaceSecondary,
    [theme.breakpoints.down('md')]: { maxHeight: 'none', borderRight: 'none' },
  }),
  group: (theme: Theme) => ({
    padding: theme.spacing(1.25, 1.75, 0.75),
    color: getDesignTokens(theme).textMuted,
  }),
  item: (isActive: boolean) => (theme: Theme) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
    width: '100%',
    minHeight: RIGHTS_ROW_MIN_HEIGHT,
    padding: theme.spacing(0, 1.75),
    font: 'inherit',
    textAlign: 'left' as const,
    color: theme.palette.text.primary,
    cursor: 'pointer',
    border: 'none',
    borderLeft: `${RIGHTS_ACTIVE_BAR_WIDTH}px solid ${isActive
      ? theme.palette.primary.main
      : 'transparent'}`,
    backgroundColor: isActive
      ? alpha(theme.palette.primary.main, getDesignTokens(theme).tintOpacity)
      : 'transparent',
    '&:hover': { backgroundColor: isActive ? undefined : getDesignTokens(theme).surface },
  }),
  detail: (theme: Theme) => ({
    display: 'flex',
    flexDirection: 'column' as const,
    gap: theme.spacing(1.5),
    minWidth: 0,
    padding: theme.spacing(2.5),
    [theme.breakpoints.down('md')]: {
      padding: theme.spacing(2),
      backgroundColor: getDesignTokens(theme).surface,
      borderTop: `1px solid ${getDesignTokens(theme).border}`,
      borderBottom: `1px solid ${getDesignTokens(theme).border}`,
    },
  }),
  detailHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap' as const,
    gap: 1.5,
  },
  right: (theme: Theme) => ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(1),
    minHeight: RIGHTS_ROW_MIN_HEIGHT,
    padding: theme.spacing(0.5, 0),
    borderBottom: `1px solid ${getDesignTokens(theme).border}`,
    '&:last-of-type': { borderBottom: 'none' },
  }),
};

const getLabel = (option: IRightsItem) => option.label ?? option.className;

const RightsMasterDetailInput = ({
  value, onChange, currentUserRoles, search,
}: Props) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isStacked = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedClassName, setSelectedClassName] = useState<string>(value[0]?.className ?? '');

  // an admin can never grant (or revoke) a right on an entity that they do not hold themselves
  const isRightLocked = (className: string, key: keyof IRights) => (
    !canAccessTo(currentUserRoles, className, key)
  );

  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return value;
    return value.filter((option) => (
      getLabel(option).toLowerCase().includes(query) || option.className.toLowerCase().includes(query)
    ));
  }, [value, search]);

  // the chosen entity may be filtered out: the first visible one stands in until the admin picks again
  const selected = filteredOptions.find((option) => option.className === selectedClassName) ??
    filteredOptions[0];

  const getCheckedCount = (option: IRightsItem) => (
    RIGHTS_DISPLAY_ORDER.filter((key) => option.rights[key]).length
  );

  const updateRights = (className: string, getRights: (current: IRights) => IRights) => {
    onChange(value.map((option) => (
      option.className === className
        ? { ...option, rights: getRights(option.rights) }
        : option
    )));
  };

  const toggleRight = (option: IRightsItem, key: keyof IRights) => {
    if (isRightLocked(option.className, key)) return;
    updateRights(option.className, (rights) => ({ ...rights, [key]: !rights[key] }));
  };

  // rights the admin does not hold themselves are left untouched by a preset
  const getPresetRights = (option: IRightsItem, presetKey: PresetKey) => (
    RIGHTS_DISPLAY_ORDER.reduce((rights, key) => ({
      ...rights,
      [key]: isRightLocked(option.className, key)
        ? option.rights[key]
        : RIGHTS_PRESETS[presetKey].includes(key),
    }), {} as IRights)
  );

  const isPresetActive = (option: IRightsItem, presetKey: PresetKey) => {
    const presetRights = getPresetRights(option, presetKey);

    return RIGHTS_DISPLAY_ORDER.every((key) => presetRights[key] === option.rights[key]);
  };

  const renderDetail = (option: IRightsItem) => {
    const activePreset = PRESET_KEYS.find((presetKey) => isPresetActive(option, presetKey)) ?? null;

    return (
      <Box css={classes.detail}>
        <Box sx={classes.detailHead}>
          <Typography component="h3" variant="subtitle1">{getLabel(option)}</Typography>
          <ToggleButtonGroup
            exclusive
            aria-label={t('user:role.rightsPresets')}
            size="small"
            value={activePreset}
            onChange={(_event, presetKey: PresetKey | null) => {
              if (!presetKey) return;
              updateRights(option.className, () => getPresetRights(option, presetKey));
            }}
          >
            {PRESET_KEYS.map((presetKey) => (
              <ToggleButton key={presetKey} value={presetKey}>
                {t(`user:role.rightsPreset.${presetKey}`)}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
        <div>
          {RIGHTS_DISPLAY_ORDER.map((key) => {
            const isLocked = isRightLocked(option.className, key);
            const label = t(`user:role.rightsType.${key}`);
            let hint = '';

            if (isLocked) hint = t('user:role.rightDisabledTooltip');
            else if (RIGHTS_WITH_HELPER.includes(key)) hint = t(`user:role.rightsTypeHelper.${key}`);

            return (
              <Box component="label" css={classes.right} key={key}>
                <Checkbox
                  checked={option.rights[key]}
                  disabled={isLocked}
                  onChange={() => toggleRight(option, key)}
                  slotProps={{ input: { 'aria-label': `${getLabel(option)} · ${label}` } }}
                />
                <div>
                  <Typography color={isLocked ? 'text.secondary' : 'text.primary'} variant="body2">
                    {label}
                  </Typography>
                  {hint && (
                    <Typography color="text.secondary" variant="caption">{hint}</Typography>
                  )}
                </div>
              </Box>
            );
          })}
        </div>
      </Box>
    );
  };

  return (
    <Box css={classes.root}>
      <Box css={classes.list}>
        {RIGHTS_GROUPS.map((group) => {
          const groupOptions = filteredOptions.filter(
            (option) => getRightsEntityGroup(option.className) === group
          );

          if (!groupOptions.length) return null;
          return (
            <Fragment key={group}>
              <Typography component="div" css={classes.group} variant="overline">
                {t(`common:sidebar.${group}`)}
              </Typography>
              {groupOptions.map((option) => {
                const isActive = option.className === selected?.className;
                const checkedCount = getCheckedCount(option);

                return (
                  <Fragment key={option.className}>
                    <button
                      aria-pressed={isActive}
                      css={classes.item(isActive)}
                      onClick={() => setSelectedClassName(option.className)}
                      type="button"
                    >
                      <Typography component="span" variant="body2">{getLabel(option)}</Typography>
                      <Tooltip
                        describeChild
                        title={t('user:role.rightsGrantedCount', {
                          granted: checkedCount, total: RIGHTS_DISPLAY_ORDER.length,
                        })}
                      >
                        <Chip
                          color={getCountChipColor(checkedCount, RIGHTS_DISPLAY_ORDER.length)}
                          label={`${checkedCount}/${RIGHTS_DISPLAY_ORDER.length}`}
                          size="small"
                          variant="outlined"
                        />
                      </Tooltip>
                    </button>
                    {/* narrow screens have no side pane: the rights open right under their entity */}
                    {isStacked && isActive && renderDetail(option)}
                  </Fragment>
                );
              })}
            </Fragment>
          );
        })}
        {!filteredOptions.length && (
          <Typography color="text.secondary" sx={{ p: 2 }} variant="body2">
            {t('user:role.noEntityFound')}
          </Typography>
        )}
      </Box>
      {!isStacked && (
        selected
          ? renderDetail(selected)
          : (
            <Typography color="text.secondary" sx={{ p: 2.5 }} variant="body2">
              {t('user:role.noResourceSelected')}
            </Typography>
          )
      )}
    </Box>
  );
};

export default RightsMasterDetailInput;
