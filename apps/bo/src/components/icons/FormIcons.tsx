import { ReactNode } from 'react';

import {
  CHECKBOX_BORDER_WIDTH, CHECKBOX_RADIUS, CHECKBOX_SIZE, RADIO_DOT_SIZE,
} from '@/constants/_core/ui/ui.constants';

/*
 * The design draws a checkbox as a plain 18px rounded square with a stroked tick, not as MUI's
 * default filled glyph — so the box itself is part of the icon instead of coming from a wrapper.
 * `currentColor` carries both the outline (unchecked) and the fill (checked/indeterminate), which
 * lets the MuiCheckbox override drive the state colors from the palette in one place.
 */

// the tick and dash are authored on a 24px grid, then dropped into the 18px box centred at half scale
const GLYPH_SCALE = 0.5;
const GLYPH_OFFSET = (CHECKBOX_SIZE - (24 * GLYPH_SCALE)) / 2;
const GLYPH_STROKE_WIDTH = 3;
// half the stroke sits outside the path, so the rect is inset by that much to keep the 18px footprint
const BOX_INSET = CHECKBOX_BORDER_WIDTH / 2;

type BoxProps = {
  filled?: boolean;
};

const CheckboxBox = ({
  filled,
}: BoxProps) => (
  <rect
    height={CHECKBOX_SIZE - CHECKBOX_BORDER_WIDTH}
    rx={CHECKBOX_RADIUS - BOX_INSET}
    stroke="currentColor"
    strokeWidth={CHECKBOX_BORDER_WIDTH}
    width={CHECKBOX_SIZE - CHECKBOX_BORDER_WIDTH}
    x={BOX_INSET}
    y={BOX_INSET}
    fill={filled
      ? 'currentColor'
      : 'none'}
  />
);

type GlyphProps = {
  path: string;
};

const CheckboxGlyph = ({
  path,
}: GlyphProps) => (
  <g transform={`translate(${GLYPH_OFFSET} ${GLYPH_OFFSET}) scale(${GLYPH_SCALE})`}>
    <path
      d={path}
      fill="none"
      stroke="#fff"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={GLYPH_STROKE_WIDTH}
    />
  </g>
);

const Svg = ({
  children,
}: {
  children: ReactNode;
}) => (
  <svg
    fill="none"
    height={CHECKBOX_SIZE}
    viewBox={`0 0 ${CHECKBOX_SIZE} ${CHECKBOX_SIZE}`}
    width={CHECKBOX_SIZE}
    xmlns="http://www.w3.org/2000/svg"
  >
    {children}
  </svg>
);

export const CheckboxIcon = () => (
  <Svg>
    <CheckboxBox />
  </Svg>
);

export const CheckboxCheckedIcon = () => (
  <Svg>
    <CheckboxBox filled />
    <CheckboxGlyph path="M20 6L9 17l-5-5" />
  </Svg>
);

export const CheckboxIndeterminateIcon = () => (
  <Svg>
    <CheckboxBox filled />
    <CheckboxGlyph path="M5 12h14" />
  </Svg>
);

/*
 * the radio is the checkbox's round counterpart, drawn on the same 18px box so a column of radio
 * rows and a column of checkbox rows in one panel stand on a single control size: an outlined
 * circle when empty, filled with a dot punched out of it once picked
 */
const RadioCircle = ({
  filled,
}: BoxProps) => (
  <circle
    cx={CHECKBOX_SIZE / 2}
    cy={CHECKBOX_SIZE / 2}
    r={(CHECKBOX_SIZE - CHECKBOX_BORDER_WIDTH) / 2}
    stroke="currentColor"
    strokeWidth={CHECKBOX_BORDER_WIDTH}
    fill={filled
      ? 'currentColor'
      : 'none'}
  />
);

export const RadioIcon = () => (
  <Svg>
    <RadioCircle />
  </Svg>
);

export const RadioCheckedIcon = () => (
  <Svg>
    <RadioCircle filled />
    {/* white rather than the surface token: the dot sits on the primary fill in both palette modes */}
    <circle
      cx={CHECKBOX_SIZE / 2}
      cy={CHECKBOX_SIZE / 2}
      fill="#fff"
      r={RADIO_DOT_SIZE / 2}
    />
  </Svg>
);
