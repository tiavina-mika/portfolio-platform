import Typography from '@mui/material/Typography';

import type { Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';

import {
  DASHBOARD_CARDS_GAP, DASHBOARD_SECTION_TITLE_GAP, DASHBOARD_SECTION_TITLE_ICON_GAP,
} from '@/constants/_core/ui/chart.constants';

const classes = {
  section: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${DASHBOARD_SECTION_TITLE_GAP}px`,
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: `${DASHBOARD_SECTION_TITLE_ICON_GAP}px`,
    '& > svg': { flexShrink: 0 },
  },
  // cards in a band keep their own height: a short card must not stretch to match a longer neighbour
  grid: (theme: Theme, columns: number) => ({
    display: 'grid',
    alignItems: 'start',
    gap: `${DASHBOARD_CARDS_GAP}px`,
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    [theme.breakpoints.down('md')]: { gridTemplateColumns: 'minmax(0, 1fr)' },
  }),
};

type Props = {
  title: string;
  icon?: ReactNode;
  // how many cards stand on one row on a wide screen — the band stacks them under `md`
  columns: number;
  children: ReactNode;
};

/**
 * A band of the dashboard: a heading, then its cards side by side. Under `md` the cards stack, since
 * a list card squeezed to a third of a tablet is too narrow to hold a route and its status.
 */
const DashboardSection = ({
  title, icon, columns, children,
}: Props) => (
  <section css={classes.section}>
    <div css={classes.title}>
      {icon}
      <Typography component="h2" variant="h5">{title}</Typography>
    </div>
    <div css={(theme: Theme) => classes.grid(theme, columns)}>
      {children}
    </div>
  </section>
);

export default DashboardSection;
