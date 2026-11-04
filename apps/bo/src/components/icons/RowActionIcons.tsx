import { ReactNode } from 'react';

import { ROW_ACTIONS_ICON_SIZE } from '@/constants/_core/ui/list.constants';

/*
 * The actions a table repeats on every row — open, edit, everything else — transcribed verbatim from
 * the design reference. They are not taken from `react-icons`: those ship at `stroke-width: 2`,
 * where the design draws 1.5, and the difference is what makes a row of three glyphs look uneven at
 * 15px. The overflow dots are the one filled glyph of the set, as in the reference.
 */
const STROKE_WIDTH = 1.5;

export type RowActionIconProps = {
  size?: number;
};

type SvgProps = RowActionIconProps & {
  // the dots are drawn as filled discs, every other glyph as a stroked path
  filled?: boolean;
  children: ReactNode;
};

/*
 * no strokeLinecap/strokeLinejoin: the design leaves them at their initial values (butt/miter)
 * rather than Feather's usual round/round, and the flat ends are visible at this size
 */
const Svg = ({
  size = ROW_ACTIONS_ICON_SIZE, filled, children,
}: SvgProps) => (
  <svg
    height={size}
    viewBox="0 0 16 16"
    width={size}
    fill={filled
      ? 'currentColor'
      : 'none'}
    stroke={filled
      ? undefined
      : 'currentColor'}
    strokeWidth={filled
      ? undefined
      : STROKE_WIDTH}
  >
    {children}
  </svg>
);

export const RowPreviewIcon = (props: RowActionIconProps) => (
  <Svg {...props}>
    <path d="M2 8s2.2-4 6-4 6 4 6 4-2.2 4-6 4-6-4-6-4z" />
    <circle cx="8" cy="8" r="1.6" />
  </Svg>
);

/*
 * the row's other way in: it leaves the list for the entity's own page rather than showing it in
 * place, so it is an arrow entering a panel and not an eye looking at one
 */
export const RowOpenIcon = (props: RowActionIconProps) => (
  <Svg {...props}>
    <path d="M9.5 3h2.5a1.5 1.5 0 011.5 1.5v7a1.5 1.5 0 01-1.5 1.5H9.5" />
    <path d="M2.5 8h6M6.5 5.5L9 8l-2.5 2.5" />
  </Svg>
);

/*
 * reaching out to the row's subject rather than acting on the row: the paper plane the design uses
 * for the message an administrator writes to a user, drawn on the same 16px grid as its neighbours
 * so the three glyphs of a row keep one weight
 */
export const RowSendIcon = (props: RowActionIconProps) => (
  <Svg {...props}>
    <path d="M14.67 1.33L7.33 8.67" />
    <path d="M14.67 1.33l-4.67 13.34-2.67-6-6-2.67 13.34-4.67z" />
  </Svg>
);

export const RowEditIcon = (props: RowActionIconProps) => (
  <Svg {...props}>
    <path d="M11 2.5l2.5 2.5L6 12.5 3 13l.5-3z" />
  </Svg>
);

export const RowDeleteIcon = (props: RowActionIconProps) => (
  <Svg {...props}>
    <path d="M3 5h10M6.5 5V3.5h3V5M4.5 5l.5 8h6l.5-8" />
  </Svg>
);

export const RowMoreIcon = (props: RowActionIconProps) => (
  <Svg {...props} filled>
    <circle cx="3" cy="8" r="1.4" />
    <circle cx="8" cy="8" r="1.4" />
    <circle cx="13" cy="8" r="1.4" />
  </Svg>
);

/*
 * ruling that what the row holds stands as it is — a tick, not a "done" glyph: the row is not
 * completed, it is confirmed, and it stays exactly where it was
 */
export const RowKeepIcon = (props: RowActionIconProps) => (
  <Svg {...props}>
    <path d="M13 4.5L6.5 11.5 3 8" />
  </Svg>
);

/*
 * taking the row's subject off the app without destroying it — the eye of the preview glyph,
 * struck through, so the pair reads as the same act and its opposite
 */
export const RowHideIcon = (props: RowActionIconProps) => (
  <Svg {...props}>
    <path d="M2 2l12 12" />
    <path d="M6.6 3.6A6 6 0 018 3.5c3.8 0 6 4 6 4a10 10 0 01-1.7 2.2M4 4.8A9.6 9.6 0 002 7.5s2.2 4 6 4c.9 0 1.7-.2 2.4-.5" />
  </Svg>
);

/*
 * putting back on the app what was taken off it. Deliberately not the plain eye: that glyph
 * already stands for "open this row" two buttons to its left, and the same drawing meaning two
 * different things in one row of five is what makes a reader hover them all.
 */
export const RowShowIcon = (props: RowActionIconProps) => (
  <Svg {...props}>
    <path d="M2.5 8a5.5 5.5 0 105.5-5.5c-2 0-3.6 1-4.6 2.5" />
    <path d="M3 2.5v2.7h2.7" />
  </Svg>
);
