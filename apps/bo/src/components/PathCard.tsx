import { Card, CardContent, CardHeader } from '@mui/material';
import { alpha } from '@mui/material/styles';

import type { PathStepState, PathTone } from '@/types/_core/path.type';
import type { DateType } from '@/types/_core/utils.type';
import type { Theme } from '@mui/material/styles';

import {
  PATH_ARROW_COMPACT_PADDING_Y, PATH_ARROW_FONT_SIZE, PATH_ARROW_TOP, PATH_BODY_GAP,
  PATH_CURRENT_BORDER_WIDTH, PATH_DATE_FONT_SIZE, PATH_DONE_BORDER_OPACITY,
  PATH_DONE_FILL_OPACITY, PATH_DOT_FONT_SIZE, PATH_DOT_SIZE, PATH_EXIT_FONT_SIZE,
  PATH_EXIT_HEIGHT, PATH_EXIT_PADDING_X, PATH_EXIT_RADIUS, PATH_EXIT_SKIPPED_OPACITY,
  PATH_EXITS_GAP, PATH_EXITS_PADDING_TOP, PATH_LABEL_COMPACT_FONT_SIZE,
  PATH_LABEL_FONT_SIZE, PATH_LABEL_LINE_HEIGHT, PATH_POSITION_FONT_SIZE,
  PATH_STEP_COMPACT_GAP, PATH_STEP_COMPACT_PADDING_X, PATH_STEP_COMPACT_PADDING_Y,
  PATH_STEP_GAP, PATH_STEP_HEAD_GAP, PATH_STEP_PADDING_X, PATH_STEP_PADDING_Y,
  PATH_STEPS_GAP, PATH_STOP_BORDER_OPACITY, PATH_STOP_FILL_OPACITY,
  PATH_TAG_FONT_SIZE, PATH_TAG_LETTER_SPACING, PATH_WAIT_COMPACT_PADDING,
  PATH_WAIT_DUE_FONT_SIZE, PATH_WAIT_EXTRA_FONT_SIZE, PATH_WAIT_FONT_SIZE, PATH_WAIT_GAP,
  PATH_WAIT_LINE_HEIGHT, PATH_WAIT_PADDING_X, PATH_WAIT_PADDING_Y,
  PATH_WAIT_TAG_FONT_SIZE,
} from '@/constants/_core/ui/path.constants';
import { useBreakpoint } from '@/hooks/_core/useBreakpoint';
import { displayDate } from '@/utils/_core/date.utils';
import { getAccentTextColor, getStatusTintStyles } from '@/utils/_core/theme/styles.utils';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

const classes = {
  body: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${PATH_BODY_GAP}px`,
  },
  position: (theme: Theme) => ({
    fontSize: PATH_POSITION_FONT_SIZE,
    color: getDesignTokens(theme).textMuted,
  }),
  steps: (isCompact: boolean, stepCount: number) => ({
    margin: 0,
    padding: 0,
    listStyle: 'none',
    display: isCompact
      ? 'flex'
      : 'grid',
    flexDirection: 'column' as const,
    gridTemplateColumns: `repeat(${stepCount}, 1fr)`,
    columnGap: `${PATH_STEPS_GAP}px`,
    // side by side, a step keeps the height its own text needs; stacked, each fills the column
    alignItems: isCompact
      ? 'stretch'
      : 'start',
  }),
  // the arrow of the horizontal course is drawn in the gap, so the step it leaves anchors it
  stepItem: (isCompact: boolean) => ({
    position: isCompact
      ? undefined
      : 'relative' as const,
    display: 'flex',
    flexDirection: 'column' as const,
  }),
  step: (state: PathStepState, isCompact: boolean) => (theme: Theme) => {
    const tokens = getDesignTokens(theme);
    const base = {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: `${isCompact
        ? PATH_STEP_COMPACT_GAP
        : PATH_STEP_GAP}px`,
      padding: isCompact
        ? `${PATH_STEP_COMPACT_PADDING_Y}px ${PATH_STEP_COMPACT_PADDING_X}px`
        : `${PATH_STEP_PADDING_Y}px ${PATH_STEP_PADDING_X}px`,
      borderRadius: 8,
      border: `1px solid ${tokens.border}`,
      backgroundColor: tokens.surface,
      width: '100%',
    };

    if (state === 'done') {
      return {
        ...base,
        backgroundColor: alpha(theme.palette.primary.main, PATH_DONE_FILL_OPACITY),
        borderColor: alpha(theme.palette.primary.main, PATH_DONE_BORDER_OPACITY),
      };
    }

    if (state === 'current') {
      return {
        ...base,
        // the thicker edge replaces the hairline: the node must not grow with it
        padding: `calc(${isCompact ? PATH_STEP_COMPACT_PADDING_Y : PATH_STEP_PADDING_Y}px - ` +
          `${PATH_CURRENT_BORDER_WIDTH - 1}px) calc(${isCompact
            ? PATH_STEP_COMPACT_PADDING_X
            : PATH_STEP_PADDING_X}px - ${PATH_CURRENT_BORDER_WIDTH - 1}px)`,
        backgroundColor: alpha(theme.palette.primary.main, tokens.tintOpacity),
        border: `${PATH_CURRENT_BORDER_WIDTH}px solid ${theme.palette.primary.main}`,
      };
    }

    if (state === 'stop') {
      return {
        ...base,
        backgroundColor: alpha(theme.palette.error.main, PATH_STOP_FILL_OPACITY),
        borderColor: alpha(theme.palette.error.main, PATH_STOP_BORDER_OPACITY),
      };
    }

    return base;
  },
  stepHead: {
    display: 'flex',
    alignItems: 'center',
    gap: `${PATH_STEP_HEAD_GAP}px`,
  },
  dot: (state: PathStepState) => (theme: Theme) => {
    const tokens = getDesignTokens(theme);
    const base = {
      width: PATH_DOT_SIZE,
      height: PATH_DOT_SIZE,
      flex: 'none',
      borderRadius: '50%',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box' as const,
      fontSize: PATH_DOT_FONT_SIZE,
      fontWeight: 700,
    };

    if (state === 'done') {
      return {
        ...base,
        color: theme.palette.primary.contrastText,
        backgroundColor: theme.palette.primary.main,
        border: `1px solid ${theme.palette.primary.dark}`,
      };
    }

    if (state === 'current') {
      return {
        ...base,
        color: getAccentTextColor(theme),
        backgroundColor: tokens.surface,
        border: `${PATH_CURRENT_BORDER_WIDTH}px solid ${theme.palette.primary.main}`,
      };
    }

    if (state === 'stop') {
      return {
        ...base,
        color: theme.palette.error.contrastText,
        backgroundColor: theme.palette.error.main,
        border: `1px solid ${theme.palette.error.dark}`,
      };
    }

    return {
      ...base,
      color: tokens.textMuted,
      backgroundColor: tokens.surface,
      border: `1px solid ${tokens.border}`,
    };
  },
  tag: (state: PathStepState) => (theme: Theme) => ({
    fontSize: PATH_TAG_FONT_SIZE,
    fontWeight: 600,
    letterSpacing: `${PATH_TAG_LETTER_SPACING}px`,
    textTransform: 'uppercase' as const,
    color: ({
      done: getAccentTextColor(theme),
      current: getAccentTextColor(theme),
      stop: theme.palette.error.main,
      todo: getDesignTokens(theme).textMuted,
    })[state],
  }),
  label: (state: PathStepState, isCompact: boolean) => (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      fontSize: isCompact
        ? PATH_LABEL_COMPACT_FONT_SIZE
        : PATH_LABEL_FONT_SIZE,
      lineHeight: PATH_LABEL_LINE_HEIGHT,
      textWrap: 'pretty' as const,
      color: state === 'todo'
        ? tokens.textMuted
        : tokens.text,
      fontWeight: state === 'current' || state === 'stop'
        ? 600
        : 500,
    };
  },
  date: (state: PathStepState) => (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      fontSize: PATH_DATE_FONT_SIZE,
      color: state === 'todo'
        ? tokens.textMuted
        : tokens.textSecondary,
    };
  },
  // pointing right out of the node in the horizontal course, down to the next one in the stacked one
  arrow: (isReached: boolean, isCompact: boolean) => (theme: Theme) => ({
    textAlign: 'center' as const,
    fontSize: PATH_ARROW_FONT_SIZE,
    lineHeight: 1,
    color: isReached
      ? theme.palette.primary.main
      : getDesignTokens(theme).border,
    ...(isCompact
      ? { padding: `${PATH_ARROW_COMPACT_PADDING_Y}px 0` }
      : {
        position: 'absolute' as const,
        right: -PATH_STEPS_GAP,
        width: PATH_STEPS_GAP,
        top: PATH_ARROW_TOP,
      }),
  }),
  wait: (tone: PathTone, isCompact: boolean) => (theme: Theme) => {
    const tint = getStatusTintStyles(theme, tone);

    return {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: `${PATH_WAIT_GAP}px`,
      padding: isCompact
        ? `${PATH_WAIT_COMPACT_PADDING}px`
        : `${PATH_WAIT_PADDING_Y}px ${PATH_WAIT_PADDING_X}px`,
      borderRadius: 6,
      backgroundColor: tint.backgroundColor,
      border: `1px solid ${tint.borderColor}`,
    };
  },
  waitTag: (tone: PathTone) => (theme: Theme) => ({
    fontSize: PATH_WAIT_TAG_FONT_SIZE,
    fontWeight: 600,
    letterSpacing: `${PATH_TAG_LETTER_SPACING}px`,
    textTransform: 'uppercase' as const,
    color: getStatusTintStyles(theme, tone).color,
  }),
  waitText: (theme: Theme) => ({
    fontSize: PATH_WAIT_FONT_SIZE,
    lineHeight: PATH_WAIT_LINE_HEIGHT,
    color: getDesignTokens(theme).text,
    textWrap: 'pretty' as const,
  }),
  waitDue: (theme: Theme) => ({
    fontSize: PATH_WAIT_DUE_FONT_SIZE,
    lineHeight: PATH_WAIT_LINE_HEIGHT,
    color: getDesignTokens(theme).textSecondary,
    textWrap: 'pretty' as const,
  }),
  waitExtra: (theme: Theme) => ({
    fontSize: PATH_WAIT_EXTRA_FONT_SIZE,
    lineHeight: PATH_WAIT_LINE_HEIGHT,
    color: getDesignTokens(theme).textMuted,
    textWrap: 'pretty' as const,
  }),
  exits: (theme: Theme) => ({
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: `${PATH_EXITS_GAP}px`,
    paddingTop: PATH_EXITS_PADDING_TOP,
    borderTop: `1px dashed ${getDesignTokens(theme).border}`,
  }),
  exitsLabel: (theme: Theme) => ({
    fontSize: PATH_POSITION_FONT_SIZE,
    color: getDesignTokens(theme).textMuted,
  }),
  exit: (isTaken: boolean) => (theme: Theme) => {
    const tokens = getDesignTokens(theme);
    const tint = isTaken
      ? getStatusTintStyles(theme, 'error')
      : {
        color: tokens.textSecondary,
        backgroundColor: tokens.surfaceSecondary,
        borderColor: tokens.border,
      };

    return {
      display: 'inline-flex',
      alignItems: 'center',
      height: PATH_EXIT_HEIGHT,
      padding: `0 ${PATH_EXIT_PADDING_X}px`,
      borderRadius: PATH_EXIT_RADIUS,
      fontSize: PATH_EXIT_FONT_SIZE,
      whiteSpace: 'nowrap' as const,
      fontWeight: isTaken
        ? 600
        : 500,
      opacity: isTaken
        ? 1
        : PATH_EXIT_SKIPPED_OPACITY,
      color: tint.color,
      backgroundColor: tint.backgroundColor,
      border: `1px solid ${tint.borderColor}`,
    };
  },
};

export type PathCardStep = {
  key: string;
  label: string;
  state: PathStepState;
  // when the entity reached the step; absent on a record older than the milestone columns
  date?: DateType;
};

export type PathCardExit = {
  key: string;
  label: string;
  // the one the entity took stands out, the others step back
  isTaken: boolean;
};

export type PathCardNarration = {
  // what the entity is waiting for
  wait: string;
  // when it will happen, or when it did
  due?: string;
  // the one thing worth adding
  extra?: string;
};

type Props = {
  title: string;
  // "Step 2 of 5", written by the caller since it is a translated sentence
  position: string;
  // 1-based rank of the step the entity stands on, or was interrupted at
  reachedPosition: number;
  steps: PathCardStep[];
  tone: PathTone;
  narration: PathCardNarration;
  // the narration is tagged with where the entity stands: stopped on a step, or on its way
  isInterrupted: boolean;
  stateTags: Record<PathStepState, string>;
  exitsLabel: string;
  exits: PathCardExit[];
};

/**
 * The course an entity is meant to follow, drawn as steps: where it stands, when it got there,
 * what it is waiting for now — and, when it never got to the end, the step it was stopped at and
 * the way out it took.
 *
 * Wide, the steps run left to right with an arrow in the gap between two; narrow, they stack with
 * the arrow underneath.
 */
const PathCard = ({
  title, position, reachedPosition, steps, tone, narration, isInterrupted, stateTags, exitsLabel, exits,
}: Props) => {
  const isCompact = useBreakpoint();

  return (
    <Card>
      <CardHeader
        action={<span css={classes.position}>{position}</span>}
        title={title}
      />
      <CardContent css={classes.body}>
        <ol css={classes.steps(isCompact, steps.length)}>
          {steps.map((step, index) => (
            <li
              css={classes.stepItem(isCompact)}
              key={step.key}
              aria-current={step.state === 'current'
                ? 'step'
                : undefined}
            >
              <div css={classes.step(step.state, isCompact)}>
                <div css={classes.stepHead}>
                  <span css={classes.dot(step.state)}>{index + 1}</span>
                  <span css={classes.tag(step.state)}>{stateTags[step.state]}</span>
                </div>
                <span css={classes.label(step.state, isCompact)}>{step.label}</span>
                <span css={classes.date(step.state)}>
                  {step.date
                    ? displayDate(step.date)
                    : '—'}
                </span>
              </div>
              {index < steps.length - 1 && (
                <span aria-hidden="true" css={classes.arrow(index + 1 < reachedPosition, isCompact)}>
                  {isCompact
                    ? '↓'
                    : '→'}
                </span>
              )}
            </li>
          ))}
        </ol>
        {narration.wait && (
          <div css={classes.wait(tone, isCompact)}>
            <span css={classes.waitTag(tone)}>
              {isInterrupted
                ? stateTags.stop
                : stateTags.current}
            </span>
            <span css={classes.waitText}>{narration.wait}</span>
            {narration.due && <span css={classes.waitDue}>{narration.due}</span>}
            {narration.extra && <span css={classes.waitExtra}>{narration.extra}</span>}
          </div>
        )}
        <div css={classes.exits}>
          <span css={classes.exitsLabel}>{exitsLabel}</span>
          {exits.map((exit) => (
            <span css={classes.exit(exit.isTaken)} key={exit.key}>{exit.label}</span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PathCard;
