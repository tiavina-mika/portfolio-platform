import { Box, Typography, type Theme } from '@mui/material';

import type { ReactNode } from 'react';

import {
  SETTINGS_ROW_GAP, SETTINGS_ROW_LABEL_GAP, SETTINGS_ROW_LABEL_WIDTH, SETTINGS_ROW_PADDING_X,
  SETTINGS_ROW_PADDING_Y,
} from '@/constants/_core/ui/entity.constants';

const classes = {
  /*
   * what the setting is on the left, the control that changes it on the right. The label column is
   * a fixed width so every control in the panel starts on the same edge whatever the label lengths
   * are; under `md` there is no room for two columns and the control drops under its own label.
   */
  row: (alignTop: boolean) => (theme: Theme) => ({
    display: 'grid',
    gridTemplateColumns: `${SETTINGS_ROW_LABEL_WIDTH}px minmax(0, 1fr)`,
    gap: SETTINGS_ROW_GAP,
    alignItems: alignTop
      ? 'start'
      : 'center',
    padding: `${SETTINGS_ROW_PADDING_Y}px ${SETTINGS_ROW_PADDING_X}px`,
    [theme.breakpoints.down('md')]: {
      gridTemplateColumns: '1fr',
      gap: theme.spacing(1.5),
    },
  }),
  label: { display: 'flex', flexDirection: 'column' as const, gap: `${SETTINGS_ROW_LABEL_GAP}px` },
  /*
   * a control carrying its own width (a select, a row of buttons) closes on the right edge of the
   * row, level with the panel's own inset — stretched it would read as a field of a form rather
   * than as the value of the setting named beside it. A field keeps the whole column.
   */
  control: (fitControl: boolean) => (theme: Theme) => ({
    minWidth: 0,
    ...(fitControl && {
      justifySelf: 'end' as const,
      [theme.breakpoints.down('md')]: { justifySelf: 'stretch' as const },
    }),
  }),
};

type Props = {
  label: string;
  description?: string;
  required?: boolean;
  // the control carries its own width and closes on the right edge instead of taking the column
  fitControl?: boolean;
  /*
   * the control stands taller than the label it answers (a text area, a pair of drop zones), so the
   * two start on the same line instead of the label floating in the middle of the row
   */
  alignTop?: boolean;
  children: ReactNode;
};

/**
 * One setting inside a {@link SettingsPanel}: its name and the sentence explaining it on the left,
 * the control that changes it on the right.
 */
const SettingsRow = ({
  label, description, required, fitControl = false, alignTop = false, children,
}: Props) => (
  <Box css={classes.row(alignTop)}>
    <div css={classes.label}>
      <Typography variant="subtitle1">
        {label}
        {required && <Box component="span" sx={{ color: 'error.main' }}> *</Box>}
      </Typography>
      {description && <Typography variant="caption">{description}</Typography>}
    </div>
    <div css={classes.control(fitControl)}>{children}</div>
  </Box>
);

export default SettingsRow;
