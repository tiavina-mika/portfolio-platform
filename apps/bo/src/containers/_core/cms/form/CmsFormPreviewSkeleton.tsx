import { Skeleton } from '@mui/material';

import {
  FORM_WORKBENCH_PREVIEW_BLOCK_GAP, FORM_WORKBENCH_SKELETON_HELPER_HEIGHT,
  FORM_WORKBENCH_SKELETON_PREVIEW_IMAGE_HEIGHT, FORM_WORKBENCH_SKELETON_PREVIEW_LINE_WIDTHS,
  FORM_WORKBENCH_SKELETON_PREVIEW_OVERLINE_WIDTH, FORM_WORKBENCH_SKELETON_PREVIEW_TITLE_WIDTH,
  FORM_WORKBENCH_SKELETON_TITLE_HEIGHT,
} from '@/constants/_core/ui.constants';

const classes = {
  root: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${FORM_WORKBENCH_PREVIEW_BLOCK_GAP}px`,
  },
};

/**
 * The preview column while the record is read into the form: the overline, a picture, a title and
 * three lines of text — the outline shared by every mock-up the column can draw.
 */
const CmsFormPreviewSkeleton = () => (
  <div aria-busy="true" css={classes.root}>
    <Skeleton
      height={FORM_WORKBENCH_SKELETON_HELPER_HEIGHT}
      variant="rounded"
      width={FORM_WORKBENCH_SKELETON_PREVIEW_OVERLINE_WIDTH}
    />
    <Skeleton height={FORM_WORKBENCH_SKELETON_PREVIEW_IMAGE_HEIGHT} variant="rounded" width="100%" />
    <Skeleton
      height={FORM_WORKBENCH_SKELETON_TITLE_HEIGHT}
      variant="rounded"
      width={FORM_WORKBENCH_SKELETON_PREVIEW_TITLE_WIDTH}
    />
    {FORM_WORKBENCH_SKELETON_PREVIEW_LINE_WIDTHS.map((width) => (
      <Skeleton
        height={FORM_WORKBENCH_SKELETON_HELPER_HEIGHT}
        key={width}
        variant="rounded"
        width={width}
      />
    ))}
  </div>
);

export default CmsFormPreviewSkeleton;
