import { FormHelperText, Skeleton } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useId, useState } from 'react';
import { FiCheck } from 'react-icons/fi';

import type { Theme } from '@mui/material/styles';

import InputLabel from '@/components/form/InputLabel';
import {
  BUTTON_HEIGHT, CHIP_ROW_GAP, CHOICE_CHIP_FOCUS_RING_OPACITY, CHOICE_CHIP_GAP,
  CHOICE_CHIP_DEPTH_INDENT, CHOICE_CHIP_MARK_BORDER_WIDTH, CHOICE_CHIP_MARK_GLYPH_SIZE, CHOICE_CHIP_MARK_SIZE,
  CHOICE_CHIP_PADDING_X, CHOICE_CHIP_RADIUS, CHOICE_CHIP_SKELETON_COUNT, CHOICE_CHIP_SKELETON_WIDTH,
  CHOICE_CHIP_HINT_GAP, CHOICE_CHIP_HINT_PADDING_Y, CHOICE_CHIP_STACKED_GAP, FONT_SIZE_BODY, FONT_SIZE_META,
} from '@/constants/_core/ui.constants';
import { IChoiceChipOption } from '@/types/_core/app.type';
import { getDesignTokens, getTintedBackground } from '@/utils/_core/theme/tokens.utils';

const classes = {
  root: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${CHIP_ROW_GAP}px`,
  },
  row: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: `${CHIP_ROW_GAP}px`,
  },
  // one pill per line, left-aligned, so the indent of a nested option is what shows the tree
  stackedRow: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    gap: `${CHOICE_CHIP_STACKED_GAP}px`,
  },
  indent: (depth: number) => ({ marginLeft: depth * CHOICE_CHIP_DEPTH_INDENT }),
  chip: (selected: boolean) => (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      display: 'inline-flex',
      alignItems: 'center',
      gap: `${CHOICE_CHIP_GAP}px`,
      height: BUTTON_HEIGHT,
      padding: `0 ${CHOICE_CHIP_PADDING_X}px`,
      font: 'inherit',
      fontSize: FONT_SIZE_BODY,
      fontWeight: theme.typography.fontWeightMedium,
      borderRadius: CHOICE_CHIP_RADIUS,
      cursor: 'pointer',
      outline: 'none',
      '&:focus-visible': {
        boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, CHOICE_CHIP_FOCUS_RING_OPACITY)}`,
      },
      '&:disabled': { cursor: 'default', opacity: 0.5 },
      ...(selected
        ? {
          color: theme.palette.primary.dark,
          backgroundColor: getTintedBackground(theme, theme.palette.primary.main),
          border: `1px solid ${alpha(theme.palette.primary.main, CHOICE_CHIP_FOCUS_RING_OPACITY)}`,
        }
        : {
          color: theme.palette.text.secondary,
          backgroundColor: tokens.surface,
          border: `1px solid ${tokens.border}`,
          '&:hover:not(:disabled)': { color: theme.palette.text.primary },
        }),
    };
  },
  // the round mark on the leading edge — empty until the chip holds the choice
  mark: (selected: boolean) => (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: CHOICE_CHIP_MARK_SIZE,
      height: CHOICE_CHIP_MARK_SIZE,
      flexShrink: 0,
      borderRadius: '50%',
      color: theme.palette.primary.contrastText,
      backgroundColor: selected
        ? theme.palette.primary.main
        : tokens.surface,
      border: `${CHOICE_CHIP_MARK_BORDER_WIDTH}px solid ${selected
        ? theme.palette.primary.main
        : tokens.borderInput}`,
    };
  },
  // an option stating a hint grows to hold it instead of squeezing two lines into a button's height
  withHint: {
    height: 'auto',
    minHeight: BUTTON_HEIGHT,
    padding: `${CHOICE_CHIP_HINT_PADDING_Y}px ${CHOICE_CHIP_PADDING_X}px`,
  },
  labelBlock: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    gap: `${CHOICE_CHIP_HINT_GAP}px`,
    textAlign: 'left' as const,
  },
  hint: (theme: Theme) => ({
    fontSize: FONT_SIZE_META,
    fontWeight: theme.typography.fontWeightRegular,
    color: theme.palette.text.secondary,
  }),
  skeleton: { borderRadius: CHOICE_CHIP_RADIUS },
};

export type ChoiceChipsInputBaseProps = {
  options: IChoiceChipOption[];
  /** one pill per line instead of a wrapping row — the layout of a tree, each option indented by its depth */
  isStacked?: boolean;
  label?: string;
  /** marks the label with the required asterisk — the check itself stays in the form schema */
  required?: boolean;
  helperText?: string;
  errorMessage?: string;
  loading?: boolean;
  disabled?: boolean;
};

type SingleChoiceProps = ChoiceChipsInputBaseProps & {
  multiple?: false;
  value?: string | null;
  /** called with `undefined` when the chip already holding the choice is clicked again */
  onChange?: (value: string | undefined) => void;
};

/*
 * several pills can be held at once — each click toggles its own pill, and the value is the list of
 * the held ones, in the order they were picked
 */
type MultipleChoiceProps = ChoiceChipsInputBaseProps & {
  multiple: true;
  value?: string[] | null;
  onChange?: (value: string[]) => void;
};

export type ChoiceChipsInputProps = SingleChoiceProps | MultipleChoiceProps;

const toSelectedValues = (value?: string | string[] | null): string[] | undefined => {
  if (value === undefined) return undefined;
  if (value === null) return [];
  return Array.isArray(value)
    ? value
    : [value];
};

/**
 * A choice laid out as a row of pills rather than hidden in a dropdown: when the set is short,
 * seeing every alternative at once is faster than opening a list to read it. A single choice is
 * cleared by clicking the held pill again; with `multiple`, each pill toggles on its own.
 */
const ChoiceChipsInput = (props: ChoiceChipsInputProps) => {
  const {
    options, value, label, required: isRequired, helperText, errorMessage, loading,
    disabled: isDisabled, isStacked,
  } = props;
  // works uncontrolled too (Storybook, a no-op onChange): the display follows the last click
  const idPrefix = useId();
  const [internalValues, setInternalValues] = useState<string[]>(toSelectedValues(value) ?? []);
  const selectedValues = toSelectedValues(value) ?? internalValues;

  const handleClick = (optionValue: string) => {
    const isSelected = selectedValues.includes(optionValue);

    if (props.multiple) {
      const nextValues = isSelected
        ? selectedValues.filter((selectedValue) => selectedValue !== optionValue)
        : [...selectedValues, optionValue];

      setInternalValues(nextValues);
      props.onChange?.(nextValues);
      return;
    }

    const nextValue = isSelected
      ? undefined
      : optionValue;

    setInternalValues(nextValue
      ? [nextValue]
      : []);
    props.onChange?.(nextValue);
  };

  return (
    <div css={classes.root}>
      {label && <InputLabel label={label} required={isRequired} />}
      <div
        aria-label={label}
        css={isStacked
          ? classes.stackedRow
          : classes.row}
        role={props.multiple
          ? 'group'
          : 'radiogroup'}
      >
        {loading
          ? Array.from({ length: CHOICE_CHIP_SKELETON_COUNT }, (_, index) => (
            <Skeleton
              css={classes.skeleton}
              height={BUTTON_HEIGHT}
              key={index}
              variant="rounded"
              width={CHOICE_CHIP_SKELETON_WIDTH}
            />
          ))
          : options.filter((option) => !option.hide).map((option) => {
            const isSelected = selectedValues.includes(option.value);
            const hintId = `${idPrefix}-${option.value}-hint`;

            return (
              <button
                aria-checked={isSelected}
                disabled={isDisabled || option.disabled}
                key={option.value}
                onClick={() => handleClick(option.value)}
                type="button"
                aria-describedby={option.hint
                  ? hintId
                  : undefined}
                css={[
                  classes.chip(isSelected),
                  option.hint && classes.withHint,
                  isStacked && classes.indent(option.depth ?? 0),
                ]}
                role={props.multiple
                  ? 'checkbox'
                  : 'radio'}
              >
                <span css={classes.mark(isSelected)}>
                  {isSelected && <FiCheck size={CHOICE_CHIP_MARK_GLYPH_SIZE} strokeWidth={4} />}
                </span>
                {option.hint
                  ? (
                    <span css={classes.labelBlock}>
                      <span>{option.label}</span>
                      <span css={classes.hint} id={hintId}>{option.hint}</span>
                    </span>
                  )
                  : option.label}
              </button>
            );
          })}
      </div>
      {errorMessage && <FormHelperText error>{errorMessage}</FormHelperText>}
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </div>
  );
};

export default ChoiceChipsInput;
