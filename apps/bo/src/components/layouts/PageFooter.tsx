import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import type { Theme } from '@mui/material/styles';

import {
  CONTENT_PADDING_X, CONTENT_PADDING_X_MOBILE, PAGE_FOOTER_GAP, PAGE_FOOTER_PADDING_Y,
} from '@/constants/_core/ui/page.constants';
import { useWorkspaceName } from '@/hooks/_core/useWorkspaceName';

const classes = {
  foot: (theme: Theme) => ({
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: PAGE_FOOTER_GAP,
    padding: `${PAGE_FOOTER_PADDING_Y}px ${CONTENT_PADDING_X}px`,
    [theme.breakpoints.down('md')]: { paddingInline: CONTENT_PADDING_X_MOBILE },
    borderTop: `1px solid ${theme.palette.divider}`,
    // pushed to the bottom of the column whatever the page holds, so a short page still closes
    marginTop: 'auto',
  }),
};

/**
 * The line closing the content column. It states what is true of the whole back-office rather than
 * of the page in front of the reader — who it belongs to and which build is running — so it is the
 * quietest text on screen and never competes with the page's own head.
 */
const PageFooter = () => {
  const workspaceName = useWorkspaceName();

  return (
    <Box component="footer" css={classes.foot}>
      <Typography sx={{ color: 'text.disabled' }} variant="caption">
        © {new Date().getFullYear()} {workspaceName}
      </Typography>
      <div css={{ flex: 1 }} />
      <Typography sx={{ color: 'text.disabled' }} variant="caption">
        v{import.meta.env.VITE_APP_VERSION}
      </Typography>
    </Box>
  );
};

export default PageFooter;
