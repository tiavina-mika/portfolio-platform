import ButtonBase from '@mui/material/ButtonBase';
import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import type { Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';

import EmptyData from '@/components/EmptyData';
import { ExportIcon } from '@/components/icons/ListToolbarIcons';
import {
  CHART_HEIGHT, STATISTICS_BLOCK_GAP, STATISTICS_BLOCK_GAP_COMPACT, STATISTICS_BLOCK_HEADER_GAP,
  STATISTICS_BLOCK_HEADER_GAP_MOBILE, STATISTICS_BLOCK_PADDING_BOTTOM,
  STATISTICS_BLOCK_PADDING_BOTTOM_COMPACT, STATISTICS_BLOCK_PADDING_TOP,
  STATISTICS_BLOCK_PADDING_TOP_COMPACT, STATISTICS_BLOCK_PADDING_X,
  STATISTICS_BLOCK_PADDING_X_COMPACT, STATISTICS_BLOCK_PADDING_X_MOBILE, STATISTICS_CSV_BUTTON_GAP,
  STATISTICS_CSV_BUTTON_HEIGHT, STATISTICS_CSV_BUTTON_HEIGHT_COMPACT,
  STATISTICS_CSV_BUTTON_HEIGHT_MOBILE, STATISTICS_CSV_BUTTON_HOVER_BORDER_OPACITY,
  STATISTICS_CSV_BUTTON_PADDING_X, STATISTICS_CSV_ICON_SIZE, STATISTICS_SKELETON_BLOCKS,
  STATISTICS_SKELETON_TITLE_HEIGHT, STATISTICS_SKELETON_TITLE_WIDTH,
} from '@/constants/_core/ui/chart.constants';
import { CONTENT_PADDING_X_MOBILE } from '@/constants/_core/ui/page.constants';
import { FONT_SIZE_OVERLINE, RADIUS } from '@/constants/_core/ui/ui.constants';
import { getAccentTextColor } from '@/utils/_core/theme/styles.utils';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

const classes = {
  /*
   * on a phone the card runs edge to edge, closed by its top and bottom borders only: inset from a
   * 360px screen, a chart loses a tenth of its width to margins that hold nothing
   */
  block: (theme: Theme) => ({
    display: 'flex',
    flexDirection: 'column' as const,
    gap: STATISTICS_BLOCK_GAP,
    minWidth: 0,
    paddingTop: STATISTICS_BLOCK_PADDING_TOP,
    paddingInline: STATISTICS_BLOCK_PADDING_X,
    paddingBottom: STATISTICS_BLOCK_PADDING_BOTTOM,
    [theme.breakpoints.down('lg')]: {
      gap: STATISTICS_BLOCK_GAP_COMPACT,
      paddingTop: STATISTICS_BLOCK_PADDING_TOP_COMPACT,
      paddingInline: STATISTICS_BLOCK_PADDING_X_COMPACT,
      paddingBottom: STATISTICS_BLOCK_PADDING_BOTTOM_COMPACT,
    },
    [theme.breakpoints.down('sm')]: {
      marginInline: -CONTENT_PADDING_X_MOBILE,
      paddingInline: STATISTICS_BLOCK_PADDING_X_MOBILE,
      borderRadius: 0,
      borderLeft: 'none',
      borderRight: 'none',
    },
  }),
  header: (theme: Theme) => ({
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: STATISTICS_BLOCK_HEADER_GAP,
    [theme.breakpoints.down('sm')]: { gap: STATISTICS_BLOCK_HEADER_GAP_MOBILE },
  }),
  title: { textWrap: 'pretty' as const },
  // pushed to the end of the header row, so it stays put whether a change chip stands before it or not
  csvButton: (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      marginLeft: 'auto',
      display: 'inline-flex',
      alignItems: 'center',
      gap: STATISTICS_CSV_BUTTON_GAP,
      height: STATISTICS_CSV_BUTTON_HEIGHT,
      padding: `0 ${STATISTICS_CSV_BUTTON_PADDING_X}px`,
      fontSize: FONT_SIZE_OVERLINE,
      fontWeight: theme.typography.fontWeightMedium,
      color: tokens.textSecondary,
      backgroundColor: tokens.surface,
      border: `1px solid ${tokens.border}`,
      borderRadius: RADIUS,
      transition: theme.transitions.create(['border-color', 'color'], {
        duration: theme.transitions.duration.shortest,
      }),
      '&:hover': {
        color: getAccentTextColor(theme),
        borderColor: alpha(theme.palette.primary.main, STATISTICS_CSV_BUTTON_HOVER_BORDER_OPACITY),
      },
      '&.Mui-focusVisible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 1 },
      [theme.breakpoints.down('lg')]: { height: STATISTICS_CSV_BUTTON_HEIGHT_COMPACT },
      [theme.breakpoints.down('sm')]: { height: STATISTICS_CSV_BUTTON_HEIGHT_MOBILE },
    };
  },
};

type Props = {
  title: string;
  // how the card's figure moved against the previous period, standing next to the title
  comparison?: ReactNode;
  // writes the card's own figures to a CSV file — the card offers no export when omitted
  onExportCsv?: () => void;
  children: ReactNode;
};

/**
 * One chart of a statistics view: its title, how it moved against the previous period, the export of
 * its own figures, then the chart. Each card exports only what it draws, so a reader who wants the
 * refunds does not have to dig them out of a file holding the whole view.
 */
const StatisticsBlock = ({
  title, comparison, onExportCsv, children,
}: Props) => {
  const { t } = useTranslation(['statistics']);

  return (
    <Card component="section" css={classes.block}>
      <div css={classes.header}>
        <Typography component="h3" css={classes.title} variant="h5">{title}</Typography>
        {comparison}
        {onExportCsv && (
          <ButtonBase
            aria-label={t('statistics:exportBlockCsv', { title })}
            css={classes.csvButton}
            onClick={onExportCsv}
          >
            <ExportIcon size={STATISTICS_CSV_ICON_SIZE} />
            {t('statistics:csv')}
          </ButtonBase>
        )}
      </div>
      {children}
    </Card>
  );
};

/** A view on its way: each card stands in with the shape of a titled chart. */
export const StatisticsBlocksSkeleton = () => (
  <>
    {[...Array(STATISTICS_SKELETON_BLOCKS)].map((_, index) => (
      <Card css={classes.block} key={index}>
        <Skeleton
          height={STATISTICS_SKELETON_TITLE_HEIGHT}
          variant="rounded"
          width={STATISTICS_SKELETON_TITLE_WIDTH}
        />
        <Skeleton height={CHART_HEIGHT} variant="rounded" />
      </Card>
    ))}
  </>
);

/**
 * One card's body on its way while the rest of the view is already drawn: a block read apart from
 * the view's figures keeps its title and stands in with the shape of its chart.
 */
export const StatisticsBlockBodySkeleton = () => (
  <Skeleton height={CHART_HEIGHT} variant="rounded" />
);

/** A view with nothing to draw over the period: one card saying so, in place of a column of flat charts. */
export const StatisticsEmptyBlock = () => (
  <Card css={classes.block}>
    <EmptyData />
  </Card>
);

export default StatisticsBlock;
