import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import { MouseEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import type { Theme } from '@mui/material/styles';

import { CardsIcon, TableComfortableIcon, TableCompactIcon } from '@/components/icons/ListToolbarIcons';
import {
  LIST_VIEW_TOGGLE_BUTTON_SIZE, LIST_VIEW_TOGGLE_GAP, LIST_VIEW_TOGGLE_ICON_SIZE,
  LIST_VIEW_TOGGLE_PADDING,
} from '@/constants/_core/ui/list.constants';
import { RADIUS, RADIUS_SM } from '@/constants/_core/ui/ui.constants';
import { ListView, TableDensity } from '@/types/_core/app.type';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

/*
 * the switcher is a recessed track holding three icon slots, not the outlined segmented group the
 * theme draws by default: it swaps a rendering mode rather than holding a value, so it stays
 * visually under the controls that actually filter the list. The picked slot is the one raised
 * back onto the card surface — everything else in the track reads as the ground behind it.
 *
 * Two of the three slots are the same table drawn at two row densities. They belong here rather
 * than in a control of their own because the reader picks all three from the same question — how
 * much of the list do I want to see at once — and the glyphs answer it by drawing it: four lines
 * for the dense row, three for the airy one, four blocks for the card grid.
 */
const classes = {
  group: (theme: Theme) => ({
    gap: LIST_VIEW_TOGGLE_GAP,
    padding: LIST_VIEW_TOGGLE_PADDING,
    borderRadius: RADIUS,
    backgroundColor: getDesignTokens(theme).surfaceSecondary,
  }),
  button: (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      /*
       * the theme's segmented group draws shared edges and pulls its members together — undone here
       * doubled so the class outweighs the theme's own segmented-group rules on the same element
       */
      '&&, &&:not(:first-of-type), &&:not(:last-of-type)': {
        width: LIST_VIEW_TOGGLE_BUTTON_SIZE,
        height: LIST_VIEW_TOGGLE_BUTTON_SIZE,
        margin: 0,
        padding: 0,
        border: 'none',
        borderRadius: RADIUS_SM,
        color: tokens.textMuted,
        backgroundColor: 'transparent',
      },
      '&&:hover': { color: tokens.text, backgroundColor: 'transparent' },
      '&&.Mui-selected, &&.Mui-selected:hover': {
        color: tokens.text,
        backgroundColor: tokens.surface,
        boxShadow: tokens.shadow,
      },
    };
  },
};

/*
 * the three slots as one value: the group holds a single picked segment, where the list itself
 * keeps the rendering and the row density apart — the density survives a trip through the card
 * grid, so coming back to the table returns to the row height that was last picked
 */
type ListLayout = 'tableCompact' | 'tableComfortable' | 'cards';

type LayoutOption = {
  layout: ListLayout;
  labelKey: string;
  icon: ReactNode;
  view: ListView;
  density?: TableDensity;
};

const LAYOUT_OPTIONS: LayoutOption[] = [
  {
    layout: 'tableCompact',
    labelKey: 'compactTableView',
    icon: <TableCompactIcon size={LIST_VIEW_TOGGLE_ICON_SIZE} />,
    view: 'list',
    density: 'compact',
  },
  {
    layout: 'tableComfortable',
    labelKey: 'comfortableTableView',
    icon: <TableComfortableIcon size={LIST_VIEW_TOGGLE_ICON_SIZE} />,
    view: 'list',
    density: 'comfortable',
  },
  {
    layout: 'cards',
    labelKey: 'cardsView',
    icon: <CardsIcon size={LIST_VIEW_TOGGLE_ICON_SIZE} />,
    view: 'grid',
  },
];

const getCurrentLayout = (view: ListView, density: TableDensity): ListLayout => {
  if (view === 'grid') return 'cards';

  return density === 'comfortable'
    ? 'tableComfortable'
    : 'tableCompact';
};

type Props = {
  view: ListView;
  density: TableDensity;
  onChange: (view: ListView, density: TableDensity) => void;
};

const ListViewToggle = ({
  view, density, onChange,
}: Props) => {
  const {
    t,
  } = useTranslation();

  // MUI hands back null when the already-picked slot is clicked again — the list always has a view
  const handleChange = (_: MouseEvent<HTMLElement>, layout: ListLayout | null): void => {
    if (!layout) return;

    const option = LAYOUT_OPTIONS.find((layoutOption) => layoutOption.layout === layout);

    if (!option) return;
    // the card grid has no row density of its own — it leaves the table's last one untouched
    onChange(option.view, option.density ?? density);
  };

  return (
    <ToggleButtonGroup
      exclusive
      css={classes.group}
      onChange={handleChange}
      value={getCurrentLayout(view, density)}
    >
      {LAYOUT_OPTIONS.map(({
        layout, labelKey, icon,
      }) => (
        <ToggleButton
          aria-label={t(labelKey)}
          css={classes.button}
          key={layout}
          value={layout}
        >
          {/* the span is what holds the tooltip's ref — a react-icons glyph cannot */}
          <Tooltip title={t(labelKey)}>
            <span css={{ display: 'flex' }}>{icon}</span>
          </Tooltip>
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

export default ListViewToggle;
