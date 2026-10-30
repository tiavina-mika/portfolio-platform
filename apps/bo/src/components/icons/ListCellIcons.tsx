import { ReactNode } from 'react';

import { TABLE_CELL_ALERT_GLYPH_SIZE, TABLE_CELL_GLYPH_SIZE } from '@/constants/_core/ui/list.constants';

/*
 * Glyphs a list row draws inside its own cells — transcribed verbatim from the design reference
 * rather than taken from `react-icons`: they sit in the middle of a run of text at 12–15px, where
 * the pack's 2px stroke reads a full weight heavier than the words around them.
 */
const STROKE_WIDTH = 1.5;

export type ListCellIconProps = {
  size?: number;
};

type SvgProps = ListCellIconProps & {
  children: ReactNode;
  viewBox?: string;
  strokeWidth?: number;
};

/*
 * no strokeLinecap/strokeLinejoin: the design leaves them at their initial values (butt/miter)
 * rather than Feather's usual round/round, and the flat ends are visible at this size
 */
const Svg = ({
  size, children, viewBox = '0 0 16 16', strokeWidth = STROKE_WIDTH,
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

/**
 * The arrow standing between a departure and a destination. It replaces the two pins the route
 * used to be drawn with: a pin per endpoint stacks the route over two lines, where the arrow keeps
 * it on one and says which way it runs.
 */
export const RouteArrowIcon = ({ size = TABLE_CELL_GLYPH_SIZE }: ListCellIconProps) => (
  <Svg size={size}>
    <path d="M3 8h9M9 5l3 3-3 3" />
  </Svg>
);

/**
 * The warning a row carries about itself: a report is open against this ride and someone has to
 * look at it before the ride departs.
 */
export const ReportFlagIcon = ({ size = TABLE_CELL_ALERT_GLYPH_SIZE }: ListCellIconProps) => (
  <Svg size={size}>
    <path d="M8 2.5l5.5 10H2.5z" />
    <path d="M8 6.5v3M8 11h.01" />
  </Svg>
);

/**
 * The marker opening a line that names actual points on the ground rather than the two cities the
 * route runs between — where a passenger is picked up, where they are set down.
 */
export const MapPinIcon = ({ size = TABLE_CELL_GLYPH_SIZE }: ListCellIconProps) => (
  <Svg size={size} strokeWidth={1.6} viewBox="0 0 24 24">
    <path d="M12 21s7-6.3 7-11a7 7 0 10-14 0c0 4.7 7 11 7 11z" />
    <circle cx="12" cy="10" r="2.4" />
  </Svg>
);
