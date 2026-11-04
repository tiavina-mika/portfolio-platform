import {
  Box, Chip, FormHelperText, OutlinedInput, Typography, type Theme,
} from '@mui/material';
import { ChangeEvent, KeyboardEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  FONT_SIZE_META, INPUT_CHIP_FONT_SIZE, INPUT_FONT_SIZE, TEXT_TO_CHIPS_CHIP_FONT_SIZE_TOUCH,
  TEXT_TO_CHIPS_CHIP_HEIGHT, TEXT_TO_CHIPS_CHIP_HEIGHT_TABLET, TEXT_TO_CHIPS_CHIP_HEIGHT_TOUCH,
  TEXT_TO_CHIPS_CHIP_PADDING_LEFT, TEXT_TO_CHIPS_CHIP_PADDING_LEFT_TOUCH,
  TEXT_TO_CHIPS_CHIP_PADDING_RIGHT, TEXT_TO_CHIPS_CHIP_PADDING_RIGHT_TOUCH, TEXT_TO_CHIPS_GAP,
  TEXT_TO_CHIPS_GAP_TOUCH, TEXT_TO_CHIPS_INPUT_HEIGHT, TEXT_TO_CHIPS_INPUT_HEIGHT_TABLET,
  TEXT_TO_CHIPS_INPUT_HEIGHT_TOUCH, TEXT_TO_CHIPS_INPUT_MIN_WIDTH,
  TEXT_TO_CHIPS_INPUT_MIN_WIDTH_TABLET, TEXT_TO_CHIPS_PADDING_X, TEXT_TO_CHIPS_PADDING_Y,
  TEXT_TO_CHIPS_REMOVE_SIZE, TEXT_TO_CHIPS_REMOVE_SIZE_TABLET, TEXT_TO_CHIPS_REMOVE_SIZE_TOUCH,
} from '@/constants/_core/ui/ui.constants';
import { useBreakpoint } from '@/hooks/_core/useBreakpoint';
import { getSeverityToneColor } from '@/utils/_core/theme/styles.utils';
import { getDesignTokens, getTintedBackground } from '@/utils/_core/theme/tokens.utils';

import InputLabel from '../InputLabel';

// the cross keeps the glyph size of the desktop chip when its slot grows into a touch target
const getRemoveGlyphInset = (size: number): number => (size - TEXT_TO_CHIPS_REMOVE_SIZE) / 2;

const classes = {
  count: (theme: Theme) => ({
    fontSize: FONT_SIZE_META,
    fontVariantNumeric: 'tabular-nums',
    color: getDesignTokens(theme).textSecondary,
  }),
  countFull: (theme: Theme) => ({ color: getSeverityToneColor(theme, 'warning') }),
  /*
   * the outlined row wraps its chips and the text box together, so the chips read as the value
   * already typed and the text box as the next one — the theme's outline, focus ring, error edge
   * and disabled ground are kept as they are
   */
  root: (theme: Theme) => ({
    flexWrap: 'wrap' as const,
    alignItems: 'center',
    gap: TEXT_TO_CHIPS_GAP,
    padding: `${TEXT_TO_CHIPS_PADDING_Y}px ${TEXT_TO_CHIPS_PADDING_X}px`,
    cursor: 'text',
    '& .MuiOutlinedInput-input': {
      flex: 1,
      minWidth: TEXT_TO_CHIPS_INPUT_MIN_WIDTH,
      height: TEXT_TO_CHIPS_INPUT_HEIGHT,
      padding: '0 4px',
      fontSize: INPUT_FONT_SIZE,
    },
    [theme.breakpoints.down('md')]: {
      '& .MuiOutlinedInput-input': {
        minWidth: TEXT_TO_CHIPS_INPUT_MIN_WIDTH_TABLET,
        height: TEXT_TO_CHIPS_INPUT_HEIGHT_TABLET,
      },
    },
    [theme.breakpoints.down('sm')]: {
      gap: TEXT_TO_CHIPS_GAP_TOUCH,
      '& .MuiOutlinedInput-input': {
        minWidth: '100%',
        height: TEXT_TO_CHIPS_INPUT_HEIGHT_TOUCH,
      },
    },
  }),
  // nothing can be typed into a read-only field, so it drops its text box and reads as a value
  readOnly: (theme: Theme) => ({
    cursor: 'default',
    backgroundColor: getDesignTokens(theme).surfaceSecondary,
    '& .MuiOutlinedInput-input': { display: 'none' },
  }),
  /*
   * a value typed into the field is a tinted pill carrying its own round cross. The deletable
   * selector restates the one the MuiChip override sizes deletable chips with, so these metrics —
   * sized to this field's row rather than to a table cell — win over it.
   */
  chip: (theme: Theme) => ({
    height: TEXT_TO_CHIPS_CHIP_HEIGHT,
    borderRadius: TEXT_TO_CHIPS_CHIP_HEIGHT / 2,
    gap: 4,
    paddingLeft: TEXT_TO_CHIPS_CHIP_PADDING_LEFT,
    paddingRight: TEXT_TO_CHIPS_CHIP_PADDING_LEFT,
    fontSize: INPUT_CHIP_FONT_SIZE,
    fontWeight: theme.typography.fontWeightRegular,
    color: theme.palette.primary.dark,
    backgroundColor: getTintedBackground(theme, theme.palette.primary.main),
    border: 'none',
    '& .MuiChip-label': { padding: 0 },
    '&.MuiChip-deletable:not(.MuiAutocomplete-tag)': {
      height: TEXT_TO_CHIPS_CHIP_HEIGHT,
      borderRadius: TEXT_TO_CHIPS_CHIP_HEIGHT / 2,
      paddingRight: TEXT_TO_CHIPS_CHIP_PADDING_RIGHT,
      '& .MuiChip-label': { padding: 0 },
    },
    '& .MuiChip-deleteIcon': {
      width: TEXT_TO_CHIPS_REMOVE_SIZE,
      height: TEXT_TO_CHIPS_REMOVE_SIZE,
      // the cross is the only way to remove a value with the mouse, so it never fades out
      opacity: 1,
      '&:hover': { backgroundColor: getTintedBackground(theme, theme.palette.primary.main) },
    },
    '&.Mui-disabled': {
      opacity: 1,
      color: getDesignTokens(theme).textDisabled,
      backgroundColor: getDesignTokens(theme).surfaceSecondary,
    },
    [theme.breakpoints.down('md')]: {
      '&, &.MuiChip-deletable:not(.MuiAutocomplete-tag)': {
        height: TEXT_TO_CHIPS_CHIP_HEIGHT_TABLET,
        borderRadius: TEXT_TO_CHIPS_CHIP_HEIGHT_TABLET / 2,
      },
      '& .MuiChip-deleteIcon': {
        width: TEXT_TO_CHIPS_REMOVE_SIZE_TABLET,
        height: TEXT_TO_CHIPS_REMOVE_SIZE_TABLET,
        padding: getRemoveGlyphInset(TEXT_TO_CHIPS_REMOVE_SIZE_TABLET),
      },
    },
    [theme.breakpoints.down('sm')]: {
      fontSize: TEXT_TO_CHIPS_CHIP_FONT_SIZE_TOUCH,
      paddingLeft: TEXT_TO_CHIPS_CHIP_PADDING_LEFT_TOUCH,
      paddingRight: TEXT_TO_CHIPS_CHIP_PADDING_LEFT_TOUCH,
      '&, &.MuiChip-deletable:not(.MuiAutocomplete-tag)': {
        height: TEXT_TO_CHIPS_CHIP_HEIGHT_TOUCH,
        borderRadius: TEXT_TO_CHIPS_CHIP_HEIGHT_TOUCH / 2,
      },
      '&.MuiChip-deletable:not(.MuiAutocomplete-tag)': {
        paddingRight: TEXT_TO_CHIPS_CHIP_PADDING_RIGHT_TOUCH,
      },
      '& .MuiChip-deleteIcon': {
        width: TEXT_TO_CHIPS_REMOVE_SIZE_TOUCH,
        height: TEXT_TO_CHIPS_REMOVE_SIZE_TOUCH,
        padding: getRemoveGlyphInset(TEXT_TO_CHIPS_REMOVE_SIZE_TOUCH),
      },
    },
  }),
  helper: { mt: '5px', ml: 0 },
  warning: (theme: Theme) => ({ color: getSeverityToneColor(theme, 'warning') }),
};

export type TextToChipsInputProps = {
  value?: string[];
  onChange?: (values: string[]) => void;
  onBlur?: () => void;
  name?: string;
  label?: string;
  tooltip?: string;
  required?: boolean;
  // shown under the field while it can be edited — defaults to how chips are added and removed
  helperText?: string;
  // the placeholder of an empty field; once it holds chips it only invites to add another one
  placeholder?: string;
  error?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  readOnly?: boolean;
  // most chips the field accepts — a comma past it is refused and the field says why
  max?: number;
  showCount?: boolean;
};

/**
 * free text where every comma (or Enter) turns what was typed into a chip, Backspace in the empty
 * text box removes the last one. Duplicates (whatever their case) and blank values are ignored.
 */
const TextToChipsInput = ({
  value,
  onChange,
  onBlur,
  name,
  label,
  tooltip,
  required,
  helperText,
  placeholder,
  error,
  errorMessage,
  disabled,
  readOnly,
  max,
  showCount = true,
}: TextToChipsInputProps) => {
  const { t } = useTranslation();
  const isTouchScreen = useBreakpoint('sm');

  // hybrid controlled/uncontrolled: `value` wins when given, the internal list drives it otherwise
  const [internalValues, setInternalValues] = useState<string[]>(value ?? []);
  const [inputValue, setInputValue] = useState('');
  const [isRefused, setIsRefused] = useState(false);

  const values = value ?? internalValues;
  const isInert = !!disabled || !!readOnly;
  const isFull = !!max && values.length >= max;

  const changeValues = (nextValues: string[]) => {
    setInternalValues(nextValues);
    onChange?.(nextValues);
  };

  // adds the candidates that are neither blank nor already there, and keeps `rest` as the typed text
  const addValues = (candidates: string[], rest: string) => {
    const nextValues = [...values];
    let hasRefused = false;

    candidates.map(candidate => candidate.trim()).filter(Boolean).forEach((candidate) => {
      const isDuplicate = nextValues.some(item => item.toLowerCase() === candidate.toLowerCase());

      if (isDuplicate) return;

      if (max && nextValues.length >= max) {
        hasRefused = true;
        return;
      }

      nextValues.push(candidate);
    });

    setInputValue(rest);
    setIsRefused(hasRefused);

    if (nextValues.length !== values.length) {
      changeValues(nextValues);
    }
  };

  // a pasted "a, b, c" lands as chips at once: every segment but the last one is complete
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const segments = event.target.value.split(',');
    const rest = segments.pop() ?? '';

    addValues(segments, rest);
  };

  const commitInput = () => {
    if (!inputValue.trim()) return;

    addValues([inputValue], '');
  };

  const removeValue = (index: number) => {
    setIsRefused(false);
    changeValues(values.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    // Enter would otherwise submit the form the field sits in
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      commitInput();
      return;
    }

    if (event.key === 'Backspace' && !inputValue && values.length) {
      event.preventDefault();
      removeValue(values.length - 1);
    }
  };

  // leaving the field keeps what was typed instead of silently dropping it
  const handleBlur = () => {
    commitInput();
    onBlur?.();
  };

  const defaultHelperText = isTouchScreen
    ? t('common:textToChips.helperTouch')
    : t('common:textToChips.helper');
  const visibleHelperText = !error && !isInert
    ? helperText ?? defaultHelperText
    : '';
  const hasLimitMessage = !error && (isRefused || isFull);

  return (
    <Box sx={{ width: '100%' }}>
      {(label || showCount) && (
        <InputLabel
          label={label}
          required={required}
          tooltip={tooltip}
          end={showCount && (
            <Typography css={[classes.count, isFull && classes.countFull]}>
              {max ? `${values.length} / ${max}` : values.length}
            </Typography>
          )}
        />
      )}
      <OutlinedInput
        fullWidth
        css={[classes.root, readOnly && classes.readOnly]}
        disabled={disabled}
        error={error}
        name={name}
        onBlur={handleBlur}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        readOnly={readOnly}
        value={inputValue}
        placeholder={values.length
          ? t('common:textToChips.add')
          : placeholder}
        startAdornment={values.map((item, index) => (
          <Chip
            css={classes.chip}
            disabled={disabled}
            key={item}
            label={item}
            onDelete={isInert
              ? undefined
              : () => removeValue(index)}
          />
        ))}
      />
      {visibleHelperText && <FormHelperText sx={classes.helper}>{visibleHelperText}</FormHelperText>}
      {error && errorMessage && <FormHelperText error sx={classes.helper}>{errorMessage}</FormHelperText>}
      {hasLimitMessage && (
        <FormHelperText css={classes.warning} sx={classes.helper}>
          {t('common:textToChips.maxReached', { count: max })}
        </FormHelperText>
      )}
    </Box>
  );
};

export default TextToChipsInput;
