import Skeleton from '@mui/material/Skeleton';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

import {
  CHECKBOX_SIZE, SKELETON_LINE_GAP, SKELETON_LINE_HEIGHT, SKELETON_PRIMARY_LINE_WIDTH,
  SKELETON_ROW_COUNT, SKELETON_SUB_LINE_HEIGHT, SKELETON_SUB_LINE_WIDTH,
} from '@/constants/_core/ui/ui.constants';

type Props = {
  columnCount: number;
  // the tick gutter is a fixed square, not a line — it stands for a control, not for a value
  withCheckbox?: boolean;
};

/**
 * Placeholder rows drawn in the shape of the rows they stand in for: the identity column carries a
 * title line over a meta line the way every list's first column does, the others carry a single
 * line. A grid of identical grey bands would settle into a different layout the moment the data
 * lands, which is the one thing a loading state exists to avoid.
 */
const TableSkeletonRows = ({
  columnCount, withCheckbox = false,
}: Props) => {
  return (
    <>
      {Array.from({ length: SKELETON_ROW_COUNT }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {withCheckbox && (
            <TableCell padding="checkbox">
              <Skeleton height={CHECKBOX_SIZE} variant="rounded" width={CHECKBOX_SIZE} />
            </TableCell>
          )}
          {Array.from({ length: columnCount }).map((_cell, cellIndex) => (
            <TableCell key={cellIndex}>
              <Skeleton
                height={SKELETON_LINE_HEIGHT}
                variant="rounded"
                width={SKELETON_PRIMARY_LINE_WIDTH}
              />
              {cellIndex === 0 && (
                <Skeleton
                  height={SKELETON_SUB_LINE_HEIGHT}
                  sx={{ mt: `${SKELETON_LINE_GAP}px` }}
                  variant="rounded"
                  width={SKELETON_SUB_LINE_WIDTH}
                />
              )}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
};

export default TableSkeletonRows;
