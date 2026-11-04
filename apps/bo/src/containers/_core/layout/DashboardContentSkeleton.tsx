import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';

import {
  CONTENT_GAP, DASHBOARD_SKELETON_ACTION_HEIGHT, DASHBOARD_SKELETON_ACTION_WIDTH,
  DASHBOARD_SKELETON_CARD_GAP, DASHBOARD_SKELETON_CARD_PADDING, DASHBOARD_SKELETON_KPI_COUNT,
  DASHBOARD_SKELETON_KPI_COUNT_MOBILE, DASHBOARD_SKELETON_KPI_GAP, DASHBOARD_SKELETON_KPI_GAP_WIDE,
  DASHBOARD_SKELETON_KPI_LABEL_HEIGHT, DASHBOARD_SKELETON_KPI_VALUE_HEIGHT,
  DASHBOARD_SKELETON_TABLE_GAP, DASHBOARD_SKELETON_TABLE_ROW_COUNT,
  DASHBOARD_SKELETON_TABLE_ROW_COUNT_NARROW, DASHBOARD_SKELETON_TABLE_ROW_HEIGHT,
  DASHBOARD_SKELETON_TABLE_TITLE_HEIGHT, DASHBOARD_SKELETON_TABLE_TITLE_WIDTH,
  PAGE_HEAD_PRETITLE_GAP, PAGE_SKELETON_PRETITLE_HEIGHT, PAGE_SKELETON_PRETITLE_WIDTH,
  PAGE_SKELETON_TITLE_HEIGHT, PAGE_SKELETON_TITLE_WIDTH,
} from '@/constants/_core/ui/page.constants';
import { RESPONSIVE_BREAKPOINT } from '@/constants/_core/ui/ui.constants';

const cardBodySx = {
  display: 'flex',
  flexDirection: 'column',
  gap: `${DASHBOARD_SKELETON_CARD_GAP}px`,
  p: `${DASHBOARD_SKELETON_CARD_PADDING}px`,
} as const;

const KpiCardSkeleton = ({ isHiddenOnMobile }: { isHiddenOnMobile: boolean }) => (
  <Card sx={{ display: { xs: isHiddenOnMobile ? 'none' : 'block', sm: 'block' } }}>
    <Box sx={cardBodySx}>
      <Skeleton height={DASHBOARD_SKELETON_KPI_LABEL_HEIGHT} variant="rounded" width="55%" />
      <Skeleton height={DASHBOARD_SKELETON_KPI_VALUE_HEIGHT} variant="rounded" width="40%" />
      <Skeleton height={DASHBOARD_SKELETON_KPI_LABEL_HEIGHT} variant="rounded" width="70%" />
    </Box>
  </Card>
);

/**
 * Content zone of the dashboard placeholder: page head with its action, a row of figure cards and
 * a table card — the shape the dashboard home settles into.
 */
const DashboardContentSkeleton = () => {
  return (
    <Box
      aria-busy="true"
      sx={{ display: 'flex', flexDirection: 'column', gap: `${CONTENT_GAP}px`, width: '100%' }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 1.5 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${PAGE_HEAD_PRETITLE_GAP * 2}px` }}>
          <Skeleton
            height={PAGE_SKELETON_PRETITLE_HEIGHT}
            variant="rounded"
            width={PAGE_SKELETON_PRETITLE_WIDTH}
          />
          <Skeleton
            height={PAGE_SKELETON_TITLE_HEIGHT}
            variant="rounded"
            width={PAGE_SKELETON_TITLE_WIDTH}
          />
        </Box>
        <Skeleton
          height={DASHBOARD_SKELETON_ACTION_HEIGHT}
          sx={{ display: { xs: 'none', sm: 'block' } }}
          variant="rounded"
          width={DASHBOARD_SKELETON_ACTION_WIDTH}
        />
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, minmax(0, 1fr))',
            [RESPONSIVE_BREAKPOINT]: `repeat(${DASHBOARD_SKELETON_KPI_COUNT}, minmax(0, 1fr))`,
          },
          gap: {
            xs: `${DASHBOARD_SKELETON_KPI_GAP}px`,
            [RESPONSIVE_BREAKPOINT]: `${DASHBOARD_SKELETON_KPI_GAP_WIDE}px`,
          },
        }}
      >
        {Array.from({ length: DASHBOARD_SKELETON_KPI_COUNT }).map((_, index) => (
          <KpiCardSkeleton
            isHiddenOnMobile={index >= DASHBOARD_SKELETON_KPI_COUNT_MOBILE}
            key={index}
          />
        ))}
      </Box>
      <Card>
        <Box sx={{ ...cardBodySx, gap: `${DASHBOARD_SKELETON_TABLE_GAP}px` }}>
          <Skeleton
            height={DASHBOARD_SKELETON_TABLE_TITLE_HEIGHT}
            variant="rounded"
            width={DASHBOARD_SKELETON_TABLE_TITLE_WIDTH}
          />
          {Array.from({ length: DASHBOARD_SKELETON_TABLE_ROW_COUNT }).map((_, index) => (
            <Skeleton
              height={DASHBOARD_SKELETON_TABLE_ROW_HEIGHT}
              key={index}
              variant="rounded"
              width="100%"
              sx={index >= DASHBOARD_SKELETON_TABLE_ROW_COUNT_NARROW
                ? { display: { xs: 'none', [RESPONSIVE_BREAKPOINT]: 'block' } }
                : undefined}
            />
          ))}
        </Box>
      </Card>
    </Box>
  );
};

export default DashboardContentSkeleton;
