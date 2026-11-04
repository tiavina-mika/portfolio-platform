import { ReactNode } from 'react';

import { PREVIEW_LAYOUT_ICON_SIZE } from '@/constants/_core/ui/page.constants';

/*
 * The two ways of reading a detail page, drawn as the page itself rather than as a metaphor: one
 * frame, split the way the layout it stands for splits the screen. A vertical rule near the
 * leading edge is the summary rail with the block beside it; horizontal rules are the blocks
 * stacked with no rail at all. Nothing else changes between them, so the pair reads as one choice
 * with two settings instead of two unrelated glyphs.
 *
 * Drawn here rather than taken from `react-icons`: those ship at `stroke-width: 2`, where the
 * design draws 1.5, and at this size the difference is what makes a glyph sitting next to the
 * back-office's own icons look heavier than all of them.
 */
const STROKE_WIDTH = 1.5;

export type PreviewLayoutIconProps = {
  size?: number;
};

type SvgProps = PreviewLayoutIconProps & {
  children: ReactNode;
};

// no strokeLinecap/strokeLinejoin, as in the rest of the set: the design leaves them at butt/miter
const Svg = ({
  size = PREVIEW_LAYOUT_ICON_SIZE, children,
}: SvgProps) => (
  <svg
    fill="none"
    height={size}
    stroke="currentColor"
    strokeWidth={STROKE_WIDTH}
    viewBox="0 0 16 16"
    width={size}
  >
    {children}
  </svg>
);

/** The summary rail standing to the left of the one block it marks. */
export const PreviewSidebarLayoutIcon = (props: PreviewLayoutIconProps) => (
  <Svg {...props}>
    <rect
      height="10.5"
      rx="1.5"
      width="12.5"
      x="1.75"
      y="2.75"
    />
    <path d="M6.25 2.75v10.5" />
  </Svg>
);

/** Every block stacked, the rail gone. */
export const PreviewFullLayoutIcon = (props: PreviewLayoutIconProps) => (
  <Svg {...props}>
    <rect
      height="10.5"
      rx="1.5"
      width="12.5"
      x="1.75"
      y="2.75"
    />
    <path d="M1.75 6.5h12.5M1.75 9.75h12.5" />
  </Svg>
);
