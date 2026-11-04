import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

import {
  CONTENT_GAP, PAGE_HEAD_PRETITLE_GAP, PAGE_SKELETON_PRETITLE_HEIGHT, PAGE_SKELETON_PRETITLE_WIDTH,
  PAGE_SKELETON_TITLE_HEIGHT, PAGE_SKELETON_TITLE_WIDTH,
} from '@/constants/_core/ui/page.constants';
import { SKELETON_SECTION_HEIGHT } from '@/constants/_core/ui/ui.constants';

/**
 * Placeholder for a page whose code or data is still on its way: the page head (pretitle over
 * title) and one content block, in the shape every page opens on. A bare progress bar let the
 * content zone collapse and then jump to its full height when the page landed.
 */
const PageContentSkeleton = () => {
  return (
    <Box
      aria-busy="true"
      sx={{ display: 'flex', flexDirection: 'column', gap: `${CONTENT_GAP}px`, width: '100%' }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${PAGE_HEAD_PRETITLE_GAP}px` }}>
        <Skeleton
          height={PAGE_SKELETON_PRETITLE_HEIGHT}
          variant="rounded"
          width={PAGE_SKELETON_PRETITLE_WIDTH}
        />
        <Skeleton height={PAGE_SKELETON_TITLE_HEIGHT} variant="rounded" width={PAGE_SKELETON_TITLE_WIDTH} />
      </Box>
      <Skeleton height={SKELETON_SECTION_HEIGHT} variant="rounded" width="100%" />
    </Box>
  );
};

export default PageContentSkeleton;
