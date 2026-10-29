import {
  Box, Checkbox, Chip, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography,
} from '@mui/material';
import { type Theme } from '@mui/material/styles';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiChevronDown, FiLock } from 'react-icons/fi';

import {
  RADIUS, RIGHTS_MATRIX_CHECKBOX_SIZE, RIGHTS_MATRIX_LOCK_ICON_SIZE, RIGHTS_MATRIX_MIN_WIDTH,
  RIGHTS_MATRIX_RESOURCE_COLUMN_WIDTH, RIGHTS_MATRIX_RIGHT_COLUMN_MIN_WIDTH,
  RIGHTS_MATRIX_ROW_INDENT,
} from '@/constants/_core/ui/ui.constants';
import {
  getRightsEntityGroup, RIGHTS_DISPLAY_ORDER, RIGHTS_GROUPS,
} from '@/constants/_core/user.constants';
import { IRights, IRightsItem, IRole } from '@/types/_core/role.type';
import { canAccessTo } from '@/utils/_core/role.utils';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

type Props = {
  value: IRightsItem[];
  onChange: (options: IRightsItem[]) => void;
  currentUserRoles: IRole[];
  /** the filter typed by the admin, held by the form so the panel header can own the search box */
  search: string;
};

const RIGHTS_WITH_HELPER: (keyof IRights)[] = ['delete', 'destroy'];

const getCountChipColor = (checkedCount: number, total: number): 'default' | 'success' | 'warning' => {
  if (checkedCount === 0) return 'default';
  if (checkedCount === total) return 'success';
  return 'warning';
};

const classes = {
  root: (theme: Theme) => ({
    overflowX: 'auto' as const,
    border: `1px solid ${getDesignTokens(theme).border}`,
    borderRadius: `${RADIUS}px`,
  }),
  table: {
    minWidth: RIGHTS_MATRIX_MIN_WIDTH,
    borderCollapse: 'collapse' as const,
  },
  headRow: (theme: Theme) => ({ backgroundColor: getDesignTokens(theme).surfaceSecondary }),
  resourceHead: (theme: Theme) => ({
    width: RIGHTS_MATRIX_RESOURCE_COLUMN_WIDTH,
    minWidth: RIGHTS_MATRIX_RESOURCE_COLUMN_WIDTH,
    textAlign: 'left' as const,
    textTransform: 'uppercase' as const,
    color: getDesignTokens(theme).textMuted,
    borderRight: `1px solid ${getDesignTokens(theme).border}`,
  }),
  rightHead: {
    minWidth: RIGHTS_MATRIX_RIGHT_COLUMN_MIN_WIDTH,
    textAlign: 'center' as const,
  },
  rightHeadContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 0.5,
  },
  // the column label is a button: it grants or revokes the right on every resource shown
  columnToggle: (theme: Theme) => ({
    padding: 0,
    font: 'inherit',
    color: theme.palette.text.primary,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    '&:hover': { textDecoration: 'underline' },
  }),
  groupRow: (theme: Theme) => ({ backgroundColor: getDesignTokens(theme).surfaceSecondary }),
  groupCell: (theme: Theme) => ({
    padding: 0,
    borderBottom: `1px solid ${getDesignTokens(theme).border}`,
  }),
  groupContent: (theme: Theme) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.25),
    padding: theme.spacing(1.125, 1.75),
  }),
  groupFold: (isOpen: boolean) => (theme: Theme) => ({
    display: 'inline-flex',
    padding: 0,
    color: theme.palette.text.secondary,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    transform: isOpen
      ? 'none'
      : 'rotate(-90deg)',
  }),
  rowHead: (theme: Theme) => ({
    padding: theme.spacing(1, 1.75, 1, 0),
    paddingLeft: RIGHTS_MATRIX_ROW_INDENT,
    borderRight: `1px solid ${getDesignTokens(theme).border}`,
  }),
  rowHeadContent: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },
  cell: { textAlign: 'center' as const },
  checkbox: {
    padding: 0,
    '& .MuiSvgIcon-root': {
      width: RIGHTS_MATRIX_CHECKBOX_SIZE,
      height: RIGHTS_MATRIX_CHECKBOX_SIZE,
    },
  },
  lockedBox: (theme: Theme) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: RIGHTS_MATRIX_CHECKBOX_SIZE,
    height: RIGHTS_MATRIX_CHECKBOX_SIZE,
    color: getDesignTokens(theme).textDisabled,
    backgroundColor: getDesignTokens(theme).surfaceSecondary,
    border: `1px solid ${getDesignTokens(theme).border}`,
    borderRadius: 4,
  }),
};

const getLabel = (option: IRightsItem) => option.label ?? option.className;

const RightsMatrixInput = ({
  value, onChange, currentUserRoles, search,
}: Props) => {
  const { t } = useTranslation();
  const [closedGroups, setClosedGroups] = useState<string[]>([]);

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

  const getUnlockedKeys = (option: IRightsItem) => (
    RIGHTS_DISPLAY_ORDER.filter((key) => !isRightLocked(option.className, key))
  );
  const getCheckedCount = (option: IRightsItem) => (
    RIGHTS_DISPLAY_ORDER.filter((key) => option.rights[key]).length
  );
  const isRowFull = (option: IRightsItem) => {
    const unlockedKeys = getUnlockedKeys(option);

    return unlockedKeys.length > 0 && unlockedKeys.every((key) => option.rights[key]);
  };

  /*
   * one write for every kind of toggle (a cell, a row, a group, a column): the rights of the chosen
   * entities are rebuilt through `getRights`, and a right the admin does not hold is left as it was
   */
  const updateRights = (
    classNames: string[],
    getRights: (current: IRights, key: keyof IRights) => boolean
  ) => {
    onChange(value.map((option) => {
      if (!classNames.includes(option.className)) return option;

      const rights = RIGHTS_DISPLAY_ORDER.reduce((acc, key) => ({
        ...acc,
        [key]: isRightLocked(option.className, key)
          ? option.rights[key]
          : getRights(option.rights, key),
      }), {} as IRights);

      return { ...option, rights };
    }));
  };

  const toggleCell = (className: string, key: keyof IRights) => (
    updateRights([className], (rights, rightKey) => (
      rightKey === key
        ? !rights[rightKey]
        : rights[rightKey]
    ))
  );
  const toggleEntities = (options: IRightsItem[], isFull: boolean) => (
    updateRights(options.map((option) => option.className), () => !isFull)
  );
  const toggleColumn = (key: keyof IRights) => {
    const openable = filteredOptions.filter((option) => !isRightLocked(option.className, key));
    const isFull = openable.length > 0 && openable.every((option) => option.rights[key]);

    updateRights(
      filteredOptions.map((option) => option.className),
      (rights, rightKey) => (
        rightKey === key
          ? !isFull
          : rights[rightKey]
      )
    );
  };

  const toggleGroup = (group: string) => setClosedGroups(
    (previous) => (previous.includes(group)
      ? previous.filter((item) => item !== group)
      : [...previous, group])
  );

  const renderCount = (checked: number, total: number) => (
    <Chip
      color={getCountChipColor(checked, total)}
      label={`${checked}/${total}`}
      size="small"
      variant="outlined"
    />
  );

  const renderTriStateCheckbox = (options: IRightsItem[], label: string, isFull: boolean) => {
    const checkedCount = options.reduce((count, option) => count + getCheckedCount(option), 0);

    return (
      <Checkbox
        checked={isFull}
        css={classes.checkbox}
        indeterminate={!isFull && checkedCount > 0}
        onChange={() => toggleEntities(options, isFull)}
        slotProps={{ input: { 'aria-label': label } }}
      />
    );
  };

  return (
    <Box css={classes.root}>
      <Table css={classes.table} size="small">
        <TableHead>
          <TableRow css={classes.headRow}>
            <TableCell component="th" css={classes.resourceHead} scope="col">
              <Typography component="span" variant="overline">{t('user:role.resource')}</Typography>
            </TableCell>
            {RIGHTS_DISPLAY_ORDER.map((key) => {
              const label = t(`user:role.rightsType.${key}`);
              const checkedCount = filteredOptions.filter((option) => option.rights[key]).length;

              return (
                <TableCell
                  component="th"
                  css={classes.rightHead}
                  key={key}
                  scope="col"
                >
                  <Box css={classes.rightHeadContent}>
                    <Tooltip
                      describeChild
                      title={RIGHTS_WITH_HELPER.includes(key)
                        ? t(`user:role.rightsTypeHelper.${key}`)
                        : ''}
                    >
                      <button css={classes.columnToggle} onClick={() => toggleColumn(key)} type="button">
                        <Typography component="span" variant="body2">{label}</Typography>
                      </button>
                    </Tooltip>
                    {renderCount(checkedCount, filteredOptions.length)}
                  </Box>
                </TableCell>
              );
            })}
          </TableRow>
        </TableHead>
        {RIGHTS_GROUPS.map((group) => {
          const groupOptions = filteredOptions.filter(
            (option) => getRightsEntityGroup(option.className) === group
          );

          if (!groupOptions.length) return null;

          const isOpen = !closedGroups.includes(group);
          const groupLabel = t(`common:sidebar.${group}`);
          const groupChecked = groupOptions.reduce((count, option) => count + getCheckedCount(option), 0);
          const isGroupFull = groupOptions.every(isRowFull);

          return (
            <TableBody key={group}>
              <TableRow css={classes.groupRow}>
                <TableCell colSpan={RIGHTS_DISPLAY_ORDER.length + 1} css={classes.groupCell}>
                  <Box css={classes.groupContent}>
                    <button
                      aria-expanded={isOpen}
                      aria-label={groupLabel}
                      css={classes.groupFold(isOpen)}
                      onClick={() => toggleGroup(group)}
                      type="button"
                    >
                      <FiChevronDown size={RIGHTS_MATRIX_CHECKBOX_SIZE - 4} />
                    </button>
                    {renderTriStateCheckbox(groupOptions, groupLabel, isGroupFull)}
                    <Typography component="span" variant="overline">{groupLabel}</Typography>
                    {renderCount(groupChecked, groupOptions.length * RIGHTS_DISPLAY_ORDER.length)}
                  </Box>
                </TableCell>
              </TableRow>
              {isOpen && groupOptions.map((option) => (
                <TableRow key={option.className}>
                  <TableCell component="th" css={classes.rowHead} scope="row">
                    <Box css={classes.rowHeadContent}>
                      {renderTriStateCheckbox([option], getLabel(option), isRowFull(option))}
                      <Typography component="span" variant="body2">{getLabel(option)}</Typography>
                      {renderCount(getCheckedCount(option), RIGHTS_DISPLAY_ORDER.length)}
                    </Box>
                  </TableCell>
                  {RIGHTS_DISPLAY_ORDER.map((key) => {
                    const isLocked = isRightLocked(option.className, key);
                    const label = `${getLabel(option)} · ${t(`user:role.rightsType.${key}`)}`;

                    return (
                      <TableCell css={classes.cell} key={key}>
                        {isLocked
                          ? (
                            <Tooltip describeChild title={t('user:role.rightDisabledTooltip')}>
                              <Box
                                aria-checked={option.rights[key]}
                                aria-disabled="true"
                                aria-label={label}
                                css={classes.lockedBox}
                                role="checkbox"
                                tabIndex={0}
                              >
                                <FiLock size={RIGHTS_MATRIX_LOCK_ICON_SIZE} />
                              </Box>
                            </Tooltip>
                          )
                          : (
                            <Checkbox
                              checked={option.rights[key]}
                              css={classes.checkbox}
                              onChange={() => toggleCell(option.className, key)}
                              slotProps={{ input: { 'aria-label': label } }}
                            />
                          )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          );
        })}
      </Table>
      {!filteredOptions.length && (
        <Typography color="text.secondary" sx={{ p: 2.25 }} variant="body2">
          {t('user:role.noEntityFound')}
        </Typography>
      )}
    </Box>
  );
};

export default RightsMatrixInput;
