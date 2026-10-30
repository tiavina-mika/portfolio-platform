import { ReactNode } from 'react';

/*
 * Sidebar glyphs transcribed verbatim from the design reference. They are not taken from
 * `react-icons` on purpose: several of them (dashboard, car, receipt, wallet, columns) exist in no
 * icon pack, and the Feather-derived ones ship with `stroke-width: 2` there, whereas the design
 * draws every sidebar glyph at 1.5 — mixing the two sources makes the stroke weight visibly uneven.
 */
const ICON_SIZE = 18;
const STROKE_WIDTH = 1.5;

export type SidebarIconProps = {
  size?: number;
};

type SvgProps = SidebarIconProps & {
  children: ReactNode;
};

/*
 * no strokeLinecap/strokeLinejoin: the design leaves them at their initial values (butt/miter)
 * rather than Feather's usual round/round, and the flat ends are visible at 18px
 */
const Svg = ({
  size = ICON_SIZE, children,
}: SvgProps) => (
  <svg
    fill="none"
    height={size}
    stroke="currentColor"
    strokeWidth={STROKE_WIDTH}
    viewBox="0 0 24 24"
    width={size}
  >
    {children}
  </svg>
);

export const DashboardIcon = (props: SidebarIconProps) => (
  <Svg {...props}>
    <rect
      height="7"
      rx="1.5"
      width="7"
      x="3"
      y="3"
    />
    <rect
      height="4"
      rx="1.5"
      width="7"
      x="14"
      y="3"
    />
    <rect
      height="7"
      rx="1.5"
      width="7"
      x="3"
      y="14"
    />
    <rect
      height="11"
      rx="1.5"
      width="7"
      x="14"
      y="10"
    />
  </Svg>
);

export const MapIcon = (props: SidebarIconProps) => (
  <Svg {...props}>
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
    <line
      x1="8"
      x2="8"
      y1="2"
      y2="18"
    />
    <line
      x1="16"
      x2="16"
      y1="6"
      y2="22"
    />
  </Svg>
);

export const MailIcon = (props: SidebarIconProps) => (
  <Svg {...props}>
    <rect
      height="16"
      rx="3"
      width="20"
      x="2"
      y="4"
    />
    <path d="M2 7l10 6 10-6" />
  </Svg>
);

export const CarIcon = (props: SidebarIconProps) => (
  <Svg {...props}>
    <path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11" />
    <rect
      height="6"
      rx="2"
      width="18"
      x="3"
      y="11"
    />
    <circle cx="7.5" cy="18" r="1.5" />
    <circle cx="16.5" cy="18" r="1.5" />
  </Svg>
);

export const UserIcon = (props: SidebarIconProps) => (
  <Svg {...props}>
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Svg>
);

export const MessageCircleIcon = (props: SidebarIconProps) => (
  <Svg {...props}>
    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
  </Svg>
);

export const FlagIcon = (props: SidebarIconProps) => (
  <Svg {...props}>
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line
      x1="4"
      x2="4"
      y1="22"
      y2="15"
    />
  </Svg>
);

export const SmileIcon = (props: SidebarIconProps) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
  </Svg>
);

export const BellIcon = (props: SidebarIconProps) => (
  <Svg {...props}>
    <path d="M12 3a6 6 0 00-6 6c0 6-3 7-3 7h18s-3-1-3-7a6 6 0 00-6-6z" />
    <path d="M10.5 21a1.5 1.5 0 003 0" />
  </Svg>
);

/** The announcement broadcast: the platform speaking to a whole segment of the members at once. */
export const MegaphoneIcon = (props: SidebarIconProps) => (
  <Svg {...props}>
    <path d="M3 11v2a1 1 0 001 1h3l7 4V6l-7 4H4a1 1 0 00-1 1z" />
    <path d="M7 14v4a1 1 0 001 1h1a1 1 0 001-1v-3" />
    <path d="M18 9a3 3 0 010 6" />
  </Svg>
);

export const CreditCardIcon = (props: SidebarIconProps) => (
  <Svg {...props}>
    <rect
      height="16"
      rx="2"
      width="22"
      x="1"
      y="4"
    />
    <line
      x1="1"
      x2="23"
      y1="10"
      y2="10"
    />
  </Svg>
);

export const BarChartIcon = (props: SidebarIconProps) => (
  <Svg {...props}>
    <path d="M4 19V5M8 19v-8M12 19V9M16 19v-5M20 19v-9" />
  </Svg>
);

export const CodeIcon = (props: SidebarIconProps) => (
  <Svg {...props}>
    <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
  </Svg>
);

export const ReceiptIcon = (props: SidebarIconProps) => (
  <Svg {...props}>
    <path d="M5 21V3h14v18l-3-2-3 2-3-2-3 2-2-2z" />
    <path d="M9 8h6M9 12h6M9 16h4" />
  </Svg>
);

export const WalletIcon = (props: SidebarIconProps) => (
  <Svg {...props}>
    <path d="M21 12V7H5a2 2 0 010-4h14v4" />
    <path d="M3 5v14a2 2 0 002 2h16v-5" />
    <path d="M18 12a2 2 0 000 4h4v-4z" />
  </Svg>
);

export const FolderIcon = (props: SidebarIconProps) => (
  <Svg {...props}>
    <path d="M3 7a2 2 0 012-2h4l2 2h7a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
  </Svg>
);

export const LayoutIcon = (props: SidebarIconProps) => (
  <Svg {...props}>
    <rect
      height="18"
      rx="2"
      width="20"
      x="2"
      y="3"
    />
    <path d="M2 8h20" />
  </Svg>
);

export const ColumnsIcon = (props: SidebarIconProps) => (
  <Svg {...props}>
    <rect
      height="14"
      rx="1.5"
      width="6"
      x="3"
      y="3"
    />
    <rect
      height="9"
      rx="1.5"
      width="6"
      x="11"
      y="3"
    />
    <rect
      height="6"
      rx="0.5"
      width="2"
      x="19"
      y="3"
    />
  </Svg>
);

export const BriefcaseIcon = (props: SidebarIconProps) => (
  <Svg {...props}>
    <rect
      height="14"
      rx="2"
      width="20"
      x="2"
      y="7"
    />
    <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
  </Svg>
);

export const SettingsIcon = (props: SidebarIconProps) => (
  <Svg {...props}>
    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </Svg>
);

export const ServerIcon = (props: SidebarIconProps) => (
  <Svg {...props}>
    <rect
      height="8"
      rx="2"
      width="20"
      x="2"
      y="2"
    />
    <rect
      height="8"
      rx="2"
      width="20"
      x="2"
      y="14"
    />
    <line
      x1="6"
      x2="6.01"
      y1="6"
      y2="6"
    />
    <line
      x1="6"
      x2="6.01"
      y1="18"
      y2="18"
    />
  </Svg>
);

/*
 * disclosure chevron on a parent item — its own 16-unit viewBox in the design, so it can't reuse
 * the 24-unit Svg wrapper above
 */
export const SidebarChevronIcon = ({ size = 12 }: SidebarIconProps) => (
  <svg
    fill="none"
    height={size}
    stroke="currentColor"
    strokeWidth={STROKE_WIDTH}
    viewBox="0 0 16 16"
    width={size}
  >
    <path d="M6 4l4 4-4 4" />
  </svg>
);
