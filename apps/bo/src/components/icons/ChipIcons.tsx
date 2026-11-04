import { SVGProps } from 'react';

import { CHIP_DELETE_BUTTON_SIZE } from '@/constants/_core/ui/ui.constants';

/*
 * MUI fills the Chip `deleteIcon` slot with a solid Cancel glyph (a filled disc with a cut-out
 * cross), which lands as the loudest thing on a tinted chip. The design draws a bare stroked cross
 * instead, and gets its round hit slot from the hover ground the MuiChip override paints behind it.
 *
 * The svg is the hit slot itself — the cross is drawn inset on the 24-unit grid, which is what
 * leaves the glyph at roughly half the slot while the whole 20px square stays clickable.
 *
 * The incoming props are spread onto it and must stay that way: Chip clones this element to attach
 * both its own `MuiChip-deleteIcon` class and the handler that actually removes the chip — dropping
 * them leaves an unstyled cross that does nothing.
 */
const STROKE_WIDTH = 1.6;

export const ChipDeleteIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    fill="none"
    height={CHIP_DELETE_BUTTON_SIZE}
    stroke="currentColor"
    strokeWidth={STROKE_WIDTH}
    viewBox="0 0 24 24"
    width={CHIP_DELETE_BUTTON_SIZE}
  >
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);
