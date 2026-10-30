import { Grid, Typography } from '@mui/material';
import { ReactNode } from 'react';

import { PREVIEW_LABEL_VALUE_SPACING } from '@/constants/_core/ui/page.constants';

type Props = {
  label: string;
  value: string | number | ReactNode;
  priority?: 'left' | 'right';
};
const LabelValue = ({ label, value, priority = 'right' }: Props) => {
  return (
    <Grid container spacing={PREVIEW_LABEL_VALUE_SPACING}>
      {/* Label (on the left, with responsive behavior) */}
      <Grid
        size={{
          sm: 6,
          xs: 12,
        }}
      >
        <Typography
          variant="body1"
          sx={{
            fontWeight: priority === 'left'
              ? 'bold'
              : 'normal',
          }}
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
          variant="body1"
          sx={{
            fontWeight: priority === 'right'
              ? 'bold'
              : 'normal',
          }}
        >{value}
        </Typography>
      </Grid>
    </Grid>
  );
};

export default LabelValue;
