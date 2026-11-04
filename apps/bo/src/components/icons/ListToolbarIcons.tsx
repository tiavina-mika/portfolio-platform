import { ReactNode } from 'react';

/*
 * Glyphs of the list toolbar's right group — sort, export, and the three rendering slots of the
 * view switcher — transcribed verbatim from the design reference. They are not taken from
 * `react-icons`: the two table slots differ only by how many lines they draw (four for the dense
 * row, three for the airy one), a distinction no icon pack makes, and the Feather glyphs the rest
 * of that pack would give ship at `stroke-width: 2` where the design draws 1.5 — a segmented group
 * mixing the two sources shows the uneven weight at 15px.
 */
const ICON_SIZE = 16;
const STROKE_WIDTH = 1.5;

export type ListToolbarIconProps = {
  size?: number;
};

type SvgProps = ListToolbarIconProps & {
  // the grid the path was authored on: the design draws these glyphs on both a 16 and a 24 box
  viewBox: string;
  strokeWidth?: number;
  children: ReactNode;
};

/*
 * no strokeLinecap/strokeLinejoin: the design leaves them at their initial values (butt/miter)
 * rather than Feather's usual round/round, and the flat ends are visible at this size
 */
const Svg = ({
  size = ICON_SIZE, viewBox, strokeWidth = STROKE_WIDTH, children,
}: SvgProps) => (
  <svg
    fill="none"
    height={size}
    stroke="currentColor"
    strokeWidth={strokeWidth}
    viewBox={viewBox}
    width={size}
  >
    {children}
  </svg>
);

// two columns read in opposite directions — the list is ordered, not just filtered
export const SortIcon = (props: ListToolbarIconProps) => (
  <Svg {...props} viewBox="0 0 16 16">
    <path d="M4.5 3v10M2.5 11l2 2 2-2M11.5 13V3M9.5 5l2-2 2 2" />
  </Svg>
);

export const ExportIcon = (props: ListToolbarIconProps) => (
  <Svg {...props} viewBox="0 0 24 24">
    <path d="M12 3v12M8 11l4 4 4-4M4 21h16" />
  </Svg>
);

// four lines against three: the two table slots state their density by drawing it
export const TableCompactIcon = (props: ListToolbarIconProps) => (
  <Svg {...props} viewBox="0 0 16 16">
    <path d="M2.5 3.5h11M2.5 6.5h11M2.5 9.5h11M2.5 12.5h11" />
  </Svg>
);

export const TableComfortableIcon = (props: ListToolbarIconProps) => (
  <Svg {...props} viewBox="0 0 16 16">
    <path d="M2.5 4h11M2.5 8h11M2.5 12h11" />
  </Svg>
);

export const CardsIcon = (props: ListToolbarIconProps) => (
  <Svg {...props} viewBox="0 0 24 24">
    <rect
      height="7"
      rx="1.5"
      width="8"
      x="3"
      y="4"
    />
    <rect
      height="7"
      rx="1.5"
      width="8"
      x="13"
      y="4"
    />
    <rect
      height="7"
      rx="1.5"
      width="8"
      x="3"
      y="13"
    />
    <rect
      height="7"
      rx="1.5"
      width="8"
      x="13"
      y="13"
    />
  </Svg>
);

// the leading glyph of an export format row — a document, whatever the format writes into it
export const FileIcon = (props: ListToolbarIconProps) => (
  <Svg {...props} viewBox="0 0 16 16">
    <path d="M3.5 1.5h6l3 3v10h-9z" />
    <path d="M5.5 9h5M5.5 11.5h5" />
  </Svg>
);

/*
 * the arrow drawn next to the column a list is sorted by. It always points up: the descending
 * direction is the same glyph turned over, which is what makes the two states read as one control
 * rather than as two different marks.
 */
const SORT_DIRECTION_STROKE_WIDTH = 1.7;

export const SortDirectionIcon = (props: ListToolbarIconProps) => (
  <Svg {...props} strokeWidth={SORT_DIRECTION_STROKE_WIDTH} viewBox="0 0 16 16">
    <path d="M8 13V3M4.5 6.5L8 3l3.5 3.5" />
  </Svg>
);
