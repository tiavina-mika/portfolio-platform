import { Card, type Theme } from '@mui/material';

import type { ReactNode } from 'react';

import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

const classes = {
  /*
   * the open section is one card holding a list of settings, so the rules between them are drawn by
   * the panel rather than by each row: a row does not know whether it is the last one, and a border
   * carried by every row would close the card with a second line on top of its own edge
   */
  panel: (theme: Theme) => ({
    '& > *:not(:last-child)': { borderBottom: `1px solid ${getDesignTokens(theme).borderLight}` },
  }),
};

type Props = {
  children: ReactNode;
  className?: string;
};

/**
 * The card the open settings section is drawn in: it owns the rules between the rows it stacks and
 * nothing else — a row draws its own inset, and the panel has no header of its own since each row
 * is named by its own label column.
 */
const SettingsPanel = ({
  children, className,
}: Props) => (
  <Card className={className} css={classes.panel}>
    {children}
  </Card>
);

export default SettingsPanel;
