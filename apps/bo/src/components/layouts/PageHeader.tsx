import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import type { Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';

import {
  PAGE_HEAD_ACTIONS_GAP, PAGE_HEAD_ACTIONS_MOBILE_OFFSET, PAGE_HEAD_ACTIONS_OFFSET,
  PAGE_HEAD_DESCRIPTION_GAP, PAGE_HEAD_GAP, PAGE_HEAD_PRETITLE_GAP, PAGE_HEAD_TITLE_GAP,
} from '@/constants/_core/ui/page.constants';
import { useSidebarGroupLabel } from '@/hooks/_core/useSidebarGroupLabel';

const classes = {
  // the actions drop under the title on a narrow screen rather than squeezing it into two words
  head: (theme: Theme) => ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: `${PAGE_HEAD_GAP}px`,
    /*
     * the head spans the zone whatever it is dropped into: the actions close the row on the right
     * edge of the page, level with the right edge of the card under it, not right after the title
     */
    width: '100%',
    alignSelf: 'stretch',
    [theme.breakpoints.down('sm')]: { flexDirection: 'column' as const, gap: 0 },
  }),
  text: {
    flex: 1,
    // without it a long title pushes the actions off the right edge instead of wrapping itself
    minWidth: 0,
  },
  /*
   * the heading is a row: the name, then whatever badge states the entity's own status. They are
   * spaced by the row's gap rather than by a margin each badge carries, so a page that drops one
   * leaves no hole where it was
   */
  title: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: `${PAGE_HEAD_TITLE_GAP}px`,
  },
  /*
   * the actions stand on the title's row, not at the top of the block: the pretitle is a label of
   * the heading under it, and a button levelled with it would read as belonging to the group name
   */
  actions: (theme: Theme) => ({
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: `${PAGE_HEAD_ACTIONS_GAP}px`,
    flexShrink: 0,
    paddingTop: PAGE_HEAD_ACTIONS_OFFSET,
    /*
     * once stacked they take the full width and share it: a row of buttons hugging the left edge
     * under a title reads as part of the heading block rather than as what acts on the page
     */
    [theme.breakpoints.down('sm')]: {
      alignSelf: 'stretch',
      paddingTop: PAGE_HEAD_ACTIONS_MOBILE_OFFSET,
      '& > *': { flex: 1 },
    },
  }),
};

type Props = {
  title: ReactNode;
  /*
   * the line above the title, naming where the page sits. It defaults to the sidebar group the
   * route belongs to — the same label the app bar's breadcrumb opens with — so a page only passes
   * it when it is reached from somewhere that group does not name. It can hold a control of its
   * own when the label is something an operator quotes, like a payment's reference.
   */
  pretitle?: ReactNode;
  description?: ReactNode;
  // what acts on the page as a whole: create, export, the switch between two renderings of it
  actions?: ReactNode;
};

/**
 * The block a page opens on: where it sits, what it is called, what it holds, and what can be done
 * to it. It is the first band of the content column and owns no vertical spacing of its own — the
 * column's gap is what separates it from whatever the page stacks under it.
 */
const PageHeader = ({
  title, pretitle, description, actions,
}: Props) => {
  const sidebarGroupLabel = useSidebarGroupLabel();
  const displayedPretitle = pretitle ?? sidebarGroupLabel;

  return (
    <Box component="header" css={classes.head}>
      <div css={classes.text}>
        {displayedPretitle && (
          <Typography
            component="p"
            sx={{ display: 'block', mb: `${PAGE_HEAD_PRETITLE_GAP}px` }}
            variant="overline"
          >
            {displayedPretitle}
          </Typography>
        )}
        <Typography component="h1" css={classes.title} variant="h2">{title}</Typography>
        {/* the line under a page title is its meta, not a second heading */}
        {description && (
          <Typography sx={{ mt: `${PAGE_HEAD_DESCRIPTION_GAP}px` }} variant="body2">
            {description}
          </Typography>
        )}
      </div>
      {actions && <div css={classes.actions}>{actions}</div>}
    </Box>
  );
};

export default PageHeader;
