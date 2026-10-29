import { Grid, Typography } from '@mui/material';
import { ReactNode } from 'react';

import { PREVIEW_PAGE_GRID } from '@/utils/constants';

type Props = {
  label: string;
  value: string | number | ReactNode;
  priority?: 'left' | 'right';
};
const LabelValue = ({ label, value, priority = 'right' }: Props) => {
  return (
    (
      <Grid container spacing={PREVIEW_PAGE_GRID.spacing}>
        {/* Label (on the left, with responsive behavior) */}
        <Grid
          size={{
            sm: 6,
            xs: 12,
          }}
        >
          <Typography
            sx={{ fontWeight: priority === 'left' ? 'bold' : 'normal' }}
            variant="body1"
          >
            {label}
          </Typography>
        </Grid>
        {/* Value (on the right, with responsive behavior) */}
        <Grid
          size={{
            sm: 6,
            xs: 12,
          }}
        >
          <Typography
            sx={{ fontWeight: priority === 'right' ? 'bold' : 'normal' }}
            variant="body1"
          >{value}
          </Typography>
        </Grid>
      </Grid>
    )
  );
};

export default LabelValue;
