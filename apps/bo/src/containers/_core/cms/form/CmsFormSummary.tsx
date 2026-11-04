import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { Theme } from '@mui/material/styles';

import {
  FONT_FAMILY_MONO, FONT_SIZE_META, FORM_SUMMARY_CODE_FONT_SIZE, FORM_SUMMARY_ROW_GAP,
  FORM_WORKBENCH_PREVIEW_BLOCK_GAP,
} from '@/constants/_core/ui.constants';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

const classes = {
  root: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${FORM_WORKBENCH_PREVIEW_BLOCK_GAP}px`,
  },
  rows: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${FORM_SUMMARY_ROW_GAP}px`,
  },
  /*
   * the name on the left and the answer pinned to the right edge, aligned on their baseline: a few
   * short lines rather than a table, so they carry no rule between them
   */
  row: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: `${FORM_SUMMARY_ROW_GAP}px`,
  },
  rowLabel: (theme: Theme) => ({
    fontSize: FONT_SIZE_META,
    color: getDesignTokens(theme).textSecondary,
  }),
  rowValue: (theme: Theme) => ({
    fontSize: FONT_SIZE_META,
    fontWeight: theme.typography.fontWeightMedium,
    textAlign: 'right' as const,
    color: getDesignTokens(theme).text,
  }),
  // an identifier is read character by character rather than as a word
  codeValue: (theme: Theme) => ({
    fontFamily: FONT_FAMILY_MONO,
    fontSize: FORM_SUMMARY_CODE_FONT_SIZE,
    textAlign: 'right' as const,
    color: getDesignTokens(theme).text,
  }),
};

export type CmsFormSummaryRow = {
  label: string;
  value: string;
  /** a technical identifier, set in the mono stack */
  isCode?: boolean;
};

type Props = {
  rows: CmsFormSummaryRow[];
};

/**
 * What the category and settings sections of a CMS form add up to, restated as a few facts. They
 * are unrelated controls spread over two sections — this is the one place they read as one record.
 */
const CmsFormSummary = ({ rows }: Props) => {
  const {
    t,
  } = useTranslation('cms');

  return (
    <div css={classes.root}>
      <Typography variant="overline">{t('cms:cmsForm.summary')}</Typography>
      <div css={classes.rows}>
        {rows.map((row) => (
          <div css={classes.row} key={row.label}>
            <span css={classes.rowLabel}>{row.label}</span>
            <span css={row.isCode
              ? classes.codeValue
              : classes.rowValue}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CmsFormSummary;
