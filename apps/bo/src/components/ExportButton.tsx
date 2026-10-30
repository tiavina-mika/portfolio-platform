import Button from '@mui/material/Button';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import { MouseEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ExportIcon, FileIcon } from '@/components/icons/ListToolbarIcons';
import { MenuFoot, MenuHead, MenuSubhead } from '@/components/MenuBands';
import ToolbarIconButton from '@/components/ToolbarIconButton';
import { LIST_SELECTION_BAR_BUTTON_HEIGHT } from '@/constants/_core/ui/list.constants';
import { PAGE_HEAD_ACTION_ICON_SIZE } from '@/constants/_core/ui/page.constants';
import {
  EXPORT_MENU_WIDTH, MENU_ITEM_ICON_GAP, MENU_ITEM_ICON_SIZE, TOOLBAR_ICON_BUTTON_GLYPH_SIZE,
} from '@/constants/_core/ui/ui.constants';
import { ExportFormat, ExportScope, IExportScopeCounts } from '@/types/_core/app.type';

/*
 * The list, written to a file. Two questions rather than one command: which format, and how much of
 * the list — asked in the same menu because a reader who has just ticked six rows and a reader
 * exporting the whole filtered set are doing the same thing with different amounts. Nothing leaves
 * until the foot's button is pressed: picking a format is stating a choice, not firing the export.
 */
const classes = {
  menu: { width: EXPORT_MENU_WIDTH },
  // the radio replaces the leading glyph of the row, so it takes that slot's gap rather than its own
  scopeRadio: { marginRight: MENU_ITEM_ICON_GAP },
  // the foot stands on the same compact row as the selection band's actions, under the toolbar's
  exportButton: {
    height: LIST_SELECTION_BAR_BUTTON_HEIGHT,
    minHeight: LIST_SELECTION_BAR_BUTTON_HEIGHT,
  },
};

const EXPORT_FORMATS: { format: ExportFormat; labelKey: string }[] = [
  { format: 'csv', labelKey: 'exportFormatCsv' },
  { format: 'xlsx', labelKey: 'exportFormatExcel' },
];

const EXPORT_SCOPES: { scope: ExportScope; labelKey: string }[] = [
  { scope: 'currentPage', labelKey: 'exportScopeCurrentPage' },
  { scope: 'selection', labelKey: 'exportScopeSelection' },
  { scope: 'allFiltered', labelKey: 'exportScopeAllFiltered' },
];

const DEFAULT_FORMAT: ExportFormat = 'csv';
const DEFAULT_SCOPE: ExportScope = 'allFiltered';

type Props = {
  onExport: (format: ExportFormat, scope: ExportScope) => void;
  disabled?: boolean;
  /*
   * how many rows each scope covers. Omitted outside a list (a statistics page exports the one
   * figure set it is showing), which is what drops the scope band from the menu.
   */
  scopeCounts?: IExportScopeCounts;
  /*
   * a labelled button rather than a lone glyph — for a page head, where the export stands with the
   * page's other actions instead of in a list toolbar next to a search field
   */
  withLabel?: boolean;
};

const ExportButton = ({
  onExport, disabled, scopeCounts, withLabel = false,
}: Props) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [format, setFormat] = useState<ExportFormat>(DEFAULT_FORMAT);
  const [scope, setScope] = useState<ExportScope>(DEFAULT_SCOPE);

  const handleClick = (event: MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (): void => setAnchorEl(null);

  const handleSelectFormat = (value: ExportFormat) => (): void => setFormat(value);
  const handleSelectScope = (value: ExportScope) => (): void => setScope(value);

  const handleExport = (): void => {
    onExport(format, scope);
    handleClose();
  };

  return (
    <>
      {withLabel
        ? (
          <Button
            disabled={disabled}
            onClick={handleClick}
            startIcon={<ExportIcon size={PAGE_HEAD_ACTION_ICON_SIZE} />}
            variant="outlined"
          >
            {t('export')}
          </Button>
        )
        : (
          <ToolbarIconButton
            disabled={disabled}
            icon={<ExportIcon size={TOOLBAR_ICON_BUTTON_GLYPH_SIZE} />}
            isMenuOpen={!!anchorEl}
            label={t('export')}
            onClick={handleClick}
          />
        )}
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        onClose={handleClose}
        open={!!anchorEl}
        slotProps={{ paper: { sx: classes.menu } }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuHead title={t('format')} />
        {EXPORT_FORMATS.map(({
          format: value, labelKey,
        }) => (
          <MenuItem
            key={value}
            onClick={handleSelectFormat(value)}
            selected={value === format}
          >
            <ListItemIcon>
              <FileIcon size={MENU_ITEM_ICON_SIZE} />
            </ListItemIcon>
            {t(labelKey)}
          </MenuItem>
        ))}
        {scopeCounts && <MenuSubhead title={t('scope')} />}
        {scopeCounts && EXPORT_SCOPES.map(({
          scope: value, labelKey,
        }) => (
          <MenuItem
            aria-checked={value === scope}
            /* nothing to take out of an empty selection — the row states the count and stays inert */
            disabled={value === 'selection' && scopeCounts.selection === 0}
            key={value}
            onClick={handleSelectScope(value)}
            role="radio"
          >
            {/* the row is the control — the radio only draws the state it is in, hence readOnly */}
            <Radio
              readOnly
              checked={value === scope}
              css={classes.scopeRadio}
              tabIndex={-1}
            />
            {t(labelKey, { count: scopeCounts[value] })}
          </MenuItem>
        ))}
        {/* the note is about a table's columns — it says nothing on a page that has no table */}
        <MenuFoot note={scopeCounts
          ? t('exportVisibleColumnsOnly')
          : undefined}
        >
          <Button css={classes.exportButton} onClick={handleExport} variant="contained">
            {t('export')}
          </Button>
        </MenuFoot>
      </Menu>
    </>
  );
};

export default ExportButton;
