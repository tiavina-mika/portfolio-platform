import { ReactNode } from 'react';

import {
  PROFILE_ACCOUNT_ROW_CHEVRON_SIZE, PROFILE_PHOTO_BUTTON_ICON_SIZE,
} from '@/constants/_core/ui/entity.constants';

/*
 * Glyphs of the profile page — the camera pinned to the picture, the copy square of the backup
 * codes, and the chevron closing a row that opens a dialog on a touch screen. They are transcribed
 * from the design reference rather than taken from `react-icons`: the Feather glyphs that pack
 * would give ship at `stroke-width: 2`, where these are drawn between 1.6 and 1.7 — at 15px, inside
 * a 32px round button sitting on the avatar's edge, the heavier stroke reads as a filled blob.
 */
const CAMERA_STROKE_WIDTH = 1.6;
const COPY_STROKE_WIDTH = 1.7;
const CHEVRON_STROKE_WIDTH = 1.6;
const COPY_ICON_SIZE = 15;

export type ProfileIconProps = {
  size?: number;
};

type SvgProps = ProfileIconProps & {
  // the grid the path was authored on: the design draws these glyphs on both a 16 and a 24 box
  viewBox: string;
  strokeWidth: number;
  children: ReactNode;
};

/*
 * no strokeLinecap/strokeLinejoin: the design leaves them at their initial values (butt/miter)
 * rather than Feather's usual round/round, and the flat ends are visible at this size
 */
const Svg = ({
  size, viewBox, strokeWidth, children,
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

export const ProfileCameraIcon = ({ size = PROFILE_PHOTO_BUTTON_ICON_SIZE }: ProfileIconProps) => (
  <Svg size={size} strokeWidth={CAMERA_STROKE_WIDTH} viewBox="0 0 24 24">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </Svg>
);

// one square lifted off another: what the codes become once they are on the clipboard
export const ProfileCopyIcon = ({ size = COPY_ICON_SIZE }: ProfileIconProps) => (
  <Svg size={size} strokeWidth={COPY_STROKE_WIDTH} viewBox="0 0 24 24">
    <rect
      height="12"
      rx="2"
      width="12"
      x="9"
      y="9"
    />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Svg>
);

/*
 * the row itself is the target on a touch screen, so it ends on the mark that says so — the button
 * it replaces has no room to stand beside the sentence explaining the setting
 */
export const ProfileRowChevronIcon = (
  { size = PROFILE_ACCOUNT_ROW_CHEVRON_SIZE }: ProfileIconProps
) => (
  <Svg size={size} strokeWidth={CHEVRON_STROKE_WIDTH} viewBox="0 0 16 16">
    <path d="M6 4l4 4-4 4" />
  </Svg>
);
