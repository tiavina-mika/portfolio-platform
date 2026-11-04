import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

import {
  CONTENT_PADDING_BOTTOM, CONTENT_PADDING_TOP, CONTENT_PADDING_X, CONTENT_PADDING_X_MOBILE,
} from '@/constants/_core/ui/page.constants';
import {
  APP_BAR_SKELETON_AVATAR_SIZE, APP_BAR_SKELETON_BRAND_HEIGHT, APP_BAR_SKELETON_BRAND_WIDTH,
  APP_BAR_SKELETON_BRAND_WIDTH_MOBILE, APP_BAR_SKELETON_CRUMB_HEIGHT, APP_BAR_SKELETON_CRUMB_WIDTH,
  APP_BAR_SKELETON_GAP, APP_BAR_SKELETON_ICON_HEIGHT, APP_BAR_SKELETON_ICON_WIDTH,
  APP_BAR_SKELETON_PADDING_X, APP_BAR_SKELETON_PADDING_X_MOBILE, APP_BAR_SKELETON_SEARCH_HEIGHT,
  APP_BAR_SKELETON_SEARCH_WIDTH, RESPONSIVE_BREAKPOINT, SIDEBAR_RAIL_WIDTH,
  SIDEBAR_SKELETON_ITEM_HEIGHT, SIDEBAR_SKELETON_LOGO_HEIGHT, SIDEBAR_SKELETON_LOGO_WIDTH,
  SIDEBAR_SKELETON_SECTIONS, SIDEBAR_SKELETON_TITLE_HEIGHT, SIDEBAR_SKELETON_TITLE_INDENT,
  SIDEBAR_SKELETON_TITLE_MARGIN_BOTTOM, SIDEBAR_SKELETON_TITLE_MARGIN_TOP, SIDEBAR_WIDTH,
  TOOLBAR_HEIGHT, TOOLBAR_SMALL_SCREEN_HEIGHT,
} from '@/constants/_core/ui/ui.constants';
import DashboardContentSkeleton from '@/containers/_core/layout/DashboardContentSkeleton';
import { SidebarTokens } from '@/utils/_core/theme/tokens.utils';

type Props = {
  tokens: SidebarTokens;
  isSideBarOpen: boolean;
};

// wide screens carry the breadcrumb and the search that narrower ones drop
const wideOnly = { display: { xs: 'none', [RESPONSIVE_BREAKPOINT]: 'block' } };

/**
 * The dashboard shell drawn before it has anything to show: the sidebar in its real width and
 * colors, the app bar with the slots it fills, and the dashboard's own content placeholder. Shown
 * while the dashboard guard loads the admin and their roles, so the first thing on screen already
 * has the layout the page settles into, instead of a blank page with a thin bar at the top.
 */
const DashboardShellSkeleton = ({ tokens, isSideBarOpen }: Props) => {
  const sidebarWidth = isSideBarOpen ? SIDEBAR_WIDTH : SIDEBAR_RAIL_WIDTH;
  // the default skeleton tint is read against the page background, not against the sidebar's own
  const sidebarSkeletonSx = { bgcolor: tokens.hoverBg };

  return (
    <Box aria-busy="true" sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box
        sx={{
          display: { xs: 'none', [RESPONSIVE_BREAKPOINT]: 'flex' },
          flexDirection: 'column',
          gap: 1,
          flexShrink: 0,
          width: sidebarWidth,
          p: 2,
          bgcolor: tokens.bg,
          borderRight: `1px solid ${tokens.border}`,
        }}
      >
        <Skeleton
          height={SIDEBAR_SKELETON_LOGO_HEIGHT}
          sx={{ ...sidebarSkeletonSx, mb: 2 }}
          variant="rounded"
          width={isSideBarOpen ? SIDEBAR_SKELETON_LOGO_WIDTH : '100%'}
        />
        {SIDEBAR_SKELETON_SECTIONS.map(({ titleWidth, itemCount }, sectionIndex) => (
          <Box key={sectionIndex} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {titleWidth && isSideBarOpen && (
              <Skeleton
                height={SIDEBAR_SKELETON_TITLE_HEIGHT}
                variant="rounded"
                width={titleWidth}
                sx={{
                  ...sidebarSkeletonSx,
                  mt: `${SIDEBAR_SKELETON_TITLE_MARGIN_TOP}px`,
                  mb: `${SIDEBAR_SKELETON_TITLE_MARGIN_BOTTOM}px`,
                  ml: `${SIDEBAR_SKELETON_TITLE_INDENT}px`,
                }}
              />
            )}
            {Array.from({ length: itemCount }).map((_, itemIndex) => (
              <Skeleton
                height={SIDEBAR_SKELETON_ITEM_HEIGHT}
                key={itemIndex}
                sx={sidebarSkeletonSx}
                variant="rounded"
                width="100%"
              />
            ))}
          </Box>
        ))}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: `${APP_BAR_SKELETON_GAP}px`,
            height: { xs: TOOLBAR_SMALL_SCREEN_HEIGHT, sm: TOOLBAR_HEIGHT },
            flexShrink: 0,
            px: {
              xs: `${APP_BAR_SKELETON_PADDING_X_MOBILE}px`,
              sm: `${APP_BAR_SKELETON_PADDING_X}px`,
            },
            bgcolor: 'background.paper',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Skeleton
            height={APP_BAR_SKELETON_ICON_HEIGHT}
            variant="rounded"
            width={APP_BAR_SKELETON_ICON_WIDTH}
          />
          {/* the brand stands in for the sidebar's logo wherever the sidebar is hidden */}
          <Skeleton
            height={APP_BAR_SKELETON_BRAND_HEIGHT}
            variant="rounded"
            width="100%"
            sx={{
              display: { xs: 'block', [RESPONSIVE_BREAKPOINT]: 'none' },
              maxWidth: { xs: APP_BAR_SKELETON_BRAND_WIDTH_MOBILE, sm: APP_BAR_SKELETON_BRAND_WIDTH },
            }}
          />
          <Skeleton
            height={APP_BAR_SKELETON_CRUMB_HEIGHT}
            sx={wideOnly}
            variant="rounded"
            width={APP_BAR_SKELETON_CRUMB_WIDTH}
          />
          <Box sx={{ flex: 1 }} />
          <Skeleton
            height={APP_BAR_SKELETON_SEARCH_HEIGHT}
            sx={wideOnly}
            variant="rounded"
            width={APP_BAR_SKELETON_SEARCH_WIDTH}
          />
          <Skeleton
            height={APP_BAR_SKELETON_ICON_HEIGHT}
            sx={{ display: { xs: 'none', sm: 'block' } }}
            variant="rounded"
            width={APP_BAR_SKELETON_ICON_WIDTH}
          />
          <Skeleton
            height={APP_BAR_SKELETON_AVATAR_SIZE}
            variant="circular"
            width={APP_BAR_SKELETON_AVATAR_SIZE}
          />
        </Box>
        <Box
          sx={{
            px: { xs: `${CONTENT_PADDING_X_MOBILE}px`, [RESPONSIVE_BREAKPOINT]: `${CONTENT_PADDING_X}px` },
            pt: `${CONTENT_PADDING_TOP}px`,
            pb: `${CONTENT_PADDING_BOTTOM}px`,
          }}
        >
          <DashboardContentSkeleton />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardShellSkeleton;
