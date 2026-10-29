import { ReactNode } from 'react';

/*
 * Alert glyphs transcribed verbatim from the design reference rather than taken from
 * `react-icons`: the Feather originals ship with `stroke-width: 2`, whereas the design draws the
 * alert icons at 1.6 (1.8 for the close cross and the toast badges) — mixing the two sources makes
 * the stroke weight visibly uneven next to the sidebar glyphs, which follow the same rule.
 */
const ICON_SIZE = 16;
const CLOSE_ICON_SIZE = 14;
const STROKE_WIDTH = 1.6;
const CLOSE_STROKE_WIDTH = 1.8;

export type AlertIconProps = {
  size?: number;
  strokeWidth?: number;
};

type SvgProps = AlertIconProps & {
  children: ReactNode;
};

/*
 * no strokeLinecap/strokeLinejoin: the design leaves them at their initial values (butt/miter)
 * rather than Feather's usual round/round, and the flat ends are visible at 16px
 */
const Svg = ({
  size = ICON_SIZE, strokeWidth = STROKE_WIDTH, children,
}: SvgProps) => (
  <svg
    fill="none"
    height={size}
    stroke="currentColor"
    strokeWidth={strokeWidth}
    viewBox="0 0 24 24"
    width={size}
  >
    {children}
  </svg>
);

export const AlertSuccessIcon = (props: AlertIconProps) => (
  <Svg {...props}>
    <path d="M20 6L9 17l-5-5" />
  </Svg>
);

export const AlertInfoIcon = (props: AlertIconProps) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-5M12 8h.01" />
  </Svg>
);

export const AlertWarningIcon = (props: AlertIconProps) => (
  <Svg {...props}>
    <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
  </Svg>
);

export const AlertErrorIcon = (props: AlertIconProps) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v5M12 16h.01" />
  </Svg>
);

/*
 * Not a severity glyph: the arrow turning back on itself is what a band about money already given
 * back is drawn with, in place of the tone's own icon. A refund is a settled fact rather than an
 * alarm, so the band it sits in says what happened by the glyph and not by turning red.
 */
export const AlertRefundIcon = (props: AlertIconProps) => (
  <Svg {...props}>
    <path d="M3 8h9a3 3 0 010 6H8" />
    <path d="M6 5L3 8l3 3" />
  </Svg>
);

/*
 * MUI passes `fontSize="small"` to whatever fills the Alert `closeIcon` slot — it is deliberately
 * not accepted here: the cross is drawn at the design's fixed 14px, not at a typography scale.
 */
export const AlertCloseIcon = ({ size = CLOSE_ICON_SIZE }: AlertIconProps) => (
  <Svg size={size} strokeWidth={CLOSE_STROKE_WIDTH}>
    <path d="M18 6L6 18M6 6l12 12" />
  </Svg>
);
