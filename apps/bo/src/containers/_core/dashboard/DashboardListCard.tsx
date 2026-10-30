import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import Skeleton from '@mui/material/Skeleton';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { FiArrowRight } from 'react-icons/fi';

import type { Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';

import EmptyData from '@/components/EmptyData';
import {
  DASHBOARD_ACTIVITY_BODY_PADDING_X, DASHBOARD_ACTIVITY_BODY_PADDING_Y, DASHBOARD_ACTIVITY_ROW_GAP,
  DASHBOARD_ACTIVITY_ROW_PADDING_Y, DASHBOARD_ALERT_BODY_PADDING_BOTTOM,
  DASHBOARD_ALERT_BODY_PADDING_TOP, DASHBOARD_ALERT_ROW_GAP, DASHBOARD_ALERT_ROW_PADDING_Y,
  DASHBOARD_ALERT_TONE_OPACITY, DASHBOARD_CARD_FOOTER_PADDING_X, DASHBOARD_CARD_FOOTER_PADDING_Y,
  DASHBOARD_CARD_HEADER_GAP, DASHBOARD_CARD_ICON_SIZE, DASHBOARD_COLUMN_TITLE_GAP,
  DASHBOARD_COUNT_PILL_HEIGHT, DASHBOARD_COUNT_PILL_NEUTRAL_OPACITY, DASHBOARD_COUNT_PILL_PADDING_X,
  DASHBOARD_EMPTY_PADDING_X, DASHBOARD_EMPTY_PADDING_Y, DASHBOARD_SKELETON_BODY_PADDING_BOTTOM,
  DASHBOARD_SKELETON_BODY_PADDING_TOP, DASHBOARD_SKELETON_LINE_HEIGHT, DASHBOARD_SKELETON_LINES_GAP,
  DASHBOARD_SKELETON_META_HEIGHT, DASHBOARD_SKELETON_ROW_GAP, DASHBOARD_SKELETON_ROW_PADDING_Y,
  DASHBOARD_SKELETON_TITLE_HEIGHT, DASHBOARD_SKELETON_TITLE_WIDTH,
  DASHBOARD_SKELETON_TRAILING_WIDTH,
} from '@/constants/_core/ui/chart.constants';
import {
  CARD_HEADER_MIN_HEIGHT, CARD_HEADER_PADDING_Y, CARD_PADDING_X,
} from '@/constants/_core/ui/page.constants';
import { FONT_SIZE_OVERLINE } from '@/constants/_core/ui/ui.constants';
import { getAccentTextColor, getStatusSolidColor } from '@/utils/_core/theme/styles.utils';
import { getDesignTokens, getTintedBackground } from '@/utils/_core/theme/tokens.utils';

type Tone = keyof typeof DASHBOARD_ALERT_TONE_OPACITY;

type Variant = 'alert' | 'activity';

const classes = {
  column: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${DASHBOARD_COLUMN_TITLE_GAP}px`,
  },
  card: (theme: Theme, tone?: Tone) => ({
    // the tinted head has to follow the rounded corners of the card
    overflow: 'hidden',
    ...(tone && { borderColor: alpha(theme.palette[tone].main, DASHBOARD_ALERT_TONE_OPACITY[tone].border) }),
  }),
  header: (theme: Theme, tone?: Tone) => ({
    display: 'flex',
    alignItems: 'center',
    gap: `${DASHBOARD_CARD_HEADER_GAP}px`,
    minHeight: CARD_HEADER_MIN_HEIGHT,
    padding: `${CARD_HEADER_PADDING_Y}px ${CARD_PADDING_X}px`,
    borderBottom: `1px solid ${tone
      ? alpha(theme.palette[tone].main, DASHBOARD_ALERT_TONE_OPACITY[tone].headerBorder)
      : getDesignTokens(theme).borderLight}`,
    ...(tone && {
      backgroundColor: alpha(theme.palette[tone].main, DASHBOARD_ALERT_TONE_OPACITY[tone].headerBackground),
    }),
  }),
  headerIcon: (theme: Theme, tone?: Tone) => ({
    display: 'flex',
    flexShrink: 0,
    color: tone
      ? getStatusSolidColor(theme, tone)
      : getDesignTokens(theme).textSecondary,
  }),
  headerText: {
    display: 'flex',
    flexDirection: 'column' as const,
    minWidth: 0,
  },
  // the count is solid while it is a backlog, and drops to a neutral wash once it is zero
  countPill: (theme: Theme, tone?: Tone) => {
    const tokens = getDesignTokens(theme);

    return {
      marginLeft: 'auto',
      display: 'inline-flex',
      alignItems: 'center',
      flexShrink: 0,
      height: DASHBOARD_COUNT_PILL_HEIGHT,
      padding: `0 ${DASHBOARD_COUNT_PILL_PADDING_X}px`,
      borderRadius: DASHBOARD_COUNT_PILL_HEIGHT / 2,
      fontSize: FONT_SIZE_OVERLINE,
      fontWeight: 600,
      ...(tone
        ? { color: theme.palette.common.white, backgroundColor: getStatusSolidColor(theme, tone) }
        : {
          color: tokens.textSecondary,
          backgroundColor: alpha(tokens.textSecondary, DASHBOARD_COUNT_PILL_NEUTRAL_OPACITY),
        }),
    };
  },
  // rows are ruled between each other, never under the last one: the footer draws its own rule
  rows: (theme: Theme) => ({
    '& > *:not(:last-child)': { borderBottom: `1px solid ${getDesignTokens(theme).borderLight}` },
  }),
  body: (variant: Variant) => ({
    padding: variant === 'alert'
      ? `${DASHBOARD_ALERT_BODY_PADDING_TOP}px ${CARD_PADDING_X}px ${DASHBOARD_ALERT_BODY_PADDING_BOTTOM}px`
      : `${DASHBOARD_ACTIVITY_BODY_PADDING_Y}px ${DASHBOARD_ACTIVITY_BODY_PADDING_X}px`,
  }),
  empty: {
    padding: `${DASHBOARD_EMPTY_PADDING_Y}px ${DASHBOARD_EMPTY_PADDING_X}px`,
  },
  footer: {
    padding: `${DASHBOARD_CARD_FOOTER_PADDING_Y}px ${DASHBOARD_CARD_FOOTER_PADDING_X}px`,
  },
  // the way to the full list reads as a link in the accent tone, not as a second action of the card
  footerLink: (theme: Theme) => ({
    color: getAccentTextColor(theme),
    '&:hover': {
      color: getAccentTextColor(theme),
      backgroundColor: getTintedBackground(theme, theme.palette.primary.main),
    },
  }),
  alertRow: {
    display: 'flex',
    alignItems: 'center',
    gap: `${DASHBOARD_ALERT_ROW_GAP}px`,
    padding: `${DASHBOARD_ALERT_ROW_PADDING_Y}px 0`,
  },
  rowText: {
    display: 'flex',
    flexDirection: 'column' as const,
    flex: 1,
    minWidth: 0,
  },
  activityRow: {
    display: 'flex',
    flexDirection: 'column' as const,
    padding: `${DASHBOARD_ACTIVITY_ROW_PADDING_Y}px 0`,
  },
  activityHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: `${DASHBOARD_ACTIVITY_ROW_GAP}px`,
    '& > :last-child:not(:first-child)': { flexShrink: 0 },
  },
  activityTitle: { minWidth: 0 },
  mutedMeta: (theme: Theme) => ({ color: getDesignTokens(theme).textDisabled }),
  skeletonBody: {
    paddingTop: DASHBOARD_SKELETON_BODY_PADDING_TOP,
    paddingBottom: DASHBOARD_SKELETON_BODY_PADDING_BOTTOM,
    paddingInline: CARD_PADDING_X,
  },
  skeletonRow: {
    display: 'flex',
    alignItems: 'center',
    gap: `${DASHBOARD_SKELETON_ROW_GAP}px`,
    padding: `${DASHBOARD_SKELETON_ROW_PADDING_Y}px 0`,
  },
  skeletonLines: {
    display: 'flex',
    flexDirection: 'column' as const,
    flex: 1,
    gap: `${DASHBOARD_SKELETON_LINES_GAP}px`,
  },
};

type Props = {
  title: string;
  // what the list holds, under the title — for a card whose subject needs a rule to be read right
  subtitle?: string;
  /*
   * an alert card names its subject in a head of its own, tinted by its tone and carrying the
   * backlog count; an activity column is titled from above and its card holds only the rows
   */
  variant: Variant;
  icon?: ReactNode;
  count?: number;
  tone?: Tone;
  isEmpty: boolean;
  emptyDescription: string;
  // a card with no full list to lead to has no foot
  footerLabel?: string;
  onFooterClick?: () => void;
  children?: ReactNode;
};

/**
 * A short list of the dashboard: the few latest rows of something, then the way to its full list.
 * An empty card states no tone — no failed payment is good news, not a warning — and an empty
 * activity column names itself in its own head, since the card is then all there is of it.
 */
const DashboardListCard = ({
  title, subtitle, variant, icon, count, tone, isEmpty, emptyDescription, footerLabel, onFooterClick,
  children,
}: Props) => {
  const activeTone = isEmpty ? undefined : tone;
  const isTitleAbove = variant === 'activity' && !isEmpty;

  const card = (
    <Card sx={(theme: Theme) => classes.card(theme, activeTone)}>
      {!isTitleAbove && (
        <div css={(theme: Theme) => classes.header(theme, activeTone)}>
          {icon && <span css={(theme: Theme) => classes.headerIcon(theme, activeTone)}>{icon}</span>}
          <div css={classes.headerText}>
            <Typography component="h3" variant="h6">{title}</Typography>
            {subtitle && <Typography component="p" variant="caption">{subtitle}</Typography>}
          </div>
          {count !== undefined && (
            <span css={(theme: Theme) => classes.countPill(theme, activeTone)}>{count}</span>
          )}
        </div>
      )}
      {isEmpty
        ? <EmptyData description={emptyDescription} sx={classes.empty} />
        : (
          <>
            <div css={(theme: Theme) => [classes.body(variant), classes.rows(theme)]}>
              {children}
            </div>
            {footerLabel && onFooterClick && (
              <CardActions sx={classes.footer}>
                <Button
                  endIcon={<FiArrowRight size={DASHBOARD_CARD_ICON_SIZE} />}
                  onClick={onFooterClick}
                  size="small"
                  sx={classes.footerLink}
                  variant="text"
                >
                  {footerLabel}
                </Button>
              </CardActions>
            )}
          </>
        )}
    </Card>
  );

  if (!isTitleAbove) return card;

  return (
    <div css={classes.column}>
      <Typography component="h3" variant="h6">{title}</Typography>
      {card}
    </div>
  );
};

type AlertRowProps = {
  title: ReactNode;
  meta: ReactNode;
  // what closes the row on the right: an amount, a reason, a status
  children?: ReactNode;
};

export const DashboardAlertRow = ({
  title, meta, children,
}: AlertRowProps) => (
  <div css={classes.alertRow}>
    <div css={classes.rowText}>
      {/* a div: the title may hold a chip, which is a block and cannot sit in a paragraph */}
      <Typography component="div" variant="body1">{title}</Typography>
      <Typography component="p" variant="caption">{meta}</Typography>
    </div>
    {children}
  </div>
);

type ActivityRowProps = {
  title: string;
  status?: ReactNode;
  // the meta lines under the title
  children?: ReactNode;
};

export const DashboardActivityRow = ({
  title, status, children,
}: ActivityRowProps) => (
  <div css={classes.activityRow}>
    <div css={classes.activityHead}>
      <Typography noWrap css={classes.activityTitle} variant="body1">{title}</Typography>
      {status}
    </div>
    {children}
  </div>
);

type RowMetaProps = {
  children: ReactNode;
  // a line that only dates the row, set back behind the line it qualifies
  isMuted?: boolean;
};

export const DashboardRowMeta = ({
  children, isMuted,
}: RowMetaProps) => (
  <Typography
    noWrap
    component="p"
    css={isMuted ? classes.mutedMeta : undefined}
    variant="caption"
  >
    {children}
  </Typography>
);

type SkeletonProps = {
  rows: number;
};

export const DashboardListCardSkeleton = ({ rows }: SkeletonProps) => (
  <Card>
    <div css={(theme: Theme) => classes.header(theme)}>
      <Skeleton
        height={DASHBOARD_SKELETON_TITLE_HEIGHT}
        variant="rounded"
        width={DASHBOARD_SKELETON_TITLE_WIDTH}
      />
    </div>
    <div css={(theme: Theme) => [classes.skeletonBody, classes.rows(theme)]}>
      {Array.from({ length: rows }, (_, index) => (
        <div css={classes.skeletonRow} key={index}>
          <div css={classes.skeletonLines}>
            <Skeleton height={DASHBOARD_SKELETON_LINE_HEIGHT} variant="rounded" width="55%" />
            <Skeleton height={DASHBOARD_SKELETON_META_HEIGHT} variant="rounded" width="35%" />
          </div>
          <Skeleton
            height={DASHBOARD_SKELETON_LINE_HEIGHT}
            variant="rounded"
            width={DASHBOARD_SKELETON_TRAILING_WIDTH}
          />
        </div>
      ))}
    </div>
  </Card>
);

export default DashboardListCard;
